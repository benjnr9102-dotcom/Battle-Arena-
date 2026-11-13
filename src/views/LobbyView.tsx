import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, Swords, Zap, Users, Loader2, Award } from 'lucide-react';
import { Opponent, GameType, FirestoreUser } from '../types';

interface LobbyViewProps {
  currentUserId: string;
  onOpenChallenge: (opponent: Opponent, gameType: GameType) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ currentUserId, onOpenChallenge }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [realPlayers, setRealPlayers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Requirement 4: Afficher en temps réel (onSnapshot) la liste des vrais joueurs inscrits (pseudo + photo), sans les faux joueurs démo
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const players: FirestoreUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Filter out current user from opponents list
          if (docSnap.id !== currentUserId) {
            players.push({
              uid: docSnap.id,
              pseudo: data.pseudo || 'Joueur Anonyme',
              jetons: typeof data.jetons === 'number' ? data.jetons : 5000,
              photo: data.photo || '',
              level: data.level || 1,
              chessElo: data.chessElo || 1200,
              tapRaceBest: data.tapRaceBest || 0,
              victories: data.victories || 0,
              defeats: data.defeats || 0,
              createdAt: data.createdAt,
            });
          }
        });
        setRealPlayers(players);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur onSnapshot Firestore users:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const filteredPlayers = realPlayers.filter((player) =>
    player.pseudo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const convertToOpponent = (player: FirestoreUser): Opponent => {
    return {
      id: player.uid,
      name: player.pseudo,
      avatar: player.photo || '',
      level: player.level || 1,
      winRate:
        (player.victories || 0) + (player.defeats || 0) > 0
          ? Math.round(((player.victories || 0) / ((player.victories || 0) + (player.defeats || 0))) * 100)
          : 50,
      chessElo: player.chessElo || 1200,
      defaultStake: Math.min(player.jetons || 5000, 1000),
      status: 'ready',
      tapRaceAvgSpeed: 10.0,
      bio: 'Joueur officiel BATTLE ARENA',
      region: 'En ligne',
    };
  };

  return (
    <div className="w-full max-w-md mx-auto p-3.5 space-y-3.5 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-xl text-white tracking-wider">
            LOBBY DES JOUEURS
          </h2>
          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {realPlayers.length} joueur{realPlayers.length > 1 ? 's' : ''} inscrit{realPlayers.length > 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Compétiteurs disponibles pour un duel en direct
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un joueur par pseudo..."
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

      {/* Player List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 bg-[#131b2e]/50 rounded-2xl border border-slate-800 p-6 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
            <p className="text-xs text-slate-400">Recherche des compétiteurs...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-10 bg-[#131b2e]/50 rounded-2xl border border-slate-800 p-6">
            <Users className="w-10 h-10 text-cyan-400/60 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">
              {searchQuery ? 'Aucun joueur trouvé' : 'En attente d’autres compétiteurs'}
            </h4>
            <p className="text-xs text-slate-400 mb-3 max-w-xs mx-auto">
              {searchQuery
                ? 'Aucun profil joueur ne correspond à ce pseudonyme.'
                : 'Vous êtes le premier joueur connecté ! Dès qu’un autre joueur crée son compte, il apparaîtra ici instantanément en temps réel.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs font-semibold rounded-lg"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const opp = convertToOpponent(player);

            return (
              <div
                key={player.uid}
                className="bg-gradient-to-br from-[#131b2e] to-[#0c1424] border border-slate-700/80 hover:border-cyan-500/40 rounded-2xl p-3.5 shadow-md transition"
              >
                {/* Header Profile Row */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {player.photo ? (
                        <img
                          src={player.photo}
                          alt={player.pseudo}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center font-display font-bold text-base text-white ring-2 ring-slate-700">
                          {player.pseudo.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span
                        className="w-3 h-3 rounded-full absolute -bottom-1 -right-1 ring-2 ring-[#131b2e] bg-emerald-400"
                        title="Joueur inscrit"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-base text-white">
                          {player.pseudo}
                        </h4>
                        <span className="text-[10px] font-bold font-display px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          Niv.{player.level || 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {player.chessElo || 1200} ELO · Compte officiel
                      </p>
                    </div>
                  </div>

                  {/* Token Balance */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#090d16] border border-slate-800 text-amber-300 font-display font-bold text-xs">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{(player.jetons ?? 5000).toLocaleString('fr-FR')} ₿</span>
                  </div>
                </div>

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
