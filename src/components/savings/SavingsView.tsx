import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SavingsGoal } from '../../types';
import {
  PiggyBank,
  PlusCircle,
  ArrowDownRight,
  ArrowUpRight,
  History,
  Target,
  Trash2,
  Edit,
  X,
  Lock,
} from 'lucide-react';

export const SavingsView: React.FC = () => {
  const {
    db,
    overview,
    addSavingsGoal,
    deleteSavingsGoal,
    setSelectedSavingsGoal,
    setIsSavingsModalOpen,
  } = useApp();

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('1000');
  const [currentAmount, setCurrentAmount] = useState('200');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  const sym = db.settings.currencySymbol;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseFloat(targetAmount) || 100;
    const c = parseFloat(currentAmount) || 0;
    if (!name.trim()) return;

    addSavingsGoal({
      name: name.trim(),
      targetAmount: t,
      currentAmount: c,
      deadline: deadline || undefined,
      notes: notes.trim() || undefined,
    });

    setIsAddGoalOpen(false);
    setName('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-purple-400" />
            Savings Vault & Reserves
          </h1>
          <p className="text-xs text-slate-400">
            Dedicated savings isolated from operational spending. Deposit or withdraw anytime.
          </p>
        </div>

        <button
          onClick={() => setIsAddGoalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/20 hover:bg-purple-500 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ New Savings Goal</span>
        </button>
      </div>

      {/* Top Banner: Total Vault Stash */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Total In Savings Vault
          </span>
          <p className="mt-2 font-mono text-3xl sm:text-4xl font-black text-white">
            {sym}{overview.savingsBalance.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Spread across {db.savingsGoals.length} distinct targets
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSavingsGoal(null);
            setIsSavingsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:bg-purple-500 active:scale-95 transition-all"
        >
          <ArrowDownRight className="h-4 w-4" />
          <span>Deposit / Withdraw Funds</span>
        </button>
      </div>

      {/* Goals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {db.savingsGoals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / Math.max(1, goal.targetAmount)) * 100));

          return (
            <div
              key={goal.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-5 hover:border-purple-500/30 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{goal.name}</h3>
                    {goal.deadline && (
                      <p className="text-[10px] text-slate-500 font-mono">Target: {goal.deadline}</p>
                    )}
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {pct}%
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-black text-white">
                    {sym}{goal.currentAmount.toLocaleString()}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    of {sym}{goal.targetAmount.toLocaleString()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {goal.notes && (
                  <p className="mt-3 text-xs text-slate-400 leading-relaxed italic">
                    "{goal.notes}"
                  </p>
                )}
              </div>

              {/* Card Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (confirm(`Delete savings goal "${goal.name}"?`)) {
                      deleteSavingsGoal(goal.id);
                    }
                  }}
                  className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    setSelectedSavingsGoal(goal);
                    setIsSavingsModalOpen(true);
                  }}
                  className="rounded-xl bg-purple-600/20 border border-purple-500/30 px-3 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-500/30"
                >
                  Manage Vault
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Savings Ledger History */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-purple-400" />
          <span>Savings Movements History</span>
        </h2>

        <div className="divide-y divide-slate-800/80">
          {db.savingsTransactions.slice(0, 8).map((txn) => (
            <div key={txn.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${txn.type === 'deposit' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {txn.type === 'deposit' ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                </div>
                <div>
                  <p className="font-bold text-white">{txn.savingsGoalName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{txn.date} {txn.notes && `• ${txn.notes}`}</p>
                </div>
              </div>

              <span className={`font-mono font-bold ${txn.type === 'deposit' ? 'text-purple-300' : 'text-amber-400'}`}>
                {txn.type === 'deposit' ? '+' : '-'}{sym}{txn.amount}
              </span>
            </div>
          ))}
          {db.savingsTransactions.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-500">No savings movements recorded yet.</p>
          )}
        </div>
      </div>

      {/* ADD GOAL MODAL */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddGoalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white">Create Savings Goal</h2>
              <button onClick={() => setIsAddGoalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Studio Camera Setup"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Amount ({sym}) *</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Saved ({sym})</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 font-mono text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deadline (Optional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Purpose of this fund"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-purple-600 py-2.5 font-bold text-white hover:bg-purple-500"
              >
                Create Savings Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
