import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, PiggyBank, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';

export const SavingsDepositModal: React.FC = () => {
  const {
    isSavingsModalOpen,
    setIsSavingsModalOpen,
    selectedSavingsGoal,
    setSelectedSavingsGoal,
    transactSavings,
    db,
  } = useApp();

  const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');
  const [goalId, setGoalId] = useState<string>('');
  const [amount, setAmount] = useState<string>('50');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (selectedSavingsGoal) {
      setGoalId(selectedSavingsGoal.id);
    } else if (db.savingsGoals.length > 0 && !goalId) {
      setGoalId(db.savingsGoals[0].id);
    }
  }, [selectedSavingsGoal, db.savingsGoals]);

  if (!isSavingsModalOpen) return null;

  const currentGoal = db.savingsGoals.find(g => g.id === goalId);
  const parsedAmount = parseFloat(amount) || 0;
  const sym = db.settings.currencySymbol;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId || parsedAmount <= 0) return;

    transactSavings(goalId, type, parsedAmount, notes.trim() || undefined);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsSavingsModalOpen(false);
      setSelectedSavingsGoal(null);
      setAmount('');
      setNotes('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={() => {
          setIsSavingsModalOpen(false);
          setSelectedSavingsGoal(null);
        }}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Savings Vault Action</h2>
              <p className="text-xs text-slate-400">Track money moved into or out of savings</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsSavingsModalOpen(false);
              setSelectedSavingsGoal(null);
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg shadow-purple-500/30">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <p className="mt-3 text-base font-bold text-white">Savings Updated!</p>
            <p className="text-xs text-purple-300">Goal and liquid balance updated accordingly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Deposit vs Withdraw tabs */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setType('deposit')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                  type === 'deposit'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownRight className="h-4 w-4" />
                Deposit to Savings
              </button>
              <button
                type="button"
                onClick={() => setType('withdraw')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                  type === 'withdraw'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                Withdraw
              </button>
            </div>

            {/* Target Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Savings Goal *</label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                {db.savingsGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({sym}{g.currentAmount} / {sym}{g.targetAmount})
                  </option>
                ))}
              </select>
            </div>

            {/* Current status display */}
            {currentGoal && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
                <div className="flex justify-between text-slate-400 mb-1.5">
                  <span>Current Saved:</span>
                  <span className="font-mono font-bold text-white">
                    {sym}{currentGoal.currentAmount} / {sym}{currentGoal.targetAmount}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (currentGoal.currentAmount / currentGoal.targetAmount) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Amount ({sym}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-purple-400 font-mono">
                  {sym}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-4 text-xl font-bold font-mono text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Notes</label>
              <input
                type="text"
                placeholder="e.g. Allocation from course sales"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full rounded-xl py-3 text-sm font-bold shadow-lg transition-all active:scale-[0.98] ${
                  type === 'deposit'
                    ? 'bg-purple-600 text-white shadow-purple-600/25 hover:bg-purple-500'
                    : 'bg-amber-600 text-white shadow-amber-600/25 hover:bg-amber-500'
                }`}
              >
                {type === 'deposit' ? '+ Move to Savings Vault' : '- Withdraw from Savings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
