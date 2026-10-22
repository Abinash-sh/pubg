import React, { useRef, useEffect, useState } from 'react';
import {
  HoveredPartEvent,
  SceneManager,
} from '../3d/SceneManager';
import {
  CameraPreset,
  ModelDefinition,
  ModelPartInfo,
  StudioSettings,
} from '../types/model';
import { buildProceduralModel } from '../3d/proceduralModels';
import { loadCustomModelFromFile } from '../3d/fileLoader';
import { UploadCloud, Compass, Move, Search, MousePointer, RotateCw } from 'lucide-react';
import { sound } from '../services/sound';

interface Viewport3DProps {
  activeModel: ModelDefinition;
  settings: StudioSettings;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
  onModelLoaded: (def: ModelDefinition) => void;
  onSelectPart: (part: ModelPartInfo | null) => void;
  sceneManagerRef: React.MutableRefObject<SceneManager | null>;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  activeModel,
  settings,
  onModelLoaded,
  onSelectPart,
  sceneManagerRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPart, setHoveredPart] = useState<HoveredPartEvent | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!containerRef.current) return;

    const mgr = new SceneManager(containerRef.current, settings);
    sceneManagerRef.current = mgr;

    mgr.onHoverPartChange = (evt) => {
      setHoveredPart(evt);
    };

    mgr.onSelectPart = (part) => {
      onSelectPart(part);
    };

    // Load initial model
    const initialMesh = buildProceduralModel(activeModel.id);
    mgr.setModel(initialMesh);

    return () => {
      mgr.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // When activeModel changes (if built-in), switch models
  useEffect(() => {
    if (!sceneManagerRef.current) return;
    if (activeModel.isCustom) return; // custom models are loaded via upload

    const mesh = buildProceduralModel(activeModel.id);
    sceneManagerRef.current.setModel(mesh);
  }, [activeModel.id]);

  // Synchronize settings updates to SceneManager
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateSettings(settings);
    }
  }, [settings]);

  // Handle Drag & Drop of 3D files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleFileLoad(file);
    }
  };

  const handleFileLoad = async (file: File) => {
    setIsLoadingFile(true);
    sound.playSwoosh();
    try {
      const { object, definition } = await loadCustomModelFromFile(file);
      if (sceneManagerRef.current) {
        sceneManagerRef.current.setModel(object);
        sceneManagerRef.current.setCameraPreset('isometric');
      }
      onModelLoaded(definition);
      sound.playMetalChime();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse 3D file.';
      alert(msg);
    } finally {
      setIsLoadingFile(false);
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Three.js Isolated Canvas Mount */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Inspection Tooltip */}
      {hoveredPart && settings.inspectMode && (
        <div
          className="fixed pointer-events-none z-40 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-cyan-500/70 shadow-xl shadow-cyan-950/50 backdrop-blur-none text-xs"
          style={{
            left: `${hoveredPart.screenPos.x}px`,
            top: `${hoveredPart.screenPos.y - 12}px`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-300">{hoveredPart.partName}</span>
            <span className="text-[10px] font-mono text-slate-400">
              {hoveredPart.triangleCount.toLocaleString()} tris
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Click to view full component specs</p>
        </div>
      )}

      {/* Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center pointer-events-none">
          <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-400 mb-3 animate-bounce">
            <UploadCloud className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Drop 3D Model File Here</h2>
          <p className="text-sm text-cyan-300 font-mono">Supports .GLB, .GLTF, .OBJ, and .STL</p>
        </div>
      )}

      {/* Loading Modal / Spinner */}
      {isLoadingFile && (
        <div className="absolute inset-0 z-50 bg-slate-950/70 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-white tracking-wide">Processing 3D Geometry...</p>
          <p className="text-xs text-slate-400 font-mono mt-1">Normalizing bounds & generating PBR shaders</p>
        </div>
      )}

      {/* Viewport Nav Guide / Gizmo Pill (Left Flank) */}
      <div className="absolute bottom-6 left-4 z-10 pointer-events-none hidden md:flex flex-col gap-1.5 p-2 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[11px] text-slate-400 font-mono shadow-lg">
        <div className="flex items-center gap-2">
          <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Left Drag : Orbit 360°</span>
        </div>
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-blue-400" />
          <span>Right Drag : Pan Studio</span>
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-emerald-400" />
          <span>Wheel : Zoom Optics</span>
        </div>
      </div>
    </div>
  );
};
