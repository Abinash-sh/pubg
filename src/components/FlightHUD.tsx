import React, { useState } from 'react';
import {
  PlayerFlightState,
  EnemyEntity,
  CameraViewMode,
  Quest,
  RadioMessage,
  WeatherPreset,
} from '../types/game';
import { TimeOfDayPreset } from '../game/celestialSystem';
import {
  Shield,
  Zap,
  Target,
  Flame,
  Camera,
  Volume2,
  VolumeX,
  Pause,
  AlertTriangle,
  Coins,
  Compass,
  Radio,
  ShoppingBag,
  ListOrdered,
  Rocket,
  Map,
  MapPin,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  RotateCw,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Wind,
} from 'lucide-react';

interface FlightHUDProps {
  telemetry: PlayerFlightState;
  enemies: EnemyEntity[];
  cameraMode: CameraViewMode;
  quests: Quest[];
  activeRadio: RadioMessage | null;
  onToggleCamera: () => void;
  onPause: () => void;
  onOpenShop: () => void;
  onOpenMap: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activeWaypoint?: { id: string; name: string; x: number; z: number } | null;
  currentTimeOfDay?: TimeOfDayPreset;
  onCycleTimeOfDay?: () => void;
  currentWeather?: WeatherPreset;
  onCycleWeather?: () => void;
  onMobilePitchRoll?: (pitch: number, roll: number) => void;
  onMobileBoost?: (active: boolean) => void;
  onMobileFireLaser?: (active: boolean) => void;
  onMobileFireMissile?: () => void;
}

export const FlightHUD: React.FC<FlightHUDProps> = ({
  telemetry,
  enemies,
  cameraMode,
  quests,
  activeRadio,
  onToggleCamera,
  onPause,
  onOpenShop,
  onOpenMap,
  isMuted,
  onToggleMute,
  activeWaypoint,
  currentTimeOfDay = 'day',
  onCycleTimeOfDay,
  currentWeather = 'clear',
  onCycleWeather,
  onMobilePitchRoll,
  onMobileBoost,
  onMobileFireLaser,
  onMobileFireMissile,
}) => {
  const [touchActive, setTouchActive] = useState(false);

  const [showQuests, setShowQuests] = useState(true);

  const machSpeed = (telemetry.speed / 660).toFixed(2);
  const isPullUp = telemetry.altitude < 120 && telemetry.pitch < -5;

  const lockedEnemy = enemies.find((e) => e.id === telemetry.lockedEnemyId);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchActive(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!onMobilePitchRoll) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = (touch.clientX - cx) / (rect.width / 2);
    const dy = (touch.clientY - cy) / (rect.height / 2);

    const clampedRoll = Math.max(-1, Math.min(1, dx));
    const clampedPitch = Math.max(-1, Math.min(1, dy));

    onMobilePitchRoll(clampedPitch, clampedRoll);
  };

  const handleTouchEnd = () => {
    setTouchActive(false);
    if (onMobilePitchRoll) onMobilePitchRoll(0, 0);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 font-orbitron">
      {/* REAL-WORLD IN-CLOUD MOISTURE & CANOPY VAPOR CONDENSATION */}
      {telemetry.cloudMoisture && telemetry.cloudMoisture > 0.05 && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
          style={{ opacity: telemetry.cloudMoisture * 0.7 }}
        >
          <div className="w-full h-full bg-slate-100/15 backdrop-blur-[2px] mix-blend-screen" />
        </div>
      )}

      {/* REAL-WORLD PRECIPITATION RAIN STREAKS ON COCKPIT WINDSHIELD */}
      {(telemetry.weather === 'rain' || telemetry.weather === 'thunderstorm') && (
        <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden z-10">
          <div className="w-full h-full bg-[repeating-linear-gradient(115deg,rgba(186,230,253,0.18)_0px,rgba(186,230,253,0.18)_2px,transparent_2px,transparent_45px)] animate-[pulse_1.2s_infinite]" />
        </div>
      )}

      {/* 1. TOP HEADER RIBBON: COMPASS, CREDITS, CONTROLS */}
      <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-6 z-20">
        {/* Top-Left: Game Controls, World Map & Hangar Shop Trigger */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 text-xs shadow-lg transition-all"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>PAUSE</span>
          </button>

          <button
            onClick={onOpenMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/85 border border-cyan-400 text-cyan-200 hover:bg-cyan-900 text-xs shadow-lg transition-all"
            title="Open Tactical Satellite World Map [Press M]"
          >
            <Map className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">WORLD MAP</span>
            <span className="text-[10px] font-mono px-1 rounded bg-cyan-900/60 border border-cyan-500/40">M</span>
          </button>

          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 text-xs shadow-lg transition-all"
            title="Requisition advanced aircraft"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">HANGAR SHOP</span>
          </button>

          {/* Time of Day Lighting Preset Button */}
          {onCycleTimeOfDay && (
            <button
              onClick={onCycleTimeOfDay}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-cyan-300 text-xs shadow-lg transition-all"
              title={`World Lighting: ${currentTimeOfDay.toUpperCase()} (Click to cycle)`}
            >
              {currentTimeOfDay === 'day' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : currentTimeOfDay === 'night' ? (
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
              ) : currentTimeOfDay === 'sunset' ? (
                <Sunset className="w-3.5 h-3.5 text-orange-400" />
              ) : currentTimeOfDay === 'dawn' ? (
                <Sunrise className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Rocket className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="hidden md:inline font-mono text-[11px] uppercase">{currentTimeOfDay}</span>
            </button>
          )}

          {/* Atmospheric Weather Preset Button */}
          {onCycleWeather && (
            <button
              onClick={onCycleWeather}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-cyan-300 text-xs shadow-lg transition-all"
              title={`Atmospheric Weather: ${(currentWeather || telemetry.weather).toUpperCase()} (Click to cycle)`}
            >
              {(currentWeather || telemetry.weather) === 'thunderstorm' ? (
                <CloudLightning className="w-3.5 h-3.5 text-amber-400" />
              ) : (currentWeather || telemetry.weather) === 'rain' ? (
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              ) : (currentWeather || telemetry.weather) === 'fog' ? (
                <CloudFog className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-cyan-300" />
              )}
              <span className="hidden md:inline font-mono text-[11px] uppercase">
                {currentWeather || telemetry.weather}
              </span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-cyan-300 transition-colors shadow-lg"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <button
            onClick={onToggleCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-cyan-300 text-xs shadow-lg transition-all"
            title="Press 'C' to switch camera"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-mono">{cameraMode}</span>
          </button>
        </div>

        {/* Center: Compass Heading & Space Status & Active Waypoint & Wind Indicator */}
        <div className="flex flex-col items-center">
          {telemetry.isSpace ? (
            <div className="px-5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-400 text-emerald-300 font-bold text-xs tracking-widest shadow-lg animate-pulse flex items-center gap-2">
              <Rocket className="w-3.5 h-3.5" />
              <span>ORBITAL STRATOSPHERE • VACUUM FLIGHT</span>
            </div>
          ) : (
            <div className="px-5 py-1 rounded-lg bg-slate-950/70 border border-cyan-500/50 shadow-lg flex items-center gap-2">
              <span className="text-[11px] text-cyan-400 tracking-wider">HDG</span>
              <span className="text-sm font-bold text-cyan-200 tracking-widest">
                {telemetry.heading.toString().padStart(3, '0')}°
              </span>
            </div>
          )}
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent mt-1" />

          {/* Real-World Wind Readout */}
          <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-[10px] text-slate-300 font-mono">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>WIND: {telemetry.windSpeed || 18} KTS @ {telemetry.windHeading || 240}°</span>
          </div>

          {/* Active Navigation Waypoint HUD Banner */}
          {activeWaypoint && (
            <div className="mt-1.5 px-3 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-mono text-xs shadow-lg flex items-center gap-1.5 animate-in fade-in">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span>WAYPOINT: {activeWaypoint.name.split(':')[0]}</span>
            </div>
          )}
        </div>

        {/* Top-Right: Credits, Score, Multiplier */}
        <div className="flex items-center gap-3">
          {/* Credits Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>${telemetry.credits.toLocaleString()} CR</span>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 tracking-wider">COMBAT SCORE</div>
            <div className="text-lg font-bold text-white tracking-widest hud-glow-cyan font-mono">
              {telemetry.score.toLocaleString()}
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-950/75 border border-amber-500/40 text-center">
            <div className="text-[9px] text-amber-400 font-bold uppercase">Multi</div>
            <div className="text-sm font-bold text-amber-300 font-mono">{telemetry.multiplier.toFixed(1)}x</div>
          </div>
        </div>
      </div>

      {/* 2. TACTICAL ANIME / COPILOT RADIO COMMS BANNER */}
      {activeRadio && (
        <div className="absolute top-16 left-6 z-30 pointer-events-none animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/50 shadow-2xl backdrop-blur-md max-w-md">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md"
              style={{ backgroundColor: activeRadio.avatarColor }}
            >
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-cyan-300 tracking-wider">{activeRadio.sender}</span>
                <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                  {activeRadio.callsign}
                </span>
              </div>
              <p className="text-xs text-white font-sans font-medium line-clamp-2 mt-0.5">
                "{activeRadio.text}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE QUESTS TRACKER (TOP-RIGHT) */}
      <div className="absolute top-16 right-6 z-20 pointer-events-auto">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xl backdrop-blur-sm max-w-xs">
          <div
            onClick={() => setShowQuests(!showQuests)}
            className="flex items-center justify-between cursor-pointer gap-2 mb-2"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <ListOrdered className="w-3.5 h-3.5" />
              <span>ACTIVE DIRECTIVES</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{showQuests ? '▼' : '▲'}</span>
          </div>

          {showQuests && (
            <div className="space-y-2 text-xs font-sans">
              {quests.slice(0, 3).map((q) => (
                <div key={q.id} className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-[11px] font-semibold ${q.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {q.title}
                    </span>
                    <span className="font-mono text-[10px] text-amber-400 font-bold">
                      {q.completed ? 'DONE' : `${q.current}/${q.target}`}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${q.completed ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                      style={{ width: `${Math.min(100, (q.current / q.target) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. ACTIVE POWERUP / BOOST BADGES */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {telemetry.activeOverdriveTime > 0 && (
          <div className="px-3 py-1 rounded-lg bg-cyan-600/80 border border-cyan-300 text-white font-bold text-xs tracking-wider animate-bounce shadow-lg flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-cyan-200" />
            <span>OVERDRIVE BOOST: {telemetry.activeOverdriveTime.toFixed(1)}s</span>
          </div>
        )}
        {telemetry.activeQuadLaserTime > 0 && (
          <div className="px-3 py-1 rounded-lg bg-amber-600/80 border border-amber-300 text-white font-bold text-xs tracking-wider animate-bounce shadow-lg flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span>QUAD CANNON: {telemetry.activeQuadLaserTime.toFixed(1)}s</span>
          </div>
        )}
      </div>

      {/* 5. CENTER FLIGHT LADDER & RETICLE */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="relative w-64 h-64 flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `rotate(${telemetry.roll}deg) translateY(${telemetry.pitch * 3}px)`,
          }}
        >
          {/* Horizon Line */}
          <div className="absolute w-44 h-px bg-cyan-400/50 flex items-center justify-between">
            <span className="text-[9px] text-cyan-400 -translate-y-3 font-mono">00</span>
            <span className="text-[9px] text-cyan-400 -translate-y-3 font-mono">00</span>
          </div>
          {/* Pitch Bars */}
          <div className="absolute w-28 h-px bg-cyan-400/40 -translate-y-12 flex justify-between">
            <div className="w-2 h-1.5 border-l border-t border-cyan-400" />
            <span className="text-[8px] text-cyan-400 -translate-y-2 font-mono">+10</span>
            <div className="w-2 h-1.5 border-r border-t border-cyan-400" />
          </div>
          <div className="absolute w-28 h-px border-t border-dashed border-cyan-400/40 translate-y-12 flex justify-between">
            <div className="w-2 h-1.5 border-l border-b border-cyan-400" />
            <span className="text-[8px] text-cyan-400 translate-y-1 font-mono">-10</span>
            <div className="w-2 h-1.5 border-r border-b border-cyan-400" />
          </div>
        </div>

        {/* Center Gunsight */}
        <div className="absolute w-12 h-12 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border border-cyan-400/80 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-cyan-300" />
          </div>
          <div className="absolute w-16 h-px bg-cyan-400/60" />
          <div className="absolute h-16 w-px bg-cyan-400/60" />
        </div>

        {/* Locked Target Bracket */}
        {lockedEnemy && (
          <div className="absolute flex flex-col items-center animate-in zoom-in-95 duration-100">
            <div className="relative w-24 h-24 border-2 border-dashed border-rose-500 rounded-xl flex items-center justify-center animate-pulse">
              <div className="text-[10px] font-bold text-rose-400 tracking-wider">
                {telemetry.lockProgress >= 1.0 ? 'LOCK ACQUIRED' : 'TRACKING'}
              </div>
            </div>

            <div className="mt-2 px-2.5 py-1 rounded bg-slate-950/80 border border-rose-500/60 text-center">
              <div className="text-[10px] font-bold text-rose-300 truncate max-w-[130px]">{lockedEnemy.name}</div>
              <div className="text-[9px] font-mono text-slate-300">{lockedEnemy.distanceToPlayer}m</div>
              <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden mt-1 mx-auto">
                <div
                  className="h-full bg-rose-500 transition-all"
                  style={{ width: `${(lockedEnemy.health / lockedEnemy.maxHealth) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* PULL UP Warning */}
        {isPullUp && (
          <div className="absolute top-32 flex flex-col items-center animate-bounce">
            <div className="px-6 py-2 rounded-xl bg-rose-600/90 border-2 border-rose-300 text-white font-extrabold tracking-widest text-lg shadow-2xl shadow-rose-900/80 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <span>WARNING: PULL UP!</span>
            </div>
            <span className="text-xs text-rose-400 font-mono mt-1">LOW ALTITUDE OBSTACLE</span>
          </div>
        )}
      </div>

      {/* 6. LEFT & RIGHT TELEMETRY TAPES */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
        <div className="flex flex-col items-end">
          <div className="text-[10px] text-cyan-400 tracking-wider">AIRSPEED</div>
          <div className="text-2xl font-bold text-white tracking-widest hud-glow-cyan font-mono">
            {telemetry.speed}
          </div>
          <div className="text-xs font-mono text-cyan-300 font-semibold">KNOTS</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">MACH {machSpeed}</div>
          <div className="text-[11px] font-mono text-amber-400 font-bold mt-1">{telemetry.gForce} G</div>
        </div>
        <div className="w-1.5 h-48 bg-slate-900/80 rounded-full overflow-hidden border border-cyan-500/40 p-0.5">
          <div
            className="w-full bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-full transition-all duration-75"
            style={{ height: `${Math.min(100, (telemetry.speed / 1200) * 100)}%` }}
          />
        </div>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
        <div className="w-1.5 h-48 bg-slate-900/80 rounded-full overflow-hidden border border-cyan-500/40 p-0.5">
          <div
            className="w-full bg-gradient-to-t from-blue-600 to-cyan-300 rounded-full transition-all duration-75"
            style={{ height: `${Math.min(100, (telemetry.altitude / 3500) * 100)}%` }}
          />
        </div>
        <div>
          <div className="text-[10px] text-cyan-400 tracking-wider">ALTITUDE</div>
          <div className="text-2xl font-bold text-white tracking-widest hud-glow-cyan font-mono">
            {telemetry.altitude}
          </div>
          <div className="text-xs font-mono text-cyan-300 font-semibold">FEET</div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            {telemetry.isSpace ? 'STRATOSPHERE' : 'TROPOSPHERE'}
          </div>
          <div className={`text-[10px] font-mono mt-1 font-bold ${telemetry.altitude < 120 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {telemetry.altitude < 120 ? 'TERRAIN ALERT' : 'ALTITUDE NOMINAL'}
          </div>
        </div>
      </div>

      {/* 7. CIRCULAR TACTICAL RADAR (BOTTOM-LEFT) */}
      <div
        onClick={onOpenMap}
        className="pointer-events-auto absolute bottom-6 left-6 flex flex-col items-center cursor-pointer group"
        title="Click to expand Tactical Satellite World Map [Press M]"
      >
        <div className="relative w-36 h-36 rounded-full bg-slate-950/85 border-2 border-cyan-500/50 group-hover:border-cyan-400 shadow-2xl overflow-hidden flex items-center justify-center transition-all group-hover:scale-105">
          <div className="absolute w-24 h-24 rounded-full border border-cyan-500/20" />
          <div className="absolute w-12 h-12 rounded-full border border-cyan-500/20" />
          <div className="absolute w-full h-px bg-cyan-500/30" />
          <div className="absolute h-full w-px bg-cyan-500/30" />

          <div className="absolute inset-0 animate-radar-sweep pointer-events-none">
            <div className="w-1/2 h-full bg-gradient-to-r from-cyan-500/30 to-transparent" />
          </div>

          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-white z-10" />

          {enemies.slice(0, 10).map((enemy) => {
            const rx = Math.max(-60, Math.min(60, enemy.position.x * 0.08));
            const rz = Math.max(-60, Math.min(60, enemy.position.z * 0.08));
            const isBoss = enemy.type === 'boss_apex';

            return (
              <div
                key={enemy.id}
                className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                  isBoss ? 'w-3.5 h-3.5 bg-amber-400 animate-ping' : 'w-2 h-2 bg-rose-500'
                }`}
                style={{
                  left: `calc(50% + ${rx}px)`,
                  top: `calc(50% + ${rz}px)`,
                }}
              />
            );
          })}
        </div>
        <div className="text-[10px] text-cyan-400 font-mono mt-1 tracking-wider flex items-center gap-1 group-hover:text-cyan-300">
          <span>RADAR</span>
          <span className="text-[9px] px-1 rounded bg-cyan-950 border border-cyan-600/50 font-bold">MAP [M]</span>
        </div>
      </div>

      {/* 8. BOTTOM COCKPIT SYSTEMS STATUS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-slate-950/85 border border-cyan-500/40 shadow-2xl">
          {/* Shields */}
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-cyan-300">
                <span>SHIELD</span>
                <span className="font-mono">{Math.round(telemetry.shields)}%</span>
              </div>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-100"
                  style={{ width: `${(telemetry.shields / telemetry.maxShields) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* Hull */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-400">
              H
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-emerald-300">
                <span>HULL</span>
                <span className="font-mono">{Math.round(telemetry.health)}%</span>
              </div>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-100"
                  style={{ width: `${(telemetry.health / telemetry.maxHealth) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* Cannon Heat */}
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${telemetry.isOverheated ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-amber-300">
                <span>LASER HEAT</span>
                <span className="font-mono">
                  {telemetry.isOverheated ? 'OVERHEAT' : `${Math.round(telemetry.cannonHeat * 100)}%`}
                </span>
              </div>
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    telemetry.isOverheated ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${telemetry.cannonHeat * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* Missiles */}
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-400" />
            <div>
              <div className="text-[10px] text-rose-300">MISSILES</div>
              <div className="text-xs font-bold text-white font-mono">
                {telemetry.missiles} / {telemetry.maxMissiles}
              </div>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* Throttle */}
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${telemetry.isBoosting ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
            <div>
              <div className="text-[10px] text-slate-300">THROTTLE</div>
              <div className={`text-xs font-bold font-mono ${telemetry.isBoosting ? 'text-amber-300' : 'text-cyan-300'}`}>
                {telemetry.isBoosting ? 'BOOST' : `${Math.round(telemetry.throttle * 100)}%`}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400 font-mono bg-slate-950/60 px-4 py-1 rounded-full border border-slate-800">
          <span><b className="text-cyan-300">W/S</b>: Pitch</span>
          <span><b className="text-cyan-300">A/D</b>: Roll</span>
          <span><b className="text-cyan-300">Q/E</b>: Rudder</span>
          <span><b className="text-cyan-300">SHIFT</b>: Boost</span>
          <span><b className="text-cyan-300">SPACE/L-CLICK</b>: Lasers</span>
          <span><b className="text-cyan-300">F/R-CLICK</b>: Missile</span>
          <span><b className="text-cyan-300">M</b>: World Map</span>
          <span><b className="text-cyan-300">C</b>: Camera</span>
        </div>
      </div>

      {/* 9. TOUCH CONTROLS (MOBILE) */}
      <div className="absolute inset-0 pointer-events-none md:hidden">
        <div
          className="pointer-events-auto absolute bottom-24 left-6 w-32 h-32 rounded-full border-2 border-cyan-500/40 bg-slate-950/60 flex items-center justify-center touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`w-12 h-12 rounded-full border border-cyan-300 transition-all ${
              touchActive ? 'bg-cyan-500/60 scale-110' : 'bg-cyan-500/30'
            }`}
          />
        </div>

        <div className="pointer-events-auto absolute bottom-24 right-6 flex flex-col gap-3">
          <button
            onTouchStart={() => onMobileBoost && onMobileBoost(true)}
            onTouchEnd={() => onMobileBoost && onMobileBoost(false)}
            className="w-14 h-14 rounded-full bg-amber-500/30 border-2 border-amber-400 text-amber-200 font-bold text-xs flex items-center justify-center shadow-lg active:scale-95"
          >
            BOOST
          </button>

          <button
            onTouchStart={() => onMobileFireLaser && onMobileFireLaser(true)}
            onTouchEnd={() => onMobileFireLaser && onMobileFireLaser(false)}
            className="w-16 h-16 rounded-full bg-cyan-600/50 border-2 border-cyan-400 text-white font-extrabold text-xs flex items-center justify-center shadow-lg active:scale-95"
          >
            LASER
          </button>

          <button
            onClick={() => onMobileFireMissile && onMobileFireMissile()}
            className="w-14 h-14 rounded-full bg-rose-600/50 border-2 border-rose-400 text-white font-bold text-xs flex items-center justify-center shadow-lg active:scale-95"
          >
            MISSILE
          </button>
        </div>
      </div>
    </div>
  );
};
