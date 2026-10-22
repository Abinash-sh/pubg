import * as THREE from 'three';
import {
  EnemyEntity,
  PickupType,
  Quest,
  RadioMessage,
  RingEntity,
  WorldPickup,
} from '../types/game';
import {
  buildEnemyMesh,
  buildPickupMesh,
  buildStuntRing,
} from './aircraftModels';
import { ParticleManager } from './particles';
import { gameAudio } from './gameAudio';

export interface LaserBolt {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  isEnemy: boolean;
  damage: number;
  isTracer?: boolean;
}

export interface HomingMissile {
  mesh: THREE.Group;
  velocity: THREE.Vector3;
  target: THREE.Object3D | null;
  targetId: string | null;
  speed: number;
  life: number;
  damage: number;
  isHostile?: boolean;
}

export class CombatSystem {
  public scene: THREE.Scene;
  public particles: ParticleManager;

  // Projectiles
  public lasers: LaserBolt[] = [];
  public missiles: HomingMissile[] = [];

  // Active player missile for MISSILE_CAM tracking
  public activePlayerMissile: THREE.Group | null = null;

  // Active enemies & meshes
  public enemies: EnemyEntity[] = [];
  public enemyMeshes: Map<string, THREE.Group> = new Map();

  // Stunt Rings
  public rings: RingEntity[] = [];
  public ringMeshes: Map<string, THREE.Group> = new Map();

  // World Pickups / Tactical Beacons
  public pickups: WorldPickup[] = [];
  public pickupMeshes: Map<string, THREE.Group> = new Map();

  // Quests & Objectives
  public quests: Quest[] = [];

  // Wave state
  public currentWave = 1;
  public isBossActive = false;
  public bossMesh: THREE.Group | null = null;

  // Callbacks
  public onRadioMessage: ((msg: RadioMessage) => void) | null = null;
  public onQuestCompleted: ((quest: Quest) => void) | null = null;
  public onPickupCollected: ((type: PickupType) => void) | null = null;

  // Materials & Geometries
  private playerLaserGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.8, 8);
  private vulcanTracerGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6);
  private playerLaserMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  private vulcanTracerMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  private quadLaserMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  private enemyLaserMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

  // Enemy missile cooldown
  private enemyMissileCooldown = 6.0;

  constructor(scene: THREE.Scene, particles: ParticleManager) {
    this.scene = scene;
    this.particles = particles;
    this.playerLaserGeo.rotateX(Math.PI / 2);
    this.vulcanTracerGeo.rotateX(Math.PI / 2);

    this.initQuests();
    this.spawnRings();
    this.spawnPickups();
    this.spawnWave(1);
  }

  private initQuests() {
    this.quests = [
      {
        id: 'q_kills',
        title: 'Air Superiority Strike',
        description: 'Splash 5 hostile combat aircraft',
        target: 5,
        current: 0,
        rewardCredits: 1200,
        rewardScore: 6000,
        completed: false,
        type: 'kills',
      },
      {
        id: 'q_flares',
        title: 'Defensive Evasion',
        description: 'Deploy 4 flare countermeasures against hostiles',
        target: 4,
        current: 0,
        rewardCredits: 800,
        rewardScore: 4500,
        completed: false,
        type: 'flares_deployed',
      },
      {
        id: 'q_rings',
        title: 'Canyon Low-Level Run',
        description: 'Fly through 4 canyon navigation rings',
        target: 4,
        current: 0,
        rewardCredits: 750,
        rewardScore: 4000,
        completed: false,
        type: 'rings',
      },
      {
        id: 'q_space',
        title: 'Stratospheric Climb',
        description: 'Ascend into the orbital stratosphere (> 2500 ft)',
        target: 1,
        current: 0,
        rewardCredits: 1500,
        rewardScore: 8000,
        completed: false,
        type: 'space_climb',
      },
      {
        id: 'q_pickups',
        title: 'Tactical Cache Recovery',
        description: 'Collect 3 tactical supply beacons',
        target: 3,
        current: 0,
        rewardCredits: 900,
        rewardScore: 5000,
        completed: false,
        type: 'boost_pickups',
      },
      {
        id: 'q_boss',
        title: 'Titan Apex Dreadnought',
        description: 'Neutralize the flagship Titan Dreadnought',
        target: 1,
        current: 0,
        rewardCredits: 4500,
        rewardScore: 25000,
        completed: false,
        type: 'boss',
      },
    ];
  }

  public spawnWave(wave: number) {
    this.currentWave = wave;

    // Clear existing remaining enemies
    this.enemies.forEach((e) => {
      const mesh = this.enemyMeshes.get(e.id);
      if (mesh) this.scene.remove(mesh);
    });
    this.enemies = [];
    this.enemyMeshes.clear();

    const isBossWave = wave % 4 === 0;
    this.isBossActive = isBossWave;

    if (isBossWave) {
      // Spawn Titan Apex Air Dreadnought
      const boss = buildEnemyMesh('boss_apex');
      boss.position.set(0, 320, -1600);
      this.scene.add(boss);
      this.bossMesh = boss;
      this.enemyMeshes.set('boss_titan', boss);

      this.enemies.push({
        id: 'boss_titan',
        type: 'boss_apex',
        name: 'TITAN APEX DREADNOUGHT',
        callsign: 'APEX-01',
        position: { x: 0, y: 320, z: -1600 },
        health: 1200,
        maxHealth: 1200,
        speed: 55,
        isLocked: false,
        distanceToPlayer: 1600,
      });

      this.sendRadio(
        'AWACS SkyEye',
        'OVERLORD',
        '#ef4444',
        'WARNING: Massive radar contact! Titan Apex Dreadnought has entered the theater! All wings engage!',
        'boss'
      );
    } else {
      const numDrones = Math.min(2 + wave, 5);
      const numAces = Math.min(1 + Math.floor(wave / 2), 4);
      const numMechas = wave >= 2 ? Math.min(wave - 1, 3) : 0;
      const numBombers = wave >= 3 ? 1 : 0;

      for (let i = 0; i < numDrones; i++) {
        const x = (Math.random() - 0.5) * 600;
        const y = 80 + Math.random() * 120;
        const z = -450 - Math.random() * 350;
        this.spawnEnemy('drone', x, y, z);
      }

      for (let i = 0; i < numAces; i++) {
        const x = (Math.random() - 0.5) * 700;
        const y = 140 + Math.random() * 160;
        const z = -650 - Math.random() * 400;
        this.spawnEnemy('ace', x, y, z);
      }

      for (let i = 0; i < numMechas; i++) {
        const x = (Math.random() - 0.5) * 500;
        const y = 160 + Math.random() * 140;
        const z = -750 - Math.random() * 400;
        this.spawnEnemy('mecha_striker', x, y, z);
      }

      if (numBombers > 0) {
        this.spawnEnemy('stealth_bomber', 0, 240, -1100);
      }

      if (wave === 1) {
        this.sendRadio(
          'AWACS SkyEye',
          'OVERLORD',
          '#06b6d4',
          'AeroStrike flight lead, radar detects hostile strike wing bearing 340. Weapons free!',
          'awacs'
        );
      } else {
        this.sendRadio(
          'Wingman Falcon',
          'RAPTOR-2',
          '#a855f7',
          `Wave ${wave} hostiles inbound fast! Keep your energy up and watch for missile launches!`,
          'info'
        );
      }
    }
  }

  private spawnEnemy(
    type: 'drone' | 'ace' | 'mecha_striker' | 'stealth_bomber',
    x: number,
    y: number,
    z: number
  ) {
    const id = `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const mesh = buildEnemyMesh(type);
    mesh.position.set(x, y, z);
    mesh.lookAt(x, y, z + 200);
    this.scene.add(mesh);
    this.enemyMeshes.set(id, mesh);

    let name = 'Su-35 Flanker';
    let callsign = 'BANDIT-1';
    let hp = 65;
    let spd = 105;

    if (type === 'ace') {
      name = 'Su-35 Flanker-E Ace';
      callsign = 'VIPER-ACE';
      hp = 110;
      spd = 145;
    } else if (type === 'mecha_striker') {
      name = 'J-20 Mighty Dragon';
      callsign = 'DRAGON-3';
      hp = 140;
      spd = 155;
    } else if (type === 'stealth_bomber') {
      name = 'B-21 Raider Bomber';
      callsign = 'TITAN-B';
      hp = 300;
      spd = 85;
    }

    this.enemies.push({
      id,
      type,
      name,
      callsign,
      position: { x, y, z },
      health: hp,
      maxHealth: hp,
      speed: spd,
      isLocked: false,
      distanceToPlayer: 500,
    });
  }

  private spawnRings() {
    const ringCoords = [
      { x: 0, y: 75, z: -400 },
      { x: 70, y: 95, z: -550 },
      { x: -90, y: 110, z: -700 },
      { x: -140, y: 85, z: -850 },
      { x: 0, y: 140, z: -1050 },
      { x: 150, y: 90, z: -1250 },
      { x: 80, y: 120, z: -1450 },
      { x: -70, y: 130, z: -1650 },
      { x: 0, y: 350, z: -1800 },
      { x: 0, y: 600, z: -2000 },
    ];

    ringCoords.forEach((coord, i) => {
      const id = `ring_${i}`;
      const mesh = buildStuntRing(8.5);
      mesh.position.set(coord.x, coord.y, coord.z);
      this.scene.add(mesh);
      this.ringMeshes.set(id, mesh);

      this.rings.push({
        id,
        position: coord,
        radius: 8.5,
        passed: false,
      });
    });
  }

  private spawnPickups() {
    const pickupDefs: { type: PickupType; pos: { x: number; y: number; z: number } }[] = [
      { type: 'speed_overdrive', pos: { x: 0, y: 75, z: -400 } },
      { type: 'quad_laser', pos: { x: -90, y: 110, z: -700 } },
      { type: 'shield_restore', pos: { x: 150, y: 90, z: -1250 } },
      { type: 'missile_salvo', pos: { x: -70, y: 130, z: -1650 } },
      { type: 'flare_restock', pos: { x: 70, y: 95, z: -550 } },
      { type: 'credit_cache', pos: { x: 0, y: 140, z: -1050 } },
      { type: 'speed_overdrive', pos: { x: 0, y: 400, z: -1800 } },
      { type: 'credit_cache', pos: { x: 0, y: 650, z: -2000 } },
    ];

    pickupDefs.forEach((def, i) => {
      const id = `pickup_${i}`;
      const mesh = buildPickupMesh(def.type);
      mesh.position.set(def.pos.x, def.pos.y, def.pos.z);
      this.scene.add(mesh);
      this.pickupMeshes.set(id, mesh);

      this.pickups.push({
        id,
        type: def.type,
        position: def.pos,
        collected: false,
      });
    });
  }

  public sendRadio(
    sender: string,
    callsign: string,
    avatarColor: string,
    text: string,
    type: RadioMessage['type'] = 'info'
  ) {
    if (this.onRadioMessage) {
      this.onRadioMessage({
        id: `radio_${Date.now()}_${Math.random()}`,
        sender,
        callsign,
        avatarColor,
        text,
        type,
      });
    }
  }

  public progressQuest(
    type: Quest['type'],
    amount = 1,
    onReward?: (credits: number, score: number) => void
  ) {
    for (const q of this.quests) {
      if (q.type === type && !q.completed) {
        q.current = Math.min(q.target, q.current + amount);
        if (q.current >= q.target) {
          q.completed = true;
          if (this.onQuestCompleted) this.onQuestCompleted(q);
          if (onReward) onReward(q.rewardCredits, q.rewardScore);
        }
      }
    }
  }

  public updateLockOn(
    playerMesh: THREE.Group,
    delta: number
  ): { lockedId: string | null; lockProgress: number; isLocked: boolean } {
    const playerPos = playerMesh.position;
    const fwd = new THREE.Vector3();
    playerMesh.getWorldDirection(fwd);

    let bestEnemy: EnemyEntity | null = null;
    let closestAngle = 0.45; // ~26 degree cone

    for (const enemy of this.enemies) {
      const mesh = this.enemyMeshes.get(enemy.id);
      if (!mesh) continue;

      const toEnemy = mesh.position.clone().sub(playerPos);
      const dist = toEnemy.length();
      if (dist > 950 || dist < 20) continue;

      toEnemy.normalize();
      const dot = fwd.dot(toEnemy);
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

      if (angle < closestAngle) {
        closestAngle = angle;
        bestEnemy = enemy;
      }
    }

    if (bestEnemy) {
      this.enemies.forEach((e) => (e.isLocked = e.id === bestEnemy!.id));
      const targetMesh = this.enemyMeshes.get(bestEnemy.id);
      if (targetMesh) {
        const dist = playerPos.distanceTo(targetMesh.position);
        const lockSpeed = dist < 450 ? 2.2 : 1.4;
        bestEnemy.distanceToPlayer = Math.round(dist);
        return {
          lockedId: bestEnemy.id,
          lockProgress: Math.min(1.0, 0.4 + lockSpeed * delta * 2.0),
          isLocked: true,
        };
      }
    }

    this.enemies.forEach((e) => (e.isLocked = false));
    return { lockedId: null, lockProgress: 0, isLocked: false };
  }

  /**
   * Fires M61 Vulcan 20mm rotary Gatling cannon (tracers & ballistic fire)
   */
  public fireVulcanCannon(
    hardpoints: THREE.Vector3[],
    aircraftMesh: THREE.Group,
    baseDamage = 28
  ) {
    const fwd = new THREE.Vector3();
    aircraftMesh.getWorldDirection(fwd);

    hardpoints.forEach((hp) => {
      const boltMesh = new THREE.Mesh(this.vulcanTracerGeo, this.vulcanTracerMat);
      const worldPos = hp.clone().applyMatrix4(aircraftMesh.matrixWorld);

      // Slight ballistic spread
      const dispersion = new THREE.Vector3(
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
        0
      );
      const shotDir = fwd.clone().add(dispersion).normalize();

      boltMesh.position.copy(worldPos);
      boltMesh.quaternion.copy(aircraftMesh.quaternion);

      this.scene.add(boltMesh);
      this.lasers.push({
        mesh: boltMesh,
        velocity: shotDir.multiplyScalar(580),
        life: 1.6,
        isEnemy: false,
        damage: baseDamage,
        isTracer: true,
      });

      gameAudio.playRotaryVulcanCannon();
    });
  }

  /**
   * Fires dual laser / plasma cannons
   */
  public firePlayerLasers(
    hardpoints: THREE.Vector3[],
    aircraftMesh: THREE.Group,
    baseDamage = 28,
    isQuad = false
  ) {
    const fwd = new THREE.Vector3();
    aircraftMesh.getWorldDirection(fwd);

    const mat = isQuad ? this.quadLaserMat : this.playerLaserMat;
    const finalDamage = isQuad ? baseDamage * 1.6 : baseDamage;

    hardpoints.forEach((hp, idx) => {
      const boltMesh = new THREE.Mesh(this.playerLaserGeo, mat);
      const worldPos = hp.clone().applyMatrix4(aircraftMesh.matrixWorld);

      boltMesh.position.copy(worldPos);
      boltMesh.quaternion.copy(aircraftMesh.quaternion);

      this.scene.add(boltMesh);
      this.lasers.push({
        mesh: boltMesh,
        velocity: fwd.clone().multiplyScalar(480),
        life: 1.8,
        isEnemy: false,
        damage: finalDamage,
      });

      gameAudio.playLaserShot(idx % 2 === 0);
    });
  }

  /**
   * Fires heat-seeking / radar-guided homing missile
   */
  public fireMissile(
    hardpoint: THREE.Vector3,
    aircraftMesh: THREE.Group,
    lockedEnemyId: string | null
  ): boolean {
    if (!lockedEnemyId) return false;
    const enemyMesh = this.enemyMeshes.get(lockedEnemyId);
    if (!enemyMesh) return false;

    const fwd = new THREE.Vector3();
    aircraftMesh.getWorldDirection(fwd);

    const missileGroup = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
    );
    body.rotation.x = Math.PI / 2;
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.5, 8),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = 1.1;
    missileGroup.add(body, nose);

    const worldPos = hardpoint.clone().applyMatrix4(aircraftMesh.matrixWorld);
    missileGroup.position.copy(worldPos);
    missileGroup.quaternion.copy(aircraftMesh.quaternion);

    this.scene.add(missileGroup);
    this.activePlayerMissile = missileGroup;

    this.missiles.push({
      mesh: missileGroup,
      velocity: fwd.clone().multiplyScalar(190),
      target: enemyMesh,
      targetId: lockedEnemyId,
      speed: 220,
      life: 6.0,
      damage: 150,
      isHostile: false,
    });

    gameAudio.playMissileLaunch();
    this.sendRadio('Wingman Falcon', 'RAPTOR-2', '#38bdf8', 'FOX TWO! Missile away, tracking bogey!', 'info');
    return true;
  }

  /**
   * Enemy launches heat-seeking missile tracking the player!
   */
  public fireHostileMissileAtPlayer(enemyMesh: THREE.Group, playerMesh: THREE.Group) {
    const mGroup = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
    );
    body.rotation.x = Math.PI / 2;
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.4, 8),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e })
    );
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = 1.1;
    mGroup.add(body, nose);

    mGroup.position.copy(enemyMesh.position);
    mGroup.quaternion.copy(enemyMesh.quaternion);

    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(enemyMesh.quaternion);
    this.scene.add(mGroup);

    this.missiles.push({
      mesh: mGroup,
      velocity: fwd.clone().multiplyScalar(170),
      target: playerMesh,
      targetId: 'player',
      speed: 210,
      life: 5.5,
      damage: 45,
      isHostile: true,
    });

    gameAudio.playMissileLaunch();
    this.sendRadio(
      'AWACS SkyEye',
      'OVERLORD',
      '#ef4444',
      'WARNING! MISSILE LAUNCH DETECTED! Break and deploy flares!',
      'warning'
    );
  }

  /**
   * Updates combat entities, AI, flares, missile guidance, and collisions
   */
  public update(
    delta: number,
    playerMesh: THREE.Group,
    onPlayerHit: (damage: number) => void,
    onEnemyKilled: (enemy: EnemyEntity) => void,
    onRingPassed: () => void,
    onPickupHit: (type: PickupType) => void,
    onAwardCredits: (cr: number) => void,
    onIncomingMissileStatus?: (warning: boolean, dist: number) => void
  ) {
    const playerPos = playerMesh.position;

    // 1. Update Lasers & Tracers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const bolt = this.lasers[i];
      bolt.life -= delta;
      bolt.mesh.position.addScaledVector(bolt.velocity, delta);

      if (bolt.isEnemy) {
        if (bolt.mesh.position.distanceTo(playerPos) < 4.2) {
          onPlayerHit(bolt.damage);
          this.particles.addExplosion(bolt.mesh.position, false);
          gameAudio.playPlayerHit();
          this.scene.remove(bolt.mesh);
          this.lasers.splice(i, 1);
          continue;
        }
      } else {
        let hit = false;
        for (const enemy of this.enemies) {
          const mesh = this.enemyMeshes.get(enemy.id);
          if (!mesh) continue;

          const hitRadius = enemy.type === 'boss_apex' ? 14.0 : 4.5;
          if (bolt.mesh.position.distanceTo(mesh.position) < hitRadius) {
            enemy.health -= bolt.damage;
            this.particles.addExplosion(bolt.mesh.position, false);
            hit = true;

            if (enemy.health <= 0) {
              this.destroyEnemy(enemy.id, onEnemyKilled, onAwardCredits);
            }
            break;
          }
        }
        if (hit) {
          this.scene.remove(bolt.mesh);
          this.lasers.splice(i, 1);
          continue;
        }
      }

      if (bolt.life <= 0) {
        this.scene.remove(bolt.mesh);
        this.lasers.splice(i, 1);
      }
    }

    // 2. Update Homing Missiles (Player missiles and Hostile missiles)
    let closestHostileMissileDist = 9999;
    let hasHostileMissile = false;

    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.life -= delta;
      m.speed += 95 * delta;

      this.particles.addMissileSmoke(m.mesh.position);

      // FLARE DECOY INTERCEPTION CHECK:
      // If missile is hostile and player has active flares nearby, decoy missile!
      if (m.isHostile && this.particles.flares.length > 0) {
        for (const flare of this.particles.flares) {
          const flareDist = m.mesh.position.distanceTo(flare.position);
          if (flareDist < 120) {
            // Missile seduced by hot magnesium flare decoy!
            m.target = flare.mesh;
            break;
          }
        }
      }

      // Homing turn mechanics
      if (m.target && m.target.parent) {
        const toTarget = m.target.position.clone().sub(m.mesh.position).normalize();
        const currentDir = new THREE.Vector3(0, 0, 1).applyQuaternion(m.mesh.quaternion);
        currentDir.lerp(toTarget, 5.8 * delta).normalize();

        const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), currentDir);
        m.mesh.quaternion.slerp(targetQuat, 7.8 * delta);
        m.velocity.copy(currentDir).multiplyScalar(m.speed);
      }

      m.mesh.position.addScaledVector(m.velocity, delta);

      // Track incoming hostile missile distance for cockpit warning
      if (m.isHostile) {
        hasHostileMissile = true;
        const d = m.mesh.position.distanceTo(playerPos);
        if (d < closestHostileMissileDist) closestHostileMissileDist = d;

        // Hostile missile hit player
        if (d < 6.5) {
          onPlayerHit(m.damage);
          this.particles.addExplosion(m.mesh.position, true);
          gameAudio.playExplosion(true);
          this.scene.remove(m.mesh);
          this.missiles.splice(i, 1);
          continue;
        }
      } else {
        // Player missile hit enemy
        if (m.target && m.target.parent) {
          const hitDist = m.mesh.position.distanceTo(m.target.position);
          if (hitDist < 7.5) {
            const enemy = this.enemies.find((e) => e.id === m.targetId);
            if (enemy) {
              enemy.health -= m.damage;
              this.particles.addExplosion(m.mesh.position, true);
              gameAudio.playExplosion(true);

              if (enemy.health <= 0) {
                this.destroyEnemy(enemy.id, onEnemyKilled, onAwardCredits);
              }
            }
            if (this.activePlayerMissile === m.mesh) {
              this.activePlayerMissile = null;
            }
            this.scene.remove(m.mesh);
            this.missiles.splice(i, 1);
            continue;
          }
        }
      }

      if (m.life <= 0) {
        this.particles.addExplosion(m.mesh.position, false);
        if (this.activePlayerMissile === m.mesh) {
          this.activePlayerMissile = null;
        }
        this.scene.remove(m.mesh);
        this.missiles.splice(i, 1);
      }
    }

    if (onIncomingMissileStatus) {
      onIncomingMissileStatus(hasHostileMissile, Math.round(closestHostileMissileDist));
    }
    gameAudio.setMissileInboundAlarm(hasHostileMissile && closestHostileMissileDist < 600);

    // 3. Update Enemy AI & Dogfighting
    this.enemyMissileCooldown -= delta;

    for (const enemy of this.enemies) {
      const mesh = this.enemyMeshes.get(enemy.id);
      if (!mesh) continue;

      enemy.position.x = mesh.position.x;
      enemy.position.y = mesh.position.y;
      enemy.position.z = mesh.position.z;
      enemy.distanceToPlayer = Math.round(mesh.position.distanceTo(playerPos));

      if (enemy.type === 'boss_apex') {
        mesh.position.z += enemy.speed * delta;
        mesh.rotation.y = Math.sin(performance.now() * 0.0005) * 0.12;
        const core = mesh.getObjectByName('boss_core');
        if (core) core.rotation.y += 1.8 * delta;

        // Boss missile attack
        if (this.enemyMissileCooldown <= 0 && enemy.distanceToPlayer < 900) {
          this.fireHostileMissileAtPlayer(mesh, playerMesh);
          this.enemyMissileCooldown = 7.5;
        }

        if (Math.random() < 0.045 && enemy.distanceToPlayer < 800) {
          const bolt = new THREE.Mesh(this.playerLaserGeo, this.enemyLaserMat);
          bolt.position.copy(mesh.position).add(new THREE.Vector3((Math.random() - 0.5) * 14, 1, 6));
          const dir = playerPos.clone().sub(bolt.position).normalize();
          this.scene.add(bolt);
          this.lasers.push({
            mesh: bolt,
            velocity: dir.multiplyScalar(320),
            life: 3.5,
            isEnemy: true,
            damage: 22,
          });
        }
      } else {
        const toPlayer = playerPos.clone().sub(mesh.position);
        const dist = toPlayer.length();

        // Dogfight pursuit vectors
        if (dist > 160) {
          const targetRot = new THREE.Matrix4().lookAt(mesh.position, playerPos, new THREE.Vector3(0, 1, 0));
          const q = new THREE.Quaternion().setFromRotationMatrix(targetRot);
          mesh.quaternion.slerp(q, (enemy.type === 'mecha_striker' ? 3.6 : enemy.type === 'ace' ? 3.2 : 2.0) * delta);
        } else {
          // Break turn evasion
          mesh.rotateZ(1.5 * delta);
          mesh.rotateX(-0.6 * delta);
        }

        const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.quaternion);
        mesh.position.addScaledVector(fwd, enemy.speed * delta);

        // Hostile Ace firing missile at player
        if (
          enemy.type === 'ace' &&
          this.enemyMissileCooldown <= 0 &&
          dist < 650 &&
          Math.random() < 0.08
        ) {
          this.fireHostileMissileAtPlayer(mesh, playerMesh);
          this.enemyMissileCooldown = 9.0;
        }

        // Hostile Cannon Fire
        if (dist < 440 && Math.random() < (enemy.type === 'mecha_striker' ? 0.04 : enemy.type === 'ace' ? 0.03 : 0.015)) {
          const bolt = new THREE.Mesh(this.playerLaserGeo, this.enemyLaserMat);
          bolt.position.copy(mesh.position);
          const dir = playerPos.clone().sub(mesh.position).normalize();
          this.scene.add(bolt);
          this.lasers.push({
            mesh: bolt,
            velocity: dir.multiplyScalar(340),
            life: 2.5,
            isEnemy: true,
            damage: enemy.type === 'mecha_striker' ? 18 : enemy.type === 'ace' ? 14 : 9,
          });
        }
      }
    }

    // 4. Update Stunt Rings
    for (const ring of this.rings) {
      if (ring.passed) continue;
      const mesh = this.ringMeshes.get(ring.id);
      if (!mesh) continue;

      mesh.rotation.z += 0.8 * delta;
      const dist = playerPos.distanceTo(mesh.position);
      if (dist < ring.radius + 1.8) {
        ring.passed = true;
        this.particles.addExplosion(mesh.position, false);
        gameAudio.playRingPass();
        onRingPassed();
        this.progressQuest('rings', 1, onAwardCredits);

        mesh.traverse((c) => {
          if (c instanceof THREE.Mesh) {
            c.material = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.4 });
          }
        });
      }
    }

    // 5. Update Pickups
    for (const p of this.pickups) {
      if (p.collected) continue;
      const mesh = this.pickupMeshes.get(p.id);
      if (!mesh) continue;

      const core = mesh.getObjectByName('pickup_core');
      const ring = mesh.getObjectByName('pickup_ring');
      if (core) core.rotation.y += 2.0 * delta;
      if (ring) ring.rotation.x += 1.5 * delta;

      const dist = playerPos.distanceTo(mesh.position);
      if (dist < 8.5) {
        p.collected = true;
        this.particles.addExplosion(mesh.position, false);
        gameAudio.playRingPass();
        onPickupHit(p.type);
        this.progressQuest('boost_pickups', 1, onAwardCredits);
        this.scene.remove(mesh);
      }
    }
  }

  private destroyEnemy(
    enemyId: string,
    onEnemyKilled: (enemy: EnemyEntity) => void,
    onAwardCredits: (cr: number) => void
  ) {
    const idx = this.enemies.findIndex((e) => e.id === enemyId);
    if (idx === -1) return;

    const enemy = this.enemies[idx];
    const mesh = this.enemyMeshes.get(enemyId);

    if (mesh) {
      this.particles.addExplosion(mesh.position, enemy.type === 'boss_apex');
      gameAudio.playExplosion(enemy.type === 'boss_apex');
      this.scene.remove(mesh);
      this.enemyMeshes.delete(enemyId);
    }

    this.enemies.splice(idx, 1);
    onEnemyKilled(enemy);

    this.progressQuest(enemy.type === 'boss_apex' ? 'boss' : 'kills', 1, onAwardCredits);

    // Callout chatter
    const killChatters = [
      'SPLASH ONE! Target destroyed!',
      'Good kill, lead! Bogey neutralized!',
      'Hostile airframe obliterated, clean hit!',
    ];
    this.sendRadio(
      'AWACS SkyEye',
      'OVERLORD',
      '#10b981',
      killChatters[Math.floor(Math.random() * killChatters.length)],
      'cheer'
    );

    // Check if wave cleared
    if (this.enemies.length === 0) {
      this.spawnWave(this.currentWave + 1);
    }
  }

  public clear() {
    this.lasers.forEach((l) => this.scene.remove(l.mesh));
    this.lasers = [];

    this.missiles.forEach((m) => this.scene.remove(m.mesh));
    this.missiles = [];
    this.activePlayerMissile = null;

    this.enemyMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.enemyMeshes.clear();
    this.enemies = [];

    this.ringMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.ringMeshes.clear();
    this.rings = [];

    this.pickupMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.pickupMeshes.clear();
    this.pickups = [];
  }
}

