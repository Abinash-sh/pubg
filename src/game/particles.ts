import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
  decay: number;
  gravity?: number;
}

export interface FlareEntity {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
}

export class ParticleManager {
  private particles: Particle[] = [];
  private maxParticles = 2400;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;

  private positionsArray: Float32Array;
  private colorsArray: Float32Array;

  // Active Flare Meshes in Scene
  public flares: FlareEntity[] = [];
  private scene: THREE.Scene;

  // Screen shake trauma system
  public trauma = 0;
  public shakeOffset = new THREE.Vector3();

  // Transonic vapor ring
  public transonicRing: THREE.Mesh | null = null;
  public transonicTime = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.positionsArray = new Float32Array(this.maxParticles * 3);
    this.colorsArray = new Float32Array(this.maxParticles * 3);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionsArray, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorsArray, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 215, 120, 0.85)');
    grad.addColorStop(0.7, 'rgba(240, 90, 25, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 3.5,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);

    // Transonic Condensation Cone / Prandtl-Glauert Shock Cone Mesh
    const coneGeo = new THREE.CylinderGeometry(0.8, 3.8, 1.4, 24, 1, true);
    coneGeo.rotateX(Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.transonicRing = new THREE.Mesh(coneGeo, coneMat);
    scene.add(this.transonicRing);
  }

  public addExplosion(pos: THREE.Vector3, isLarge = false) {
    const count = isLarge ? 220 : 95;
    this.addTrauma(isLarge ? 0.95 : 0.45);

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const speed = (isLarge ? 60 : 30) * (0.3 + Math.random() * 0.7);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.sin(phi) * Math.sin(theta) * speed;
      const vz = Math.cos(phi) * speed;

      const isFire = Math.random() < 0.7;
      const color = isFire
        ? new THREE.Color(1.0, 0.4 + Math.random() * 0.5, 0.1)
        : new THREE.Color(0.9, 0.9, 0.95);

      this.particles.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(vx, vy, vz),
        color,
        size: isLarge ? 6.5 + Math.random() * 4 : 3.8 + Math.random() * 2.5,
        life: 1.0,
        maxLife: 1.0,
        decay: (isLarge ? 0.8 : 1.25) + Math.random() * 0.8,
      });
    }
  }

  /**
   * Ejects burning defensive magnesium flare countermeasures
   */
  public addFlare(pos: THREE.Vector3, forward: THREE.Vector3) {
    // 3 flare sparks per salvo
    for (let f = 0; f < 3; f++) {
      const flareMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const flareMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), flareMat);

      // Ejected backward and downward with lateral spread
      const spreadX = (f - 1) * 2.2 + (Math.random() - 0.5) * 1.5;
      const flarePos = pos.clone().add(new THREE.Vector3(spreadX, -0.6, -2.5));
      flareMesh.position.copy(flarePos);
      this.scene.add(flareMesh);

      const vel = forward.clone().multiplyScalar(-35)
        .add(new THREE.Vector3(spreadX * 3.5, -12 - Math.random() * 8, (Math.random() - 0.5) * 10));

      this.flares.push({
        mesh: flareMesh,
        position: flarePos,
        velocity: vel,
        life: 3.2, // 3.2s burning duration
      });
    }
  }

  /**
   * Spawns Prandtl-Glauert Singularity condensation shock cone near Mach 1.0
   */
  public triggerTransonicCone(pos: THREE.Vector3, quat: THREE.Quaternion) {
    if (this.transonicRing) {
      this.transonicRing.position.copy(pos);
      this.transonicRing.quaternion.copy(quat);
      (this.transonicRing.material as THREE.MeshBasicMaterial).opacity = 0.75;
      this.transonicTime = 0.35; // Flash duration
    }
  }

  public addMissileSmoke(pos: THREE.Vector3) {
    if (this.particles.length >= this.maxParticles) this.particles.shift();

    this.particles.push({
      position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4)),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5),
      color: new THREE.Color(0.85, 0.88, 0.92),
      size: 2.4 + Math.random() * 1.5,
      life: 1.0,
      maxLife: 1.0,
      decay: 2.2,
    });
  }

  public addWingtipVapor(pos: THREE.Vector3) {
    if (this.particles.length >= this.maxParticles) this.particles.shift();

    this.particles.push({
      position: pos.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(0.65, 0.88, 1.0),
      size: 2.4,
      life: 1.0,
      maxLife: 1.0,
      decay: 3.2,
    });
  }

  /**
   * Fuel leak white aerosol vapor trail
   */
  public addFuelLeak(pos: THREE.Vector3) {
    if (this.particles.length >= this.maxParticles) this.particles.shift();

    this.particles.push({
      position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.5, -0.3, (Math.random() - 0.5) * 0.5)),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 2, -2, (Math.random() - 0.5) * 2),
      color: new THREE.Color(0.9, 0.95, 1.0),
      size: 1.8,
      life: 0.8,
      maxLife: 0.8,
      decay: 1.8,
    });
  }

  /**
   * Engine fire heavy oily black smoke and flame tongues
   */
  public addEngineFire(pos: THREE.Vector3) {
    if (this.particles.length >= this.maxParticles) this.particles.shift();

    const isSmoke = Math.random() > 0.35;
    this.particles.push({
      position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6)),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 3, 3 + Math.random() * 3, (Math.random() - 0.5) * 3),
      color: isSmoke ? new THREE.Color(0.15, 0.15, 0.18) : new THREE.Color(1.0, 0.45, 0.1),
      size: isSmoke ? 3.5 : 2.5,
      life: 1.0,
      maxLife: 1.0,
      decay: isSmoke ? 1.4 : 3.0,
    });
  }

  /**
   * Wind streaks & rain streaks past cockpit
   */
  public addWindStreak(playerPos: THREE.Vector3, forward: THREE.Vector3, speedFactor: number, isRain = false) {
    if (this.particles.length >= this.maxParticles) this.particles.shift();

    const spread = isRain ? 45 : 30;
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread * 0.6,
      (Math.random() - 0.5) * spread
    );
    const pos = playerPos.clone().add(forward.clone().multiplyScalar(isRain ? 25 : 40)).add(offset);
    const vel = forward.clone().multiplyScalar(-speedFactor * (isRain ? 2.2 : 1.8));
    if (isRain) vel.y -= 35; // Downward gravity component for rain

    this.particles.push({
      position: pos,
      velocity: vel,
      color: isRain ? new THREE.Color(0.5, 0.75, 0.95) : new THREE.Color(0.7, 0.9, 1.0),
      size: isRain ? 2.2 : 1.5,
      life: isRain ? 0.4 : 0.6,
      maxLife: isRain ? 0.4 : 0.6,
      decay: isRain ? 2.8 : 2.0,
    });
  }

  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  public update(delta: number) {
    // 1. Update flare countermeasures
    for (let f = this.flares.length - 1; f >= 0; f--) {
      const fl = this.flares[f];
      fl.life -= delta;

      if (fl.life <= 0) {
        this.scene.remove(fl.mesh);
        this.flares.splice(f, 1);
        continue;
      }

      fl.position.addScaledVector(fl.velocity, delta);
      fl.velocity.multiplyScalar(0.92);
      fl.velocity.y -= 9.8 * delta; // Gravity fall
      fl.mesh.position.copy(fl.position);

      // Emit orange magnesium spark smoke
      if (Math.random() > 0.4 && this.particles.length < this.maxParticles) {
        this.particles.push({
          position: fl.position.clone(),
          velocity: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2),
          color: new THREE.Color(1.0, 0.7, 0.2),
          size: 2.8,
          life: 0.6,
          maxLife: 0.6,
          decay: 2.2,
        });
      }
    }

    // 2. Transonic vapor cone decay
    if (this.transonicRing && this.transonicTime > 0) {
      this.transonicTime -= delta;
      (this.transonicRing.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        this.transonicTime * 2.0
      );
    }

    // 3. Update particle array
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= p.decay * delta;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.position.addScaledVector(p.velocity, delta);
      p.velocity.multiplyScalar(0.96);
    }

    let idx = 0;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.positionsArray[idx * 3] = p.position.x;
      this.positionsArray[idx * 3 + 1] = p.position.y;
      this.positionsArray[idx * 3 + 2] = p.position.z;

      const alpha = p.life / p.maxLife;
      this.colorsArray[idx * 3] = p.color.r * alpha;
      this.colorsArray[idx * 3 + 1] = p.color.g * alpha;
      this.colorsArray[idx * 3 + 2] = p.color.b * alpha;
      idx++;
    }

    for (let i = idx; i < this.maxParticles; i++) {
      this.positionsArray[i * 3] = 0;
      this.positionsArray[i * 3 + 1] = -9999;
      this.positionsArray[i * 3 + 2] = 0;
      this.colorsArray[i * 3] = 0;
      this.colorsArray[i * 3 + 1] = 0;
      this.colorsArray[i * 3 + 2] = 0;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;

    // 4. Screen Shake & High-G Trauma
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - 1.2 * delta);
      const shakePower = this.trauma * this.trauma;
      const maxShake = 0.55 * shakePower;
      this.shakeOffset.set(
        (Math.random() * 2 - 1) * maxShake,
        (Math.random() * 2 - 1) * maxShake,
        (Math.random() * 2 - 1) * (maxShake * 0.5)
      );
    } else {
      this.shakeOffset.set(0, 0, 0);
    }
  }

  public clear() {
    this.particles = [];
    this.flares.forEach((fl) => this.scene.remove(fl.mesh));
    this.flares = [];
  }
}
