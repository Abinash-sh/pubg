import React, { useState, useEffect } from 'react';
import { AircraftStats, AircraftType } from '../types/game';
import { AIRCRAFT_ROSTER } from '../game/aircraftModels';
import {
  Shield,
  Zap,
  Wind,
  Trophy,
  Check,
  Lock,
  Coins,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import { gameAudio } from '../game/gameAudio';

interface HangarShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  selectedAircraft: AircraftType;
  onSelectAircraft: (type: AircraftType) => void;
  onDeductCredits: (amount: number) => void;
}

export const HangarShopModal: React.FC<HangarShopModalProps> = ({
  isOpen,
  onClose,
  credits,
  selectedAircraft,
  onSelectAircraft,
  onDeductCredits,
}) => {
  const [unlockedList, setUnlockedList] = useState<AircraftType[]>(() => {
    const saved = localStorage.getItem('skyfire_unlocked_planes');
    return saved ? JSON.parse(saved) : ['vortex_ghost'];
  });

  const [previewPlane, setPreviewPlane] = useState<AircraftType>(selectedAircraft);

  useEffect(() => {
    localStorage.setItem('skyfire_unlocked_planes', JSON.stringify(unlockedList));
  }, [unlockedList]);

  if (!isOpen) return null;

  const currentStats = AIRCRAFT_ROSTER.find((p) => p.id === previewPlane)!;
  const isUnlocked = unlockedList.includes(previewPlane);
  const isEquipped = selectedAircraft === previewPlane;
  const canAfford = credits >= currentStats.price;

  const handleBuy = () => {
    if (!canAfford || isUnlocked) return;
    onDeductCredits(currentStats.price);
    const updated = [...unlockedList, previewPlane];
    setUnlockedList(updated);
    onSelectAircraft(previewPlane);
    gameAudio.playRingPass();
  };

  const handleEquip = () => {
    if (!isUnlocked) return;
    onSelectAircraft(previewPlane);
    gameAudio.playRingPass();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-orbitron animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wider">AIRCRAFT HANGAR & REQUISITION</h2>
              <p className="text-xs text-slate-400 font-sans">
                Earn combat credits to requisition military aerospace prototypes
              </p>
            </div>
          </div>

          {/* Credits Balance Pill */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold font-mono tracking-widest">${credits.toLocaleString()} CR</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left aircraft list, Right detail sheet */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Aircraft Tier List (5 cols) */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-xs font-semibold text-slate-400 tracking-wider mb-2">AVAILABLE AIRFRAMES:</div>
            {AIRCRAFT_ROSTER.map((plane) => {
              const unlocked = unlockedList.includes(plane.id);
              const isSelected = previewPlane === plane.id;

              return (
                <button
                  key={plane.id}
                  onClick={() => setPreviewPlane(plane.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: plane.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{plane.name}</span>
                        <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-cyan-400">
                          T{plane.tier}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans">{plane.role}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {unlocked ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 font-mono">
                        <Check className="w-3 h-3" /> OWNED
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        ${plane.price.toLocaleString()} CR
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Aircraft Spec Sheet (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
                  TIER {currentStats.tier} • {currentStats.codename}
                </span>
                {isEquipped && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    CURRENTLY DEPLOYED
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{currentStats.name}</h3>
              <p className="text-xs text-cyan-300 font-medium mb-3">{currentStats.role}</p>
              <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">{currentStats.description}</p>

              {/* Special Ability Pill */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/50 mb-5">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-0.5">
                  SIGNATURE AVIONICS ABILITY:
                </div>
                <div className="text-xs font-bold text-white font-sans">{currentStats.specialAbility}</div>
              </div>

              {/* Performance Bars */}
              <div className="space-y-3 font-sans text-xs mb-6">
                {/* Speed */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1 font-orbitron">
                    <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-cyan-400" /> TOP SPEED</span>
                    <span className="font-mono text-cyan-300 font-bold">{currentStats.topSpeed} KTS</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(currentStats.topSpeed / 1400) * 100}%` }} />
                  </div>
                </div>

                {/* Agility */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1 font-orbitron">
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> MANEUVER AGILITY</span>
                    <span className="font-mono text-purple-300 font-bold">{Math.round(currentStats.agility * 60)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(currentStats.agility / 1.7) * 100}%` }} />
                  </div>
                </div>

                {/* Armor & Shields */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1 font-orbitron">
                    <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> COMBAT DURABILITY</span>
                    <span className="font-mono text-emerald-300 font-bold">{currentStats.armor + currentStats.shields} HP</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${((currentStats.armor + currentStats.shields) / 400) * 100}%` }} />
                  </div>
                </div>

                {/* Firepower */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1 font-orbitron">
                    <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> CANNON FIREPOWER</span>
                    <span className="font-mono text-amber-300 font-bold">{currentStats.laserDamage} DMG</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(currentStats.laserDamage / 60) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div>
              {isUnlocked ? (
                <button
                  onClick={handleEquip}
                  disabled={isEquipped}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isEquipped
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/50 active:scale-98'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isEquipped ? 'DEPLOYED AS ACTIVE AIRCRAFT' : 'DEPLOY THIS AIRFRAME'}</span>
                </button>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={!canAfford}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-950/50 active:scale-98'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {canAfford
                      ? `REQUISITION AIRFRAME ($${currentStats.price.toLocaleString()} CR)`
                      : `INSUFFICIENT CREDITS (NEED $${(currentStats.price - credits).toLocaleString()} CR)`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
