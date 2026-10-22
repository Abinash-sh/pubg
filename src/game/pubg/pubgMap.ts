import * as THREE from 'three';
import { GroundLoot, WeaponType } from '../../types/pubg';
import { buildGroundLootMesh } from './weaponModels';

export interface MapObstacle {
  box: THREE.Box3;
  type: 'building' | 'rock' | 'tree' | 'crate';
}

export class PubgMap {
  public scene: THREE.Scene;
  public terrainMesh!: THREE.Mesh;
  public obstacles: MapObstacle[] = [];
  public groundLoots: GroundLoot[] = [];
  public lootMeshesGroup = new THREE.Group();
  public buildingsGroup = new THREE.Group();
  public foliageGroup = new THREE.Group();
  public buyStations: { id: string; position: THREE.Vector3; name: string; mesh: THREE.Group }[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.buildingsGroup);
    this.scene.add(this.foliageGroup);
    this.scene.add(this.lootMeshesGroup);

    this.createTerrain();
    this.createPochinkiTown();
    this.createMilitaryBase();
    this.createIndustrialWarehouses();
    this.createRuinsBunkers();
    this.createRoadsAndFoliage();
    this.createBuyStations();
    this.seedGroundLoot();
  }

  /**
   * Procedural terrain height function
   */
  public getTerrainHeight(x: number, z: number): number {
    // Distance from center
    const dist = Math.sqrt(x * x + z * z);
    if (dist > 650) {
      // Slopes down into ocean
      const oceanDrop = Math.max(0, (dist - 650) * 0.15);
      return Math.max(-10, 0 - oceanDrop);
    }

    // Rolling hills
    const h1 = Math.sin(x * 0.007) * Math.cos(z * 0.007) * 16;
    const h2 = Math.sin(x * 0.018 + 1.2) * Math.cos(z * 0.015) * 8;
    const h3 = Math.sin((x + z) * 0.035) * 3;

    // Flatten town & military areas
    const pochinkiDist = Math.hypot(x - 10, z - 10);
    const militaryDist = Math.hypot(x - 300, z + 120);
    let height = Math.max(1.5, h1 + h2 + h3 + 6);

    if (pochinkiDist < 160) {
      const blend = Math.min(1, pochinkiDist / 160);
      height = height * blend + 4.0 * (1 - blend);
    }
    if (militaryDist < 180) {
      const blend = Math.min(1, militaryDist / 180);
      height = height * blend + 3.0 * (1 - blend);
    }

    return height;
  }

  private createTerrain() {
    const size = 1400;
    const segments = 128;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, this.getTerrainHeight(x, z));
    }
    geo.computeVertexNormals();

    // Procedural satellite & terrain texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Grass base
      ctx.fillStyle = '#3a4e28';
      ctx.fillRect(0, 0, 1024, 1024);

      // Farmland crop patchwork
      for (let i = 0; i < 40; i++) {
        const fx = Math.random() * 900;
        const fy = Math.random() * 900;
        const fw = 60 + Math.random() * 120;
        const fh = 50 + Math.random() * 100;
        const colors = ['#495e34', '#53683a', '#746738', '#5c643b', '#6d5a32'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(fx, fy, fw, fh);
      }

      // Asphalt roads
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(512, 512, 280, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(100, 512);
      ctx.lineTo(924, 512);
      ctx.moveTo(512, 100);
      ctx.lineTo(512, 924);
      ctx.stroke();

      // Yellow centerline
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.arc(512, 512, 280, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    const terrainMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.85,
      metalness: 0.1,
    });

    this.terrainMesh = new THREE.Mesh(geo, terrainMat);
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);

    // Ocean plane around the island
    const waterGeo = new THREE.PlaneGeometry(3000, 3000);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0f2d4a,
      roughness: 0.15,
      metalness: 0.8,
      transparent: true,
      opacity: 0.88,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = 0;
    this.scene.add(waterMesh);
  }

  /**
   * Pochinki Town: residential buildings with enterable rooms and roofs
   */
  private createPochinkiTown() {
    const buildingCoords = [
      { x: -40, z: -30, rot: 0, stories: 2 },
      { x: 30, z: -25, rot: 0.2, stories: 2 },
      { x: -60, z: 35, rot: -0.1, stories: 1 },
      { x: 10, z: 40, rot: 0.4, stories: 2 },
      { x: 75, z: 15, rot: -0.3, stories: 2 },
      { x: -20, z: 90, rot: 0.1, stories: 1 },
      { x: 50, z: 85, rot: 0, stories: 2 },
      { x: -80, z: -70, rot: 0.3, stories: 2 },
      { x: 20, z: -80, rot: -0.2, stories: 2 },
    ];

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xc8bc9e, roughness: 0.9 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8a3324, roughness: 0.7 });
    const woodFloorMat = new THREE.MeshStandardMaterial({ color: 0x5a4430, roughness: 0.8 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });

    buildingCoords.forEach(({ x, z, rot, stories }) => {
      const y = this.getTerrainHeight(x, z);
      const bGroup = new THREE.Group();
      bGroup.position.set(x, y, z);
      bGroup.rotation.y = rot;

      const width = 12;
      const length = 16;
      const storyH = 3.8;
      const totalH = stories * storyH;

      // Floor slab
      const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.4, length), woodFloorMat);
      floor.position.y = 0.2;
      floor.receiveShadow = true;
      bGroup.add(floor);

      // Outer walls with doorway and window openings
      // North Wall
      const wallN = new THREE.Mesh(new THREE.BoxGeometry(width, totalH, 0.4), wallMat);
      wallN.position.set(0, totalH / 2, -length / 2);
      wallN.castShadow = true;
      wallN.receiveShadow = true;

      // South Wall with door gap
      const wallSL = new THREE.Mesh(new THREE.BoxGeometry(4.5, totalH, 0.4), wallMat);
      wallSL.position.set(-3.75, totalH / 2, length / 2);
      const wallSR = new THREE.Mesh(new THREE.BoxGeometry(4.5, totalH, 0.4), wallMat);
      wallSR.position.set(3.75, totalH / 2, length / 2);

      // East & West Walls
      const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.4, totalH, length), wallMat);
      wallE.position.set(width / 2, totalH / 2, 0);
      const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.4, totalH, length), wallMat);
      wallW.position.set(-width / 2, totalH / 2, 0);

      bGroup.add(wallN, wallSL, wallSR, wallE, wallW);

      // Slanted Gable Roof
      const roofPeak = new THREE.Mesh(
        new THREE.ConeGeometry(Math.hypot(width, length) / 1.6, 3.2, 4),
        roofMat
      );
      roofPeak.position.set(0, totalH + 1.6, 0);
      roofPeak.rotation.y = Math.PI / 4;
      roofPeak.castShadow = true;
      bGroup.add(roofPeak);

      // Balcony / lookout trim
      const balcony = new THREE.Mesh(new THREE.BoxGeometry(4, 1.0, 2), trimMat);
      balcony.position.set(0, storyH, length / 2 + 1);
      bGroup.add(balcony);

      this.buildingsGroup.add(bGroup);

      // Register bounding box for cover & collision
      const box = new THREE.Box3();
      box.setFromCenterAndSize(
        new THREE.Vector3(x, y + totalH / 2, z),
        new THREE.Vector3(width + 0.5, totalH, length + 0.5)
      );
      this.obstacles.push({ box, type: 'building' });
    });
  }

  /**
   * Military Base: Hangars, radar tower, shipping containers
   */
  private createMilitaryBase() {
    const baseX = 300;
    const baseZ = -120;
    const baseY = this.getTerrainHeight(baseX, baseZ);

    // 1. Aircraft Hangar (Curved corrugated metal arch)
    const hangarGeo = new THREE.CylinderGeometry(14, 14, 40, 24, 1, false, 0, Math.PI);
    hangarGeo.rotateZ(Math.PI / 2);
    const hangarMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
      metalness: 0.6,
      side: THREE.DoubleSide,
    });
    const hangar = new THREE.Mesh(hangarGeo, hangarMat);
    hangar.position.set(baseX, baseY, baseZ);
    hangar.castShadow = true;
    hangar.receiveShadow = true;
    this.buildingsGroup.add(hangar);

    const hangarBox = new THREE.Box3();
    hangarBox.setFromCenterAndSize(
      new THREE.Vector3(baseX, baseY + 7, baseZ),
      new THREE.Vector3(42, 14, 28)
    );
    this.obstacles.push({ box: hangarBox, type: 'building' });

    // 2. High Radar Dish Tower
    const towerH = 26;
    const towerPylons = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 4, towerH, 6),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 })
    );
    towerPylons.position.set(baseX + 50, baseY + towerH / 2, baseZ + 30);
    this.buildingsGroup.add(towerPylons);

    // Dish
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.5),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.2 })
    );
    dish.position.set(baseX + 50, baseY + towerH + 2, baseZ + 30);
    dish.rotation.x = Math.PI / 3;
    this.buildingsGroup.add(dish);

    // 3. Shipping Containers maze
    const containerColors = [0x1e3a8a, 0xb91c1c, 0x047857, 0xb45309];
    for (let i = 0; i < 14; i++) {
      const cx = baseX - 40 + (i % 4) * 16 + (Math.random() * 4 - 2);
      const cz = baseZ - 40 + Math.floor(i / 4) * 18;
      const cy = this.getTerrainHeight(cx, cz);
      const cMat = new THREE.MeshStandardMaterial({
        color: containerColors[i % containerColors.length],
        roughness: 0.4,
        metalness: 0.6,
      });
      const cMesh = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.2, 12), cMat);
      cMesh.position.set(cx, cy + 1.6, cz);
      cMesh.rotation.y = (i % 2 === 0 ? 0 : Math.PI / 2) + Math.random() * 0.1;
      cMesh.castShadow = true;
      this.buildingsGroup.add(cMesh);

      const cBox = new THREE.Box3();
      cBox.setFromCenterAndSize(new THREE.Vector3(cx, cy + 1.6, cz), new THREE.Vector3(7, 3.5, 12.5));
      this.obstacles.push({ box: cBox, type: 'crate' });
    }
  }

  /**
   * Industrial Warehouses District
   */
  private createIndustrialWarehouses() {
    const whCoords = [
      { x: -280, z: 220 },
      { x: -240, z: 260 },
      { x: -320, z: 240 },
    ];

    const whMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.6, metalness: 0.4 });
    const rustRoof = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 });

    whCoords.forEach(({ x, z }) => {
      const y = this.getTerrainHeight(x, z);
      const wh = new THREE.Group();
      wh.position.set(x, y, z);

      const main = new THREE.Mesh(new THREE.BoxGeometry(22, 7.5, 30), whMat);
      main.position.y = 3.75;
      main.castShadow = true;

      const roof = new THREE.Mesh(new THREE.ConeGeometry(24, 4.5, 4), rustRoof);
      roof.position.y = 9.5;
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(0.9, 1, 1.25);
      wh.add(main, roof);

      this.buildingsGroup.add(wh);

      const box = new THREE.Box3();
      box.setFromCenterAndSize(new THREE.Vector3(x, y + 4, z), new THREE.Vector3(23, 8, 31));
      this.obstacles.push({ box, type: 'building' });
    });
  }

  /**
   * Ruins & Stone Bunkers
   */
  private createRuinsBunkers() {
    const rx = -150;
    const rz = -220;
    const ry = this.getTerrainHeight(rx, rz);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.95 });

    // Pillbox concrete bunker
    const bunker = new THREE.Mesh(new THREE.CylinderGeometry(8, 9, 3.6, 8), stoneMat);
    bunker.position.set(rx, ry + 1.8, rz);
    bunker.castShadow = true;
    this.buildingsGroup.add(bunker);

    const bBox = new THREE.Box3();
    bBox.setFromCenterAndSize(new THREE.Vector3(rx, ry + 1.8, rz), new THREE.Vector3(17, 4, 17));
    this.obstacles.push({ box: bBox, type: 'building' });

    // Ancient stone pillars & arches
    for (let i = 0; i < 6; i++) {
      const px = rx + Math.cos(i) * 18;
      const pz = rz + Math.sin(i) * 18;
      const py = this.getTerrainHeight(px, pz);
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 6, 8), stoneMat);
      pillar.position.set(px, py + 3, pz);
      pillar.castShadow = true;
      this.buildingsGroup.add(pillar);
    }
  }

  /**
   * Trees, boulders, and haybales across the map
   */
  private createRoadsAndFoliage() {
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.85 });

    // Distribute 180 cover trees
    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 520;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Avoid placing right in center of town
      if (Math.hypot(x, z) < 60) continue;

      const y = this.getTerrainHeight(x, z);
      if (y < 1.0) continue; // In water

      const tree = new THREE.Group();
      tree.position.set(x, y, z);

      // Trunk
      const trunkH = 2.5 + Math.random() * 1.5;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, trunkH, 7), trunkMat);
      trunk.position.y = trunkH / 2;
      trunk.castShadow = true;
      tree.add(trunk);

      // Conical foliage layers
      const foliageH = 5 + Math.random() * 3;
      const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.4, foliageH * 0.6, 7), pineMat);
      cone1.position.y = trunkH + foliageH * 0.3;
      cone1.castShadow = true;

      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.8, foliageH * 0.5, 7), pineMat);
      cone2.position.y = trunkH + foliageH * 0.55;
      cone2.castShadow = true;

      tree.add(cone1, cone2);
      this.foliageGroup.add(tree);

      const treeBox = new THREE.Box3();
      treeBox.setFromCenterAndSize(new THREE.Vector3(x, y + trunkH / 2, z), new THREE.Vector3(1.2, trunkH, 1.2));
      this.obstacles.push({ box: treeBox, type: 'tree' });
    }

    // 80 Cover Boulders / Rocks
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 500;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = this.getTerrainHeight(x, z);

      if (y < 1.0) continue;

      const scale = 1.2 + Math.random() * 2.2;
      const rockGeo = new THREE.DodecahedronGeometry(scale, 1);
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(x, y + scale * 0.6, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.foliageGroup.add(rock);

      const rockBox = new THREE.Box3();
      rockBox.setFromCenterAndSize(
        new THREE.Vector3(x, y + scale * 0.6, z),
        new THREE.Vector3(scale * 1.8, scale * 1.5, scale * 1.8)
      );
      this.obstacles.push({ box: rockBox, type: 'rock' });
    }
  }

  /**
   * Tactical Buy Stations / Black Market Terminals
   */
  public createBuyStations() {
    const locations = [
      { id: 'buy_pochinki', name: 'Pochinki Tactical Station', x: 10, z: 10 },
      { id: 'buy_military', name: 'Military Armory Kiosk', x: 280, z: -120 },
      { id: 'buy_warehouse', name: 'Warehouse Black Market', x: -260, z: 230 },
      { id: 'buy_ruins', name: 'Ruins Supply Terminal', x: -150, z: -220 },
    ];

    const kioskMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.8 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true });

    locations.forEach((loc) => {
      const y = this.getTerrainHeight(loc.x, loc.z);
      const group = new THREE.Group();
      group.position.set(loc.x, y, loc.z);

      // Terminal Base Stand
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.9), kioskMat);
      base.position.y = 0.6;
      base.castShadow = true;

      // Holographic Screen
      const screen = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.05), screenMat);
      screen.position.set(0, 1.45, 0.1);
      screen.rotation.x = -0.25;

      // Top floating beacon diamond
      const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), beaconMat);
      beacon.position.set(0, 2.3, 0);

      group.add(base, screen, beacon);
      this.buildingsGroup.add(group);

      this.buyStations.push({
        id: loc.id,
        name: loc.name,
        position: new THREE.Vector3(loc.x, y, loc.z),
        mesh: group,
      });

      const box = new THREE.Box3();
      box.setFromCenterAndSize(new THREE.Vector3(loc.x, y + 0.8, loc.z), new THREE.Vector3(1.8, 1.6, 1.1));
      this.obstacles.push({ box, type: 'crate' });
    });
  }

  /**
   * Seeds tactical ground loot across compounds and buildings
   */
  private seedGroundLoot() {
    const weapons: WeaponType[] = [
      'M416',
      'AKM',
      'SCAR_L',
      'AWM',
      'KAR98K',
      'M249',
      'VECTOR',
      'UMP45',
      'S12K',
      'DEAGLE',
      'P92',
      'FRAG_GRENADE',
      'SMOKE_GRENADE',
      'PAN',
    ];
    const lootSpawnPoints: { x: number; z: number }[] = [];

    // Around town houses
    for (let i = 0; i < 45; i++) {
      lootSpawnPoints.push({
        x: -90 + Math.random() * 180,
        z: -90 + Math.random() * 180,
      });
    }

    // Around military base
    for (let i = 0; i < 35; i++) {
      lootSpawnPoints.push({
        x: 240 + Math.random() * 130,
        z: -180 + Math.random() * 110,
      });
    }

    // Industrial warehouses
    for (let i = 0; i < 25; i++) {
      lootSpawnPoints.push({
        x: -330 + Math.random() * 110,
        z: 200 + Math.random() * 90,
      });
    }

    // Ruins
    for (let i = 0; i < 20; i++) {
      lootSpawnPoints.push({
        x: -180 + Math.random() * 80,
        z: -250 + Math.random() * 70,
      });
    }

    lootSpawnPoints.forEach((pt, index) => {
      const y = this.getTerrainHeight(pt.x, pt.z) + 0.35;
      const roll = Math.random();

      let lootItem: GroundLoot;

      if (roll < 0.35) {
        // Weapon
        const wType = weapons[Math.floor(Math.random() * weapons.length)];
        lootItem = {
          id: `loot_w_${index}`,
          type: 'weapon',
          subType: wType,
          name: wType,
          amount: 1,
          position: new THREE.Vector3(pt.x, y, pt.z),
        };
      } else if (roll < 0.6) {
        // Ammo
        const ammoTypes = ['5.56mm', '7.62mm', '300Mag', '12Gauge', '9mm', '45ACP', '50AE'];
        const sub = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
        lootItem = {
          id: `loot_ammo_${index}`,
          type: 'ammo',
          subType: sub,
          name: `${sub} Ammo Box`,
          amount: sub === '300Mag' ? 10 : 60,
          position: new THREE.Vector3(pt.x, y, pt.z),
        };
      } else if (roll < 0.75) {
        // Armor / Helmet
        const isHelm = Math.random() > 0.5;
        const lvl = Math.random() > 0.7 ? '3' : Math.random() > 0.4 ? '2' : '1';
        lootItem = {
          id: `loot_armor_${index}`,
          type: isHelm ? 'helmet' : 'armor_vest',
          subType: lvl,
          name: `Level ${lvl} ${isHelm ? 'Military Helmet' : 'Tactical Vest'}`,
          amount: 1,
          position: new THREE.Vector3(pt.x, y, pt.z),
        };
      } else {
        // Meds
        const isDrink = Math.random() > 0.4;
        lootItem = {
          id: `loot_med_${index}`,
          type: 'meds',
          subType: isDrink ? 'energyDrink' : 'firstAid',
          name: isDrink ? 'Energy Drink' : 'First Aid Kit',
          amount: isDrink ? 2 : 1,
          position: new THREE.Vector3(pt.x, y, pt.z),
        };
      }

      // Build 3D mesh
      const mesh = buildGroundLootMesh(lootItem.type, lootItem.subType);
      mesh.position.copy(lootItem.position);
      lootItem.mesh = mesh;

      this.lootMeshesGroup.add(mesh);
      this.groundLoots.push(lootItem);
    });
  }

  /**
   * Drops a new ground item (e.g., from eliminated bot crate)
   */
  public addGroundLoot(item: GroundLoot) {
    const mesh = buildGroundLootMesh(item.type, item.subType);
    mesh.position.copy(item.position);
    item.mesh = mesh;
    this.lootMeshesGroup.add(mesh);
    this.groundLoots.push(item);
  }

  /**
   * Removes collected loot item
   */
  public removeGroundLoot(id: string) {
    const idx = this.groundLoots.findIndex((l) => l.id === id);
    if (idx !== -1) {
      const item = this.groundLoots[idx];
      item.taken = true;
      if (item.mesh) {
        this.lootMeshesGroup.remove(item.mesh);
      }
      this.groundLoots.splice(idx, 1);
    }
  }

  /**
   * Updates animated ground loot floating rotation
   */
  public update(deltaTime: number) {
    const time = Date.now() * 0.002;
    this.groundLoots.forEach((loot) => {
      if (loot.mesh && !loot.taken) {
        loot.mesh.rotation.y += deltaTime * 1.5;
        loot.mesh.position.y = loot.position.y + Math.sin(time + loot.position.x) * 0.08;
      }
    });
  }
}
