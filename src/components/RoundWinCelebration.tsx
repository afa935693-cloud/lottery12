import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AnimalCard } from '../types/yuki';
import { soundManager } from '../utils/audio';

interface Props {
  winningAnimal: AnimalCard;
  totalWonAmount: number;
  winningSlips: { label: string; amount: number; payout: number; odds: number }[];
  currency: 'KHR' | 'USD';
  onClose: () => void;
}

export const RoundWinCelebration: React.FC<Props> = ({
  winningAnimal,
  totalWonAmount,
  winningSlips,
  currency,
  onClose,
}) => {
  useEffect(() => {
    soundManager.playWin();

    // Fire fireworks confetti
    try {
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#facc15', '#38bdf8', '#4ade80', '#f43f5e'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch {}
  }, []);

  const formatMoney = (khr: number) => {
    return `${khr.toLocaleString()} ៛`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 border-2 border-yellow-400 rounded-3xl p-6 text-center text-white shadow-[0_0_50px_rgba(250,204,21,0.5)] overflow-hidden">
        {/* Glow halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Big Trophy and Animal badge */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider mb-3 shadow-lg">
            🎉 អបអរសាទរអ្នកបានឈ្នះរង្វាន់! (CONGRATULATIONS!)
          </div>

          <div
            className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center shadow-2xl my-2 border-4 border-yellow-300 relative animate-bounce overflow-hidden"
            style={{
              backgroundColor:
                winningAnimal.color === 'red'
                  ? '#dc2626'
                  : winningAnimal.color === 'green'
                  ? '#16a34a'
                  : '#1d4ed8',
            }}
          >
            {winningAnimal.image ? (
              <img
                src={winningAnimal.image}
                alt={winningAnimal.khmerName}
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <span className="text-4xl">{winningAnimal.iconSymbol}</span>
                <div className="flex items-center gap-1 font-['Orbitron',sans-serif] font-black text-xl">
                  #{winningAnimal.number}
                </div>
              </>
            )}
          </div>

          <h3
            className="text-xl font-black text-amber-300 mt-1"
            style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
          >
            លេខ {winningAnimal.number} {winningAnimal.khmerName} ({winningAnimal.englishName})
          </h3>

          <div className="my-3 p-3 bg-white/10 rounded-2xl border border-white/20 w-full">
            <span className="text-xs text-yellow-200 font-bold block mb-0.5">
              ប្រាក់រង្វាន់សរុបដែលអ្នកទទួលបាន (TOTAL WIN):
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 drop-shadow-[0_2px_10px_rgba(52,211,153,0.5)]">
              +{formatMoney(totalWonAmount)}
            </div>
          </div>

          {/* Breakdown of winning bet slips */}
          <div className="w-full space-y-1.5 mb-5 max-h-36 overflow-y-auto pr-1">
            {winningSlips.map((slip, i) => (
              <div
                key={`win-slip-${i}`}
                className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-black/40 border border-white/10"
              >
                <div className="text-left">
                  <span className="font-bold text-slate-200">{slip.label}</span>
                  <span className="text-slate-400 text-[10px] ml-1.5">({slip.odds}x)</span>
                </div>
                <div className="font-mono font-black text-emerald-400">
                  +{formatMoney(slip.payout)}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wide shadow-xl transition transform active:scale-95"
          >
            💰 ប្រមូលប្រាក់រង្វាន់ (Collect Win)
          </button>
        </div>
      </div>
    </div>
  );
};
