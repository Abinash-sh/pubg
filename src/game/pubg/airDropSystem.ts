import * as THREE from 'three';
import { AirDropPackage, GroundLoot } from '../../types/pubg';
import { pubgAudio } from './pubgAudio';

export class AirDropSystem {
  public scene: THREE.Scene;
  public airdrops: AirDropPackage[] = [];
  public airdropGroup = new THREE.Group();
  private dropTimer = 45; // Drops every 45s

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.airdropGroup);
  }

  /**
   * Spawns an incoming care package high above target coordinates
   */
  public spawnAirDrop(
    targetX: number,
    targetZ: number,
    getTerrainHeight: (x: number, z: number) => number
  ) {
    const landingY = getTerrainHeight(targetX, targetZ);
    const dropGroup = new THREE.Group();
    dropGroup.position.set(targetX, landingY + 120, targetZ);

    // 1. Red wooden crate with blue tarp
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 });
    const tarpMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.7 });

    const crateMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.0, 2.4), crateMat);
    crateMesh.castShadow = true;
    const tarpMesh = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.6, 2.45), tarpMat);
    tarpMesh.position.y = 0.8;
    dropGroup.add(crateMesh, tarpMesh);

    // 2. Parachute canopy
    const parachute = new THREE.Mesh(
      new THREE.SphereGeometry(4.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.2),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5, side: THREE.DoubleSide })
    );
    parachute.position.y = 6.0;
    dropGroup.add(parachute);

    // 3. Red smoke flare column (activated upon landing)
    const smokeGroup = new THREE.Group();
    smokeGroup.position.set(0, 1.2, 0);
    smokeGroup.visible = false;
    for (let i = 0; i < 12; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.8 + i * 0.25, 8, 6),
        new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.65 - i * 0.04,
        })
      );
      puff.position.set(
        (Math.random() - 0.5) * 0.5,
        i * 2.2,
        (Math.random() - 0.5) * 0.5
      );
      smokeGroup.add(puff);
    }
    dropGroup.add(smokeGroup);

    this.airdropGroup.add(dropGroup);

    // Legendary loot
    const legendaryLoot: GroundLoot[] = [
      {
        id: `airdrop_awm_${Date.now()}`,
        type: 'weapon',
        subType: 'AWM',
        name: 'AWM .300 Magnum Sniper Rifle',
        amount: 1,
        position: new THREE.Vector3(targetX + 1.2, landingY + 0.3, targetZ),
      },
      {
        id: `airdrop_ammo_${Date.now()}`,
        type: 'ammo',
        subType: '300Mag',
        name: '.300 Magnum Ammo Box',
        amount: 20,
        position: new THREE.Vector3(targetX - 1.2, landingY + 0.3, targetZ),
      },
      {
        id: `airdrop_helm_${Date.now()}`,
        type: 'helmet',
        subType: '3',
        name: 'Level 3 Spetsnaz Helmet',
        amount: 1,
        position: new THREE.Vector3(targetX, landingY + 0.3, targetZ + 1.2),
      },
      {
        id: `airdrop_vest_${Date.now()}`,
        type: 'armor_vest',
        subType: '3',
        name: 'Level 3 Military Vest',
        amount: 1,
        position: new THREE.Vector3(targetX, landingY + 0.3, targetZ - 1.2),
      },
    ];

    this.airdrops.push({
      id: `airdrop_${Date.now()}`,
      position: dropGroup.position,
      landingY,
      velocity: new THREE.Vector3(0, -9.0, 0),
      hasLanded: false,
      mesh: dropGroup,
      smokeMesh: smokeGroup,
      lootItems: legendaryLoot,
      looted: false,
    });
  }

  public update(
    deltaTime: number,
    getTerrainHeight: (x: number, z: number) => number,
    zoneCenter: THREE.Vector2,
    zoneRadius: number,
    onSpawnLoot: (loot: GroundLoot) => void
  ) {
    this.dropTimer -= deltaTime;
    if (this.dropTimer <= 0) {
      this.dropTimer = 65; // Next drop
      // Spawn near current zone
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * zoneRadius * 0.6;
      const targetX = zoneCenter.x + Math.cos(angle) * dist;
      const targetZ = zoneCenter.y + Math.sin(angle) * dist;
      this.spawnAirDrop(targetX, targetZ, getTerrainHeight);
    }

    this.airdrops.forEach((drop) => {
      if (!drop.hasLanded) {
        drop.position.add(drop.velocity.clone().multiplyScalar(deltaTime));

        if (drop.position.y <= drop.landingY + 1.0) {
          drop.position.y = drop.landingY + 1.0;
          drop.hasLanded = true;
          drop.smokeMesh.visible = true; // Ignite red flare smoke

          // Spawn ground loot
          drop.lootItems.forEach((item) => onSpawnLoot(item));
          pubgAudio.playExplosion(2.5); // Thud landing
        }
      } else {
        // Animate billowing red smoke
        drop.smokeMesh.rotation.y += deltaTime * 0.6;
      }
    });
  }
}
