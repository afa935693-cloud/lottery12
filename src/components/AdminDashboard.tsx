import React, { useState } from 'react';
import { GameSettings, PlacedBet, RoundResult, UserAccount, WalletTransaction } from '../types/yuki';
import { YUKI_ANIMALS } from '../data/animals';
import { soundManager } from '../utils/audio';

interface Props {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  activeRoundId: string;
  remainingSeconds: number;
  onForceDrawNow: () => void;
  placedBets: PlacedBet[];
  allRounds: RoundResult[];
  user: UserAccount;
  onUpdateUserBalance: (newBalanceKHR: number) => void;
  transactions: WalletTransaction[];
  onApproveWithdrawal: (txId: string) => void;
  onRejectWithdrawal: (txId: string) => void;
  currency: 'KHR' | 'USD';
  onClose: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  activeRoundId,
  remainingSeconds,
  onForceDrawNow,
  placedBets,
  allRounds,
  user,
  onUpdateUserBalance,
  transactions,
  onApproveWithdrawal,
  onRejectWithdrawal,
  currency,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'session' | 'risk' | 'payouts' | 'users' | 'odds'>('session');
  const [bonusAmount, setBonusAmount] = useState<number>(500000);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const formatMoney = (khr: number) => {
    return `${khr.toLocaleString()} ៛`;
  };

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Calculate total stakes placed on current round
  const totalRoundStake = placedBets.reduce((sum, b) => sum + b.amount, 0);

  // Compute Risk Analysis for outcomes 1 to 12
  const outcomeProjections = YUKI_ANIMALS.map((animal) => {
    const num = animal.number;
    let totalPayoutIfDrawn = 0;

    placedBets.forEach((b) => {
      let isWon = false;
      if (b.betType === `number_${num}`) isWon = true;
      else if (b.betType === 'small' && animal.size === 'small') isWon = true;
      else if (b.betType === 'big' && animal.size === 'big') isWon = true;
      else if (b.betType === 'odd' && animal.parity === 'odd') isWon = true;
      else if (b.betType === 'even' && animal.parity === 'even') isWon = true;
      else if (b.betType === 'red' && animal.color === 'red') isWon = true;
      else if (b.betType === 'green' && animal.color === 'green') isWon = true;
      else if (b.betType === 'blue' && animal.color === 'blue') isWon = true;

      if (isWon) {
        totalPayoutIfDrawn += b.potentialPayout;
      }
    });

    const houseProfit = totalRoundStake - totalPayoutIfDrawn;

    return {
      animal,
      totalPayoutIfDrawn,
      houseProfit,
    };
  });

  // Calculate Platform Lifetime Stats
  const totalVolume = allRounds.reduce((sum, r) => sum + r.totalBetsPlaced, 0) + totalRoundStake;
  const totalPayoutsDistributed = allRounds.reduce((sum, r) => sum + r.totalPayouts, 0);
  const houseGrossRevenue = totalVolume - totalPayoutsDistributed;
  const houseMargin = totalVolume > 0 ? ((houseGrossRevenue / totalVolume) * 100).toFixed(2) : '5.20';

  // Filter pending withdrawal transactions
  const pendingWithdrawals = transactions.filter(
    (t) => t.type === 'withdrawal' && t.status === 'pending'
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1 bg-white/20 rounded-lg">⚙️</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight font-['Orbitron',sans-serif]">
                  ADMIN CONTROL DASHBOARD
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-mono font-bold">
                  MASTER PRIVILEGES
                </span>
              </div>
              <p className="text-xs text-amber-950/80 font-bold">
                គ្រប់គ្រងវេនហ្គេម ហានិភ័យការភ្នាល់ និងការទូទាត់ប្រាក់រង្វាន់ (Session, Risk & Payout Management)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 font-black flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Global Key Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-slate-400 font-medium">វេនបច្ចុប្បន្ន (Round)</span>
            <div className="text-base font-black text-amber-400 font-mono mt-0.5 flex items-center gap-2">
              <span>{activeRoundId}</span>
              <span className="text-xs text-rose-400">({remainingSeconds}s)</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-slate-400 font-medium">ការភ្នាល់សរុបវេននេះ (Current Bet)</span>
            <div className="text-base font-black text-cyan-400 font-mono mt-0.5">
              {formatMoney(totalRoundStake)} ({placedBets.length} slips)
            </div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-slate-400 font-medium">ចំណូលសរុប (Gross Gaming Rev)</span>
            <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
              {formatMoney(houseGrossRevenue)}
            </div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-slate-400 font-medium">House Edge / Margin</span>
            <div className="text-base font-black text-purple-400 font-mono mt-0.5">
              {houseMargin}% (RTP: {(100 - parseFloat(houseMargin)).toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 text-xs font-bold text-slate-300">
          <button
            onClick={() => setActiveTab('session')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'session'
                ? 'border-amber-400 text-amber-300 bg-slate-900 font-black'
                : 'border-transparent hover:bg-slate-900/50'
            }`}
          >
            🎯 គ្រប់គ្រងវេនហ្គេម (Game Sessions)
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'risk'
                ? 'border-amber-400 text-amber-300 bg-slate-900 font-black'
                : 'border-transparent hover:bg-slate-900/50'
            }`}
          >
            📊 វិភាគហានិភ័យភ្នាល់ (Live Risk & Bets)
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'payouts'
                ? 'border-amber-400 text-amber-300 bg-slate-900 font-black'
                : 'border-transparent hover:bg-slate-900/50'
            }`}
          >
            💸 ការទូទាត់ប្រាក់ (Payouts & Withdrawals)
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'users'
                ? 'border-amber-400 text-amber-300 bg-slate-900 font-black'
                : 'border-transparent hover:bg-slate-900/50'
            }`}
          >
            👥 គ្រប់គ្រងអ្នកលេង (Players & Balance)
          </button>
          <button
            onClick={() => setActiveTab('odds')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'odds'
                ? 'border-amber-400 text-amber-300 bg-slate-900 font-black'
                : 'border-transparent hover:bg-slate-900/50'
            }`}
          >
            ⚙️ កំណត់មេគុណ (Game Multipliers)
          </button>
        </div>

        {/* Toast alert */}
        {saveToast && (
          <div className="bg-emerald-500 text-slate-950 text-xs font-black px-4 py-2 text-center animate-in fade-in">
            ✓ {saveToast}
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: Game Sessions Control */}
          {activeTab === 'session' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    ពន្លឿនការចេញលទ្ធផលភ្លាមៗ (Instant Draw Trigger)
                  </h3>
                  <p className="text-xs text-slate-400">
                    មិនបាច់រង់ចាំកម្មវិធីកំណត់ម៉ោងផុតកំណត់ឡើយ។ ចុចដើម្បីបញ្ចប់វេននេះភ្លាមៗ។
                  </p>
                </div>
                <button
                  onClick={() => {
                    soundManager.playReveal();
                    onForceDrawNow();
                    showNotification('វេនត្រូវបានទាញយកលទ្ធផលភ្លាមៗ!');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg transition active:scale-95 flex items-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>ចេញលទ្ធផលឥឡូវនេះ (Draw Winner Now)</span>
                </button>
              </div>

              {/* Predetermined Outcome / Fair RNG Control */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      កំណត់លទ្ធផលវេនបន្ទាប់ (Predetermined Number / Fair RNG)
                    </h3>
                    <p className="text-xs text-slate-400">
                      អ្នកគ្រប់គ្រងអាចកំណត់លេខឈ្នះជាមុនសម្រាប់ការធ្វើតេស្ត ឬទុកជា Fair RNG ចៃដន្យ 100%។
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateSettings({ forcedNextNumber: null });
                      showNotification('បានប្តូរទៅជា Fair Random RNG (100% ចៃដន្យ)');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                      settings.forcedNextNumber === null
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    🎲 Fair Random RNG (100% យុត្តិធម៌)
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {YUKI_ANIMALS.map((a) => {
                    const isForced = settings.forcedNextNumber === a.number;
                    return (
                      <button
                        key={`force-opt-${a.number}`}
                        onClick={() => {
                          onUpdateSettings({ forcedNextNumber: a.number });
                          showNotification(`បានកំណត់លេខឈ្នះវេនបន្ទាប់ជា លេខ ${a.number} (${a.khmerName})`);
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-between transition ${
                          isForced
                            ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-lg scale-105 font-black ring-2 ring-amber-300'
                            : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-200'
                        }`}
                      >
                        <span className="text-xl">{a.iconSymbol}</span>
                        <div className="text-xs font-black mt-1 font-mono">#{a.number}</div>
                        <div className="text-[10px] opacity-80">{a.khmerName}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Round Duration */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <h3 className="text-sm font-bold text-white mb-1">
                  រយៈពេលរាប់ថយក្រោយក្នុងមួយវេន (Round Duration)
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  កំណត់ថេរវេលាដែលអនុញ្ញាតឱ្យអ្នកលេងដាក់ការភ្នាល់មុនពេលចាប់រង្វាន់។
                </p>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 60, 90, 120, 180].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        onUpdateSettings({ roundDurationSeconds: sec });
                        showNotification(`បានកែប្រែថេរវេលាវេនទៅជា ${sec} វិនាទី`);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition border ${
                        settings.roundDurationSeconds === sec
                          ? 'bg-blue-600 text-white border-blue-500 shadow'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {sec} វិនាទី ({sec}s)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Live Risk Analysis & Exposure */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    វិភាគហានិភ័យផលប៉ះពាល់ផ្ទាល់ (Live Risk Projection per Outcome)
                  </h3>
                  <p className="text-xs text-slate-400">
                    ប្រព័ន្ធគណនាប្រាក់ចំណេញខាតរបស់ម្ចាស់ផ្ទះ (House Profit/Loss) ប្រសិនបើលេខណាមួយចេញ។
                  </p>
                </div>
                <div className="text-xs font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                  Total Exposure: <span className="text-amber-400 font-bold">{formatMoney(totalRoundStake)}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="py-2.5 px-3">លេខ (No.)</th>
                      <th className="py-2.5 px-3">សត្វ (Zodiac)</th>
                      <th className="py-2.5 px-3">លក្ខណៈ (Attributes)</th>
                      <th className="py-2.5 px-3 text-right">ប្រាក់រង្វាន់ត្រូវបើក (Player Payout)</th>
                      <th className="py-2.5 px-3 text-right">ផលចំណេញផ្ទះ (House Net)</th>
                      <th className="py-2.5 px-3 text-center">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {outcomeProjections.map((item) => {
                      const isHouseWinner = item.houseProfit >= 0;
                      return (
                        <tr key={`risk-row-${item.animal.number}`} className="hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-mono font-black text-amber-400">
                            #{item.animal.number}
                          </td>
                          <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                            <span>{item.animal.iconSymbol}</span>
                            <span>{item.animal.khmerName}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-400 text-[11px]">
                            {item.animal.size === 'small' ? 'តូច' : 'ធំ'} •{' '}
                            {item.animal.color === 'red' ? 'ក្រហម' : item.animal.color === 'green' ? 'បៃតង' : 'ខៀវ'} •{' '}
                            {item.animal.parity === 'odd' ? 'សេស' : 'គូ'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-rose-400">
                            {formatMoney(item.totalPayoutIfDrawn)}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-mono font-black ${
                              isHouseWinner ? 'text-emerald-400' : 'text-rose-500'
                            }`}
                          >
                            {isHouseWinner ? `+${formatMoney(item.houseProfit)}` : `-${formatMoney(Math.abs(item.houseProfit))}`}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => {
                                onUpdateSettings({ forcedNextNumber: item.animal.number });
                                showNotification(`បានកំណត់លេខ #${item.animal.number} ជាលទ្ធផលឈ្នះ!`);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 transition"
                            >
                              ជ្រើសរើស (Pick #{item.animal.number})
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Payouts & Withdrawals */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <h3 className="text-sm font-bold text-white">
                  ការអនុម័តដកប្រាក់ & ប្រតិបត្តិការ (Withdrawal Approvals)
                </h3>
                <p className="text-xs text-slate-400">
                  ពិនិត្យផ្ទៀងផ្ទាត់ និងអនុម័តការដកប្រាក់របស់អ្នកលេងទៅកាន់ធនាគារក្នុងស្រុក។
                </p>
              </div>

              {pendingWithdrawals.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs bg-slate-800/40 rounded-xl border border-slate-800">
                  <span className="text-2xl block mb-1">✓</span>
                  មិនមានសំណើដកប្រាក់ដែលត្រូវរង់ចាំការអនុម័តឡើយ (All payouts settled)
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingWithdrawals.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{item.description}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          ID: {item.id} • {new Date(item.timestamp).toLocaleString()}
                        </div>
                        <div className="text-xs text-amber-300 font-mono mt-0.5">
                          Amount: {formatMoney(item.amount)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            soundManager.playWin();
                            onApproveWithdrawal(item.id);
                            showNotification('បានអនុម័តការទូទាត់ប្រាក់ជោគជ័យ!');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                        >
                          ✓ អនុម័ត (Approve Payout)
                        </button>
                        <button
                          onClick={() => {
                            onRejectWithdrawal(item.id);
                            showNotification('បានបដិសេធសំណើដកប្រាក់!');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                        >
                          ✕ បដិសេធ (Reject)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Users Management */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{user.avatar}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{user.username}</h3>
                      <p className="text-xs text-slate-400 font-mono">Code: {user.accountCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">សមតុល្យបច្ចុប្បន្ន</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">
                      {formatMoney(user.balanceKHR)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold">បញ្ចូលប្រាក់បន្ថែម (Credit Player):</span>
                  <input
                    type="number"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(Number(e.target.value))}
                    step="50000"
                    className="text-xs font-mono font-bold bg-slate-900 border border-slate-600 rounded-lg p-2 text-white w-36"
                  />
                  <button
                    onClick={() => {
                      soundManager.playWin();
                      onUpdateUserBalance(user.balanceKHR + bonusAmount);
                      showNotification(`បានបញ្ចូលប្រាក់បន្ថែម +${formatMoney(bonusAmount)} ទៅកាន់អ្នកលេង!`);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                  >
                    + បញ្ចូលទឹកប្រាក់ (Add Funds)
                  </button>
                  <button
                    onClick={() => {
                      onUpdateUserBalance(1000000);
                      showNotification('បានកំណត់សមតុល្យអ្នកលេងទៅជា 1,000,000 ៛!');
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition"
                  >
                    កំណត់ទៅជា 1M ៛
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Odds & Multipliers Configuration */}
          {activeTab === 'odds' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <h3 className="text-sm font-bold text-white">
                  កំណត់មេគុណសងប្រាក់រង្វាន់ (Payout Multipliers)
                </h3>
                <p className="text-xs text-slate-400">
                  អ្នកគ្រប់គ្រងអាចកែប្រែមេគុណសងសម្រាប់គ្រប់ប្រភេទនៃការភ្នាល់។
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    មេគុណ តូច / ធំ (Small / Big Odds):
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={settings.smallBigOdds}
                    onChange={(e) => onUpdateSettings({ smallBigOdds: Number(e.target.value) })}
                    className="w-full text-sm font-mono font-bold bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    មេគុណ សេស / គូ (Odd / Even Odds):
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={settings.oddEvenOdds}
                    onChange={(e) => onUpdateSettings({ oddEvenOdds: Number(e.target.value) })}
                    className="w-full text-sm font-mono font-bold bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    មេគុណ ពណ៌ ក្រហម/បៃតង/ខៀវ (Color Odds):
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={settings.colorOdds}
                    onChange={(e) => onUpdateSettings({ colorOdds: Number(e.target.value) })}
                    className="w-full text-sm font-mono font-bold bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    មេគុណ ចំលេខទោល 1-12 (Specific Number Odds):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={settings.specificNumberOdds}
                    onChange={(e) => onUpdateSettings({ specificNumberOdds: Number(e.target.value) })}
                    className="w-full text-sm font-mono font-bold bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition"
          >
            រួចរាល់ (Close Admin)
          </button>
        </div>
      </div>
    </div>
  );
};
