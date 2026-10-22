import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Palette,
  Sun,
  Camera,
  Download,
  Play,
  Pause,
  RotateCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Image,
  FileCode,
  Crosshair,
  Grid,
  Sparkles,
} from 'lucide-react';
import {
  CameraPreset,
  MaterialFinish,
  RenderMode,
  StudioSettings,
} from '../types/model';
import { FINISH_PALETTES } from '../3d/materials';
import { sound } from '../services/sound';

interface BottomControlDockProps {
  settings: StudioSettings;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
  onCameraPreset: (preset: CameraPreset) => void;
  onCaptureSnapshot: () => void;
  onExportOBJ: () => void;
}

type TabType = 'controls' | 'finishes' | 'studio' | 'camera' | 'export';

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  settings,
  onUpdateSettings,
  onCameraPreset,
  onCaptureSnapshot,
  onExportOBJ,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('controls');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Keyboard shortcut 'H' to toggle collapsed mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key.toLowerCase() === 'h') {
        setIsCollapsed((prev) => !prev);
        sound.playSwoosh();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabChange = (tab: TabType) => {
    sound.playClick();
    setActiveTab(tab);
    if (isCollapsed) setIsCollapsed(false);
  };

  const handleCollapseToggle = () => {
    sound.playSwoosh();
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-[940px] pointer-events-auto select-none transition-transform duration-300 ease-out"
      style={{
        transform: isCollapsed ? 'translate(-50%, calc(100% - 38px))' : 'translate(-50%, 0)',
      }}
    >
      {/* Dock Container */}
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-2xl shadow-black/70 overflow-hidden">
        {/* Top Control Bar / Tab Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-slate-950/50">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleTabChange('controls')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'controls' && !isCollapsed
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Kinematics & View</span>
            </button>

            <button
              onClick={() => handleTabChange('finishes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'finishes' && !isCollapsed
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Material Finishes</span>
            </button>

            <button
              onClick={() => handleTabChange('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'studio' && !isCollapsed
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Lighting & Scene</span>
            </button>

            <button
              onClick={() => handleTabChange('camera')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'camera' && !isCollapsed
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Angles</span>
            </button>

            <button
              onClick={() => handleTabChange('export')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'export' && !isCollapsed
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export & Tools</span>
            </button>
          </div>

          {/* Zen / Cinema Mode Toggle Button */}
          <button
            onClick={handleCollapseToggle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium transition-colors shrink-0 ml-2"
            title="Press 'H' on keyboard to toggle Zen Mode"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Show Dock</span>
                <span className="text-[10px] text-slate-400 font-mono">(H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Zen View</span>
                <span className="text-[10px] text-slate-400 font-mono">(H)</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Content Panel (unfolds below top bar) */}
        {!isCollapsed && (
          <div className="p-4 space-y-4">
            {/* TAB 1: KINEMATICS & CONTROLS */}
            {activeTab === 'controls' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Exploded View Slider */}
                <div className="md:col-span-5 space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Exploded View
                    </span>
                    <span className="font-mono text-cyan-400 text-xs font-bold">
                      {Math.round(settings.explodedProgress * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.explodedProgress}
                    onChange={(e) => {
                      sound.playSliderTick();
                      onUpdateSettings({ explodedProgress: parseFloat(e.target.value) });
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Assembled</span>
                    <span>Expanded Breakdown</span>
                  </div>
                </div>

                {/* Kinetic Animations & Speed */}
                <div className="md:col-span-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-300 font-medium">Kinetic Motion</span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpdateSettings({ animating: !settings.animating });
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        settings.animating
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {settings.animating ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ animationSpeed: spd });
                        }}
                        className={`flex-1 py-1 rounded-md text-[11px] font-mono font-medium transition-all ${
                          settings.animationSpeed === spd
                            ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                            : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Render Mode Selectors */}
                <div className="md:col-span-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span>Shading Mode</span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpdateSettings({ autoRotate: !settings.autoRotate });
                      }}
                      className={`p-1 rounded transition-colors ${
                        settings.autoRotate ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title="Toggle Auto-Rotate"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { id: 'pbr', label: 'PBR Shaded' },
                        { id: 'wireframe', label: 'Wireframe' },
                        { id: 'normals', label: 'Normals' },
                        { id: 'clay', label: 'Clay Sculpt' },
                      ] as { id: RenderMode; label: string }[]
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ renderMode: mode.id });
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          settings.renderMode === mode.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                            : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FINISHES & MATERIALS */}
            {activeTab === 'finishes' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {(Object.keys(FINISH_PALETTES) as MaterialFinish[]).map((fin) => {
                    const info = FINISH_PALETTES[fin];
                    const isSelected = settings.materialFinish === fin;
                    return (
                      <button
                        key={fin}
                        onClick={() => {
                          sound.playMetalChime();
                          onUpdateSettings({ materialFinish: fin });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: `#${info.baseColor.toString(16).padStart(6, '0')}` }}
                          />
                          <span className="text-xs font-semibold text-slate-200 truncate">{info.name.split(' ')[0]}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{info.description}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Metalness and Roughness fine tuning */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Metallic Multiplier</span>
                      <span className="font-mono text-cyan-400 text-xs">
                        {settings.metallicMultiplier.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.5"
                      step="0.05"
                      value={settings.metallicMultiplier}
                      onChange={(e) => {
                        sound.playSliderTick();
                        onUpdateSettings({ metallicMultiplier: parseFloat(e.target.value) });
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Roughness Multiplier</span>
                      <span className="font-mono text-cyan-400 text-xs">
                        {settings.roughnessMultiplier.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.5"
                      step="0.05"
                      value={settings.roughnessMultiplier}
                      onChange={(e) => {
                        sound.playSliderTick();
                        onUpdateSettings({ roughnessMultiplier: parseFloat(e.target.value) });
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: STUDIO & LIGHTING */}
            {activeTab === 'studio' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Lighting Presets */}
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    Lighting Environment
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'studio', name: 'Studio Softbox' },
                      { id: 'cyberpunk', name: 'Cyber Neon' },
                      { id: 'sunset', name: 'Golden Hour' },
                      { id: 'clean', name: 'Minimal White' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ lightingPreset: l.id as StudioSettings['lightingPreset'] });
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium text-left transition-all ${
                          settings.lightingPreset === l.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                            : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Themes */}
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-blue-400" />
                    Studio Backdrop
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'graphite', name: 'Graphite Dark' },
                      { id: 'deepSpace', name: 'Deep Space' },
                      { id: 'cleanWhite', name: 'Gallery White' },
                      { id: 'blueprint', name: 'CAD Blueprint' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ backgroundTheme: b.id as StudioSettings['backgroundTheme'] });
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium text-left transition-all ${
                          settings.backgroundTheme === b.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                            : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grounding & Visual Guides */}
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 space-y-2 flex flex-col justify-between">
                  <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-cyan-400" />
                    Grounding & Helpers
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpdateSettings({ showGrid: !settings.showGrid });
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                        settings.showGrid
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
                      }`}
                    >
                      Studio Grid
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpdateSettings({ contactShadows: !settings.contactShadows });
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                        settings.contactShadows
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
                      }`}
                    >
                      Ground Shadow
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CAMERA ANGLES */}
            {activeTab === 'camera' && (
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-300 font-medium">Precision Camera Viewpoints:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { id: 'isometric', label: 'Isometric 3/4' },
                      { id: 'front', label: 'Front Elevation' },
                      { id: 'top', label: 'Top Plan' },
                      { id: 'side', label: 'Side Profile' },
                      { id: 'macro', label: 'Macro Detail' },
                      { id: 'reset', label: 'Reset Camera' },
                    ] as { id: CameraPreset; label: string }[]
                  ).map((cam) => (
                    <button
                      key={cam.id}
                      onClick={() => {
                        sound.playClick();
                        onCameraPreset(cam.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-600/30 text-slate-300 hover:text-cyan-200 border border-slate-700/60 hover:border-cyan-500/40 text-xs font-medium transition-all"
                    >
                      {cam.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: EXPORT & TOOLS */}
            {activeTab === 'export' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 4K Screenshot */}
                <button
                  onClick={() => {
                    sound.playCameraSnap();
                    onCaptureSnapshot();
                  }}
                  className="p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                      <Image className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">Capture Snapshot</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Download high-res pristine PNG viewport render</p>
                </button>

                {/* 3D OBJ Export */}
                <button
                  onClick={() => {
                    sound.playClick();
                    onExportOBJ();
                  }}
                  className="p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">Export 3D (.OBJ)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Export active geometry for Blender, Maya, or 3D Printing</p>
                </button>

                {/* Part Inspector Mode Toggle */}
                <button
                  onClick={() => {
                    sound.playClick();
                    onUpdateSettings({ inspectMode: !settings.inspectMode });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.inspectMode
                      ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/40'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1.5 rounded-lg ${settings.inspectMode ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      <Crosshair className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      {settings.inspectMode ? 'Inspection Active' : 'Enable Inspector'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Hover & click meshes in viewport to inspect details</p>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
