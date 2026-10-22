import * as THREE from 'three';

export type WeaponType =
  | 'M416'
  | 'AKM'
  | 'SCAR_L'
  | 'AWM'
  | 'KAR98K'
  | 'M249'
  | 'VECTOR'
  | 'UMP45'
  | 'S12K'
  | 'DEAGLE'
  | 'P92'
  | 'FRAG_GRENADE'
  | 'SMOKE_GRENADE'
  | 'PAN';

export type AmmoType = '5.56mm' | '7.62mm' | '300Mag' | '12Gauge' | '9mm' | '45ACP' | '50AE';
export type WeaponSlot = 'primary' | 'secondary' | 'pistol' | 'throwable' | 'melee';
export type FireMode = 'AUTO' | 'SINGLE' | 'BURST';

export interface WeaponStats {
  id: WeaponType;
  name: string;
  category: 'AR' | 'SR' | 'LMG' | 'SMG' | 'SG' | 'HG' | 'THROWABLE' | 'MELEE';
  damage: number;
  fireRate: number; // shots per second
  ammoType: AmmoType;
  magSize: number;
  reloadTime: number; // seconds
  recoilVertical: number;
  recoilHorizontal: number;
  bulletSpeed: number; // m/s
  range: number;
  availableModes: FireMode[];
  pelletCount?: number; // for shotgun
}

export interface WeaponItem {
  id: string;
  type: WeaponType;
  stats: WeaponStats;
  currentAmmo: number;
  reserveAmmo: number;
  fireMode: FireMode;
}

export interface ArmorItem {
  level: 1 | 2 | 3;
  durability: number;
  maxDurability: number;
  damageReduction: number; // e.g. 0.3 for lvl 1, 0.4 for lvl 2, 0.55 for lvl 3
}

export interface InventoryMeds {
  firstAid: number;
  medkit: number;
  bandages: number;
  energyDrink: number;
  painkiller: number;
  adrenaline: number;
}

export interface GroundLoot {
  id: string;
  type: 'weapon' | 'ammo' | 'armor_vest' | 'helmet' | 'backpack' | 'meds' | 'throwable';
  subType: string;
  name: string;
  amount: number;
  position: THREE.Vector3;
  mesh?: THREE.Object3D;
  taken?: boolean;
}

export interface BlueZoneState {
  currentCenter: THREE.Vector2;
  currentRadius: number;
  nextCenter: THREE.Vector2;
  nextRadius: number;
  phase: number;
  totalPhases: number;
  timer: number;
  isShrinking: boolean;
  damagePerSec: number;
}

export interface KillFeedEntry {
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  isHeadshot: boolean;
  isPlayerKill: boolean;
  timestamp: number;
}

export interface BotCombatant {
  id: string;
  name: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  health: number;
  maxHealth: number;
  armorVest: ArmorItem | null;
  helmet: ArmorItem | null;
  weapon: WeaponItem;
  state: 'LANDING' | 'LOOTING' | 'PATROL' | 'MOVING_TO_ZONE' | 'ATTACKING' | 'TAKING_COVER' | 'DEAD';
  targetPos: THREE.Vector3;
  shootCooldown: number;
  accuracy: number;
  mesh: THREE.Group;
  parachuteMesh?: THREE.Group;
  isAlive: boolean;
  kills: number;
}

export interface AirDropPackage {
  id: string;
  position: THREE.Vector3;
  landingY: number;
  velocity: THREE.Vector3;
  hasLanded: boolean;
  mesh: THREE.Group;
  smokeMesh: THREE.Group;
  lootItems: GroundLoot[];
  looted: boolean;
}

export interface DrivableVehicle {
  id: string;
  type: 'buggy' | 'dacia';
  position: THREE.Vector3;
  rotation: THREE.Euler;
  speed: number;
  maxSpeed: number;
  health: number;
  maxHealth: number;
  fuel: number;
  occupied: boolean;
  mesh: THREE.Group;
  wheelMeshes: THREE.Object3D[];
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'weapon' | 'ammo' | 'armor' | 'meds' | 'tactical';
  subType: string;
  cost: number;
  description: string;
  statsPreview?: {
    damage: number;
    fireRate: number;
    range: number;
    magSize: number;
  };
}

export interface PlayerPUBGState {
  health: number;
  maxHealth: number;
  boost: number; // 0 to 100
  battlePoints: number; // BP Points to buy gear in tactical shop
  helmet: ArmorItem | null;
  vest: ArmorItem | null;
  backpackLevel: 1 | 2 | 3;
  ammo: Record<AmmoType, number>;
  meds: InventoryMeds;
  throwables: { frag: number; smoke: number };
  weapons: {
    primary: WeaponItem | null;
    secondary: WeaponItem | null;
    pistol: WeaponItem | null;
    throwable: WeaponItem | null;
    melee: WeaponItem | null;
  };
  activeSlot: WeaponSlot;
  isAiming: boolean; // ADS
  isReloading: boolean;
  reloadProgress: number; // 0 to 1
  isSprinting: boolean;
  isCrouching: boolean;
  isProne: boolean;
  isParachuting: boolean;
  isInVehicle: boolean;
  vehicleSpeed: number;
  kills: number;
  damageDealt: number;
  headshots: number;
  aliveCount: number;
  totalPlayers: number;
  position: THREE.Vector3;
  yaw: number;
  pitch: number;
  currentZone: BlueZoneState;
  distToSafeZone: number;
  isInSafeZone: boolean;
  isTakingZoneDamage: boolean;
  hitMarker: { type: 'body' | 'headshot' | 'kill'; time: number } | null;
  nearbyLoot: GroundLoot | null;
  nearbyVehicle: DrivableVehicle | null;
  nearbyAirdrop: AirDropPackage | null;
  isGameOver: boolean;
  isVictory: boolean;
}

export type PUBGWeather = 'clear_day' | 'sunset' | 'dense_fog' | 'rainy';
