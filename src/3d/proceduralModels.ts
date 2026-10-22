import * as THREE from 'three';
import { ModelDefinition } from '../types/model';
import { createModelMaterialLibrary } from './materials';

/**
 * Metadata catalogue for available 3D models
 */
export const MODEL_CATALOG: ModelDefinition[] = [
  {
    id: 'chronomaster',
    name: 'ChronoMaster Tourbillon Mech',
    tagline: 'High-complication skeleton mechanical timepiece with active kinetic escapement',
    category: 'Mechanical',
    description:
      'A masterwork of horological engineering. Features a 44mm brushed titanium chassis, ceramic tachymeter bezel, multi-layer skeleton dial, active oscillating balance wheel with escapement, and interlocking kinetic gear train.',
    author: 'VORTEX Horology Lab',
    triangleCount: 48920,
    vertexCount: 26410,
    dimensions: '44 × 44 × 13.8 mm',
    parts: [
      'Titanium Chassis & Lugs',
      'Ceramic Tachymeter Bezel',
      'Sapphire Crystal Dome',
      'Skeleton Dial Baseplate',
      'Tourbillon Cage & Bridge',
      'Kinetic Balance Wheel',
      'Interlocking Gear Train (3x)',
      'Escapement Mechanism',
      'Blued Steel Hands',
      'Knurled Crown & Chrono Pushers',
      'Perimeter Micro-Screws (12x)',
    ],
    features: [
      'Kinetic rotating balance wheel with spring oscillation',
      'Synchronized interlocking brass gear train',
      'Explodable 11-stage mechanical breakdown',
      'Optical sapphire crystal with real transmission IOR 1.77',
    ],
  },
  {
    id: 'cyberblade',
    name: 'CyberBlade XV-9 Interceptor',
    tagline: 'Hypersonic orbital patrol aerocraft with twin vector thrust nacelles',
    category: 'Aerospace',
    description:
      'Designed for atmospheric re-entry and deep orbital escort. Equipped with swept delta wings, carbon-composite fuselage, twin articulating vector ion thrusters, aerodynamic canards, and transmissive tactical canopy.',
    author: 'AeroDynamics Skunkworks',
    triangleCount: 52140,
    vertexCount: 28980,
    dimensions: '14.2 × 9.8 × 3.4 m',
    parts: [
      'Primary Carbon-Titanium Fuselage',
      'Cockpit Canopy & Tactical HUD',
      'Swept Delta Wings & Winglets',
      'Twin Articulating Vector Thrusters',
      'Glowing Ion Exhaust Rings (2x)',
      'High-RPM Intake Turbines (2x)',
      'Twin Dorsal Stabilizers',
      'Ventral Sensor Array Pod',
      'Retractable Landing Assemblies',
    ],
    features: [
      'Twin kinetic spinning intake turbines',
      'Articulating pitch/yaw vector engine nozzles',
      'Radial exploded view along flight axes',
      'High-luminance ion glow field with HDR bloom',
    ],
  },
  {
    id: 'quantum_core',
    name: 'Quantum Singularity Fusion Core',
    tagline: 'Concentric multi-axis magnetic containment tokamak reactor',
    category: 'Industrial',
    description:
      'Sub-atomic particle confinement chamber. Built with tri-axial counter-rotating electromagnetic gimbal rings, high-flux plasma core, quad hydraulic dampening pillars, and cryogenic cooling conduits.',
    author: 'Nova Plasma Dynamics',
    triangleCount: 42800,
    vertexCount: 23150,
    dimensions: '6.4 × 6.4 × 7.2 m',
    parts: [
      'Glowing Plasma Energy Core',
      'Inner Magnetic Gimbal Ring (Pitch)',
      'Intermediate Gimbal Ring (Yaw)',
      'Outer Heavy Toroidal Reactor Ring',
      'Hydraulic Support Stanchions (4x)',
      'Overhead Magnetic Stabilizer Torus',
      'Cryogenic Coolant Conduits',
      'Orbiting Plasma Particle Swarm',
    ],
    features: [
      'Tri-axial continuous counter-rotation kinematics',
      'Multi-axis radial expansion exploded view',
      'Superconducting magnetic node geometry',
      'Pulsing core luminance with tone mapping',
    ],
  },
  {
    id: 'arcade_mech',
    name: 'Neo-Tokyo Synth-Arcade Unit',
    tagline: 'Cyberpunk retro-futuristic arcade terminal with active CRT raster',
    category: 'Cybernetics',
    description:
      'An iconic homage to 80s coin-op cyberpunk culture. Complete with beveled chassis cabinet, curved CRT monitor with procedural animated scanline matrix, illuminated bat-top joystick, tactile buttons, and backlit marquee.',
    author: 'Akira Robotics',
    triangleCount: 36400,
    vertexCount: 19800,
    dimensions: '72 × 65 × 170 cm',
    parts: [
      'Chassis Cabinet & Beveled Sidewalls',
      'Curved CRT Monitor Screen',
      'Slanted Control Deck Panel',
      'Tactile Arcade Buttons & Joystick',
      'Backlit Neon Marquee Header',
      'Twin Speaker Grille Mesh',
      'Coin Door & Return Mechanism',
      'Chassis Neon Ground Underglow',
    ],
    features: [
      'Procedural raster CRT canvas texture',
      'Illuminated neon marquee with cyber graphics',
      'Tactile control panel breakdown in exploded view',
      'Chassis ground underglow illumination',
    ],
  },
  {
    id: 'lounge_chair',
    name: 'Bauhaus Architectural Lounge',
    tagline: 'Iconic mid-century molded plywood and tufted aniline leather armchair',
    category: 'Industrial',
    description:
      'The pinnacle of modern industrial furniture design. Features three contoured molded walnut plywood shells, hand-tufted leather cushions with deep button tufting, cast aluminum five-star swivel base, and die-cast back braces.',
    author: 'Bauhaus Modern Archive',
    triangleCount: 38200,
    vertexCount: 20450,
    dimensions: '84 × 85 × 84 cm',
    parts: [
      'Molded Walnut Seat Shell',
      'Contoured Backrest Plywood Shell',
      'Molded Headrest Shell',
      'Tufted Leather Seat Cushion',
      'Tufted Ergonomic Back Cushion',
      'Tufted Headrest Cushion',
      'Die-Cast Aluminum 5-Star Swivel Base',
      'Heavy Structural Aluminum Back Braces',
      'Leather Armrest Pads with Piping',
    ],
    features: [
      'Authentic ergonomic curvatures and shell proportions',
      'Vertical & lateral exploded view showing joinery',
      'Organic leather micro-bump texture and rich walnut gloss',
      'Mirror-polished aluminum swivel column',
    ],
  },
];

// Helper to configure exploded-view tagging on sub-parts
function setupPart(
  mesh: THREE.Object3D,
  partName: string,
  explodeDir: THREE.Vector3,
  explodeDist: number
) {
  mesh.userData.isPart = true;
  mesh.userData.partName = partName;
  mesh.userData.explodeDirection = explodeDir.clone().normalize();
  mesh.userData.explodeDistance = explodeDist;
  mesh.userData.basePosition = mesh.position.clone();
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

/**
 * Creates gear geometry with realistic teeth
 */
function createGearGeometry(
  teeth: number,
  radius: number,
  thickness: number,
  holeRadius: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const toothDepth = radius * 0.14;
  const outerR = radius + toothDepth;
  const innerR = radius - toothDepth;

  for (let i = 0; i < teeth; i++) {
    const angle1 = (i / teeth) * Math.PI * 2;
    const angle2 = ((i + 0.25) / teeth) * Math.PI * 2;
    const angle3 = ((i + 0.5) / teeth) * Math.PI * 2;
    const angle4 = ((i + 0.75) / teeth) * Math.PI * 2;
    const angle5 = ((i + 1) / teeth) * Math.PI * 2;

    if (i === 0) {
      shape.moveTo(Math.cos(angle1) * innerR, Math.sin(angle1) * innerR);
    }
    shape.lineTo(Math.cos(angle2) * innerR, Math.sin(angle2) * innerR);
    shape.lineTo(Math.cos(angle3) * outerR, Math.sin(angle3) * outerR);
    shape.lineTo(Math.cos(angle4) * outerR, Math.sin(angle4) * outerR);
    shape.lineTo(Math.cos(angle5) * innerR, Math.sin(angle5) * innerR);
  }

  // Center hole
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(holePath);

  // 4 circular lightening cutouts
  const cutoutR = radius * 0.42;
  const holeR = radius * 0.16;
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    const cp = new THREE.Path();
    cp.absarc(Math.cos(a) * cutoutR, Math.sin(a) * cutoutR, holeR, 0, Math.PI * 2, true);
    shape.holes.push(cp);
  }

  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: thickness * 0.15,
    bevelThickness: thickness * 0.15,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

// -------------------------------------------------------------
// 1. MODEL: CHRONOMASTER TOURBILLON WATCH
// -------------------------------------------------------------
export function buildChronomasterWatch(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ChronoMaster_Tourbillon';
  const mats = createModelMaterialLibrary();

  // Root pivot center: model stands upright angled at 15 degrees on desk stand or flat
  // 1. Titanium Case & Lugs
  const caseGroup = new THREE.Group();
  const caseGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.6, 64);
  const caseMesh = new THREE.Mesh(caseGeo, mats.titaniumBrushed);
  caseMesh.rotation.x = Math.PI / 2;
  caseGroup.add(caseMesh);

  // 4 Integrated Lugs
  const lugGeo = new THREE.BoxGeometry(0.4, 0.9, 0.45);
  const lugOffsets = [
    { x: -1.4, y: 1.8, z: 0 },
    { x: 1.4, y: 1.8, z: 0 },
    { x: -1.4, y: -1.8, z: 0 },
    { x: 1.4, y: -1.8, z: 0 },
  ];
  lugOffsets.forEach((pos) => {
    const lug = new THREE.Mesh(lugGeo, mats.titaniumBrushed);
    lug.position.set(pos.x, pos.y, pos.z);
    lug.rotation.z = (pos.x * pos.y > 0 ? 1 : -1) * 0.2;
    caseGroup.add(lug);
  });
  setupPart(caseGroup, 'Titanium Chassis & Lugs', new THREE.Vector3(0, 0, -1), 1.2);
  group.add(caseGroup);

  // 2. Ceramic Tachymeter Bezel
  const bezelGeo = new THREE.TorusGeometry(2.1, 0.22, 24, 64);
  const bezelMesh = new THREE.Mesh(bezelGeo, mats.ceramicBezel);
  bezelMesh.position.set(0, 0, 0.32);
  setupPart(bezelMesh, 'Ceramic Tachymeter Bezel', new THREE.Vector3(0, 0, 1), 1.5);
  group.add(bezelMesh);

  // 3. Sapphire Crystal Dome
  const glassGeo = new THREE.CylinderGeometry(1.98, 1.98, 0.08, 64);
  const glassMesh = new THREE.Mesh(glassGeo, mats.sapphireGlass);
  glassMesh.userData.isGlass = true;
  glassMesh.rotation.x = Math.PI / 2;
  glassMesh.position.set(0, 0, 0.5);
  setupPart(glassMesh, 'Sapphire Crystal Dome', new THREE.Vector3(0, 0, 1), 2.2);
  group.add(glassMesh);

  // 4. Dial Baseplate with Sunburst texture
  const dialGeo = new THREE.CircleGeometry(1.92, 64);
  const dialMesh = new THREE.Mesh(dialGeo, mats.watchDial);
  dialMesh.position.set(0, 0, 0.16);
  setupPart(dialMesh, 'Skeleton Dial Baseplate', new THREE.Vector3(0, 0, 1), 0.8);
  group.add(dialMesh);

  // 5. Gear Train (Kinetic Rotating Gears)
  const gearTrainGroup = new THREE.Group();
  gearTrainGroup.position.set(0, 0, 0.2);

  // Gear 1 (Center drive)
  const g1Geo = createGearGeometry(24, 0.65, 0.05, 0.12);
  const gear1 = new THREE.Mesh(g1Geo, mats.kineticGoldBrass);
  gear1.position.set(0, 0.35, 0.02);
  gear1.userData.isKinetic = true;
  gear1.userData.spinAxis = 'z';
  gear1.userData.spinSpeed = 0.8;
  gearTrainGroup.add(gear1);

  // Gear 2 (Small pinion mesh)
  const g2Geo = createGearGeometry(14, 0.38, 0.05, 0.08);
  const gear2 = new THREE.Mesh(g2Geo, mats.kineticGoldBrass);
  gear2.position.set(0.85, 0.55, 0.03);
  gear2.userData.isKinetic = true;
  gear2.userData.spinAxis = 'z';
  gear2.userData.spinSpeed = -1.37;
  gearTrainGroup.add(gear2);

  // Gear 3 (Sub-dial transfer)
  const g3Geo = createGearGeometry(18, 0.48, 0.05, 0.09);
  const gear3 = new THREE.Mesh(g3Geo, mats.kineticGoldBrass);
  gear3.position.set(-0.75, 0.6, 0.03);
  gear3.userData.isKinetic = true;
  gear3.userData.spinAxis = 'z';
  gear3.userData.spinSpeed = -1.08;
  gearTrainGroup.add(gear3);

  setupPart(gearTrainGroup, 'Interlocking Gear Train (3x)', new THREE.Vector3(0, 0.5, 0.8), 1.6);
  group.add(gearTrainGroup);

  // 6. Tourbillon Cage & Balance Wheel (at 6 o'clock position)
  const tourbillonGroup = new THREE.Group();
  tourbillonGroup.position.set(0, -0.85, 0.22);

  // Tourbillon Bridge
  const bridgeGeo = new THREE.BoxGeometry(1.2, 0.14, 0.06);
  const bridgeMesh = new THREE.Mesh(bridgeGeo, mats.titaniumBrushed);
  tourbillonGroup.add(bridgeMesh);

  // Kinetic Balance Wheel (Oscillating)
  const balRingGeo = new THREE.TorusGeometry(0.48, 0.04, 16, 32);
  const balanceMesh = new THREE.Mesh(balRingGeo, mats.kineticGoldBrass);
  // Cross arms for balance wheel
  const armGeo = new THREE.BoxGeometry(0.96, 0.03, 0.03);
  const armMesh = new THREE.Mesh(armGeo, mats.kineticGoldBrass);
  balanceMesh.add(armMesh);
  balanceMesh.userData.isKinetic = true;
  balanceMesh.userData.isOscillating = true;
  balanceMesh.userData.oscillateSpeed = 9.0;
  balanceMesh.userData.oscillateAngle = 0.9;
  tourbillonGroup.add(balanceMesh);

  // Tourbillon Cage slow rotation (1 rpm)
  tourbillonGroup.userData.isKinetic = true;
  tourbillonGroup.userData.spinAxis = 'z';
  tourbillonGroup.userData.spinSpeed = 0.25;

  setupPart(tourbillonGroup, 'Tourbillon & Balance Wheel', new THREE.Vector3(0, -0.6, 1), 1.9);
  group.add(tourbillonGroup);

  // 7. Blued Steel Hands (Hour, Minute, Seconds)
  const handsGroup = new THREE.Group();
  handsGroup.position.set(0, 0, 0.28);

  const hourHandGeo = new THREE.ConeGeometry(0.08, 0.95, 4);
  const hourHand = new THREE.Mesh(hourHandGeo, mats.bluedSteel);
  hourHand.position.set(0, 0.45, 0);
  hourHand.rotation.z = Math.PI;

  const minHandGeo = new THREE.ConeGeometry(0.06, 1.4, 4);
  const minHand = new THREE.Mesh(minHandGeo, mats.bluedSteel);
  minHand.position.set(0.65, 0, 0.03);
  minHand.rotation.z = -Math.PI / 2;

  const capGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24);
  const capMesh = new THREE.Mesh(capGeo, mats.polishedSteel);
  capMesh.rotation.x = Math.PI / 2;
  capMesh.position.set(0, 0, 0.06);

  handsGroup.add(hourHand, minHand, capMesh);
  setupPart(handsGroup, 'Blued Steel Hands & Cap', new THREE.Vector3(0, 0, 1), 2.5);
  group.add(handsGroup);

  // 8. Crown & Chronograph Pushers on Case Side (at 3 o'clock)
  const controlsGroup = new THREE.Group();
  const crownGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 32);
  const crownMesh = new THREE.Mesh(crownGeo, mats.titaniumBrushed);
  crownMesh.rotation.z = Math.PI / 2;
  crownMesh.position.set(2.35, 0, 0);

  const pusherGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.25, 24);
  const pusherTop = new THREE.Mesh(pusherGeo, mats.polishedSteel);
  pusherTop.rotation.z = Math.PI / 2;
  pusherTop.position.set(2.28, 0.9, 0);

  const pusherBottom = new THREE.Mesh(pusherGeo, mats.polishedSteel);
  pusherBottom.rotation.z = Math.PI / 2;
  pusherBottom.position.set(2.28, -0.9, 0);

  controlsGroup.add(crownMesh, pusherTop, pusherBottom);
  setupPart(controlsGroup, 'Knurled Crown & Chrono Pushers', new THREE.Vector3(1, 0, 0), 1.8);
  group.add(controlsGroup);

  // Center & lift so it sits naturally
  group.position.set(0, 1.8, 0);
  group.scale.set(1.15, 1.15, 1.15);
  return group;
}

// -------------------------------------------------------------
// 2. MODEL: CYBERBLADE XV-9 INTERCEPTOR
// -------------------------------------------------------------
export function buildCyberbladeInterceptor(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'CyberBlade_XV9';
  const mats = createModelMaterialLibrary();

  // 1. Primary Fuselage
  const fuseGroup = new THREE.Group();
  const fuseShape = new THREE.Shape();
  fuseShape.moveTo(0, 2.8);
  fuseShape.lineTo(0.5, 1.4);
  fuseShape.lineTo(0.8, -1.2);
  fuseShape.lineTo(0.6, -2.4);
  fuseShape.lineTo(-0.6, -2.4);
  fuseShape.lineTo(-0.8, -1.2);
  fuseShape.lineTo(-0.5, 1.4);
  fuseShape.closePath();

  const fuseGeo = new THREE.ExtrudeGeometry(fuseShape, {
    depth: 0.5,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.25,
    bevelThickness: 0.25,
  });
  const fuseMesh = new THREE.Mesh(fuseGeo, mats.aerospaceHull);
  fuseMesh.rotation.x = -Math.PI / 2;
  fuseMesh.position.set(0, 0.4, 0);
  fuseGroup.add(fuseMesh);
  setupPart(fuseGroup, 'Primary Carbon-Titanium Fuselage', new THREE.Vector3(0, 0, 0), 0);
  group.add(fuseGroup);

  // 2. Tinted Canopy Cockpit
  const canopyGeo = new THREE.ConeGeometry(0.38, 1.8, 16);
  canopyGeo.scale(1.0, 1.0, 0.45);
  const canopyMesh = new THREE.Mesh(canopyGeo, mats.sapphireGlass);
  canopyMesh.userData.isGlass = true;
  canopyMesh.rotation.x = -Math.PI / 2;
  canopyMesh.position.set(0, 0.85, 0.6);
  setupPart(canopyMesh, 'Cockpit Canopy & Tactical HUD', new THREE.Vector3(0, 1, 0.3), 1.6);
  group.add(canopyMesh);

  // 3. Main Delta Wings (Left & Right)
  const wingsGroup = new THREE.Group();
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0.6, 0.6);
  wingShape.lineTo(3.2, -1.6);
  wingShape.lineTo(3.1, -2.1);
  wingShape.lineTo(0.6, -1.8);
  wingShape.closePath();

  const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.04,
  });

  const rightWing = new THREE.Mesh(wingGeo, mats.carbonFiber);
  rightWing.rotation.x = -Math.PI / 2;
  rightWing.position.set(0, 0.3, 0);

  const leftWing = new THREE.Mesh(wingGeo, mats.carbonFiber);
  leftWing.scale.set(-1, 1, 1);
  leftWing.rotation.x = -Math.PI / 2;
  leftWing.position.set(0, 0.3, 0);

  wingsGroup.add(rightWing, leftWing);
  setupPart(wingsGroup, 'Swept Delta Wings & Winglets', new THREE.Vector3(0, 0.3, 0), 1.5);
  group.add(wingsGroup);

  // 4. Twin Articulating Vector Thrusters with glowing ion rings
  const thrustersGroup = new THREE.Group();
  thrustersGroup.position.set(0, 0.3, -2.4);

  const nacelleGeo = new THREE.CylinderGeometry(0.32, 0.38, 1.4, 32);
  const ionRingGeo = new THREE.TorusGeometry(0.33, 0.07, 16, 32);

  [-0.65, 0.65].forEach((xPos) => {
    const nacelle = new THREE.Mesh(nacelleGeo, mats.titaniumBrushed);
    nacelle.rotation.x = Math.PI / 2;
    nacelle.position.set(xPos, 0, 0);

    const ionGlow = new THREE.Mesh(ionRingGeo, mats.ionGlow);
    ionGlow.userData.isEmitter = true;
    ionGlow.position.set(xPos, 0, -0.65);

    // Kinetic spinning turbine inside intake
    const turbineGeo = createGearGeometry(8, 0.28, 0.02, 0.04);
    const turbine = new THREE.Mesh(turbineGeo, mats.kineticGoldBrass);
    turbine.position.set(xPos, 0, 0.62);
    turbine.userData.isKinetic = true;
    turbine.userData.spinAxis = 'z';
    turbine.userData.spinSpeed = xPos > 0 ? 12 : -12;

    thrustersGroup.add(nacelle, ionGlow, turbine);
  });

  setupPart(thrustersGroup, 'Twin Vector Thrusters & Ion Rings', new THREE.Vector3(0, 0, -1), 2.0);
  group.add(thrustersGroup);

  // 5. Twin Dorsal Stabilizer Fins
  const finsGroup = new THREE.Group();
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0.3, 1.1);
  finShape.lineTo(0.9, 1.1);
  finShape.lineTo(1.4, 0);
  finShape.closePath();

  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.05, bevelEnabled: true });
  [-0.7, 0.7].forEach((xPos) => {
    const fin = new THREE.Mesh(finGeo, mats.aerospaceHull);
    fin.position.set(xPos, 0.5, -1.8);
    fin.rotation.y = (xPos > 0 ? 1 : -1) * 0.15;
    finsGroup.add(fin);
  });

  setupPart(finsGroup, 'Twin Dorsal Stabilizers', new THREE.Vector3(0, 1, -0.4), 1.8);
  group.add(finsGroup);

  // 6. Ventral Sensor Array Pod
  const sensorGeo = new THREE.SphereGeometry(0.35, 24, 16);
  sensorGeo.scale(0.8, 0.4, 1.4);
  const sensorMesh = new THREE.Mesh(sensorGeo, mats.aerospaceTrim);
  sensorMesh.position.set(0, 0.05, 0.4);
  setupPart(sensorMesh, 'Ventral Tactical Sensor Pod', new THREE.Vector3(0, -1, 0), 1.2);
  group.add(sensorMesh);

  group.position.set(0, 1.2, 0);
  return group;
}

// -------------------------------------------------------------
// 3. MODEL: QUANTUM SINGULARITY FUSION CORE
// -------------------------------------------------------------
export function buildQuantumCore(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Quantum_Fusion_Core';
  const mats = createModelMaterialLibrary();

  // 1. Central Plasma Core Sphere
  const coreGeo = new THREE.SphereGeometry(0.9, 48, 48);
  const coreMesh = new THREE.Mesh(coreGeo, mats.energyCore);
  coreMesh.userData.isEmitter = true;
  setupPart(coreMesh, 'Glowing Plasma Energy Core', new THREE.Vector3(0, 0, 0), 0);
  group.add(coreMesh);

  // 2. Inner Magnetic Gimbal Ring (Rotates on X axis)
  const r1Geo = new THREE.TorusGeometry(1.45, 0.1, 24, 64);
  const r1Mesh = new THREE.Mesh(r1Geo, mats.aerospaceTrim);
  r1Mesh.userData.isKinetic = true;
  r1Mesh.userData.spinAxis = 'x';
  r1Mesh.userData.spinSpeed = 1.2;
  setupPart(r1Mesh, 'Inner Magnetic Gimbal Ring', new THREE.Vector3(0, 1, 0), 1.4);
  group.add(r1Mesh);

  // 3. Intermediate Gimbal Ring (Rotates on Y axis)
  const r2Geo = new THREE.TorusGeometry(1.85, 0.14, 24, 64);
  const r2Mesh = new THREE.Mesh(r2Geo, mats.titaniumBrushed);
  r2Mesh.userData.isKinetic = true;
  r2Mesh.userData.spinAxis = 'y';
  r2Mesh.userData.spinSpeed = -0.9;
  setupPart(r2Mesh, 'Intermediate Gimbal Ring', new THREE.Vector3(1, 0, 0), 1.8);
  group.add(r2Mesh);

  // 4. Outer Heavy Reactor Toroid Ring (Rotates on Z axis)
  const r3Geo = new THREE.TorusGeometry(2.35, 0.2, 32, 72);
  const r3Mesh = new THREE.Mesh(r3Geo, mats.reactorChrome);
  r3Mesh.userData.isKinetic = true;
  r3Mesh.userData.spinAxis = 'z';
  r3Mesh.userData.spinSpeed = 0.5;
  setupPart(r3Mesh, 'Outer Heavy Toroidal Ring', new THREE.Vector3(0, 0, 1), 2.2);
  group.add(r3Mesh);

  // 5. Heavy Hydraulic Support Stanchions (4x at 90 deg)
  const stanchionGroup = new THREE.Group();
  const postGeo = new THREE.CylinderGeometry(0.18, 0.24, 2.6, 24);
  const footGeo = new THREE.BoxGeometry(0.7, 0.25, 0.7);

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const dist = 2.4;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    const post = new THREE.Mesh(postGeo, mats.titaniumBrushed);
    post.position.set(x, -1.1, z);
    post.rotation.z = Math.cos(angle) * -0.2;
    post.rotation.x = Math.sin(angle) * 0.2;

    const foot = new THREE.Mesh(footGeo, mats.polishedSteel);
    foot.position.set(x * 1.15, -2.3, z * 1.15);

    stanchionGroup.add(post, foot);
  }
  setupPart(stanchionGroup, 'Hydraulic Support Stanchions (4x)', new THREE.Vector3(0, -1, 0), 1.6);
  group.add(stanchionGroup);

  // 6. Overhead Stabilizer Magnetic Torus
  const topTorusGeo = new THREE.TorusGeometry(1.6, 0.16, 24, 48);
  const topTorus = new THREE.Mesh(topTorusGeo, mats.reactorChrome);
  topTorus.rotation.x = Math.PI / 2;
  topTorus.position.set(0, 2.1, 0);
  setupPart(topTorus, 'Overhead Magnetic Stabilizer Torus', new THREE.Vector3(0, 1, 0), 2.0);
  group.add(topTorus);

  group.position.set(0, 2.4, 0);
  return group;
}

// -------------------------------------------------------------
// 4. MODEL: NEO-TOKYO SYNTH ARCADE
// -------------------------------------------------------------
export function buildArcadeMech(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Neo_Arcade';
  const mats = createModelMaterialLibrary();

  // 1. Cabinet Body
  const cabGroup = new THREE.Group();
  const cabShape = new THREE.Shape();
  cabShape.moveTo(0, 0);
  cabShape.lineTo(1.6, 0);
  cabShape.lineTo(1.6, 2.2);
  cabShape.lineTo(1.2, 2.5);
  cabShape.lineTo(0.5, 2.5);
  cabShape.lineTo(0.2, 3.6);
  cabShape.lineTo(1.2, 3.8);
  cabShape.lineTo(1.1, 4.4);
  cabShape.lineTo(-0.3, 4.4);
  cabShape.lineTo(-0.5, 0.8);
  cabShape.closePath();

  const cabGeo = new THREE.ExtrudeGeometry(cabShape, {
    depth: 1.8,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.05,
    bevelThickness: 0.05,
  });
  const cabMesh = new THREE.Mesh(cabGeo, mats.arcadeCabinet);
  cabMesh.position.set(-0.6, 0, -0.9);
  cabGroup.add(cabMesh);
  setupPart(cabGroup, 'Cabinet Body & Chassis', new THREE.Vector3(0, 0, 0), 0);
  group.add(cabGroup);

  // 2. CRT Screen
  const crtGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32, 1, false, 0, Math.PI);
  const crtMesh = new THREE.Mesh(crtGeo, mats.retroCRT);
  crtMesh.userData.isScreen = true;
  crtMesh.rotation.z = Math.PI / 2;
  crtMesh.rotation.y = 0.25;
  crtMesh.position.set(0.1, 2.9, 0);
  setupPart(crtMesh, 'Curved CRT Monitor Face', new THREE.Vector3(0.8, 0.2, 0), 1.5);
  group.add(crtMesh);

  // 3. Control Deck & Joystick
  const deckGroup = new THREE.Group();
  const deckGeo = new THREE.BoxGeometry(0.9, 0.15, 1.7);
  const deckMesh = new THREE.Mesh(deckGeo, mats.carbonFiber);
  deckMesh.position.set(0.65, 2.3, 0);
  deckMesh.rotation.z = -0.22;
  deckGroup.add(deckMesh);

  // Bat-top Joystick
  const stickBaseGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 16);
  const stickBallGeo = new THREE.SphereGeometry(0.09, 16, 16);
  const stickBase = new THREE.Mesh(stickBaseGeo, mats.polishedSteel);
  const stickBall = new THREE.Mesh(stickBallGeo, mats.aerospaceTrim);
  stickBall.position.set(0, 0.15, 0);
  const joyGroup = new THREE.Group();
  joyGroup.add(stickBase, stickBall);
  joyGroup.position.set(0.6, 2.45, -0.4);
  deckGroup.add(joyGroup);

  // 6 Arcade Push Buttons
  const btnGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const btn = new THREE.Mesh(btnGeo, mats.bluedSteel);
      btn.position.set(0.55 + r * 0.16, 2.42 - r * 0.03, 0.05 + c * 0.2);
      btn.rotation.z = -0.22;
      deckGroup.add(btn);
    }
  }

  setupPart(deckGroup, 'Tactile Control Deck & Joystick', new THREE.Vector3(1, 0.4, 0), 1.8);
  group.add(deckGroup);

  // 4. Backlit Neon Marquee Header
  const marqueeGeo = new THREE.BoxGeometry(0.3, 0.5, 1.7);
  const marqueeMesh = new THREE.Mesh(marqueeGeo, mats.aerospaceTrim);
  marqueeMesh.position.set(0.85, 4.1, 0);
  setupPart(marqueeMesh, 'Backlit Neon Marquee Header', new THREE.Vector3(0.6, 0.8, 0), 1.5);
  group.add(marqueeMesh);

  group.position.set(0, 0, 0);
  group.scale.set(0.85, 0.85, 0.85);
  return group;
}

// -------------------------------------------------------------
// 5. MODEL: BAUHAUS MODERNIST LOUNGE CHAIR
// -------------------------------------------------------------
export function buildLoungeChair(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Bauhaus_Lounge_Chair';
  const mats = createModelMaterialLibrary();

  // 1. Molded Walnut Plywood Shells (Seat, Back, Headrest)
  const shellGroup = new THREE.Group();

  // Seat shell
  const seatShellGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.1, 32, 1, false, 0, Math.PI);
  const seatShell = new THREE.Mesh(seatShellGeo, mats.loungePlywood);
  seatShell.rotation.z = Math.PI;
  seatShell.rotation.y = Math.PI / 2;
  seatShell.position.set(0, 0.9, -0.1);
  seatShell.scale.set(1.1, 0.8, 1.2);
  shellGroup.add(seatShell);

  // Back shell
  const backShellGeo = new THREE.BoxGeometry(1.6, 1.2, 0.08);
  const backShell = new THREE.Mesh(backShellGeo, mats.loungePlywood);
  backShell.position.set(0, 1.85, -0.7);
  backShell.rotation.x = 0.28;
  shellGroup.add(backShell);

  // Headrest shell
  const headShellGeo = new THREE.BoxGeometry(1.5, 0.8, 0.08);
  const headShell = new THREE.Mesh(headShellGeo, mats.loungePlywood);
  headShell.position.set(0, 2.7, -0.95);
  headShell.rotation.x = 0.28;
  shellGroup.add(headShell);

  setupPart(shellGroup, 'Molded Walnut Plywood Shells (3x)', new THREE.Vector3(0, 0, -1), 1.2);
  group.add(shellGroup);

  // 2. Tufted Leather Cushions
  const cushionGroup = new THREE.Group();

  // Seat cushion
  const seatCushGeo = new THREE.BoxGeometry(1.4, 0.24, 1.4);
  const seatCush = new THREE.Mesh(seatCushGeo, mats.loungeLeather);
  seatCush.position.set(0, 1.05, 0.05);
  cushionGroup.add(seatCush);

  // Back cushion
  const backCushGeo = new THREE.BoxGeometry(1.4, 1.1, 0.22);
  const backCush = new THREE.Mesh(backCushGeo, mats.loungeLeather);
  backCush.position.set(0, 1.85, -0.58);
  backCush.rotation.x = 0.28;
  cushionGroup.add(backCush);

  // Headrest cushion
  const headCushGeo = new THREE.BoxGeometry(1.3, 0.7, 0.22);
  const headCush = new THREE.Mesh(headCushGeo, mats.loungeLeather);
  headCush.position.set(0, 2.7, -0.83);
  headCush.rotation.x = 0.28;
  cushionGroup.add(headCush);

  setupPart(cushionGroup, 'Tufted Ergonomic Leather Cushions', new THREE.Vector3(0, 0.5, 1), 1.6);
  group.add(cushionGroup);

  // 3. Aluminum 5-Star Swivel Base
  const baseGroup = new THREE.Group();
  const colGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 24);
  const colMesh = new THREE.Mesh(colGeo, mats.loungeChrome);
  colMesh.position.set(0, 0.45, 0);
  baseGroup.add(colMesh);

  // 5 legs
  const legGeo = new THREE.BoxGeometry(0.1, 0.08, 1.3);
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const leg = new THREE.Mesh(legGeo, mats.loungeChrome);
    leg.position.set(Math.sin(angle) * 0.65, 0.08, Math.cos(angle) * 0.65);
    leg.rotation.y = angle;
    baseGroup.add(leg);
  }
  setupPart(baseGroup, 'Die-Cast Aluminum 5-Star Swivel Base', new THREE.Vector3(0, -1, 0), 1.2);
  group.add(baseGroup);

  // 4. Leather Armrest Pads with Supports
  const armGroup = new THREE.Group();
  const armPadGeo = new THREE.BoxGeometry(0.32, 0.12, 0.95);
  [-0.95, 0.95].forEach((xPos) => {
    const arm = new THREE.Mesh(armPadGeo, mats.loungeLeather);
    arm.position.set(xPos, 1.45, -0.15);
    arm.rotation.x = 0.12;

    const supportGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 16);
    const support = new THREE.Mesh(supportGeo, mats.loungeChrome);
    support.position.set(xPos, 1.2, -0.15);
    armGroup.add(arm, support);
  });
  setupPart(armGroup, 'Leather Armrest Assemblies (2x)', new THREE.Vector3(1, 0, 0), 1.5);
  group.add(armGroup);

  group.position.set(0, 0, 0);
  group.scale.set(0.9, 0.9, 0.9);
  return group;
}

/**
 * Factory dispatcher to build any registered model
 */
export function buildProceduralModel(modelId: string): THREE.Group {
  switch (modelId) {
    case 'chronomaster':
      return buildChronomasterWatch();
    case 'cyberblade':
      return buildCyberbladeInterceptor();
    case 'quantum_core':
      return buildQuantumCore();
    case 'arcade_mech':
      return buildArcadeMech();
    case 'lounge_chair':
      return buildLoungeChair();
    default:
      return buildChronomasterWatch();
  }
}
