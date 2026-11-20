export type GameType = 'chess' | 'taprace';

export type MatchStatus = 'victory' | 'defeat' | 'draw' | 'cancelled';

export interface Opponent {
  id: string;
  name: string;
  avatar: string;
  level: number;
  winRate: number; // percentage, e.g. 68
  chessElo: number;
  defaultStake: number; // in tokens
  status: 'online' | 'in_match' | 'ready';
  tapRaceAvgSpeed: number; // taps per second
  bio: string;
  region: string;
}

export interface MatchRecord {
  id: string;
  gameType: GameType;
  opponentName: string;
  opponentAvatar: string;
  stake: number; // player stake
  totalPot: number; // total stake (player + opponent)
  platformFee: number; // 15% fee
  payout: number; // net win amount for winner
  result: MatchStatus;
  playerScore?: number | string;
  opponentScore?: number | string;
  date: string; // ISO string
  notes?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  tokens: number;
  level: number;
  xp: number;
  chessElo: number;
  tapRaceBest: number;
  totalMatches: number;
  victories: number;
  defeats: number;
  draws: number;
  totalTokensWon: number;
  totalFeesPaid: number;
}

export interface FirestoreUser {
  uid: string;
  pseudo: string;
  jetons: number;
  createdAt?: any;
  photo?: string;
  level?: number;
  xp?: number;
  chessElo?: number;
  tapRaceBest?: number;
  victories?: number;
  defeats?: number;
  draws?: number;
  totalMatches?: number;
  totalTokensWon?: number;
  totalFeesPaid?: number;
}

export interface ActiveChallenge {
  opponent: Opponent;
  gameType: GameType;
  stake: number;
}

export type ChallengeStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export type ChallengeStake = 200 | 500 | 1000 | 2000;

export interface ChallengeInvite {
  id: string;
  fromUid: string;
  toUid: string;
  fromPseudo: string;
  toPseudo: string;
  game: GameType;
  stake: ChallengeStake;
  status: ChallengeStatus;
  createdAt?: any;
  createdAtMs?: number | null;
}

