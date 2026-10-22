import React from 'react';
import { AircraftStats, AircraftType, GameSettings } from '../types/game';
import { AIRCRAFT_ROSTER } from '../game/aircraftModels';
import { Play, Shield, Zap, Wind, Crosshair, Sparkles, ShoppingBag, Coins } from 'lucide-react';
import { gameAudio } from '../game/gameAudio';

interface StartMenuModalProps {
  selectedAircraft: AircraftType;
  onSelectAircraft: (type: AircraftType) => void;
  credits: number;
  onOpenShop: () => void;
  settings: GameSettings;
  onUpdateSettings: (s: Partial<GameSettings>) => void;
  onStartGame: () => void;
}

export const StartMenuModal: React.FC<StartMenuModalProps> = ({
  selectedAircraft,
  onSelectAircraft,
  credits,
  onOpenShop,
  settings,
  onUpdateSettings,
  onStartGame,
}) => {
  const currentPlane = AIRCRAFT_ROSTER.find((p) => p.id === selectedAircraft)!;

  const handleLaunch = () => {
    gameAudio.playExplosion(false);
    onStartGame();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-orbitron">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900/90 border border-cyan-500/50 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Mission Briefing & Title */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/60 uppercase tracking-widest">
                REAL-WORLD FLIGHT SIMULATOR
              </span>
              <span className="text-[10px] font-mono text-slate-400">COMBAT OPS</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wider mb-1 hud-glow-cyan">
              SKYFIRE 3D
            </h1>
            <p className="text-xs text-cyan-300/80 mb-6 font-sans">
              Dynamic tactical flight combat with canyon dogfights, orbital space boundary, and aircraft upgrades
            </p>

            {/* Tactical Mission Briefing Card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-wider">
                <Crosshair className="w-4 h-4" />
                <span>MISSION DIRECTIVE</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Hostile strike wings, mecha drones, and bombers have engaged the island archipelago. Complete tactical directives, fly through stunt rings, collect boost beacons, and eliminate the Titan Apex flagship.
              </p>
            </div>

            {/* Difficulty selector */}
            <div className="space-y-1.5 mb-6">
              <span className="text-[11px] text-slate-400 tracking-wider">COMBAT DIFFICULTY</span>
              <div className="grid grid-cols-3 gap-2">
                {(['recruit', 'ace', 'veteran'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => onUpdateSettings({ difficulty: diff })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all ${
                      settings.difficulty === diff
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60'
                        : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* World Lighting & Celestial Sky */}
            <div className="space-y-1.5 mb-5">
              <span className="text-[11px] text-slate-400 tracking-wider">WORLD LIGHTING & SKY</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {([
                  { id: 'dawn', label: 'Sunrise' },
                  { id: 'daylight', label: 'Sun' },
                  { id: 'sunset', label: 'Sunset' },
                  { id: 'night', label: 'Moon' },
                  { id: 'space', label: 'Space' },
                  { id: 'cycle', label: 'Cycle' },
                ] as const).map((lit) => (
                  <button
                    key={lit.id}
                    onClick={() => onUpdateSettings({ timeOfDay: lit.id })}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      settings.timeOfDay === lit.id
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/70 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {lit.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Invert pitch toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="text-xs text-slate-300 font-sans">Flight Stick Y-Axis (Pitch)</span>
              <button
                onClick={() => onUpdateSettings({ invertPitch: !settings.invertPitch })}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  settings.invertPitch ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.invertPitch ? 'INVERTED (PULL UP)' : 'NORMAL'}
              </button>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono mt-4">
            CONTROLS: W/S PITCH • A/D ROLL • SPACE LASER • F MISSILE • SHIFT BOOST • M WORLD MAP
          </div>
        </div>

        {/* Right Side: Aircraft Hangar & Selection */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 tracking-wider">ACTIVE AIRCRAFT</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400">
                  T{currentPlane.tier}
                </span>
              </div>

              {/* Credits pill + Shop Button */}
              <button
                onClick={onOpenShop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-colors text-xs font-bold"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>${credits.toLocaleString()} CR</span>
                <ShoppingBag className="w-3.5 h-3.5 ml-1 text-amber-300" />
              </button>
            </div>

            {/* Aircraft Selector Cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AIRCRAFT_ROSTER.slice(0, 3).map((plane) => {
                const isSelected = plane.id === selectedAircraft;
                return (
                  <button
                    key={plane.id}
                    onClick={() => {
                      gameAudio.playRingPass();
                      onSelectAircraft(plane.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: plane.color }} />
                    <div className="text-xs font-bold text-white truncate">{plane.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-400 font-sans truncate">{plane.role.split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>

            {/* Hangar Shop Requisition Banner */}
            <div
              onClick={onOpenShop}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-slate-950/40 border border-amber-500/40 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all mb-4 group"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-xs font-bold text-amber-300">Requisition Advanced Aircraft</div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    Unlock VF-31 Valkyrie Mecha & SR-72 Orbital Darkstar
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 font-mono">BROWSE →</span>
            </div>

            {/* Selected Aircraft Spec Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">{currentPlane.name}</h3>
                <span className="text-xs font-mono text-cyan-400 font-bold">{currentPlane.topSpeed} KTS</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">{currentPlane.description}</p>

              {/* Stat Progress Bars */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-sans">
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-0.5 font-orbitron">
                    <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-cyan-400" /> TOP SPEED</span>
                    <span className="font-mono text-cyan-300">{currentPlane.topSpeed} kts</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(currentPlane.topSpeed / 1400) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-0.5 font-orbitron">
                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-400" /> AGILITY</span>
                    <span className="font-mono text-purple-300">{Math.round(currentPlane.agility * 60)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(currentPlane.agility / 1.7) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-0.5 font-orbitron">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> DURABILITY</span>
                    <span className="font-mono text-emerald-300">{currentPlane.armor + currentPlane.shields} HP</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${((currentPlane.armor + currentPlane.shields) / 400) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleLaunch}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-400 text-white font-extrabold text-sm tracking-widest shadow-xl shadow-cyan-950/60 flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>SORTIE: LAUNCH FIGHTER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
