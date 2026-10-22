import * as THREE from 'three';
import {
  AmmoType,
  DrivableVehicle,
  GroundLoot,
  KillFeedEntry,
  PlayerPUBGState,
  PUBGWeather,
  ShopItem,
  WeaponItem,
  WeaponSlot,
  WeaponType,
} from '../../types/pubg';
import { PubgMap } from './pubgMap';
import { BlueZoneManager } from './blueZone';
import { BallisticsSystem, BulletProjectile } from './ballisticsSystem';
import { BotSystem } from './botSystem';
import { AirDropSystem } from './airDropSystem';
import { VehicleSystem } from './vehicleSystem';
import { CharacterMeshController, createCharacterModel } from './characterModel';
import { WEAPON_REGISTRY } from './weaponModels';
import { pubgAudio } from './pubgAudio';

export class PubgEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Subsystems
  public map: PubgMap;
  public blueZone: BlueZoneManager;
  public ballistics: BallisticsSystem;
  public bots: BotSystem;
  public airdrops: AirDropSystem;
  public vehicles: VehicleSystem;

  // Player Character
  public playerController: CharacterMeshController;
  public playerPosition = new THREE.Vector3(0, 140, 0); // Drop in from sky
  public playerVelocity = new THREE.Vector3();
  public yaw = 0;
  public pitch = 0;
  public isFirstPerson = false;
  public isPointerLocked = false;

  // Active Vehicle
  public activeVehicleId: string | null = null;

  // Input tracking
  private keys: Record<string, boolean> = {};
  public touchMoveX = 0;
  public touchMoveY = 0;
  public isFiring = false;
  public isAimingADS = false;

  // Gun recoil recovery
  private currentRecoilPitch = 0;
  private currentRecoilYaw = 0;

  // Player Game State
  public state: PlayerPUBGState;

  // Callbacks to React
  public onStateUpdate: ((state: PlayerPUBGState) => void) | null = null;
  public onKillFeed: ((entry: KillFeedEntry) => void) | null = null;
  public onGameOver: ((victory: boolean, stats: { kills: number; damage: number; rank: number }) => void) | null = null;
  public onOpenShopUI: (() => void) | null = null;

  constructor(container: HTMLElement, weather: PUBGWeather = 'clear_day') {
    this.container = container;

    // 1. Scene & Lighting
    this.scene = new THREE.Scene();
    this.setupLighting(weather);

    // 2. Camera
    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 4000);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    container.appendChild(this.renderer.domElement);

    // 4. Initialize Subsystems
    this.map = new PubgMap(this.scene);
    this.blueZone = new BlueZoneManager(this.scene);
    this.ballistics = new BallisticsSystem(this.scene);
    this.bots = new BotSystem(this.scene);
    this.airdrops = new AirDropSystem(this.scene);
    this.vehicles = new VehicleSystem(this.scene);

    // 5. Initialize Player
    this.playerController = createCharacterModel(false);
    this.scene.add(this.playerController.root);

    // Starting M416 weapon
    const m4Stats = WEAPON_REGISTRY.M416;
    const initialM4: WeaponItem = {
      id: 'p_m416',
      type: 'M416',
      stats: m4Stats,
      currentAmmo: 30,
      reserveAmmo: 120,
      fireMode: 'AUTO',
    };

    this.state = {
      health: 100,
      maxHealth: 100,
      boost: 0,
      battlePoints: 400, // Starting BP
      helmet: { level: 2, durability: 150, maxDurability: 150, damageReduction: 0.4 },
      vest: { level: 2, durability: 220, maxDurability: 220, damageReduction: 0.4 },
      backpackLevel: 2,
      ammo: {
        '5.56mm': 120,
        '7.62mm': 60,
        '300Mag': 0,
        '12Gauge': 15,
        '9mm': 60,
        '45ACP': 50,
        '50AE': 14,
      },
      meds: {
        firstAid: 2,
        medkit: 1,
        bandages: 5,
        energyDrink: 3,
        painkiller: 1,
        adrenaline: 1,
      },
      throwables: { frag: 2, smoke: 1 },
      weapons: {
        primary: initialM4,
        secondary: null,
        pistol: null,
        throwable: null,
        melee: null,
      },
      activeSlot: 'primary',
      isAiming: false,
      isReloading: false,
      reloadProgress: 0,
      isSprinting: false,
      isCrouching: false,
      isProne: false,
      isParachuting: true, // Start parachuting from transport plane!
      isInVehicle: false,
      vehicleSpeed: 0,
      kills: 0,
      damageDealt: 0,
      headshots: 0,
      aliveCount: 25,
      totalPlayers: 25,
      position: this.playerPosition,
      yaw: 0,
      pitch: 0,
      currentZone: this.blueZone.state,
      distToSafeZone: 0,
      isInSafeZone: true,
      isTakingZoneDamage: false,
      hitMarker: null,
      nearbyLoot: null,
      nearbyVehicle: null,
      nearbyAirdrop: null,
      isGameOver: false,
      isVictory: false,
    };

    this.playerController.setEquippedWeapon('M416');
    this.playerController.setHelmetLevel(2);
    this.playerController.setVestLevel(2);

    // Spawn AI bots & vehicles
    this.bots.spawnInitialBots(24, (x, z) => this.map.getTerrainHeight(x, z));
    this.vehicles.spawnVehicles((x, z) => this.map.getTerrainHeight(x, z));

    // Bind Event Listeners
    this.setupInputListeners();
    window.addEventListener('resize', this.onResize);

    // Start loop
    this.clock.start();
    this.startLoop();
  }

  private setupLighting(weather: PUBGWeather) {
    let skyColor = 0x87ceeb;
    let fogDensity = 0.0006;
    let sunIntensity = 2.2;

    if (weather === 'sunset') {
      skyColor = 0xf97316;
      fogDensity = 0.0008;
      sunIntensity = 1.8;
    } else if (weather === 'dense_fog') {
      skyColor = 0x94a3b8;
      fogDensity = 0.0028;
      sunIntensity = 1.2;
    }

    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.FogExp2(skyColor, fogDensity);

    // Sun directional light
    const sun = new THREE.DirectionalLight(0xfffaed, sunIntensity);
    sun.position.set(300, 600, 200);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 1200;
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 150;
    sun.shadow.camera.bottom = -150;
    this.scene.add(sun);

    // Hemisphere ambient light
    const hemi = new THREE.HemisphereLight(skyColor, 0x3d4b26, 1.1);
    this.scene.add(hemi);
  }

  private setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Toggle First-Person / Third-Person view
      if (e.code === 'KeyV') {
        this.isFirstPerson = !this.isFirstPerson;
      }
      // Reload
      if (e.code === 'KeyR') {
        this.startReload();
      }
      // Interact / Loot / Vehicle
      if (e.code === 'KeyF') {
        this.handleInteract();
      }
      // Weapon switching
      if (e.code === 'Digit1') this.switchWeaponSlot('primary');
      if (e.code === 'Digit2') this.switchWeaponSlot('secondary');
      if (e.code === 'Digit3') this.switchWeaponSlot('pistol');
      if (e.code === 'Digit4') this.switchWeaponSlot('throwable');
      if (e.code === 'Digit5') this.switchWeaponSlot('melee');

      // Use consumables
      if (e.code === 'Digit7') this.useMed('firstAid');
      if (e.code === 'Digit8') this.useMed('medkit');
      if (e.code === 'Digit9') this.useMed('energyDrink');

      // Grenade throw
      if (e.code === 'KeyG') {
        this.throwEquippedGrenade();
      }

      // Open Black Market Buy Station
      if (e.code === 'KeyB') {
        if (this.onOpenShopUI) this.onOpenShopUI();
      }

      // Fire mode toggle
      if (e.code === 'KeyX') {
        const active = this.getActiveWeapon();
        if (active && active.stats.availableModes.length > 1) {
          active.fireMode = active.fireMode === 'AUTO' ? 'SINGLE' : 'AUTO';
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Pointer Lock for mouse aiming
    this.container.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        this.container.requestPointerLock?.();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.container;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked) return;
      const sens = 0.0022;
      this.yaw -= e.movementX * sens;
      this.pitch -= e.movementY * sens;
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isFiring = true;
      }
      if (e.button === 2) {
        // Right click ADS
        this.isAimingADS = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isFiring = false;
      }
      if (e.button === 2) {
        this.isAimingADS = false;
      }
    });

    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Main game tick loop
   */
  private startLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      const delta = Math.min(this.clock.getDelta(), 0.1);
      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private shootTimer = 0;

  private update(delta: number) {
    if (this.state.isGameOver) return;

    // 1. Vehicle Driving or Foot Movement
    if (this.state.isInVehicle && this.activeVehicleId) {
      this.vehicles.update(
        delta,
        this.activeVehicleId,
        {
          forward: !!this.keys['KeyW'],
          backward: !!this.keys['KeyS'],
          left: !!this.keys['KeyA'],
          right: !!this.keys['KeyD'],
          boost: !!this.keys['ShiftLeft'] || !!this.keys['ShiftRight'],
        },
        (x, z) => this.map.getTerrainHeight(x, z),
        (vPos, speed) => {
          // Roadkill bots
          this.bots.bots.forEach((bot) => {
            if (bot.isAlive && bot.position.distanceTo(vPos) < 3.2) {
              this.bots.eliminateBot(
                bot,
                'Player',
                'Buggy Roadkill',
                false,
                true,
                this.broadcastKillFeed,
                (loot) => this.map.addGroundLoot(loot)
              );
              this.state.kills += 1;
              pubgAudio.playHitMarker(true);
            }
          });
        }
      );

      const activeV = this.vehicles.vehicles.find((v) => v.id === this.activeVehicleId);
      if (activeV) {
        this.playerPosition.copy(activeV.position);
        this.state.vehicleSpeed = Math.round(activeV.speed);
      }
    } else {
      this.updatePlayerMovement(delta);
    }

    // 2. Gun Recoil decay back to zero
    this.currentRecoilPitch *= 0.88;
    this.currentRecoilYaw *= 0.88;

    // 3. Firing weapon logic
    const activeWeapon = this.getActiveWeapon();
    this.shootTimer -= delta;

    if (this.isFiring && activeWeapon && !this.state.isReloading && !this.state.isInVehicle && !this.state.isParachuting) {
      if (this.shootTimer <= 0) {
        if (activeWeapon.currentAmmo > 0) {
          this.fireEquippedWeapon(activeWeapon);
          this.shootTimer = 1.0 / activeWeapon.stats.fireRate;

          if (activeWeapon.fireMode === 'SINGLE') {
            this.isFiring = false; // Require tap
          }
        } else {
          // Out of ammo -> auto reload
          this.startReload();
        }
      }
    }

    // 4. Reload progress update
    if (this.state.isReloading && activeWeapon) {
      this.state.reloadProgress += delta / activeWeapon.stats.reloadTime;
      if (this.state.reloadProgress >= 1.0) {
        const needed = activeWeapon.stats.magSize - activeWeapon.currentAmmo;
        const available = this.state.ammo[activeWeapon.stats.ammoType];
        const loaded = Math.min(needed, available);

        activeWeapon.currentAmmo += loaded;
        this.state.ammo[activeWeapon.stats.ammoType] -= loaded;
        this.state.isReloading = false;
        this.state.reloadProgress = 0;
      }
    }

    // 5. Update Blue Zone
    const zoneRes = this.blueZone.update(delta);
    const isPlayerInZone = this.blueZone.isInsideCurrentZone(this.playerPosition.x, this.playerPosition.z);
    this.state.isInSafeZone = isPlayerInZone;
    this.state.distToSafeZone = Math.round(
      this.blueZone.getDistToSafeZone(this.playerPosition.x, this.playerPosition.z)
    );

    if (!isPlayerInZone) {
      this.state.isTakingZoneDamage = true;
      this.damagePlayer(this.blueZone.state.damagePerSec * delta, 'The Blue Zone');
    } else {
      this.state.isTakingZoneDamage = false;
    }

    // 6. Boost regeneration & natural decay
    if (this.state.boost > 0) {
      this.state.boost = Math.max(0, this.state.boost - delta * 1.5);
      if (this.state.health < 100) {
        this.state.health = Math.min(100, this.state.health + delta * 2.0);
      }
    }

    // 7. Update Ballistics & Projectiles
    this.ballistics.update(
      delta,
      (x, z) => this.map.getTerrainHeight(x, z),
      (bullet, hitPos) => this.checkBulletCollisions(bullet, hitPos),
      (explodePos, isPlayer) => this.handleGrenadeExplosion(explodePos, isPlayer)
    );

    // 8. Update Bots AI & Combat
    this.bots.update(
      delta,
      this.playerPosition,
      this.state.health,
      (x, z) => this.map.getTerrainHeight(x, z),
      this.blueZone,
      this.ballistics,
      this.broadcastKillFeed,
      (loot) => this.map.addGroundLoot(loot)
    );

    // Update Alive Count
    const aliveBotsCount = this.bots.bots.filter((b) => b.isAlive).length;
    this.state.aliveCount = aliveBotsCount + (this.state.health > 0 ? 1 : 0);

    // Check Victory (Last one standing!)
    if (this.state.aliveCount === 1 && this.state.health > 0 && !this.state.isVictory) {
      this.state.isVictory = true;
      pubgAudio.playVictoryFanfare();
      if (this.onGameOver) {
        this.onGameOver(true, {
          kills: this.state.kills,
          damage: Math.round(this.state.damageDealt),
          rank: 1,
        });
      }
    }

    // 9. Update Airdrops & Map Loot
    this.airdrops.update(
      delta,
      (x, z) => this.map.getTerrainHeight(x, z),
      this.blueZone.state.currentCenter,
      this.blueZone.state.currentRadius,
      (loot) => this.map.addGroundLoot(loot)
    );
    this.map.update(delta);

    // 10. Check Nearby Loot & Vehicle Proximity Prompts
    this.checkNearbyInteractions();

    // 11. Update Camera Position & Sights
    this.updateCamera();

    // Dispatch telemetry state to React
    this.state.position.copy(this.playerPosition);
    this.state.yaw = this.yaw;
    this.state.pitch = this.pitch;
    this.state.currentZone = this.blueZone.state;
    this.state.isAiming = this.isAimingADS;

    if (this.onStateUpdate) {
      this.onStateUpdate({ ...this.state });
    }
  }

  /**
   * Walking / Running / Jumping / Parachuting Player Movement
   */
  private updatePlayerMovement(delta: number) {
    const groundY = this.map.getTerrainHeight(this.playerPosition.x, this.playerPosition.z);

    // Parachute deployment phase
    if (this.state.isParachuting) {
      this.playerPosition.y -= delta * 15; // Gliding downwards

      // Steer parachute with WASD
      let steerX = 0;
      let steerZ = 0;
      if (this.keys['KeyW']) steerZ -= 1;
      if (this.keys['KeyS']) steerZ += 1;
      if (this.keys['KeyA']) steerX -= 1;
      if (this.keys['KeyD']) steerX += 1;

      const steerDir = new THREE.Vector3(steerX, 0, steerZ).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.yaw
      );
      this.playerPosition.add(steerDir.multiplyScalar(delta * 22));

      this.playerController.root.position.copy(this.playerPosition);
      this.playerController.root.rotation.y = this.yaw;
      this.playerController.updateAnimation(delta, 0, false, false, false, true, 0);

      // Reached ground -> land & deploy weapon!
      if (this.playerPosition.y <= groundY + 0.1) {
        this.playerPosition.y = groundY;
        this.state.isParachuting = false;
        this.playerController.parachuteGroup.visible = false;
        pubgAudio.playFootstep(true);
      }
      return;
    }

    // On-foot movement
    let moveForward = 0;
    let moveRight = 0;

    if (this.keys['KeyW']) moveForward += 1;
    if (this.keys['KeyS']) moveForward -= 1;
    if (this.keys['KeyA']) moveRight -= 1;
    if (this.keys['KeyD']) moveRight += 1;

    // Touch joystick support
    if (Math.abs(this.touchMoveX) > 0.1 || Math.abs(this.touchMoveY) > 0.1) {
      moveRight = this.touchMoveX;
      moveForward = -this.touchMoveY;
    }

    const isSprinting = (!!this.keys['ShiftLeft'] || !!this.keys['ShiftRight']) && moveForward > 0;
    const isCrouching = !!this.keys['KeyC'] || !!this.keys['ControlLeft'];
    this.state.isSprinting = isSprinting;
    this.state.isCrouching = isCrouching;

    let baseSpeed = 4.8; // m/s
    if (isSprinting) baseSpeed = 7.6;
    if (isCrouching) baseSpeed = 2.8;
    if (this.isAimingADS) baseSpeed = 2.4;
    if (this.state.boost > 60) baseSpeed *= 1.15; // Energy drink speed boost!

    const moveVector = new THREE.Vector3(moveRight, 0, -moveForward);
    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      moveVector.multiplyScalar(baseSpeed * delta);
      this.playerPosition.add(moveVector);

      // Footstep sound cadence
      if (Math.random() < (isSprinting ? 0.12 : 0.07)) {
        pubgAudio.playFootstep(isSprinting);
      }
    }

    // Jump physics
    const gravity = -24;
    if (this.keys['Space'] && this.playerPosition.y <= groundY + 0.1) {
      this.playerVelocity.y = 8.2;
    }

    this.playerVelocity.y += gravity * delta;
    this.playerPosition.y += this.playerVelocity.y * delta;

    if (this.playerPosition.y <= groundY) {
      this.playerPosition.y = groundY;
      this.playerVelocity.y = 0;
    }

    // Update Player 3D Mesh
    this.playerController.root.position.copy(this.playerPosition);
    this.playerController.root.rotation.y = this.yaw;
    this.playerController.updateAnimation(
      delta,
      moveVector.lengthSq() > 0 ? baseSpeed : 0,
      isSprinting,
      isCrouching,
      this.isAimingADS,
      false,
      this.pitch + this.currentRecoilPitch
    );
  }

  /**
   * Fires the currently equipped weapon
   */
  private fireEquippedWeapon(weapon: WeaponItem) {
    weapon.currentAmmo -= 1;

    // Apply recoil kick
    this.currentRecoilPitch += weapon.stats.recoilVertical;
    this.currentRecoilYaw += (Math.random() - 0.5) * weapon.stats.recoilHorizontal;

    // Calculate bullet shoot origin (near character gun muzzle or camera center in ADS)
    const aimDir = new THREE.Vector3();
    this.camera.getWorldDirection(aimDir);

    const shootOrigin = this.isFirstPerson
      ? this.camera.position.clone().add(aimDir.clone().multiplyScalar(0.4))
      : this.playerPosition.clone().add(new THREE.Vector3(0, 1.4, 0));

    this.ballistics.fireBullet(shootOrigin, aimDir, weapon, true, 'player');
  }

  /**
   * Checks bullet collisions against bots and player
   */
  private checkBulletCollisions(bullet: BulletProjectile, hitPos: THREE.Vector3): boolean {
    if (bullet.isPlayerBullet) {
      // Check against AI Bots
      for (const bot of this.bots.bots) {
        if (!bot.isAlive) continue;

        const dist = bot.position.distanceTo(hitPos);
        if (dist < 1.3) {
          // Hit detected!
          const isHeadshot = hitPos.y >= bot.position.y + 1.45;
          const damageMult = isHeadshot ? 2.5 : 1.0;
          const armorMitigation = bot.armorVest ? bot.armorVest.damageReduction : 0;
          const finalDamage = Math.round(bullet.damage * damageMult * (1 - armorMitigation));

          bot.health -= finalDamage;
          this.state.damageDealt += finalDamage;
          this.state.battlePoints += Math.round(finalDamage * 0.5); // Earn BP from damage

          // Trigger hit marker
          this.state.hitMarker = {
            type: isHeadshot ? 'headshot' : 'body',
            time: Date.now(),
          };
          pubgAudio.playHitMarker(isHeadshot);
          this.ballistics.spawnHitImpact(hitPos, true);

          if (bot.health <= 0) {
            this.state.kills += 1;
            this.state.battlePoints += isHeadshot ? 250 : 150; // Bonus BP on kill/headshot
            if (isHeadshot) this.state.headshots += 1;
            this.bots.eliminateBot(
              bot,
              'Player',
              bullet.weaponName,
              isHeadshot,
              true,
              this.broadcastKillFeed,
              (loot) => this.map.addGroundLoot(loot)
            );
          }
          return true;
        }
      }
    } else {
      // Enemy bot bullet checking against Player
      const dist = this.playerPosition.distanceTo(hitPos);
      if (dist < 1.2 && this.state.health > 0) {
        const isHeadshot = hitPos.y >= this.playerPosition.y + 1.45;
        const damageMult = isHeadshot ? 2.2 : 1.0;
        const mitigation = this.state.vest ? this.state.vest.damageReduction : 0;
        const dmg = Math.round(bullet.damage * damageMult * (1 - mitigation));

        this.damagePlayer(dmg, bullet.shooterId);
        this.ballistics.spawnHitImpact(hitPos, true);
        return true;
      }
    }

    return false;
  }

  /**
   * Damage player and trigger damage effects
   */
  public damagePlayer(amount: number, source: string) {
    if (this.state.health <= 0) return;

    this.state.health -= amount;
    pubgAudio.playFootstep(false); // Pain thud

    if (this.state.health <= 0) {
      this.state.health = 0;
      this.state.isGameOver = true;

      // Broadcast killfeed entry
      this.broadcastKillFeed({
        id: `kill_player_${Date.now()}`,
        killer: source,
        victim: 'Player',
        weapon: 'M416',
        isHeadshot: false,
        isPlayerKill: false,
        timestamp: Date.now(),
      });

      if (this.onGameOver) {
        this.onGameOver(false, {
          kills: this.state.kills,
          damage: Math.round(this.state.damageDealt),
          rank: this.state.aliveCount,
        });
      }
    }
  }

  /**
   * Grenade radial explosion
   */
  private handleGrenadeExplosion(pos: THREE.Vector3, isPlayer: boolean) {
    // Check bots in radius
    this.bots.bots.forEach((bot) => {
      if (!bot.isAlive) return;
      const dist = bot.position.distanceTo(pos);
      if (dist < 12) {
        const dmg = Math.max(0, 110 * (1 - dist / 12));
        bot.health -= dmg;
        if (isPlayer) this.state.damageDealt += dmg;

        if (bot.health <= 0) {
          if (isPlayer) this.state.kills += 1;
          this.bots.eliminateBot(
            bot,
            isPlayer ? 'Player' : 'Bot',
            'Frag Grenade',
            false,
            isPlayer,
            this.broadcastKillFeed,
            (loot) => this.map.addGroundLoot(loot)
          );
        }
      }
    });

    // Check player in radius
    const pDist = this.playerPosition.distanceTo(pos);
    if (pDist < 12) {
      const dmg = Math.max(0, 100 * (1 - pDist / 12));
      this.damagePlayer(dmg, 'Frag Grenade');
    }
  }

  /**
   * Broadcast kill feed entry to UI
   */
  public broadcastKillFeed = (entry: KillFeedEntry) => {
    if (this.onKillFeed) {
      this.onKillFeed(entry);
    }
  };

  /**
   * Nearby loot and vehicle proximity detection
   */
  private checkNearbyInteractions() {
    // 1. Nearby Ground Loot
    let closestLoot: GroundLoot | null = null;
    let minLootDist = 2.8;

    this.map.groundLoots.forEach((loot) => {
      const d = loot.position.distanceTo(this.playerPosition);
      if (d < minLootDist) {
        minLootDist = d;
        closestLoot = loot;
      }
    });

    // Check nearby Buy Station Kiosks
    this.map.buyStations.forEach((station) => {
      const d = station.position.distanceTo(this.playerPosition);
      if (d < 4.2) {
        closestLoot = {
          id: station.id,
          type: 'meds',
          subType: 'shop',
          name: `${station.name} [SHOP]`,
          amount: 0,
          position: station.position,
        };
      }
    });

    this.state.nearbyLoot = closestLoot;

    // 2. Nearby Vehicle
    let closestVehicle: DrivableVehicle | null = null;
    let minVeiDist = 3.8;

    this.vehicles.vehicles.forEach((v) => {
      const d = v.position.distanceTo(this.playerPosition);
      if (d < minVeiDist) {
        minVeiDist = d;
        closestVehicle = v;
      }
    });
    this.state.nearbyVehicle = closestVehicle;
  }

  /**
   * Interact action: [F] key or Touch Interact
   */
  public handleInteract() {
    // Enter/exit vehicle
    if (this.state.isInVehicle) {
      this.state.isInVehicle = false;
      this.activeVehicleId = null;
      this.playerPosition.x += 2.0; // Step out
      return;
    }

    if (this.state.nearbyVehicle) {
      this.state.isInVehicle = true;
      this.activeVehicleId = this.state.nearbyVehicle.id;
      return;
    }

    // Pick up nearby loot or open Buy Station
    if (this.state.nearbyLoot) {
      const loot = this.state.nearbyLoot;
      if (loot.subType === 'shop') {
        if (this.onOpenShopUI) this.onOpenShopUI();
        return;
      }
      this.collectLootItem(loot);
      this.map.removeGroundLoot(loot.id);
      pubgAudio.playPickup();
    }
  }

  public collectLootItem(loot: GroundLoot) {
    if (loot.type === 'weapon') {
      const stats = WEAPON_REGISTRY[loot.subType as WeaponType];
      const newWeapon: WeaponItem = {
        id: `weapon_${Date.now()}`,
        type: stats.id,
        stats,
        currentAmmo: stats.magSize,
        reserveAmmo: stats.magSize * 2,
        fireMode: stats.availableModes[0],
      };

      if (!this.state.weapons.primary) {
        this.state.weapons.primary = newWeapon;
        this.switchWeaponSlot('primary');
      } else if (!this.state.weapons.secondary) {
        this.state.weapons.secondary = newWeapon;
        this.switchWeaponSlot('secondary');
      } else {
        // Replace current active
        this.state.weapons[this.state.activeSlot as 'primary' | 'secondary'] = newWeapon;
        this.playerController.setEquippedWeapon(newWeapon.type);
      }
    } else if (loot.type === 'ammo') {
      const aType = loot.subType as AmmoType;
      this.state.ammo[aType] = (this.state.ammo[aType] || 0) + loot.amount;
    } else if (loot.type === 'helmet') {
      const lvl = parseInt(loot.subType, 10) as 1 | 2 | 3;
      this.state.helmet = {
        level: lvl,
        durability: lvl * 80 + 50,
        maxDurability: lvl * 80 + 50,
        damageReduction: lvl === 3 ? 0.55 : lvl === 2 ? 0.4 : 0.3,
      };
      this.playerController.setHelmetLevel(lvl);
    } else if (loot.type === 'armor_vest') {
      const lvl = parseInt(loot.subType, 10) as 1 | 2 | 3;
      this.state.vest = {
        level: lvl,
        durability: lvl * 100 + 80,
        maxDurability: lvl * 100 + 80,
        damageReduction: lvl === 3 ? 0.55 : lvl === 2 ? 0.4 : 0.3,
      };
      this.playerController.setVestLevel(lvl);
    } else if (loot.type === 'meds') {
      if (loot.subType === 'energyDrink') {
        this.state.meds.energyDrink += loot.amount;
      } else {
        this.state.meds.firstAid += loot.amount;
      }
    }
  }

  public switchWeaponSlot(slot: WeaponSlot) {
    this.state.activeSlot = slot;
    const item = this.state.weapons[slot];
    this.playerController.setEquippedWeapon(item ? item.type : null);
    pubgAudio.playPickup();
  }

  public getActiveWeapon(): WeaponItem | null {
    return this.state.weapons[this.state.activeSlot];
  }

  public startReload() {
    const active = this.getActiveWeapon();
    if (!active || this.state.isReloading) return;
    if (active.currentAmmo >= active.stats.magSize) return;
    if (this.state.ammo[active.stats.ammoType] <= 0) return;

    this.state.isReloading = true;
    this.state.reloadProgress = 0;
    pubgAudio.playReloadSound();
  }

  public useMed(type: 'firstAid' | 'medkit' | 'energyDrink') {
    if (this.state.meds[type] <= 0) return;

    this.state.meds[type] -= 1;
    pubgAudio.playConsume();

    if (type === 'energyDrink') {
      this.state.boost = Math.min(100, this.state.boost + 40);
    } else if (type === 'firstAid') {
      this.state.health = Math.min(75, Math.max(this.state.health, 75));
    } else if (type === 'medkit') {
      this.state.health = 100;
    }
  }

  public throwEquippedGrenade() {
    if (this.state.throwables.frag <= 0) return;
    this.state.throwables.frag -= 1;

    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const origin = this.playerPosition.clone().add(new THREE.Vector3(0, 1.6, 0));
    this.ballistics.throwGrenade(origin, dir, true);
  }

  /**
   * Mobile swipe look handler
   */
  public handleTouchLook(dx: number, dy: number) {
    const sens = 0.004;
    this.yaw -= dx * sens;
    this.pitch -= dy * sens;
    this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
  }

  /**
   * Execute purchase from Tactical Black Market Shop
   */
  public buyShopItem(item: ShopItem): boolean {
    if (this.state.battlePoints < item.cost) return false;
    this.state.battlePoints -= item.cost;
    pubgAudio.playBuyChime();

    if (item.category === 'weapon') {
      const stats = WEAPON_REGISTRY[item.subType as WeaponType];
      if (stats) {
        const newW: WeaponItem = {
          id: `bought_${Date.now()}`,
          type: stats.id,
          stats,
          currentAmmo: stats.magSize,
          reserveAmmo: stats.magSize * 2,
          fireMode: stats.availableModes[0],
        };
        if (!this.state.weapons.primary) {
          this.state.weapons.primary = newW;
          this.switchWeaponSlot('primary');
        } else if (!this.state.weapons.secondary) {
          this.state.weapons.secondary = newW;
          this.switchWeaponSlot('secondary');
        } else {
          this.state.weapons[this.state.activeSlot as 'primary' | 'secondary'] = newW;
          this.playerController.setEquippedWeapon(newW.type);
        }
        // Grant ammo for purchased weapon
        this.state.ammo[stats.ammoType] = (this.state.ammo[stats.ammoType] || 0) + stats.magSize * 2;
      }
    } else if (item.category === 'ammo') {
      const aType = item.subType as AmmoType;
      const count = aType === '300Mag' ? 20 : aType === '50AE' ? 30 : 100;
      this.state.ammo[aType] = (this.state.ammo[aType] || 0) + count;
    } else if (item.category === 'armor') {
      if (item.subType.includes('helm')) {
        this.state.helmet = { level: 3, durability: 230, maxDurability: 230, damageReduction: 0.55 };
        this.playerController.setHelmetLevel(3);
      } else if (item.subType.includes('vest')) {
        this.state.vest = { level: 3, durability: 300, maxDurability: 300, damageReduction: 0.55 };
        this.playerController.setVestLevel(3);
      } else if (item.subType.includes('backpack')) {
        this.state.backpackLevel = 3;
      }
    } else if (item.category === 'meds') {
      if (item.subType === 'medkit') this.state.meds.medkit += 1;
      else if (item.subType === 'adrenaline') this.state.meds.adrenaline += 1;
      else if (item.subType === 'energyDrink_pack') this.state.meds.energyDrink += 3;
      else this.state.meds.firstAid += 1;
    } else if (item.category === 'tactical') {
      if (item.subType === 'FRAG_GRENADE') this.state.throwables.frag += 2;
      else if (item.subType === 'uav_scan') {
        pubgAudio.playPickup();
      }
    }

    return true;
  }

  /**
   * Over-the-shoulder TPS and First-Person ADS Camera
   */
  private updateCamera() {
    const totalPitch = this.pitch + this.currentRecoilPitch;
    const totalYaw = this.yaw + this.currentRecoilYaw;

    const forward = new THREE.Vector3(
      Math.sin(totalYaw) * Math.cos(totalPitch),
      Math.sin(totalPitch),
      Math.cos(totalYaw) * Math.cos(totalPitch)
    );

    const right = new THREE.Vector3(Math.cos(totalYaw), 0, -Math.sin(totalYaw));

    if (this.isFirstPerson || (this.isAimingADS && this.getActiveWeapon()?.type === 'AWM')) {
      // First Person / Sniper Scope View
      this.camera.position.set(
        this.playerPosition.x,
        this.playerPosition.y + (this.state.isCrouching ? 1.1 : 1.6),
        this.playerPosition.z
      );
      this.playerController.root.visible = false;
    } else {
      // Over the shoulder Third Person View
      this.playerController.root.visible = true;
      const shoulderOffset = this.isAimingADS ? 0.45 : 0.65;
      const camDist = this.isAimingADS ? 1.6 : 3.4;
      const camHeight = this.state.isCrouching ? 1.2 : 1.7;

      const targetPos = this.playerPosition
        .clone()
        .add(new THREE.Vector3(0, camHeight, 0))
        .add(right.clone().multiplyScalar(shoulderOffset))
        .sub(forward.clone().multiplyScalar(camDist));

      this.camera.position.lerp(targetPos, 0.4);
    }

    const lookTarget = this.camera.position.clone().add(forward.clone().multiplyScalar(50));
    this.camera.lookAt(lookTarget);

    // Dynamic FOV for ADS aiming zoom
    const targetFOV = this.isAimingADS
      ? this.getActiveWeapon()?.type === 'AWM'
        ? 20 // 8x Scope zoom!
        : 45 // Red dot zoom
      : 65; // Standard field of view

    this.camera.fov += (targetFOV - this.camera.fov) * 0.25;
    this.camera.updateProjectionMatrix();
  }

  public destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
