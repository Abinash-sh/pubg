export type GameState = 'START_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'HANGAR_SHOP';

export type CameraViewMode = 'CHASE' | 'COCKPIT' | 'CINEMATIC' | 'MISSILE_CAM';

export type WeatherPreset = 'clear' | 'fog' | 'rain' | 'thunderstorm';

export type AircraftType =
  | 'f35_lightning'
  | 'su57_felon'
  | 'dassault_rafale'
  | 'vortex_ghost'
  | 'orbital_darkstar';

export interface AircraftStats {
  id: AircraftType;
  name: string;
  codename: string;
  role: string;
  nation: string;
  generation: string;
  tier: number;
  price: number;
  topSpeed: number; // knots
  maxMach: number;
  thrustToWeight: number;
  acceleration: number;
  agility: number; // roll/pitch rate
  armor: number; // max health
  shields: number; // max shields
  laserDamage: number;
  cannonRpm: number;
  missileCapacity: number;
  flareCapacity: number;
  color: string;
  accentColor: string;
  description: string;
  specialAbility: string;
}

export type PickupType =
  | 'speed_overdrive'
  | 'shield_restore'
  | 'quad_laser'
  | 'missile_salvo'
  | 'flare_restock'
  | 'credit_cache';

export interface WorldPickup {
  id: string;
  type: PickupType;
  position: { x: number; y: number; z: number };
  collected: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCredits: number;
  rewardScore: number;
  completed: boolean;
  type: 'rings' | 'kills' | 'boss' | 'space_climb' | 'boost_pickups' | 'flares_deployed';
}

export interface RadioMessage {
  id: string;
  sender: string;
  callsign: string;
  avatarColor: string;
  text: string;
  type: 'info' | 'warning' | 'cheer' | 'boss' | 'awacs';
}

export interface PlayerFlightState {
  speed: number; // current velocity magnitude (knots)
  mach: number; // Mach number (speed / 660)
  throttle: number; // 0 to 1
  isBoosting: boolean;
  isBraking: boolean;
  health: number;
  maxHealth: number;
  shields: number;
  maxShields: number;
  missiles: number;
  maxMissiles: number;
  missileCooldown: number;
  flares: number;
  maxFlares: number;
  flareCooldown: number;
  cannonHeat: number; // 0 to 1
  isOverheated: boolean;
  altitude: number;
  heading: number; // degrees 0-360
  pitch: number; // degrees
  roll: number; // degrees
  gForce: number;
  blackoutAlpha: number; // G-force blackout vignette (0 to 1)
  redoutAlpha: number; // Negative G redout haze (0 to 1)
  isStalling: boolean;
  stallWarning: boolean;
  isTransonic: boolean; // Transonic condensation cone (Mach 0.98 - 1.05)
  incomingMissileWarning: boolean;
  incomingMissileDist: number;
  fuelLeak: boolean;
  engineFire: boolean;
  hydraulicsDamaged: boolean;
  score: number;
  kills: number;
  multiplier: number;
  credits: number;
  lockedEnemyId: string | null;
  lockProgress: number; // 0 to 1
  isSpace: boolean; // Stratosphere / orbital space reached
  activeOverdriveTime: number; // seconds remaining
  activeQuadLaserTime: number; // seconds remaining
  weather: WeatherPreset;
  cloudMoisture?: number;
  windSpeed?: number;
  windHeading?: number;
}

export interface EnemyEntity {
  id: string;
  type: 'drone' | 'ace' | 'mecha_striker' | 'stealth_bomber' | 'boss_apex';
  name: string;
  callsign?: string;
  position: { x: number; y: number; z: number };
  health: number;
  maxHealth: number;
  speed: number;
  isLocked: boolean;
  distanceToPlayer: number;
  isFiringMissile?: boolean;
  flaresDeployed?: boolean;
}

export interface RingEntity {
  id: string;
  position: { x: number; y: number; z: number };
  radius: number;
  passed: boolean;
}

export interface WorldSector {
  id: string;
  name: string;
  shortName: string;
  desc: string;
  x: number;
  z: number;
  color: string;
}

export interface GameSettings {
  invertPitch: boolean;
  mouseSensitivity: number; // 0.5 to 2.5
  soundVolume: number; // 0 to 1
  sfxVolume: number;
  cameraMode: CameraViewMode;
  difficulty: 'recruit' | 'ace' | 'veteran';
  timeOfDay: 'dawn' | 'daylight' | 'sunset' | 'night' | 'space' | 'cycle';
  weather: WeatherPreset;
}
