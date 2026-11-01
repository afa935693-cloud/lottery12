import React from 'react';
import { soundManager } from '../utils/audio';

interface Props {
  activeTab: 'game' | 'winloss' | 'results' | 'wallet' | 'admin';
  onChangeTab: (tab: 'game' | 'winloss' | 'results' | 'wallet' | 'admin') => void;
  isMuted: boolean;
  onToggleSound: () => void;
  userBalanceKHR: number;
  currency: 'KHR' | 'USD';
  roundId: string;
}

export const Header: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  isMuted,
  onToggleSound,
  userBalanceKHR,
  currency,
  roundId,
}) => {
  const formatBalance = (khr: number) => {
    return `${khr.toLocaleString()} ៛`;
  };

  return (
    <header className="w-full bg-[#5d7ec7] text-white shadow-md border-b border-blue-400 select-none">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2">
        {/* Left: Navigation Tabs (matching screenshot tabs: ត្នោត, ឈ្នះចាញ់, លទ្ធផល) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Logo / Brand badge */}
          <div className="flex items-center gap-1.5 mr-2 font-black text-sm sm:text-base tracking-wide bg-blue-900/40 px-2.5 py-1 rounded-lg border border-blue-300/40">
            <span className="text-amber-300 text-lg">✨</span>
            <span className="font-['Orbitron',sans-serif]">YUKI 12</span>
            <span className="text-[10px] text-amber-200 font-bold hidden sm:inline">យូគី ១២</span>
          </div>

          {/* Primary Navigation Tabs */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onChangeTab('game');
            }}
            className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1 ${
              activeTab === 'game'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-white/90 hover:bg-white/20'
            }`}
            style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
          >
            <span>ឆ្នោត</span>
            <span className="text-[10px] opacity-70 hidden md:inline">(Game)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onChangeTab('winloss');
            }}
            className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1 ${
              activeTab === 'winloss'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-white/90 hover:bg-white/20'
            }`}
            style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
          >
            <span>ឈ្នះចាញ់</span>
            <span className="text-[10px] opacity-70 hidden md:inline">(Win/Loss)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onChangeTab('results');
            }}
            className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1 ${
              activeTab === 'results'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-white/90 hover:bg-white/20'
            }`}
            style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
          >
            <span>លទ្ធផល</span>
            <span className="text-[10px] opacity-70 hidden md:inline">(Results)</span>
          </button>
        </div>

        {/* Right Tools: Admin Dashboard, Audio Toggle, Balance, Live Ping */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Quick Balance pill */}
          <div
            onClick={() => onChangeTab('wallet')}
            className="cursor-pointer bg-blue-950/40 hover:bg-blue-950/60 border border-blue-300/40 px-2 sm:px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1 text-emerald-300 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{formatBalance(userBalanceKHR)}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onToggleSound();
            }}
            className="p-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-900/60 text-white text-sm transition"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Admin Dashboard Button */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onChangeTab('admin');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border shadow-xs ${
              activeTab === 'admin'
                ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-md font-black'
                : 'bg-amber-500 hover:bg-amber-400 text-amber-950 border-amber-300'
            }`}
          >
            <span>⚙️</span>
            <span>គ្រប់គ្រង (Admin)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
