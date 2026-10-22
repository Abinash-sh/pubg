import * as THREE from 'three';
import { WeatherPreset } from '../types/game';
import { gameAudio } from './gameAudio';

export interface WindState {
  speedKnots: number; // e.g. 15 to 45 knots
  headingDeg: number; // 0 to 360 degrees
  vector: THREE.Vector3; // normalized X/Z wind vector
  gustFactor: number;
}

/**
 * Procedural rain drop streak texture
 */
function createRainDropTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(8, 0, 8, 64);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.3, 'rgba(186, 230, 253, 0.45)');
  grad.addColorStop(0.85, 'rgba(224, 242, 254, 0.85)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

  ctx.fillStyle = grad;
  ctx.fillRect(6, 0, 4, 64);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Weather & Atmospheric Environment System
 * Governs real-world wind dynamics, precipitation, procedural lightning strikes,
 * in-cloud volumetric moisture penetration, and ocean jet spray.
 */
export class WeatherEnvironment {
  public scene: THREE.Scene;
  public currentWeather: WeatherPreset = 'clear';

  // Real-world Wind State
  public wind: WindState = {
    speedKnots: 18,
    headingDeg: 240,
    vector: new THREE.Vector3(-0.866, 0, -0.5).normalize(),
    gustFactor: 1.0,
  };
  private windTimer = 0;

  // Rain particle system
  public rainPoints: THREE.Points | null = null;
  private rainGeometry: THREE.BufferGeometry | null = null;
  private rainCount = 1800;
  private rainPositions: Float32Array;
  private rainVelocities: Float32Array;

  // Lightning system
  private lightningGroup = new THREE.Group();
  private lightningMesh: THREE.LineSegments | null = null;
  private lightningLight: THREE.PointLight;
  private lightningTimer = 0;
  private isLightningActive = false;
  private lightningFlashTime = 0;

  // Cloud penetration state (0 = clear air, 1 = deep inside cloud moisture)
  public cloudMoisture = 0;

  // Ocean jet-wash spray particles
  private sprayPoints: THREE.Points | null = null;
  private sprayGeometry: THREE.BufferGeometry | null = null;
  private sprayCount = 350;
  private sprayPositions: Float32Array;
  private sprayVelocities: Float32Array;
  private sprayLives: Float32Array;

  constructor(scene: THREE.Scene, initialWeather: WeatherPreset = 'clear') {
    this.scene = scene;
    this.currentWeather = initialWeather;

    // 1. Point Light for real-world lightning strikes
    this.lightningLight = new THREE.PointLight(0xdbeafe, 0, 2400, 1.2);
    this.lightningLight.position.set(0, 400, 0);
    this.scene.add(this.lightningLight);
    this.scene.add(this.lightningGroup);

    // 2. Initialize Rain Streaks buffer
    this.rainPositions = new Float32Array(this.rainCount * 3);
    this.rainVelocities = new Float32Array(this.rainCount * 3);
    this.initRainSystem();

    // 3. Initialize Ocean Jet Spray buffer
    this.sprayPositions = new Float32Array(this.sprayCount * 3);
    this.sprayVelocities = new Float32Array(this.sprayCount * 3);
    this.sprayLives = new Float32Array(this.sprayCount);
    this.initSpraySystem();

    this.setWeather(initialWeather);
  }

  private initRainSystem() {
    this.rainGeometry = new THREE.BufferGeometry();

    for (let i = 0; i < this.rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 450;
      this.rainPositions[i * 3 + 1] = Math.random() * 250;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 450;

      this.rainVelocities[i * 3] = (Math.random() - 0.5) * 5;
      this.rainVelocities[i * 3 + 1] = -140 - Math.random() * 80;
      this.rainVelocities[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }

    this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));

    const rainTex = createRainDropTexture();
    const rainMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 4.5,
      map: rainTex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.rainPoints = new THREE.Points(this.rainGeometry, rainMat);
    this.rainPoints.frustumCulled = false;
    this.scene.add(this.rainPoints);
  }

  private initSpraySystem() {
    this.sprayGeometry = new THREE.BufferGeometry();

    for (let i = 0; i < this.sprayCount; i++) {
      this.sprayPositions[i * 3] = 0;
      this.sprayPositions[i * 3 + 1] = -9999;
      this.sprayPositions[i * 3 + 2] = 0;

      this.sprayVelocities[i * 3] = 0;
      this.sprayVelocities[i * 3 + 1] = 0;
      this.sprayVelocities[i * 3 + 2] = 0;
      this.sprayLives[i] = 0;
    }

    this.sprayGeometry.setAttribute('position', new THREE.BufferAttribute(this.sprayPositions, 3));

    const sprayMat = new THREE.PointsMaterial({
      color: 0xf0fdf4,
      size: 3.8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.sprayPoints = new THREE.Points(this.sprayGeometry, sprayMat);
    this.sprayPoints.frustumCulled = false;
    this.scene.add(this.sprayPoints);
  }

  public setWeather(preset: WeatherPreset) {
    this.currentWeather = preset;

    // Configure wind characteristics
    switch (preset) {
      case 'clear':
        this.wind.speedKnots = 12 + Math.floor(Math.random() * 8);
        if (this.rainPoints) (this.rainPoints.material as THREE.PointsMaterial).opacity = 0;
        break;
      case 'fog':
        this.wind.speedKnots = 6 + Math.floor(Math.random() * 5);
        if (this.rainPoints) (this.rainPoints.material as THREE.PointsMaterial).opacity = 0;
        break;
      case 'rain':
        this.wind.speedKnots = 24 + Math.floor(Math.random() * 12);
        if (this.rainPoints) (this.rainPoints.material as THREE.PointsMaterial).opacity = 0.72;
        break;
      case 'thunderstorm':
        this.wind.speedKnots = 38 + Math.floor(Math.random() * 18);
        if (this.rainPoints) (this.rainPoints.material as THREE.PointsMaterial).opacity = 0.95;
        this.lightningTimer = 2.0;
        break;
    }

    const rad = (this.wind.headingDeg * Math.PI) / 180;
    this.wind.vector.set(Math.sin(rad), 0, Math.cos(rad)).normalize();
  }

  /**
   * Generates a 3D branched procedural lightning bolt from cloud altitude to ground
   */
  public triggerLightning(origin?: THREE.Vector3) {
    if (this.lightningMesh) {
      this.lightningGroup.remove(this.lightningMesh);
      this.lightningMesh.geometry.dispose();
      this.lightningMesh = null;
    }

    const startX = origin ? origin.x + (Math.random() - 0.5) * 600 : (Math.random() - 0.5) * 1200;
    const startZ = origin ? origin.z + (Math.random() - 0.5) * 600 : (Math.random() - 0.5) * 1200;
    const startY = 320 + Math.random() * 80;

    const points: number[] = [];

    // Main jagged trunk
    let cur = new THREE.Vector3(startX, startY, startZ);
    points.push(cur.x, cur.y, cur.z);

    const steps = 18;
    const stepHeight = startY / steps;

    for (let s = 0; s < steps; s++) {
      const nextY = cur.y - stepHeight;
      const nextX = cur.x + (Math.random() - 0.5) * 45;
      const nextZ = cur.z + (Math.random() - 0.5) * 45;
      const next = new THREE.Vector3(nextX, Math.max(0, nextY), nextZ);

      // Line segment
      points.push(next.x, next.y, next.z);
      if (s < steps - 1) {
        points.push(next.x, next.y, next.z); // duplicate for line segments
      }

      // Branch off occasionally
      if (Math.random() < 0.38 && s > 3 && s < steps - 2) {
        let bCur = next.clone();
        for (let b = 0; b < 4; b++) {
          const bNext = new THREE.Vector3(
            bCur.x + (Math.random() - 0.5) * 35,
            bCur.y - stepHeight * 0.7,
            bCur.z + (Math.random() - 0.5) * 35
          );
          points.push(bCur.x, bCur.y, bCur.z);
          points.push(bNext.x, bNext.y, bNext.z);
          bCur = bNext;
        }
      }

      cur = next;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      linewidth: 3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 1.0,
    });

    this.lightningMesh = new THREE.LineSegments(geo, mat);
    this.lightningGroup.add(this.lightningMesh);

    // Illuminate battlespace
    this.lightningLight.position.set(startX, startY * 0.65, startZ);
    this.lightningLight.intensity = 18.0;
    this.isLightningActive = true;
    this.lightningFlashTime = 0.22;

    gameAudio.playThunder();
  }

  /**
   * Updates weather environment per frame
   */
  public update(
    delta: number,
    playerPos: THREE.Vector3,
    playerVelocity: THREE.Vector3,
    cloudMeshes: THREE.Group
  ) {
    // 1. Dynamic wind evolution & gentle gust fluctuation
    this.windTimer += delta;
    if (this.windTimer > 4.0) {
      this.windTimer = 0;
      this.wind.gustFactor = 0.85 + Math.random() * 0.35;
      this.wind.headingDeg = (this.wind.headingDeg + (Math.random() - 0.5) * 6 + 360) % 360;
      const rad = (this.wind.headingDeg * Math.PI) / 180;
      this.wind.vector.set(Math.sin(rad), 0, Math.cos(rad)).normalize();
    }

    // 2. Thunderstorm lightning loop
    if (this.currentWeather === 'thunderstorm') {
      this.lightningTimer -= delta;
      if (this.lightningTimer <= 0) {
        this.triggerLightning(playerPos);
        this.lightningTimer = 3.5 + Math.random() * 5.0;
      }
    }

    // Fade active lightning flash
    if (this.isLightningActive) {
      this.lightningFlashTime -= delta;
      if (this.lightningFlashTime <= 0) {
        this.isLightningActive = false;
        this.lightningLight.intensity = 0;
        if (this.lightningMesh) {
          this.lightningGroup.remove(this.lightningMesh);
          this.lightningMesh.geometry.dispose();
          this.lightningMesh = null;
        }
      } else {
        const flashRatio = this.lightningFlashTime / 0.22;
        this.lightningLight.intensity = flashRatio * 18.0;
        if (this.lightningMesh) {
          (this.lightningMesh.material as THREE.LineBasicMaterial).opacity = flashRatio;
        }
      }
    }

    // 3. Rain particle volume tracked relative to player
    if (
      (this.currentWeather === 'rain' || this.currentWeather === 'thunderstorm') &&
      this.rainPoints &&
      this.rainGeometry
    ) {
      const windPushX = this.wind.vector.x * this.wind.speedKnots * 1.5;
      const windPushZ = this.wind.vector.z * this.wind.speedKnots * 1.5;
      const boxSize = 350;

      for (let i = 0; i < this.rainCount; i++) {
        let x = this.rainPositions[i * 3];
        let y = this.rainPositions[i * 3 + 1];
        let z = this.rainPositions[i * 3 + 2];

        // Apply high fall velocity + wind drift
        x += (this.rainVelocities[i * 3] + windPushX - playerVelocity.x * 0.25) * delta;
        y += this.rainVelocities[i * 3 + 1] * delta;
        z += (this.rainVelocities[i * 3 + 2] + windPushZ - playerVelocity.z * 0.25) * delta;

        // Wrap around player's current bounding cylinder
        if (y < playerPos.y - 70) {
          y = playerPos.y + 120 + Math.random() * 40;
          x = playerPos.x + (Math.random() - 0.5) * boxSize;
          z = playerPos.z + (Math.random() - 0.5) * boxSize;
        }
        if (Math.abs(x - playerPos.x) > boxSize / 2) {
          x = playerPos.x + (Math.random() - 0.5) * boxSize;
        }
        if (Math.abs(z - playerPos.z) > boxSize / 2) {
          z = playerPos.z + (Math.random() - 0.5) * boxSize;
        }

        this.rainPositions[i * 3] = x;
        this.rainPositions[i * 3 + 1] = y;
        this.rainPositions[i * 3 + 2] = z;
      }

      this.rainGeometry.attributes.position.needsUpdate = true;
    }

    // 4. Low-altitude Ocean Jet Wash Spray (Altitude < 35m)
    if (this.sprayPoints && this.sprayGeometry) {
      const isLowOverWater = playerPos.y < 35 && playerPos.y > 2.0;

      // Spawn spray when skimming low
      if (isLowOverWater) {
        for (let i = 0; i < 4; i++) {
          const sIdx = Math.floor(Math.random() * this.sprayCount);
          this.sprayPositions[sIdx * 3] = playerPos.x + (Math.random() - 0.5) * 8;
          this.sprayPositions[sIdx * 3 + 1] = 0.5 + Math.random() * 1.5;
          this.sprayPositions[sIdx * 3 + 2] = playerPos.z + (Math.random() - 0.5) * 8;

          this.sprayVelocities[sIdx * 3] = (Math.random() - 0.5) * 18 - playerVelocity.x * 0.15;
          this.sprayVelocities[sIdx * 3 + 1] = 4 + Math.random() * 8;
          this.sprayVelocities[sIdx * 3 + 2] = (Math.random() - 0.5) * 18 - playerVelocity.z * 0.15;
          this.sprayLives[sIdx] = 0.55;
        }
      }

      // Update active spray particles
      for (let i = 0; i < this.sprayCount; i++) {
        if (this.sprayLives[i] > 0) {
          this.sprayLives[i] -= delta;
          this.sprayPositions[i * 3] += this.sprayVelocities[i * 3] * delta;
          this.sprayPositions[i * 3 + 1] += this.sprayVelocities[i * 3 + 1] * delta;
          this.sprayPositions[i * 3 + 2] += this.sprayVelocities[i * 3 + 2] * delta;
          this.sprayVelocities[i * 3 + 1] -= 9.8 * delta; // Gravity fall
          if (this.sprayPositions[i * 3 + 1] < 0.2) {
            this.sprayPositions[i * 3 + 1] = -9999;
            this.sprayLives[i] = 0;
          }
        } else {
          this.sprayPositions[i * 3 + 1] = -9999;
        }
      }

      this.sprayGeometry.attributes.position.needsUpdate = true;
    }

    // 5. In-Cloud Moisture Penetration Detection
    let insideCloud = false;
    const pY = playerPos.y;
    if (pY >= 140 && pY <= 340) {
      // Test distance against cloud clusters
      for (let i = 0; i < cloudMeshes.children.length; i++) {
        const c = cloudMeshes.children[i];
        const distSq =
          (c.position.x - playerPos.x) * (c.position.x - playerPos.x) +
          (c.position.z - playerPos.z) * (c.position.z - playerPos.z);
        if (distSq < 75 * 75) {
          insideCloud = true;
          break;
        }
      }
    }

    const targetMoisture = insideCloud ? 0.85 : 0;
    this.cloudMoisture = THREE.MathUtils.damp(this.cloudMoisture, targetMoisture, 4.5, delta);
  }

  public dispose() {
    if (this.rainPoints) {
      this.scene.remove(this.rainPoints);
      this.rainGeometry?.dispose();
    }
    if (this.sprayPoints) {
      this.scene.remove(this.sprayPoints);
      this.sprayGeometry?.dispose();
    }
    if (this.lightningMesh) {
      this.lightningGroup.remove(this.lightningMesh);
      this.lightningMesh.geometry.dispose();
    }
    this.scene.remove(this.lightningLight);
    this.scene.remove(this.lightningGroup);
  }
}
