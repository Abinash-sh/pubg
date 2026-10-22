import React, { useRef } from 'react';
import { KillFeedEntry, PlayerPUBGState, WeaponSlot } from '../../types/pubg';
import { MobileJoystick } from './MobileJoystick';
import {
  Shield,
  Heart,
  Zap,
  Crosshair,
  Navigation,
  Volume2,
  VolumeX,
  Eye,
  HelpCircle,
  ShoppingCart,
  RotateCw,
  ArrowUp,
  ChevronDown,
} from 'lucide-react';

interface PubgHUDProps {
  state: PlayerPUBGState;
  killFeed: KillFeedEntry[];
  isMuted: boolean;
  onToggleMute: () => void;
  onInteract: () => void;
  onFireTouch: (firing: boolean) => void;
  onADSTouch: (aiming: boolean) => void;
  onReload: () => void;
  onJump: () => void;
  onCrouch: () => void;
  onSprintToggle: () => void;
  onSwitchSlot: (slot: WeaponSlot) => void;
  onUseMed: (type: 'firstAid' | 'medkit' | 'energyDrink') => void;
  onToggleCamera: () => void;
  onOpenControlsHelp: () => void;
  onOpenShop: () => void;
  onTouchMove: (x: number, y: number) => void;
  onTouchLook: (dx: number, dy: number) => void;
}

export const PubgHUD: React.FC<PubgHUDProps> = ({
  state,
  killFeed,
  isMuted,
  onToggleMute,
  onInteract,
  onFireTouch,
  onADSTouch,
  onReload,
  onJump,
  onCrouch,
  onSprintToggle,
  onSwitchSlot,
  onUseMed,
  onToggleCamera,
  onOpenControlsHelp,
  onOpenShop,
  onTouchMove,
  onTouchLook,
}) => {
  const activeWeapon = state.weapons[state.activeSlot];
  const touchLookLastPos = useRef<{ x: number; y: number } | null>(null);

  // Compass heading
  const headingDeg = Math.round(((-state.yaw * 180) / Math.PI) % 360 + 360) % 360;

  // Blue Zone countdown
  const zoneMinutes = Math.floor(Math.max(0, state.currentZone.timer) / 60);
  const zoneSeconds = Math.floor(Math.max(0, state.currentZone.timer) % 60);
  const zoneTimerStr = `${zoneMinutes}:${zoneSeconds.toString().padStart(2, '0')}`;

  // Mobile Right-Side Touch Aiming Swipe Pad
  const handleTouchLookStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    touchLookLastPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchLookMove = (e: React.TouchEvent) => {
    if (!touchLookLastPos.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchLookLastPos.current.x;
    const dy = touch.clientY - touchLookLastPos.current.y;
    touchLookLastPos.current = { x: touch.clientX, y: touch.clientY };
    onTouchLook(dx, dy);
  };

  const handleTouchLookEnd = () => {
    touchLookLastPos.current = null;
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-sans">
      {/* 1. Outside Blue Zone Pulsing Danger Glow */}
      {state.isTakingZoneDamage && (
        <div className="absolute inset-0 border-[14px] border-blue-500/70 shadow-[inset_0_0_90px_rgba(37,99,235,0.7)] animate-pulse pointer-events-none z-10" />
      )}

      {/* 2. Top Compass Bar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
        <div className="flex items-center gap-1.5 px-4 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg">
          <Navigation className="w-3.5 h-3.5 text-amber-400 rotate-45" />
          <span className="font-mono text-xs font-bold tracking-widest text-amber-300">
            {headingDeg}° {headingDeg > 337 || headingDeg <= 22 ? 'N' : headingDeg <= 67 ? 'NE' : headingDeg <= 112 ? 'E' : headingDeg <= 157 ? 'SE' : headingDeg <= 202 ? 'S' : headingDeg <= 247 ? 'SW' : headingDeg <= 292 ? 'W' : 'NW'}
          </span>
        </div>
      </div>

      {/* 3. Top-Right Alive Counter & Kill Feed */}
      <div className="absolute top-3 right-4 flex flex-col items-end gap-2.5 z-20 pointer-events-auto">
        {/* Alive, Kills, and Battle Points (BP) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-white shadow-xl">
          <div className="flex items-center gap-1.5 border-r border-white/20 pr-2.5">
            <span className="text-[10px] tracking-wider font-bold text-gray-400 uppercase">ALIVE</span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-amber-400">{state.aliveCount}</span>
          </div>
          <div className="flex items-center gap-1.5 border-r border-white/20 pr-2.5 pl-1">
            <span className="text-[10px] tracking-wider font-bold text-gray-400 uppercase">KILLS</span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-red-400">{state.kills}</span>
          </div>
          <div className="flex items-center gap-1 pl-1 text-amber-300 font-mono font-bold text-xs sm:text-sm">
            <span>{state.battlePoints}</span>
            <span className="text-[10px] text-amber-400/80">BP</span>
          </div>
        </div>

        {/* Real-time Killfeed stream */}
        <div className="flex flex-col gap-1 items-end max-w-xs">
          {killFeed.slice(-3).map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono backdrop-blur-sm transition-all duration-300 shadow-md ${
                entry.isPlayerKill
                  ? 'bg-red-950/85 text-red-200 border border-red-500/50'
                  : 'bg-black/60 text-gray-300 border border-white/10'
              }`}
            >
              <span className={`font-bold ${entry.isPlayerKill ? 'text-amber-300' : 'text-gray-200'}`}>
                {entry.killer}
              </span>
              <span className="text-gray-400 text-[10px]">[{entry.weapon}]</span>
              {entry.isHeadshot && (
                <span className="text-[9px] px-1 rounded bg-red-600/80 text-white font-bold tracking-tighter">
                  HS
                </span>
              )}
              <span className="text-gray-300 font-semibold">{entry.victim}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Top-Left Quick Controls (Shop, Audio, Camera, Help) */}
      <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-auto z-20">
        <button
          onClick={onOpenShop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-mono font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          title="Open Tactical Black Market Shop (B)"
        >
          <ShoppingCart className="w-4 h-4 fill-black" />
          <span>SHOP</span>
          <span className="hidden sm:inline text-[10px] opacity-80">[B]</span>
        </button>

        <button
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/15 backdrop-blur-sm transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>

        <button
          onClick={onToggleCamera}
          className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/15 backdrop-blur-sm flex items-center gap-1 text-xs font-medium"
          title="Toggle First/Third Person View (V)"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>V</span>
        </button>

        <button
          onClick={onOpenControlsHelp}
          className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/15 backdrop-blur-sm"
          title="Controls Guide"
        >
          <HelpCircle className="w-4 h-4 text-amber-300" />
        </button>
      </div>

      {/* 5. Center Reticle & ADS Sights */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {state.isAiming && (activeWeapon?.type === 'AWM' || activeWeapon?.type === 'KAR98K') ? (
          // Sniper Scope Overlay
          <div className="relative w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] rounded-full border-[90px] sm:border-[150px] border-black/95 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-black/85" />
            <div className="absolute h-full w-[1px] bg-black/85" />
            <div className="absolute w-2.5 h-[1px] bg-black/90 top-[42%]" />
            <div className="absolute w-4 h-[1px] bg-black/90 top-[46%]" />
            <div className="absolute w-2.5 h-[1px] bg-black/90 top-[54%]" />
            <div className="absolute w-4 h-[1px] bg-black/90 top-[58%]" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_6px_red]" />
          </div>
        ) : state.isAiming ? (
          // Red Dot Sight
          <div className="relative flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border border-red-500/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            </div>
          </div>
        ) : (
          // Dynamic Crosshair
          <div className="relative flex items-center justify-center">
            <div className="absolute w-2.5 h-[1.5px] bg-white/70 -translate-x-3.5 shadow-sm" />
            <div className="absolute w-2.5 h-[1.5px] bg-white/70 translate-x-3.5 shadow-sm" />
            <div className="absolute h-2.5 w-[1.5px] bg-white/70 -translate-y-3.5 shadow-sm" />
            <div className="absolute h-2.5 w-[1.5px] bg-white/70 translate-y-3.5 shadow-sm" />
            <div className="w-1 h-1 rounded-full bg-white/90" />
          </div>
        )}

        {/* Hit Marker Flash */}
        {state.hitMarker && Date.now() - state.hitMarker.time < 160 && (
          <div className="absolute">
            {state.hitMarker.type === 'headshot' ? (
              <div className="text-red-500 font-extrabold text-3xl animate-ping font-mono drop-shadow-[0_0_12px_red]">
                ✕
              </div>
            ) : (
              <div className="text-white font-extrabold text-2xl animate-pulse font-mono drop-shadow-[0_0_8px_white]">
                ✕
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Interaction Prompt (Center-Lower) */}
      {(state.nearbyLoot || state.nearbyVehicle) && !state.isInVehicle && (
        <div className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            onClick={onInteract}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/85 hover:bg-amber-600/95 text-white font-mono text-sm font-bold border border-amber-500/60 shadow-2xl backdrop-blur-md transition-all scale-105 active:scale-95"
          >
            <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-xs font-black">F</span>
            {state.nearbyVehicle ? (
              <span>Drive Buggy</span>
            ) : (
              <span>Pick up {state.nearbyLoot?.name}</span>
            )}
          </button>
        </div>
      )}

      {/* 7. Bottom Tactical HUD Dock (Weapons, Health, Boost, Ammo) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-auto w-[94%] max-w-2xl">
        {/* Blue Zone Status Banner */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-1 rounded-lg bg-black/75 border border-white/10 text-[11px] sm:text-xs font-mono">
          <span className="text-blue-400 font-bold">
            {state.currentZone.isShrinking ? 'ZONE CLOSING' : 'SAFE ZONE'}:
          </span>
          <span className="text-white font-extrabold">{zoneTimerStr}</span>
          <span className="text-gray-500">|</span>
          <span className={state.isInSafeZone ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold animate-pulse'}>
            {state.isInSafeZone ? 'SAFE' : `${state.distToSafeZone}m TO ZONE`}
          </span>
        </div>

        {/* Health & Boost Bars */}
        <div className="w-full flex flex-col gap-1 px-3.5 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 shadow-2xl">
          {/* Boost Bar (Thin amber/orange) */}
          <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-200"
              style={{ width: `${state.boost}%` }}
            />
          </div>

          {/* Health Bar (Thick) */}
          <div className="w-full flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 text-red-400 font-mono text-xs font-bold">
              <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              <span>{Math.round(state.health)}</span>
            </div>

            <div className="flex-1 h-2.5 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  state.health > 50
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : state.health > 25
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse'
                }`}
                style={{ width: `${state.health}%` }}
              />
            </div>

            {/* Helmet & Vest Durability */}
            <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
              <div className="flex items-center gap-1" title="Helmet">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] text-blue-300">L{state.helmet?.level || 0}</span>
              </div>
              <div className="flex items-center gap-1" title="Armor Vest">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-300">L{state.vest?.level || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weapons & Quick Meds Bar */}
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Quick Meds */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUseMed('firstAid')}
              disabled={state.meds.firstAid <= 0}
              className="px-2 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 text-white flex items-center gap-1 text-xs font-mono disabled:opacity-40"
              title="First Aid [7]"
            >
              <Heart className="w-3 h-3 text-emerald-400" />
              <span>{state.meds.firstAid}</span>
            </button>
            <button
              onClick={() => onUseMed('energyDrink')}
              disabled={state.meds.energyDrink <= 0}
              className="px-2 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 text-white flex items-center gap-1 text-xs font-mono disabled:opacity-40"
              title="Energy Drink [9]"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{state.meds.energyDrink}</span>
            </button>
          </div>

          {/* Weapon Slots (Primary & Secondary) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSwitchSlot('primary')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono font-bold transition-all ${
                state.activeSlot === 'primary'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md'
                  : 'bg-black/70 border-white/10 text-gray-400'
              }`}
            >
              <span>1. {state.weapons.primary ? state.weapons.primary.type : 'EMPTY'}</span>
            </button>

            <button
              onClick={() => onSwitchSlot('secondary')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono font-bold transition-all ${
                state.activeSlot === 'secondary'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md'
                  : 'bg-black/70 border-white/10 text-gray-400'
              }`}
            >
              <span>2. {state.weapons.secondary ? state.weapons.secondary.type : 'EMPTY'}</span>
            </button>
          </div>

          {/* Active Ammo Counter & Reload */}
          {activeWeapon && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-lg bg-black/80 border border-white/15 text-white font-mono shadow-md">
              <div className="flex flex-col items-end">
                <div className="text-xs sm:text-sm font-black">
                  <span className="text-amber-400">{activeWeapon.currentAmmo}</span>
                  <span className="text-gray-500 text-[10px] sm:text-xs">
                    {' '}
                    / {state.ammo[activeWeapon.stats.ammoType] || 0}
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-gray-400">{activeWeapon.stats.ammoType}</span>
              </div>
              <button
                onClick={onReload}
                disabled={state.isReloading}
                className="px-1.5 sm:px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[9px] sm:text-[10px] font-bold text-gray-300"
              >
                {state.isReloading ? `${Math.round(state.reloadProgress * 100)}%` : 'RELOAD'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 8. Dedicated Mobile Touch Controls Layout */}
      {/* Mobile Virtual Joystick on bottom left */}
      <div className="absolute bottom-24 sm:bottom-28 left-4 pointer-events-auto">
        <MobileJoystick
          onMove={onTouchMove}
          onSprintLockChange={(locked) => {
            if (locked !== state.isSprinting) onSprintToggle();
          }}
        />
      </div>

      {/* Mobile Right-Side Touch Aiming Swipe Pad */}
      <div
        onTouchStart={handleTouchLookStart}
        onTouchMove={handleTouchLookMove}
        onTouchEnd={handleTouchLookEnd}
        onTouchCancel={handleTouchLookEnd}
        className="absolute top-16 bottom-28 right-0 w-1/2 pointer-events-auto touch-none"
      />

      {/* Mobile Action Buttons (Right Thumb Area) */}
      <div className="absolute bottom-20 sm:bottom-24 right-4 flex flex-col items-end gap-2.5 pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Sprint Lock */}
          <button
            onClick={onSprintToggle}
            className={`w-11 h-11 rounded-full border flex items-center justify-center font-bold text-[10px] shadow-lg ${
              state.isSprinting
                ? 'bg-amber-500 text-black border-amber-300'
                : 'bg-black/70 text-white border-white/20'
            }`}
          >
            RUN
          </button>

          {/* Crouch */}
          <button
            onClick={onCrouch}
            className={`w-11 h-11 rounded-full border flex items-center justify-center font-bold text-[10px] shadow-lg ${
              state.isCrouching
                ? 'bg-amber-500 text-black border-amber-300'
                : 'bg-black/70 text-white border-white/20'
            }`}
          >
            CROUCH
          </button>

          {/* Jump */}
          <button
            onClick={onJump}
            className="w-11 h-11 rounded-full bg-black/70 active:bg-amber-500 border border-white/20 text-white active:text-black flex items-center justify-center font-bold text-[10px] shadow-lg"
          >
            JUMP
          </button>

          {/* Reload Mobile */}
          <button
            onClick={onReload}
            className="w-11 h-11 rounded-full bg-black/70 active:bg-cyan-600 border border-white/20 text-white flex items-center justify-center font-bold text-[10px] shadow-lg"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* ADS Aim Down Sights button */}
          <button
            onTouchStart={() => onADSTouch(true)}
            onTouchEnd={() => onADSTouch(false)}
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all ${
              state.isAiming
                ? 'bg-cyan-600 text-white border-cyan-400 scale-105'
                : 'bg-black/80 text-cyan-300 border-cyan-500/50'
            }`}
          >
            <Crosshair className="w-6 h-6" />
          </button>

          {/* Big Fire Button */}
          <button
            onTouchStart={() => onFireTouch(true)}
            onTouchEnd={() => onFireTouch(false)}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-red-700 to-red-500 active:from-red-600 active:to-red-400 border-2 border-red-300 text-white flex items-center justify-center text-sm font-black tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.6)] active:scale-95"
          >
            FIRE
          </button>
        </div>
      </div>
    </div>
  );
};
