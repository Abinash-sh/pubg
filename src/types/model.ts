export type RenderMode = 'pbr' | 'wireframe' | 'normals' | 'clay';

export type MaterialFinish =
  | 'default'
  | 'titanium'
  | 'obsidian'
  | 'rosegold'
  | 'cyberpunk'
  | 'chrome'
  | 'emerald';

export type LightingPreset = 'studio' | 'cyberpunk' | 'sunset' | 'clean';

export type BackgroundTheme = 'graphite' | 'deepSpace' | 'cleanWhite' | 'blueprint';

export type CameraPreset = 'isometric' | 'front' | 'top' | 'side' | 'macro' | 'reset';

export interface ModelPartInfo {
  id: string;
  name: string;
  triangleCount: number;
  vertexCount: number;
  materialName: string;
  dimensions: { x: number; y: number; z: number };
}

export interface ModelStats {
  triangleCount: number;
  vertexCount: number;
  partCount: number;
  meshCount: number;
  boundingBox: {
    width: number;
    height: number;
    depth: number;
  };
}

export interface ModelDefinition {
  id: string;
  name: string;
  tagline: string;
  category: 'Mechanical' | 'Aerospace' | 'Cybernetics' | 'Industrial' | 'Custom';
  description: string;
  author: string;
  triangleCount: number;
  vertexCount: number;
  parts: string[];
  dimensions: string; // e.g. "44mm × 44mm × 14mm"
  features: string[];
  isCustom?: boolean;
}

export interface StudioSettings {
  renderMode: RenderMode;
  materialFinish: MaterialFinish;
  lightingPreset: LightingPreset;
  backgroundTheme: BackgroundTheme;
  explodedProgress: number; // 0.0 to 1.0
  autoRotate: boolean;
  rotateSpeed: number; // 0.1 to 3.0
  animating: boolean; // kinetic parts animation (gears, thrusters)
  animationSpeed: number; // 0.5 to 2.0
  contactShadows: boolean;
  showGrid: boolean;
  metallicMultiplier: number; // 0.0 to 1.5
  roughnessMultiplier: number; // 0.0 to 1.5
  soundEnabled: boolean;
  inspectMode: boolean;
}
