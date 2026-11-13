import React, { useState } from 'react';
import { X, Swords, Zap, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { Opponent, GameType } from '../types';

interface ChallengeModalProps {
  isOpen: boolean;
  opponent: Opponent | null;
  initialGameType: GameType;
  userTokens: number;
  onCancel: () => void;
  onConfirm: (opponent: Opponent, gameType: GameType, stake: number) => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  opponent,
  initialGameType,
  userTokens,
  onCancel,
  onConfirm,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType>(initialGameType);
  const [stake, setStake] = useState<number>(opponent?.defaultStake || 1000);

  if (!isOpen || !opponent) return null;

  const totalPot = stake * 2;
  const platformFee = Math.round(totalPot * 0.15);
  const netWinning = totalPot - platformFee;
  const netProfit = netWinning - stake; // e.g. 1700 - 1000 = +700
  const hasEnoughTokens = userTokens >= stake;

  const stakeOptions = [200, 500, 1000, 2000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0d1322] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <div className="inline-block px-2.5 py-0.5 bg-cyan-950/70 border border-cyan-800/60 rounded-md text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1.5">
            Confirmation du défi
          </div>
          <h3 className="font-display font-bold text-xl text-white">
            DÉFIER L'ADVERSAIRE
          </h3>
        </div>

        {/* Opponent Card */}
        <div className="bg-[#131b2e] border border-slate-700/60 rounded-xl p-3.5 mb-4 flex items-center gap-3">
          <div className="relative">
            <img
              src={opponent.avatar}
              alt={opponent.name}
              className="w-13 h-13 rounded-full object-cover ring-2 ring-cyan-400/60"
            />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500 text-black font-display">
              Niv.{opponent.level}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-base text-white truncate">
                {opponent.name}
              </h4>
              <span className="text-[11px] font-semibold text-emerald-400">
                {opponent.winRate}% victoires
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {opponent.region} · {opponent.chessElo} ELO
            </p>
            <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
              "{opponent.bio}"
            </p>
          </div>
        </div>

        {/* Game Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Discipline E-Sport
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedGame('chess')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                selectedGame === 'chess'
                  ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'bg-[#131b2e]/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${selectedGame === 'chess' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-display">ÉCHECS</div>
                <div className="text-[10px] text-slate-400">Match officiel</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('taprace')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                selectedGame === 'taprace'
                  ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'bg-[#131b2e]/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${selectedGame === 'taprace' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-display">TAP RACE</div>
                <div className="text-[10px] text-slate-400">15 secondes</div>
              </div>
            </button>
          </div>
        </div>

        {/* Stake Selector */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Montant de la mise
            </label>
            <span className="text-xs text-slate-400">
              Solde : <strong className="text-white">{userTokens.toLocaleString('fr-FR')}</strong> jetons
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {stakeOptions.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setStake(amount)}
                className={`py-2 text-xs font-bold font-display rounded-lg border transition ${
                  stake === amount
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-cyan-300 text-white shadow-md'
                    : 'bg-[#131b2e] border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Financial Breakdown Table */}
          <div className="bg-[#131b2e]/80 border border-slate-700/60 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Mise par joueur :</span>
              <span className="font-semibold text-white">{stake.toLocaleString()} jetons</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Cagnotte totale du duel :</span>
              <span className="font-semibold text-white">{totalPot.toLocaleString()} jetons</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Commission plateforme (15%) :</span>
              <span className="text-amber-400/90 font-medium">-{platformFee.toLocaleString()} jetons</span>
            </div>
            <div className="pt-1.5 border-t border-slate-700/60 flex justify-between items-center text-sm">
              <span className="font-bold text-white">Gain net vainqueur :</span>
              <span className="font-display font-bold text-cyan-400 text-base">
                +{netWinning.toLocaleString()} jetons
              </span>
            </div>
          </div>
        </div>

        {/* Security Rule Note */}
        <div className="bg-slate-900/60 rounded-lg p-2.5 mb-5 flex items-start gap-2 border border-slate-800 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Règle de jeu : aucun jeton n'est prélevé avant votre confirmation.
          </span>
        </div>

        {/* Balance Warning */}
        {!hasEnoughTokens && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>Solde insuffisant pour cette mise. Diminuez le montant ou rechargez votre solde.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            ANNULER
          </button>
          <button
            type="button"
            disabled={!hasEnoughTokens}
            onClick={() => onConfirm(opponent, selectedGame, stake)}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-98"
          >
            CONFIRMER LE DÉFI
          </button>
        </div>
      </div>
    </div>
  );
};
