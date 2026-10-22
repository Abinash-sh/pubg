import * as THREE from 'three';
import { DrivableVehicle } from '../../types/pubg';
import { pubgAudio } from './pubgAudio';

export class VehicleSystem {
  public scene: THREE.Scene;
  public vehicles: DrivableVehicle[] = [];
  public vehicleGroup = new THREE.Group();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.vehicleGroup);
  }

  /**
   * Spawns drivable tactical buggies parked near roads
   */
  public spawnVehicles(getTerrainHeight: (x: number, z: number) => number) {
    const spawnPoints = [
      { x: 45, z: 25 },
      { x: -140, z: -50 },
      { x: 180, z: -100 },
      { x: -220, z: 160 },
    ];

    spawnPoints.forEach((pt, i) => {
      const y = getTerrainHeight(pt.x, pt.z);
      const vehicle = this.createBuggyMesh();
      vehicle.group.position.set(pt.x, y + 0.6, pt.z);
      this.vehicleGroup.add(vehicle.group);

      this.vehicles.push({
        id: `buggy_${i}`,
        type: 'buggy',
        position: vehicle.group.position,
        rotation: vehicle.group.rotation,
        speed: 0,
        maxSpeed: 85, // km/h
        health: 500,
        maxHealth: 500,
        fuel: 100,
        occupied: false,
        mesh: vehicle.group,
        wheelMeshes: vehicle.wheels,
      });
    });
  }

  private createBuggyMesh(): { group: THREE.Group; wheels: THREE.Object3D[] } {
    const group = new THREE.Group();
    const wheels: THREE.Object3D[] = [];

    // Frame chassis (tubular rollcage)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.4,
      metalness: 0.8,
    });
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Desert amber
      roughness: 0.5,
      metalness: 0.3,
    });
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
    });

    // Lower chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 3.6), bodyMat);
    chassis.position.y = 0.5;
    chassis.castShadow = true;
    group.add(chassis);

    // Roll cage tubes
    const rollCage = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.8), frameMat);
    rollCage.position.set(0, 1.3, -0.2);
    group.add(rollCage);

    // Headlights
    const lightL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    lightL.rotation.x = Math.PI / 2;
    lightL.position.set(0.6, 0.6, -1.82);

    const lightR = lightL.clone();
    lightR.position.x = -0.6;
    group.add(lightL, lightR);

    // 4 Wheels
    const wheelPositions = [
      { x: -1.05, y: 0.4, z: -1.2 },
      { x: 1.05, y: 0.4, z: -1.2 },
      { x: -1.05, y: 0.4, z: 1.2 },
      { x: 1.05, y: 0.4, z: 1.2 },
    ];

    wheelPositions.forEach((pos) => {
      const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 14);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.castShadow = true;
      group.add(wheel);
      wheels.push(wheel);
    });

    return { group, wheels };
  }

  /**
   * Updates vehicle driving physics
   */
  public update(
    deltaTime: number,
    activeVehicleId: string | null,
    driveInputs: { forward: boolean; backward: boolean; left: boolean; right: boolean; boost: boolean },
    getTerrainHeight: (x: number, z: number) => number,
    onHitBot?: (vehiclePos: THREE.Vector3, speed: number) => void
  ) {
    this.vehicles.forEach((v) => {
      const isPlayerDriving = v.id === activeVehicleId;

      if (isPlayerDriving) {
        // Accelerate
        const max = driveInputs.boost ? v.maxSpeed * 1.3 : v.maxSpeed;
        if (driveInputs.forward) {
          v.speed = Math.min(max, v.speed + deltaTime * 35);
        } else if (driveInputs.backward) {
          v.speed = Math.max(-25, v.speed - deltaTime * 25);
        } else {
          v.speed *= 0.96; // Coast deceleration
        }

        // Steer
        if (Math.abs(v.speed) > 1) {
          const steerDir = v.speed > 0 ? 1 : -1;
          if (driveInputs.left) v.rotation.y += deltaTime * 2.2 * steerDir;
          if (driveInputs.right) v.rotation.y -= deltaTime * 2.2 * steerDir;
        }

        // Velocity translation
        const moveDist = (v.speed / 3.6) * deltaTime; // Convert km/h to m/s
        v.position.x += Math.sin(v.rotation.y) * moveDist;
        v.position.z += Math.cos(v.rotation.y) * moveDist;

        // Ground clamping
        const groundY = getTerrainHeight(v.position.x, v.position.z);
        v.position.y = groundY + 0.5;

        // Spin wheels
        v.wheelMeshes.forEach((w) => {
          w.rotation.x += moveDist * 2.0;
        });

        // Audio update
        pubgAudio.updateVehicleEngine(true, Math.abs(v.speed));

        // Roadkill check against bots
        if (Math.abs(v.speed) > 15 && onHitBot) {
          onHitBot(v.position, v.speed);
        }
      } else {
        // Parked
        const groundY = getTerrainHeight(v.position.x, v.position.z);
        v.position.y = groundY + 0.5;
      }
    });

    if (!activeVehicleId) {
      pubgAudio.updateVehicleEngine(false, 0);
    }
  }
}
