import * as THREE from 'three';
import { WeaponItem } from '../../types/pubg';
import { pubgAudio } from './pubgAudio';

export interface BulletProjectile {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  damage: number;
  isPlayerBullet: boolean;
  shooterId: string;
  weaponName: string;
  lifetime: number;
  tracerMesh: THREE.Line;
}

export interface GrenadeProjectile {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  fuseTimer: number;
  isPlayer: boolean;
  mesh: THREE.Group;
}

export interface ImpactParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

export class BallisticsSystem {
  public scene: THREE.Scene;
  public bullets: BulletProjectile[] = [];
  public grenades: GrenadeProjectile[] = [];
  public particles: ImpactParticle[] = [];

  private bulletGroup = new THREE.Group();
  private particleGeo = new THREE.BufferGeometry();
  private particleMesh: THREE.Points;
  private particleMat: THREE.PointsMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.bulletGroup);

    // Particle system for bullet sparks and blood splatters
    this.particleMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    this.particleMesh = new THREE.Points(this.particleGeo, this.particleMat);
    this.scene.add(this.particleMesh);
  }

  /**
   * Fires a bullet or shotgun spread from origin toward direction
   */
  public fireBullet(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    weapon: WeaponItem,
    isPlayer: boolean,
    shooterId = 'player'
  ) {
    const stats = weapon.stats;
    const count = stats.pelletCount || 1;

    for (let i = 0; i < count; i++) {
      const spreadDir = direction.clone();
      if (count > 1) {
        // Shotgun pellet spread
        spreadDir.x += (Math.random() - 0.5) * 0.08;
        spreadDir.y += (Math.random() - 0.5) * 0.08;
        spreadDir.z += (Math.random() - 0.5) * 0.08;
        spreadDir.normalize();
      }

      // Tracer line geometry
      const tracerPoints = [origin.clone(), origin.clone().add(spreadDir.clone().multiplyScalar(1.5))];
      const tracerGeo = new THREE.BufferGeometry().setFromPoints(tracerPoints);
      const tracerMat = new THREE.LineBasicMaterial({
        color: stats.id === 'AWM' ? 0x38bdf8 : stats.id === 'AKM' ? 0xf97316 : 0xfacc15,
        linewidth: stats.id === 'AWM' ? 3 : 2,
      });
      const tracer = new THREE.Line(tracerGeo, tracerMat);
      this.bulletGroup.add(tracer);

      this.bullets.push({
        position: origin.clone(),
        velocity: spreadDir.multiplyScalar(stats.bulletSpeed),
        damage: stats.damage,
        isPlayerBullet: isPlayer,
        shooterId,
        weaponName: stats.id,
        lifetime: 2.5,
        tracerMesh: tracer,
      });
    }

    // Play gunshot audio
    pubgAudio.playGunshot(stats.id, false, isPlayer ? 1 : 2.5);
  }

  /**
   * Throws a frag grenade
   */
  public throwGrenade(origin: THREE.Vector3, direction: THREE.Vector3, isPlayer: boolean) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x3d4734, roughness: 0.6 })
    );
    group.add(mesh);
    group.position.copy(origin);
    this.scene.add(group);

    const initialVelocity = direction.clone().multiplyScalar(28);
    initialVelocity.y += 6.0; // Parabolic arc

    this.grenades.push({
      position: origin.clone(),
      velocity: initialVelocity,
      fuseTimer: 3.2,
      isPlayer,
      mesh: group,
    });
  }

  /**
   * Spawns hit impact particles (blood or dirt sparks)
   */
  public spawnHitImpact(pos: THREE.Vector3, isFlesh: boolean) {
    const count = isFlesh ? 16 : 10;
    const color = isFlesh ? new THREE.Color(0xb91c1c) : new THREE.Color(0xf59e0b);

    for (let i = 0; i < count; i++) {
      this.particles.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 4
        ),
        color,
        size: 0.15 + Math.random() * 0.15,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
      });
    }
  }

  /**
   * Update loop for projectiles and particles
   */
  public update(
    deltaTime: number,
    getTerrainHeight: (x: number, z: number) => number,
    onBulletHit: (bullet: BulletProjectile, hitPos: THREE.Vector3) => boolean,
    onGrenadeExplode: (pos: THREE.Vector3, isPlayer: boolean) => void
  ) {
    const gravity = new THREE.Vector3(0, -9.8, 0);

    // 1. Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.lifetime -= deltaTime;

      if (b.lifetime <= 0) {
        this.bulletGroup.remove(b.tracerMesh);
        this.bullets.splice(i, 1);
        continue;
      }

      // Gravity drop
      b.velocity.add(gravity.clone().multiplyScalar(deltaTime * 0.3));
      const step = b.velocity.clone().multiplyScalar(deltaTime);
      const nextPos = b.position.clone().add(step);

      // Hit check callback (bots & player)
      const hit = onBulletHit(b, nextPos);

      // Ground collision
      const terrainY = getTerrainHeight(nextPos.x, nextPos.z);
      if (nextPos.y <= terrainY) {
        this.spawnHitImpact(nextPos, false);
        this.bulletGroup.remove(b.tracerMesh);
        this.bullets.splice(i, 1);
        continue;
      }

      if (hit) {
        this.bulletGroup.remove(b.tracerMesh);
        this.bullets.splice(i, 1);
        continue;
      }

      // Update tracer line
      b.position.copy(nextPos);
      const positions = (b.tracerMesh.geometry as THREE.BufferGeometry).attributes
        .position as THREE.BufferAttribute;
      const tail = b.position.clone().sub(b.velocity.clone().multiplyScalar(0.04));
      positions.setXYZ(0, b.position.x, b.position.y, b.position.z);
      positions.setXYZ(1, tail.x, tail.y, tail.z);
      positions.needsUpdate = true;
    }

    // 2. Update Grenades
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.fuseTimer -= deltaTime;

      g.velocity.add(gravity.clone().multiplyScalar(deltaTime));
      g.position.add(g.velocity.clone().multiplyScalar(deltaTime));
      g.mesh.position.copy(g.position);
      g.mesh.rotation.x += deltaTime * 8;
      g.mesh.rotation.z += deltaTime * 5;

      const groundY = getTerrainHeight(g.position.x, g.position.z);
      if (g.position.y <= groundY + 0.15) {
        g.position.y = groundY + 0.15;
        g.velocity.y = -g.velocity.y * 0.45; // Bounce
        g.velocity.x *= 0.65;
        g.velocity.z *= 0.65;
      }

      if (g.fuseTimer <= 0) {
        // Detonate!
        pubgAudio.playExplosion(1.0);
        this.spawnHitImpact(g.position, false);
        onGrenadeExplode(g.position, g.isPlayer);
        this.scene.remove(g.mesh);
        this.grenades.splice(i, 1);
      }
    }

    // 3. Update Impact Particles
    const posArr: number[] = [];
    const colArr: number[] = [];

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += deltaTime;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.velocity.add(gravity.clone().multiplyScalar(deltaTime * 0.8));
      p.position.add(p.velocity.clone().multiplyScalar(deltaTime));

      posArr.push(p.position.x, p.position.y, p.position.z);
      colArr.push(p.color.r, p.color.g, p.color.b);
    }

    this.particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
    this.particleGeo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3));
  }
}
