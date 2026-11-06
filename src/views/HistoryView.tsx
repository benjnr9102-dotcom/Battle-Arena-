import React, { useState } from 'react';
import { History, Swords, Zap, Trophy, Frown, Equal, ArrowUpRight, Percent, Calendar } from 'lucide-react';
import { MatchRecord, GameType } from '../types';

interface HistoryViewProps {
  matchHistory: MatchRecord[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ matchHistory }) => {
  const [filter, setFilter] = useState<'all' | 'chess' | 'taprace'>('all');

  const filteredHistory = matchHistory.filter((m) => {
    if (filter === 'chess') return m.gameType === 'chess';
    if (filter === 'taprace') return m.gameType === 'taprace';
    return true;
  });

  const totalWon = matchHistory
    .filter((m) => m.result === 'victory')
    .reduce((sum, m) => sum + m.payout, 0);

  const totalFees = matchHistory.reduce((sum, m) => sum + m.platformFee, 0);

  return (
    <div className="w-full max-w-md mx-auto p-3.5 space-y-3.5 pb-24">
      {/* Title */}
      <div>
        <h2 className="font-display font-black text-xl text-white tracking-wider">
          HISTORIQUE DES COMBATS
        </h2>
        <p className="text-xs text-slate-400">
          Journal officiel des duels et relevé des commissions
        </p>
      </div>

      {/* Aggregate Financial Highlights */}
      <div className="grid grid-cols-3 gap-2 bg-[#131b2e] border border-slate-700/80 rounded-2xl p-3 text-center">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-medium">Duels joués</span>
          <span className="font-display font-bold text-base text-white">
            {matchHistory.length}
          </span>
        </div>
        <div className="border-x border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block font-medium">Jetons Gagnés</span>
          <span className="font-display font-bold text-base text-emerald-400">
            +{totalWon.toLocaleString('fr-FR')} ₿
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-medium">Commissions 15%</span>
          <span className="font-display font-bold text-base text-amber-400">
            {totalFees.toLocaleString('fr-FR')} ₿
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#131b2e] rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tous ({matchHistory.length})
        </button>
        <button
          onClick={() => setFilter('chess')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            filter === 'chess'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Échecs
        </button>
        <button
          onClick={() => setFilter('taprace')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            filter === 'taprace'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tap Race
        </button>
      </div>

      {/* Match Records List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 bg-[#131b2e]/50 rounded-2xl border border-slate-800 p-6">
            <History className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">
              Aucun match enregistré dans cette catégorie.
            </p>
          </div>
        ) : (
          filteredHistory.map((match) => {
            const isVictory = match.result === 'victory';
            const isDefeat = match.result === 'defeat';
            const isDraw = match.result === 'draw';
            const isChess = match.gameType === 'chess';
            const formattedDate = new Date(match.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={match.id}
                className="bg-gradient-to-br from-[#131b2e] to-[#0c1424] border border-slate-700/80 rounded-2xl p-3.5 shadow-md space-y-2.5"
              >
                {/* Header: Date, Game Type, Outcome */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px]">{formattedDate}</span>
                    <span>·</span>
                    <span className="font-display font-semibold text-cyan-300 uppercase">
                      {isChess ? 'Échecs' : 'Tap Race'}
                    </span>
                  </div>

                  {/* Outcome Tag */}
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isVictory
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : isDefeat
                        ? 'bg-red-950/80 text-red-300 border border-red-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isVictory ? (
                      <>
                        <Trophy className="w-3 h-3 text-emerald-400" />
                        VICTOIRE
                      </>
                    ) : isDefeat ? (
                      <>
                        <Frown className="w-3 h-3 text-red-400" />
                        DÉFAITE
                      </>
                    ) : (
                      <>
                        <Equal className="w-3 h-3 text-slate-400" />
                        NUL
                      </>
                    )}
                  </span>
                </div>

                {/* Opponent & Scores */}
                <div className="flex items-center justify-between bg-[#090d16]/70 border border-slate-800/80 rounded-xl p-2.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={match.opponentAvatar}
                      alt={match.opponentName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">
                        {match.opponentName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {match.playerScore && match.opponentScore
                          ? `${match.playerScore} vs ${match.opponentScore}`
                          : 'Score homologué'}
                      </p>
                    </div>
                  </div>

                  {/* Token Outcome */}
                  <div className="text-right">
                    <div
                      className={`font-display font-bold text-sm ${
                        isVictory
                          ? 'text-emerald-400'
                          : isDraw
                          ? 'text-cyan-300'
                          : 'text-red-400'
                      }`}
                    >
                      {isVictory
                        ? `+${match.payout.toLocaleString()} ₿`
                        : isDraw
                        ? `${match.stake} ₿ (remboursé)`
                        : `-${match.stake} ₿`}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Mise: {match.stake} ₿
                    </span>
                  </div>
                </div>

                {/* Financial breakdown row: Platform fee */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 px-1">
                  <span>Cagnotte match : {match.totalPot.toLocaleString()} jetons</span>
                  <span className="text-amber-400/90 font-medium">
                    Commission 15% : -{match.platformFee.toLocaleString()} jetons
                  </span>
                </div>

                {match.notes && (
                  <p className="text-[10px] text-slate-400 italic bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/50">
                    {match.notes}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
