import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Frown, Equal, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';
import { MatchRecord } from '../types';

interface MatchResultModalProps {
  isOpen: boolean;
  matchRecord: MatchRecord | null;
  onRematch: () => void;
  onViewHistory: () => void;
  onClose: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  isOpen,
  matchRecord,
  onRematch,
  onViewHistory,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen && matchRecord?.result === 'victory') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00E5FF', '#0066FF', '#FFD700', '#FFFFFF'],
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }
    }
  }, [isOpen, matchRecord]);

  if (!isOpen || !matchRecord) return null;

  const isVictory = matchRecord.result === 'victory';
  const isDefeat = matchRecord.result === 'defeat';
  const isDraw = matchRecord.result === 'draw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0d1322] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl relative text-center max-h-[95vh] overflow-y-auto">
        {/* Result Icon */}
        <div className="mx-auto mb-3 flex items-center justify-center">
          {isVictory ? (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30 ring-4 ring-amber-400/20 animate-bounce">
              <Trophy className="w-9 h-9 text-black" />
            </div>
          ) : isDefeat ? (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/30 ring-4 ring-red-500/20">
              <Frown className="w-9 h-9 text-white" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-500/30 ring-4 ring-slate-500/20">
              <Equal className="w-9 h-9 text-white" />
            </div>
          )}
        </div>

        {/* Heading */}
        <h3 className="font-display font-black text-2xl uppercase tracking-wider mb-1">
          {isVictory ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
              VICTOIRE ÉCLATANTE !
            </span>
          ) : isDefeat ? (
            <span className="text-red-400">DÉFAITE</span>
          ) : (
            <span className="text-slate-300">MATCH NUL</span>
          )}
        </h3>

        <p className="text-xs text-slate-300 mb-4">
          Duel contre <strong>{matchRecord.opponentName}</strong> (
          {matchRecord.gameType === 'chess' ? 'Échecs' : 'Tap Race'})
        </p>

        {/* Scores summary */}
        {(matchRecord.playerScore || matchRecord.opponentScore) && (
          <div className="bg-[#131b2e] rounded-xl p-3 border border-slate-800 mb-4 flex items-center justify-around">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Votre score</span>
              <div className="text-base font-bold font-display text-cyan-400">
                {matchRecord.playerScore || '-'}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Adversaire</span>
              <div className="text-base font-bold font-display text-slate-300">
                {matchRecord.opponentScore || '-'}
              </div>
            </div>
          </div>
        )}

        {/* Token Accounting Breakdown */}
        <div className="bg-[#131b2e] border border-slate-700/60 rounded-xl p-3.5 mb-4 text-xs space-y-1.5 text-left">
          <div className="flex justify-between text-slate-300">
            <span>Mise engagée :</span>
            <span className="font-medium text-white">{matchRecord.stake.toLocaleString()} jetons</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Cagnotte totale du match :</span>
            <span className="font-medium text-white">{matchRecord.totalPot.toLocaleString()} jetons</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Commission plateforme (15%) :</span>
            <span className="text-amber-400 font-medium">-{matchRecord.platformFee.toLocaleString()} jetons</span>
          </div>

          <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-sm">
            <span className="font-bold text-white">Crédité au solde :</span>
            <span
              className={`font-display font-bold text-base ${
                isVictory ? 'text-emerald-400' : isDraw ? 'text-cyan-300' : 'text-slate-400'
              }`}
            >
              {isVictory
                ? `+${matchRecord.payout.toLocaleString()} jetons`
                : isDraw
                ? `${matchRecord.stake.toLocaleString()} jetons (remboursé)`
                : `0 jeton`}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-slate-400 italic mb-5">
          * Les jetons et commissions sont virtuels et servent au classement compétitif.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onRematch}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revanche / Nouveau Défi</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onViewHistory}
              className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              Historique
            </button>
            <button
              onClick={onClose}
              className="py-2 px-3 rounded-xl text-xs font-semibold text-cyan-400 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800/60 transition"
            >
              Retour Arène
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
