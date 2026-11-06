/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { PWAInstallModal } from './components/PWAInstallModal';
import { ChallengeModal } from './components/ChallengeModal';
import { VideoVerificationModal } from './components/VideoVerificationModal';
import { MatchResultModal } from './components/MatchResultModal';

import { ArenaView } from './views/ArenaView';
import { LobbyView } from './views/LobbyView';
import { HistoryView } from './views/HistoryView';
import { ProfileView } from './views/ProfileView';

import { ChessGame } from './games/ChessGame';
import { TapRaceGame } from './games/TapRaceGame';

import { StorageService } from './services/storage';
import { UserProfile, Opponent, MatchRecord, GameType } from './types';
import { useOnlineStatus } from './hooks/useOnlineStatus';

export default function App() {
  const isOnline = useOnlineStatus();

  // App State
  const [currentTab, setCurrentTab] = useState<NavTab>('arena');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => StorageService.getUserProfile());
  const [opponents, setOpponents] = useState<Opponent[]>(() => StorageService.getOpponents());
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(() => StorageService.getMatchHistory());

  // Modal & Flow States
  const [showPWAInfo, setShowPWAInfo] = useState<boolean>(false);
  const [challengeTarget, setChallengeTarget] = useState<{ opponent: Opponent; gameType: GameType } | null>(null);
  const [verificationData, setVerificationData] = useState<{ opponent: Opponent; gameType: GameType; stake: number } | null>(null);
  const [activeGame, setActiveGame] = useState<{ opponent: Opponent; gameType: GameType; stake: number } | null>(null);
  const [completedMatchRecord, setCompletedMatchRecord] = useState<MatchRecord | null>(null);

  // Sync state changes with storage
  const refreshUserData = () => {
    setUserProfile(StorageService.getUserProfile());
    setMatchHistory(StorageService.getMatchHistory());
  };

  // Challenge Flow Step 1: Open Challenge Confirmation Modal
  const handleOpenChallenge = (opponent: Opponent, gameType: GameType) => {
    setChallengeTarget({ opponent, gameType });
  };

  // Challenge Flow Step 2: User Confirms Challenge -> Block Stake -> Open 30s Video Verification
  const handleConfirmChallenge = (opponent: Opponent, gameType: GameType, stake: number) => {
    // Check balance and block stake
    const blocked = StorageService.blockStake(stake);
    if (!blocked) {
      alert('Solde de jetons insuffisant.');
      return;
    }

    refreshUserData();
    setChallengeTarget(null);
    // Proceed to mandatory 30-second live video verification
    setVerificationData({ opponent, gameType, stake });
  };

  // Challenge Flow Step 3: Video Verification Finished -> Start Game
  const handleVerificationCompleted = () => {
    if (!verificationData) return;
    const gameToStart = { ...verificationData };
    setVerificationData(null);
    setActiveGame(gameToStart);
  };

  // Video Verification Cancelled: Refund Stake
  const handleCancelAndRefundVerification = () => {
    if (verificationData) {
      StorageService.refundStake(verificationData.stake);
      refreshUserData();
      setVerificationData(null);
    }
  };

  // Challenge Flow Step 4: Game Ends -> Process tokens & commission -> Show Results
  const handleFinishGame = (result: 'victory' | 'defeat' | 'draw', scoreDetail?: string, notes?: string) => {
    if (!activeGame) return;

    const { userProfile: updatedProfile, record } = StorageService.processMatchResult(
      result,
      activeGame.stake,
      activeGame.gameType,
      activeGame.opponent,
      scoreDetail,
      undefined,
      notes
    );

    setUserProfile(updatedProfile);
    setMatchHistory(StorageService.getMatchHistory());
    setActiveGame(null);
    setCompletedMatchRecord(record);
  };

  // Rematch / Next duel
  const handleRematch = () => {
    if (completedMatchRecord) {
      const opp = opponents.find((o) => o.name === completedMatchRecord.opponentName) || opponents[0];
      setCompletedMatchRecord(null);
      handleOpenChallenge(opp, completedMatchRecord.gameType);
    }
  };

  // Update Player Username
  const handleUpdateUsername = (newName: string) => {
    const profile = { ...userProfile, username: newName };
    StorageService.saveUserProfile(profile);
    setUserProfile(profile);
  };

  // Faucet: Reset or Reload Tokens
  const handleResetTokens = () => {
    const updated = StorageService.resetTokens();
    setUserProfile(updated);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-amber-600/90 text-white text-xs font-semibold px-3 py-1.5 text-center flex items-center justify-center gap-1.5 sticky top-0 z-50">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Mode Hors-ligne actif · Vos scores et parties sont mis en cache localement (PWA).</span>
        </div>
      )}

      {/* Main Header (Suppressed during active immersive gameplay) */}
      {!activeGame && (
        <Header
          userProfile={userProfile}
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
                opponents={opponents}
                onOpenChallenge={handleOpenChallenge}
              />
            )}

            {currentTab === 'history' && (
              <HistoryView matchHistory={matchHistory} />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                userProfile={userProfile}
                onUpdateUsername={handleUpdateUsername}
                onResetTokens={handleResetTokens}
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

      {verificationData && (
        <VideoVerificationModal
          isOpen={true}
          opponent={verificationData.opponent}
          gameType={verificationData.gameType}
          stake={verificationData.stake}
          onCompleted={handleVerificationCompleted}
          onCancelAndRefund={handleCancelAndRefundVerification}
        />
      )}

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
