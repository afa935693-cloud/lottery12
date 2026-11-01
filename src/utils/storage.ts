import {
  GameSettings,
  RoundResult,
  UserAccount,
  UserBetHistoryItem,
  WalletTransaction,
} from '../types/yuki';
import { getAnimalByNumber } from '../data/animals';

const INITIAL_USER: UserAccount = {
  userId: 'usr_882910',
  accountCode: 'AADDPDPP004',
  username: 'Channara VIP',
  balanceKHR: 500000, // 500,000 KHR
  balanceUSD: 125,
  activeBetsTotalKHR: 0,
  currency: 'KHR',
  avatar: '👤',
};

const INITIAL_SETTINGS: GameSettings = {
  roundDurationSeconds: 180, // 3 minutes per round
  isPaused: false,
  forcedNextNumber: null, // Fair random by default
  smallBigOdds: 1.95,
  oddEvenOdds: 1.95,
  colorOdds: 2.95,
  specificNumberOdds: 11.0,
  minBetKHR: 1000,
  maxBetKHR: 10000000,
};

// Generate realistic initial past rounds corresponding to the screenshot
export const generateInitialRounds = (): RoundResult[] => {
  const seedWinningNumbers = [
    8, 7, 3, 9, 2, 3, 2, 3, 10, 11, 2, 7, 7, 5, 11, 7, 7, 12, 4, 12, 5, 6, 4, 1, 3, 9, 5, 1, 8, 8
  ];
  
  const baseTime = Date.now() - seedWinningNumbers.length * 60 * 1000;
  
  return seedWinningNumbers.map((num, idx) => {
    const roundNumber = 250 + idx;
    const animal = getAnimalByNumber(num);
    const time = new Date(baseTime + idx * 60 * 1000);
    const hours = String(time.getHours()).padStart(2, '0');
    const mins = String(time.getMinutes()).padStart(2, '0');

    return {
      roundId: `2003#${roundNumber}`,
      roundNumber,
      timestamp: time.getTime(),
      formattedTime: `${hours}:${mins}`,
      winningNumber: num,
      animal,
      color: animal.color,
      size: animal.size,
      parity: animal.parity,
      totalBetsPlaced: 120000 + Math.floor(Math.random() * 300000),
      totalPayouts: 90000 + Math.floor(Math.random() * 250000),
    };
  });
};

const STORAGE_KEYS = {
  USER: 'yuki_user_account',
  SETTINGS: 'yuki_game_settings',
  ROUNDS: 'yuki_past_rounds',
  BET_HISTORY: 'yuki_user_bet_history',
  TRANSACTIONS: 'yuki_wallet_transactions',
};

export const getStoredUser = (): UserAccount => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_USER;
};

export const saveStoredUser = (user: UserAccount) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch {}
};

export const getStoredSettings = (): GameSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure 3 minutes (180s) betting round time
      if (!parsed.roundDurationSeconds || parsed.roundDurationSeconds < 120) {
        parsed.roundDurationSeconds = 180;
      }
      return { ...INITIAL_SETTINGS, ...parsed, roundDurationSeconds: 180 };
    }
  } catch {}
  return INITIAL_SETTINGS;
};

export const saveStoredSettings = (settings: GameSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
};

export const getStoredRounds = (): RoundResult[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ROUNDS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const initial = generateInitialRounds();
  saveStoredRounds(initial);
  return initial;
};

export const saveStoredRounds = (rounds: RoundResult[]) => {
  try {
    // Keep last 150 rounds to maintain fast performance
    const trimmed = rounds.slice(-150);
    localStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(trimmed));
  } catch {}
};

const generateInitialBetHistory = (): UserBetHistoryItem[] => {
  const now = Date.now();
  return [
    {
      id: 'slip_init_01',
      roundId: '2003#282',
      roundNumber: 282,
      timestamp: now - 2 * 60 * 1000,
      betType: 'big',
      labelKhmer: 'ធំ (Big 7-12)',
      labelEnglish: 'Big (7-12)',
      amount: 20000,
      odds: 1.95,
      won: true,
      payout: 39000,
      winningNumber: 8,
      status: 'won',
    },
    {
      id: 'slip_init_02',
      roundId: '2003#282',
      roundNumber: 282,
      timestamp: now - 2.5 * 60 * 1000,
      betType: 'red',
      labelKhmer: 'ក្រហម (Red)',
      labelEnglish: 'Red',
      amount: 10000,
      odds: 2.95,
      won: false,
      payout: 0,
      winningNumber: 8,
      status: 'not_won',
    },
    {
      id: 'slip_init_03',
      roundId: '2003#281',
      roundNumber: 281,
      timestamp: now - 5 * 60 * 1000,
      betType: 'even',
      labelKhmer: 'គូ (Even)',
      labelEnglish: 'Even',
      amount: 50000,
      odds: 1.95,
      won: true,
      payout: 97500,
      winningNumber: 8,
      status: 'won',
    },
    {
      id: 'slip_init_04',
      roundId: '2003#280',
      roundNumber: 280,
      timestamp: now - 8 * 60 * 1000,
      betType: 'number_8',
      labelKhmer: 'លេខ ៨ ពពែ (Goat)',
      labelEnglish: 'No. 8 Goat',
      amount: 5000,
      odds: 11.0,
      won: false,
      payout: 0,
      winningNumber: 1,
      status: 'not_won',
    },
    {
      id: 'slip_init_05',
      roundId: '2003#279',
      roundNumber: 279,
      timestamp: now - 11 * 60 * 1000,
      betType: 'small',
      labelKhmer: 'តូច (Small 1-6)',
      labelEnglish: 'Small (1-6)',
      amount: 15000,
      odds: 1.95,
      won: true,
      payout: 29250,
      winningNumber: 5,
      status: 'won',
    },
    {
      id: 'slip_init_06',
      roundId: '2003#278',
      roundNumber: 278,
      timestamp: now - 14 * 60 * 1000,
      betType: 'blue',
      labelKhmer: 'ខៀវ (Blue)',
      labelEnglish: 'Blue',
      amount: 10000,
      odds: 2.95,
      won: true,
      payout: 29500,
      winningNumber: 9,
      status: 'won',
    },
    {
      id: 'slip_init_07',
      roundId: '2003#277',
      roundNumber: 277,
      timestamp: now - 17 * 60 * 1000,
      betType: 'odd',
      labelKhmer: 'សេស (Odd)',
      labelEnglish: 'Odd',
      amount: 25000,
      odds: 1.95,
      won: false,
      payout: 0,
      winningNumber: 2,
      status: 'not_won',
    },
    {
      id: 'slip_init_08',
      roundId: '2003#276',
      roundNumber: 276,
      timestamp: now - 20 * 60 * 1000,
      betType: 'number_3',
      labelKhmer: 'លេខ ៣ ខ្លា (Tiger)',
      labelEnglish: 'No. 3 Tiger',
      amount: 2000,
      odds: 11.0,
      won: true,
      payout: 22000,
      winningNumber: 3,
      status: 'won',
    },
  ];
};

export const getStoredBetHistory = (): UserBetHistoryItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BET_HISTORY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const initial = generateInitialBetHistory();
  saveStoredBetHistory(initial);
  return initial;
};

export const saveStoredBetHistory = (history: UserBetHistoryItem[]) => {
  try {
    const trimmed = history.slice(-100);
    localStorage.setItem(STORAGE_KEYS.BET_HISTORY, JSON.stringify(trimmed));
  } catch {}
};

export const getStoredTransactions = (): WalletTransaction[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [
    {
      id: 'tx_init_1001',
      type: 'bonus',
      amount: 500000,
      status: 'completed',
      timestamp: Date.now() - 3600000,
      description: 'Welcome Bonus Credit (ប្រាក់រង្វាន់ស្វាគមន៍)',
      paymentMethod: 'System AirDrop',
    },
  ];
};

export const saveStoredTransactions = (txs: WalletTransaction[]) => {
  try {
    const trimmed = txs.slice(-100);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(trimmed));
  } catch {}
};
