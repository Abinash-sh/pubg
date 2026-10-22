import * as THREE from 'three';

/**
 * Creates a soft radial contact shadow texture for grounding 3D models.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const center = size / 2;
  const radius = size * 0.46;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);

  // Soft optical bell falloff
  gradient.addColorStop(0.0, 'rgba(0, 0, 0, 0.85)');
  gradient.addColorStop(0.25, 'rgba(0, 0, 0, 0.65)');
  gradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
  gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.08)');
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates an elegant CAD / Studio engineering grid texture.
 */
export function createStudioGridTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  const step = 32;
  // Sub-grid
  ctx.strokeStyle = 'rgba(74, 96, 126, 0.18)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(size, x);
    ctx.stroke();
  }

  // Major grid
  ctx.strokeStyle = 'rgba(100, 160, 220, 0.45)';
  ctx.lineWidth = 2;
  const majorStep = step * 4;
  for (let x = 0; x <= size; x += majorStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(size, x);
    ctx.stroke();
  }

  // Crosshairs at major intersections
  ctx.strokeStyle = 'rgba(140, 210, 255, 0.7)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= size; x += majorStep) {
    for (let y = 0; y <= size; y += majorStep) {
      ctx.beginPath();
      ctx.moveTo(x - 6, y);
      ctx.lineTo(x + 6, y);
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x, y + 6);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a high-precision procedural luxury watch dial texture with tachymeter & hour indices.
 */
export function createWatchDialTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const center = size / 2;
  const radius = size * 0.47;

  // Background dark sunray base
  const bgGrad = ctx.createRadialGradient(center, center, 0, center, center, radius);
  bgGrad.addColorStop(0, '#121622');
  bgGrad.addColorStop(0.7, '#0b0e17');
  bgGrad.addColorStop(1, '#05070c');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();

  // Subtle concentric micro-grooves
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let r = radius * 0.4; r < radius * 0.95; r += 4) {
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Minute & Second Ticks
  for (let i = 0; i < 60; i++) {
    const angle = (i * Math.PI) / 30 - Math.PI / 2;
    const isHour = i % 5 === 0;
    const innerR = isHour ? radius * 0.8 : radius * 0.88;
    const outerR = radius * 0.94;

    const x1 = center + Math.cos(angle) * innerR;
    const y1 = center + Math.sin(angle) * innerR;
    const x2 = center + Math.cos(angle) * outerR;
    const y2 = center + Math.sin(angle) * outerR;

    ctx.strokeStyle = isHour ? '#38bdf8' : 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = isHour ? 4 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Hour numerals
    if (isHour) {
      const hourNum = i === 0 ? 12 : i / 5;
      const numR = radius * 0.72;
      const nx = center + Math.cos(angle) * numR;
      const ny = center + Math.sin(angle) * numR;

      ctx.save();
      ctx.translate(nx, ny);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 30px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hourNum.toString(), 0, 0);
      ctx.restore();
    }
  }

  // Branding text
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VORTEX', center, center - radius * 0.38);

  ctx.fillStyle = '#06b6d4';
  ctx.font = '500 13px "JetBrains Mono", monospace';
  ctx.fillText('TOURBILLON 100M', center, center - radius * 0.3);

  // Tachymeter outer rim text
  ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  const tachymeterMarks = [
    { text: 'TACHYMETRE', angle: -Math.PI / 2 },
    { text: '400', angle: -Math.PI / 3 },
    { text: '300', angle: -Math.PI / 6 },
    { text: '240', angle: 0 },
    { text: '200', angle: Math.PI / 6 },
    { text: '160', angle: Math.PI / 3 },
    { text: '120', angle: Math.PI / 2 },
    { text: '90', angle: (2 * Math.PI) / 3 },
    { text: '60', angle: Math.PI },
  ];

  tachymeterMarks.forEach((mark) => {
    const tr = radius * 0.97;
    const tx = center + Math.cos(mark.angle) * tr;
    const ty = center + Math.sin(mark.angle) * tr;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(mark.angle + Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(mark.text, 0, 0);
    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural twill carbon fiber normal/roughness map.
 */
export function createCarbonFiberTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cell = 16;
  for (let x = 0; x < size; x += cell) {
    for (let y = 0; y < size; y += cell) {
      const isAlt = ((x / cell) + (y / cell)) % 2 === 0;
      ctx.fillStyle = isAlt ? '#1e222a' : '#111419';
      ctx.fillRect(x, y, cell, cell);

      // Micro striations
      ctx.strokeStyle = isAlt ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1;
      for (let s = 0; s < cell; s += 3) {
        ctx.beginPath();
        if (isAlt) {
          ctx.moveTo(x + s, y);
          ctx.lineTo(x + s, y + cell);
        } else {
          ctx.moveTo(x, y + s);
          ctx.lineTo(x + cell, y + s);
        }
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural circular brushed metal normal map.
 */
export function createBrushedMetalNormalTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8080ff'; // flat tangent space normal (128, 128, 255)
  ctx.fillRect(0, 0, size, size);

  const center = size / 2;
  const maxR = size / 2;

  // Add subtle radial tangent perturbations
  for (let r = 5; r < maxR; r += 2) {
    const jitter = (Math.random() - 0.5) * 20;
    const red = Math.floor(128 + jitter);
    const green = Math.floor(128 - jitter);
    ctx.strokeStyle = `rgb(${red}, ${green}, 245)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Procedural CRT retro screen with animated scanlines & phosphor matrix.
 */
export function createRetroScreenTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#050c18';
  ctx.fillRect(0, 0, size, size);

  // Retro cyber vector graphic
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 12;

  // Draw wireframe terrain horizon
  for (let y = size * 0.55; y < size * 0.95; y += 24) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(size - 20, y);
    ctx.stroke();
  }
  for (let x = 40; x < size; x += 48) {
    ctx.beginPath();
    ctx.moveTo(size / 2 + (x - size / 2) * 0.2, size * 0.55);
    ctx.lineTo(x, size * 0.95);
    ctx.stroke();
  }

  // Neon glowing sun
  const sunGrad = ctx.createLinearGradient(0, size * 0.2, 0, size * 0.55);
  sunGrad.addColorStop(0, '#f43f5e');
  sunGrad.addColorStop(1, '#eab308');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.42, 65, Math.PI, 0);
  ctx.fill();

  // CRT scanlines
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  for (let y = 0; y < size; y += 4) {
    ctx.fillRect(0, y, size, 2);
  }

  // Terminal text
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText('SYSTEM: ONLINE', 30, 45);
  ctx.fillStyle = '#10b981';
  ctx.fillText('CORE: OPTIMAL (99.8%)', 30, 75);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural leather bump map.
 */
export function createLeatherBumpTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 1 + Math.random() * 2.5;
    const brightness = Math.floor(90 + Math.random() * 75);
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}
