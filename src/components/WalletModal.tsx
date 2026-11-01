import React, { useState } from 'react';
import { UserAccount, WalletTransaction } from '../types/yuki';
import { soundManager } from '../utils/audio';

interface Props {
  user: UserAccount;
  transactions: WalletTransaction[];
  onDeposit: (amountKHR: number, method: string, note: string) => void;
  onWithdraw: (amountKHR: number, bankName: string, accountNum: string, accountName: string) => boolean;
  onClose: () => void;
  currency: 'KHR' | 'USD';
}

export const WalletModal: React.FC<Props> = ({
  user,
  transactions,
  onDeposit,
  onWithdraw,
  onClose,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'voucher' | 'history'>('deposit');

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(500000);
  const [depositMethod, setDepositMethod] = useState<string>('Free Instant Top-Up');
  const [showQR, setShowQR] = useState<boolean>(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [withdrawBank, setWithdrawBank] = useState<string>('ABA Bank');
  const [accountNumber, setAccountNumber] = useState<string>('001 882 910');
  const [accountHolder, setAccountHolder] = useState<string>('CHANNARA VIP');
  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);

  // Voucher Form State
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);

  const formatMoney = (khr: number) => {
    return `${khr.toLocaleString()} ៛`;
  };

  // Instant Free Deposit without paying
  const handleInstantQuickDeposit = (amount: number, methodLabel = 'Free Instant Top-Up') => {
    if (amount <= 0) return;
    soundManager.playWin();
    onDeposit(amount, methodLabel, `ដាក់ប្រាក់ភ្លាមៗដោយឥតគិតថ្លៃ +${amount.toLocaleString()}៛`);
    setShowQR(false);
    setDepositSuccessMsg(`🎉 ជោគជ័យ! បានបញ្ចូលទឹកប្រាក់ចំនួន +${formatMoney(amount)} ដោយឥតគិតថ្លៃ!`);
    setTimeout(() => {
      setDepositSuccessMsg(null);
    }, 3500);
  };

  const handleProcessWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) {
      setWithdrawStatus('សូមបញ្ចូលចំនួនទឹកប្រាក់ត្រឹមត្រូវ');
      return;
    }
    if (withdrawAmount > user.balanceKHR) {
      setWithdrawStatus('សមតុល្យមិនគ្រប់គ្រាន់សម្រាប់ការដកប្រាក់ឡើយ');
      return;
    }

    const success = onWithdraw(withdrawAmount, withdrawBank, accountNumber, accountHolder);
    if (success) {
      soundManager.playClick();
      setWithdrawStatus('សំណើដកប្រាក់ត្រូវបានបញ្ជូនដោយជោគជ័យ! ប្រព័ន្ធកំពុងដំណើរការ។');
      setTimeout(() => {
        setActiveTab('history');
      }, 1200);
    }
  };

  const handleClaimVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    if (code === 'YUKI2026' || code === 'LUCKY888' || code === 'VIP999' || code === 'FREE10M') {
      const bonus =
        code === 'FREE10M'
          ? 10000000
          : code === 'VIP999'
          ? 500000
          : code === 'LUCKY888'
          ? 200000
          : 100000;
      soundManager.playWin();
      onDeposit(bonus, 'Voucher Code', `បញ្ចូលកូដប្រាក់រង្វាន់: ${code}`);
      setVoucherMessage(`ជោគជ័យ! អ្នកទទួលបានប្រាក់បន្ថែម +${formatMoney(bonus)}`);
      setVoucherCode('');
      setTimeout(() => {
        setActiveTab('history');
      }, 1500);
    } else {
      soundManager.playCountdownTick(true);
      setVoucherMessage('កូដប្រាក់រង្វាន់មិនត្រឹមត្រូវ (សាកល្បង: FREE10M, YUKI2026, LUCKY888, VIP999)');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <div>
              <h2
                className="text-lg font-black tracking-tight"
                style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
              >
                កាបូបប្រាក់ & ដាក់ប្រាក់ឥតគិតថ្លៃ (Wallet & Free Deposit)
              </h2>
              <p className="text-xs text-emerald-100">
                ដាក់ប្រាក់បានច្រើនតាមចិត្តដោយមិនបាច់បង់ប្រាក់ពិតប្រាកដ (Deposit unlimited game balance without paying)
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

        {/* Balance Card Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border-b border-emerald-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold">សមតុល្យបច្ចុប្បន្ន (Current Balance)</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
              {formatMoney(user.balanceKHR)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Account Code: <span className="font-bold text-slate-700">{user.accountCode}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold border border-emerald-300">
              ✓ ដាក់ប្រាក់ឥតគិតថ្លៃ (Free Top-Up Active)
            </span>
            <span className="text-xs text-slate-500">Instant Game Credit</span>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'deposit'
                ? 'border-emerald-600 text-emerald-700 bg-white font-black'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            📥 ដាក់ប្រាក់ឥតគិតថ្លៃ (Deposit Free)
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'withdraw'
                ? 'border-emerald-600 text-emerald-700 bg-white font-black'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            📤 ដកប្រាក់ (Withdraw)
          </button>
          <button
            onClick={() => setActiveTab('voucher')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'voucher'
                ? 'border-emerald-600 text-emerald-700 bg-white font-black'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            🎁 កូដប្រាក់រង្វាន់ (Voucher)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 bg-white font-black'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            📜 ប្រវត្តិ ({transactions.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* Deposit Tab - Free Instant Deposit */}
          {activeTab === 'deposit' && (
            <div className="space-y-4">
              {/* Free Top-Up Banner */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-xl text-white shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">🎁</span>
                  <div>
                    <div
                      className="font-black text-sm sm:text-base leading-tight"
                      style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
                    >
                      ដាក់ប្រាក់លេងដោយឥតគិតថ្លៃ (Deposit More Without Pay)
                    </div>
                    <div className="text-[11px] text-emerald-100 mt-0.5">
                      អ្នកអាចបញ្ចូលទឹកប្រាក់បានច្រើនតាមចិត្តដោយមិនបាច់ចំណាយប្រាក់ពិតឡើយ!
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/20 font-black text-white border border-white/30 uppercase tracking-wide shrink-0">
                  FREE 100%
                </span>
              </div>

              {/* Success Notification */}
              {depositSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-black shadow-xs flex items-center justify-between animate-in fade-in duration-150">
                  <span>{depositSuccessMsg}</span>
                  <span className="text-sm">✨</span>
                </div>
              )}

              {/* 1-Click Instant Deposit Presets */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">
                  ចុចដាក់ប្រាក់ភ្លាមៗ (1-Click Instant Free Top-Up):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { amt: 50000, label: '+50,000 ៛' },
                    { amt: 100000, label: '+100,000 ៛' },
                    { amt: 500000, label: '+500,000 ៛' },
                    { amt: 1000000, label: '+1,000,000 ៛' },
                    { amt: 2000000, label: '+2,000,000 ៛' },
                    { amt: 5000000, label: '+5,000,000 ៛' },
                    { amt: 10000000, label: '+10,000,000 ៛' },
                    { amt: 50000000, label: '+50,000,000 ៛ (VIP)' },
                  ].map((item) => (
                    <button
                      key={item.amt}
                      type="button"
                      onClick={() => handleInstantQuickDeposit(item.amt)}
                      className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-300 text-emerald-900 font-mono font-black text-xs transition active:scale-95 shadow-xs flex items-center justify-center gap-1 group"
                      title={`ចុចដើម្បីបញ្ចូល ${item.label} ភ្លាមៗដោយមិនបាច់បង់ប្រាក់`}
                    >
                      <span className="text-emerald-600 group-hover:text-white font-black text-sm">+</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Free Deposit */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ឬ បញ្ចូលចំនួនទឹកប្រាក់តាមចិត្ត (Or Enter Custom Amount to Deposit):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1000"
                      step="10000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full text-base font-mono font-black border border-slate-300 rounded-xl p-2.5 pl-3 pr-10 focus:outline-emerald-500 bg-white"
                      placeholder="បញ្ចូលចំនួនប្រាក់..."
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">
                      ៛
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInstantQuickDeposit(depositAmount)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>⚡</span>
                    <span>ដាក់ប្រាក់ {formatMoney(depositAmount)} ភ្លាមៗ (Deposit Free)</span>
                  </button>
                </div>
              </div>

              {/* Optional Bank Simulator Mode */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">
                    វិធីសាស្ត្រគំរូធនាគារ (Simulated Bank Channel - Optional):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQR(!showQR)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    {showQR ? 'លាក់ QR កូដ (Hide QR)' : 'បង្ហាញ QR គំរូ (Show Sample QR)'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['ABA Pay KHQR', 'Wing Bank', 'ACLEDA ToanChet', 'TrueMoney', 'Bakong KHQR', 'Credit Card'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        setDepositMethod(method);
                        handleInstantQuickDeposit(depositAmount, method);
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold text-left transition ${
                        depositMethod === method
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-sm mb-0.5">🏦</div>
                      <div className="truncate">{method}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">បញ្ចូលភ្លាមៗ</div>
                    </button>
                  ))}
                </div>

                {showQR && (
                  <div className="mt-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col items-center text-center animate-in fade-in">
                    <div className="w-44 h-44 bg-white p-2 rounded-xl border-2 border-emerald-500 shadow-md flex flex-col items-center justify-center mb-2">
                      <div className="w-full bg-red-600 text-white font-black text-[10px] py-0.5 rounded uppercase tracking-wider mb-2">
                        KHQR • BAKONG DEMO
                      </div>
                      <div className="w-28 h-28 border-4 border-slate-900 p-2 grid grid-cols-4 gap-1">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-xs ${i % 2 === 0 ? 'bg-slate-900' : 'bg-transparent'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 mt-1">
                        {depositAmount.toLocaleString()} KHR (Demo)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInstantQuickDeposit(depositAmount, depositMethod)}
                      className="w-full max-w-xs py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition"
                    >
                      ✓ បញ្ចូលទឹកប្រាក់ភ្លាមៗដោយមិនបាច់បង់ប្រាក់
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleProcessWithdraw} className="space-y-4">
              {withdrawStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold border ${
                    withdrawStatus.includes('ជោគជ័យ')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {withdrawStatus}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ជ្រើសរើសធនាគារ (Receiving Bank):
                </label>
                <select
                  value={withdrawBank}
                  onChange={(e) => setWithdrawBank(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-emerald-500 font-bold"
                >
                  <option value="ABA Bank">ABA Bank (Advanced Bank of Asia)</option>
                  <option value="Wing Bank">Wing Bank Specialised</option>
                  <option value="ACLEDA Bank">ACLEDA Bank Plc.</option>
                  <option value="Canadia Bank">Canadia Bank</option>
                  <option value="Sathapana Bank">Sathapana Bank</option>
                  <option value="TrueMoney">TrueMoney Wallet</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    លេខគណនីធនាគារ (Account Number):
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-2.5 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ឈ្មោះម្ចាស់គណនី (Account Name):
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full text-xs uppercase font-bold border border-slate-300 rounded-lg p-2.5 focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    ចំនួនទឹកប្រាក់ដក (Withdraw Amount):
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(user.balanceKHR)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    ដកទាំងអស់ ({formatMoney(user.balanceKHR)})
                  </button>
                </div>
                <input
                  type="number"
                  required
                  min="10000"
                  max={user.balanceKHR}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  step="10000"
                  className="w-full text-sm font-mono border border-slate-300 rounded-lg p-2.5 focus:outline-emerald-500 font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  * ចំនួនដកអប្បបរមាគឺ 10,000 ៛ ($2.50)។ ដំណើរការដោយស្វ័យប្រវត្តិក្នុងរយៈពេល 1-3 នាទី។
                </span>
              </div>

              <button
                type="submit"
                disabled={user.balanceKHR <= 0 || withdrawAmount > user.balanceKHR}
                className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black shadow-lg transition active:scale-95"
              >
                ស្នើសុំដកប្រាក់ {formatMoney(withdrawAmount)} (Submit Withdrawal)
              </button>
            </form>
          )}

          {/* Voucher Tab */}
          {activeTab === 'voucher' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <span>🎟️</span>
                  <span>កូដប្រាក់រង្វាន់ឥតគិតថ្លៃ (Promo Voucher Codes):</span>
                </div>
                <p className="text-xs text-amber-800 mb-2">
                  បញ្ចូលកូដប្រាក់រង្វាន់ដើម្បីទទួលបានសមតុល្យលេងភ្លាមៗ:
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setVoucherCode('FREE10M')}
                    className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-mono font-bold text-amber-900 shadow-xs hover:bg-amber-100"
                  >
                    FREE10M (+10,000,000៛)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoucherCode('YUKI2026')}
                    className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-mono font-bold text-amber-900 shadow-xs hover:bg-amber-100"
                  >
                    YUKI2026 (+100,000៛)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoucherCode('LUCKY888')}
                    className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-mono font-bold text-amber-900 shadow-xs hover:bg-amber-100"
                  >
                    LUCKY888 (+200,000៛)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoucherCode('VIP999')}
                    className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-mono font-bold text-amber-900 shadow-xs hover:bg-amber-100"
                  >
                    VIP999 (+500,000៛)
                  </button>
                </div>
              </div>

              {voucherMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold border ${
                    voucherMessage.includes('ជោគជ័យ')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {voucherMessage}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="បញ្ចូលកូដនៅទីនេះ (Enter Code)..."
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="flex-1 text-sm font-mono uppercase font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleClaimVoucher}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs shadow-md transition active:scale-95"
                >
                  ទទួលយក (Claim)
                </button>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  មិនទាន់មានប្រតិបត្តិការនៅឡើយទេ (No transaction history)
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                          tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'bet_win'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {tx.type === 'deposit'
                          ? '📥'
                          : tx.type === 'bonus'
                          ? '🎁'
                          : tx.type === 'bet_win'
                          ? '🏆'
                          : '📤'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {tx.description}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(tx.timestamp).toLocaleString()} • {tx.paymentMethod || 'System'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs font-black font-mono ${
                          tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'bet_win'
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'bet_win' ? '+' : '-'}
                        {formatMoney(tx.amount)}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-emerald-700 font-bold">
            ✓ បញ្ចូលទឹកប្រាក់ដោយឥតគិតថ្លៃ 100% ភ្លាមៗ
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            រួចរាល់ (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
