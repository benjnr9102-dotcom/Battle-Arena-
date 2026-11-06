import React, { useState } from 'react';
import { Search, Filter, Swords, Zap, CheckCircle2, Clock, Swords as SwordsIcon } from 'lucide-react';
import { Opponent, GameType } from '../types';

interface LobbyViewProps {
  opponents: Opponent[];
  onOpenChallenge: (opponent: Opponent, gameType: GameType) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ opponents, onOpenChallenge }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'online'>('all');

  // Filter opponents
  const filteredOpponents = opponents.filter((opp) => {
    const matchesSearch =
      opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'ready'
        ? opp.status === 'ready'
        : opp.status === 'online';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-md mx-auto p-3.5 space-y-3.5 pb-24">
      {/* Lobby Header */}
      <div>
        <h2 className="font-display font-black text-xl text-white tracking-wider">
          LOBBY DES ADVERSAIRES
        </h2>
        <p className="text-xs text-slate-400">
          Recherchez et défiez un compétiteur en temps réel
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par pseudo (ex: Koffi_229, Marie_BJ)..."
          className="w-full bg-[#131b2e] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-1.5 p-1 bg-[#131b2e] rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            statusFilter === 'all'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tous ({opponents.length})
        </button>
        <button
          onClick={() => setStatusFilter('ready')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            statusFilter === 'ready'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Prêts au combat
        </button>
        <button
          onClick={() => setStatusFilter('online')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            statusFilter === 'online'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          En ligne
        </button>
      </div>

      {/* Opponents List */}
      <div className="space-y-3">
        {filteredOpponents.length === 0 ? (
          <div className="text-center py-10 bg-[#131b2e]/50 rounded-2xl border border-slate-800 p-6">
            <p className="text-sm font-semibold text-white mb-1">Aucun adversaire trouvé</p>
            <p className="text-xs text-slate-400 mb-3">
              Modifiez votre recherche ou effacez les filtres.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs font-semibold rounded-lg"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          filteredOpponents.map((opp) => {
            const isReady = opp.status === 'ready';
            const isOnline = opp.status === 'online';
            const isInMatch = opp.status === 'in_match';

            return (
              <div
                key={opp.id}
                className="bg-gradient-to-br from-[#131b2e] to-[#0c1424] border border-slate-700/80 hover:border-cyan-500/40 rounded-2xl p-3.5 shadow-md transition"
              >
                {/* Header Profile Row */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={opp.avatar}
                        alt={opp.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700"
                      />
                      <span
                        className={`w-3 h-3 rounded-full absolute -bottom-1 -right-1 ring-2 ring-[#131b2e] ${
                          isReady ? 'bg-emerald-400' : isOnline ? 'bg-cyan-400' : 'bg-amber-400'
                        }`}
                        title={isReady ? 'Prêt' : isOnline ? 'En ligne' : 'En match'}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-base text-white">
                          {opp.name}
                        </h4>
                        <span className="text-[10px] font-bold font-display px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          Niv.{opp.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {opp.region}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isReady
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                        : isOnline
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                    }`}
                  >
                    {isReady ? 'Prêt' : isOnline ? 'En ligne' : 'En match'}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 bg-[#090d16]/70 border border-slate-800/80 rounded-xl p-2.5 mb-3 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Victoires</span>
                    <span className="font-display font-bold text-xs text-emerald-400">
                      {opp.winRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">ELO Échecs</span>
                    <span className="font-display font-bold text-xs text-cyan-300 font-mono">
                      {opp.chessElo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Mise suggérée</span>
                    <span className="font-display font-bold text-xs text-amber-300">
                      {opp.defaultStake} ₿
                    </span>
                  </div>
                </div>

                {/* Bio text */}
                <p className="text-xs text-slate-300 italic mb-3">
                  "{opp.bio}"
                </p>

                {/* Dual Challenge Buttons: Échecs vs Tap Race */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onOpenChallenge(opp, 'chess')}
                    className="py-2 px-3 rounded-xl text-xs font-display font-bold text-white bg-slate-800 hover:bg-cyan-600 border border-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Swords className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Défier Échecs</span>
                  </button>

                  <button
                    onClick={() => onOpenChallenge(opp, 'taprace')}
                    className="py-2 px-3 rounded-xl text-xs font-display font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-900/30 flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 text-white" />
                    <span>Défier Tap Race</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
