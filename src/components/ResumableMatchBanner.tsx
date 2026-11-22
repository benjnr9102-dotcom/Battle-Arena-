import React from 'react';
import { Swords, Play, Flag } from 'lucide-react';

interface ResumableMatchBannerProps {
  opponentPseudo: string;
  onResume: () => void;
  onResign: () => void;
}

export const ResumableMatchBanner: React.FC<ResumableMatchBannerProps> = ({
  opponentPseudo,
  onResume,
  onResign,
}) => {
  return (
    <div className="bg-gradient-to-r from-cyan-950/90 via-[#101c34] to-blue-950/90 border border-cyan-500/50 rounded-2xl p-3.5 shadow-lg space-y-2.5">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
          <Swords className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-sm text-white truncate">
            Partie en cours contre {opponentPseudo}
          </p>
          <p className="text-[11px] text-cyan-200/80">
            Tu peux reprendre là où tu t'es arrêté.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onResume}
          className="py-2 px-3 rounded-xl text-xs font-display font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Reprendre</span>
        </button>

        <button
          type="button"
          onClick={onResign}
          className="py-2 px-3 rounded-xl text-xs font-display font-bold text-red-200 bg-red-950/60 hover:bg-red-900/70 border border-red-700/60 flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <Flag className="w-3.5 h-3.5 text-red-400" />
          <span>Abandonner</span>
        </button>
      </div>
    </div>
  );
};
