import * as THREE from 'three';
import { CameraViewMode, GameSettings, PlayerFlightState, WeatherPreset } from '../types/game';

// Scratch vectors for zero GC allocation
const _forward = new THREE.Vector3();
const _up = new THREE.Vector3();
const _right = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

export interface ControlSurfacesRef {
  elevators?: THREE.Mesh[];
  aileronsL?: THREE.Mesh[];
  aileronsR?: THREE.Mesh[];
  rudders?: THREE.Mesh[];
  canards?: THREE.Mesh[];
  levcons?: THREE.Mesh[];
}

export class FlightPhysics {
  public aircraftMesh: THREE.Group;
  public state: PlayerFlightState;
  public settings: GameSettings;
  public controlSurfaces: ControlSurfacesRef = {};
  public cockpitOffset = new THREE.Vector3(0, 0.55, 0.85);

  // Velocity & rotation physics
  public velocity = new THREE.Vector3(0, 0, -1);
  public currentSpeed = 160;
  public minSpeed = 50;
  public cruiseSpeed = 160;
  public maxBoostSpeed = 320;
  public stallSpeed = 75; // Below this airspeed, lift collapses

  // Aerodynamic Rotation rates
  private pitchRate = 0;
  private rollRate = 0;
  private yawRate = 0;

  // Inputs
  public inputPitch = 0;
  public inputRoll = 0;
  public inputYaw = 0;
  public inputBoost = false;
  public inputBrake = false;
  public inputFireLaser = false;
  public inputFireMissile = false;

  // Camera damping
  private currentCamPos = new THREE.Vector3(0, 8, 22);
  private currentLookAt = new THREE.Vector3(0, 0, -20);
  public missileCamTarget: THREE.Object3D | null = null;

  // Stall buffeting oscillation
  private stallBuffetTime = 0;

  constructor(
    aircraftMesh: THREE.Group,
    settings: GameSettings,
    initialHealth = 120,
    initialShields = 100,
    initialCredits = 0,
    maxFlares = 24
  ) {
    this.aircraftMesh = aircraftMesh;
    this.settings = settings;

    this.state = {
      speed: Math.round(this.cruiseSpeed * 3.1),
      mach: 0.75,
      throttle: 0.5,
      isBoosting: false,
      isBraking: false,
      health: initialHealth,
      maxHealth: initialHealth,
      shields: initialShields,
      maxShields: initialShields,
      missiles: 8,
      maxMissiles: 8,
      missileCooldown: 0,
      flares: maxFlares,
      maxFlares: maxFlares,
      flareCooldown: 0,
      cannonHeat: 0,
      isOverheated: false,
      altitude: 120,
      heading: 0,
      pitch: 0,
      roll: 0,
      gForce: 1.0,
      blackoutAlpha: 0,
      redoutAlpha: 0,
      isStalling: false,
      stallWarning: false,
      isTransonic: false,
      incomingMissileWarning: false,
      incomingMissileDist: 9999,
      fuelLeak: false,
      engineFire: false,
      hydraulicsDamaged: false,
      score: 0,
      kills: 0,
      multiplier: 1,
      credits: initialCredits,
      lockedEnemyId: null,
      lockProgress: 0,
      isSpace: false,
      activeOverdriveTime: 0,
      activeQuadLaserTime: 0,
      weather: settings.weather || 'clear',
    };

    this.aircraftMesh.position.set(0, 110, 200);
  }

  public deployFlares(): boolean {
    if (this.state.flares > 0 && this.state.flareCooldown <= 0) {
      this.state.flares--;
      this.state.flareCooldown = 0.85; // 0.85s reload between salvos
      return true;
    }
    return false;
  }

  public update(delta: number) {
    const s = this.settings;

    // Countdown active boost powerups & cooldowns
    if (this.state.activeOverdriveTime > 0) {
      this.state.activeOverdriveTime = Math.max(0, this.state.activeOverdriveTime - delta);
    }
    if (this.state.activeQuadLaserTime > 0) {
      this.state.activeQuadLaserTime = Math.max(0, this.state.activeQuadLaserTime - delta);
    }
    if (this.state.flareCooldown > 0) {
      this.state.flareCooldown = Math.max(0, this.state.flareCooldown - delta);
    }
    if (this.state.missileCooldown > 0) {
      this.state.missileCooldown = Math.max(0, this.state.missileCooldown - delta);
    }

    // Space / Stratosphere boundary check (> 2500 ft / Y > 750)
    const isSpaceMode = this.aircraftMesh.position.y > 750;
    this.state.isSpace = isSpaceMode;

    // Damage effects on flight systems
    const healthPercent = this.state.health / this.state.maxHealth;
    this.state.fuelLeak = healthPercent < 0.65;
    this.state.engineFire = healthPercent < 0.38;
    this.state.hydraulicsDamaged = healthPercent < 0.22;

    const hasOverdrive = this.state.activeOverdriveTime > 0;
    const boostMultiplier = hasOverdrive ? 1.45 : isSpaceMode ? 1.3 : 1.0;
    const engineDamagePenalty = this.state.engineFire ? 0.72 : 1.0;
    const maxBoost = this.maxBoostSpeed * boostMultiplier * engineDamagePenalty;

    // 1. Throttle & Speed acceleration
    let targetSpeed = this.cruiseSpeed * engineDamagePenalty;
    if (this.inputBoost || hasOverdrive) {
      targetSpeed = maxBoost;
      this.state.isBoosting = true;
      this.state.isBraking = false;
    } else if (this.inputBrake) {
      targetSpeed = this.minSpeed;
      this.state.isBraking = true;
      this.state.isBoosting = false;
    } else {
      this.state.isBoosting = false;
      this.state.isBraking = false;
    }

    const accel = (this.inputBoost || hasOverdrive) ? 85 : 45;
    this.currentSpeed = THREE.MathUtils.damp(this.currentSpeed, targetSpeed, accel * 0.05, delta);
    this.state.speed = Math.round(this.currentSpeed * 3.1);
    this.state.mach = parseFloat((this.state.speed / 660).toFixed(2));
    this.state.isTransonic = this.state.mach >= 0.97 && this.state.mach <= 1.06;
    this.state.throttle = (this.currentSpeed - this.minSpeed) / Math.max(1, maxBoost - this.minSpeed);

    // 2. Aerodynamic Stall Mechanics
    const isHighPitch = this.state.pitch > 45;
    const isLowSpeed = this.currentSpeed < this.stallSpeed;
    const stallCondition = isLowSpeed && (isHighPitch || this.state.throttle < 0.35);

    if (stallCondition && !isSpaceMode) {
      this.state.isStalling = true;
      this.state.stallWarning = true;
      this.stallBuffetTime += delta * 24;

      // Airframe buffet vibration & nose-down aerodynamic gravity moment
      const buffetPitch = Math.sin(this.stallBuffetTime) * 0.04;
      const buffetRoll = Math.cos(this.stallBuffetTime * 1.3) * 0.06;
      this.aircraftMesh.rotateX(buffetPitch - 0.8 * delta); // Nose drops naturally
      this.aircraftMesh.rotateZ(buffetRoll);
    } else {
      this.state.isStalling = false;
      this.state.stallWarning = false;
    }

    // 3. Angular maneuvers & Control Authority
    const pitchDir = s.invertPitch ? -1 : 1;
    const agilityBoost = (isSpaceMode ? 1.25 : 1.0) * (this.state.hydraulicsDamaged ? 0.65 : 1.0);

    const targetPitchRate = this.inputPitch * 1.95 * pitchDir * agilityBoost;
    const targetRollRate = this.inputRoll * 2.95 * agilityBoost;
    const targetYawRate = this.inputYaw * 0.95 * agilityBoost;

    this.pitchRate = THREE.MathUtils.damp(this.pitchRate, targetPitchRate, 8.5, delta);
    this.rollRate = THREE.MathUtils.damp(this.rollRate, targetRollRate, 10.0, delta);
    this.yawRate = THREE.MathUtils.damp(this.yawRate, targetYawRate, 6.5, delta);

    this.aircraftMesh.rotateX(this.pitchRate * delta);
    this.aircraftMesh.rotateZ(-this.rollRate * delta);
    this.aircraftMesh.rotateY(-this.yawRate * delta);

    // Coordinated aerodynamic banking yaw
    if (Math.abs(this.inputRoll) > 0.05) {
      this.aircraftMesh.rotateY(-this.inputRoll * 0.38 * delta);
    }

    // 4. Animate Moving Control Surfaces (Elevators, Ailerons, Canards, Rudders, LEVCONs)
    this.updateControlSurfaces(delta);

    // 5. G-Force Calculation & Pilot Blackout / Redout
    // Normal G-force: 1G at level flight + centripetal G from pitching and speed
    const signedPitchPull = this.pitchRate * (s.invertPitch ? 1 : -1);
    const dynamicG = 1.0 + (signedPitchPull * (this.currentSpeed / 65) * 2.6);
    this.state.gForce = parseFloat(dynamicG.toFixed(1));

    // Pilot Blackout: Positive G > 5.5 causes blood to drain from brain
    if (this.state.gForce > 5.5) {
      const excess = (this.state.gForce - 5.5) / 4.0;
      this.state.blackoutAlpha = Math.min(0.95, this.state.blackoutAlpha + excess * delta * 1.8);
    } else {
      this.state.blackoutAlpha = Math.max(0, this.state.blackoutAlpha - 1.5 * delta);
    }

    // Pilot Redout: Negative G < -1.5 causes blood rush to eyes
    if (this.state.gForce < -1.5) {
      const excess = (-this.state.gForce - 1.5) / 2.5;
      this.state.redoutAlpha = Math.min(0.85, this.state.redoutAlpha + excess * delta * 2.0);
    } else {
      this.state.redoutAlpha = Math.max(0, this.state.redoutAlpha - 1.8 * delta);
    }

    // 6. Move aircraft forward in 3D space
    this.aircraftMesh.getWorldDirection(_forward);
    this.velocity.copy(_forward).multiplyScalar(this.currentSpeed * delta);
    this.aircraftMesh.position.add(this.velocity);

    // 7. Update Aircraft telemetry
    this.state.altitude = Math.max(0, Math.round(this.aircraftMesh.position.y * 3.28));

    const euler = new THREE.Euler().setFromQuaternion(this.aircraftMesh.quaternion, 'YXZ');
    this.state.heading = Math.round(((euler.y * 180) / Math.PI + 360) % 360);
    this.state.pitch = Math.round((euler.x * 180) / Math.PI);
    this.state.roll = Math.round((-euler.z * 180) / Math.PI);

    // 8. Shield regeneration & Cannon cooling
    if (this.state.shields < this.state.maxShields) {
      this.state.shields = Math.min(this.state.maxShields, this.state.shields + 8 * delta);
    }

    if (this.state.cannonHeat > 0) {
      this.state.cannonHeat = Math.max(
        0,
        this.state.cannonHeat - (this.state.isOverheated ? 0.38 : 0.6) * delta
      );
      if (this.state.cannonHeat === 0) {
        this.state.isOverheated = false;
      }
    }
  }

  private updateControlSurfaces(delta: number) {
    const cs = this.controlSurfaces;
    const targetPitchDeflect = this.inputPitch * 0.45;
    const targetRollDeflect = this.inputRoll * 0.4;
    const targetYawDeflect = this.inputYaw * 0.35;

    // Elevators tilt on pitch
    if (cs.elevators) {
      cs.elevators.forEach((elev) => {
        elev.rotation.x = THREE.MathUtils.damp(elev.rotation.x, targetPitchDeflect, 15, delta);
      });
    }

    // Close-coupled Canards tilt opposite to elevators for lift generation
    if (cs.canards) {
      cs.canards.forEach((canard) => {
        canard.rotation.x = THREE.MathUtils.damp(canard.rotation.x, -targetPitchDeflect * 0.8, 15, delta);
      });
    }

    // Su-57 LEVCONs articulate dynamically with pitch
    if (cs.levcons) {
      cs.levcons.forEach((levcon) => {
        levcon.rotation.x = THREE.MathUtils.damp(levcon.rotation.x, -targetPitchDeflect * 0.6, 14, delta);
      });
    }

    // Ailerons deflect oppositely for roll
    if (cs.aileronsL) {
      cs.aileronsL.forEach((aileron) => {
        aileron.rotation.x = THREE.MathUtils.damp(aileron.rotation.x, targetRollDeflect, 18, delta);
      });
    }
    if (cs.aileronsR) {
      cs.aileronsR.forEach((aileron) => {
        aileron.rotation.x = THREE.MathUtils.damp(aileron.rotation.x, -targetRollDeflect, 18, delta);
      });
    }

    // Rudders articulate on yaw
    if (cs.rudders) {
      cs.rudders.forEach((rudder) => {
        rudder.rotation.y = THREE.MathUtils.damp(rudder.rotation.y, targetYawDeflect, 14, delta);
      });
    }
  }

  public updateCamera(camera: THREE.PerspectiveCamera, delta: number, shakeOffset: THREE.Vector3) {
    const mode = this.settings.cameraMode;
    const pos = this.aircraftMesh.position;

    this.aircraftMesh.getWorldDirection(_forward);
    _up.set(0, 1, 0).applyQuaternion(this.aircraftMesh.quaternion);

    // 1. FIRST-PERSON INTERACTIVE COCKPIT VIEW
    if (mode === 'COCKPIT') {
      _targetCamPos.copy(pos)
        .addScaledVector(_up, this.cockpitOffset.y)
        .addScaledVector(_forward, this.cockpitOffset.z);
      _targetLookAt.copy(_targetCamPos).addScaledVector(_forward, 60);

      camera.position.copy(_targetCamPos).add(shakeOffset);
      camera.up.copy(_up);
      camera.lookAt(_targetLookAt);

      const targetFov = this.state.isBoosting ? 80 : 72;
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 8.0, delta);
      camera.updateProjectionMatrix();

    // 2. CINEMATIC FLY-BY CAM
    } else if (mode === 'CINEMATIC') {
      _targetCamPos.copy(pos).add(new THREE.Vector3(28, 14, 38));
      camera.position.lerp(_targetCamPos, 0.08);
      camera.lookAt(pos);

    // 3. MISSILE-CAM / KILL-CAM (Follows active missile to bandit)
    } else if (mode === 'MISSILE_CAM' && this.missileCamTarget) {
      const mPos = this.missileCamTarget.position;
      const mFwd = new THREE.Vector3();
      this.missileCamTarget.getWorldDirection(mFwd);

      _targetCamPos.copy(mPos).addScaledVector(mFwd, -6).add(new THREE.Vector3(0, 1.8, 0));
      _targetLookAt.copy(mPos).addScaledVector(mFwd, 30);

      camera.position.lerp(_targetCamPos, 18 * delta);
      camera.lookAt(_targetLookAt);
      camera.fov = 75;
      camera.updateProjectionMatrix();

    // 4. THIRD-PERSON DYNAMIC CHASE CAM
    } else {
      const boostFactor = this.state.isBoosting ? 1.25 : 1.0;
      const camDist = 18.5 * boostFactor;
      const camHeight = 5.2;

      _targetCamPos.copy(pos).addScaledVector(_forward, -camDist).addScaledVector(_up, camHeight);
      _targetLookAt.copy(pos).addScaledVector(_forward, 25);

      this.currentCamPos.lerp(_targetCamPos, 14 * delta);
      this.currentLookAt.lerp(_targetLookAt, 16 * delta);

      camera.position.copy(this.currentCamPos).add(shakeOffset);
      camera.up.lerp(_up, 12 * delta);
      camera.lookAt(this.currentLookAt);

      const targetFov = this.state.isBoosting ? 80 : 65;
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 6.0, delta);
      camera.updateProjectionMatrix();
    }
  }

  public takeDamage(amount: number): boolean {
    if (this.state.shields > 0) {
      this.state.shields -= amount;
      if (this.state.shields < 0) {
        this.state.health += this.state.shields;
        this.state.shields = 0;
      }
    } else {
      this.state.health -= amount;
    }
    return this.state.health <= 0;
  }
}
