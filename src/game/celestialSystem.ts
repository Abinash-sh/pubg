import * as THREE from 'three';

export type TimeOfDayPreset = 'dawn' | 'day' | 'sunset' | 'night' | 'space' | 'cycle';

/**
 * Procedural Sun Corona, Solar Prominence, and Flare Texture
 */
function createSunTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const center = size / 2;
  const rad = size * 0.46;

  // Multi-tier radial glow
  const grad = ctx.createRadialGradient(center, center, 0, center, center, rad);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.12, 'rgba(255, 250, 210, 0.98)');
  grad.addColorStop(0.28, 'rgba(255, 205, 90, 0.85)');
  grad.addColorStop(0.55, 'rgba(255, 130, 30, 0.45)');
  grad.addColorStop(0.8, 'rgba(255, 70, 10, 0.15)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Solar flare corona spikes (12 diffraction rays)
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const isMajor = i % 3 === 0;
    const len = isMajor ? rad * 0.98 : rad * 0.65;
    const rayWidth = isMajor ? 3 : 1.5;

    ctx.strokeStyle = isMajor ? 'rgba(255, 235, 170, 0.45)' : 'rgba(255, 190, 100, 0.25)';
    ctx.lineWidth = rayWidth;
    ctx.beginPath();
    ctx.moveTo(center - Math.cos(angle) * len, center - Math.sin(angle) * len);
    ctx.lineTo(center + Math.cos(angle) * len, center + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Subtle diamond lens flare
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.moveTo(center, center - rad * 0.6);
  ctx.lineTo(center + rad * 0.12, center);
  ctx.lineTo(center, center + rad * 0.6);
  ctx.lineTo(center - rad * 0.12, center);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural Moon Surface Texture with authentic craters, ejecta rays, and dark basalt lunar maria
 */
function createMoonTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base regolith gray-white
  ctx.fillStyle = '#d5dce6';
  ctx.fillRect(0, 0, size, size);

  // Lunar Maria (vast dark basaltic plains)
  const mariaCenters = [
    { x: 155, y: 175, r: 95 },  // Oceanus Procellarum
    { x: 310, y: 215, r: 110 }, // Mare Imbrium
    { x: 260, y: 330, r: 80 },  // Mare Serenitatis
    { x: 385, y: 135, r: 65 },  // Mare Crisium
    { x: 190, y: 390, r: 75 },  // Mare Nubium
  ];

  mariaCenters.forEach((m) => {
    const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
    grad.addColorStop(0.0, 'rgba(65, 75, 90, 0.9)');
    grad.addColorStop(0.65, 'rgba(80, 92, 108, 0.65)');
    grad.addColorStop(1.0, 'rgba(213, 220, 230, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Authentic impact craters with illuminated rims and dark depths
  for (let i = 0; i < 110; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 2.5 + Math.random() * 14;

    // Dark interior pit
    ctx.fillStyle = 'rgba(42, 50, 62, 0.65)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Bright illuminated sunward rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x - 0.8, y - 0.8, r, 0, Math.PI * 2);
    ctx.stroke();

    // Prominent crater Tycho ejecta rays for large craters
    if (r > 10 && i % 4 === 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1;
      for (let ray = 0; ray < 6; ray++) {
        const ang = (ray * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(ang) * (r * 3.5), y + Math.sin(ang) * (r * 3.5));
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * CelestialSystem: Real-World Sun, Moon, Solar Lighting & Day-Night cycle
 */
export class CelestialSystem {
  public scene: THREE.Scene;

  // Celestial Orbs
  public sunGroup = new THREE.Group();
  public sunMesh: THREE.Mesh;
  public sunCoreMesh: THREE.Mesh;
  public sunLight: THREE.DirectionalLight;

  public moonGroup = new THREE.Group();
  public moonMesh: THREE.Mesh;
  public moonHaloMesh: THREE.Mesh;
  public moonLight: THREE.DirectionalLight;

  public hemiLight: THREE.HemisphereLight;

  // Current Celestial State
  public timeOfDay: TimeOfDayPreset = 'day';
  public celestialAngle = Math.PI * 0.45; // angle along celestial arc
  public autoCycle = false;
  public cycleSpeed = 0.02; // speed of day/night passage when cycle mode is enabled

  constructor(scene: THREE.Scene, initialTime: TimeOfDayPreset = 'day') {
    this.scene = scene;
    this.timeOfDay = initialTime;

    // 1. Realistic Sun Object
    const sunTex = createSunTexture();
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.sunMesh = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), sunMat);
    this.sunGroup.add(this.sunMesh);

    // Incandescent White Solar Core
    const coreGeo = new THREE.SphereGeometry(70, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.sunCoreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.sunGroup.add(this.sunCoreMesh);

    // Directional Sunlight (Casts soft shadows on terrain and aircraft)
    this.sunLight = new THREE.DirectionalLight(0xffedd5, 3.4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.bias = -0.0005;
    const d = 500;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.camera.near = 100;
    this.sunLight.shadow.camera.far = 3200;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunGroup);

    // 2. Realistic 3D Moon Object
    const moonTex = createMoonTexture();
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.88,
      metalness: 0.12,
    });
    this.moonMesh = new THREE.Mesh(new THREE.SphereGeometry(82, 32, 32), moonMat);
    this.moonGroup.add(this.moonMesh);

    // Lunar Atmospheric Silver-Blue Glow Halo
    const moonHaloMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.moonHaloMesh = new THREE.Mesh(new THREE.PlaneGeometry(310, 310), moonHaloMat);
    this.moonGroup.add(this.moonHaloMesh);

    // Cool Silvery Moonlight for nocturnal missions
    this.moonLight = new THREE.DirectionalLight(0xa5b4fc, 0.8);
    this.moonLight.castShadow = false;
    this.scene.add(this.moonLight);
    this.scene.add(this.moonGroup);

    // 3. Ambient Sky & Ground Hemisphere Light
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 1.4);
    this.scene.add(this.hemiLight);

    this.setTimeOfDay(initialTime);
  }

  public setTimeOfDay(preset: TimeOfDayPreset) {
    this.timeOfDay = preset;

    if (preset === 'cycle') {
      this.autoCycle = true;
      return;
    }

    this.autoCycle = false;
    let targetAngle = Math.PI * 0.45;
    let sunColor = 0xffedd5;
    let sunIntensity = 3.4;
    let moonIntensity = 0.05;

    let hemiSky = 0xbae6fd;
    let hemiGround = 0x0f172a;
    let hemiIntensity = 1.4;

    let bgColor = 0x0a1c36;
    let fogDensity = 0.00075;

    if (preset === 'dawn') {
      targetAngle = Math.PI * 0.09; // Rising on the eastern horizon
      sunColor = 0xfb923c;
      sunIntensity = 2.6;
      moonIntensity = 0.2;
      hemiSky = 0xf472b6;
      hemiGround = 0x1e1b4b;
      hemiIntensity = 1.25;
      bgColor = 0x221326;
      fogDensity = 0.00095;
    } else if (preset === 'day') {
      targetAngle = Math.PI * 0.45; // High midday sun
      sunColor = 0xffedd5;
      sunIntensity = 3.5;
      moonIntensity = 0.05;
      hemiSky = 0xbae6fd;
      hemiGround = 0x0f172a;
      hemiIntensity = 1.45;
      bgColor = 0x0a1c36;
      fogDensity = 0.00075;
    } else if (preset === 'sunset') {
      targetAngle = Math.PI * 0.92; // Setting in the west
      sunColor = 0xf97316;
      sunIntensity = 3.1;
      moonIntensity = 0.35;
      hemiSky = 0xf43f5e;
      hemiGround = 0x3b0764;
      hemiIntensity = 1.35;
      bgColor = 0x2a0e28;
      fogDensity = 0.0009;
    } else if (preset === 'night') {
      targetAngle = -Math.PI * 0.45; // Sun submerged below horizon, Moon high
      sunColor = 0x1e293b;
      sunIntensity = 0.0;
      moonIntensity = 1.35;
      hemiSky = 0x1e293b;
      hemiGround = 0x020617;
      hemiIntensity = 0.75;
      bgColor = 0x030712;
      fogDensity = 0.0006;
    } else if (preset === 'space') {
      targetAngle = Math.PI * 0.35;
      sunColor = 0xffffff;
      sunIntensity = 4.2;
      moonIntensity = 0.9;
      hemiSky = 0x38bdf8;
      hemiGround = 0x000000;
      hemiIntensity = 0.85;
      bgColor = 0x010308;
      fogDensity = 0.00015;
    }

    this.celestialAngle = targetAngle;
    this.applyCelestialPosition(targetAngle, sunColor, sunIntensity, moonIntensity, hemiSky, hemiGround, hemiIntensity, bgColor, fogDensity);
  }

  private applyCelestialPosition(
    angle: number,
    sunColor: number,
    sunIntensity: number,
    moonIntensity: number,
    hemiSky: number,
    hemiGround: number,
    hemiIntensity: number,
    bgColor: number,
    fogDensity: number
  ) {
    const sunDist = 2400;
    const sunX = Math.cos(angle) * sunDist;
    const sunY = Math.sin(angle) * (sunDist * 0.75);
    const sunZ = -sunDist * 0.55;

    this.sunGroup.position.set(sunX, sunY, sunZ);
    this.sunLight.position.set(sunX * 0.4, Math.max(100, sunY * 0.4), sunZ * 0.4);
    this.sunLight.color.setHex(sunColor);
    this.sunLight.intensity = sunIntensity;

    // Moon placed diametrically opposite to Sun
    const moonX = -sunX;
    const moonY = Math.max(140, -sunY * 0.8 + 480);
    const moonZ = -sunZ;

    this.moonGroup.position.set(moonX, moonY, moonZ);
    this.moonLight.position.set(moonX * 0.3, moonY * 0.4, moonZ * 0.3);
    this.moonLight.intensity = moonIntensity;

    this.hemiLight.color.setHex(hemiSky);
    this.hemiLight.groundColor.setHex(hemiGround);
    this.hemiLight.intensity = hemiIntensity;

    this.scene.background = new THREE.Color(bgColor);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(bgColor);
      this.scene.fog.density = fogDensity;
    }
  }

  public update(delta: number, camera: THREE.PerspectiveCamera, playerPos: THREE.Vector3) {
    // If continuous real-world day/night cycle is active
    if (this.autoCycle) {
      this.celestialAngle = (this.celestialAngle + this.cycleSpeed * delta) % (Math.PI * 2);

      const sinAngle = Math.sin(this.celestialAngle);
      const isDay = sinAngle > 0;

      const sunIntensity = isDay ? Math.max(0, sinAngle * 3.6) : 0;
      const moonIntensity = !isDay ? Math.max(0.1, -sinAngle * 1.3) : 0.05;

      const sunCol = sinAngle < 0.25 ? 0xf97316 : 0xffedd5;
      const hemiSky = isDay ? 0xbae6fd : 0x1e293b;
      const hemiGround = isDay ? 0x0f172a : 0x020617;
      const hemiInt = isDay ? 1.4 : 0.7;
      const bgCol = isDay ? 0x0a1c36 : 0x030712;
      const fogDens = isDay ? 0.00075 : 0.0006;

      this.applyCelestialPosition(
        this.celestialAngle,
        sunCol,
        sunIntensity,
        moonIntensity,
        hemiSky,
        hemiGround,
        hemiInt,
        bgCol,
        fogDens
      );
    }

    // Billboarding: Sun corona and Moon halo always face the camera directly
    this.sunMesh.lookAt(camera.position);
    this.moonHaloMesh.lookAt(camera.position);

    // Keep Sun and Moon pinned relative to player horizon
    const sunDist = 2400;
    this.sunGroup.position.x = playerPos.x + Math.cos(this.celestialAngle) * sunDist;
    this.sunGroup.position.y = playerPos.y + Math.sin(this.celestialAngle) * (sunDist * 0.75);
    this.sunGroup.position.z = playerPos.z - sunDist * 0.55;

    this.moonGroup.position.x = playerPos.x - Math.cos(this.celestialAngle) * sunDist;
    this.moonGroup.position.y = playerPos.y + Math.max(140, -Math.sin(this.celestialAngle) * (sunDist * 0.6) + 480);
    this.moonGroup.position.z = playerPos.z + sunDist * 0.55;

    // Subtle realistic lunar axial rotation
    this.moonMesh.rotation.y += 0.0008;

    // Update shadow camera focus on player
    this.sunLight.target.position.copy(playerPos);
    this.sunLight.target.updateMatrixWorld();
  }
}
