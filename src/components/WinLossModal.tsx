import React from 'react';
import { UserBetHistoryItem } from '../types/yuki';

interface Props {
  history: UserBetHistoryItem[];
  currency: 'KHR' | 'USD';
  onClose: () => void;
  onClearHistory: () => void;
}

export const WinLossModal: React.FC<Props> = ({
  history,
  currency,
  onClose,
  onClearHistory,
}) => {
  const [filterType, setFilterType] = React.useState<'all' | 'won' | 'lost'>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const formatMoney = (khr: number) => {
    return `${khr.toLocaleString()} ៛`;
  };

  const filteredHistory = history.filter((item) => {
    if (filterType === 'won' && !item.won) return false;
    if (filterType === 'lost' && item.won) return false;
    if (searchTerm && !item.roundId.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalStaked = history.reduce((sum, item) => sum + item.amount, 0);
  const totalPayout = history.reduce((sum, item) => sum + item.payout, 0);
  const netProfit = totalPayout - totalStaked;
  const wonCount = history.filter((h) => h.won).length;
  const winRate = history.length > 0 ? ((wonCount / history.length) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <h2
                className="text-lg font-black tracking-tight"
                style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
              >
                របាយការណ៍ ឈ្នះ-ចាញ់ (Win/Loss Statement)
              </h2>
              <p className="text-xs text-blue-200">
                កំណត់ត្រាការភ្នាល់ និងប្រាក់ចំណេញខាតលម្អិត
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">ទឹកប្រាក់ភ្នាល់សរុប (Total Bet)</span>
            <div className="text-base sm:text-lg font-black text-slate-800 font-mono mt-0.5">
              {formatMoney(totalStaked)}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">ប្រាក់ឈ្នះសរុប (Total Won)</span>
            <div className="text-base sm:text-lg font-black text-emerald-600 font-mono mt-0.5">
              {formatMoney(totalPayout)}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">ចំណេញ/ខាតសុទ្ធ (Net Profit)</span>
            <div
              className={`text-base sm:text-lg font-black font-mono mt-0.5 ${
                netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {netProfit >= 0 ? `+${formatMoney(netProfit)}` : `-${formatMoney(Math.abs(netProfit))}`}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">អត្រាឈ្នះ (Win Rate)</span>
            <div className="text-base sm:text-lg font-black text-blue-600 font-mono mt-0.5">
              {winRate}% ({wonCount}/{history.length})
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ទាំងអស់ ({history.length})
            </button>
            <button
              onClick={() => setFilterType('won')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filterType === 'won'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ឈ្នះ ({wonCount})
            </button>
            <button
              onClick={() => setFilterType('lost')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filterType === 'lost'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ចាញ់ ({history.length - wonCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="ស្វែងរកតាម Round ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-blue-500 font-mono"
            />
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded hover:bg-rose-50"
              >
                លុបប្រវត្តិ
              </button>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <span className="text-3xl block mb-2">📜</span>
              <span>មិនមានទិន្នន័យភ្នាល់ត្រូវបង្ហាញឡើយ (No records found)</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Round ID</th>
                    <th className="py-2.5 px-3">ពេលវេលា (Time)</th>
                    <th className="py-2.5 px-3">ជម្រើសភ្នាល់ (Bet)</th>
                    <th className="py-2.5 px-3">មេគុណ (Odds)</th>
                    <th className="py-2.5 px-3">ប្រាក់ភ្នាល់ (Stake)</th>
                    <th className="py-2.5 px-3">លទ្ធផល (Result)</th>
                    <th className="py-2.5 px-3 text-right">ប្រាក់រង្វាន់ (Payout)</th>
                    <th className="py-2.5 px-3 text-center">ស្ថានភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {item.roundId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {item.labelKhmer}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                        {item.odds}x
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {formatMoney(item.amount)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-black px-2 py-0.5 rounded bg-slate-100 border text-slate-800">
                          #{item.winningNumber}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 font-mono font-black text-right ${
                          item.won ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {item.won ? `+${formatMoney(item.payout)}` : '0 ៛'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Pending
                          </span>
                        ) : item.won || item.status === 'won' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ឈ្នះ (Won)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            Not Won
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
