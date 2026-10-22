import React from 'react';
import { X, Crosshair, Move, Shield, Zap, Keyboard } from 'lucide-react';

interface PubgControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PubgControlsModal: React.FC<PubgControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-white/20 p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wide text-white font-mono uppercase">
              BATTLEGROUNDS CONTROLS
            </h2>
            <p className="text-xs text-gray-400 font-sans">
              Master the tactical combat controls to secure the Chicken Dinner
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5" /> MOVEMENT
            </span>
            <div className="text-gray-300 space-y-1">
              <div><strong className="text-white">W / A / S / D</strong> : Move / Strafe</div>
              <div><strong className="text-white">SHIFT</strong> : Sprint</div>
              <div><strong className="text-white">SPACE</strong> : Jump</div>
              <div><strong className="text-white">C / CTRL</strong> : Crouch (Better Recoil)</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" /> COMBAT & WEAPONS
            </span>
            <div className="text-gray-300 space-y-1">
              <div><strong className="text-white">LEFT CLICK</strong> : Fire Weapon</div>
              <div><strong className="text-white">RIGHT CLICK</strong> : Aim Down Sights (ADS)</div>
              <div><strong className="text-white">R</strong> : Reload Magazine</div>
              <div><strong className="text-white">1 / 2</strong> : Primary / Secondary Gun</div>
              <div><strong className="text-white">G</strong> : Throw Frag Grenade</div>
              <div><strong className="text-white">B</strong> : Toggle Auto / Single Mode</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> INTERACTION & MEDS
            </span>
            <div className="text-gray-300 space-y-1">
              <div><strong className="text-white">F</strong> : Pick Up Loot / Drive Buggy</div>
              <div><strong className="text-white">7</strong> : First Aid Kit (75 HP)</div>
              <div><strong className="text-white">8</strong> : Full Medkit (100 HP)</div>
              <div><strong className="text-white">9</strong> : Energy Drink (Boost Bar)</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
            <span className="text-purple-400 font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> SURVIVAL TIPS
            </span>
            <div className="text-gray-300 space-y-1">
              <div><strong className="text-white">V</strong> : Switch 1st/3rd Person</div>
              <div><strong className="text-white">Blue Zone</strong> : Stay inside white circle!</div>
              <div><strong className="text-white">Airdrops</strong> : Smoke beacon has AWM</div>
              <div><strong className="text-white">Headshots</strong> : 2.5x critical damage</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-black text-sm tracking-wider uppercase shadow-xl transition-all"
        >
          READY FOR COMBAT
        </button>
      </div>
    </div>
  );
};
