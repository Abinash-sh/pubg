import React from 'react';
import { Play, RotateCw, Volume2, VolumeX, Camera, ShoppingBag } from 'lucide-react';
import { GameSettings } from '../types/game';

interface PauseMenuProps {
  settings: GameSettings;
  onUpdateSettings: (s: Partial<GameSettings>) => void;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onOpenShop: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  settings,
  onUpdateSettings,
  onResume,
  onRestart,
  onMenu,
  onOpenShop,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none font-orbitron">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900/90 border border-cyan-500/50 shadow-2xl overflow-hidden p-6 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-white tracking-widest hud-glow-cyan">
          TACTICAL PAUSE
        </h2>
        <p className="text-xs text-slate-400 font-sans">Flight systems suspended</p>

        {/* Quick Toggles */}
        <div className="space-y-2 text-left font-sans text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-300">Y-Axis Pitch</span>
            <button
              onClick={() => onUpdateSettings({ invertPitch: !settings.invertPitch })}
              className={`px-3 py-1 rounded text-xs font-bold font-orbitron ${
                settings.invertPitch ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.invertPitch ? 'INVERTED' : 'STANDARD'}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-300">Audio Synthesis</span>
            <button
              onClick={onToggleMute}
              className={`px-3 py-1 rounded text-xs font-bold font-orbitron flex items-center gap-1.5 ${
                !isMuted ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span>{isMuted ? 'MUTED' : 'ENABLED'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-300">Camera Mode</span>
            <button
              onClick={() => {
                const modes: GameSettings['cameraMode'][] = ['CHASE', 'COCKPIT', 'CINEMATIC'];
                const next = modes[(modes.indexOf(settings.cameraMode) + 1) % modes.length];
                onUpdateSettings({ cameraMode: next });
              }}
              className="px-3 py-1 rounded text-xs font-bold font-orbitron bg-slate-800 text-cyan-300 border border-slate-700"
            >
              {settings.cameraMode}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-300">World Lighting</span>
            <button
              onClick={() => {
                const presets: GameSettings['timeOfDay'][] = ['dawn', 'daylight', 'sunset', 'night', 'space', 'cycle'];
                const next = presets[(presets.indexOf(settings.timeOfDay) + 1) % presets.length];
                onUpdateSettings({ timeOfDay: next });
              }}
              className="px-3 py-1 rounded text-xs font-bold font-orbitron bg-slate-800 text-amber-300 border border-slate-700 uppercase"
            >
              {settings.timeOfDay}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-300">Weather System</span>
            <button
              onClick={() => {
                const presets: GameSettings['weather'][] = ['clear', 'fog', 'rain', 'thunderstorm'];
                const next = presets[(presets.indexOf(settings.weather) + 1) % presets.length];
                onUpdateSettings({ weather: next });
              }}
              className="px-3 py-1 rounded text-xs font-bold font-orbitron bg-slate-800 text-cyan-300 border border-slate-700 uppercase"
            >
              {settings.weather}
            </button>
          </div>
        </div>


        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RESUME SORTIE</span>
          </button>

          <button
            onClick={onOpenShop}
            className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>AIRCRAFT HANGAR SHOP</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold tracking-wider transition-colors"
          >
            RESTART MISSION
          </button>

          <button
            onClick={onMenu}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
          >
            ABORT TO MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
