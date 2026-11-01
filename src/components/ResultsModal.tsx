import React from 'react';
import { RoundResult } from '../types/yuki';

interface Props {
  rounds: RoundResult[];
  onClose: () => void;
}

export const ResultsModal: React.FC<Props> = ({ rounds, onClose }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [colorFilter, setColorFilter] = React.useState<'all' | 'red' | 'green' | 'blue'>('all');
  const [sizeFilter, setSizeFilter] = React.useState<'all' | 'small' | 'big'>('all');

  const filteredRounds = rounds
    .filter((r) => {
      if (searchTerm && !r.roundId.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (colorFilter !== 'all' && r.color !== colorFilter) {
        return false;
      }
      if (sizeFilter !== 'all' && r.size !== sizeFilter) {
        return false;
      }
      return true;
    })
    .reverse();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <h2
                className="text-lg font-black tracking-tight"
                style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
              >
                ប្រវត្តិនៃលទ្ធផលចាប់រង្វាន់ (Draw Results History)
              </h2>
              <p className="text-xs text-blue-200">
                ពិនិត្យមើលលទ្ធផលគ្រប់វេន រួមទាំងលេខ សត្វ តូចធំ និងពណ៌
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

        {/* Filters */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Color filter */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <span className="text-slate-400 font-bold px-1">ពណ៌:</span>
              <button
                onClick={() => setColorFilter('all')}
                className={`px-2 py-0.5 rounded ${
                  colorFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600'
                }`}
              >
                ទាំងអស់
              </button>
              <button
                onClick={() => setColorFilter('red')}
                className={`px-2 py-0.5 rounded ${
                  colorFilter === 'red' ? 'bg-red-600 text-white font-bold' : 'text-slate-600'
                }`}
              >
                ក្រហម
              </button>
              <button
                onClick={() => setColorFilter('green')}
                className={`px-2 py-0.5 rounded ${
                  colorFilter === 'green' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
                }`}
              >
                បៃតង
              </button>
              <button
                onClick={() => setColorFilter('blue')}
                className={`px-2 py-0.5 rounded ${
                  colorFilter === 'blue' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
                }`}
              >
                ខៀវ
              </button>
            </div>

            {/* Size filter */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <span className="text-slate-400 font-bold px-1">ទំហំ:</span>
              <button
                onClick={() => setSizeFilter('all')}
                className={`px-2 py-0.5 rounded ${
                  sizeFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600'
                }`}
              >
                ទាំងអស់
              </button>
              <button
                onClick={() => setSizeFilter('small')}
                className={`px-2 py-0.5 rounded ${
                  sizeFilter === 'small' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-600'
                }`}
              >
                តូច (1-6)
              </button>
              <button
                onClick={() => setSizeFilter('big')}
                className={`px-2 py-0.5 rounded ${
                  sizeFilter === 'big' ? 'bg-pink-600 text-white font-bold' : 'text-slate-600'
                }`}
              >
                ធំ (7-12)
              </button>
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="ស្វែងរកតាម Round #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-blue-500 font-mono text-xs"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredRounds.map((round) => (
              <div
                key={`result-card-${round.roundId}`}
                className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="font-mono font-black text-blue-900 text-sm">
                    {round.roundId}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(round.timestamp).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded text-white ${
                        round.size === 'small' ? 'bg-[#00bcd4]' : 'bg-[#ec4899]'
                      }`}
                    >
                      {round.size === 'small' ? 'តូច' : 'ធំ'}
                    </span>
                    <span
                      className="text-[10px] font-black px-1.5 py-0.2 rounded text-white"
                      style={{
                        backgroundColor:
                          round.color === 'red'
                            ? '#dc2626'
                            : round.color === 'green'
                            ? '#16a34a'
                            : '#1d4ed8',
                      }}
                    >
                      {round.color === 'red' ? 'ក្រហម' : round.color === 'green' ? 'បៃតង' : 'ខៀវ'}
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                      {round.parity === 'odd' ? 'សេស' : 'គូ'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex flex-col items-center justify-center text-white shadow-md"
                    style={{
                      backgroundColor:
                        round.color === 'red'
                          ? '#dc2626'
                          : round.color === 'green'
                          ? '#16a34a'
                          : '#1d4ed8',
                    }}
                  >
                    <span className="text-sm">{round.animal.iconSymbol}</span>
                    <span className="text-xs font-black font-['Orbitron',sans-serif] leading-none">
                      {round.winningNumber}
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-black text-slate-700 mt-1"
                    style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
                  >
                    {round.animal.khmerName}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
