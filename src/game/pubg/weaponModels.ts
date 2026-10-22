import * as THREE from 'three';
import { WeaponStats, WeaponType } from '../../types/pubg';

export const WEAPON_REGISTRY: Record<WeaponType, WeaponStats> = {
  M416: {
    id: 'M416',
    name: 'M416 5.56mm Assault Rifle',
    category: 'AR',
    damage: 41,
    fireRate: 11.5, // ~690 RPM
    ammoType: '5.56mm',
    magSize: 30,
    reloadTime: 2.1,
    recoilVertical: 0.036,
    recoilHorizontal: 0.015,
    bulletSpeed: 880,
    range: 450,
    availableModes: ['AUTO', 'SINGLE'],
  },
  AKM: {
    id: 'AKM',
    name: 'AKM 7.62mm Assault Rifle',
    category: 'AR',
    damage: 47,
    fireRate: 10.0, // ~600 RPM
    ammoType: '7.62mm',
    magSize: 30,
    reloadTime: 2.3,
    recoilVertical: 0.052,
    recoilHorizontal: 0.024,
    bulletSpeed: 715,
    range: 380,
    availableModes: ['AUTO', 'SINGLE'],
  },
  SCAR_L: {
    id: 'SCAR_L',
    name: 'SCAR-L 5.56mm Special Forces Rifle',
    category: 'AR',
    damage: 42,
    fireRate: 10.8,
    ammoType: '5.56mm',
    magSize: 30,
    reloadTime: 2.2,
    recoilVertical: 0.032,
    recoilHorizontal: 0.012,
    bulletSpeed: 870,
    range: 440,
    availableModes: ['AUTO', 'SINGLE'],
  },
  AWM: {
    id: 'AWM',
    name: 'AWM .300 Magnum Sniper Rifle',
    category: 'SR',
    damage: 105,
    fireRate: 0.8, // Bolt-action
    ammoType: '300Mag',
    magSize: 5,
    reloadTime: 3.2,
    recoilVertical: 0.09,
    recoilHorizontal: 0.01,
    bulletSpeed: 910,
    range: 850,
    availableModes: ['SINGLE'],
  },
  KAR98K: {
    id: 'KAR98K',
    name: 'Kar98k 7.62mm Vintage Sniper',
    category: 'SR',
    damage: 79,
    fireRate: 0.95,
    ammoType: '7.62mm',
    magSize: 5,
    reloadTime: 3.5,
    recoilVertical: 0.075,
    recoilHorizontal: 0.01,
    bulletSpeed: 760,
    range: 650,
    availableModes: ['SINGLE'],
  },
  M249: {
    id: 'M249',
    name: 'M249 5.56mm Squad Automatic Weapon',
    category: 'LMG',
    damage: 45,
    fireRate: 13.5, // ~800 RPM
    ammoType: '5.56mm',
    magSize: 100,
    reloadTime: 4.8,
    recoilVertical: 0.044,
    recoilHorizontal: 0.028,
    bulletSpeed: 915,
    range: 500,
    availableModes: ['AUTO'],
  },
  VECTOR: {
    id: 'VECTOR',
    name: 'KRISS Vector 9mm Submachine Gun',
    category: 'SMG',
    damage: 31,
    fireRate: 20.0, // 1200 RPM blazing shredder
    ammoType: '9mm',
    magSize: 19,
    reloadTime: 1.6,
    recoilVertical: 0.022,
    recoilHorizontal: 0.018,
    bulletSpeed: 400,
    range: 160,
    availableModes: ['AUTO', 'BURST', 'SINGLE'],
  },
  UMP45: {
    id: 'UMP45',
    name: 'UMP45 .45 ACP Tactical SMG',
    category: 'SMG',
    damage: 38,
    fireRate: 11.0,
    ammoType: '45ACP',
    magSize: 25,
    reloadTime: 1.9,
    recoilVertical: 0.026,
    recoilHorizontal: 0.014,
    bulletSpeed: 360,
    range: 220,
    availableModes: ['AUTO', 'SINGLE'],
  },
  S12K: {
    id: 'S12K',
    name: 'S12K 12-Gauge Tactical Shotgun',
    category: 'SG',
    damage: 24, // Per pellet
    pelletCount: 9,
    fireRate: 3.2,
    ammoType: '12Gauge',
    magSize: 5,
    reloadTime: 2.5,
    recoilVertical: 0.08,
    recoilHorizontal: 0.04,
    bulletSpeed: 350,
    range: 80,
    availableModes: ['SINGLE'],
  },
  DEAGLE: {
    id: 'DEAGLE',
    name: 'Desert Eagle .50 AE Hand Cannon',
    category: 'HG',
    damage: 62,
    fireRate: 4.0,
    ammoType: '50AE',
    magSize: 7,
    reloadTime: 2.0,
    recoilVertical: 0.065,
    recoilHorizontal: 0.02,
    bulletSpeed: 470,
    range: 150,
    availableModes: ['SINGLE'],
  },
  P92: {
    id: 'P92',
    name: 'P92 9mm Tactical Pistol',
    category: 'HG',
    damage: 35,
    fireRate: 5.5,
    ammoType: '9mm',
    magSize: 15,
    reloadTime: 1.8,
    recoilVertical: 0.022,
    recoilHorizontal: 0.01,
    bulletSpeed: 380,
    range: 120,
    availableModes: ['SINGLE'],
  },
  FRAG_GRENADE: {
    id: 'FRAG_GRENADE',
    name: 'M67 Frag Grenade',
    category: 'THROWABLE',
    damage: 100,
    fireRate: 0.5,
    ammoType: '9mm',
    magSize: 1,
    reloadTime: 1.0,
    recoilVertical: 0,
    recoilHorizontal: 0,
    bulletSpeed: 30,
    range: 60,
    availableModes: ['SINGLE'],
  },
  SMOKE_GRENADE: {
    id: 'SMOKE_GRENADE',
    name: 'M18 Tactical Smoke Grenade',
    category: 'THROWABLE',
    damage: 0,
    fireRate: 0.5,
    ammoType: '9mm',
    magSize: 1,
    reloadTime: 1.0,
    recoilVertical: 0,
    recoilHorizontal: 0,
    bulletSpeed: 30,
    range: 60,
    availableModes: ['SINGLE'],
  },
  PAN: {
    id: 'PAN',
    name: 'Cast Iron Frying Pan',
    category: 'MELEE',
    damage: 80,
    fireRate: 1.5,
    ammoType: '9mm',
    magSize: 1,
    reloadTime: 0.1,
    recoilVertical: 0,
    recoilHorizontal: 0,
    bulletSpeed: 0,
    range: 2.5,
    availableModes: ['SINGLE'],
  },
};

/**
 * Realistic Materials for Weapons
 */
const gunMetalMat = new THREE.MeshStandardMaterial({
  color: 0x181a1f,
  roughness: 0.28,
  metalness: 0.9,
});

const darkCompositeMat = new THREE.MeshStandardMaterial({
  color: 0x111317,
  roughness: 0.65,
  metalness: 0.15,
});

const tanDesertMat = new THREE.MeshStandardMaterial({
  color: 0x937c56, // Flat Dark Earth (SCAR-L)
  roughness: 0.55,
  metalness: 0.2,
});

const akmWoodMat = new THREE.MeshStandardMaterial({
  color: 0x663319,
  roughness: 0.5,
  metalness: 0.05,
});

const kar98WalnutMat = new THREE.MeshStandardMaterial({
  color: 0x4a2a16,
  roughness: 0.45,
  metalness: 0.08,
});

const awmGreenMat = new THREE.MeshStandardMaterial({
  color: 0x273524,
  roughness: 0.45,
  metalness: 0.25,
});

const chromeSilverMat = new THREE.MeshStandardMaterial({
  color: 0xd1d5db,
  roughness: 0.15,
  metalness: 0.95,
});

const brassAmmoMat = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  roughness: 0.25,
  metalness: 0.9,
});

const scopeGlassMat = new THREE.MeshPhysicalMaterial({
  color: 0x0f172a,
  roughness: 0.04,
  transmission: 0.95,
  ior: 1.52,
  transparent: true,
  opacity: 0.88,
});

/**
 * Builds realistic 3D Gun meshes with authentic silhouetting, picatinny rails, sights, and attachments
 */
export function buildWeaponMesh(type: WeaponType): THREE.Group {
  const group = new THREE.Group();

  switch (type) {
    case 'M416': {
      // Receiver & upper rail
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.46), gunMetalMat);
      receiver.castShadow = true;
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.5), darkCompositeMat);
      topRail.position.y = 0.06;
      group.add(receiver, topRail);

      // Fluted barrel & birdcage flash hider
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.38, 10), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.015, -0.42);
      const hider = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.08, 10), gunMetalMat);
      hider.rotation.x = Math.PI / 2;
      hider.position.set(0, 0.015, -0.62);
      group.add(barrel, hider);

      // Quad-rail handguard with vertical grip
      const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.3), darkCompositeMat);
      handguard.position.set(0, 0.02, -0.27);
      const vertGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.12, 8), darkCompositeMat);
      vertGrip.position.set(0, -0.08, -0.3);
      group.add(handguard, vertGrip);

      // Crane tactical adjustable stock
      const bufferTube = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 8), gunMetalMat);
      bufferTube.rotation.x = Math.PI / 2;
      bufferTube.position.set(0, 0.02, 0.3);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.18), darkCompositeMat);
      stock.position.set(0, 0, 0.35);
      group.add(bufferTube, stock);

      // Ergonomic pistol grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.06), darkCompositeMat);
      grip.position.set(0, -0.11, 0.09);
      grip.rotation.x = -0.32;
      group.add(grip);

      // PMAG 30-round magazine with grip ribs
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.08), darkCompositeMat);
      mag.position.set(0, -0.15, -0.09);
      mag.rotation.x = 0.18;
      group.add(mag);

      // Holographic Sight
      const holoBody = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.055, 0.12), darkCompositeMat);
      holoBody.position.set(0, 0.095, -0.04);
      const holoHood = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.005, 8, 16), gunMetalMat);
      holoHood.position.set(0, 0.12, -0.04);
      group.add(holoBody, holoHood);
      break;
    }

    case 'SCAR_L': {
      // Tan FDE monolithic upper receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.11, 0.48), tanDesertMat);
      receiver.castShadow = true;
      group.add(receiver);

      // Barrel & 3-prong flash hider
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.36, 10), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.42);
      const hider = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 8), gunMetalMat);
      hider.rotation.x = Math.PI / 2;
      hider.position.set(0, 0.02, -0.61);
      group.add(barrel, hider);

      // Characteristic SCAR UGG-boot folding stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.15, 0.24), tanDesertMat);
      stock.position.set(0, 0.01, 0.35);
      const cheekRest = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.12), darkCompositeMat);
      cheekRest.position.set(0, 0.09, 0.32);
      group.add(stock, cheekRest);

      // Grip & Tan Magazine
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.13, 0.06), tanDesertMat);
      grip.position.set(0, -0.1, 0.1);
      grip.rotation.x = -0.3;
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.075), tanDesertMat);
      mag.position.set(0, -0.14, -0.08);
      mag.rotation.x = 0.16;
      group.add(grip, mag);

      // Red Dot Sight
      const redDot = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 12), darkCompositeMat);
      redDot.rotation.x = Math.PI / 2;
      redDot.position.set(0, 0.1, -0.04);
      group.add(redDot);
      break;
    }

    case 'AKM': {
      // Stamped steel receiver with bolt carrier
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.095, 0.44), gunMetalMat);
      group.add(receiver);

      // Wooden Stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.12, 0.28), akmWoodMat);
      stock.position.set(0, -0.02, 0.34);
      group.add(stock);

      // Wooden Handguard
      const handguard = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.038, 0.24, 10), akmWoodMat);
      handguard.rotation.x = Math.PI / 2;
      handguard.position.set(0, 0.015, -0.24);
      group.add(handguard);

      // Barrel & Slanted Muzzle Brake
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 8), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.015, -0.44);
      const brake = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.06, 8), gunMetalMat);
      brake.rotation.x = -Math.PI / 2;
      brake.position.set(0, 0.015, -0.67);
      group.add(barrel, brake);

      // Curved 7.62 orange/steel banana magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.23, 0.085), gunMetalMat);
      mag.position.set(0, -0.15, -0.07);
      mag.rotation.x = 0.34;
      group.add(mag);

      // Bakelite grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.05), akmWoodMat);
      grip.position.set(0, -0.1, 0.1);
      grip.rotation.x = -0.32;
      group.add(grip);
      break;
    }

    case 'AWM': {
      // Olive Drab military chassis
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.095, 0.58), awmGreenMat);
      group.add(chassis);

      // Skeleton thumbhole stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.14, 0.36), awmGreenMat);
      stock.position.set(0, -0.02, 0.43);
      group.add(stock);

      // Heavy fluted match barrel
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.7, 12), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.62);
      const muzzleBrake = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.11), gunMetalMat);
      muzzleBrake.position.set(0, 0.02, -0.98);
      group.add(barrel, muzzleBrake);

      // Massive 8x Sniper Scope
      const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.042, 0.32, 16), gunMetalMat);
      scopeBody.rotation.x = Math.PI / 2;
      scopeBody.position.set(0, 0.11, -0.06);
      const scopeLens = new THREE.Mesh(new THREE.CircleGeometry(0.032, 16), scopeGlassMat);
      scopeLens.position.set(0, 0.11, -0.22);
      group.add(scopeBody, scopeLens);

      // Bolt Action handle
      const boltHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.1, 8), gunMetalMat);
      boltHandle.position.set(0.055, 0.07, 0.08);
      boltHandle.rotation.z = Math.PI / 3.5;
      group.add(boltHandle);

      // Folding Bipod
      const bipodL = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6), gunMetalMat);
      bipodL.position.set(-0.04, -0.08, -0.45);
      bipodL.rotation.z = -0.3;
      const bipodR = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6), gunMetalMat);
      bipodR.position.set(0.04, -0.08, -0.45);
      bipodR.rotation.z = 0.3;
      group.add(bipodL, bipodR);
      break;
    }

    case 'KAR98K': {
      // Solid dark walnut one-piece wood stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.82), kar98WalnutMat);
      stock.position.set(0, -0.01, 0.08);
      group.add(stock);

      // Slender steel barrel with bayonet lug & front sight hood
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.015, 0.72, 8), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.46);
      const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.025, 0.02), gunMetalMat);
      frontSight.position.set(0, 0.04, -0.81);
      group.add(barrel, frontSight);

      // Turned down bolt handle
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6), gunMetalMat);
      bolt.position.set(0.04, 0.03, 0.1);
      bolt.rotation.z = Math.PI / 2.5;
      group.add(bolt);

      // 4x Vintage Optic Scope
      const vintageScope = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.25, 12), gunMetalMat);
      vintageScope.rotation.x = Math.PI / 2;
      vintageScope.position.set(0, 0.08, -0.02);
      group.add(vintageScope);
      break;
    }

    case 'M249': {
      // Heavy SAW receiver & heat shield
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.13, 0.54), gunMetalMat);
      const heatShield = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 10), darkCompositeMat);
      heatShield.rotation.x = Math.PI / 2;
      heatShield.position.set(0, 0.04, -0.32);
      group.add(receiver, heatShield);

      // Heavy barrel with carry handle
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.44, 8), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.52);
      const carryHandle = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 12, Math.PI), gunMetalMat);
      carryHandle.position.set(0.04, 0.11, -0.2);
      group.add(barrel, carryHandle);

      // Huge 100-round green ammo drum box
      const drumBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.16, 0.16),
        new THREE.MeshStandardMaterial({ color: 0x3b5323, roughness: 0.6 })
      );
      drumBox.position.set(0, -0.16, -0.08);
      group.add(drumBox);

      // Fixed steel stock & folding bipod
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.28), gunMetalMat);
      stock.position.set(0, 0, 0.4);
      group.add(stock);
      break;
    }

    case 'VECTOR': {
      // Super V distinct angular compact receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.16, 0.32), darkCompositeMat);
      group.add(receiver);

      // Short stubby barrel & mock suppressor
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 10), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.05, -0.22);
      group.add(barrel);

      // Extended 9mm stick mag
      const stickMag = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.24, 0.045), darkCompositeMat);
      stickMag.position.set(0, -0.14, -0.04);
      stickMag.rotation.x = 0.1;
      group.add(stickMag);

      // Folding stock & holo sight
      const foldStock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.2), darkCompositeMat);
      foldStock.position.set(0, 0.04, 0.24);
      const holo = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, 0.1), gunMetalMat);
      holo.position.set(0, 0.11, -0.02);
      group.add(foldStock, holo);
      break;
    }

    case 'UMP45': {
      // Modern SMG frame
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.11, 0.38), darkCompositeMat);
      group.add(receiver);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.24, 8), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.3);
      group.add(barrel);

      // Straight .45 ACP box magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.22, 0.05), darkCompositeMat);
      mag.position.set(0, -0.14, -0.08);
      mag.rotation.x = 0.08;
      group.add(mag);

      // Skeletal folding stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.11, 0.22), darkCompositeMat);
      stock.position.set(0, 0.02, 0.28);
      group.add(stock);
      break;
    }

    case 'S12K': {
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.44), darkCompositeMat);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.46, 10), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.03, -0.42);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.08), darkCompositeMat);
      mag.position.set(0, -0.14, -0.06);
      group.add(receiver, barrel, mag);
      break;
    }

    case 'DEAGLE': {
      // Heavy silver slide with serrations & .50 AE muzzle
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.065, 0.26), chromeSilverMat);
      slide.position.set(0, 0.02, -0.04);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), gunMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.2);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.14, 0.08), darkCompositeMat);
      grip.position.set(0, -0.07, 0.04);
      grip.rotation.x = -0.22;
      group.add(slide, barrel, grip);
      break;
    }

    case 'P92': {
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.2), gunMetalMat);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.11, 0.06), darkCompositeMat);
      grip.position.set(0, -0.07, 0.05);
      grip.rotation.x = -0.25;
      group.add(slide, grip);
      break;
    }

    case 'FRAG_GRENADE': {
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.048, 14, 12),
        new THREE.MeshStandardMaterial({ color: 0x3d4734, roughness: 0.6 })
      );
      const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04), gunMetalMat);
      fuse.position.y = 0.05;
      const lever = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.06, 0.02), gunMetalMat);
      lever.position.set(0.025, 0.04, 0);
      group.add(body, fuse, lever);
      break;
    }

    case 'SMOKE_GRENADE': {
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.042, 0.14, 12),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 })
      );
      const yellowBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.043, 0.043, 0.03, 12),
        new THREE.MeshBasicMaterial({ color: 0xeab308 })
      );
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.03), gunMetalMat);
      cap.position.y = 0.08;
      group.add(body, yellowBand, cap);
      break;
    }

    case 'PAN': {
      const panMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.12, 0.04, 20),
        new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.35, metalness: 0.9 })
      );
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.24, 8), darkCompositeMat);
      handle.rotation.x = Math.PI / 2;
      handle.position.set(0, 0, 0.24);
      group.add(panMesh, handle);
      break;
    }
  }

  group.scale.set(1.4, 1.4, 1.4);
  return group;
}

/**
 * Builds realistic 3D ground loot meshes
 */
export function buildGroundLootMesh(type: string, subType: string): THREE.Group {
  const group = new THREE.Group();

  if (type === 'weapon') {
    const gun = buildWeaponMesh(subType as WeaponType);
    gun.rotation.x = Math.PI / 2;
    group.add(gun);
  } else if (type === 'ammo') {
    let color = 0x2e7d32; // green 5.56
    if (subType === '7.62mm') color = 0xd97706; // amber
    if (subType === '300Mag') color = 0x854d0e; // dark gold
    if (subType === '12Gauge') color = 0xdc2626; // red
    if (subType === '45ACP') color = 0x2563eb; // blue
    if (subType === '50AE') color = 0x7c3aed; // purple
    if (subType === '9mm') color = 0x059669; // emerald

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.16, 0.34),
      new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.5 })
    );
    group.add(box);
  } else if (type === 'helmet') {
    const helmMat = new THREE.MeshStandardMaterial({
      color: subType === '3' ? 0x1e293b : subType === '2' ? 0x3f3f46 : 0x57534e,
      roughness: 0.5,
      metalness: subType === '3' ? 0.8 : 0.2,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), helmMat);
    group.add(dome);

    if (subType === '3') {
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, 0.04), gunMetalMat);
      visor.position.set(0, 0.06, 0.16);
      group.add(visor);
    }
  } else if (type === 'armor_vest') {
    const vest = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.45, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.8 })
    );
    group.add(vest);
  } else if (type === 'backpack') {
    const pack = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.42, 0.26),
      new THREE.MeshStandardMaterial({
        color: subType === '3' ? 0x27272a : 0x44403c,
        roughness: 0.85,
      })
    );
    group.add(pack);
  } else if (type === 'meds') {
    if (subType === 'energyDrink') {
      const can = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.24, 12),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.8 })
      );
      group.add(can);
    } else if (subType === 'adrenaline') {
      const syringe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, metalness: 0.7 })
      );
      group.add(syringe);
    } else {
      const kit = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.22, 0.16),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
      );
      const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.05, 0.17),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.16, 0.17),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      group.add(kit, crossH, crossV);
    }
  }

  // Floating glow ring below loot
  const ringGeo = new THREE.RingGeometry(0.25, 0.35, 16);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: type === 'weapon' ? 0xf59e0b : type === 'meds' ? 0x10b981 : 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = -0.15;
  group.add(ring);

  return group;
}
