import React, { useState } from 'react';
import { Award, RotateCcw, Check, Edit2, Zap, Swords, Trophy, Camera, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { resizeImageTo128Jpeg } from '../utils/imageResize';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateUsername: (newName: string) => Promise<void> | void;
  onUpdatePhoto: (photoDataUrl: string) => Promise<void> | void;
  onResetTokens: () => Promise<void> | void;
  onSignOut: () => Promise<void> | void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateUsername,
  onUpdatePhoto,
  onResetTokens,
  onSignOut,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>(userProfile.username);
  const [showSavedToast, setShowSavedToast] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSaveName = async () => {
    const trimmed = usernameInput.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setErrorMessage('Le pseudo doit comporter entre 3 et 20 caractères.');
      return;
    }

    try {
      setErrorMessage('');
      await onUpdateUsername(trimmed);
      setIsEditing(false);
      triggerToast('Pseudo mis à jour !');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la modification du pseudo.');
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      setErrorMessage('');
      // Requirement 3: 128x128 px, JPEG 0.7, < 60 000 chars
      const resizedJpeg = await resizeImageTo128Jpeg(file);
      await onUpdatePhoto(resizedJpeg);
      triggerToast('Photo de profil mise à jour !');
    } catch (err: any) {
      console.error('Photo resize/upload error:', err);
      setErrorMessage(err.message || 'Impossible de charger la photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const triggerToast = (msg: string) => {
    setShowSavedToast(msg);
    setTimeout(() => setShowSavedToast(null), 2500);
  };

  const winRate =
    userProfile.totalMatches > 0
      ? Math.round((userProfile.victories / userProfile.totalMatches) * 100)
      : 0;

  const currentLevelProgress = userProfile.xp % 250;
  const xpPercent = Math.min(100, Math.round((currentLevelProgress / 250) * 100));

  return (
    <div className="w-full max-w-md mx-auto p-3.5 space-y-4 pb-24">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black font-display font-bold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{showSavedToast}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121b30] via-[#0e1628] to-[#090d16] border border-cyan-500/30 p-4 shadow-xl">
        <div className="flex items-center gap-3.5 mb-3.5">
          {/* Avatar with Camera upload trigger */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-cyan-400/80 shadow-lg shadow-cyan-500/20 bg-slate-800 flex items-center justify-center">
              {isUploadingPhoto ? (
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              ) : userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-xl font-bold font-display text-white">
                  {userProfile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Gallery picker trigger */}
            <label
              htmlFor="gallery-photo-input"
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-cyan-500 text-black shadow-md cursor-pointer hover:bg-cyan-400 transition"
              title="Changer de photo depuis la galerie"
            >
              <Camera className="w-3.5 h-3.5" />
            </label>
            <input
              id="gallery-photo-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-400 text-black font-display">
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
                  minLength={3}
                  maxLength={20}
                  className="bg-[#090d16] border border-cyan-400 rounded-lg px-2.5 py-1 text-sm text-white font-display font-bold w-full focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition"
                  title="Enregistrer le pseudo"
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
                    Joueur Authentifié Firebase
                  </span>
                </div>
                <button
                  onClick={() => {
                    setUsernameInput(userProfile.username);
                    setIsEditing(true);
                  }}
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
              Solde Firestore
            </span>
            <span className="font-display font-black text-xl text-amber-300">
              {userProfile.tokens.toLocaleString('fr-FR')} ₿
            </span>
          </div>

          <button
            onClick={onResetTokens}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-display font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-800/80 transition active:scale-95"
            title="Recharger 5 000 jetons virtuels dans Firestore"
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

      {/* Disconnection button */}
      <div className="pt-2">
        <button
          onClick={onSignOut}
          className="w-full py-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider text-red-400 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 shadow-md flex items-center justify-center gap-2 transition active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
};
