/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { doc, onSnapshot, collection, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from './firebase';

import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { PWAInstallModal } from './components/PWAInstallModal';
import { ChallengeModal } from './components/ChallengeModal';
import { MatchResultModal } from './components/MatchResultModal';

import { AuthView } from './views/AuthView';
import { ResetPasswordView } from './views/ResetPasswordView';
import { ArenaView } from './views/ArenaView';
import { LobbyView } from './views/LobbyView';
import { HistoryView } from './views/HistoryView';
import { ProfileView } from './views/ProfileView';

import { ChessGame } from './games/ChessGame';
import { TapRaceGame } from './games/TapRaceGame';

import { StorageService } from './services/storage';
import { UserProfile, Opponent, MatchRecord, GameType } from './types';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Swords, Loader2, Mail, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

export default function App() {
  const isOnline = useOnlineStatus();

  // In-app password reset via URL parameters (mode=resetPassword & oobCode)
  const [resetCode, setResetCode] = useState<string | null>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hashQuery = window.location.hash.includes('?')
        ? window.location.hash.split('?')[1]
        : '';
      const hashParams = new URLSearchParams(hashQuery);

      const mode = searchParams.get('mode') || hashParams.get('mode');
      const oobCode = searchParams.get('oobCode') || hashParams.get('oobCode');

      if (mode === 'resetPassword' && oobCode) {
        return oobCode;
      }
    } catch (e) {
      console.warn('Erreur lecture paramètres URL resetPassword:', e);
    }
    return null;
  });

  const [authSuccessMsg, setAuthSuccessMsg] = useState<string>('');

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  // App Navigation & User State
  const [currentTab, setCurrentTab] = useState<NavTab>('arena');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '',
    username: '',
    avatar: '',
    tokens: 5000,
    level: 1,
    xp: 0,
    chessElo: 1200,
    tapRaceBest: 0,
    totalMatches: 0,
    victories: 0,
    defeats: 0,
    draws: 0,
    totalTokensWon: 0,
    totalFeesPaid: 0,
  });

  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(() => StorageService.getMatchHistory());

  // Modal & Flow States
  const [showPWAInfo, setShowPWAInfo] = useState<boolean>(false);
  const [challengeTarget, setChallengeTarget] = useState<{ opponent: Opponent; gameType: GameType } | null>(null);
  const [activeGame, setActiveGame] = useState<{ opponent: Opponent; gameType: GameType; stake: number } | null>(null);
  const [completedMatchRecord, setCompletedMatchRecord] = useState<MatchRecord | null>(null);

  // 1. Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsEmailVerified(!!user?.emailVerified);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cooldown countdown timer for email resend (limited to once per 60 seconds)
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // 2. Real-time Firestore synchronization for currentUser document (users/{uid})
  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile({
            id: currentUser.uid,
            username: data.pseudo || 'Joueur',
            avatar: data.photo || '',
            tokens: typeof data.jetons === 'number' ? data.jetons : 5000,
            level: data.level || 1,
            xp: data.xp || 0,
            chessElo: data.chessElo || 1200,
            tapRaceBest: data.tapRaceBest || 0,
            totalMatches: data.totalMatches || 0,
            victories: data.victories || 0,
            defeats: data.defeats || 0,
            draws: data.draws || 0,
            totalTokensWon: data.totalTokensWon || 0,
            totalFeesPaid: data.totalFeesPaid || 0,
          });
        }
      },
      (error) => {
        console.error('Erreur écoute profil Firestore:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // 3. Real-time Firestore synchronization for real registered players in Lobby & Arena
  useEffect(() => {
    if (!currentUser) return;

    const usersColRef = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersColRef,
      (snapshot) => {
        const realOpponents: Opponent[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.id !== currentUser.uid) {
            const data = docSnap.data();
            realOpponents.push({
              id: docSnap.id,
              name: data.pseudo || 'Joueur Anonyme',
              avatar: data.photo || '',
              level: data.level || 1,
              winRate:
                (data.victories || 0) + (data.defeats || 0) > 0
                  ? Math.round(((data.victories || 0) / ((data.victories || 0) + (data.defeats || 0))) * 100)
                  : 50,
              chessElo: data.chessElo || 1200,
              defaultStake: Math.min(data.jetons ?? 5000, 1000),
              status: 'ready',
              tapRaceAvgSpeed: 10.0,
              bio: 'Compétiteur officiel BATTLE ARENA',
              region: 'En ligne',
            });
          }
        });
        setOpponents(realOpponents);
      },
      (error) => {
        console.error('Erreur écoute adversaires Firestore:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Requirement 4: Resend verification email with 60s cooldown limit
  const handleResendVerificationEmail = async () => {
    if (!currentUser || resendCooldown > 0) return;

    try {
      await sendEmailVerification(currentUser);
      setResendCooldown(60);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      console.error('Erreur renvoi e-mail de vérification:', err);
      alert('Impossible d’envoyer l’e-mail de vérification pour le moment.');
    }
  };

  // Reload user status to refresh emailVerified
  const handleCheckEmailVerified = async () => {
    if (!currentUser) return;
    try {
      await currentUser.reload();
      if (auth.currentUser) {
        setIsEmailVerified(auth.currentUser.emailVerified);
      }
    } catch (err) {
      console.warn('Erreur actualisation statut e-mail:', err);
    }
  };

  // Challenge Flow Step 1: Open Confirmation Modal
  const handleOpenChallenge = (opponent: Opponent, gameType: GameType) => {
    setChallengeTarget({ opponent, gameType });
  };

  // Challenge Flow Step 2: Confirm challenge -> Block stake in Firestore -> Video verification disabled per prompt instructions
  const handleConfirmChallenge = async (opponent: Opponent, gameType: GameType, stake: number) => {
    if (userProfile.tokens < stake) {
      alert('Solde de jetons insuffisant.');
      return;
    }

    if (!currentUser) return;

    try {
      // Deduct stake in Firestore
      const newTokens = userProfile.tokens - stake;
      await updateDoc(doc(db, 'users', currentUser.uid), {
        jetons: newTokens,
      });

      setChallengeTarget(null);

      // Note: Video verification by camera is disabled per user request:
      // "Désactive la vérification vidéo par caméra pour l'instant."
      // We directly launch the match!
      setActiveGame({ opponent, gameType, stake });
    } catch (err) {
      console.error('Erreur lors du blocage de la mise dans Firestore:', err);
      alert('Impossible d’engager la mise. Vérifiez votre connexion.');
    }
  };

  // Challenge Flow Step 3: Game Ends -> Process tokens & commission in Firestore -> Show Results
  const handleFinishGame = async (result: 'victory' | 'defeat' | 'draw', scoreDetail?: string, notes?: string) => {
    if (!activeGame || !currentUser) return;

    const stake = activeGame.stake;
    const totalPot = stake * 2;
    const platformFee = Math.round(totalPot * 0.15);
    const winnerPayout = totalPot - platformFee;

    let payout = 0;
    const userDocRef = doc(db, 'users', currentUser.uid);

    try {
      if (result === 'victory') {
        payout = winnerPayout;
        // Stake was already deducted at start, add winner payout
        await updateDoc(userDocRef, {
          jetons: increment(winnerPayout),
          victories: increment(1),
          totalMatches: increment(1),
          totalTokensWon: increment(winnerPayout),
          totalFeesPaid: increment(platformFee),
          xp: increment(150),
          chessElo: activeGame.gameType === 'chess' ? increment(15) : increment(0),
        });
      } else if (result === 'defeat') {
        payout = 0;
        await updateDoc(userDocRef, {
          defeats: increment(1),
          totalMatches: increment(1),
          xp: increment(40),
          chessElo: activeGame.gameType === 'chess' ? increment(-10) : increment(0),
        });
      } else {
        // Draw: refund initial stake completely, no platform fee
        payout = stake;
        await updateDoc(userDocRef, {
          jetons: increment(stake),
          draws: increment(1),
          totalMatches: increment(1),
          xp: increment(75),
        });
      }

      // Record in local history
      const newRecord: MatchRecord = {
        id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        gameType: activeGame.gameType,
        opponentName: activeGame.opponent.name,
        opponentAvatar: activeGame.opponent.avatar,
        stake,
        totalPot,
        platformFee: result === 'draw' ? 0 : platformFee,
        payout,
        result,
        playerScore: scoreDetail,
        date: new Date().toISOString(),
        notes,
      };

      StorageService.addMatchRecord(newRecord);
      setMatchHistory(StorageService.getMatchHistory());
      setActiveGame(null);
      setCompletedMatchRecord(newRecord);
    } catch (err) {
      console.error('Erreur mise à jour résultat dans Firestore:', err);
      setActiveGame(null);
    }
  };

  // Rematch / Next duel
  const handleRematch = () => {
    if (completedMatchRecord) {
      const opp = opponents.find((o) => o.name === completedMatchRecord.opponentName) || opponents[0];
      setCompletedMatchRecord(null);
      if (opp) {
        handleOpenChallenge(opp, completedMatchRecord.gameType);
      }
    }
  };

  // Requirement 3: Modifier le pseudo dans Firestore
  const handleUpdateUsername = async (newName: string) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), {
      pseudo: newName.trim(),
    });
  };

  // Requirement 3: Enregistrer la photo (128x128 JPEG qualité 0.7 data URL) dans le champ photo
  const handleUpdatePhoto = async (photoDataUrl: string) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), {
      photo: photoDataUrl,
    });
  };

  // Recharger le solde à 5 000 jetons dans Firestore
  const handleResetTokens = async () => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), {
      jetons: 5000,
    });
  };

  // Requirement 6: Changer mon mot de passe via e-mail de réinitialisation
  const handleChangePassword = async () => {
    if (!currentUser?.email) {
      throw new Error('Adresse e-mail du compte introuvable.');
    }
    await sendPasswordResetEmail(auth, currentUser.email);
  };

  // Déconnexion
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentTab('arena');
    } catch (err) {
      console.error('Erreur déconnexion:', err);
    }
  };

  // Reset Password Flow Handlers
  const handleResetSuccess = async (message: string) => {
    try {
      await signOut(auth);
    } catch (e) {}
    setResetCode(null);
    setAuthSuccessMsg(message || 'Mot de passe modifié');
    try {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (e) {}
  };

  const handleResetCancel = () => {
    setResetCode(null);
    try {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (e) {}
  };

  // 1. Password Reset View when link contains mode=resetPassword and oobCode
  if (resetCode) {
    return (
      <ResetPasswordView
        oobCode={resetCode}
        onSuccess={handleResetSuccess}
        onCancel={handleResetCancel}
      />
    );
  }

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-3 animate-pulse">
          <Swords className="w-8 h-8 text-white" />
        </div>
        <p className="font-display font-bold text-sm text-cyan-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Chargement de l'Arène...
        </p>
      </div>
    );
  }

  // Not authenticated: render Auth View (Inscription / Connexion / Mot de passe oublié)
  if (!currentUser) {
    return (
      <AuthView
        initialMessage={authSuccessMsg}
        onSuccess={() => setAuthSuccessMsg('')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-amber-600/90 text-white text-xs font-semibold px-3 py-1.5 text-center flex items-center justify-center gap-1.5 sticky top-0 z-50">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Mode Hors-ligne actif · Vos scores et parties sont mis en cache localement (PWA).</span>
        </div>
      )}

      {/* Requirement 4: Email Verification Banner (non-blocking) */}
      {!isEmailVerified && (
        <div className="bg-gradient-to-r from-blue-950 via-cyan-950 to-blue-950 border-b border-cyan-500/40 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 sticky top-0 z-45">
          <div className="flex items-center gap-2 text-slate-200 min-w-0">
            <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">
              <strong>Vérifie ton e-mail :</strong> Un lien de confirmation a été envoyé à <em>{currentUser.email}</em>.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {resendSuccess && (
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Envoyé !
              </span>
            )}

            <button
              onClick={handleResendVerificationEmail}
              disabled={resendCooldown > 0}
              className="px-2.5 py-1 rounded-lg text-[11px] font-display font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Renvoyer l'e-mail de vérification (1 fois par minute)"
            >
              <Send className="w-3 h-3" />
              <span>{resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer l'e-mail"}</span>
            </button>

            <button
              onClick={handleCheckEmailVerified}
              className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
              title="Vérifier si l'e-mail a été validé"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header (Suppressed during active immersive gameplay) */}
      {!activeGame && (
        <Header
          userProfile={userProfile}
          playerCount={opponents.length + 1}
          onOpenPWAInfo={() => setShowPWAInfo(true)}
          onResetTokens={handleResetTokens}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeGame ? (
          activeGame.gameType === 'chess' ? (
            <ChessGame
              opponent={activeGame.opponent}
              stake={activeGame.stake}
              onFinishGame={handleFinishGame}
              onQuit={() => {
                if (confirm('Voulez-vous abandonner la partie ? Votre mise sera perdue.')) {
                  handleFinishGame('defeat', 'Abandon', 'Match concédé par le joueur.');
                }
              }}
            />
          ) : (
            <TapRaceGame
              opponent={activeGame.opponent}
              stake={activeGame.stake}
              onFinishGame={handleFinishGame}
              onQuit={() => {
                if (confirm('Voulez-vous quitter le duel ? Votre mise sera perdue.')) {
                  handleFinishGame('defeat', 'Abandon', 'Duel abandonné en cours de chrono.');
                }
              }}
            />
          )
        ) : (
          <>
            {currentTab === 'arena' && (
              <ArenaView
                userProfile={userProfile}
                opponents={opponents}
                onOpenChallenge={handleOpenChallenge}
                onGoToLobby={() => setCurrentTab('lobby')}
              />
            )}

            {currentTab === 'lobby' && (
              <LobbyView
                currentUserId={currentUser.uid}
                onOpenChallenge={handleOpenChallenge}
              />
            )}

            {currentTab === 'history' && (
              <HistoryView matchHistory={matchHistory} />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                userProfile={userProfile}
                userEmail={currentUser.email || undefined}
                onUpdateUsername={handleUpdateUsername}
                onUpdatePhoto={handleUpdatePhoto}
                onResetTokens={handleResetTokens}
                onChangePassword={handleChangePassword}
                onSignOut={handleSignOut}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation (Hidden during active match) */}
      {!activeGame && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />
      )}

      {/* Flow Modals */}
      <ChallengeModal
        isOpen={!!challengeTarget}
        opponent={challengeTarget?.opponent || null}
        initialGameType={challengeTarget?.gameType || 'chess'}
        userTokens={userProfile.tokens}
        onCancel={() => setChallengeTarget(null)}
        onConfirm={handleConfirmChallenge}
      />

      <MatchResultModal
        isOpen={!!completedMatchRecord}
        matchRecord={completedMatchRecord}
        onRematch={handleRematch}
        onViewHistory={() => {
          setCompletedMatchRecord(null);
          setCurrentTab('history');
        }}
        onClose={() => setCompletedMatchRecord(null)}
      />

      <PWAInstallModal
        isOpen={showPWAInfo}
        onClose={() => setShowPWAInfo(false)}
      />
    </div>
  );
}
