import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { evaluateCanIAffordThis } from '../../utils/calculations';
import {
  X,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingDown,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const CanIAffordThisModal: React.FC = () => {
  const { isAffordModalOpen, setIsAffordModalOpen, db } = useApp();
  const [amount, setAmount] = useState<string>('50');
  const [category, setCategory] = useState<string>('Personal / Myself');

  if (!isAffordModalOpen) return null;

  const parsedAmount = parseFloat(amount) || 0;
  const result = evaluateCanIAffordThis(parsedAmount, category, db);
  const sym = db.settings.currencySymbol;

  const quickAmounts = [10, 25, 50, 100, 200, 500];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={() => setIsAffordModalOpen(false)}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Can I Afford This?</h2>
              <p className="text-xs text-slate-400">Budgeting & spending sanity assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsAffordModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              I want to spend:
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-indigo-400 font-mono">
                {sym}
              </span>
              <input
                type="number"
                step="any"
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-4 text-2xl font-bold font-mono text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q.toString())}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium border transition-colors ${
                  parsedAmount === q
                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {sym}{q}
              </button>
            ))}
          </div>

          {/* Optional Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category (Optional)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="Personal / Myself">Personal / Myself</option>
              <option value="Family">Family Support</option>
              <option value="Food">Food / Dining</option>
              <option value="Transport">Transport</option>
              <option value="AI Tools">AI Tools & Tech</option>
              <option value="Business">Business Investment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* VERDICT CARD */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              result.status === 'safe'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : result.status === 'caution'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.status === 'safe' ? (
                <div className="rounded-xl bg-emerald-500 p-2 text-slate-950 shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : result.status === 'caution' ? (
                <div className="rounded-xl bg-amber-500 p-2 text-slate-950 shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              ) : (
                <div className="rounded-xl bg-rose-500 p-2 text-white shrink-0">
                  <XCircle className="h-6 w-6" />
                </div>
              )}

              <div>
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                    result.status === 'safe'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : result.status === 'caution'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {result.status === 'safe'
                    ? 'GREEN • APPROVED'
                    : result.status === 'caution'
                    ? 'ORANGE • CAUTION'
                    : 'RED • NOT RECOMMENDED'}
                </span>
                <h3 className="mt-1 text-sm font-bold text-white">{result.headline}</h3>
                <p className="mt-1 text-xs opacity-90 leading-relaxed">{result.message}</p>
              </div>
            </div>
          </div>

          {/* Detailed Financial Impact Breakdown */}
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
            <p className="font-semibold text-slate-300">Financial Impact Analysis:</p>
            
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Liquid Balance Remaining:</span>
              <span className={`font-mono font-bold ${result.availableBalanceAfter >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {sym}{result.availableBalanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Daily Budget ({sym}{result.dailyBudgetImpact.budget}/day):</span>
              <span className="font-mono text-slate-300">
                Spent {sym}{result.dailyBudgetImpact.afterSpend.toFixed(0)} of {sym}{result.dailyBudgetImpact.budget}
                {result.dailyBudgetImpact.exceedsBy ? (
                  <span className="text-rose-400 font-bold ml-1">(+{sym}{result.dailyBudgetImpact.exceedsBy.toFixed(0)} over)</span>
                ) : null}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Monthly Budget ({sym}{result.monthlyBudgetImpact.budget}/mo):</span>
              <span className="font-mono text-slate-300">
                {sym}{result.monthlyBudgetImpact.afterSpend.toFixed(0)} / {sym}{result.monthlyBudgetImpact.budget}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Upcoming AI Subscriptions:</span>
              <span className="font-mono text-cyan-400">
                {sym}{result.upcomingAIDueSoon}/mo recurring
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center italic">
            * This is a personal budgeting rule checker, not financial advisory advice.
          </p>
        </div>
      </div>
    </div>
  );
};
