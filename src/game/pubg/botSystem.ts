import * as THREE from 'three';
import { BotCombatant, GroundLoot, KillFeedEntry, WeaponItem } from '../../types/pubg';
import { CharacterMeshController, createCharacterModel } from './characterModel';
import { WEAPON_REGISTRY } from './weaponModels';
import { BallisticsSystem } from './ballisticsSystem';
import { BlueZoneManager } from './blueZone';

const BOT_NAMES = [
  'Ghost_77',
  'SniperWolf',
  'Viper_Ace',
  'ShadowNinja',
  'Alex_99',
  'Delta_Force',
  'Grim_Reaper',
  'Apex_Hunter',
  'Falcon_Eye',
  'Striker_Zero',
  'Raven_K',
  'Cobra_Ops',
  'Titan_X',
  'Echo_Four',
  'Nomad_9',
  'Phantom_Fox',
  'BulletStorm',
  'Blaze_Runner',
  'Raptor_99',
  'Cyber_Hawk',
  'Night_Stalker',
  'Iron_Claw',
  'Silent_Kill',
  'Frost_Bite',
  'Havoc_11',
];

export class BotSystem {
  public scene: THREE.Scene;
  public bots: BotCombatant[] = [];
  public botControllers: Map<string, CharacterMeshController> = new Map();
  public botGroup = new THREE.Group();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.botGroup);
  }

  /**
   * Spawns bots parachute-dropping across the island
   */
  public spawnInitialBots(
    count = 24,
    getTerrainHeight: (x: number, z: number) => number
  ) {
    const weaponPool = ['M416', 'AKM', 'S12K', 'AWM', 'P92'];

    for (let i = 0; i < count; i++) {
      const name = BOT_NAMES[i % BOT_NAMES.length] + (i >= BOT_NAMES.length ? `_${i}` : '');
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 420;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const terrainY = getTerrainHeight(x, z);

      // Start high in the air gliding down!
      const startY = terrainY + 80 + Math.random() * 60;
      const position = new THREE.Vector3(x, startY, z);

      const controller = createCharacterModel(true);
      controller.root.position.copy(position);
      this.botGroup.add(controller.root);

      const chosenW = weaponPool[Math.floor(Math.random() * weaponPool.length)];
      const stats = WEAPON_REGISTRY[chosenW as keyof typeof WEAPON_REGISTRY];
      const weapon: WeaponItem = {
        id: `bot_w_${i}`,
        type: stats.id,
        stats,
        currentAmmo: stats.magSize,
        reserveAmmo: stats.magSize * 3,
        fireMode: stats.availableModes[0],
      };

      controller.setEquippedWeapon(weapon.type);
      const vestLvl = Math.random() > 0.6 ? 2 : 1;
      const helmLvl = Math.random() > 0.5 ? 2 : 1;
      controller.setVestLevel(vestLvl);
      controller.setHelmetLevel(helmLvl);

      const bot: BotCombatant = {
        id: `bot_${i}`,
        name,
        position,
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
        health: 100,
        maxHealth: 100,
        armorVest: { level: vestLvl as 1 | 2, durability: 200, maxDurability: 200, damageReduction: 0.35 },
        helmet: { level: helmLvl as 1 | 2, durability: 150, maxDurability: 150, damageReduction: 0.35 },
        weapon,
        state: 'LANDING',
        targetPos: new THREE.Vector3(x + (Math.random() - 0.5) * 50, terrainY, z + (Math.random() - 0.5) * 50),
        shootCooldown: 1.0 + Math.random() * 1.5,
        accuracy: 0.45 + Math.random() * 0.35,
        mesh: controller.root,
        isAlive: true,
        kills: 0,
      };

      this.bots.push(bot);
      this.botControllers.set(bot.id, controller);
    }
  }

  /**
   * Updates bot AI, movement, combat decisions, and animations
   */
  public update(
    deltaTime: number,
    playerPos: THREE.Vector3,
    playerHealth: number,
    getTerrainHeight: (x: number, z: number) => number,
    blueZone: BlueZoneManager,
    ballistics: BallisticsSystem,
    onKillFeed: (entry: KillFeedEntry) => void,
    onSpawnLoot: (loot: GroundLoot) => void
  ) {
    const aliveBots = this.bots.filter((b) => b.isAlive);

    aliveBots.forEach((bot) => {
      const controller = this.botControllers.get(bot.id);
      if (!controller) return;

      const groundY = getTerrainHeight(bot.position.x, bot.position.z);

      // 1. Landing state
      if (bot.state === 'LANDING') {
        bot.position.y -= deltaTime * 14; // Gliding down
        controller.root.position.copy(bot.position);
        controller.updateAnimation(deltaTime, 0, false, false, false, true, 0);

        if (bot.position.y <= groundY + 0.1) {
          bot.position.y = groundY;
          bot.state = 'PATROL';
          controller.parachuteGroup.visible = false;
        }
        return;
      }

      // Keep bot on terrain
      bot.position.y = groundY;
      controller.root.position.copy(bot.position);

      // Check distance to player
      const distToPlayer = bot.position.distanceTo(playerPos);
      const isPlayerAlive = playerHealth > 0;

      // Check Blue Zone urgency
      const isInsideZone = blueZone.isInsideCurrentZone(bot.position.x, bot.position.z);
      if (!isInsideZone && bot.state !== 'ATTACKING') {
        bot.state = 'MOVING_TO_ZONE';
        bot.targetPos.set(
          blueZone.state.nextCenter.x + (Math.random() - 0.5) * 40,
          0,
          blueZone.state.nextCenter.y + (Math.random() - 0.5) * 40
        );
      }

      // Zone damage tick on bot
      if (!isInsideZone) {
        bot.health -= blueZone.state.damagePerSec * deltaTime;
        if (bot.health <= 0) {
          this.eliminateBot(bot, 'The Blue Zone', 'Zone', false, false, onKillFeed, onSpawnLoot);
          return;
        }
      }

      // Combat engagement logic
      let currentTarget: { pos: THREE.Vector3; id: string; isPlayer: boolean } | null = null;

      if (distToPlayer < 75 && isPlayerAlive) {
        currentTarget = { pos: playerPos, id: 'player', isPlayer: true };
      } else {
        // Look for other nearby alive bots
        const nearbyBot = aliveBots.find(
          (other) => other.id !== bot.id && bot.position.distanceTo(other.position) < 60
        );
        if (nearbyBot) {
          currentTarget = { pos: nearbyBot.position, id: nearbyBot.id, isPlayer: false };
        }
      }

      if (currentTarget) {
        bot.state = 'ATTACKING';
        // Face target
        const aimDir = currentTarget.pos.clone().sub(bot.position);
        aimDir.y = 0;
        const targetAngle = Math.atan2(aimDir.x, aimDir.z);
        controller.root.rotation.y = targetAngle;

        // Firing logic
        bot.shootCooldown -= deltaTime;
        if (bot.shootCooldown <= 0) {
          bot.shootCooldown = 1.0 / (bot.weapon.stats.fireRate * 0.5); // Burst interval

          // Calculate shooting vector with accuracy spread
          const shootOrigin = bot.position.clone().add(new THREE.Vector3(0, 1.4, 0));
          const shootDir = currentTarget.pos
            .clone()
            .add(new THREE.Vector3(0, 1.2, 0))
            .sub(shootOrigin)
            .normalize();

          // Spread
          const spread = (1 - bot.accuracy) * 0.12;
          shootDir.x += (Math.random() - 0.5) * spread;
          shootDir.y += (Math.random() - 0.5) * spread;
          shootDir.z += (Math.random() - 0.5) * spread;
          shootDir.normalize();

          ballistics.fireBullet(shootOrigin, shootDir, bot.weapon, false, bot.id);
        }

        controller.updateAnimation(deltaTime, 0, false, false, true, false, 0);
      } else {
        // Patrol or Move to zone
        const dir = bot.targetPos.clone().sub(bot.position);
        dir.y = 0;
        const dist = dir.length();

        if (dist > 3) {
          dir.normalize();
          const speed = bot.state === 'MOVING_TO_ZONE' ? 5.5 : 3.2;
          bot.position.add(dir.multiplyScalar(speed * deltaTime));
          controller.root.rotation.y = Math.atan2(dir.x, dir.z);
          controller.updateAnimation(
            deltaTime,
            speed,
            bot.state === 'MOVING_TO_ZONE',
            false,
            false,
            false,
            0
          );
        } else {
          // Reached waypoint -> pick new waypoint
          const wanderAngle = Math.random() * Math.PI * 2;
          const wanderDist = 30 + Math.random() * 60;
          bot.targetPos.set(
            bot.position.x + Math.cos(wanderAngle) * wanderDist,
            0,
            bot.position.z + Math.sin(wanderAngle) * wanderDist
          );
          controller.updateAnimation(deltaTime, 0, false, false, false, false, 0);
        }
      }
    });
  }

  /**
   * Eliminates a bot, triggers killfeed and drops loot
   */
  public eliminateBot(
    bot: BotCombatant,
    killerName: string,
    weaponName: string,
    isHeadshot: boolean,
    isPlayerKill: boolean,
    onKillFeed: (entry: KillFeedEntry) => void,
    onSpawnLoot: (loot: GroundLoot) => void
  ) {
    if (!bot.isAlive) return;
    bot.isAlive = false;
    bot.health = 0;

    // Remove or tip over mesh
    const controller = this.botControllers.get(bot.id);
    if (controller) {
      controller.root.rotation.x = Math.PI / 2; // Lie on ground
      controller.root.position.y -= 0.6;
    }

    // Broadcast Kill Feed
    onKillFeed({
      id: `kill_${Date.now()}_${Math.random()}`,
      killer: killerName,
      victim: bot.name,
      weapon: weaponName,
      isHeadshot,
      isPlayerKill,
      timestamp: Date.now(),
    });

    // Drop Death Crate loot
    onSpawnLoot({
      id: `death_crate_${bot.id}_w`,
      type: 'weapon',
      subType: bot.weapon.type,
      name: bot.weapon.type,
      amount: 1,
      position: bot.position.clone().add(new THREE.Vector3(0.5, 0.4, 0)),
    });
    onSpawnLoot({
      id: `death_crate_${bot.id}_ammo`,
      type: 'ammo',
      subType: bot.weapon.stats.ammoType,
      name: `${bot.weapon.stats.ammoType} Ammo Box`,
      amount: 60,
      position: bot.position.clone().add(new THREE.Vector3(-0.5, 0.4, 0)),
    });
    onSpawnLoot({
      id: `death_crate_${bot.id}_med`,
      type: 'meds',
      subType: 'energyDrink',
      name: 'Energy Drink',
      amount: 2,
      position: bot.position.clone().add(new THREE.Vector3(0, 0.4, 0.5)),
    });
  }
}
