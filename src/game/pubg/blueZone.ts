import * as THREE from 'three';
import { BlueZoneState } from '../../types/pubg';
import { pubgAudio } from './pubgAudio';

export class BlueZoneManager {
  public scene: THREE.Scene;
  public state: BlueZoneState;
  public wallMesh: THREE.Mesh;
  public safeZoneMarkerMesh: THREE.Line;
  private wallMaterial: THREE.MeshBasicMaterial;

  // Phase timings: [waitSec, shrinkSec, damagePerSec, targetRadius]
  private phaseConfigs = [
    { wait: 35, shrink: 45, dps: 3, radius: 450 },
    { wait: 30, shrink: 35, dps: 5, radius: 280 },
    { wait: 25, shrink: 30, dps: 9, radius: 140 },
    { wait: 20, shrink: 25, dps: 15, radius: 60 },
    { wait: 15, shrink: 20, dps: 25, radius: 15 },
  ];

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    const initialRadius = 680;
    const initialCenter = new THREE.Vector2(0, 0);

    // Pick first next safe zone
    const nextCenter = new THREE.Vector2(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
    );

    this.state = {
      currentCenter: initialCenter,
      currentRadius: initialRadius,
      nextCenter,
      nextRadius: this.phaseConfigs[0].radius,
      phase: 1,
      totalPhases: 5,
      timer: this.phaseConfigs[0].wait,
      isShrinking: false,
      damagePerSec: this.phaseConfigs[0].dps,
    };

    // 1. Procedural 3D Electric Blue Cylinder Wall
    const cylinderGeo = new THREE.CylinderGeometry(
      initialRadius,
      initialRadius,
      120,
      64,
      1,
      true
    );
    this.wallMaterial = new THREE.MeshBasicMaterial({
      color: 0x00a8ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.wallMesh = new THREE.Mesh(cylinderGeo, this.wallMaterial);
    this.wallMesh.position.set(0, 60, 0);
    this.scene.add(this.wallMesh);

    // 2. White Circle Safe Zone Ring
    const ringPts: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      ringPts.push(
        new THREE.Vector3(
          Math.cos(theta) * this.state.nextRadius,
          2.0,
          Math.sin(theta) * this.state.nextRadius
        )
      );
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
    this.safeZoneMarkerMesh = new THREE.Line(
      ringGeo,
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    this.safeZoneMarkerMesh.position.set(nextCenter.x, 0, nextCenter.y);
    this.scene.add(this.safeZoneMarkerMesh);
  }

  public update(deltaTime: number): { playerOutside: boolean; damage: number } {
    const config = this.phaseConfigs[Math.min(this.state.phase - 1, this.phaseConfigs.length - 1)];

    this.state.timer -= deltaTime;

    if (!this.state.isShrinking) {
      if (this.state.timer <= 0) {
        // Start shrinking!
        this.state.isShrinking = true;
        this.state.timer = config.shrink;
        pubgAudio.playZoneSiren();
      }
    } else {
      // Shrinking active
      const shrinkProgress = Math.max(0, 1 - this.state.timer / config.shrink);

      // Lerp radius
      const startRadius =
        this.state.phase === 1
          ? 680
          : this.phaseConfigs[this.state.phase - 2].radius;
      this.state.currentRadius = THREE.MathUtils.lerp(
        startRadius,
        this.state.nextRadius,
        shrinkProgress
      );

      // Lerp center
      this.state.currentCenter.lerp(this.state.nextCenter, deltaTime * 0.05);

      if (this.state.timer <= 0) {
        // Phase complete -> Next phase
        this.state.isShrinking = false;
        this.state.currentRadius = this.state.nextRadius;
        this.state.currentCenter.copy(this.state.nextCenter);

        if (this.state.phase < this.state.totalPhases) {
          this.state.phase += 1;
          const nextConf = this.phaseConfigs[this.state.phase - 1];
          this.state.timer = nextConf.wait;
          this.state.damagePerSec = nextConf.dps;

          // Compute new random next center within current radius
          const angle = Math.random() * Math.PI * 2;
          const maxOffset = Math.max(10, this.state.currentRadius - nextConf.radius);
          const offsetDist = Math.random() * maxOffset * 0.7;

          this.state.nextCenter = new THREE.Vector2(
            this.state.currentCenter.x + Math.cos(angle) * offsetDist,
            this.state.currentCenter.y + Math.sin(angle) * offsetDist
          );
          this.state.nextRadius = nextConf.radius;

          // Rebuild white circle mesh
          this.rebuildSafeZoneMesh();
        } else {
          // Final circle stay
          this.state.timer = 999;
        }
      }
    }

    // Update 3D Wall scale and position
    const scale = this.state.currentRadius / 680;
    this.wallMesh.scale.set(scale, 1, scale);
    this.wallMesh.position.set(this.state.currentCenter.x, 60, this.state.currentCenter.y);

    // Pulsing electric opacity
    const pulse = 0.3 + Math.sin(Date.now() * 0.005) * 0.08;
    this.wallMaterial.opacity = pulse;

    return {
      playerOutside: false,
      damage: 0,
    };
  }

  private rebuildSafeZoneMesh() {
    this.scene.remove(this.safeZoneMarkerMesh);
    const ringPts: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      ringPts.push(
        new THREE.Vector3(
          Math.cos(theta) * this.state.nextRadius,
          2.0,
          Math.sin(theta) * this.state.nextRadius
        )
      );
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
    this.safeZoneMarkerMesh = new THREE.Line(
      ringGeo,
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    this.safeZoneMarkerMesh.position.set(this.state.nextCenter.x, 0, this.state.nextCenter.y);
    this.scene.add(this.safeZoneMarkerMesh);
  }

  /**
   * Checks if a 2D coordinate is inside the current blue circle
   */
  public isInsideCurrentZone(x: number, z: number): boolean {
    const dist = Math.hypot(x - this.state.currentCenter.x, z - this.state.currentCenter.y);
    return dist <= this.state.currentRadius;
  }

  /**
   * Distance from (x, z) to next safe zone
   */
  public getDistToSafeZone(x: number, z: number): number {
    const distToCenter = Math.hypot(x - this.state.nextCenter.x, z - this.state.nextCenter.y);
    return Math.max(0, distToCenter - this.state.nextRadius);
  }
}
