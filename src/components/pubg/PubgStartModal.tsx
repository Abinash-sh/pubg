import React, { useState } from 'react';
import { PUBGWeather, WeaponType } from '../../types/pubg';
import { Shield, Crosshair, CloudSun, MapPin, Play } from 'lucide-react';

interface PubgStartModalProps {
  isOpen: boolean;
  onDeploy: (location: 'pochinki' | 'military' | 'warehouse' | 'ruins', weather: PUBGWeather, startingGun: WeaponType) => void;
}

export const PubgStartModal: React.FC<PubgStartModalProps> = ({ isOpen, onDeploy }) => {
  const [selectedLocation, setSelectedLocation] = useState<'pochinki' | 'military' | 'warehouse' | 'ruins'>('pochinki');
  const [selectedWeather, setSelectedWeather] = useState<PUBGWeather>('clear_day');
  const [selectedGun, setSelectedGun] = useState<WeaponType>('M416');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-amber-500/30 p-8 shadow-[0_0_100px_rgba(245,158,11,0.15)] text-white">
        {/* Banner Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold mb-3 tracking-widest uppercase">
            <Shield className="w-3.5 h-3.5" /> BATTLE ROYALE SIMULATOR
          </div>
          <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 font-mono">
            AEROSTRIKE: BATTLEGROUNDS
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-1">
            25 Players. 1 Island. Shrinking Blue Zone. Fight for the Chicken Dinner.
          </p>
        </div>

        {/* 1. Select Drop Zone */}
        <div className="mb-5">
          <label className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1.5 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" /> DROP ZONE (SECTOR)
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {[
              { id: 'pochinki', name: 'Pochinki Town', desc: 'Hot Drop / Dense Compounds' },
              { id: 'military', name: 'Military Base', desc: 'High Tier Loot / Radar Dome' },
              { id: 'warehouse', name: 'Industrial Warehouses', desc: 'CQB / Shipping Yard' },
              { id: 'ruins', name: 'Ruins & Pillbox', desc: 'Cover / Ambush Nest' },
            ].map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedLocation === loc.id
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-white">{loc.name}</div>
                <div className="text-[10px] text-gray-400">{loc.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Select Starting Gun */}
        <div className="mb-5">
          <label className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1.5 mb-2.5">
            <Crosshair className="w-3.5 h-3.5 text-amber-400" /> STARTING ARSENAL
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono">
            {[
              { id: 'M416', label: 'M416', note: '5.56mm AR' },
              { id: 'AKM', label: 'AKM', note: '7.62mm AR' },
              { id: 'SCAR_L', label: 'SCAR-L', note: 'Special Forces' },
              { id: 'M249', label: 'M249', note: '100-rd LMG' },
              { id: 'VECTOR', label: 'Vector', note: '1200 RPM SMG' },
              { id: 'AWM', label: 'AWM', note: '8x Sniper' },
            ].map((gun) => (
              <button
                key={gun.id}
                onClick={() => setSelectedGun(gun.id as any)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedGun === gun.id
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-white">{gun.label}</div>
                <div className="text-[10px] text-amber-300/80">{gun.note}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Weather Atmosphere */}
        <div className="mb-6">
          <label className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1.5 mb-2.5">
            <CloudSun className="w-3.5 h-3.5 text-amber-400" /> ATMOSPHERE
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            {[
              { id: 'clear_day', label: 'Clear Daylight' },
              { id: 'sunset', label: 'Golden Sunset' },
              { id: 'dense_fog', label: 'Dense Island Fog' },
            ].map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWeather(w.id as any)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedWeather === w.id
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-white">{w.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Deploy Button */}
        <button
          onClick={() => onDeploy(selectedLocation, selectedWeather, selectedGun)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-black text-lg tracking-wider uppercase shadow-[0_0_40px_rgba(245,158,11,0.6)] transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <Play className="w-5 h-5 fill-black" />
          <span>PARACHUTE DROP INTO COMBAT</span>
        </button>
      </div>
    </div>
  );
};
