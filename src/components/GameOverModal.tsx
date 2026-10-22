import React, { useEffect, useState } from 'react';
import { RotateCw, Trophy, Skull, Crosshair, Award } from 'lucide-react';
import { gameAudio } from '../game/gameAudio';

interface GameOverModalProps {
  score: number;
  kills: number;
  wave: number;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  kills,
  wave,
  onRestart,
  onMenu,
}) => {
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewHigh, setIsNewHigh] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('skyfire_highscore');
    const prevHigh = saved ? parseInt(saved, 10) : 0;
    if (score > prevHigh) {
      localStorage.setItem('skyfire_highscore', score.toString());
      setHighScore(score);
      setIsNewHigh(true);
    } else {
      setHighScore(prevHigh);
    }
  }, [score]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-orbitron animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900/90 border border-rose-500/50 shadow-2xl overflow-hidden p-6 text-center">
        {/* Skull Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <Skull className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-wider mb-1 hud-glow-red">
          AIRCRAFT DESTROYED
        </h2>
        <p className="text-xs text-rose-300/80 mb-6 font-sans">
          Airframe lost in combat. Mission terminated.
        </p>

        {/* High Score Banner */}
        {isNewHigh && (
          <div className="mb-4 py-1.5 px-4 rounded-xl bg-amber-500/20 border border-amber-500/60 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>NEW ALL-TIME HIGH SCORE!</span>
          </div>
        )}

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center mb-6 font-sans">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-orbitron">Final Score</div>
            <div className="text-base font-bold text-white font-mono">{score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-orbitron">Hostiles Down</div>
            <div className="text-base font-bold text-rose-400 font-mono">{kills}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-orbitron">Wave Reached</div>
            <div className="text-base font-bold text-cyan-400 font-mono">WAVE {wave}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              gameAudio.playRingPass();
              onRestart();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCw className="w-4 h-4" />
            <span>RE-ENGAGE / FLY AGAIN</span>
          </button>

          <button
            onClick={onMenu}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold tracking-wider transition-colors"
          >
            RETURN TO HANGAR
          </button>
        </div>
      </div>
    </div>
  );
};
