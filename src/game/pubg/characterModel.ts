import * as THREE from 'three';
import { WeaponType } from '../../types/pubg';
import { buildWeaponMesh } from './weaponModels';

export interface CharacterMeshController {
  root: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  weaponMount: THREE.Group;
  helmetMount: THREE.Group;
  vestMount: THREE.Group;
  backpackMount: THREE.Group;
  parachuteGroup: THREE.Group;
  updateAnimation: (
    deltaTime: number,
    speed: number,
    isSprinting: boolean,
    isCrouching: boolean,
    isAiming: boolean,
    isParachuting: boolean,
    pitch: number
  ) => void;
  setEquippedWeapon: (type: WeaponType | null) => void;
  setHelmetLevel: (lvl: number | null) => void;
  setVestLevel: (lvl: number | null) => void;
}

export function createCharacterModel(isBot = false): CharacterMeshController {
  const root = new THREE.Group();

  // High-fidelity materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xd4a373,
    roughness: 0.65,
    metalness: 0.05,
  });
  const camoMat = new THREE.MeshStandardMaterial({
    color: isBot ? 0x3d4b38 : 0x2e382b,
    roughness: 0.75,
    metalness: 0.1,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: isBot ? 0x474036 : 0x2b2824,
    roughness: 0.8,
  });
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.5,
    metalness: 0.3,
  });
  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x141417,
    roughness: 0.45,
    metalness: 0.2,
  });
  const gloveMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    roughness: 0.6,
  });
  const goggleLensMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.9,
    reflectivity: 0.9,
  });

  // 1. Torso Group
  const torso = new THREE.Group();
  torso.position.y = 0.95; // Hip level
  root.add(torso);

  // Upper Body Chest
  const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.22), camoMat);
  chestMesh.position.y = 0.24;
  chestMesh.castShadow = true;
  torso.add(chestMesh);

  // Tactical Web Belt with Buckle
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(0.39, 0.06, 0.23),
    new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 })
  );
  belt.position.y = 0.03;
  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.07, 0.24),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
  );
  buckle.position.set(0, 0.03, 0.01);
  torso.add(belt, buckle);

  // Tactical Vest Mount (MOLLE Plate Carrier)
  const vestMount = new THREE.Group();
  vestMount.position.y = 0.24;
  torso.add(vestMount);

  // Default Plate Carrier with ammo pouches
  const defaultVest = new THREE.Group();
  const vestPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.44, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x333b2e, roughness: 0.8 })
  );
  vestPlate.castShadow = true;
  // 3x AR Mag Pouches on chest
  for (let i = -1; i <= 1; i++) {
    const pouch = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.15, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x242a20, roughness: 0.85 })
    );
    pouch.position.set(i * 0.1, -0.06, 0.14);
    defaultVest.add(pouch);
  }
  defaultVest.add(vestPlate);
  vestMount.add(defaultVest);

  // Radio Antenna on shoulder
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.22, 6),
    new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9 })
  );
  antenna.position.set(0.16, 0.35, -0.08);
  torso.add(antenna);

  // Backpack Mount (back of torso)
  const backpackMount = new THREE.Group();
  backpackMount.position.set(0, 0.24, -0.16);
  torso.add(backpackMount);

  // Default assault pack
  const defaultPack = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.38, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 })
  );
  defaultPack.castShadow = true;
  backpackMount.add(defaultPack);

  // 2. Head Group
  const head = new THREE.Group();
  head.position.set(0, 0.55, 0);
  torso.add(head);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 14), skinMat);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Comms Headset with boom mic
  const headsetBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.125, 0.012, 6, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 })
  );
  headsetBand.position.set(0, 0.04, 0);
  headsetBand.rotation.z = Math.PI;

  const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), padMat);
  earL.rotation.z = Math.PI / 2;
  earL.position.set(-0.13, 0.02, 0);
  const earR = earL.clone();
  earR.position.x = 0.13;

  const boomMic = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 6), padMat);
  boomMic.position.set(-0.1, -0.04, 0.06);
  boomMic.rotation.x = Math.PI / 3;

  head.add(headsetBand, earL, earR, boomMic);

  // Tactical Ballistic Sunglasses / Goggles
  const goggles = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.045, 0.04), goggleLensMat);
  goggles.position.set(0, 0.02, 0.11);
  head.add(goggles);

  // Helmet Mount
  const helmetMount = new THREE.Group();
  helmetMount.position.y = 0.04;
  head.add(helmetMount);

  // 3. Legs
  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.11, 0.95, 0);
  root.add(leftLeg);

  const leftThigh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.16), pantsMat);
  leftThigh.position.y = -0.24;
  leftThigh.castShadow = true;

  // Tactical Knee Pad
  const leftKneepad = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.11, 0.04), padMat);
  leftKneepad.position.set(0, -0.46, 0.09);

  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.46, 0.18), bootMat);
  leftBoot.position.set(0, -0.66, 0.02);
  leftBoot.castShadow = true;
  leftLeg.add(leftThigh, leftKneepad, leftBoot);

  // Right Leg with Drop-leg Holster
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.11, 0.95, 0);
  root.add(rightLeg);

  const rightThigh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.16), pantsMat);
  rightThigh.position.y = -0.24;
  rightThigh.castShadow = true;

  const rightKneepad = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.11, 0.04), padMat);
  rightKneepad.position.set(0, -0.46, 0.09);

  // Drop-leg tactical pistol holster
  const holster = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.09), padMat);
  holster.position.set(0.08, -0.22, 0);
  rightThigh.add(holster);

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.46, 0.18), bootMat);
  rightBoot.position.set(0, -0.66, 0.02);
  rightBoot.castShadow = true;
  rightLeg.add(rightThigh, rightKneepad, rightBoot);

  // 4. Arms
  // Right Arm (Trigger hand)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.24, 0.42, 0);
  torso.add(rightArm);

  const rightBicep = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.32, 0.12), camoMat);
  rightBicep.position.y = -0.16;
  rightBicep.castShadow = true;

  const rightElbowPad = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.03), padMat);
  rightElbowPad.position.set(0, -0.3, -0.06);

  const rightForearm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.3, 0.1), gloveMat);
  rightForearm.position.set(0, -0.42, 0.04);
  rightForearm.castShadow = true;
  rightArm.add(rightBicep, rightElbowPad, rightForearm);

  // Weapon Mount in Right Hand
  const weaponMount = new THREE.Group();
  weaponMount.position.set(0, -0.52, 0.08);
  weaponMount.rotation.x = -Math.PI / 2;
  rightArm.add(weaponMount);

  // Left Arm (Support hand)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.24, 0.42, 0);
  torso.add(leftArm);

  const leftBicep = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.32, 0.12), camoMat);
  leftBicep.position.y = -0.16;
  leftBicep.castShadow = true;

  const leftElbowPad = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.03), padMat);
  leftElbowPad.position.set(0, -0.3, -0.06);

  const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.3, 0.1), gloveMat);
  leftForearm.position.set(0, -0.42, 0.04);
  leftForearm.castShadow = true;
  leftArm.add(leftBicep, leftElbowPad, leftForearm);

  // 5. Parachute Canopy
  const parachuteGroup = new THREE.Group();
  parachuteGroup.position.set(0, 3.8, 0);
  parachuteGroup.visible = false;
  root.add(parachuteGroup);

  const canopyGeo = new THREE.SphereGeometry(2.5, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2.2);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: isBot ? 0xb45309 : 0x0284c7,
    roughness: 0.55,
    side: THREE.DoubleSide,
  });
  const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
  parachuteGroup.add(canopyMesh);

  // Suspension cords
  const cordMat = new THREE.LineBasicMaterial({ color: 0x94a3b8 });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const px = Math.cos(angle) * 2.3;
    const pz = Math.sin(angle) * 2.3;
    const cordGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(px, 0, pz),
      new THREE.Vector3(0, -2.7, 0),
    ]);
    const cord = new THREE.Line(cordGeo, cordMat);
    parachuteGroup.add(cord);
  }

  // Animation Cycle tracker
  let animTime = 0;

  const updateAnimation = (
    deltaTime: number,
    speed: number,
    isSprinting: boolean,
    isCrouching: boolean,
    isAiming: boolean,
    isParachuting: boolean,
    pitch: number
  ) => {
    parachuteGroup.visible = isParachuting;

    if (isParachuting) {
      torso.position.y = 0.95;
      leftLeg.rotation.x = 0.2;
      rightLeg.rotation.x = -0.1;
      leftArm.rotation.x = -Math.PI * 0.75;
      rightArm.rotation.x = -Math.PI * 0.75;
      return;
    }

    // Smooth crouch transition
    const targetHipY = isCrouching ? 0.65 : 0.95;
    torso.position.y += (targetHipY - torso.position.y) * 0.18;
    leftLeg.position.y = torso.position.y;
    rightLeg.position.y = torso.position.y;

    // Breathing idle animation
    const breath = Math.sin(Date.now() * 0.003) * 0.012;
    torso.position.y += breath;

    if (speed > 0.1) {
      const frequency = isSprinting ? 14 : 9;
      animTime += deltaTime * frequency;
      const legSwing = Math.sin(animTime) * (isSprinting ? 0.85 : 0.55);

      leftLeg.rotation.x = legSwing;
      rightLeg.rotation.x = -legSwing;

      // Natural torso sway & bounce
      torso.position.y = targetHipY + Math.abs(Math.sin(animTime * 2)) * 0.045;
      torso.rotation.z = Math.sin(animTime) * (isSprinting ? 0.06 : 0.03);
    } else {
      leftLeg.rotation.x *= 0.85;
      rightLeg.rotation.x *= 0.85;
      torso.rotation.z *= 0.85;
    }

    // Arm Aiming IK / Weapon posture
    head.rotation.x = pitch * 0.6;
    torso.rotation.x = pitch * 0.4;

    if (isAiming) {
      // ADS tight cheek weld
      rightArm.rotation.x = -Math.PI / 2 + pitch * 0.5;
      rightArm.rotation.y = -0.25;
      rightArm.position.set(0.18, 0.44, 0.08);

      leftArm.rotation.x = -Math.PI / 2 + 0.15 + pitch * 0.5;
      leftArm.rotation.y = 0.5;
      leftArm.position.set(-0.16, 0.4, 0.1);
    } else {
      // Low-ready hip carry
      rightArm.rotation.x = -Math.PI / 2.8 + pitch * 0.5;
      rightArm.rotation.y = -0.15;
      rightArm.position.set(0.22, 0.4, 0);

      leftArm.rotation.x = -Math.PI / 2.6 + pitch * 0.5;
      leftArm.rotation.y = 0.4;
      leftArm.position.set(-0.2, 0.38, 0.05);
    }
  };

  const setEquippedWeapon = (type: WeaponType | null) => {
    while (weaponMount.children.length > 0) {
      weaponMount.remove(weaponMount.children[0]);
    }
    if (type) {
      const gunMesh = buildWeaponMesh(type);
      weaponMount.add(gunMesh);
    }
  };

  const setHelmetLevel = (lvl: number | null) => {
    while (helmetMount.children.length > 0) {
      helmetMount.remove(helmetMount.children[0]);
    }
    if (lvl) {
      const helmMat = new THREE.MeshStandardMaterial({
        color: lvl === 3 ? 0x1e293b : lvl === 2 ? 0x3f3f46 : 0x57534e,
        roughness: 0.5,
        metalness: lvl === 3 ? 0.85 : 0.2,
      });
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 14, 0, Math.PI * 2, 0, Math.PI / 2),
        helmMat
      );
      helmetMount.add(dome);

      if (lvl === 3) {
        // Iconic Spetsnaz welding visor
        const visor = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.07, 0.03),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
        );
        visor.position.set(0, 0.04, 0.14);
        helmetMount.add(visor);
      }
    }
  };

  const setVestLevel = (lvl: number | null) => {
    while (vestMount.children.length > 0) {
      vestMount.remove(vestMount.children[0]);
    }
    if (lvl) {
      const vestMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.46, 0.26),
        new THREE.MeshStandardMaterial({
          color: lvl === 3 ? 0x18181b : lvl === 2 ? 0x3f3f46 : 0x475569,
          roughness: 0.8,
        })
      );
      vestMount.add(vestMesh);
    }
  };

  setEquippedWeapon('M416');
  setHelmetLevel(2);
  setVestLevel(2);

  return {
    root,
    torso,
    head,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    weaponMount,
    helmetMount,
    vestMount,
    backpackMount,
    parachuteGroup,
    updateAnimation,
    setEquippedWeapon,
    setHelmetLevel,
    setVestLevel,
  };
}
