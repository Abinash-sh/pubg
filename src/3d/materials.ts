import * as THREE from 'three';
import { MaterialFinish, RenderMode } from '../types/model';
import {
  createBrushedMetalNormalTexture,
  createCarbonFiberTexture,
  createLeatherBumpTexture,
  createRetroScreenTexture,
  createWatchDialTexture,
} from './proceduralTextures';

// Shared procedural textures cache
let brushedNormalTex: THREE.CanvasTexture | null = null;
let carbonFiberTex: THREE.CanvasTexture | null = null;
let watchDialTex: THREE.CanvasTexture | null = null;
let retroScreenTex: THREE.CanvasTexture | null = null;
let leatherBumpTex: THREE.CanvasTexture | null = null;

export function getProceduralTextures() {
  if (!brushedNormalTex) brushedNormalTex = createBrushedMetalNormalTexture();
  if (!carbonFiberTex) carbonFiberTex = createCarbonFiberTexture();
  if (!watchDialTex) watchDialTex = createWatchDialTexture();
  if (!retroScreenTex) retroScreenTex = createRetroScreenTexture();
  if (!leatherBumpTex) leatherBumpTex = createLeatherBumpTexture();

  return {
    brushedNormalTex,
    carbonFiberTex,
    watchDialTex,
    retroScreenTex,
    leatherBumpTex,
  };
}

/**
 * Creates standard baseline PBR materials for procedural 3D models.
 */
export function createModelMaterialLibrary() {
  const textures = getProceduralTextures();

  return {
    titaniumBrushed: new THREE.MeshPhysicalMaterial({
      color: 0xc4cbd5,
      metalness: 0.92,
      roughness: 0.22,
      clearcoat: 0.4,
      clearcoatRoughness: 0.15,
      normalMap: textures.brushedNormalTex,
      normalScale: new THREE.Vector2(0.35, 0.35),
    }),

    polishedSteel: new THREE.MeshPhysicalMaterial({
      color: 0xebf0f8,
      metalness: 0.98,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    }),

    ceramicBezel: new THREE.MeshPhysicalMaterial({
      color: 0x0f131a,
      metalness: 0.15,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    }),

    sapphireGlass: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.03,
      transmission: 0.96,
      ior: 1.77, // Sapphire index of refraction
      thickness: 1.4,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
    }),

    kineticGoldBrass: new THREE.MeshPhysicalMaterial({
      color: 0xefbf43,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.3,
    }),

    bluedSteel: new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 0.8,
    }),

    watchDial: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.watchDialTex,
      metalness: 0.4,
      roughness: 0.3,
    }),

    carbonFiber: new THREE.MeshStandardMaterial({
      color: 0x22262d,
      map: textures.carbonFiberTex,
      metalness: 0.4,
      roughness: 0.45,
    }),

    aerospaceHull: new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
    }),

    aerospaceTrim: new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x0891b2,
      emissiveIntensity: 0.3,
    }),

    ionGlow: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x06b6d4,
      emissiveIntensity: 3.5,
      toneMapped: false,
    }),

    energyCore: new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x6366f1,
      emissiveIntensity: 4.0,
      toneMapped: false,
    }),

    reactorChrome: new THREE.MeshPhysicalMaterial({
      color: 0xdde6ed,
      metalness: 0.96,
      roughness: 0.1,
      clearcoat: 0.8,
    }),

    retroCRT: new THREE.MeshStandardMaterial({
      map: textures.retroScreenTex,
      emissiveMap: textures.retroScreenTex,
      emissive: 0xffffff,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    }),

    arcadeCabinet: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.3,
      roughness: 0.6,
    }),

    loungeLeather: new THREE.MeshStandardMaterial({
      color: 0x1f1917,
      metalness: 0.05,
      roughness: 0.65,
      bumpMap: textures.leatherBumpTex,
      bumpScale: 0.04,
    }),

    loungePlywood: new THREE.MeshPhysicalMaterial({
      color: 0x54321c,
      metalness: 0.1,
      roughness: 0.38,
      clearcoat: 0.5,
    }),

    loungeChrome: new THREE.MeshPhysicalMaterial({
      color: 0xf1f5f9,
      metalness: 0.99,
      roughness: 0.06,
      clearcoat: 1.0,
    }),
  };
}

// Global inspect & override materials cache
const normalsMaterial = new THREE.MeshNormalMaterial({ wireframe: false });
const clayMaterial = new THREE.MeshStandardMaterial({
  color: 0xd4c5b9,
  roughness: 0.75,
  metalness: 0.05,
});

/**
 * Finish override palettes
 */
export const FINISH_PALETTES: Record<
  MaterialFinish,
  {
    name: string;
    description: string;
    baseColor: number;
    metalness: number;
    roughness: number;
    clearcoat: number;
    accentColor?: number;
  }
> = {
  default: {
    name: 'Original Spec',
    description: 'Factory-engineered realistic multi-material composition',
    baseColor: 0xffffff,
    metalness: 0.8,
    roughness: 0.25,
    clearcoat: 0.5,
  },
  titanium: {
    name: 'Brushed Titanium',
    description: 'Aerospace grade Grade-5 satin titanium',
    baseColor: 0x8b95a5,
    metalness: 0.94,
    roughness: 0.22,
    clearcoat: 0.4,
  },
  obsidian: {
    name: 'Obsidian Noir',
    description: 'Deep stealth DLC carbon with gloss chamfers',
    baseColor: 0x121418,
    metalness: 0.85,
    roughness: 0.18,
    clearcoat: 0.8,
    accentColor: 0x22d3ee,
  },
  rosegold: {
    name: '18K Rose Gold',
    description: 'Warm copper-gold luxury alloy with mirror finish',
    baseColor: 0xb76e79,
    metalness: 0.95,
    roughness: 0.15,
    clearcoat: 0.6,
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    description: 'Iridescent synth-wave finish with electric cyan & magenta',
    baseColor: 0x0f172a,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 0.9,
    accentColor: 0xec4899,
  },
  chrome: {
    name: 'Mirror Platinum Chrome',
    description: 'Ultra-reflective optical mirror finish',
    baseColor: 0xf8fafc,
    metalness: 0.99,
    roughness: 0.04,
    clearcoat: 1.0,
  },
  emerald: {
    name: 'Royal Emerald & Gold',
    description: 'Deep racing green lacquer with 24k gold accents',
    baseColor: 0x064e3b,
    metalness: 0.75,
    roughness: 0.2,
    clearcoat: 0.9,
    accentColor: 0xfbbf24,
  },
};

/**
 * Apply render mode & material finishes dynamically to a 3D object hierarchy
 */
export function applyMaterialOverrides(
  root: THREE.Object3D,
  renderMode: RenderMode,
  finish: MaterialFinish,
  metalMultiplier = 1.0,
  roughMultiplier = 1.0
) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    // Cache original material if not already stored
    if (!child.userData.originalMaterial) {
      child.userData.originalMaterial = child.material;
    }

    const origMat = child.userData.originalMaterial;

    // 1. Render Mode Overrides
    if (renderMode === 'normals') {
      child.material = normalsMaterial;
      return;
    }
    if (renderMode === 'clay') {
      child.material = clayMaterial;
      return;
    }
    if (renderMode === 'wireframe') {
      if (Array.isArray(origMat)) {
        child.material = origMat.map((m) => {
          const clone = m.clone();
          clone.wireframe = true;
          return clone;
        });
      } else {
        const clone = origMat.clone();
        clone.wireframe = true;
        child.material = clone;
      }
      return;
    }

    // 2. Standard PBR Mode with Finish Customization
    if (finish === 'default') {
      child.material = origMat;
      if (child.material instanceof THREE.MeshStandardMaterial) {
        child.material.wireframe = false;
        child.material.metalness = Math.min(1.0, (child.userData.baseMetalness ?? child.material.metalness) * metalMultiplier);
        child.material.roughness = Math.min(1.0, Math.max(0.02, (child.userData.baseRoughness ?? child.material.roughness) * roughMultiplier));
      }
    } else {
      const palette = FINISH_PALETTES[finish];
      // Do not override glass or glowing emitters so they maintain their special optics
      if (child.userData.isGlass || child.userData.isEmitter || child.userData.isScreen) {
        child.material = origMat;
        return;
      }

      if (child.material instanceof THREE.MeshStandardMaterial) {
        if (!child.userData.baseColor) {
          child.userData.baseColor = child.material.color.getHex();
          child.userData.baseMetalness = child.material.metalness;
          child.userData.baseRoughness = child.material.roughness;
        }

        const mat = child.material.clone() as THREE.MeshStandardMaterial;
        mat.color.setHex(palette.baseColor);
        mat.metalness = Math.min(1.0, palette.metalness * metalMultiplier);
        mat.roughness = Math.min(1.0, Math.max(0.02, palette.roughness * roughMultiplier));
        if (mat instanceof THREE.MeshPhysicalMaterial) {
          mat.clearcoat = palette.clearcoat;
        }
        child.material = mat;
      }
    }
  });
}
