import * as THREE from 'three';
import { AircraftStats, AircraftType, PickupType } from '../types/game';

/**
 * Real-World Aircraft Roster with authentic flight specifications
 */
export const AIRCRAFT_ROSTER: AircraftStats[] = [
  {
    id: 'f35_lightning',
    name: 'F-35A Lightning II',
    codename: 'PANTHER',
    role: '5th-Gen Stealth Multirole Fighter',
    nation: 'United States',
    generation: '5th Gen Stealth',
    tier: 1,
    price: 0,
    topSpeed: 840,
    maxMach: 1.6,
    thrustToWeight: 1.07,
    acceleration: 9.8,
    agility: 1.25,
    armor: 120,
    shields: 100,
    laserDamage: 28,
    cannonRpm: 3300,
    missileCapacity: 8,
    flareCapacity: 24,
    color: '#38bdf8',
    accentColor: '#0ea5e9',
    description: 'Premier 5th-generation stealth multirole fighter. Features faceted radar-absorbent fuselage, diverterless supersonic inlets (DSI), electro-optical targeting system (EOTS), and internal weapon bays.',
    specialAbility: 'Low Radar Cross Section (Stealth Cloak)',
  },
  {
    id: 'su57_felon',
    name: 'Sukhoi Su-57 Felon',
    codename: 'FELON',
    role: '5th-Gen Air Dominance Heavy Fighter',
    nation: 'Russian Federation',
    generation: '5th Gen Heavy',
    tier: 2,
    price: 2800,
    topSpeed: 960,
    maxMach: 2.0,
    thrustToWeight: 1.16,
    acceleration: 11.2,
    agility: 1.45,
    armor: 150,
    shields: 120,
    laserDamage: 34,
    cannonRpm: 1800,
    missileCapacity: 12,
    flareCapacity: 30,
    color: '#06b6d4',
    accentColor: '#22d3ee',
    description: 'Blended wing-body twin-engine air superiority fighter equipped with 3D all-axis thrust vectoring, moving leading-edge root extensions (LEVCONs), and digital geometric splinter camouflage.',
    specialAbility: 'Super-Maneuverability Post-Stall Vectoring',
  },
  {
    id: 'dassault_rafale',
    name: 'Dassault Rafale C',
    codename: 'OMNIROLE',
    role: '4.5+ Gen Omnirole Delta Fighter',
    nation: 'France',
    generation: '4.5+ Gen Delta',
    tier: 3,
    price: 4500,
    topSpeed: 910,
    maxMach: 1.8,
    thrustToWeight: 1.13,
    acceleration: 10.5,
    agility: 1.55,
    armor: 135,
    shields: 110,
    laserDamage: 32,
    cannonRpm: 2500,
    missileCapacity: 14,
    flareCapacity: 28,
    color: '#6366f1',
    accentColor: '#818cf8',
    description: 'Agile omnirole delta-wing fighter with close-coupled active canards, twin Snecma M88 engines, SPECTRA electronic warfare suite, and heavy multi-target missile carriage.',
    specialAbility: 'Close-Coupled Canard High-G Turn',
  },
  {
    id: 'vortex_ghost',
    name: 'Vortex X-99 Ghost',
    codename: 'GHOST',
    role: 'Advanced Stealth Experimental Interceptor',
    nation: 'Prototype Aerospace',
    generation: '6th Gen Prototype',
    tier: 4,
    price: 7500,
    topSpeed: 1050,
    maxMach: 2.3,
    thrustToWeight: 1.25,
    acceleration: 12.8,
    agility: 1.6,
    armor: 140,
    shields: 140,
    laserDamage: 40,
    cannonRpm: 4000,
    missileCapacity: 16,
    flareCapacity: 32,
    color: '#10b981',
    accentColor: '#34d399',
    description: 'Forward-swept aeroelastic stealth interceptor armed with rotary plasma cannons, high-energy shield capacitor, and hypersonic low-altitude cruise.',
    specialAbility: 'Overdrive Afterburner Mach Surge',
  },
  {
    id: 'orbital_darkstar',
    name: 'SR-72 Orbital Darkstar',
    codename: 'DARKSTAR',
    role: 'Hypersonic High-Altitude Space Strike',
    nation: 'Skunk Works / Global Defense',
    generation: 'Hypersonic Vacuum',
    tier: 5,
    price: 12000,
    topSpeed: 1380,
    maxMach: 4.5,
    thrustToWeight: 1.45,
    acceleration: 15.0,
    agility: 1.35,
    armor: 160,
    shields: 180,
    laserDamage: 50,
    cannonRpm: 4500,
    missileCapacity: 20,
    flareCapacity: 40,
    color: '#f59e0b',
    accentColor: '#fbbf24',
    description: 'Mach 4+ hypersonic combined-cycle scramjet capable of ascending through the troposphere into the upper orbital stratosphere. Unrivaled speed and kinetic strike.',
    specialAbility: 'Stratospheric Kinetic Strike',
  },
];

/**
 * Procedural Radar Absorbent Material (RAM) texture for F-35 with stealth panel seams & flush rivets
 */
function createStealthRamTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#262930'; // Matte dark gray RAM coating
  ctx.fillRect(0, 0, size, size);

  // Stealth panel seams (sawtooth and trapezoidal perimeter lines)
  ctx.strokeStyle = '#383e4a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const y = i * 36;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size * 0.4, y);
    ctx.lineTo(size * 0.45, y + 10);
    ctx.lineTo(size * 0.55, y - 10);
    ctx.lineTo(size * 0.6, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Hexagonal composite fastener rivets
  ctx.fillStyle = '#1e2127';
  for (let i = 0; i < 220; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    ctx.fillRect(rx, ry, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Procedural Russian Digital Splinter Camo for Su-57
 */
function createDigitalSplinterTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Light sky-gray base
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, size, size);

  const colors = ['#334155', '#1e293b', '#38bdf8', '#475569'];

  // Sharp geometric splinter polygons
  for (let i = 0; i < 35; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = 40 + Math.random() * 80;
    const h = 30 + Math.random() * 60;

    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + (Math.random() - 0.5) * 30);
    ctx.lineTo(x + w * 0.8, y + h);
    ctx.lineTo(x + (Math.random() - 0.5) * 20, y + h * 0.9);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Procedural French Naval Gray / Mirage Camo for Rafale
 */
function createFrenchNavalTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4b5563'; // French low-vis dark gray
  ctx.fillRect(0, 0, size, size);

  // Light gray camouflage soft patches
  ctx.fillStyle = '#6b7280';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * size,
      Math.random() * size,
      60 + Math.random() * 90,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Fine panel lines
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.5;
  for (let y = 30; y < size; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export interface PlayerAircraftData {
  group: THREE.Group;
  afterburners: THREE.Mesh[];
  cannons: THREE.Vector3[];
  missileHardpoints: THREE.Vector3[];
  flareEjectors: THREE.Vector3[];
  cockpitPos: THREE.Vector3;
  controlSurfaces: {
    elevators: THREE.Mesh[];
    aileronsL: THREE.Mesh[];
    aileronsR: THREE.Mesh[];
    rudders: THREE.Mesh[];
    canards: THREE.Mesh[];
    levcons: THREE.Mesh[];
  };
}

/**
 * Builds photorealistic modern fighter jet 3D composite models
 */
export function buildPlayerAircraft(type: AircraftType): PlayerAircraftData {
  const group = new THREE.Group();
  group.name = `PlayerAircraft_${type}`;

  const afterburners: THREE.Mesh[] = [];
  const cannons: THREE.Vector3[] = [];
  const missileHardpoints: THREE.Vector3[] = [];
  const flareEjectors: THREE.Vector3[] = [];
  let cockpitPos = new THREE.Vector3(0, 0.45, 0.8);

  const controlSurfaces = {
    elevators: [] as THREE.Mesh[],
    aileronsL: [] as THREE.Mesh[],
    aileronsR: [] as THREE.Mesh[],
    rudders: [] as THREE.Mesh[],
    canards: [] as THREE.Mesh[],
    levcons: [] as THREE.Mesh[],
  };

  // Shared Physical Materials
  const canopyGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.85,
    opacity: 0.8,
    transparent: true,
    roughness: 0.05,
    metalness: 0.1,
    ior: 1.52,
  });

  const titaniumEngineMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.92,
    roughness: 0.22,
  });

  const missileMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.4,
    roughness: 0.4,
  });

  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.9,
  });

  // Reusable Pilot Cockpit detail
  const pilotHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  );
  pilotHead.position.set(0, 0.42, 0.7);

  const pilotVisor = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI),
    new THREE.MeshPhysicalMaterial({ color: 0x10b981, metalness: 0.9, roughness: 0.1 })
  );
  pilotVisor.rotation.x = -Math.PI / 2;
  pilotVisor.position.set(0, 0.44, 0.82);

  const ejectorSeat = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.75, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
  );
  ejectorSeat.position.set(0, 0.28, 0.65);

  const hudGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.22),
    new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  );
  hudGlass.rotation.x = -0.35;
  hudGlass.position.set(0, 0.58, 1.35);

  // -------------------------------------------------------------
  // 1. F-35A LIGHTNING II (5th-Gen Stealth Multirole)
  // -------------------------------------------------------------
  if (type === 'f35_lightning') {
    const ramTex = createStealthRamTexture();
    const stealthMat = new THREE.MeshStandardMaterial({
      map: ramTex,
      color: 0x3f4652,
      metalness: 0.75,
      roughness: 0.35,
    });

    // Chined Faceted Stealth Fuselage
    const fuseShape = new THREE.Shape();
    fuseShape.moveTo(0, 3.8); // Pitot needle tip
    fuseShape.lineTo(0.35, 2.7);
    fuseShape.lineTo(0.75, 1.2);
    fuseShape.lineTo(0.85, -0.6);
    fuseShape.lineTo(0.72, -2.4);
    fuseShape.lineTo(0.35, -3.1);
    fuseShape.lineTo(-0.35, -3.1);
    fuseShape.lineTo(-0.72, -2.4);
    fuseShape.lineTo(-0.85, -0.6);
    fuseShape.lineTo(-0.75, 1.2);
    fuseShape.lineTo(-0.35, 2.7);
    fuseShape.closePath();

    const fuseGeo = new THREE.ExtrudeGeometry(fuseShape, { depth: 0.55, bevelEnabled: true, bevelSize: 0.14 });
    const fuse = new THREE.Mesh(fuseGeo, stealthMat);
    fuse.rotation.x = -Math.PI / 2;
    fuse.position.set(0, 0.25, 0);
    fuse.castShadow = true;
    fuse.receiveShadow = true;
    group.add(fuse);

    // EOTS Diamond Turret under nose
    const eotsGeo = new THREE.ConeGeometry(0.18, 0.45, 6);
    eotsGeo.rotateX(Math.PI / 2);
    const eots = new THREE.Mesh(eotsGeo, new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, metalness: 0.9, roughness: 0.1 }));
    eots.position.set(0, -0.22, 2.4);
    group.add(eots);

    // Diverterless Supersonic Inlets (DSI)
    [-0.78, 0.78].forEach((x) => {
      const dsi = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 1.6), stealthMat);
      dsi.position.set(x, 0.15, 0.4);
      dsi.rotation.y = (x > 0 ? -1 : 1) * 0.1;
      group.add(dsi);
    });

    // Trapezoidal Stealth Wings
    const wingGeo = new THREE.BoxGeometry(6.4, 0.08, 2.1);
    const wings = new THREE.Mesh(wingGeo, stealthMat);
    wings.position.set(0, 0.18, -0.2);
    wings.castShadow = true;
    group.add(wings);

    // Movable Ailerons / Flaperons on wings
    [-2.2, 2.2].forEach((x, i) => {
      const aileron = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.45), stealthMat);
      aileron.position.set(x, 0.18, -1.25);
      group.add(aileron);
      if (i === 0) controlSurfaces.aileronsL.push(aileron);
      else controlSurfaces.aileronsR.push(aileron);
    });

    // Horizontal Elevators (All-moving tailerons)
    [-1.2, 1.2].forEach((x) => {
      const elevator = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.9), stealthMat);
      elevator.position.set(x, 0.15, -2.8);
      group.add(elevator);
      controlSurfaces.elevators.push(elevator);
    });

    // Canting Twin Vertical Tails (28° outward slant)
    [-0.75, 0.75].forEach((x) => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.45, 1.2), stealthMat);
      fin.position.set(x, 0.9, -2.4);
      fin.rotation.z = (x > 0 ? -1 : 1) * 0.32;
      group.add(fin);
      controlSurfaces.rudders.push(fin);
    });

    // Single Pratt & Whitney F135 Engine with Serrated Sawtooth Nozzle
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.5, 16), titaniumEngineMat);
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.set(0, 0.18, -3.1);
    group.add(nozzle);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.8, 16), flameMat);
    flame.rotation.x = -Math.PI / 2;
    flame.position.set(0, 0.18, -4.6);
    afterburners.push(flame);
    group.add(flame);

    // Stealth Cockpit Canopy
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), canopyGlassMat);
    canopy.scale.set(0.9, 0.75, 2.5);
    canopy.position.set(0, 0.52, 0.85);
    group.add(canopy, pilotHead, pilotVisor, ejectorSeat, hudGlass);

    // Internal Weapons Bay (AIM-120 AMRAAM missiles visible)
    [-0.45, 0.45].forEach((x) => {
      const amraam = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.8, 8), missileMat);
      amraam.rotation.x = Math.PI / 2;
      amraam.position.set(x, -0.15, 0.2);
      group.add(amraam);
    });

    cockpitPos = new THREE.Vector3(0, 0.58, 0.85);
    cannons.push(new THREE.Vector3(-0.4, 0.35, 1.8)); // GAU-22/A 25mm port
    missileHardpoints.push(new THREE.Vector3(-0.45, -0.15, 0.2));
    missileHardpoints.push(new THREE.Vector3(0.45, -0.15, 0.2));
    missileHardpoints.push(new THREE.Vector3(-2.4, 0.1, -0.2));
    missileHardpoints.push(new THREE.Vector3(2.4, 0.1, -0.2));
    flareEjectors.push(new THREE.Vector3(0, -0.1, -2.6));

  // -------------------------------------------------------------
  // 2. SUKHOI SU-57 FELON (5th-Gen Heavy Fighter)
  // -------------------------------------------------------------
  } else if (type === 'su57_felon') {
    const camoTex = createDigitalSplinterTexture();
    const felonMat = new THREE.MeshStandardMaterial({
      map: camoTex,
      metalness: 0.82,
      roughness: 0.28,
    });

    // Wide Blended Wing-Body Fuselage
    const fuseShape = new THREE.Shape();
    fuseShape.moveTo(0, 4.3); // Needle radome
    fuseShape.lineTo(0.5, 2.8);
    fuseShape.lineTo(1.3, 0.9);
    fuseShape.lineTo(1.4, -1.8);
    fuseShape.lineTo(0.8, -3.2);
    fuseShape.lineTo(-0.8, -3.2);
    fuseShape.lineTo(-1.4, -1.8);
    fuseShape.lineTo(-1.3, 0.9);
    fuseShape.lineTo(-0.5, 2.8);
    fuseShape.closePath();

    const fuseGeo = new THREE.ExtrudeGeometry(fuseShape, { depth: 0.48, bevelEnabled: true, bevelSize: 0.16 });
    const fuse = new THREE.Mesh(fuseGeo, felonMat);
    fuse.rotation.x = -Math.PI / 2;
    fuse.position.set(0, 0.2, 0);
    fuse.castShadow = true;
    fuse.receiveShadow = true;
    group.add(fuse);

    // OLS-50M Infrared Search and Track (IRST) sphere on right nose
    const irst = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 12),
      new THREE.MeshPhysicalMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 })
    );
    irst.position.set(0.24, 0.46, 2.4);
    group.add(irst);

    // Movable Leading-Edge Root Extensions (LEVCONs)
    [-0.9, 0.9].forEach((x) => {
      const levcon = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 1.4), felonMat);
      levcon.position.set(x, 0.22, 1.4);
      group.add(levcon);
      controlSurfaces.levcons.push(levcon);
    });

    // Broad Diamond Wings
    const wingGeo = new THREE.BoxGeometry(7.8, 0.08, 2.5);
    const wings = new THREE.Mesh(wingGeo, felonMat);
    wings.position.set(0, 0.16, -0.3);
    wings.castShadow = true;
    group.add(wings);

    // Movable Ailerons
    [-2.8, 2.8].forEach((x, i) => {
      const aileron = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.5), felonMat);
      aileron.position.set(x, 0.16, -1.4);
      group.add(aileron);
      if (i === 0) controlSurfaces.aileronsL.push(aileron);
      else controlSurfaces.aileronsR.push(aileron);
    });

    // Twin Saturn AL-41F1 3D Vectoring Engine Nacelles
    [-0.75, 0.75].forEach((x) => {
      const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 2.8, 16), titaniumEngineMat);
      nacelle.rotation.x = Math.PI / 2;
      nacelle.position.set(x, 0.15, -2.4);
      group.add(nacelle);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.36, 2.8, 16), flameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 0.15, -4.0);
      afterburners.push(flame);
      group.add(flame);
    });

    // Canting Vertical Stabilizers
    [-0.85, 0.85].forEach((x) => {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.35, 1.2), felonMat);
      tail.position.set(x, 0.85, -2.4);
      tail.rotation.z = (x > 0 ? -1 : 1) * 0.26;
      group.add(tail);
      controlSurfaces.rudders.push(tail);
    });

    // All-moving horizontal tailerons
    [-1.5, 1.5].forEach((x) => {
      const elev = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 1.1), felonMat);
      elev.position.set(x, 0.14, -2.9);
      group.add(elev);
      controlSurfaces.elevators.push(elev);
    });

    // Cockpit Canopy
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), canopyGlassMat);
    canopy.scale.set(0.95, 0.8, 2.7);
    canopy.position.set(0, 0.5, 0.95);
    group.add(canopy, pilotHead, pilotVisor, ejectorSeat, hudGlass);

    cockpitPos = new THREE.Vector3(0, 0.55, 0.95);
    cannons.push(new THREE.Vector3(0.55, 0.35, 1.9)); // GSh-30-1 starboard cannon
    missileHardpoints.push(new THREE.Vector3(-0.75, -0.15, 0.0));
    missileHardpoints.push(new THREE.Vector3(0.75, -0.15, 0.0));
    missileHardpoints.push(new THREE.Vector3(-3.2, 0.12, -0.4));
    missileHardpoints.push(new THREE.Vector3(3.2, 0.12, -0.4));
    flareEjectors.push(new THREE.Vector3(-0.75, 0.1, -2.8));
    flareEjectors.push(new THREE.Vector3(0.75, 0.1, -2.8));

  // -------------------------------------------------------------
  // 3. DASSAULT RAFALE C (Omnirole Delta-Wing)
  // -------------------------------------------------------------
  } else if (type === 'dassault_rafale') {
    const rafaleTex = createFrenchNavalTexture();
    const rafaleMat = new THREE.MeshStandardMaterial({
      map: rafaleTex,
      metalness: 0.78,
      roughness: 0.32,
    });

    // Slender Aerodynamic Fuselage with Nose Probe
    const fuseShape = new THREE.Shape();
    fuseShape.moveTo(0, 4.0); // Radome tip
    fuseShape.lineTo(0.4, 2.5);
    fuseShape.lineTo(0.68, 1.0);
    fuseShape.lineTo(0.78, -1.8);
    fuseShape.lineTo(0.5, -2.8);
    fuseShape.lineTo(-0.5, -2.8);
    fuseShape.lineTo(-0.78, -1.8);
    fuseShape.lineTo(-0.68, 1.0);
    fuseShape.lineTo(-0.4, 2.5);
    fuseShape.closePath();

    const fuseGeo = new THREE.ExtrudeGeometry(fuseShape, { depth: 0.5, bevelEnabled: true, bevelSize: 0.15 });
    const fuse = new THREE.Mesh(fuseGeo, rafaleMat);
    fuse.rotation.x = -Math.PI / 2;
    fuse.position.set(0, 0.22, 0);
    fuse.castShadow = true;
    fuse.receiveShadow = true;
    group.add(fuse);

    // In-Flight Refueling Probe on Starboard nose
    const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), titaniumEngineMat);
    probe.rotation.x = -Math.PI / 2 + 0.15;
    probe.position.set(0.38, 0.45, 2.5);
    group.add(probe);

    // Active Close-Coupled All-Moving Canards
    [-0.72, 0.72].forEach((x) => {
      const canard = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.8), rafaleMat);
      canard.position.set(x, 0.35, 1.4);
      group.add(canard);
      controlSurfaces.canards.push(canard);
    });

    // Pure Delta Wing Layout
    const deltaShape = new THREE.Shape();
    deltaShape.moveTo(0.75, 0.2);
    deltaShape.lineTo(3.8, -1.8);
    deltaShape.lineTo(3.6, -2.4);
    deltaShape.lineTo(0.75, -2.4);
    deltaShape.closePath();

    const wingGeo = new THREE.ExtrudeGeometry(deltaShape, { depth: 0.08, bevelEnabled: true });
    const rw = new THREE.Mesh(wingGeo, rafaleMat);
    rw.rotation.x = -Math.PI / 2;
    const lw = new THREE.Mesh(wingGeo, rafaleMat);
    lw.scale.set(-1, 1, 1);
    lw.rotation.x = -Math.PI / 2;
    group.add(rw, lw);

    // Wing Elevons
    [-2.2, 2.2].forEach((x, i) => {
      const elevon = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.45), rafaleMat);
      elevon.position.set(x, 0.14, -2.35);
      group.add(elevon);
      if (i === 0) controlSurfaces.aileronsL.push(elevon);
      else controlSurfaces.aileronsR.push(elevon);
      controlSurfaces.elevators.push(elevon);
    });

    // Large Single Vertical Fin with SPECTRA ESM pod on tip
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.7, 1.5), rafaleMat);
    fin.position.set(0, 1.05, -2.1);
    const spectraPod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8), titaniumEngineMat);
    spectraPod.rotation.x = Math.PI / 2;
    spectraPod.position.set(0, 1.9, -2.1);
    group.add(fin, spectraPod);
    controlSurfaces.rudders.push(fin);

    // Twin Snecma M88 Engines
    [-0.38, 0.38].forEach((x) => {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 1.6, 16), titaniumEngineMat);
      nozzle.rotation.x = Math.PI / 2;
      nozzle.position.set(x, 0.16, -2.8);
      group.add(nozzle);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2.6, 16), flameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 0.16, -4.2);
      afterburners.push(flame);
      group.add(flame);
    });

    // Cockpit Canopy
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), canopyGlassMat);
    canopy.scale.set(0.85, 0.78, 2.4);
    canopy.position.set(0, 0.5, 0.9);
    group.add(canopy, pilotHead, pilotVisor, ejectorSeat, hudGlass);

    // Wingtip Missile Rails with MICA missiles
    [-3.8, 3.8].forEach((x) => {
      const mica = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8), missileMat);
      mica.rotation.x = Math.PI / 2;
      mica.position.set(x, 0.15, -1.8);
      group.add(mica);
    });

    cockpitPos = new THREE.Vector3(0, 0.56, 0.9);
    cannons.push(new THREE.Vector3(-0.48, 0.3, 1.6)); // GIAT 30M791 port
    missileHardpoints.push(new THREE.Vector3(-3.8, 0.15, -1.8));
    missileHardpoints.push(new THREE.Vector3(3.8, 0.15, -1.8));
    missileHardpoints.push(new THREE.Vector3(-2.0, 0.05, -1.2));
    missileHardpoints.push(new THREE.Vector3(2.0, 0.05, -1.2));
    flareEjectors.push(new THREE.Vector3(0, -0.05, -2.4));

  // -------------------------------------------------------------
  // 4. VORTEX X-99 GHOST (Forward-Swept Stealth Interceptor)
  // -------------------------------------------------------------
  } else if (type === 'vortex_ghost') {
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.88, roughness: 0.25 });
    const cyanTrim = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

    const fuseGeo = new THREE.ConeGeometry(0.65, 5.2, 16);
    fuseGeo.rotateX(Math.PI / 2);
    const fuse = new THREE.Mesh(fuseGeo, hullMat);
    fuse.position.set(0, 0.2, 0.6);
    group.add(fuse);

    // Forward-swept wings
    const wingGeo = new THREE.BoxGeometry(6.6, 0.08, 1.8);
    const wings = new THREE.Mesh(wingGeo, hullMat);
    wings.rotation.y = 0.22;
    wings.position.set(0, 0.15, -0.4);
    group.add(wings);

    // Twin afterburners
    [-0.55, 0.55].forEach((x) => {
      const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.6, 16), titaniumEngineMat);
      noz.rotation.x = Math.PI / 2;
      noz.position.set(x, 0.18, -2.6);
      group.add(noz);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.32, 2.6, 16), flameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 0.18, -4.0);
      afterburners.push(flame);
      group.add(flame);
    });

    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), canopyGlassMat);
    canopy.scale.set(0.9, 0.75, 2.2);
    canopy.position.set(0, 0.48, 0.8);
    group.add(canopy, pilotHead, pilotVisor, ejectorSeat, hudGlass);

    cockpitPos = new THREE.Vector3(0, 0.52, 0.8);
    cannons.push(new THREE.Vector3(-0.6, 0.3, 1.6));
    cannons.push(new THREE.Vector3(0.6, 0.3, 1.6));
    missileHardpoints.push(new THREE.Vector3(-2.8, 0.1, -0.4));
    missileHardpoints.push(new THREE.Vector3(2.8, 0.1, -0.4));
    flareEjectors.push(new THREE.Vector3(0, 0, -2.4));

  // -------------------------------------------------------------
  // 5. SR-72 ORBITAL DARKSTAR (Hypersonic Space Striker)
  // -------------------------------------------------------------
  } else {
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.95, roughness: 0.18 });
    const goldVisorMat = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.05 });

    const fuseShape = new THREE.Shape();
    fuseShape.moveTo(0, 4.8); // Needle radome
    fuseShape.lineTo(0.7, 1.8);
    fuseShape.lineTo(1.5, -1.2);
    fuseShape.lineTo(1.4, -3.8);
    fuseShape.lineTo(-1.4, -3.8);
    fuseShape.lineTo(-1.5, -1.2);
    fuseShape.lineTo(-0.7, 1.8);
    fuseShape.closePath();

    const fuseGeo = new THREE.ExtrudeGeometry(fuseShape, { depth: 0.42, bevelEnabled: true, bevelSize: 0.18 });
    const fuse = new THREE.Mesh(fuseGeo, darkMat);
    fuse.rotation.x = -Math.PI / 2;
    fuse.position.set(0, 0.2, 0);
    group.add(fuse);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.32, 1.8), goldVisorMat);
    visor.position.set(0, 0.48, 1.5);
    group.add(visor);

    // Scramjet delta wings
    const wingGeo = new THREE.BoxGeometry(8.4, 0.08, 2.6);
    const wing = new THREE.Mesh(wingGeo, darkMat);
    wing.position.set(0, 0.14, -1.2);
    group.add(wing);

    // Twin hypersonic combined-cycle scramjets
    [-0.9, 0.9].forEach((x) => {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 2.6, 16), titaniumEngineMat);
      nozzle.rotation.x = Math.PI / 2;
      nozzle.position.set(x, 0.18, -3.0);
      group.add(nozzle);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.42, 3.4, 16), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 0.18, -4.8);
      afterburners.push(flame);
      group.add(flame);
    });

    cockpitPos = new THREE.Vector3(0, 0.55, 1.5);
    cannons.push(new THREE.Vector3(-0.5, 0.3, 2.4));
    cannons.push(new THREE.Vector3(0.5, 0.3, 2.4));
    missileHardpoints.push(new THREE.Vector3(-3.4, 0.1, -1.2));
    missileHardpoints.push(new THREE.Vector3(3.4, 0.1, -1.2));
    flareEjectors.push(new THREE.Vector3(0, 0, -3.2));
  }

  return {
    group,
    afterburners,
    cannons,
    missileHardpoints,
    flareEjectors,
    cockpitPos,
    controlSurfaces,
  };
}

/**
 * Creates Bandits & Enemy Aircraft 3D Meshes (Su-35 Flankers, J-20 Mighty Dragons, Apex Dreadnought)
 */
export function buildEnemyMesh(type: 'drone' | 'ace' | 'mecha_striker' | 'stealth_bomber' | 'boss_apex'): THREE.Group {
  const group = new THREE.Group();
  group.name = `Enemy_${type}`;

  if (type === 'drone') {
    // Combat reconnaissance drone
    const mat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    const fuse = new THREE.Mesh(new THREE.ConeGeometry(0.35, 3.2, 12), mat);
    fuse.rotation.x = Math.PI / 2;
    group.add(fuse);

    const wings = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.9), mat);
    wings.position.set(0, 0.05, -0.3);
    group.add(wings);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), eyeMat);
    eye.position.set(0, 0.12, 0.9);
    group.add(eye);

  } else if (type === 'ace') {
    // Su-35 Flanker Ace (Red Star markings, twin engines)
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.85, roughness: 0.25 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });

    const fuse = new THREE.Mesh(new THREE.ConeGeometry(0.55, 4.6, 16), hullMat);
    fuse.rotation.x = Math.PI / 2;
    group.add(fuse);

    const wings = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.08, 1.8), redMat);
    wings.position.set(0, 0.1, -0.4);
    group.add(wings);

    // Twin vertical tails
    [-0.7, 0.7].forEach((x) => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 1.1), hullMat);
      fin.position.set(x, 0.75, -1.8);
      group.add(fin);
    });

  } else if (type === 'mecha_striker') {
    // J-20 Mighty Dragon Canard Delta Fighter
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    const fuse = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 5.2), darkMat);
    group.add(fuse);

    const canards = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.8), darkMat);
    canards.position.set(0, 0.15, 1.4);
    group.add(canards);

    const deltaWings = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.08, 2.2), darkMat);
    deltaWings.position.set(0, 0.1, -0.6);
    group.add(deltaWings);

  } else if (type === 'stealth_bomber') {
    // Heavy Flying Wing Strategic Bomber (B-21 Raider shape)
    const mat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.3 });
    const shape = new THREE.Shape();
    shape.moveTo(0, 3.6);
    shape.lineTo(8.5, -3.2);
    shape.lineTo(6.5, -4.2);
    shape.lineTo(0, -2.6);
    shape.lineTo(-6.5, -4.2);
    shape.lineTo(-8.5, -3.2);
    shape.closePath();

    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true }), mat);
    mesh.rotation.x = -Math.PI / 2;
    group.add(mesh);

  } else {
    // TITAN APEX AIR DREADNOUGHT (Flagship Boss)
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.92, roughness: 0.2 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const mainHull = new THREE.Mesh(new THREE.BoxGeometry(18, 4.2, 38), hullMat);
    group.add(mainHull);

    [-12, 12].forEach((xPos) => {
      const flank = new THREE.Mesh(new THREE.BoxGeometry(8, 2.2, 24), hullMat);
      flank.position.set(xPos, 0, -2);
      group.add(flank);

      const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 0.8, 16), hullMat);
      turret.position.set(xPos, 1.4, -2);
      group.add(turret);
    });

    const core = new THREE.Mesh(new THREE.SphereGeometry(2.8, 24, 24), coreMat);
    core.position.set(0, 0.4, 2);
    core.name = 'boss_core';
    group.add(core);
  }

  return group;
}

/**
 * Creates Collectible World Pickups
 */
export function buildPickupMesh(type: PickupType): THREE.Group {
  const group = new THREE.Group();
  group.name = `Pickup_${type}`;

  let color = 0x38bdf8;
  let coreGeo: THREE.BufferGeometry = new THREE.OctahedronGeometry(1.6, 0);

  if (type === 'speed_overdrive') {
    color = 0x38bdf8;
    coreGeo = new THREE.ConeGeometry(1.2, 2.4, 6);
  } else if (type === 'shield_restore') {
    color = 0x10b981;
    coreGeo = new THREE.IcosahedronGeometry(1.4, 0);
  } else if (type === 'quad_laser') {
    color = 0xf59e0b;
    coreGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
  } else if (type === 'missile_salvo') {
    color = 0xf43f5e;
    coreGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.2, 8);
  } else if (type === 'flare_restock') {
    color = 0xa855f7;
    coreGeo = new THREE.DodecahedronGeometry(1.3, 0);
  } else if (type === 'credit_cache') {
    color = 0xfbbf24;
    coreGeo = new THREE.TorusGeometry(1.2, 0.45, 12, 24);
  }

  const core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color }));
  core.name = 'pickup_core';
  group.add(core);

  const ringGeo = new THREE.TorusGeometry(2.4, 0.12, 12, 32);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 }));
  ring.name = 'pickup_ring';
  group.add(ring);

  return group;
}

/**
 * Creates Stunt Energy Rings
 */
export function buildStuntRing(radius = 7.0): THREE.Group {
  const group = new THREE.Group();
  const ringGeo = new THREE.TorusGeometry(radius, 0.45, 16, 48);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  group.add(ringMesh);

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 1.2, 4),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    arrow.position.set(Math.cos(angle) * (radius - 0.7), Math.sin(angle) * (radius - 0.7), 0);
    arrow.rotation.z = angle - Math.PI / 2;
    group.add(arrow);
  }

  return group;
}

export const buildEnemyAircraft = buildEnemyMesh;

