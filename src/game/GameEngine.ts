import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  AircraftType,
  GameSettings,
  PlayerFlightState,
  RadioMessage,
  Quest,
  WeatherPreset,
} from '../types/game';
import { AIRCRAFT_ROSTER, buildPlayerAircraft } from './aircraftModels';
import { FlightPhysics } from './flightPhysics';
import { GameWorld } from './terrainWorld';
import { ParticleManager } from './particles';
import { CombatSystem } from './combatSystem';
import { gameAudio } from './gameAudio';
import { CelestialSystem, TimeOfDayPreset } from './celestialSystem';
import { WeatherEnvironment } from './weatherEnvironment';

export class GameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  private container: HTMLElement;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Subsystems
  public world: GameWorld;
  public particles: ParticleManager;
  public combat: CombatSystem;
  public physics: FlightPhysics;
  public celestial: CelestialSystem;
  public weather: WeatherEnvironment;

  // Active Waypoint for Map Navigation
  public activeWaypoint: { id: string; name: string; x: number; z: number } | null = null;

  // Active Aircraft
  public aircraftMesh: THREE.Group;
  public afterburners: THREE.Mesh[] = [];
  public cannonHardpoints: THREE.Vector3[] = [];
  public missileHardpoints: THREE.Vector3[] = [];
  public currentAircraftType: AircraftType;

  // Settings
  public settings: GameSettings;
  public isRunning = false;
  public isPaused = false;

  // Key tracking
  private keys: Record<string, boolean> = {};

  // Touch controls state
  public touchPitch = 0;
  public touchRoll = 0;
  public touchBoost = false;
  public touchBrake = false;
  public touchFireLaser = false;
  public touchFireMissile = false;

  // Callbacks to React UI
  public onTelemetryUpdate: ((state: PlayerFlightState) => void) | null = null;
  public onGameOver: ((finalScore: number, kills: number, wave: number) => void) | null = null;
  public onWaveAnnounce: ((wave: number, isBoss: boolean) => void) | null = null;
  public onRadioMessage: ((msg: RadioMessage) => void) | null = null;
  public onQuestCompleted: ((quest: Quest) => void) | null = null;
  public onToggleMap: (() => void) | null = null;

  constructor(
    container: HTMLElement,
    aircraftType: AircraftType,
    settings: GameSettings
  ) {
    this.container = container;
    this.currentAircraftType = aircraftType;
    this.settings = settings;

    // 1. Scene setup with atmospheric horizon fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a1626);
    this.scene.fog = new THREE.FogExp2(0x0a1626, 0.00085);

    // 2. Camera setup
    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.5, 6000);

    // 3. Renderer with physical tone mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Procedural Studio Environment Reflection for PBR metallic finishes
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {}

    // 5. Real-World Celestial System (Sun, Moon, Ambient Hemisphere Light & Solar Shadows)
    const initialPreset: TimeOfDayPreset =
      settings.timeOfDay === 'daylight' ? 'day' : settings.timeOfDay;
    this.celestial = new CelestialSystem(this.scene, initialPreset);

    // 6. Real-World Dynamic Weather & Atmospheric Environment
    this.weather = new WeatherEnvironment(this.scene, settings.weather || 'clear');

    // 7. Build Subsystems
    this.world = new GameWorld(this.scene);
    this.particles = new ParticleManager(this.scene);
    this.combat = new CombatSystem(this.scene, this.particles);

    // Hook radio & quest callbacks
    this.combat.onRadioMessage = (msg) => {
      if (this.onRadioMessage) this.onRadioMessage(msg);
    };
    this.combat.onQuestCompleted = (q) => {
      if (this.onQuestCompleted) this.onQuestCompleted(q);
    };

    // 6. Build Player Aircraft
    const planeData = buildPlayerAircraft(aircraftType);
    this.aircraftMesh = planeData.group;
    this.afterburners = planeData.afterburners;
    this.cannonHardpoints = planeData.cannons;
    this.missileHardpoints = planeData.missileHardpoints;
    this.scene.add(this.aircraftMesh);

    // Load initial persistent credits
    const savedCr = localStorage.getItem('skyfire_credits');
    const initialCredits = savedCr ? parseInt(savedCr, 10) : 500;

    const planeStats = AIRCRAFT_ROSTER.find((a) => a.id === aircraftType)!;
    this.physics = new FlightPhysics(
      this.aircraftMesh,
      settings,
      planeStats.armor,
      planeStats.shields,
      initialCredits
    );
    this.physics.cruiseSpeed = planeStats.topSpeed / 3.1;
    this.physics.maxBoostSpeed = this.physics.cruiseSpeed * 1.65;

    // 7. Event listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp);
    this.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public addCredits(amount: number) {
    this.physics.state.credits += amount;
    localStorage.setItem('skyfire_credits', this.physics.state.credits.toString());
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    gameAudio.startEngine();
    this.clock.start();
    this.animate();
  }

  public pause() {
    this.isPaused = true;
    gameAudio.stopEngine();
  }

  public resume() {
    this.isPaused = false;
    gameAudio.startEngine();
  }

  public switchAircraft(type: AircraftType) {
    this.currentAircraftType = type;
    this.scene.remove(this.aircraftMesh);

    const planeData = buildPlayerAircraft(type);
    this.aircraftMesh = planeData.group;
    this.afterburners = planeData.afterburners;
    this.cannonHardpoints = planeData.cannons;
    this.missileHardpoints = planeData.missileHardpoints;
    this.scene.add(this.aircraftMesh);

    const planeStats = AIRCRAFT_ROSTER.find((a) => a.id === type)!;
    this.physics.aircraftMesh = this.aircraftMesh;
    this.physics.state.health = planeStats.armor;
    this.physics.state.maxHealth = planeStats.armor;
    this.physics.state.shields = planeStats.shields;
    this.physics.state.maxShields = planeStats.shields;
    this.physics.state.missiles = planeStats.missileCapacity;
    this.physics.state.maxMissiles = planeStats.missileCapacity;
    this.physics.cruiseSpeed = planeStats.topSpeed / 3.1;
    this.physics.maxBoostSpeed = this.physics.cruiseSpeed * 1.65;
  }

  public setTimeOfDay(preset: TimeOfDayPreset) {
    this.settings.timeOfDay = preset === 'day' ? 'daylight' : preset;
    this.celestial.setTimeOfDay(preset);
  }

  public setWeather(preset: WeatherPreset) {
    this.settings.weather = preset;
    this.weather.setWeather(preset);
    this.physics.state.weather = preset;
    if (preset === 'fog') {
      this.scene.fog = new THREE.FogExp2(0x94a3b8, 0.0022);
    } else if (preset === 'rain') {
      this.scene.fog = new THREE.FogExp2(0x475569, 0.0013);
    } else if (preset === 'thunderstorm') {
      this.scene.fog = new THREE.FogExp2(0x1e293b, 0.0016);
    } else {
      this.scene.fog = new THREE.FogExp2(0x0a1626, 0.00085);
    }
  }


  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;

    if (e.code === 'KeyM') {
      if (this.onToggleMap) this.onToggleMap();
    }

    if (e.code === 'KeyC') {
      const modes: GameSettings['cameraMode'][] = ['CHASE', 'COCKPIT', 'CINEMATIC'];
      const nextIdx = (modes.indexOf(this.settings.cameraMode) + 1) % modes.length;
      this.settings.cameraMode = modes[nextIdx];
      this.physics.settings.cameraMode = this.settings.cameraMode;
    }

    if (e.code === 'KeyF') {
      this.triggerMissileFire();
    }
  };


  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private onPointerDown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.keys['Mouse0'] = true;
    } else if (e.button === 2) {
      this.triggerMissileFire();
    }
  };

  private onPointerUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.keys['Mouse0'] = false;
    }
  };

  private triggerMissileFire() {
    if (this.physics.state.missiles > 0 && this.physics.state.missileCooldown <= 0) {
      const hp = this.missileHardpoints[this.physics.state.missiles % this.missileHardpoints.length];
      const fired = this.combat.fireMissile(hp, this.aircraftMesh, this.physics.state.lockedEnemyId);
      if (fired) {
        this.physics.state.missiles--;
        this.physics.state.missileCooldown = 1.1;
      }
    }
  }

  private processInputs() {
    let pitch = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) pitch -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) pitch += 1;
    if (this.touchPitch !== 0) pitch = this.touchPitch;
    this.physics.inputPitch = pitch;

    let roll = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) roll -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) roll += 1;
    if (this.touchRoll !== 0) roll = this.touchRoll;
    this.physics.inputRoll = roll;

    let yaw = 0;
    if (this.keys['KeyQ']) yaw -= 1;
    if (this.keys['KeyE']) yaw += 1;
    this.physics.inputYaw = yaw;

    this.physics.inputBoost = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touchBoost;
    this.physics.inputBrake = this.keys['ControlLeft'] || this.keys['ControlRight'] || this.touchBrake;

    const firingLaser = this.keys['Space'] || this.keys['Mouse0'] || this.touchFireLaser;
    if (firingLaser && !this.physics.state.isOverheated) {
      this.physics.state.cannonHeat += 0.014;
      if (this.physics.state.cannonHeat >= 1.0) {
        this.physics.state.isOverheated = true;
      }
      const planeStats = AIRCRAFT_ROSTER.find((a) => a.id === this.currentAircraftType)!;
      const isQuad = this.physics.state.activeQuadLaserTime > 0;
      this.combat.firePlayerLasers(this.cannonHardpoints, this.aircraftMesh, planeStats.laserDamage, isQuad);
    }
  }

  private animate = () => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.animate);
    if (this.isPaused) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Process inputs & flight dynamics
    this.processInputs();
    this.physics.update(delta);

    // 2. Dynamic afterburner scale & flame response
    const isOverdrive = this.physics.state.activeOverdriveTime > 0;
    const boostScale = isOverdrive
      ? 3.2
      : this.physics.state.isBoosting
      ? 2.4
      : 0.8 + this.physics.state.throttle * 0.5;

    this.afterburners.forEach((ab) => {
      ab.scale.set(1.0, boostScale, 1.0);
    });

    // 3. High-velocity wind streaks & wingtip vapor
    const fwd = new THREE.Vector3();
    this.aircraftMesh.getWorldDirection(fwd);

    if (this.physics.currentSpeed > 100) {
      this.particles.addWindStreak(this.aircraftMesh.position, fwd, this.physics.currentSpeed);
    }
    if (this.physics.state.gForce > 2.2) {
      this.particles.addWingtipVapor(this.aircraftMesh.position);
    }

    // 4. Real-world Celestial System update (Sun, Moon, Solar Lighting & Shadows)
    this.celestial.update(delta, this.camera, this.aircraftMesh.position);

    const alt = this.aircraftMesh.position.y;
    if (alt > 700) {
      this.combat.progressQuest('space_climb', 1, (cr) => this.addCredits(cr));
    }


    // 5. Audio engine pitch & lock tones
    gameAudio.updateEngineSound(
      this.physics.state.throttle,
      this.physics.state.isBoosting || isOverdrive,
      this.physics.currentSpeed / this.physics.maxBoostSpeed
    );

    // 6. Target Lock-On evaluation
    const lockResult = this.combat.updateLockOn(this.aircraftMesh, delta);
    this.physics.state.lockedEnemyId = lockResult.lockedId;
    this.physics.state.lockProgress = lockResult.lockProgress;
    gameAudio.updateLockTone(lockResult.lockProgress > 0.1, lockResult.isLocked);

    // 7. Real-world Dynamic Weather & Atmospheric Environment
    this.weather.update(
      delta,
      this.aircraftMesh.position,
      this.physics.velocity,
      this.world.cloudGroup
    );

    // Apply real-world crosswind drift
    if (this.weather.wind.speedKnots > 0) {
      const windPush = this.weather.wind.vector.clone().multiplyScalar(this.weather.wind.speedKnots * 0.04 * delta);
      this.aircraftMesh.position.add(windPush);
    }

    // 8. Update World & Particles
    this.world.update(delta, alt, this.weather.wind.headingDeg, this.weather.wind.speedKnots);
    this.particles.update(delta);

    // Sync weather and atmospheric moisture into flight telemetry
    this.physics.state.cloudMoisture = this.weather.cloudMoisture;
    this.physics.state.windSpeed = this.weather.wind.speedKnots;
    this.physics.state.windHeading = this.weather.wind.headingDeg;
    this.physics.state.weather = this.settings.weather;

    // 9. Low Altitude / Terrain Warning & Crash Detection
    const isTerrainWarning = alt < 35 && this.physics.velocity.y < -5;
    gameAudio.setWarningActive(isTerrainWarning);

    if (alt <= 2.0) {
      this.handlePlayerCrash('Impact with ocean surface');
      return;
    }

    // Skyscraper collision in Sector Sierra Downtown (X=480, Z=480)
    if (alt < 165) {
      const pX = this.aircraftMesh.position.x;
      const pZ = this.aircraftMesh.position.z;
      if (Math.abs(pX - 480) < 105 && Math.abs(pZ - 480) < 105) {
        const dCity = Math.hypot(pX - 480, pZ - 480);
        if (dCity < 24 && alt < 160) {
          this.handlePlayerCrash('Collided with skyscraper structure in Sector Sierra');
          return;
        }
      }
    }

    for (const mountain of this.world.mountainMeshes) {
      const d = mountain.position.distanceTo(this.aircraftMesh.position);
      if (d < 45) {
        this.handlePlayerCrash('Collided with mountain terrain');
        return;
      }
    }

    // 9. Update Combat System
    this.combat.update(
      delta,
      this.aircraftMesh,
      (damage) => {
        const isDead = this.physics.takeDamage(damage);
        this.particles.addTrauma(0.5);
        if (isDead) {
          this.handlePlayerCrash('Shot down in combat');
        }
      },
      (killedEnemy) => {
        const points =
          killedEnemy.type === 'boss_apex'
            ? 30000
            : killedEnemy.type === 'mecha_striker'
            ? 5000
            : killedEnemy.type === 'ace'
            ? 3500
            : 1200;

        this.physics.state.kills++;
        this.physics.state.score += points * this.physics.state.multiplier;
        this.physics.state.multiplier = Math.min(5, this.physics.state.multiplier + 0.2);

        if (killedEnemy.type === 'boss_apex' && this.onWaveAnnounce) {
          this.onWaveAnnounce(this.combat.currentWave + 1, false);
        }
      },
      () => {
        // Ring passed
        this.physics.state.score += 2500 * this.physics.state.multiplier;
        this.physics.state.shields = Math.min(this.physics.state.maxShields, this.physics.state.shields + 45);
        this.physics.state.multiplier = Math.min(5, this.physics.state.multiplier + 0.5);
      },
      (pickupType) => {
        // Collectible Boost Hit ("boots")
        if (pickupType === 'speed_overdrive') {
          this.physics.state.activeOverdriveTime = 8.5;
          this.combat.sendRadio('Copilot Yuki', 'VORTEX-2', '#06b6d4', 'OVERDRIVE ENGAGED! Mach boost unlocked!', 'cheer');
        } else if (pickupType === 'shield_restore') {
          this.physics.state.shields = this.physics.state.maxShields;
          this.combat.sendRadio('Copilot Yuki', 'VORTEX-2', '#10b981', 'Shields recharged to 100% capacity!', 'info');
        } else if (pickupType === 'quad_laser') {
          this.physics.state.activeQuadLaserTime = 10.0;
          this.combat.sendRadio('HQ Command', 'TAC-OPS', '#f59e0b', 'Quad Plasma Cannons Overclocked!', 'cheer');
        } else if (pickupType === 'missile_salvo') {
          this.physics.state.missiles = this.physics.state.maxMissiles;
          this.combat.sendRadio('Copilot Yuki', 'VORTEX-2', '#f43f5e', 'Missile payload fully restocked!', 'info');
        } else if (pickupType === 'credit_cache') {
          this.addCredits(350);
          this.combat.sendRadio('HQ Command', 'TAC-OPS', '#fbbf24', 'Tactical Supply Cache Secured: +$350 CR!', 'info');
        }
      },
      (bountyCredits) => {
        this.addCredits(bountyCredits);
      }
    );

    // 10. Camera updates
    this.physics.updateCamera(this.camera, delta, this.particles.shakeOffset);

    // 11. Render Scene
    this.renderer.render(this.scene, this.camera);

    // 12. Sync Telemetry to React HUD
    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate({ ...this.physics.state });
    }
  };

  private handlePlayerCrash(reason: string) {
    this.isRunning = false;
    this.particles.addExplosion(this.aircraftMesh.position, true);
    gameAudio.playExplosion(true);
    gameAudio.stopEngine();

    if (this.onGameOver) {
      this.onGameOver(
        this.physics.state.score,
        this.physics.state.kills,
        this.combat.currentWave
      );
    }
  }

  public restartGame() {
    this.particles.clear();
    this.combat.clear();

    const planeStats = AIRCRAFT_ROSTER.find((a) => a.id === this.currentAircraftType)!;
    this.aircraftMesh.position.set(0, 110, 200);
    this.aircraftMesh.rotation.set(0, 0, 0);

    this.physics.state.health = planeStats.armor;
    this.physics.state.maxHealth = planeStats.armor;
    this.physics.state.shields = planeStats.shields;
    this.physics.state.maxShields = planeStats.shields;
    this.physics.state.score = 0;
    this.physics.state.kills = 0;
    this.physics.state.multiplier = 1;
    this.physics.state.missiles = planeStats.missileCapacity;
    this.physics.state.activeOverdriveTime = 0;
    this.physics.state.activeQuadLaserTime = 0;
    this.physics.currentSpeed = this.physics.cruiseSpeed;

    this.combat.spawnWave(1);
    this.start();
  }

  private onResize = () => {
    if (!this.container || !this.renderer) return;
    const w = this.container.clientWidth;
    const h = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public dispose() {
    this.isRunning = false;
    if (this.animFrameId !== null) cancelAnimationFrame(this.animFrameId);
    gameAudio.stopEngine();

    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp);

    this.weather.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
