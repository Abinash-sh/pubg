import React, { useState } from 'react';
import { X, Sparkles, Box, Check, Compass, ArrowRight, Layers } from 'lucide-react';
import { ModelDefinition } from '../types/model';
import { sound } from '../services/sound';

interface ModelGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelDefinition[];
  activeModelId: string;
  onSelectModel: (model: ModelDefinition) => void;
}

export const ModelGalleryModal: React.FC<ModelGalleryModalProps> = ({
  isOpen,
  onClose,
  models,
  activeModelId,
  onSelectModel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Mechanical', 'Aerospace', 'Industrial', 'Cybernetics', 'Custom'];
  const filteredModels = models.filter((m) =>
    selectedCategory === 'All' ? true : m.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">3D Model Catalogue & Showroom</h2>
              <p className="text-xs text-slate-400">
                Engineered procedural multi-part assemblies & custom imported models
              </p>
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

        {/* Category Filter Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-slate-900/50 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Models Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModels.map((model) => {
            const isActive = model.id === activeModelId;
            return (
              <div
                key={model.id}
                className={`relative rounded-xl p-5 border flex flex-col justify-between transition-all ${
                  isActive
                    ? 'bg-cyan-950/20 border-cyan-500/70 shadow-lg shadow-cyan-950/30'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {model.category}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        <Check className="w-3 h-3" />
                        Active in Viewport
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{model.name}</h3>
                  <p className="text-xs text-cyan-400/90 font-medium mb-3">{model.tagline}</p>
                  <p className="text-xs text-slate-300/80 mb-4 leading-relaxed">{model.description}</p>

                  {/* Spec Chips */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center mb-4">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Triangles</div>
                      <div className="text-xs font-bold text-slate-200 font-mono">
                        {model.triangleCount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Vertices</div>
                      <div className="text-xs font-bold text-slate-200 font-mono">
                        {model.vertexCount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Parts</div>
                      <div className="text-xs font-bold text-slate-200 font-mono">{model.parts.length}</div>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-1 mb-4">
                    {model.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer action */}
                <button
                  onClick={() => {
                    sound.playMetalChime();
                    onSelectModel(model);
                    onClose();
                  }}
                  disabled={isActive}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isActive
                      ? 'bg-slate-800/50 text-slate-500 cursor-default'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-950/40 active:scale-[0.99]'
                  }`}
                >
                  <span>{isActive ? 'Loaded in Viewport' : 'Open in 3D Studio'}</span>
                  {!isActive && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
