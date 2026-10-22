import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import {
  BackgroundTheme,
  CameraPreset,
  LightingPreset,
  ModelPartInfo,
  StudioSettings,
} from '../types/model';
import { applyMaterialOverrides } from './materials';
import { createContactShadowTexture, createStudioGridTexture } from './proceduralTextures';

// Pre-allocated math scratch variables outside loop (Zero GC)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

export interface HoveredPartEvent {
  partName: string;
  triangleCount: number;
  vertexCount: number;
  screenPos: { x: number; y: number };
}

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;

  private container: HTMLElement;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Scene entities
  private currentModelRoot: THREE.Group | null = null;
  private shadowPlane: THREE.Mesh | null = null;
  private gridPlane: THREE.Mesh | null = null;

  // Lighting rig
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private studioAreaGroup = new THREE.Group();

  // Camera damping state
  private targetCameraPos = new THREE.Vector3(5, 4, 6);
  private targetControlsTarget = new THREE.Vector3(0, 1.2, 0);
  private isTransitioningCamera = false;

  // Exploded view damping
  private currentExplodeProgress = 0;
  private targetExplodeProgress = 0;

  // Active settings
  private settings: StudioSettings;

  // Inspection & Raycasting
  private hoveredMesh: THREE.Mesh | null = null;
  private hoveredOriginalEmissive: THREE.Color = new THREE.Color(0, 0, 0);
  public onHoverPartChange: ((event: HoveredPartEvent | null) => void) | null = null;
  public onSelectPart: ((part: ModelPartInfo | null) => void) | null = null;

  constructor(container: HTMLElement, initialSettings: StudioSettings) {
    this.container = container;
    this.settings = initialSettings;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.camera.position.set(5.2, 4.0, 6.2);

    // 3. Renderer with physical pipeline
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    this.renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // for screenshot capture
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = !isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.2, 0);
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // allow looking slightly from ground up
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 25.0;
    this.controls.autoRotate = initialSettings.autoRotate;
    this.controls.autoRotateSpeed = initialSettings.rotateSpeed;

    // 5. Studio Environment map via PMREMGenerator & RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTexture;
    pmremGenerator.dispose();

    // 6. Lighting Rig
    this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 1.2);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xfff5ea, 2.8);
    this.keyLight.position.set(6, 9, 6);
    this.keyLight.castShadow = !isHeadless;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.bias = -0.0004;
    this.keyLight.shadow.normalBias = 0.02;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 30;
    const d = 5;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0x93c5fd, 1.1);
    this.fillLight.position.set(-6, 5, -5);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    this.rimLight.position.set(0, 7, -8);
    this.scene.add(this.rimLight);

    this.scene.add(this.studioAreaGroup);

    // 7. Ground Contact Shadow & Studio Grid
    this.setupGround();

    // 8. Apply Background & Lighting presets
    this.updateBackgroundTheme(initialSettings.backgroundTheme);
    this.updateLightingPreset(initialSettings.lightingPreset);

    // 9. Event Listeners
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.addEventListener('click', this.onPointerClick);

    // 10. Start Animation Loop
    this.animate();
  }

  private setupGround() {
    // Soft radial contact shadow plane
    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(9, 9);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = 0.002;
    this.scene.add(this.shadowPlane);

    // Studio Grid plane
    const gridTex = createStudioGridTexture();
    const gridGeo = new THREE.PlaneGeometry(24, 24);
    const gridMat = new THREE.MeshBasicMaterial({
      map: gridTex,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.gridPlane = new THREE.Mesh(gridGeo, gridMat);
    this.gridPlane.rotation.x = -Math.PI / 2;
    this.gridPlane.position.y = 0.001;
    this.scene.add(this.gridPlane);
  }

  public setModel(modelGroup: THREE.Group) {
    if (this.currentModelRoot) {
      this.scene.remove(this.currentModelRoot);
      this.disposeObject(this.currentModelRoot);
    }

    this.currentModelRoot = modelGroup;
    this.scene.add(this.currentModelRoot);

    // Apply materials and finish
    applyMaterialOverrides(
      this.currentModelRoot,
      this.settings.renderMode,
      this.settings.materialFinish,
      this.settings.metallicMultiplier,
      this.settings.roughnessMultiplier
    );

    // Reset exploded progress
    this.currentExplodeProgress = 0;
    this.targetExplodeProgress = this.settings.explodedProgress;
    this.applyExplodedPositions(0);

    // Pre-warm shaders
    this.renderer.compile(this.scene, this.camera);
  }

  public updateSettings(newSettings: Partial<StudioSettings>) {
    const prev = { ...this.settings };
    this.settings = { ...this.settings, ...newSettings };

    if (newSettings.backgroundTheme && newSettings.backgroundTheme !== prev.backgroundTheme) {
      this.updateBackgroundTheme(newSettings.backgroundTheme);
    }
    if (newSettings.lightingPreset && newSettings.lightingPreset !== prev.lightingPreset) {
      this.updateLightingPreset(newSettings.lightingPreset);
    }
    if (newSettings.autoRotate !== undefined) {
      this.controls.autoRotate = newSettings.autoRotate;
    }
    if (newSettings.rotateSpeed !== undefined) {
      this.controls.autoRotateSpeed = newSettings.rotateSpeed;
    }
    if (newSettings.explodedProgress !== undefined) {
      this.targetExplodeProgress = newSettings.explodedProgress;
    }
    if (newSettings.contactShadows !== undefined && this.shadowPlane) {
      this.shadowPlane.visible = newSettings.contactShadows;
    }
    if (newSettings.showGrid !== undefined && this.gridPlane) {
      this.gridPlane.visible = newSettings.showGrid;
    }

    if (
      this.currentModelRoot &&
      (newSettings.renderMode !== undefined ||
        newSettings.materialFinish !== undefined ||
        newSettings.metallicMultiplier !== undefined ||
        newSettings.roughnessMultiplier !== undefined)
    ) {
      applyMaterialOverrides(
        this.currentModelRoot,
        this.settings.renderMode,
        this.settings.materialFinish,
        this.settings.metallicMultiplier,
        this.settings.roughnessMultiplier
      );
    }
  }

  public updateBackgroundTheme(theme: BackgroundTheme) {
    let bgColor = 0x0a0c12;
    let fogColor = 0x0a0c12;

    switch (theme) {
      case 'graphite':
        bgColor = 0x0c0f17;
        fogColor = 0x0c0f17;
        break;
      case 'deepSpace':
        bgColor = 0x03060c;
        fogColor = 0x03060c;
        break;
      case 'cleanWhite':
        bgColor = 0xebf0f5;
        fogColor = 0xebf0f5;
        break;
      case 'blueprint':
        bgColor = 0x0a1628;
        fogColor = 0x0a1628;
        break;
    }

    this.scene.background = new THREE.Color(bgColor);
    this.scene.fog = new THREE.FogExp2(fogColor, 0.038);
  }

  public updateLightingPreset(preset: LightingPreset) {
    switch (preset) {
      case 'studio':
        this.hemiLight.color.setHex(0xdbeafe);
        this.hemiLight.groundColor.setHex(0x1e293b);
        this.hemiLight.intensity = 1.3;
        this.keyLight.color.setHex(0xfff6eb);
        this.keyLight.intensity = 2.8;
        this.keyLight.position.set(6, 9, 6);
        this.fillLight.color.setHex(0x93c5fd);
        this.fillLight.intensity = 1.2;
        this.rimLight.color.setHex(0x38bdf8);
        this.rimLight.intensity = 1.6;
        break;

      case 'cyberpunk':
        this.hemiLight.color.setHex(0x06b6d4);
        this.hemiLight.groundColor.setHex(0x4c1d95);
        this.hemiLight.intensity = 1.5;
        this.keyLight.color.setHex(0x06b6d4);
        this.keyLight.intensity = 3.2;
        this.keyLight.position.set(5, 7, 5);
        this.fillLight.color.setHex(0xec4899);
        this.fillLight.intensity = 2.4;
        this.rimLight.color.setHex(0xa855f7);
        this.rimLight.intensity = 3.0;
        break;

      case 'sunset':
        this.hemiLight.color.setHex(0xfef3c7);
        this.hemiLight.groundColor.setHex(0x451a03);
        this.hemiLight.intensity = 1.2;
        this.keyLight.color.setHex(0xf97316);
        this.keyLight.intensity = 3.6;
        this.keyLight.position.set(8, 4, 6);
        this.fillLight.color.setHex(0x6366f1);
        this.fillLight.intensity = 1.5;
        this.rimLight.color.setHex(0xf43f5e);
        this.rimLight.intensity = 2.0;
        break;

      case 'clean':
        this.hemiLight.color.setHex(0xffffff);
        this.hemiLight.groundColor.setHex(0x64748b);
        this.hemiLight.intensity = 1.8;
        this.keyLight.color.setHex(0xffffff);
        this.keyLight.intensity = 2.2;
        this.keyLight.position.set(4, 10, 4);
        this.fillLight.color.setHex(0xffffff);
        this.fillLight.intensity = 1.4;
        this.rimLight.color.setHex(0xffffff);
        this.rimLight.intensity = 1.0;
        break;
    }
  }

  public setCameraPreset(preset: CameraPreset) {
    this.isTransitioningCamera = true;
    switch (preset) {
      case 'isometric':
        this.targetCameraPos.set(5.2, 4.0, 6.2);
        this.targetControlsTarget.set(0, 1.2, 0);
        break;
      case 'front':
        this.targetCameraPos.set(0, 1.4, 7.5);
        this.targetControlsTarget.set(0, 1.3, 0);
        break;
      case 'top':
        this.targetCameraPos.set(0, 8.5, 0.01);
        this.targetControlsTarget.set(0, 0.2, 0);
        break;
      case 'side':
        this.targetCameraPos.set(7.5, 1.4, 0);
        this.targetControlsTarget.set(0, 1.3, 0);
        break;
      case 'macro':
        this.targetCameraPos.set(1.4, 1.6, 2.1);
        this.targetControlsTarget.set(0, 1.3, 0);
        break;
      case 'reset':
        this.targetCameraPos.set(5.2, 4.0, 6.2);
        this.targetControlsTarget.set(0, 1.2, 0);
        break;
    }
  }

  private applyExplodedPositions(progress: number) {
    if (!this.currentModelRoot) return;

    this.currentModelRoot.traverse((child) => {
      if (child.userData.isPart && child.userData.basePosition && child.userData.explodeDirection) {
        const base = child.userData.basePosition as THREE.Vector3;
        const dir = child.userData.explodeDirection as THREE.Vector3;
        const dist = (child.userData.explodeDistance as number) || 1.2;

        child.position.x = base.x + dir.x * dist * progress;
        child.position.y = base.y + dir.y * dist * progress;
        child.position.z = base.z + dir.z * dist * progress;
      }
    });
  }

  private onPointerMove = (e: MouseEvent) => {
    if (!this.settings.inspectMode || !this.currentModelRoot) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, this.camera);
    const intersects = _raycaster.intersectObjects(this.currentModelRoot.children, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      if (hit !== this.hoveredMesh) {
        this.resetHoveredMesh();
        this.hoveredMesh = hit;

        // Apply inspection glow tint
        if (hit.material instanceof THREE.MeshStandardMaterial) {
          this.hoveredOriginalEmissive.copy(hit.material.emissive);
          hit.material.emissive.setHex(0x06b6d4);
          hit.material.emissiveIntensity = 0.65;
        }

        const geo = hit.geometry;
        const tris = geo.index ? geo.index.count / 3 : geo.attributes.position ? geo.attributes.position.count / 3 : 0;
        const verts = geo.attributes.position ? geo.attributes.position.count : 0;

        if (this.onHoverPartChange) {
          this.onHoverPartChange({
            partName: hit.userData.partName || hit.name || 'Component Mesh',
            triangleCount: Math.round(tris),
            vertexCount: verts,
            screenPos: { x: e.clientX, y: e.clientY },
          });
        }
      }
    } else {
      this.resetHoveredMesh();
      if (this.onHoverPartChange) {
        this.onHoverPartChange(null);
      }
    }
  };

  private resetHoveredMesh() {
    if (this.hoveredMesh) {
      if (this.hoveredMesh.material instanceof THREE.MeshStandardMaterial) {
        this.hoveredMesh.material.emissive.copy(this.hoveredOriginalEmissive);
        this.hoveredMesh.material.emissiveIntensity = 0;
      }
      this.hoveredMesh = null;
    }
  }

  private onPointerClick = (e: MouseEvent) => {
    if (!this.currentModelRoot) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, this.camera);
    const intersects = _raycaster.intersectObjects(this.currentModelRoot.children, true);
    if (intersects.length > 0 && this.onSelectPart) {
      const hit = intersects[0].object as THREE.Mesh;
      const geo = hit.geometry;
      const tris = geo.index ? geo.index.count / 3 : geo.attributes.position ? geo.attributes.position.count / 3 : 0;
      const verts = geo.attributes.position ? geo.attributes.position.count : 0;
      const box = new THREE.Box3().setFromObject(hit);
      const size = new THREE.Vector3();
      box.getSize(size);

      this.onSelectPart({
        id: hit.uuid,
        name: hit.userData.partName || hit.name || 'Selected Part',
        triangleCount: Math.round(tris),
        vertexCount: verts,
        materialName: Array.isArray(hit.material) ? hit.material[0].name : hit.material?.name || 'Standard PBR',
        dimensions: {
          x: parseFloat(size.x.toFixed(2)),
          y: parseFloat(size.y.toFixed(2)),
          z: parseFloat(size.z.toFixed(2)),
        },
      });
    }
  };

  public captureSnapshot(): string {
    // Render current frame with pristine buffer
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public exportModelAsOBJ(): string | null {
    if (!this.currentModelRoot) return null;
    const exporter = new OBJExporter();
    return exporter.parse(this.currentModelRoot);
  }

  private onResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // 1. Smooth Camera Damping
    if (this.isTransitioningCamera) {
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCameraPos.x, 4.5, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y, 4.5, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, 4.5, delta);

      this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.targetControlsTarget.x, 4.5, delta);
      this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.targetControlsTarget.y, 4.5, delta);
      this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.targetControlsTarget.z, 4.5, delta);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.05) {
        this.isTransitioningCamera = false;
      }
    }

    // 2. Smooth Exploded View Damping
    if (Math.abs(this.currentExplodeProgress - this.targetExplodeProgress) > 0.001) {
      this.currentExplodeProgress = THREE.MathUtils.damp(
        this.currentExplodeProgress,
        this.targetExplodeProgress,
        5.5,
        delta
      );
      this.applyExplodedPositions(this.currentExplodeProgress);
    }

    // 3. Kinetic Animations on Model Components (gears, balance wheels, gimbals)
    if (this.settings.animating && this.currentModelRoot) {
      const speedMult = this.settings.animationSpeed;
      this.currentModelRoot.traverse((child) => {
        if (child.userData.isKinetic) {
          if (child.userData.isOscillating) {
            // Harmonic balance wheel oscillation
            const oscSpeed = (child.userData.oscillateSpeed as number) || 8.0;
            const maxAngle = (child.userData.oscillateAngle as number) || 0.8;
            child.rotation.z = Math.sin(elapsed * oscSpeed * speedMult) * maxAngle;
          } else {
            const spinAxis = (child.userData.spinAxis as 'x' | 'y' | 'z') || 'y';
            const spinSpeed = ((child.userData.spinSpeed as number) || 1.0) * speedMult;
            child.rotation[spinAxis] += spinSpeed * delta;
          }
        }
      });
    }

    // 4. Update OrbitControls
    this.controls.update();

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);
  };

  private disposeObject(obj: THREE.Object3D) {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }
    });
  }

  public dispose() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.removeEventListener('click', this.onPointerClick);

    this.controls.dispose();
    if (this.currentModelRoot) {
      this.disposeObject(this.currentModelRoot);
    }
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
