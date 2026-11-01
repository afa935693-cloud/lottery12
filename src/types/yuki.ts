export type BetType =
  | 'small' // តូច (1-6)
  | 'big' // ធំ (7-12)
  | 'odd' // សេស (1,3,5,7,9,11)
  | 'even' // គូ (2,4,6,8,10,12)
  | 'red' // ក្រហម (1,4,7,10)
  | 'green' // បៃតង (2,5,8,11)
  | 'blue' // ខៀវ (3,6,9,12)
  | 'number_1'
  | 'number_2'
  | 'number_3'
  | 'number_4'
  | 'number_5'
  | 'number_6'
  | 'number_7'
  | 'number_8'
  | 'number_9'
  | 'number_10'
  | 'number_11'
  | 'number_12';

export type YukiColor = 'red' | 'green' | 'blue';
export type YukiParity = 'odd' | 'even';
export type YukiSize = 'small' | 'big';

export interface AnimalCard {
  number: number;
  khmerName: string;
  englishName: string;
  zodiacName: string;
  color: YukiColor;
  parity: YukiParity;
  size: YukiSize;
  odds: number;
  accentColor: string;
  iconSymbol: string;
  description: string;
  image?: string;
}

export interface PlacedBet {
  id: string;
  betType: BetType;
  amount: number;
  potentialPayout: number;
  odds: number;
  roundId: string;
  timestamp: number;
  labelKhmer: string;
  labelEnglish: string;
}

export interface RoundResult {
  roundId: string;
  roundNumber: number;
  timestamp: number;
  formattedTime: string;
  winningNumber: number;
  animal: AnimalCard;
  color: YukiColor;
  size: YukiSize;
  parity: YukiParity;
  totalBetsPlaced: number;
  totalPayouts: number;
}

export interface UserBetHistoryItem {
  id: string;
  roundId: string;
  roundNumber: number;
  timestamp: number;
  betType: BetType;
  labelKhmer: string;
  labelEnglish?: string;
  amount: number;
  odds: number;
  won: boolean;
  payout: number;
  winningNumber?: number;
  status?: 'pending' | 'won' | 'not_won';
}

export type TransactionType = 'deposit' | 'withdrawal' | 'bet_win' | 'bet_stake' | 'bonus';

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: 'completed' | 'pending' | 'rejected';
  timestamp: number;
  description: string;
  referenceId?: string;
  paymentMethod?: string;
}

export interface UserAccount {
  userId: string;
  accountCode: string;
  username: string;
  balanceKHR: number;
  balanceUSD: number;
  activeBetsTotalKHR: number;
  currency: 'KHR' | 'USD';
  avatar: string;
}

export interface GameSettings {
  roundDurationSeconds: number;
  isPaused: boolean;
  forcedNextNumber: number | null; // null for fair RNG
  smallBigOdds: number;
  oddEvenOdds: number;
  colorOdds: number;
  specificNumberOdds: number;
  minBetKHR: number;
  maxBetKHR: number;
}
