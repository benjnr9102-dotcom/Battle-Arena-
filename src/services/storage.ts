import { Opponent, MatchRecord, UserProfile } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'battle_arena_user_profile',
  MATCH_HISTORY: 'battle_arena_match_history',
  OPPONENTS: 'battle_arena_opponents',
};

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'user_local_01',
  username: 'Apex_Striker',
  avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  tokens: 5000,
  level: 14,
  xp: 3200,
  chessElo: 1350,
  tapRaceBest: 128,
  totalMatches: 8,
  victories: 6,
  defeats: 2,
  draws: 0,
  totalTokensWon: 9350,
  totalFeesPaid: 1650,
};

export const DEMO_OPPONENTS: Opponent[] = [
  {
    id: 'opp_koffi_229',
    name: 'Koffi_229',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    level: 38,
    winRate: 74,
    chessElo: 1720,
    defaultStake: 1000,
    status: 'ready',
    tapRaceAvgSpeed: 10.4,
    bio: 'Champion régional blitz. Vitesse et tactique acérées.',
    region: 'Cotonou, Bénin',
  },
  {
    id: 'opp_marie_bj',
    name: 'Marie_BJ',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    level: 26,
    winRate: 62,
    chessElo: 1540,
    defaultStake: 500,
    status: 'ready',
    tapRaceAvgSpeed: 9.2,
    bio: 'Stratège méthodique. Ne sous-estime jamais mes pions.',
    region: 'Porto-Novo, Bénin',
  },
  {
    id: 'opp_boss_cotonou',
    name: 'Boss_Cotonou',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    level: 52,
    winRate: 81,
    chessElo: 1890,
    defaultStake: 2000,
    status: 'ready',
    tapRaceAvgSpeed: 12.1,
    bio: 'Maître incontesté de l’arène. Prépare ta mise.',
    region: 'Cotonou Littoral',
  },
  {
    id: 'opp_yasmine_pro',
    name: 'Yasmine_Pro',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    level: 19,
    winRate: 58,
    chessElo: 1420,
    defaultStake: 500,
    status: 'online',
    tapRaceAvgSpeed: 8.8,
    bio: 'Joueuse montante, spécialiste du Tap Race express.',
    region: 'Abomey-Calavi',
  },
  {
    id: 'opp_sam_blitz',
    name: 'Sam_Blitz',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    level: 44,
    winRate: 77,
    chessElo: 1795,
    defaultStake: 1500,
    status: 'in_match',
    tapRaceAvgSpeed: 11.5,
    bio: 'Attaque foudroyante. Fin de partie en moins de 3 min.',
    region: 'Parakou',
  },
];

export const INITIAL_MATCH_HISTORY: MatchRecord[] = [
  {
    id: 'match_init_01',
    gameType: 'taprace',
    opponentName: 'Marie_BJ',
    opponentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    stake: 1000,
    totalPot: 2000,
    platformFee: 300,
    payout: 1700,
    result: 'victory',
    playerScore: '142 taps',
    opponentScore: '131 taps',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'Victoire serrée au Tap Race. Vitesse moyenne 9.47 taps/s.',
  },
  {
    id: 'match_init_02',
    gameType: 'chess',
    opponentName: 'Koffi_229',
    opponentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    stake: 500,
    totalPot: 1000,
    platformFee: 150,
    payout: 850,
    result: 'defeat',
    playerScore: 'Mat',
    opponentScore: 'Victoire',
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
    notes: 'Défaite par échec et mat au 32e coup sur une défense Sicilienne.',
  },
  {
    id: 'match_init_03',
    gameType: 'taprace',
    opponentName: 'Yasmine_Pro',
    opponentAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    stake: 500,
    totalPot: 1000,
    platformFee: 150,
    payout: 850,
    result: 'victory',
    playerScore: '138 taps',
    opponentScore: '122 taps',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Record personnel franchi.',
  },
];

export class StorageService {
  static getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading user profile from localStorage:', e);
    }
    this.saveUserProfile(INITIAL_USER_PROFILE);
    return INITIAL_USER_PROFILE;
  }

  static saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving user profile to localStorage:', e);
    }
  }

  static getOpponents(): Opponent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OPPONENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading opponents from localStorage:', e);
    }
    this.saveOpponents(DEMO_OPPONENTS);
    return DEMO_OPPONENTS;
  }

  static saveOpponents(opponents: Opponent[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OPPONENTS, JSON.stringify(opponents));
    } catch (e) {
      console.error('Error saving opponents to localStorage:', e);
    }
  }

  static getMatchHistory(): MatchRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading match history from localStorage:', e);
    }
    this.saveMatchHistory(INITIAL_MATCH_HISTORY);
    return INITIAL_MATCH_HISTORY;
  }

  static saveMatchHistory(history: MatchRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Error saving match history to localStorage:', e);
    }
  }

  static addMatchRecord(record: MatchRecord): void {
    const history = this.getMatchHistory();
    history.unshift(record);
    this.saveMatchHistory(history);
  }

  // Token management with 15% platform commission
  // Example: Total pot = 2000 tokens (1000 each)
  // Commission = 300 tokens (15%)
  // Winner receives = 1700 tokens (Net gain = +700)
  static processMatchResult(
    result: 'victory' | 'defeat' | 'draw',
    stake: number,
    gameType: 'chess' | 'taprace',
    opponent: Opponent,
    playerScoreText?: string,
    opponentScoreText?: string,
    notes?: string
  ): { userProfile: UserProfile; record: MatchRecord } {
    const profile = this.getUserProfile();
    const totalPot = stake * 2;
    const platformFee = Math.round(totalPot * 0.15);
    const winnerPayout = totalPot - platformFee;

    let payout = 0;
    if (result === 'victory') {
      payout = winnerPayout;
      profile.tokens += winnerPayout; // Stake was already blocked/deducted at confirmation
      profile.victories += 1;
      profile.totalTokensWon += winnerPayout;
      profile.totalFeesPaid += platformFee;
      profile.xp += 150;
      if (gameType === 'chess') {
        profile.chessElo += 15;
      }
    } else if (result === 'defeat') {
      payout = 0;
      profile.defeats += 1;
      profile.xp += 40;
      if (gameType === 'chess') {
        profile.chessElo = Math.max(800, profile.chessElo - 12);
      }
    } else {
      // Draw: refund initial stake completely, no fee
      payout = stake;
      profile.tokens += stake;
      profile.draws += 1;
      profile.xp += 75;
    }

    profile.totalMatches += 1;
    profile.level = Math.floor(profile.xp / 250) + 1;

    const newRecord: MatchRecord = {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      gameType,
      opponentName: opponent.name,
      opponentAvatar: opponent.avatar,
      stake,
      totalPot,
      platformFee: result === 'draw' ? 0 : platformFee,
      payout,
      result,
      playerScore: playerScoreText,
      opponentScore: opponentScoreText,
      date: new Date().toISOString(),
      notes,
    };

    this.saveUserProfile(profile);
    this.addMatchRecord(newRecord);

    return { userProfile: profile, record: newRecord };
  }

  // Deduct stake when match is confirmed
  static blockStake(stake: number): boolean {
    const profile = this.getUserProfile();
    if (profile.tokens < stake) {
      return false;
    }
    profile.tokens -= stake;
    this.saveUserProfile(profile);
    return true;
  }

  // Refund stake if cancelled during verification
  static refundStake(stake: number): void {
    const profile = this.getUserProfile();
    profile.tokens += stake;
    this.saveUserProfile(profile);
  }

  // Faucet: reset to 5000 tokens for testing
  static resetTokens(): UserProfile {
    const profile = this.getUserProfile();
    profile.tokens = Math.max(profile.tokens, 5000);
    this.saveUserProfile(profile);
    return profile;
  }
}
