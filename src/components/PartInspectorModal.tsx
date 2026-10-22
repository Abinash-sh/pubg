import React from 'react';
import { X, Layers, Box, Cpu, HardDrive, Ruler, Info, CheckCircle } from 'lucide-react';
import { ModelDefinition, ModelPartInfo } from '../types/model';
import { sound } from '../services/sound';

interface PartInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelDefinition;
  selectedPart: ModelPartInfo | null;
}

export const PartInspectorModal: React.FC<PartInspectorModalProps> = ({
  isOpen,
  onClose,
  model,
  selectedPart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">3D Geometry & Hierarchy Inspector</h2>
              <p className="text-xs text-slate-400 font-mono">{model.name}</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Selected Part Focus Badge (if user clicked a part) */}
          {selectedPart && (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/50 shadow-lg shadow-cyan-950/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
                  Targeted Sub-Mesh Component
                </span>
                <span className="text-xs font-mono text-cyan-400">{selectedPart.materialName}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{selectedPart.name}</h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Triangles</div>
                  <div className="font-bold text-cyan-300">{selectedPart.triangleCount.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Vertices</div>
                  <div className="font-bold text-cyan-300">{selectedPart.vertexCount.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Bounds (X/Y/Z)</div>
                  <div className="font-bold text-cyan-300 text-[11px]">
                    {selectedPart.dimensions.x} × {selectedPart.dimensions.y} × {selectedPart.dimensions.z}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Model Specification Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-mono mb-1 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                Polygon Count
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {model.triangleCount.toLocaleString()} <span className="text-[10px] text-slate-400">tris</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-mono mb-1 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-blue-400" />
                Vertices
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {model.vertexCount.toLocaleString()} <span className="text-[10px] text-slate-400">pts</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-mono mb-1 flex items-center gap-1">
                <Ruler className="w-3 h-3 text-amber-400" />
                Dimensions
              </div>
              <div className="text-xs font-bold text-white font-mono truncate" title={model.dimensions}>
                {model.dimensions}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-mono mb-1 flex items-center gap-1">
                <Box className="w-3 h-3 text-emerald-400" />
                Category
              </div>
              <div className="text-xs font-bold text-white">{model.category}</div>
            </div>
          </div>

          {/* Assembly Components Breakdown List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Assembled Sub-Assemblies ({model.parts.length})</span>
              <span className="text-[10px] text-slate-400 font-mono">Interactive Exploded Segments</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 divide-y divide-slate-850 overflow-hidden">
              {model.parts.map((partName, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-850/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono text-slate-500 w-4">#{idx + 1}</span>
                    <span className="font-medium text-slate-200">{partName}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    PBR Mesh
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Engineering Notes & Architectural Highlights */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Architectural Notes</span>
            </div>
            <div className="space-y-1.5">
              {model.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
