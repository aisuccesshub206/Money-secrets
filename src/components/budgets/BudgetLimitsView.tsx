import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Save,
  CheckCircle,
  Sliders,
} from 'lucide-react';

export const BudgetLimitsView: React.FC = () => {
  const { overview, db, updateSettings } = useApp();
  const sym = db.settings.currencySymbol;

  const [dailyLimit, setDailyLimit] = useState((db.settings.dailySpendingLimit ?? 0).toString());
  const [weeklyLimit, setWeeklyLimit] = useState((db.settings.weeklySpendingLimit ?? 0).toString());
  const [monthlyLimit, setMonthlyLimit] = useState((db.settings.monthlySpendingLimit ?? 0).toString());
  const [foodLimit, setFoodLimit] = useState((db.settings.categorySpendingLimits['Food'] ?? 0).toString());
  const [transportLimit, setTransportLimit] = useState((db.settings.categorySpendingLimits['Transport'] ?? 0).toString());
  const [personalLimit, setPersonalLimit] = useState((db.settings.categorySpendingLimits['Personal / Myself'] ?? 0).toString());
  const [aiLimit, setAiLimit] = useState((db.settings.categorySpendingLimits['AI Tools'] ?? 0).toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      dailySpendingLimit: parseFloat(dailyLimit) || 0,
      weeklySpendingLimit: parseFloat(weeklyLimit) || 0,
      monthlySpendingLimit: parseFloat(monthlyLimit) || 0,
      categorySpendingLimits: {
        ...db.settings.categorySpendingLimits,
        Food: parseFloat(foodLimit) || 0,
        Transport: parseFloat(transportLimit) || 0,
        'Personal / Myself': parseFloat(personalLimit) || 0,
        'AI Tools': parseFloat(aiLimit) || 0,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  const getStatusBadge = (status: 'safe' | 'warning' | 'danger') => {
    if (status === 'danger') {
      return (
        <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
          <ShieldAlert className="h-3 w-3" /> EXCEEDED LIMIT
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
          <AlertTriangle className="h-3 w-3" /> APPROACHING LIMIT (&gt;80%)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
        <ShieldCheck className="h-3 w-3" /> SAFE TO SPEND
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Scale className="h-6 w-6 text-teal-400" />
          Spending Limits & Budgets
        </h1>
        <p className="text-xs text-slate-400">
          Strict spending guardrails: daily, weekly, monthly, and key category caps with real-time warning indicators.
        </p>
      </div>

      {/* OVERVIEW STATUS GAUGES (Daily, Weekly, Monthly) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Gauge */}
        <div className={`rounded-3xl border p-5 ${
          overview.dailyBudgetStatus === 'danger'
            ? 'border-rose-500/40 bg-rose-950/20'
            : overview.dailyBudgetStatus === 'warning'
            ? 'border-amber-500/40 bg-amber-950/20'
            : 'border-slate-800 bg-slate-900'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">Daily Spending</h2>
            {getStatusBadge(overview.dailyBudgetStatus)}
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-black text-white">
              {sym}{overview.dailySpent.toFixed(2)}
            </span>
            <span className="font-mono text-xs text-slate-400">
              Limit: {sym}{db.settings.dailySpendingLimit}
            </span>
          </div>

          <div className="mt-3 h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                overview.dailyBudgetStatus === 'danger'
                  ? 'bg-rose-500'
                  : overview.dailyBudgetStatus === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (overview.dailySpent / Math.max(1, db.settings.dailySpendingLimit)) * 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs">
            <span className="text-slate-400">Remaining today:</span>
            <span className={`font-mono font-bold ${overview.dailyBudgetRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {overview.dailyBudgetRemaining >= 0
                ? `${sym}${overview.dailyBudgetRemaining.toFixed(2)} left`
                : `Exceeded by ${sym}${Math.abs(overview.dailyBudgetRemaining).toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Weekly Gauge */}
        <div className={`rounded-3xl border p-5 ${
          overview.weeklyBudgetStatus === 'danger'
            ? 'border-rose-500/40 bg-rose-950/20'
            : overview.weeklyBudgetStatus === 'warning'
            ? 'border-amber-500/40 bg-amber-950/20'
            : 'border-slate-800 bg-slate-900'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">Weekly Spending</h2>
            {getStatusBadge(overview.weeklyBudgetStatus)}
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-black text-white">
              {sym}{overview.weeklySpent.toFixed(2)}
            </span>
            <span className="font-mono text-xs text-slate-400">
              Limit: {sym}{db.settings.weeklySpendingLimit}
            </span>
          </div>

          <div className="mt-3 h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                overview.weeklyBudgetStatus === 'danger'
                  ? 'bg-rose-500'
                  : overview.weeklyBudgetStatus === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (overview.weeklySpent / Math.max(1, db.settings.weeklySpendingLimit)) * 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs">
            <span className="text-slate-400">Remaining this week:</span>
            <span className={`font-mono font-bold ${overview.weeklyBudgetRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {overview.weeklyBudgetRemaining >= 0
                ? `${sym}${overview.weeklyBudgetRemaining.toFixed(2)} left`
                : `Exceeded by ${sym}${Math.abs(overview.weeklyBudgetRemaining).toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Monthly Gauge */}
        <div className={`rounded-3xl border p-5 ${
          overview.monthlyBudgetStatus === 'danger'
            ? 'border-rose-500/40 bg-rose-950/20'
            : overview.monthlyBudgetStatus === 'warning'
            ? 'border-amber-500/40 bg-amber-950/20'
            : 'border-slate-800 bg-slate-900'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">Monthly Spending</h2>
            {getStatusBadge(overview.monthlyBudgetStatus)}
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-black text-white">
              {sym}{overview.monthlySpent.toFixed(2)}
            </span>
            <span className="font-mono text-xs text-slate-400">
              Budget: {sym}{db.settings.monthlySpendingLimit}
            </span>
          </div>

          <div className="mt-3 h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                overview.monthlyBudgetStatus === 'danger'
                  ? 'bg-rose-500'
                  : overview.monthlyBudgetStatus === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (overview.monthlySpent / Math.max(1, db.settings.monthlySpendingLimit)) * 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs">
            <span className="text-slate-400">Remaining this month:</span>
            <span className={`font-mono font-bold ${overview.monthlyBudgetRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {overview.monthlyBudgetRemaining >= 0
                ? `${sym}${overview.monthlyBudgetRemaining.toFixed(2)} left`
                : `Exceeded by ${sym}${Math.abs(overview.monthlyBudgetRemaining).toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {/* EDIT BUDGET CAPS FORM */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-teal-400" />
            <h2 className="text-sm font-bold text-white">Configure Spending Caps</h2>
          </div>
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 animate-in fade-in">
              <CheckCircle className="h-4 w-4" /> Limits Updated!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveLimits} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Limit ({sym})
              </label>
              <input
                type="number"
                step="any"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm font-mono text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Weekly Limit ({sym})
              </label>
              <input
                type="number"
                step="any"
                value={weeklyLimit}
                onChange={(e) => setWeeklyLimit(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm font-mono text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Limit ({sym})
              </label>
              <input
                type="number"
                step="any"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm font-mono text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Caps */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Category Spending Limits
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Food / Day ({sym})</label>
                <input
                  type="number"
                  value={foodLimit}
                  onChange={(e) => setFoodLimit(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Transport / Day ({sym})</label>
                <input
                  type="number"
                  value={transportLimit}
                  onChange={(e) => setTransportLimit(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Personal / Day ({sym})</label>
                <input
                  type="number"
                  value={personalLimit}
                  onChange={(e) => setPersonalLimit(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">AI Tools / Mo ({sym})</label>
                <input
                  type="number"
                  value={aiLimit}
                  onChange={(e) => setAiLimit(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-teal-400 active:scale-95 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Save Spending Limits</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
