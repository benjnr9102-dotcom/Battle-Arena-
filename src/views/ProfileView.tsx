import React, { useState } from 'react';
import { User, Award, Shield, RotateCcw, Check, Edit2, Zap, Swords, Trophy, AlertCircle, Server } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateUsername: (newName: string) => void;
  onResetTokens: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateUsername,
  onResetTokens,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>(userProfile.username);
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);

  const handleSaveName = () => {
    if (usernameInput.trim()) {
      onUpdateUsername(usernameInput.trim());
      setIsEditing(false);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2500);
    }
  };

  const winRate =
    userProfile.totalMatches > 0
      ? Math.round((userProfile.victories / userProfile.totalMatches) * 100)
      : 0;

  const currentLevelXpMax = userProfile.level * 250;
  const currentLevelProgress = userProfile.xp % 250;
  const xpPercent = Math.min(100, Math.round((currentLevelProgress / 250) * 100));

  return (
    <div className="w-full max-w-md mx-auto p-3.5 space-y-4 pb-24">
      {/* Toast */}
      {showSavedToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black font-display font-bold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>Profil mis à jour avec succès !</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121b30] via-[#0e1628] to-[#090d16] border border-cyan-500/30 p-4 shadow-xl">
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className="relative">
            <img
              src={userProfile.avatar}
              alt={userProfile.username}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400/80 shadow-lg shadow-cyan-500/20"
            />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-cyan-400 text-black font-display">
              Niv.{userProfile.level}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  maxLength={18}
                  className="bg-[#090d16] border border-cyan-400 rounded-lg px-2.5 py-1 text-sm text-white font-display font-bold w-full focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-lg text-white truncate">
                    {userProfile.username}
                  </h3>
                  <span className="text-[11px] text-cyan-400 font-semibold block">
                    Compétiteur Officiel
                  </span>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Modifier le pseudo"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* XP Bar */}
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Niveau {userProfile.level}</span>
                <span>{currentLevelProgress} / 250 XP</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tokens & Balance reload */}
        <div className="bg-[#090d16]/80 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Solde jetons virtuels
            </span>
            <span className="font-display font-black text-xl text-amber-300">
              {userProfile.tokens.toLocaleString('fr-FR')} ₿
            </span>
          </div>

          <button
            onClick={onResetTokens}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-display font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-800/80 transition active:scale-95"
            title="Recharger 5 000 jetons virtuels pour les tests"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recharger 5 000 ₿</span>
          </button>
        </div>
      </div>

      {/* Competitive Career Stats */}
      <div>
        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 px-1">
          Statistiques de carrière
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {/* Win rate */}
          <div className="bg-[#131b2e] border border-slate-700/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">Taux de victoire</span>
              <Trophy className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-display font-bold text-xl text-white">
              {winRate}%
            </div>
            <span className="text-[10px] text-slate-400">
              {userProfile.victories}V / {userProfile.defeats}D / {userProfile.draws}N
            </span>
          </div>

          {/* Chess ELO */}
          <div className="bg-[#131b2e] border border-slate-700/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">Classement Échecs</span>
              <Swords className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="font-display font-bold text-xl text-cyan-300 font-mono">
              {userProfile.chessElo} ELO
            </div>
            <span className="text-[10px] text-slate-400">
              Arbitrage FIDE
            </span>
          </div>

          {/* Tap Race Best */}
          <div className="bg-[#131b2e] border border-slate-700/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">Record Tap Race</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-display font-bold text-xl text-amber-300 font-mono">
              {userProfile.tapRaceBest} taps
            </div>
            <span className="text-[10px] text-slate-400">
              {(userProfile.tapRaceBest / 15).toFixed(1)} taps/sec max
            </span>
          </div>

          {/* Total Tokens Won */}
          <div className="bg-[#131b2e] border border-slate-700/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">Gains cumulés</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-display font-bold text-xl text-emerald-400">
              +{userProfile.totalTokensWon.toLocaleString('fr-FR')} ₿
            </div>
            <span className="text-[10px] text-slate-400">
              {userProfile.totalFeesPaid.toLocaleString('fr-FR')} ₿ frais prélevés
            </span>
          </div>
        </div>
      </div>

      {/* Backend & Security Architecture Transition Note */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-4 text-xs space-y-2.5">
        <div className="flex items-center gap-2 text-cyan-400 font-display font-bold text-sm">
          <Server className="w-4 h-4" />
          <span>Architecture & Sécurité (Backend Ready)</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Ce prototype PWA stocke les données localement dans le navigateur pour garantir une exécution instantanée et sans friction (MVP).
        </p>
        <div className="bg-[#131b2e] rounded-xl p-2.5 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="text-slate-200 font-semibold mb-1">Feuille de route pour la production :</div>
          <p>• <strong>Authentification :</strong> Firebase Auth / Google Sign-In</p>
          <p>• <strong>Matchmaking en direct :</strong> WebSockets / Firebase Firestore synchronisé</p>
          <p>• <strong>Arbitrage côté serveur :</strong> Validation des coups d'échecs et télémétrie Tap Race anti-cheat</p>
          <p>• <strong>Sécurisation des jetons :</strong> Ledger chiffré sur serveur pour empêcher toute altération client</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 italic">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Les jetons actuels sont 100% fictifs : aucun enjeu financier réel ni transaction bancaire.</span>
        </div>
      </div>
    </div>
  );
};
