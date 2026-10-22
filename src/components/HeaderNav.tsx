import React from 'react';
import {
  Box,
  Layers,
  Upload,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Info,
} from 'lucide-react';
import { ModelDefinition } from '../types/model';
import { sound } from '../services/sound';

interface HeaderNavProps {
  models: ModelDefinition[];
  activeModel: ModelDefinition;
  onSelectModel: (model: ModelDefinition) => void;
  onOpenGallery: () => void;
  onOpenUpload: () => void;
  onOpenInspector: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  models,
  activeModel,
  onSelectModel,
  onOpenGallery,
  onOpenUpload,
  onOpenInspector,
  soundEnabled,
  onToggleSound,
}) => {
  const toggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none px-4 py-3 flex items-center justify-between select-none">
      {/* Brand & Active Model Quick Selector */}
      <div className="pointer-events-auto flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg shadow-black/40">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-inner">
            <Box className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-sm text-white">VORTEX 3D</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Real-Time PBR Viewport</p>
          </div>
        </div>

        {/* Model quick picker pills */}
        <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-900/75 border border-slate-800/70 shadow-lg">
          {models.slice(0, 5).map((m) => {
            const isActive = m.id === activeModel.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  sound.playClick();
                  onSelectModel(m);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {m.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Spec Badge & Primary Actions */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        {/* Model Spec Pill */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenInspector();
          }}
          className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/50 text-xs font-mono cursor-pointer hover:border-cyan-500/50 transition-colors shadow-lg"
          title="Click to view detailed component hierarchy & stats"
        >
          <div className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{activeModel.triangleCount.toLocaleString()} <span className="text-slate-400 text-[10px]">TRIS</span></span>
          </div>
          <div className="w-px h-3.5 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>{activeModel.parts.length} <span className="text-[10px]">PARTS</span></span>
          </div>
          <Info className="w-3 h-3 text-cyan-400/80" />
        </div>

        {/* Gallery button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenGallery();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 hover:border-slate-600 text-xs font-semibold shadow-lg transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Gallery</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenUpload();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all active:scale-95"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload 3D</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors shadow-lg"
          title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors shadow-lg"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
