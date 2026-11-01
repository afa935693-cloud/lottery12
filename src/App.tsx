import React, { useState, useEffect, useRef } from 'react';
import {
  AnimalCard,
  BetType,
  GameSettings,
  PlacedBet,
  RoundResult,
  UserAccount,
  UserBetHistoryItem,
  WalletTransaction,
} from './types/yuki';
import {
  getStoredBetHistory,
  getStoredRounds,
  getStoredSettings,
  getStoredTransactions,
  getStoredUser,
  saveStoredBetHistory,
  saveStoredRounds,
  saveStoredSettings,
  saveStoredTransactions,
  saveStoredUser,
} from './utils/storage';
import { getAnimalByNumber, YUKI_ANIMALS } from './data/animals';
import { soundManager } from './utils/audio';

import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { CenterGoldenArena } from './components/GoldenBowl';
import { BettingBoard } from './components/BettingBoard';
import { Roadmaps } from './components/Roadmaps';
import { WinLossModal } from './components/WinLossModal';
import { ResultsModal } from './components/ResultsModal';
import { WalletModal } from './components/WalletModal';
import { AdminDashboard } from './components/AdminDashboard';
import { RoundWinCelebration } from './components/RoundWinCelebration';

export default function App() {
  // Primary Platform States
  const [user, setUser] = useState<UserAccount>(getStoredUser);
  const [settings, setSettings] = useState<GameSettings>(getStoredSettings);
  const [rounds, setRounds] = useState<RoundResult[]>(getStoredRounds);
  const [userBetHistory, setUserBetHistory] = useState<UserBetHistoryItem[]>(getStoredBetHistory);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(getStoredTransactions);

  // Active Game State
  const [roundNumber, setRoundNumber] = useState<number>(() => {
    const last = rounds[rounds.length - 1];
    return last ? last.roundNumber + 1 : 283;
  });
  const activeRoundId = `2003#${roundNumber}`;

  const [remainingSeconds, setRemainingSeconds] = useState<number>(settings.roundDurationSeconds);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [lastRoundBets, setLastRoundBets] = useState<PlacedBet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(user.currency === 'KHR' ? 10000 : 5);

  // Draw & Sequential Reveal state
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [revealStep, setRevealStep] = useState<number>(0);
  const [eliminatedBowls, setEliminatedBowls] = useState<AnimalCard[]>([]);
  const [revealedAnimal, setRevealedAnimal] = useState<AnimalCard | null>(null);
  const [lastSettledResult, setLastSettledResult] = useState<RoundResult | null>(null);
  const revealTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      revealTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Win Celebration modal state
  const [celebrationWin, setCelebrationWin] = useState<{
    winningAnimal: AnimalCard;
    totalWonAmount: number;
    winningSlips: { label: string; amount: number; payout: number; odds: number }[];
  } | null>(null);

  // UI Navigation Tabs
  const [activeTab, setActiveTab] = useState<'game' | 'winloss' | 'results' | 'wallet' | 'admin'>('game');
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [mobileView, setMobileView] = useState<'game' | 'board'>('game');

  // Persistence triggers
  useEffect(() => {
    saveStoredUser(user);
  }, [user]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredRounds(rounds);
  }, [rounds]);

  useEffect(() => {
    saveStoredBetHistory(userBetHistory);
  }, [userBetHistory]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  // Round estimated time string
  const roundEstimatedTime = React.useMemo(() => {
    const est = new Date(Date.now() + remainingSeconds * 1000);
    const h = String(est.getHours()).padStart(2, '0');
    const m = String(est.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }, [remainingSeconds]);

  // Total active bets placed on current round
  const activeStakesTotal = placedBets.reduce((sum, b) => sum + b.amount, 0);

  // Perform round draw resolution with exact requested sequence:
  // - Row 1 (Numbers 1-6): Each number appears with an interval of 1,100ms
  // - Row 2 (Numbers 7-11): Each number appears with an interval of 1,100ms
  // - Row 3 (Final Result / Number 12): Appears 1,100ms after the last number of row 2
  // - Display of Winning Results: Remains on screen for 5,000ms before resetting
  const handleResolveRound = () => {
    if (isRevealing) return;

    if (isFinalCountdownActiveRef.current) {
      isFinalCountdownActiveRef.current = false;
      soundManager.stopKhmerCountdown();
    }

    // Clear previous timeouts if any
    revealTimeoutsRef.current.forEach(clearTimeout);
    revealTimeoutsRef.current = [];

    setIsRevealing(true);
    setRevealStep(0);
    setRevealedAnimal(null);

    // Pick winner: either forced by admin or fair RNG (1-12)
    let winnerNum: number;
    if (settings.forcedNextNumber !== null) {
      winnerNum = settings.forcedNextNumber;
      setSettings((prev) => ({ ...prev, forcedNextNumber: null }));
    } else {
      winnerNum = Math.floor(Math.random() * 12) + 1;
    }

    const winningAnimal = getAnimalByNumber(winnerNum);

    // Prepare 11 eliminated animals for bowls 1 to 11
    const nonWinning = YUKI_ANIMALS.filter((a) => a.number !== winnerNum);
    const shuffledNonWinning = [...nonWinning].sort(() => Math.random() - 0.5);
    setEliminatedBowls(shuffledNonWinning);

    const timeouts: NodeJS.Timeout[] = [];

    // Row 1 (Numbers 1-6): interval 1,100ms
    // Row 2 (Numbers 7-11): interval 1,100ms
    for (let step = 1; step <= 11; step++) {
      const delay = step * 1100;
      const t = setTimeout(() => {
        setRevealStep(step);
        soundManager.playBowlOpen(step);
      }, delay);
      timeouts.push(t);
    }

    // Row 3 (Final Result/Number 12): The final winning result appears 1,100ms after the last number of the second row
    // (11 * 1100) + 1100 = 12 * 1100 = 13,200 ms
    const finalDelay = 12 * 1100;
    const tFinal = setTimeout(() => {
      setRevealStep(12);
      setRevealedAnimal(winningAnimal);
      soundManager.playReveal();

      const now = new Date();
      const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newResult: RoundResult = {
        roundId: activeRoundId,
        roundNumber,
        timestamp: now.getTime(),
        formattedTime,
        winningNumber: winnerNum,
        animal: winningAnimal,
        color: winningAnimal.color,
        size: winningAnimal.size,
        parity: winningAnimal.parity,
        totalBetsPlaced: activeStakesTotal + 150000 + Math.floor(Math.random() * 200000),
        totalPayouts: 0,
      };

      // Calculate user winnings from placed bets
      let totalWinPayout = 0;
      const winningSlips: { label: string; amount: number; payout: number; odds: number }[] = [];

      placedBets.forEach((bet) => {
        let isWon = false;
        if (bet.betType === `number_${winnerNum}`) isWon = true;
        else if (bet.betType === 'small' && winningAnimal.size === 'small') isWon = true;
        else if (bet.betType === 'big' && winningAnimal.size === 'big') isWon = true;
        else if (bet.betType === 'odd' && winningAnimal.parity === 'odd') isWon = true;
        else if (bet.betType === 'even' && winningAnimal.parity === 'even') isWon = true;
        else if (bet.betType === 'red' && winningAnimal.color === 'red') isWon = true;
        else if (bet.betType === 'green' && winningAnimal.color === 'green') isWon = true;
        else if (bet.betType === 'blue' && winningAnimal.color === 'blue') isWon = true;

        const payout = isWon ? Math.round(bet.amount * bet.odds) : 0;
        if (isWon) {
          totalWinPayout += payout;
          winningSlips.push({
            label: bet.labelKhmer,
            amount: bet.amount,
            payout,
            odds: bet.odds,
          });
        }
      });

      newResult.totalPayouts = totalWinPayout;

      // Update user balance & transactions if won
      if (totalWinPayout > 0) {
        setUser((prev) => ({
          ...prev,
          balanceKHR: prev.balanceKHR + totalWinPayout,
        }));

        setTransactions((prev) => [
          {
            id: `tx_win_${Date.now()}`,
            type: 'bet_win',
            amount: totalWinPayout,
            status: 'completed',
            timestamp: now.getTime(),
            description: `ឈ្នះរង្វាន់វេន ${activeRoundId} (Won #${winnerNum} ${winningAnimal.khmerName})`,
            referenceId: activeRoundId,
          },
          ...prev,
        ]);

        soundManager.playWin();

        setTimeout(() => {
          setCelebrationWin({
            winningAnimal,
            totalWonAmount: totalWinPayout,
            winningSlips,
          });
        }, 800);
      }

      // Update Bet Slips History: mark pending slips of active round as won or not_won
      setUserBetHistory((prev) =>
        prev.map((item) => {
          if (item.roundId === activeRoundId && (item.status === 'pending' || item.status === undefined)) {
            let isWon = false;
            if (item.betType === `number_${winnerNum}`) isWon = true;
            else if (item.betType === 'small' && winningAnimal.size === 'small') isWon = true;
            else if (item.betType === 'big' && winningAnimal.size === 'big') isWon = true;
            else if (item.betType === 'odd' && winningAnimal.parity === 'odd') isWon = true;
            else if (item.betType === 'even' && winningAnimal.parity === 'even') isWon = true;
            else if (item.betType === 'red' && winningAnimal.color === 'red') isWon = true;
            else if (item.betType === 'green' && winningAnimal.color === 'green') isWon = true;
            else if (item.betType === 'blue' && winningAnimal.color === 'blue') isWon = true;

            const payout = isWon ? Math.round(item.amount * item.odds) : 0;
            return {
              ...item,
              won: isWon,
              payout,
              winningNumber: winnerNum,
              status: isWon ? 'won' : 'not_won',
            };
          }
          return item;
        })
      );

      setLastSettledResult(newResult);
      // Auto-update history result every row
      setRounds((prev) => [...prev, newResult]);
      setLastRoundBets(placedBets);
      setPlacedBets([]);
    }, finalDelay);
    timeouts.push(tFinal);

    // Display of Winning Results: Remains on screen for 5,000ms before resetting
    const resetDelay = finalDelay + 5000;
    const tReset = setTimeout(() => {
      setIsRevealing(false);
      setRevealStep(0);
      setRevealedAnimal(null);
      setEliminatedBowls([]);
      setRoundNumber((prev) => prev + 1);
      setRemainingSeconds(settings.roundDurationSeconds);
    }, resetDelay);
    timeouts.push(tReset);

    revealTimeoutsRef.current = timeouts;
  };

  // Track final 10-second Khmer audio countdown directly from user uploaded audio file
  const isFinalCountdownActiveRef = useRef<boolean>(false);

  useEffect(() => {
    if (remainingSeconds === 10 && !isRevealing && !settings.isPaused && !isFinalCountdownActiveRef.current) {
      isFinalCountdownActiveRef.current = true;
      soundManager.startKhmerCountdown(
        (figure) => {
          setRemainingSeconds(figure);
        },
        () => {
          isFinalCountdownActiveRef.current = false;
          handleResolveRound();
        }
      );
    } else if (remainingSeconds > 10 || isRevealing || settings.isPaused) {
      if (isFinalCountdownActiveRef.current) {
        isFinalCountdownActiveRef.current = false;
        soundManager.stopKhmerCountdown();
      }
    }
  }, [remainingSeconds, isRevealing, settings.isPaused]);

  // Timer countdown loop (runs when remainingSeconds > 10)
  useEffect(() => {
    if (settings.isPaused || isRevealing || remainingSeconds <= 10) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 10) {
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.isPaused, isRevealing, remainingSeconds, activeRoundId, settings.forcedNextNumber]);

  // Handle Bet placement - Closed to new bets when only 10 seconds remain
  const handlePlaceBet = (
    betType: BetType,
    odds: number,
    labelKhmer: string,
    labelEnglish: string,
    customAmount?: number
  ) => {
    if (isRevealing || remainingSeconds <= 10) {
      soundManager.playCountdownTick(true);
      return;
    }

    const betAmount = customAmount ?? selectedChip;

    if (user.balanceKHR < betAmount) {
      soundManager.playCountdownTick(true);
      setActiveTab('wallet');
      return;
    }

    // Deduct user balance
    setUser((prev) => ({
      ...prev,
      balanceKHR: prev.balanceKHR - betAmount,
    }));

    const now = Date.now();
    const slipId = `slip_${now}_${Math.random().toString(36).substring(2, 6)}`;

    // Add to active placed bets
    setPlacedBets((prev) => {
      const existingIdx = prev.findIndex((b) => b.betType === betType);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newAmt = existing.amount + betAmount;
        updated[existingIdx] = {
          ...existing,
          amount: newAmt,
          potentialPayout: Math.round(newAmt * odds),
        };
        return updated;
      }

      const newBet: PlacedBet = {
        id: slipId,
        betType,
        amount: betAmount,
        potentialPayout: Math.round(betAmount * odds),
        odds,
        roundId: activeRoundId,
        timestamp: now,
        labelKhmer,
        labelEnglish,
      };
      return [...prev, newBet];
    });

    // Save directly to Bet Slips History immediately
    const newBetSlip: UserBetHistoryItem = {
      id: slipId,
      roundId: activeRoundId,
      roundNumber,
      timestamp: now,
      betType,
      labelKhmer,
      labelEnglish,
      amount: betAmount,
      odds,
      won: false,
      payout: 0,
      status: 'pending',
    };
    setUserBetHistory((prev) => [newBetSlip, ...prev]);
  };

  // Clear active bets and refund balance
  const handleClearBets = () => {
    if (placedBets.length === 0 || remainingSeconds <= 10 || isRevealing) return;
    const totalRefund = placedBets.reduce((sum, b) => sum + b.amount, 0);
    setUser((prev) => ({
      ...prev,
      balanceKHR: prev.balanceKHR + totalRefund,
    }));
    setPlacedBets([]);
    // Remove pending slips of active round from Bet Slips History
    setUserBetHistory((prev) =>
      prev.filter((item) => !(item.roundId === activeRoundId && item.status === 'pending'))
    );
  };

  // Double active bets if balance permits
  const handleDoubleBets = () => {
    if (placedBets.length === 0 || remainingSeconds <= 10 || isRevealing) return;
    const additionalNeeded = placedBets.reduce((sum, b) => sum + b.amount, 0);
    if (user.balanceKHR < additionalNeeded) {
      soundManager.playCountdownTick(true);
      return;
    }

    setUser((prev) => ({
      ...prev,
      balanceKHR: prev.balanceKHR - additionalNeeded,
    }));

    setPlacedBets((prev) =>
      prev.map((b) => ({
        ...b,
        amount: b.amount * 2,
        potentialPayout: Math.round(b.amount * 2 * b.odds),
      }))
    );

    // Double amount in Bet Slips History for pending slips of this round
    setUserBetHistory((prev) =>
      prev.map((item) =>
        item.roundId === activeRoundId && item.status === 'pending'
          ? { ...item, amount: item.amount * 2 }
          : item
      )
    );
  };

  // Rebet from last round
  const handleRebet = () => {
    if (lastRoundBets.length === 0 || remainingSeconds <= 10 || isRevealing) return;
    const totalRequired = lastRoundBets.reduce((sum, b) => sum + b.amount, 0);
    if (user.balanceKHR < totalRequired) {
      soundManager.playCountdownTick(true);
      return;
    }

    setUser((prev) => ({
      ...prev,
      balanceKHR: prev.balanceKHR - totalRequired,
    }));

    const now = Date.now();
    const newPlaced: PlacedBet[] = lastRoundBets.map((b) => ({
      ...b,
      id: `bet_${now}_${Math.random().toString(36).substring(2, 6)}`,
      roundId: activeRoundId,
      timestamp: now,
    }));
    setPlacedBets(newPlaced);

    // Save rebet slips immediately to Bet Slips History
    const newSlips: UserBetHistoryItem[] = newPlaced.map((b) => ({
      id: b.id,
      roundId: activeRoundId,
      roundNumber,
      timestamp: now,
      betType: b.betType,
      labelKhmer: b.labelKhmer,
      labelEnglish: b.labelEnglish,
      amount: b.amount,
      odds: b.odds,
      won: false,
      payout: 0,
      status: 'pending',
    }));
    setUserBetHistory((prev) => [...newSlips, ...prev]);
  };

  // Deposit simulation
  const handleDeposit = (amountKHR: number, method: string, note: string) => {
    setUser((prev) => ({
      ...prev,
      balanceKHR: prev.balanceKHR + amountKHR,
    }));

    setTransactions((prev) => [
      {
        id: `tx_dep_${Date.now()}`,
        type: 'deposit',
        amount: amountKHR,
        status: 'completed',
        timestamp: Date.now(),
        description: note,
        paymentMethod: method,
      },
      ...prev,
    ]);
  };

  // Withdrawal simulation
  const handleWithdraw = (
    amountKHR: number,
    bankName: string,
    accountNum: string,
    accountName: string
  ): boolean => {
    if (amountKHR > user.balanceKHR) return false;

    setUser((prev) => ({
      ...prev,
      balanceKHR: prev.balanceKHR - amountKHR,
    }));

    setTransactions((prev) => [
      {
        id: `tx_wd_${Date.now()}`,
        type: 'withdrawal',
        amount: amountKHR,
        status: 'pending', // Starts as pending for Admin review or auto-approval
        timestamp: Date.now(),
        description: `ដកប្រាក់ទៅកាន់ ${bankName} (${accountNum} - ${accountName})`,
        paymentMethod: bankName,
      },
      ...prev,
    ]);
    return true;
  };

  // Admin approvals
  const handleApproveWithdrawal = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'completed' } : t))
    );
  };

  const handleRejectWithdrawal = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (tx) {
      // Refund user balance
      setUser((prev) => ({
        ...prev,
        balanceKHR: prev.balanceKHR + tx.amount,
      }));
    }
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected' } : t))
    );
  };

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleCurrency = () => {
    // Currency strictly locked to Khmer Riel (KHR) as per requirements
    setUser((prev) => ({ ...prev, currency: 'KHR' }));
    setSelectedChip(10000);
  };

  return (
    <div className="min-h-screen bg-[#eaeff5] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        userBalanceKHR={user.balanceKHR}
        currency={user.currency}
        roundId={activeRoundId}
      />

      {/* Mobile view sub-tabs */}
      <div className="lg:hidden flex bg-white border-b border-slate-200 text-xs font-bold divide-x divide-slate-200">
        <button
          onClick={() => setMobileView('game')}
          className={`flex-1 py-2 text-center ${
            mobileView === 'game' ? 'bg-blue-600 text-white font-black' : 'text-slate-600'
          }`}
        >
          ថាសមាស & លទ្ធផល (Arena)
        </button>
        <button
          onClick={() => setMobileView('board')}
          className={`flex-1 py-2 text-center ${
            mobileView === 'board' ? 'bg-blue-600 text-white font-black' : 'text-slate-600'
          }`}
        >
          ផ្ទាំងភ្នាល់ (Bet Board)
        </button>
      </div>

      {/* Main Game Stage Area (Matching exact layout from user's screenshot) */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto p-1.5 sm:p-2.5 flex flex-col gap-2">
        {/* Desktop 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-1 items-start">
          {/* Left Column: Account & Recent Results (2.5 cols on desktop) */}
          <aside
            className={`lg:col-span-3 xl:col-span-2 self-start ${
              mobileView === 'game' ? 'block' : 'hidden lg:block'
            }`}
          >
            <LeftSidebar
              user={user}
              recentRounds={rounds}
              userBetHistory={userBetHistory}
              activeBetTotal={activeStakesTotal}
              activeBets={placedBets}
              onOpenWallet={() => setActiveTab('wallet')}
              onOpenStatement={() => setActiveTab('winloss')}
              onRefreshData={() => {
                setRounds(getStoredRounds());
                setUser(getStoredUser());
              }}
              currency={user.currency}
              onToggleCurrency={handleToggleCurrency}
              onQuickDeposit={(amt) => handleDeposit(amt, 'Quick Free Deposit', `ដាក់ប្រាក់រហ័សឥតគិតថ្លៃ +${amt.toLocaleString()}៛`)}
            />
          </aside>

          {/* Center + Right Master Section: Starts under new result & bet place, spans entire 9-10 columns */}
          <div className="lg:col-span-9 xl:col-span-10 flex flex-col gap-2 shrink-0">
            {/* Top Row: Center Arena (New Result) + Betting Board (Bet Place) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start shrink-0">
              {/* Center Column: Golden Bowls Arena (New Result) - Enlarged */}
              <section
                className={`lg:col-span-6 xl:col-span-6 flex flex-col ${
                  mobileView === 'game' ? 'flex' : 'hidden lg:flex'
                }`}
              >
                <div className="flex-1 h-full min-h-[300px]">
                  <CenterGoldenArena
                    isRevealing={isRevealing}
                    revealStep={revealStep}
                    revealedAnimal={revealedAnimal}
                    eliminatedBowls={eliminatedBowls}
                    activeRoundId={activeRoundId}
                    remainingSeconds={remainingSeconds}
                  />
                </div>
              </section>

              {/* Right Column: Betting Board (Bet Place) - Reduced */}
              <section
                className={`lg:col-span-6 xl:col-span-6 flex flex-col ${
                  mobileView === 'board' ? 'flex' : 'hidden lg:flex'
                }`}
              >
                <BettingBoard
                  remainingSeconds={remainingSeconds}
                  activeRoundId={activeRoundId}
                  roundEstimatedTime={roundEstimatedTime}
                  placedBets={placedBets}
                  onPlaceBet={handlePlaceBet}
                  isDrawInProgress={isRevealing}
                  lastSettledResult={lastSettledResult}
                  oddsConfig={{
                    smallBig: settings.smallBigOdds,
                    oddEven: settings.oddEvenOdds,
                    color: settings.colorOdds,
                    specificNumber: settings.specificNumberOdds,
                  }}
                  selectedChip={selectedChip}
                  onSelectChip={setSelectedChip}
                  currency={user.currency}
                  userBalanceKHR={user.balanceKHR}
                  onClearBets={handleClearBets}
                  onDoubleBets={handleDoubleBets}
                  onRebet={handleRebet}
                  canRebet={lastRoundBets.length > 0}
                  onTriggerDraw={handleResolveRound}
                />
              </section>
            </div>

            {/* Bottom Row: History Result Picture (Spanning from under new result until the end of the bet place) */}
            <section className="w-full">
              <Roadmaps rounds={rounds} />
            </section>
          </div>
        </div>
      </main>

      {/* MODALS */}
      {/* 1. Win/Loss Statement Modal */}
      {activeTab === 'winloss' && (
        <WinLossModal
          history={userBetHistory}
          currency={user.currency}
          onClose={() => setActiveTab('game')}
          onClearHistory={() => {
            setUserBetHistory([]);
            saveStoredBetHistory([]);
          }}
        />
      )}

      {/* 2. Past Draw Results Modal */}
      {activeTab === 'results' && (
        <ResultsModal
          rounds={rounds}
          onClose={() => setActiveTab('game')}
        />
      )}

      {/* 3. Wallet & Secure Transaction Modal */}
      {activeTab === 'wallet' && (
        <WalletModal
          user={user}
          transactions={transactions}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          onClose={() => setActiveTab('game')}
          currency={user.currency}
        />
      )}

      {/* 4. Admin Management Dashboard Modal */}
      {activeTab === 'admin' && (
        <AdminDashboard
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
          activeRoundId={activeRoundId}
          remainingSeconds={remainingSeconds}
          onForceDrawNow={handleResolveRound}
          placedBets={placedBets}
          allRounds={rounds}
          user={user}
          onUpdateUserBalance={(bal) => setUser((prev) => ({ ...prev, balanceKHR: bal }))}
          transactions={transactions}
          onApproveWithdrawal={handleApproveWithdrawal}
          onRejectWithdrawal={handleRejectWithdrawal}
          currency={user.currency}
          onClose={() => setActiveTab('game')}
        />
      )}

      {/* 5. Round Win Celebration Popup */}
      {celebrationWin && (
        <RoundWinCelebration
          winningAnimal={celebrationWin.winningAnimal}
          totalWonAmount={celebrationWin.totalWonAmount}
          winningSlips={celebrationWin.winningSlips}
          currency={user.currency}
          onClose={() => setCelebrationWin(null)}
        />
      )}
    </div>
  );
}
