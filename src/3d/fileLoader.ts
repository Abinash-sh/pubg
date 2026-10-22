import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { ModelDefinition, ModelPartInfo, ModelStats } from '../types/model';

/**
 * Calculates model stats: triangle count, vertex count, bounding box, part list
 */
export function calculateModelStats(object: THREE.Object3D): {
  stats: ModelStats;
  parts: ModelPartInfo[];
} {
  let triangleCount = 0;
  let vertexCount = 0;
  let meshCount = 0;
  const parts: ModelPartInfo[] = [];

  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);

  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      meshCount++;
      const geo = child.geometry;
      let tris = 0;
      let verts = 0;

      if (geo.index) {
        tris = geo.index.count / 3;
      } else if (geo.attributes.position) {
        tris = geo.attributes.position.count / 3;
      }
      if (geo.attributes.position) {
        verts = geo.attributes.position.count;
      }

      triangleCount += Math.round(tris);
      vertexCount += verts;

      const partBox = new THREE.Box3().setFromObject(child);
      const partSize = new THREE.Vector3();
      partBox.getSize(partSize);

      const matName = Array.isArray(child.material)
        ? child.material.map((m) => m.name || m.type).join(', ')
        : child.material?.name || child.material?.type || 'Standard';

      parts.push({
        id: child.uuid,
        name: child.userData.partName || child.name || `Mesh Component #${meshCount}`,
        triangleCount: Math.round(tris),
        vertexCount: verts,
        materialName: matName,
        dimensions: {
          x: parseFloat(partSize.x.toFixed(2)),
          y: parseFloat(partSize.y.toFixed(2)),
          z: parseFloat(partSize.z.toFixed(2)),
        },
      });
    }
  });

  return {
    stats: {
      triangleCount,
      vertexCount,
      meshCount,
      partCount: parts.length,
      boundingBox: {
        width: parseFloat(size.x.toFixed(2)),
        height: parseFloat(size.y.toFixed(2)),
        depth: parseFloat(size.z.toFixed(2)),
      },
    },
    parts,
  };
}

/**
 * Normalizes model size and positions it flush with ground at Y = 0
 */
export function normalizeAndCenterModel(root: THREE.Object3D, targetSize = 4.0): THREE.Group {
  const container = new THREE.Group();
  container.add(root);

  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? targetSize / maxDim : 1.0;
  root.scale.set(scale, scale, scale);

  root.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);

  // Position root so center is (0, y, 0) and bottom sits on y = 0
  root.position.x -= center.x;
  root.position.y -= scaledBox.min.y;
  root.position.z -= center.z;

  // Configure shadows, normals, and explosion directions for sub-components
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (!child.geometry.attributes.normal) {
        child.geometry.computeVertexNormals();
      }

      // Configure default explode metadata if not preset
      if (!child.userData.isPart) {
        child.userData.isPart = true;
        child.userData.partName = child.name || `Part_${child.id}`;
        const childWorldPos = new THREE.Vector3();
        child.getWorldPosition(childWorldPos);
        const dir = new THREE.Vector3(childWorldPos.x, childWorldPos.y, childWorldPos.z).normalize();
        if (dir.lengthSq() < 0.001) dir.set(0, 1, 0);
        child.userData.explodeDirection = dir;
        child.userData.explodeDistance = 1.2;
        child.userData.basePosition = child.position.clone();
      }
    }
  });

  return container;
}

/**
 * Parses user-uploaded 3D model files (GLB, GLTF, OBJ, STL)
 */
export async function loadCustomModelFromFile(file: File): Promise<{
  object: THREE.Group;
  definition: ModelDefinition;
  stats: ModelStats;
  parts: ModelPartInfo[];
}> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  let loadedObject: THREE.Object3D;

  if (extension === 'glb' || extension === 'gltf') {
    const buffer = await file.arrayBuffer();
    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(buffer, '');
    loadedObject = gltf.scene;
  } else if (extension === 'obj') {
    const text = await file.text();
    const loader = new OBJLoader();
    loadedObject = loader.parse(text);
  } else if (extension === 'stl') {
    const buffer = await file.arrayBuffer();
    const loader = new STLLoader();
    const geometry = loader.parse(buffer);
    geometry.computeVertexNormals();
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.25,
      clearcoat: 0.3,
    });
    loadedObject = new THREE.Mesh(geometry, material);
    loadedObject.name = file.name.replace(/\.[^/.]+$/, '');
  } else {
    throw new Error(`Unsupported 3D file format: .${extension}. Please upload .glb, .gltf, .obj, or .stl.`);
  }

  const container = normalizeAndCenterModel(loadedObject, 3.8);
  const { stats, parts } = calculateModelStats(container);

  const cleanName = file.name.replace(/\.[^/.]+$/, '');
  const definition: ModelDefinition = {
    id: `custom_${Date.now()}`,
    name: cleanName,
    tagline: `User uploaded ${extension.toUpperCase()} model`,
    category: 'Custom',
    description: `Loaded from local file ${file.name}. Processed and normalized with high-precision PBR shading and kinematic analysis.`,
    author: 'Local Upload',
    triangleCount: stats.triangleCount,
    vertexCount: stats.vertexCount,
    parts: parts.slice(0, 12).map((p) => p.name),
    dimensions: `${stats.boundingBox.width}m × ${stats.boundingBox.height}m × ${stats.boundingBox.depth}m`,
    features: [
      `${stats.triangleCount.toLocaleString()} Triangles`,
      `${stats.vertexCount.toLocaleString()} Vertices`,
      `${stats.meshCount} Mesh components`,
      'Ready for PBR finishes, 3D export, and exploded view',
    ],
    isCustom: true,
  };

  return {
    object: container,
    definition,
    stats,
    parts,
  };
}
