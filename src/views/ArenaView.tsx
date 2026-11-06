import React from 'react';
import { Swords, Zap, Users, Shield, ArrowRight, Flame, Sparkles, Award } from 'lucide-react';
import { Opponent, GameType, UserProfile } from '../types';

interface ArenaViewProps {
  userProfile: UserProfile;
  opponents: Opponent[];
  onOpenChallenge: (opponent: Opponent, gameType: GameType) => void;
  onGoToLobby: () => void;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  userProfile,
  opponents,
  onOpenChallenge,
  onGoToLobby,
}) => {
  // Featured opponents for quick matchmaking
  const topOpponent = opponents.find((o) => o.name === 'Boss_Cotonou') || opponents[0];
  const quickOpponents = opponents.slice(0, 3);

  return (
    <div className="w-full max-w-md mx-auto p-3.5 space-y-4 pb-24">
      {/* Hero Banner: E-Sport Battle Arena */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101b33] via-[#0c1322] to-[#090d16] border border-cyan-500/30 p-4 shadow-xl">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-600/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
              SAISON COMPÉTITIVE 2026
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              En direct
            </span>
          </div>

          <h2 className="font-display font-black text-2xl text-white tracking-wider leading-tight mb-1">
            ARÈNE OFFICIELLE
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Défiez des joueurs d'élite aux échecs ou en tap race. Mises virtuelles, arbitrage et 15% de commission plateforme.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Joueurs en ligne</span>
                <span className="font-display font-bold text-white">1 428 (démo)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-800/50 flex items-center justify-center text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Votre Solde</span>
                <span className="font-display font-bold text-amber-300">
                  {userProfile.tokens.toLocaleString('fr-FR')} jetons
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Games Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-cyan-400" />
            Disciplines de combat
          </h3>
          <span className="text-[11px] text-slate-400">2 jeux officiels</span>
        </div>

        <div className="space-y-3">
          {/* GAME 1: ÉCHECS */}
          <div className="rounded-2xl bg-gradient-to-br from-[#121b30] to-[#0c1424] border border-slate-700/80 hover:border-cyan-500/50 transition-all p-4 shadow-lg group">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-300/30">
                  <Swords className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-lg text-white">
                      ÉCHECS
                    </h4>
                    <span className="text-[10px] font-semibold text-cyan-300 px-1.5 py-0.2 bg-cyan-950/70 border border-cyan-800 rounded">
                      RÈGLES FIDE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Plateau officiel · Déplacements légaux · Échec et mat
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Affrontez un adversaire sur un véritable échiquier tactile. Chronomètre 5 min par joueur, analyse des menaces et arbitrage officiel.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400">
                Adversaires dispo : <strong className="text-white">Koffi_229, Marie_BJ...</strong>
              </div>
              <button
                onClick={() => onOpenChallenge(topOpponent, 'chess')}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-display font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition active:scale-95"
              >
                <span>DÉFIER</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* GAME 2: TAP RACE */}
          <div className="rounded-2xl bg-gradient-to-br from-[#121b30] to-[#0c1424] border border-slate-700/80 hover:border-cyan-500/50 transition-all p-4 shadow-lg group">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/30">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-lg text-white">
                      TAP RACE
                    </h4>
                    <span className="text-[10px] font-semibold text-amber-300 px-1.5 py-0.2 bg-amber-950/70 border border-amber-800 rounded">
                      15 SECONDES
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Vitesse pure · Zéro aléatoire · Détection anti-cheat
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Deux joueurs s'affrontent sur un bouton tactile ultra-réactif. Le joueur avec le plus de tapotements en 15 secondes remporte la mise.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400">
                Alerte de cadence : <strong className="text-amber-400">&gt;20 taps/s signalés</strong>
              </div>
              <button
                onClick={() => onOpenChallenge(quickOpponents[0], 'taprace')}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-display font-bold text-white bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 shadow-md shadow-amber-500/20 transition active:scale-95"
              >
                <span>DÉFIER</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Match Opponents Carousel */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
            Adversaires en attente
          </h3>
          <button
            onClick={onGoToLobby}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5"
          >
            Voir tout le Lobby
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quickOpponents.map((opp) => (
            <div
              key={opp.id}
              className="bg-[#131b2e] border border-slate-700/70 rounded-xl p-2.5 text-center flex flex-col items-center justify-between hover:border-cyan-500/40 transition"
            >
              <div className="relative mb-1.5">
                <img
                  src={opp.avatar}
                  alt={opp.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-700"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-2 ring-[#131b2e]"></span>
              </div>
              <h5 className="font-display font-bold text-xs text-white truncate w-full">
                {opp.name}
              </h5>
              <span className="text-[10px] text-slate-400 mb-2">
                Niv.{opp.level} · {opp.chessElo}
              </span>
              <button
                onClick={() => onOpenChallenge(opp, 'chess')}
                className="w-full py-1 rounded-md text-[10px] font-display font-bold text-white bg-slate-800 hover:bg-cyan-600 transition"
              >
                Défier
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture and Security Note */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Architecture E-Sport & Jetons Virtuels</span>
        </div>
        <p>
          Version MVP autonome installable en PWA. Les soldes et résultats sont stockés localement sur votre appareil. L'architecture est modulaire et prête pour un raccordement direct à un backend sécurisé (Firebase / Cloud SQL).
        </p>
      </div>
    </div>
  );
};
