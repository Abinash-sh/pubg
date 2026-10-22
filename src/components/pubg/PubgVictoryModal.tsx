import React from 'react';
import { Trophy, Skull, Crosshair, Zap, RotateCcw } from 'lucide-react';

interface PubgVictoryModalProps {
  isOpen: boolean;
  isVictory: boolean;
  stats: {
    kills: number;
    headshots: number;
    damage: number;
    rank: number;
    totalPlayers: number;
  };
  onPlayAgain: () => void;
}

export const PubgVictoryModal: React.FC<PubgVictoryModalProps> = ({
  isOpen,
  isVictory,
  stats,
  onPlayAgain,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-white/20 p-8 shadow-[0_0_80px_rgba(0,0,0,0.9)] text-center text-white">
        {/* Glow halo */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isVictory ? 'bg-amber-500/30' : 'bg-red-500/20'
          }`}
        />

        {/* Header Title */}
        {isVictory ? (
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-bounce">
              <Trophy className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-black tracking-wider text-amber-300 font-mono drop-shadow-[0_2px_12px_rgba(245,158,11,0.6)]">
              WINNER WINNER CHICKEN DINNER!
            </h1>
            <p className="text-xs font-mono text-amber-200/80 tracking-widest uppercase">
              LAST SURVIVOR STANDING
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="p-4 rounded-2xl bg-red-500/20 border-2 border-red-500/40 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
              <Skull className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-gray-200 font-mono uppercase">
              BETTER LUCK NEXT TIME!
            </h1>
            <p className="text-xs font-mono text-gray-400 tracking-widest uppercase">
              YOU WERE ELIMINATED
            </p>
          </div>
        )}

        {/* Rank Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/15 font-mono text-sm font-extrabold mb-6">
          <span className="text-gray-400">RANK:</span>
          <span className={isVictory ? 'text-amber-400 text-lg' : 'text-white text-lg'}>
            #{stats.rank} / {stats.totalPlayers}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
            <div className="flex items-center gap-1 text-red-400 text-xs font-mono mb-1">
              <Crosshair className="w-3.5 h-3.5" />
              <span>KILLS</span>
            </div>
            <span className="text-2xl font-black font-mono text-white">{stats.kills}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-400 text-xs font-mono mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>DAMAGE</span>
            </div>
            <span className="text-2xl font-black font-mono text-white">{stats.damage}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
            <div className="flex items-center gap-1 text-cyan-400 text-xs font-mono mb-1">
              <Skull className="w-3.5 h-3.5" />
              <span>HEADSHOTS</span>
            </div>
            <span className="text-2xl font-black font-mono text-white">{stats.headshots}</span>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onPlayAgain}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-black text-base tracking-wider uppercase shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
