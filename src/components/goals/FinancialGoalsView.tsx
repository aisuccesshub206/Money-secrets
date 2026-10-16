import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialGoal, GoalType } from '../../types';
import { Target, PlusCircle, Trash2, Edit, X, TrendingUp } from 'lucide-react';

export const FinancialGoalsView: React.FC = () => {
  const { db, overview, addFinancialGoal, deleteFinancialGoal } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('Monthly income');
  const [targetValue, setTargetValue] = useState('1500');
  const [currentValue, setCurrentValue] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  const sym = db.settings.currencySymbol;

  // Auto-connect dynamic live values where applicable
  const enrichedGoals = db.financialGoals.map((g) => {
    let dynamicCurrent = g.currentValue;
    if (g.type === 'Monthly income') dynamicCurrent = overview.incomeThisMonth;
    else if (g.type === 'Course sales') dynamicCurrent = overview.totalCourseUnitsSold;
    else if (g.type === 'Savings') dynamicCurrent = overview.savingsBalance;
    else if (g.type === 'Customers') dynamicCurrent = overview.totalCustomersCount;
    else if (g.type === 'Profit') dynamicCurrent = overview.netProfit;

    const progressPct = Math.min(100, Math.round((dynamicCurrent / Math.max(1, g.targetValue)) * 100));
    return {
      ...g,
      dynamicCurrent,
      progressPct,
    };
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseFloat(targetValue) || 1;
    const c = parseFloat(currentValue) || 0;
    if (!title.trim()) return;

    addFinancialGoal({
      title: title.trim(),
      type,
      targetValue: t,
      currentValue: c,
      unit: type === 'Course sales' ? 'sales' : type === 'Customers' ? 'students' : sym,
      deadline: deadline || undefined,
      notes: notes.trim() || undefined,
    });

    setIsAddOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-emerald-400" />
            Financial & Business Targets
          </h1>
          <p className="text-xs text-slate-400">
            Set ambitious targets for monthly income, course volume, client count, and profit margins.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Add Financial Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrichedGoals.map((goal) => {
          const isMoney = ['Monthly income', 'Savings', 'Profit'].includes(goal.type);

          return (
            <div
              key={goal.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-5 hover:border-emerald-500/30 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {goal.type}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{goal.title}</h3>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {goal.progressPct}%
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-black text-white">
                    {isMoney ? sym : ''}{goal.dynamicCurrent.toLocaleString()}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    Target: {isMoney ? sym : ''}{goal.targetValue.toLocaleString()} {goal.unit && !isMoney ? goal.unit : ''}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                    style={{ width: `${goal.progressPct}%` }}
                  />
                </div>

                {goal.notes && (
                  <p className="mt-3 text-xs text-slate-400 italic">
                    "{goal.notes}"
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  {goal.deadline ? `Due: ${goal.deadline}` : 'Continuous goal'}
                </span>
                <button
                  onClick={() => {
                    if (confirm(`Delete goal "${goal.title}"?`)) {
                      deleteFinancialGoal(goal.id);
                    }
                  }}
                  className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white">New Financial Goal</h2>
              <button onClick={() => setIsAddOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October Profit $1,000"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Goal Metric Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as GoalType)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                >
                  <option value="Monthly income">Monthly income ($)</option>
                  <option value="Course sales">Course sales (Count)</option>
                  <option value="Savings">Savings ($)</option>
                  <option value="Customers">Customers (Students)</option>
                  <option value="Profit">Net Profit ($)</option>
                  <option value="Business growth">Business growth</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Amount/Count *</label>
                <input
                  type="number"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deadline</label>
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
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-emerald-500 py-2.5 font-bold text-slate-950 hover:bg-emerald-400"
              >
                Save Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
