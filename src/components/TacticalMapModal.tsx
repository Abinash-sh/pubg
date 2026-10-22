import React from 'react';
import {
  EnemyEntity,
  PlayerFlightState,
  RingEntity,
  WorldPickup,
  WeatherPreset,
} from '../types/game';
import { TimeOfDayPreset } from '../game/celestialSystem';
import {
  MapPin,
  Crosshair,
  Navigation,
  Compass,
  X,
  Anchor,
  FlameKindling,
  MountainSnow,
  Trees,
  Rocket,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  RotateCw,
  Radio,
  CheckCircle,
  Building2,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
} from 'lucide-react';

interface TacticalMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: PlayerFlightState;
  enemies: EnemyEntity[];
  rings: RingEntity[];
  pickups: WorldPickup[];
  playerCoords: { x: number; y: number; z: number };
  activeWaypoint: { id: string; name: string; x: number; z: number } | null;
  onSelectWaypoint: (wp: { id: string; name: string; x: number; z: number } | null) => void;
  currentTimeOfDay?: TimeOfDayPreset;
  onSetTimeOfDay?: (preset: TimeOfDayPreset) => void;
  currentWeather?: WeatherPreset;
  onSetWeather?: (preset: WeatherPreset) => void;
}

export const TacticalMapModal: React.FC<TacticalMapModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  enemies,
  rings,
  pickups,
  playerCoords,
  activeWaypoint,
  onSelectWaypoint,
  currentTimeOfDay = 'day',
  onSetTimeOfDay,
  currentWeather = 'clear',
  onSetWeather,
}) => {
  if (!isOpen) return null;

  // Normalized coordinate projection
  // World bounds roughly X: [-2400, 2400], Z: [-2800, 1200]
  const minX = -2400;
  const maxX = 2400;
  const minZ = -2800;
  const maxZ = 1200;

  const toMapX = (x: number) => {
    return Math.max(2, Math.min(98, ((x - minX) / (maxX - minX)) * 100));
  };

  const toMapY = (z: number) => {
    return Math.max(2, Math.min(98, ((z - minZ) / (maxZ - minZ)) * 100));
  };

  // Comprehensive Real-World Sectors
  const sectors = [
    {
      id: 'alpha',
      name: 'SECTOR ALPHA: NAVAL AIRBASE & HARBOR',
      shortName: 'ALPHA (AIRBASE)',
      desc: 'Runway 09/27, rotating aerodrome beacon, carrier flight deck & radar installation',
      x: 180,
      z: 120,
      icon: Anchor,
      color: '#38bdf8',
    },
    {
      id: 'bravo',
      name: 'SECTOR BRAVO: VOLCANIC CANYON OF FIRE',
      shortName: 'BRAVO (CANYON)',
      desc: 'Basalt spires, active glowing lava fissures & natural stone flight arches',
      x: 450,
      z: -550,
      icon: FlameKindling,
      color: '#f97316',
    },
    {
      id: 'charlie',
      name: 'SECTOR CHARLIE: ALPINE GLACIER & WIND FARM',
      shortName: 'CHARLIE (ALPINE)',
      desc: 'Snow-capped peaks (> 400m), glacier pass, radio masts & rotating wind turbines',
      x: -320,
      z: -750,
      icon: MountainSnow,
      color: '#e2e8f0',
    },
    {
      id: 'delta',
      name: 'SECTOR DELTA: EMERALD FOREST ATOLLS',
      shortName: 'DELTA (FOREST)',
      desc: 'Dense pine canopy, sandy shoreline lagoons, low-level terrain hugging',
      x: 0,
      z: -320,
      icon: Trees,
      color: '#22c55e',
    },
    {
      id: 'echo',
      name: 'SECTOR ECHO: ORBITAL STRATOSPHERE',
      shortName: 'ECHO (SPACE)',
      desc: 'Stratospheric vacuum (> 2500 ft), solar orbital platform & constellation corridor',
      x: 0,
      z: -1900,
      icon: Rocket,
      color: '#a855f7',
    },
    {
      id: 'foxtrot',
      name: 'SECTOR FOXTROT: OFFSHORE DEFENSE PLATFORM',
      shortName: 'FOXTROT (OIL RIG)',
      desc: 'Deep-ocean steel rig with helipad marking, derrick crane & perimeter safety lights',
      x: -450,
      z: -350,
      icon: Crosshair,
      color: '#eab308',
    },
    {
      id: 'golf',
      name: 'SECTOR GOLF: PROMONTORY LIGHTHOUSE',
      shortName: 'GOLF (LIGHTHOUSE)',
      desc: 'Coastal navigation beacon on rocky headland with rotating 360° light beam',
      x: -280,
      z: 260,
      icon: Compass,
      color: '#f43f5e',
    },
    {
      id: 'sierra',
      name: 'SECTOR SIERRA: METROPOLIS BAY & SUSPENSION BRIDGE',
      shortName: 'SIERRA (CITY)',
      desc: 'Downtown skyscrapers, glass towers, suspension bridge channel & container port',
      x: 480,
      z: 480,
      icon: Building2,
      color: '#06b6d4',
    },
  ];

  const timePresets: { id: TimeOfDayPreset; label: string; icon: any }[] = [
    { id: 'dawn', label: 'Sunrise', icon: Sunrise },
    { id: 'day', label: 'Noon Sun', icon: Sun },
    { id: 'sunset', label: 'Sunset', icon: Sunset },
    { id: 'night', label: 'Moonlight', icon: Moon },
    { id: 'space', label: 'Deep Space', icon: Rocket },
    { id: 'cycle', label: 'Auto Cycle', icon: RotateCw },
  ];

  const weatherPresets: { id: WeatherPreset; label: string; icon: any }[] = [
    { id: 'clear', label: 'Clear', icon: Cloud },
    { id: 'fog', label: 'Sea Fog', icon: CloudFog },
    { id: 'rain', label: 'Rain', icon: CloudRain },
    { id: 'thunderstorm', label: 'Storm', icon: CloudLightning },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none font-orbitron animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-2xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-widest flex items-center gap-2">
                <span>TACTICAL SATELLITE WORLD MAP</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                  REAL-TIME GPS
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Real-world topography, solar lighting, dynamic weather & sector waypoints
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time of Day & Lighting Quick Toggles */}
            {onSetTimeOfDay && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono px-1.5 hidden xl:inline">LIGHT:</span>
                {timePresets.map((tp) => {
                  const Icon = tp.icon;
                  const isActive = currentTimeOfDay === tp.id;
                  return (
                    <button
                      key={tp.id}
                      onClick={() => onSetTimeOfDay(tp.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isActive
                          ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={`Switch world lighting to ${tp.label}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{tp.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Weather Quick Toggles */}
            {onSetWeather && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono px-1.5 hidden xl:inline">WX:</span>
                {weatherPresets.map((wp) => {
                  const Icon = wp.icon;
                  const isActive = currentWeather === wp.id;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => onSetWeather(wp.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isActive
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-400 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={`Switch weather to ${wp.label}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{wp.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Live Telemetry Coordinates */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-cyan-500/40 text-xs font-mono">
              <span className="text-cyan-400 font-bold">POS:</span>
              <span className="text-slate-200">
                X:{Math.round(playerCoords.x)} Y:{Math.round(playerCoords.y)} Z:{Math.round(playerCoords.z)}
              </span>
              <span className="text-cyan-400 font-bold ml-1">HDG:</span>
              <span className="text-slate-200">{telemetry.heading}°</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map Body & Sector Sidebar */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative bg-[#040914]">
          {/* Main Topological Map Projection (8 cols) */}
          <div className="md:col-span-8 relative w-full h-full border-r border-slate-800 overflow-hidden cursor-crosshair">
            {/* Background Ocean & Grid Lines */}
            <div className="absolute inset-0 bg-[#051124] opacity-95" />

            {/* Tactical Coordinate Grid Lines */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(56, 189, 248, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.35) 1px, transparent 1px)',
                backgroundSize: '45px 45px',
              }}
            />

            {/* Compass Rose / North Indicator */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/85 border border-cyan-500/50 text-[11px] text-cyan-300 shadow-md">
              <Navigation className="w-3.5 h-3.5" />
              <span>GRID NORTH (000°)</span>
            </div>

            {/* Waypoint Status Banner */}
            {activeWaypoint && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs shadow-lg animate-in fade-in">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                <span>ACTIVE WAYPOINT: {activeWaypoint.name}</span>
                <button
                  onClick={() => onSelectWaypoint(null)}
                  className="ml-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Visual Island archipelago landmass silhouettes */}
            <div
              className="absolute w-36 h-36 rounded-full bg-emerald-950/40 border border-emerald-500/30 transform -translate-x-1/2 -translate-y-1/2 blur-[1px] pointer-events-none"
              style={{ left: `${toMapX(0)}%`, top: `${toMapY(-350)}%` }}
            />
            <div
              className="absolute w-32 h-32 rounded-full bg-amber-950/40 border border-amber-500/30 transform -translate-x-1/2 -translate-y-1/2 blur-[1px] pointer-events-none"
              style={{ left: `${toMapX(450)}%`, top: `${toMapY(-550)}%` }}
            />
            <div
              className="absolute w-40 h-40 rounded-full bg-slate-800/40 border border-slate-400/30 transform -translate-x-1/2 -translate-y-1/2 blur-[1px] pointer-events-none"
              style={{ left: `${toMapX(-320)}%`, top: `${toMapY(-750)}%` }}
            />

            {/* Sector Markers & Interactive Waypoint click targets */}
            {sectors.map((sec) => {
              const mx = toMapX(sec.x);
              const my = toMapY(sec.z);
              const Icon = sec.icon;
              const isSelected = activeWaypoint?.id === sec.id;

              return (
                <div
                  key={sec.id}
                  onClick={() => onSelectWaypoint(isSelected ? null : sec)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer group"
                  style={{ left: `${mx}%`, top: `${my}%` }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'ring-4 ring-cyan-400 scale-125 shadow-2xl'
                        : 'group-hover:scale-115 shadow-lg'
                    }`}
                    style={{
                      borderColor: sec.color,
                      backgroundColor: isSelected ? sec.color : `${sec.color}35`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: isSelected ? '#000' : sec.color }} />
                  </div>

                  <span
                    className={`text-[9px] font-bold tracking-wider mt-1 px-1.5 py-0.5 rounded border whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 border-white'
                        : 'bg-slate-950/90 group-hover:bg-slate-900'
                    }`}
                    style={{ color: isSelected ? '#000' : sec.color, borderColor: `${sec.color}60` }}
                  >
                    {sec.shortName}
                  </span>
                </div>
              );
            })}

            {/* Runway Strip Representation (Sector Alpha) */}
            <div
              className="absolute w-3.5 h-20 bg-slate-200/90 border border-cyan-400 transform -translate-x-1/2 -translate-y-1/2 z-10 rounded-sm shadow-md"
              style={{ left: `${toMapX(180)}%`, top: `${toMapY(120)}%` }}
              title="Naval Runway 09/27"
            />

            {/* Stunt Energy Rings */}
            {rings.map((ring) => {
              const rx = toMapX(ring.position.x);
              const ry = toMapY(ring.position.z);

              return (
                <div
                  key={ring.id}
                  className={`absolute w-3 h-3 rounded-full border transform -translate-x-1/2 -translate-y-1/2 z-15 ${
                    ring.passed
                      ? 'border-amber-400 bg-amber-500/30'
                      : 'border-cyan-400 bg-cyan-500/40 animate-pulse'
                  }`}
                  style={{ left: `${rx}%`, top: `${ry}%` }}
                  title="Stunt Ring"
                />
              );
            })}

            {/* World Pickups */}
            {pickups
              .filter((p) => !p.collected)
              .map((p) => {
                const px = toMapX(p.position.x);
                const py = toMapY(p.position.z);

                return (
                  <div
                    key={p.id}
                    className="absolute w-2.5 h-2.5 rounded-sm bg-yellow-400 transform -translate-x-1/2 -translate-y-1/2 z-15 shadow-sm shadow-yellow-500"
                    style={{ left: `${px}%`, top: `${py}%` }}
                    title={`Tactical Boost: ${p.type}`}
                  />
                );
              })}

            {/* Hostile Enemy Targets */}
            {enemies.map((enemy) => {
              const ex = toMapX(enemy.position.x);
              const ey = toMapY(enemy.position.z);
              const isBoss = enemy.type === 'boss_apex';

              return (
                <div
                  key={enemy.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-25 flex flex-col items-center ${
                    isBoss ? 'animate-bounce' : ''
                  }`}
                  style={{ left: `${ex}%`, top: `${ey}%` }}
                >
                  <div
                    className={`rounded-full border flex items-center justify-center ${
                      isBoss
                        ? 'w-6 h-6 bg-rose-600 border-white shadow-xl shadow-rose-900 animate-pulse'
                        : 'w-2.5 h-2.5 bg-rose-500 border-rose-300'
                    }`}
                  >
                    {isBoss && <Crosshair className="w-3.5 h-3.5 text-white" />}
                  </div>
                  {isBoss && (
                    <span className="text-[9px] font-bold text-rose-300 bg-rose-950 px-1 rounded mt-0.5 whitespace-nowrap">
                      TITAN APEX
                    </span>
                  )}
                </div>
              );
            })}

            {/* LIVE PLAYER AIRCRAFT ICON */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none transition-all duration-75"
              style={{
                left: `${toMapX(playerCoords.x)}%`,
                top: `${toMapY(playerCoords.z)}%`,
              }}
            >
              {/* Heading Pointer Arrow */}
              <div
                className="w-6 h-6 flex items-center justify-center transition-transform"
                style={{ transform: `rotate(${telemetry.heading}deg)` }}
              >
                <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[16px] border-b-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)]" />
              </div>

              {/* Radar pulse ring */}
              <div className="absolute -inset-2.5 rounded-full border-2 border-cyan-400 animate-ping opacity-60 pointer-events-none" />

              <span className="text-[10px] font-extrabold text-cyan-200 bg-slate-950/90 px-1.5 rounded border border-cyan-500/70 mt-1 whitespace-nowrap">
                YOU ({telemetry.altitude} FT)
              </span>
            </div>
          </div>

          {/* Right Sidebar: Sector Intelligence & Waypoints (4 cols) */}
          <div className="md:col-span-4 p-5 flex flex-col justify-between overflow-y-auto bg-slate-950/80 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-cyan-400 tracking-wider">
                  THEATRE OF OPERATIONS
                </span>
                <span className="text-[10px] font-mono text-slate-400">CLICK TO SET WAYPOINT</span>
              </div>

              <div className="space-y-2">
                {sectors.map((sec) => {
                  const Icon = sec.icon;
                  const isSelected = activeWaypoint?.id === sec.id;
                  const dx = sec.x - playerCoords.x;
                  const dz = sec.z - playerCoords.z;
                  const dist = Math.round(Math.sqrt(dx * dx + dz * dz));

                  return (
                    <div
                      key={sec.id}
                      onClick={() => onSelectWaypoint(isSelected ? null : sec)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color: sec.color }} />
                          <span className="font-bold text-white text-[11px] truncate">{sec.name.split(':')[0]}</span>
                        </div>
                        <span className="font-mono text-[10px] text-cyan-300 font-bold">{dist}m</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{sec.desc}</p>
                      {isSelected && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                          <span>WAYPOINT LOCKED • HUD GUIDANCE ACTIVE</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map Legend */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-300 tracking-wider">TACTICAL LEGEND</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Your Aircraft</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Hostile Target</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full border border-cyan-400" />
                  <span>Stunt Ring</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-yellow-400" />
                  <span>Supply Drop</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wider shadow-lg active:scale-98 transition-all"
            >
              RETURN TO FLIGHT COCKPIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
