import * as THREE from 'three';

/**
 * Creates procedural water ripple normal & specular texture for the ocean surface
 */
function createWaterTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep oceanic blue
  ctx.fillStyle = '#061726';
  ctx.fillRect(0, 0, size, size);

  // Concentric ripple rings & wave crests
  for (let i = 0; i < 850; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 2 + Math.random() * 11;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.2)');
    grad.addColorStop(1, 'rgba(6, 23, 38, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Linear wave crest lines for sea swell
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.8;
  for (let w = 0; w < 40; w++) {
    const y = (w / 40) * size;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + 8, size * 0.7, y - 8, size, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(48, 48);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Satellite Orthophoto Terrain Texture
 * Generates agricultural quilted farmland patchwork, winding river delta,
 * highway asphalt ribbons, coastal beaches, and geological sedimentary rock bands.
 */
function createSatelliteTerrainTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. Natural earth base (lush temperate foothills)
  ctx.fillStyle = '#2d4a2f';
  ctx.fillRect(0, 0, size, size);

  // 2. Quilted agricultural crop fields (patchwork farmland in south-east)
  const cropColors = [
    '#3e5c33', // lush clover / pasture
    '#8a7846', // golden ripe wheat
    '#586e38', // olive grove
    '#a38f58', // dry barley
    '#253b21', // deep cedar grove
    '#6b5a38', // freshly tilled loam
  ];

  for (let gx = 450; gx < size - 50; gx += 40 + Math.random() * 25) {
    for (let gy = 420; gy < size - 50; gy += 40 + Math.random() * 25) {
      const w = 35 + Math.random() * 30;
      const h = 35 + Math.random() * 30;
      ctx.fillStyle = cropColors[Math.floor(Math.random() * cropColors.length)];
      ctx.fillRect(gx, gy, w, h);

      // Hedgerow / irrigation canal borders
      ctx.strokeStyle = '#1b2e1a';
      ctx.lineWidth = 2.0;
      ctx.strokeRect(gx, gy, w, h);

      // Plowed tractor furrow lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      for (let f = 4; f < h - 4; f += 5) {
        ctx.beginPath();
        ctx.moveTo(gx + 2, gy + f);
        ctx.lineTo(gx + w - 2, gy + f);
        ctx.stroke();
      }
    }
  }

  // 3. Winding River & Estuary Delta (flows from north-west mountains down to ocean bay)
  ctx.strokeStyle = '#0e3854';
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.bezierCurveTo(160, 220, 290, 360, 380, 520);
  ctx.bezierCurveTo(440, 640, 480, 800, 520, size);
  ctx.stroke();

  // River sandy banks & sediment bars
  ctx.strokeStyle = '#b89b72';
  ctx.lineWidth = 28;
  ctx.globalCompositeOperation = 'destination-over';
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';

  // 4. Highway networks with dividing lines
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 720);
  ctx.bezierCurveTo(300, 700, 600, 740, size, 700);
  ctx.moveTo(520, 0);
  ctx.bezierCurveTo(550, 400, 530, 700, 540, size);
  ctx.stroke();

  // Highway yellow centerline
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // 5. Geological Sedimentary Rock Texture for Canyon Region (Burnt orange & sandstone bands)
  for (let c = 0; c < 200; c++) {
    const cx = 50 + Math.random() * 350;
    const cy = 200 + Math.random() * 300;
    const rw = 20 + Math.random() * 60;
    const rh = 6 + Math.random() * 12;
    ctx.fillStyle = c % 2 === 0 ? 'rgba(180, 83, 9, 0.45)' : 'rgba(217, 119, 6, 0.35)';
    ctx.fillRect(cx, cy, rw, rh);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Runway Asphalt texture with real-world markings (Runway 09/27)
 */
function createRunwayTexture(): THREE.CanvasTexture {
  const width = 256;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1c222a'; // Weathered asphalt
  ctx.fillRect(0, 0, width, height);

  // Runway border lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(14, height);
  ctx.moveTo(width - 14, 0);
  ctx.lineTo(width - 14, height);
  ctx.stroke();

  // Dashed centerline
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 6;
  ctx.setLineDash([40, 30]);
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Touchdown zone threshold stripes
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(25 + i * 36, 30, 20, 90);
    ctx.fillRect(25 + i * 36, height - 120, 20, 90);
  }

  // Runway Numbers "09" & "27"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('09', width / 2, 180);
  ctx.fillText('27', width / 2, height - 150);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Helipad & Offshore Rig Texture with authentic 'H' marking
 */
function createHelipadTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, size, size);

  // Outer yellow safety circle
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.stroke();

  // White 'H' Landing Mark
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 96px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('H', size / 2, size / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Skyscraper Glass Curtain Wall Window Grid Texture
 */
function createSkyscraperFacadeTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  // Grid of illuminated & tinted office windows
  const cols = 8;
  const rows = 16;
  const w = size / cols;
  const h = size / rows;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const isLit = Math.random() > 0.45;
      const grad = ctx.createLinearGradient(c * w, r * h, c * w, (r + 1) * h);
      if (isLit) {
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.8, '#0284c7');
      } else {
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.8, '#0f172a');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(c * w + 2, r * h + 2, w - 4, h - 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Real-World GameWorld:
 * Comprehensive photorealistic multi-biome environment featuring:
 * 1. Satellite orthophoto continuous mainland & archipelagos
 * 2. Metropolitan City Skyline (Sector Sierra) with glass skyscrapers & rooftop helipads
 * 3. Twin-tower suspension bridge across the bay channel (fly-under clearance)
 * 4. Industrial container port & fuel storage refinery
 * 5. Naval Airbase with animated windsock, aerodrome beacon, radar dish, and carrier battle group
 * 6. Coastal lighthouse with rotating Fresnel spotlight
 * 7. Volcanic Canyon of Fire & fly-through stone arches
 * 8. Mountain ridge wind farm with rotating wind turbine rotors
 * 9. Offshore defense platform & ocean drilling rig
 * 10. Multi-altitude volumetric cloud deck & stratospheric space platform
 */
export class GameWorld {
  public group = new THREE.Group();
  public waterMesh: THREE.Mesh;
  public mountainMeshes: THREE.Mesh[] = [];
  public cloudGroup = new THREE.Group();
  public arches: THREE.Group[] = [];
  public treesMesh: THREE.InstancedMesh | null = null;
  public starsPoints: THREE.Points | null = null;
  public navalBaseGroup = new THREE.Group();
  public orbitalStationGroup = new THREE.Group();
  public offshoreRigGroup = new THREE.Group();
  public lighthouseGroup = new THREE.Group();
  public cityGroup = new THREE.Group();
  public bridgeGroup = new THREE.Group();

  // Dynamic animated components
  public windsock: THREE.Group | null = null;
  public radarDish: THREE.Mesh | null = null;
  public aerodromeBeacon: THREE.Group | null = null;
  public lighthouseBeam: THREE.Group | null = null;
  public windTurbineRotors: THREE.Group[] = [];

  constructor(scene: THREE.Scene) {
    // 1. Endless Real-World Ocean with PBR water reflections
    const waterTex = createWaterTexture();
    const waterGeo = new THREE.PlaneGeometry(16000, 16000, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x07223f,
      roughness: 0.12,
      metalness: 0.88,
      map: waterTex,
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.y = 0;
    this.waterMesh.receiveShadow = true;
    this.group.add(this.waterMesh);

    // 2. Continuous Satellite-Derived Mainland & Archipelagos
    this.generateMainlandTerrain();

    // 3. Realistic Mountain Biomes (Alpine Glacier, Volcanic Canyon, Forest Foothills)
    this.generateMountains();

    // 4. Instanced Pine & Evergreen Forests
    this.generateForests();

    // 5. Sector Sierra: Downtown Metropolitan City & Container Port
    this.generateMetropolisCity();

    // 6. Suspension Bridge across Bay Channel
    this.generateSuspensionBridge();

    // 7. Sector Alpha: Naval Airbase, Carrier Battle Group & Windsock
    this.generateNavalAirbase();

    // 8. Coastal Lighthouse on Rocky Headland
    this.generateLighthouse();

    // 9. Sector Bravo: Volcanic Canyon & Stunt Arches
    this.generateCanyonArches();

    // 10. Sector Charlie: Mountain Ridge Wind Farm
    this.generateWindFarm();

    // 11. Sector Delta: Offshore Defense & Ocean Rig
    this.generateOffshorePlatform();

    // 12. Volumetric Troposphere Cloud Deck
    this.generateClouds();

    // 13. Sector Echo: Stratospheric Space Station (Y = 820)
    this.generateOrbitalStation();

    // 14. High-Altitude Starfield & Atmospheric Glow
    this.generateSpaceLayer();

    this.group.add(this.cityGroup);
    this.group.add(this.bridgeGroup);
    this.group.add(this.cloudGroup);
    this.group.add(this.navalBaseGroup);
    this.group.add(this.lighthouseGroup);
    this.group.add(this.offshoreRigGroup);
    this.group.add(this.orbitalStationGroup);

    scene.add(this.group);
  }

  /**
   * Generates continuous mainland terrain with satellite orthophoto mapping
   */
  private generateMainlandTerrain() {
    const satTex = createSatelliteTerrainTexture();

    // Vast mainland plate (4200 x 3600) located to the south/east
    const terrainGeo = new THREE.PlaneGeometry(4200, 3600, 48, 48);

    // Sculpt natural coastal slopes and rolling foothills
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);

      // Elevated mainland rising above sea level
      let elevation = 6.0;

      // Higher rolling terrain inland
      const distFromCoast = Math.max(0, u + 1800);
      elevation += Math.sin(u * 0.003) * 8 + Math.cos(v * 0.003) * 8 + (distFromCoast / 4200) * 35;

      pos.setZ(i, Math.max(0.8, elevation));
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: satTex,
      roughness: 0.85,
      metalness: 0.1,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.position.set(600, 0, 700);
    terrainMesh.receiveShadow = true;
    this.group.add(terrainMesh);

    // Sandy coastal shoreline fringe with white surf
    const beachGeo = new THREE.PlaneGeometry(4300, 3700);
    const beachMat = new THREE.MeshStandardMaterial({
      color: 0xd4b483,
      roughness: 0.95,
      metalness: 0.05,
    });
    const beachMesh = new THREE.Mesh(beachGeo, beachMat);
    beachMesh.rotation.x = -Math.PI / 2;
    beachMesh.position.set(600, 0.4, 700);
    this.group.add(beachMesh);
  }

  /**
   * Generates realistic mountain peaks, volcanic caldera, and perimeter horizons
   */
  private generateMountains() {
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x333b47,
      roughness: 0.85,
      metalness: 0.15,
      flatShading: true,
    });
    const greeneryMat = new THREE.MeshStandardMaterial({
      color: 0x1d3a24,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true,
    });
    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.05,
      flatShading: true,
    });
    const volcanicMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.95,
      metalness: 0.2,
      flatShading: true,
    });
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xd4b483,
      roughness: 0.9,
      metalness: 0.05,
    });

    const islandLocations = [
      // Central archipelago & canyons
      { x: 0, z: -400, radius: 220, height: 190, type: 'forest' },
      { x: -380, z: -120, radius: 170, height: 260, type: 'alpine' },
      { x: 420, z: -280, radius: 190, height: 240, type: 'forest' },
      { x: -320, z: -750, radius: 230, height: 320, type: 'alpine' },
      { x: 360, z: -900, radius: 220, height: 290, type: 'volcanic' },
      { x: 0, z: -1300, radius: 270, height: 400, type: 'alpine' },
      // Volcanic canyon islands
      { x: 450, z: -550, radius: 180, height: 250, type: 'volcanic' },
      { x: -180, z: -1100, radius: 200, height: 300, type: 'volcanic' },
      // Distant perimeter mountain horizons
      { x: -1700, z: -600, radius: 550, height: 580, type: 'alpine' },
      { x: 1800, z: -700, radius: 560, height: 600, type: 'alpine' },
      { x: -1600, z: 500, radius: 520, height: 530, type: 'forest' },
      { x: 1700, z: 600, radius: 530, height: 550, type: 'forest' },
      { x: 0, z: 1700, radius: 580, height: 600, type: 'forest' },
      { x: 0, z: -2700, radius: 640, height: 720, type: 'alpine' },
    ];

    islandLocations.forEach((loc) => {
      // Sandy coastal shoreline base ring
      const sandRing = new THREE.Mesh(
        new THREE.CylinderGeometry(loc.radius * 1.12, loc.radius * 1.18, 4, 16),
        sandMat
      );
      sandRing.position.set(loc.x, 1.8, loc.z);
      this.group.add(sandRing);

      // Mountain core
      const coneGeo = new THREE.ConeGeometry(loc.radius, loc.height, 14, 12);
      const pos = coneGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > 0) {
          const noise = 1 + (Math.random() - 0.5) * 0.35;
          pos.setX(i, pos.getX(i) * noise);
          pos.setZ(i, pos.getZ(i) * noise);
        }
      }
      coneGeo.computeVertexNormals();

      const mat = loc.type === 'volcanic' ? volcanicMat : loc.height > 250 ? rockMat : greeneryMat;
      const mesh = new THREE.Mesh(coneGeo, mat);
      mesh.position.set(loc.x, loc.height / 2 - 10, loc.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.mountainMeshes.push(mesh);
      this.group.add(mesh);

      // Snow-capped alpine summits
      if (loc.type === 'alpine' && loc.height >= 250) {
        const snowGeo = new THREE.ConeGeometry(loc.radius * 0.44, loc.height * 0.32, 14, 4);
        const snow = new THREE.Mesh(snowGeo, snowMat);
        snow.position.set(loc.x, loc.height - loc.height * 0.18, loc.z);
        this.group.add(snow);
      }

      // Molten glowing lava fissure for volcanic mountains
      if (loc.type === 'volcanic') {
        const lavaMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
        const lavaVein = new THREE.Mesh(
          new THREE.BoxGeometry(loc.radius * 0.18, loc.height * 0.65, 3),
          lavaMat
        );
        lavaVein.position.set(loc.x, loc.height * 0.32, loc.z + loc.radius * 0.38);
        this.group.add(lavaVein);
      }
    });
  }

  /**
   * Generates Sector Sierra: Modern Coastal Metropolis & Industrial Port
   */
  private generateMetropolisCity() {
    const city = this.cityGroup;
    city.position.set(480, 0, 480);

    const facadeTex = createSkyscraperFacadeTexture();
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.3 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({
      map: facadeTex,
      roughness: 0.15,
      metalness: 0.85,
    });
    const redBeaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const helipadTex = createHelipadTexture();
    const helipadMat = new THREE.MeshStandardMaterial({ map: helipadTex, roughness: 0.6, metalness: 0.3 });

    // Grid of 14 Skyscrapers with varied heights (60m to 160m)
    const skyscraperLayout = [
      { x: -90, z: -80, w: 28, d: 28, h: 140, helipad: true },
      { x: -50, z: -90, w: 24, d: 24, h: 110, helipad: false },
      { x: -90, z: -40, w: 26, d: 26, h: 95, helipad: false },
      { x: -45, z: -45, w: 32, d: 32, h: 165, helipad: true }, // Apex Tower
      { x: 0, z: -70, w: 25, d: 25, h: 125, helipad: false },
      { x: 45, z: -80, w: 28, d: 28, h: 105, helipad: false },
      { x: 0, z: -25, w: 30, d: 30, h: 150, helipad: true },
      { x: 50, z: -35, w: 26, d: 26, h: 115, helipad: false },
      { x: -80, z: 15, w: 24, d: 24, h: 85, helipad: false },
      { x: -40, z: 20, w: 28, d: 28, h: 130, helipad: true },
      { x: 5, z: 25, w: 30, d: 30, h: 140, helipad: false },
      { x: 55, z: 20, w: 24, d: 24, h: 90, helipad: false },
      { x: -35, z: 70, w: 26, d: 26, h: 75, helipad: false },
      { x: 15, z: 75, w: 25, d: 25, h: 80, helipad: false },
    ];

    skyscraperLayout.forEach((b) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(b.x, 0, b.z);

      // 1. Street podium level
      const podium = new THREE.Mesh(new THREE.BoxGeometry(b.w + 6, 8, b.d + 6), concreteMat);
      podium.position.y = 4;
      podium.castShadow = true;
      podium.receiveShadow = true;
      bGroup.add(podium);

      // 2. Main tower with glass curtain walls
      const tower = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h - 8, b.d), glassMat);
      tower.position.y = (b.h - 8) / 2 + 8;
      tower.castShadow = true;
      tower.receiveShadow = true;
      bGroup.add(tower);

      // 3. Rooftop architectural bulkhead & helipad
      if (b.helipad) {
        const heliDeck = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.85, 1.5, b.d * 0.85), helipadMat);
        heliDeck.position.y = b.h + 0.8;
        bGroup.add(heliDeck);
      } else {
        const roofUnit = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.5, 6, b.d * 0.5), steelMat);
        roofUnit.position.y = b.h + 3;
        bGroup.add(roofUnit);
      }

      // 4. Red flashing aviation collision hazard beacon antenna
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 16, 6), steelMat);
      spire.position.y = b.h + 8;
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 6, 6), redBeaconMat);
      beacon.position.y = b.h + 16;
      bGroup.add(spire, beacon);

      city.add(bGroup);
    });

    // Container Port Waterfront & Cargo Cranes (East side of city)
    const portGroup = new THREE.Group();
    portGroup.position.set(110, 0, 0);

    // Wharfs & seawall
    const seawall = new THREE.Mesh(new THREE.BoxGeometry(45, 6, 260), concreteMat);
    seawall.position.set(0, 3, 0);
    portGroup.add(seawall);

    // Shipping Container stacks (Maersk blue, orange, green, red)
    const containerColors = [0x0284c7, 0xf97316, 0x16a34a, 0xdc2626];
    for (let s = 0; s < 28; s++) {
      const cMat = new THREE.MeshStandardMaterial({
        color: containerColors[s % containerColors.length],
        metalness: 0.6,
        roughness: 0.4,
      });
      const cMesh = new THREE.Mesh(new THREE.BoxGeometry(7, 3.5, 16), cMat);
      const cx = (s % 3) * 8.5 - 9;
      const cz = Math.floor(s / 3) * 19 - 80;
      const cy = 6 + (s % 2) * 3.6;
      cMesh.position.set(cx, cy, cz);
      portGroup.add(cMesh);
    }

    // Two Container Gantry Cranes
    [-40, 40].forEach((zOff) => {
      const crane = new THREE.Group();
      crane.position.set(12, 6, zOff);

      const yellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.4, roughness: 0.5 });
      const leg1 = new THREE.Mesh(new THREE.BoxGeometry(2, 28, 2), yellowMat);
      leg1.position.set(-6, 14, 0);
      const leg2 = new THREE.Mesh(new THREE.BoxGeometry(2, 28, 2), yellowMat);
      leg2.position.set(6, 14, 0);
      const boom = new THREE.Mesh(new THREE.BoxGeometry(32, 2.5, 4), yellowMat);
      boom.position.set(4, 28, 0);

      crane.add(leg1, leg2, boom);
      portGroup.add(crane);
    });

    city.add(portGroup);
  }

  /**
   * Generates a Twin-Tower Suspension Bridge across the bay channel
   */
  private generateSuspensionBridge() {
    const bridge = this.bridgeGroup;
    bridge.position.set(330, 0, 300);
    bridge.rotation.y = -Math.PI / 4;

    const steelMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.7 });
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 });
    const cableMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.9 });

    const spanLength = 360;
    const towerHeight = 72;
    const deckHeight = 22; // High clearance allows jets to fly underneath!

    // Roadway Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(22, 2.5, spanLength), roadMat);
    deck.position.y = deckHeight;
    deck.receiveShadow = true;
    bridge.add(deck);

    // Two Main Suspension Towers
    [-spanLength * 0.28, spanLength * 0.28].forEach((zPos) => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(0, 0, zPos);

      // Pylons
      [-9, 9].forEach((xPos) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(3, towerHeight, 3.5), steelMat);
        leg.position.set(xPos, towerHeight / 2, 0);
        leg.castShadow = true;
        towerGroup.add(leg);
      });

      // Cross portal beams
      const crossBeam1 = new THREE.Mesh(new THREE.BoxGeometry(22, 3, 3), steelMat);
      crossBeam1.position.set(0, deckHeight + 4, 0);
      const crossBeam2 = new THREE.Mesh(new THREE.BoxGeometry(22, 3, 3), steelMat);
      crossBeam2.position.set(0, towerHeight - 4, 0);
      towerGroup.add(crossBeam1, crossBeam2);

      bridge.add(towerGroup);
    });

    // Main Suspension Cables (curved catenary cables)
    [-9, 9].forEach((xPos) => {
      const cablePoints: THREE.Vector3[] = [];
      const numPts = 32;
      for (let i = 0; i <= numPts; i++) {
        const t = (i / numPts) * 2 - 1; // -1 to 1
        const z = t * (spanLength / 2);
        const y = deckHeight + 3 + (1 - t * t) * (towerHeight - deckHeight - 3);
        cablePoints.push(new THREE.Vector3(xPos, y, z));
      }
      const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
      const cableGeo = new THREE.TubeGeometry(cableCurve, 32, 0.45, 6, false);
      const cableMesh = new THREE.Mesh(cableGeo, cableMat);
      bridge.add(cableMesh);
    });
  }

  private generateForests() {
    const treeGeo = new THREE.ConeGeometry(3.5, 12, 6);
    const treeMat = new THREE.MeshStandardMaterial({
      color: 0x14351d,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });

    const count = 550;
    this.treesMesh = new THREE.InstancedMesh(treeGeo, treeMat, count);
    this.treesMesh.castShadow = true;

    const dummy = new THREE.Object3D();
    let idx = 0;

    const forestCenters = [
      { x: 0, z: -320, r: 130 },
      { x: -320, z: -80, r: 90 },
      { x: 350, z: -200, r: 110 },
      { x: -250, z: -680, r: 120 },
      { x: 120, z: 150, r: 150 },
      { x: 280, z: 400, r: 140 },
    ];

    forestCenters.forEach((fc) => {
      const treesPerCenter = Math.floor(count / forestCenters.length);
      for (let i = 0; i < treesPerCenter; i++) {
        if (idx >= count) break;
        const dist = Math.random() * fc.r;
        const angle = Math.random() * Math.PI * 2;
        const x = fc.x + Math.cos(angle) * dist;
        const z = fc.z + Math.sin(angle) * dist;
        const s = 0.7 + Math.random() * 0.6;

        dummy.position.set(x, 5 * s, z);
        dummy.scale.set(s, s, s);
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.updateMatrix();
        this.treesMesh!.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    });

    this.treesMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.treesMesh);
  }

  private generateNavalAirbase() {
    const baseGroup = this.navalBaseGroup;
    baseGroup.position.set(180, 0, 120);

    // Island landmass base
    const islandGeo = new THREE.BoxGeometry(110, 6, 500);
    const islandMat = new THREE.MeshStandardMaterial({ color: 0x242d38, roughness: 0.85 });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(0, 3, 0);
    island.receiveShadow = true;
    baseGroup.add(island);

    // High-Resolution Tarmac Runway with authentic markings
    const runwayTex = createRunwayTexture();
    const runwayGeo = new THREE.PlaneGeometry(42, 450);
    const runwayMat = new THREE.MeshStandardMaterial({
      map: runwayTex,
      roughness: 0.65,
      metalness: 0.2,
    });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(0, 6.05, 0);
    baseGroup.add(runway);

    // Runway Edge & Threshold Lights
    const greenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const bulbGeo = new THREE.SphereGeometry(0.5, 8, 8);

    for (let z = -220; z <= 220; z += 20) {
      [-22, 22].forEach((xOff) => {
        let mat = whiteMat;
        if (z < -190) mat = greenMat;
        else if (z > 190) mat = redMat;

        const bulb = new THREE.Mesh(bulbGeo, mat);
        bulb.position.set(xOff, 6.4, z);
        baseGroup.add(bulb);
      });
    }

    // Approach Lighting System (ALS) bars extending into water
    for (let z = -240; z >= -340; z -= 25) {
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 8, 6), islandMat);
      pylon.position.set(0, 3, z);
      baseGroup.add(pylon);

      for (let xOff = -8; xOff <= 8; xOff += 4) {
        const alsBulb = new THREE.Mesh(bulbGeo, greenMat);
        alsBulb.position.set(xOff, 7.2, z);
        baseGroup.add(alsBulb);
      }
    }

    // Animated Airfield Windsock Mast
    this.windsock = new THREE.Group();
    this.windsock.position.set(-28, 6, -180);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 12, 8), islandMat);
    mast.position.y = 6;
    this.windsock.add(mast);

    const sockPivot = new THREE.Group();
    sockPivot.position.y = 12;
    sockPivot.name = 'sock_pivot';

    const sockCone = new THREE.Mesh(
      new THREE.ConeGeometry(1.2, 5.5, 12, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5, side: THREE.DoubleSide })
    );
    sockCone.rotation.x = Math.PI / 2;
    sockCone.position.z = 2.8;
    sockCone.name = 'sock_cone';
    sockPivot.add(sockCone);

    this.windsock.add(sockPivot);
    baseGroup.add(this.windsock);

    // Flight Control Tower
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3 });
    const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(5, 6, 32, 8), towerMat);
    towerBase.position.set(36, 18, -60);

    const cabGeo = new THREE.CylinderGeometry(8, 6, 7, 8);
    const cabMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.9, roughness: 0.1 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(36, 35, -60);

    // Rotating Aerodrome Airport Beacon (Green & White sweeping searchlight)
    this.aerodromeBeacon = new THREE.Group();
    this.aerodromeBeacon.position.set(36, 40, -60);

    const beaconCore = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    this.aerodromeBeacon.add(beaconCore);

    // Green beacon cone
    const greenBeam = new THREE.Mesh(
      new THREE.ConeGeometry(8, 65, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    greenBeam.rotation.x = Math.PI / 2;
    greenBeam.position.z = 32;
    this.aerodromeBeacon.add(greenBeam);

    // White beacon cone opposite
    const whiteBeam = new THREE.Mesh(
      new THREE.ConeGeometry(8, 65, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
    );
    whiteBeam.rotation.x = -Math.PI / 2;
    whiteBeam.position.z = -32;
    this.aerodromeBeacon.add(whiteBeam);

    baseGroup.add(towerBase, cab, this.aerodromeBeacon);

    // Rotating Radar Dish Installation
    const radarBase = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 10), towerMat);
    radarBase.position.set(36, 7, 50);

    const dishGeo = new THREE.SphereGeometry(7, 16, 8, 0, Math.PI);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    this.radarDish = new THREE.Mesh(dishGeo, dishMat);
    this.radarDish.rotation.x = Math.PI / 4;
    this.radarDish.position.set(36, 16, 50);
    baseGroup.add(radarBase, this.radarDish);

    // Aircraft Hangars (3 arched steel hangars)
    [-60, 0, 60].forEach((zOff) => {
      const hangarGeo = new THREE.CylinderGeometry(15, 15, 38, 16, 1, false, 0, Math.PI);
      const hangarMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.4 });
      const hangar = new THREE.Mesh(hangarGeo, hangarMat);
      hangar.rotation.z = Math.PI / 2;
      hangar.position.set(-36, 6, zOff);
      baseGroup.add(hangar);
    });

    // Harbor Dock & Warships
    const pier = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 180), towerMat);
    pier.position.set(62, 3, 0);
    baseGroup.add(pier);

    // Docked Aircraft Carrier
    const carrierHull = new THREE.Mesh(
      new THREE.BoxGeometry(22, 9, 140),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 })
    );
    carrierHull.position.set(86, 4.5, 0);

    const flightDeck = new THREE.Mesh(
      new THREE.BoxGeometry(26, 1.2, 145),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.35 })
    );
    flightDeck.position.set(86, 9.5, 0);

    const carrierIsland = new THREE.Mesh(
      new THREE.BoxGeometry(6, 12, 22),
      towerMat
    );
    carrierIsland.position.set(96, 16, -10);

    baseGroup.add(carrierHull, flightDeck, carrierIsland);
  }

  private generateLighthouse() {
    // Coastal Lighthouse on rocky headland (X = -280, Z = 260)
    const lhGroup = this.lighthouseGroup;
    lhGroup.position.set(-280, 0, 260);

    // Rocky foundation crag
    const rockBase = new THREE.Mesh(
      new THREE.ConeGeometry(28, 22, 8),
      new THREE.MeshStandardMaterial({ color: 0x272e39, roughness: 0.9 })
    );
    rockBase.position.set(0, 10, 0);
    lhGroup.add(rockBase);

    // Striped Lighthouse Tower
    const towerMatWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const towerMatRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });

    for (let i = 0; i < 4; i++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(4.5 - i * 0.4, 5.0 - i * 0.4, 10, 12),
        i % 2 === 0 ? towerMatRed : towerMatWhite
      );
      seg.position.set(0, 22 + i * 9.5, 0);
      lhGroup.add(seg);
    }

    // Lantern room & gallery
    const lanternRoom = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.2, 7, 12),
      new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.9, roughness: 0.1 })
    );
    lanternRoom.position.set(0, 61, 0);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(4.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      towerMatRed
    );
    dome.position.set(0, 64.5, 0);
    lhGroup.add(lanternRoom, dome);

    // Rotating sweeping lighthouse spotlight beam
    this.lighthouseBeam = new THREE.Group();
    this.lighthouseBeam.position.set(0, 61, 0);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    this.lighthouseBeam.add(bulb);

    const beamCone = new THREE.Mesh(
      new THREE.ConeGeometry(18, 160, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
      })
    );
    beamCone.rotation.x = Math.PI / 2;
    beamCone.position.z = 80;
    this.lighthouseBeam.add(beamCone);

    lhGroup.add(this.lighthouseBeam);
  }

  private generateCanyonArches() {
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x3d352e,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });

    const archPositions = [
      { x: 0, y: 75, z: -400, rot: 0, scale: 1.2 },
      { x: -140, y: 85, z: -750, rot: 0.4, scale: 1.4 },
      { x: 160, y: 90, z: -1050, rot: -0.3, scale: 1.3 },
    ];

    archPositions.forEach((archInfo) => {
      const archGroup = new THREE.Group();
      archGroup.position.set(archInfo.x, archInfo.y, archInfo.z);
      archGroup.rotation.y = archInfo.rot;
      archGroup.scale.set(archInfo.scale, archInfo.scale, archInfo.scale);

      const torusGeo = new THREE.TorusGeometry(32, 8, 8, 16, Math.PI);
      const torusMesh = new THREE.Mesh(torusGeo, archMat);
      torusMesh.rotation.z = Math.PI;
      torusMesh.castShadow = true;
      archGroup.add(torusMesh);

      [-32, 32].forEach((px) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(8, 14, 80, 8), archMat);
        col.position.set(px, -40, 0);
        col.castShadow = true;
        archGroup.add(col);
      });

      this.arches.push(archGroup);
      this.group.add(archGroup);
    });
  }

  private generateWindFarm() {
    // Wind Turbines positioned along mountain ridge (Sector Charlie)
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.3, roughness: 0.4 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.3 });

    const turbineLocations = [
      { x: -350, y: 220, z: -700 },
      { x: -320, y: 240, z: -780 },
      { x: -280, y: 230, z: -850 },
    ];

    turbineLocations.forEach((loc) => {
      const turbineGroup = new THREE.Group();
      turbineGroup.position.set(loc.x, loc.y, loc.z);

      // Tower
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.4, 45, 12), towerMat);
      mast.position.y = 22.5;
      turbineGroup.add(mast);

      // Nacelle generator pod
      const nacelle = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3, 9), towerMat);
      nacelle.position.set(0, 45, 0);
      turbineGroup.add(nacelle);

      // 3-Blade Rotor Hub
      const rotor = new THREE.Group();
      rotor.position.set(0, 45, 4.8);

      const hub = new THREE.Mesh(new THREE.ConeGeometry(1.8, 3, 12), towerMat);
      hub.rotation.x = Math.PI / 2;
      rotor.add(hub);

      for (let b = 0; b < 3; b++) {
        const bladeAng = (b * Math.PI * 2) / 3;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.8, 26, 0.25), bladeMat);
        blade.position.set(Math.sin(bladeAng) * 13, Math.cos(bladeAng) * 13, 0);
        blade.rotation.z = -bladeAng;
        rotor.add(blade);
      }

      turbineGroup.add(rotor);
      this.windTurbineRotors.push(rotor);
      this.group.add(turbineGroup);
    });
  }

  private generateOffshorePlatform() {
    // Sector Delta: Offshore Defense & Ocean Drilling Platform (X = -450, Z = -350)
    const rig = this.offshoreRigGroup;
    rig.position.set(-450, 0, -350);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const safetyYellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });

    // Main support legs plunging into ocean
    [-24, 24].forEach((px) => {
      [-24, 24].forEach((pz) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.8, 38, 12), steelMat);
        leg.position.set(px, 12, pz);
        rig.add(leg);
      });
    });

    // Cross-truss bracing
    const truss = new THREE.Mesh(new THREE.BoxGeometry(52, 2.5, 52), steelMat);
    truss.position.set(0, 20, 0);
    rig.add(truss);

    // Main Upper Deck (Y = 24)
    const deckTex = createHelipadTexture();
    const deckMat = new THREE.MeshStandardMaterial({ map: deckTex, roughness: 0.6, metalness: 0.3 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(48, 2, 48), deckMat);
    deck.position.set(0, 24, 0);
    deck.receiveShadow = true;
    rig.add(deck);

    // Drilling & Antenna Derrick
    const derrick = new THREE.Mesh(new THREE.ConeGeometry(6, 28, 4), steelMat);
    derrick.position.set(-14, 38, -14);
    rig.add(derrick);

    // Crane Tower with Yellow Boom
    const craneCab = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 4), safetyYellowMat);
    craneCab.position.set(16, 27, 16);
    const craneBoom = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 26), safetyYellowMat);
    craneBoom.position.set(16, 32, 24);
    craneBoom.rotation.x = -Math.PI / 6;
    rig.add(craneCab, craneBoom);

    // Perimeter Yellow Safety Lights
    const rigBulbGeo = new THREE.SphereGeometry(0.6, 8, 8);
    const yellowLightMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    [-23, 23].forEach((lx) => {
      [-23, 23].forEach((lz) => {
        const blb = new THREE.Mesh(rigBulbGeo, yellowLightMat);
        blb.position.set(lx, 25.5, lz);
        rig.add(blb);
      });
    });
  }

  private generateClouds() {
    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.72,
    });

    for (let c = 0; c < 50; c++) {
      const cluster = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);

      for (let p = 0; p < numPuffs; p++) {
        const r = 20 + Math.random() * 25;
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 55,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 55
        );
        puff.scale.y = 0.55;
        cluster.add(puff);
      }

      cluster.position.set(
        (Math.random() - 0.5) * 3600,
        150 + Math.random() * 140,
        (Math.random() - 0.5) * 3600
      );
      this.cloudGroup.add(cluster);
    }
  }

  private generateOrbitalStation() {
    // Sector Echo: Stratospheric Orbital Space Platform (Y = 820, ~2700 ft)
    const stGroup = this.orbitalStationGroup;
    stGroup.position.set(0, 820, -1900);

    const coreGeo = new THREE.CylinderGeometry(18, 18, 55, 16);
    const stationMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 });
    const core = new THREE.Mesh(coreGeo, stationMat);
    core.rotation.z = Math.PI / 2;
    stGroup.add(core);

    // Toroidal Habitat Ring
    const ringGeo = new THREE.TorusGeometry(48, 4, 16, 48);
    const ring = new THREE.Mesh(ringGeo, stationMat);
    ring.name = 'station_ring';
    stGroup.add(ring);

    // Solar array wings
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
    [-75, 75].forEach((x) => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(45, 0.4, 20), solarMat);
      panel.position.set(x, 0, 0);
      stGroup.add(panel);
    });

    // Beacon lights
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    beacon.position.set(0, 52, 0);
    stGroup.add(beacon);
  }

  private generateSpaceLayer() {
    const starCount = 2000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3800;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 1200;
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const isBlue = Math.random() > 0.7;
      starColors[i * 3] = isBlue ? 0.7 : 1.0;
      starColors[i * 3 + 1] = isBlue ? 0.85 : 0.95;
      starColors[i * 3 + 2] = isBlue ? 1.0 : 0.8;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    this.starsPoints = new THREE.Points(starGeo, starMat);
    this.group.add(this.starsPoints);
  }

  public update(delta: number, playerAltitude: number, windHeading?: number, windSpeed?: number) {
    // Water ripples offset animation
    if (this.waterMesh.material instanceof THREE.MeshStandardMaterial && this.waterMesh.material.map) {
      this.waterMesh.material.map.offset.x += 0.008 * delta;
      this.waterMesh.material.map.offset.y += 0.005 * delta;
    }

    // Cloud drift
    this.cloudGroup.children.forEach((cloud) => {
      cloud.position.x += 2.8 * delta;
      if (cloud.position.x > 1800) cloud.position.x = -1800;
    });

    // Spin radar dish at naval base
    if (this.radarDish) {
      this.radarDish.rotation.z += 1.5 * delta;
    }

    // Sweeping Aerodrome airport beacon
    if (this.aerodromeBeacon) {
      this.aerodromeBeacon.rotation.y += 2.2 * delta;
    }

    // Sweeping coastal lighthouse spotlight beam
    if (this.lighthouseBeam) {
      this.lighthouseBeam.rotation.y += 1.4 * delta;
    }

    // Wind turbines rotation
    this.windTurbineRotors.forEach((rotor) => {
      rotor.rotation.z += 1.8 * delta;
    });

    // Rotate space station habitat ring
    const stationRing = this.orbitalStationGroup.getObjectByName('station_ring');
    if (stationRing) {
      stationRing.rotation.z += 0.35 * delta;
    }

    // Animated Windsock reacts to wind vector
    if (this.windsock) {
      const sockPivot = this.windsock.getObjectByName('sock_pivot');
      const sockCone = this.windsock.getObjectByName('sock_cone');
      if (sockPivot && windHeading !== undefined) {
        const targetRotY = (windHeading * Math.PI) / 180 + Math.PI;
        sockPivot.rotation.y = THREE.MathUtils.damp(sockPivot.rotation.y, targetRotY, 3.5, delta);
      }
      if (sockCone && windSpeed !== undefined) {
        // Higher wind speed flattens the windsock horizontally
        const speedRatio = Math.min(1.0, windSpeed / 40);
        const pitchAngle = Math.PI / 2 - (1 - speedRatio) * 0.45;
        sockCone.rotation.x = THREE.MathUtils.damp(sockCone.rotation.x, pitchAngle, 4.0, delta);
      }
    }

    // Starfield visibility fades in as altitude rises
    if (this.starsPoints) {
      const spaceNorm = Math.min(1.0, Math.max(0.0, (playerAltitude - 550) / 900));
      (this.starsPoints.material as THREE.PointsMaterial).opacity = 0.25 + spaceNorm * 0.75;
    }
  }
}
