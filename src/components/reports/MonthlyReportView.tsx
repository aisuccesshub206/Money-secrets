import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  Wallet,
  Receipt,
  Download,
} from 'lucide-react';

export const MonthlyReportView: React.FC = () => {
  const { db, overview } = useApp();
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  const sym = db.settings.currencySymbol;

  // Filter transactions for chosen month
  const monthIncomes = db.incomeTransactions.filter(t => t.date.startsWith(selectedMonth));
  const monthExpenses = db.expenseTransactions.filter(t => t.date.startsWith(selectedMonth));

  const totalIncome = monthIncomes.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // Buckets for this month
  const familySpent = monthExpenses.filter(e => e.bucket === 'Family').reduce((s, e) => s + e.amount, 0);
  const personalSpent = monthExpenses.filter(e => e.bucket === 'Myself').reduce((s, e) => s + e.amount, 0);
  const businessSpent = monthExpenses.filter(e => e.bucket === 'Business').reduce((s, e) => s + e.amount, 0);
  const aiSpent = monthExpenses.filter(e => e.category === 'AI Tools').reduce((s, e) => s + e.amount, 0);

  // Sales count this month
  const monthSales = db.courseSales.filter(s => s.date.startsWith(selectedMonth));
  const totalCourseSalesCount = monthSales.length;

  // Averages
  const daysInMonth = 30;
  const avgDailySpending = Math.round(totalExpenses / daysInMonth);
  const avgWeeklyIncome = Math.round((totalIncome / daysInMonth) * 7);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
            Monthly Executive Business Report
          </h1>
          <p className="text-xs text-slate-400">
            Comprehensive financial review, sales leaders, and budget performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
          />

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT SHEET */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-10 text-slate-100 shadow-2xl print:border-none print:bg-white print:text-black">
        {/* Report Top Header */}
        <div className="border-b border-slate-800 pb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-emerald-400">XirfadoNet</span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">Confidential Owner Report</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2">
              Monthly Financial Statement: {selectedMonth}
            </h2>
            <p className="text-xs text-slate-400">
              Prepared for: {db.settings.ownerName} • Currency: {db.settings.currency} ({sym})
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono">Date Generated:</span>
            <p className="font-mono text-xs font-bold text-slate-300">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* 1. Core High-Level P&L Summary */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            1. Profit & Loss Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[11px] text-slate-400 uppercase">Total Income</p>
              <p className="font-mono text-2xl font-black text-emerald-400 mt-1">
                {sym}{totalIncome.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[11px] text-slate-400 uppercase">Total Expenses</p>
              <p className="font-mono text-2xl font-black text-rose-400 mt-1">
                {sym}{totalExpenses.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[11px] text-slate-400 uppercase">Net Monthly Profit</p>
              <p className="font-mono text-2xl font-black text-cyan-400 mt-1">
                {sym}{netProfit.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[11px] text-slate-400 uppercase">Total Course Sales</p>
              <p className="font-mono text-2xl font-black text-white mt-1">
                {totalCourseSalesCount} <span className="text-xs text-slate-400 font-normal">units</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. Course Sales & Best-Sellers */}
        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            2. Course Sales & Best Performers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                <Award className="h-4 w-4" />
                <span>Best-Selling Course</span>
              </div>
              <p className="text-base font-bold text-white">
                {overview.topCourse?.title || 'None'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {overview.topCourse?.salesCount || 0} units sold • {sym}{overview.topCourse?.revenue || 0} total volume
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-1">
                <TrendingUp className="h-4 w-4" />
                <span>Weekly & Daily Inflow Run-Rates</span>
              </div>
              <p className="text-xs text-slate-300">
                Average Daily Spending: <strong className="font-mono text-rose-400">{sym}{avgDailySpending}/day</strong>
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Average Weekly Revenue: <strong className="font-mono text-emerald-400">{sym}{avgWeeklyIncome}/week</strong>
              </p>
            </div>
          </div>
        </div>

        {/* 3. Spending Segregation Breakdown */}
        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            3. Spending Segregation & Tool Costs
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5">
              <p className="text-[11px] text-slate-400">Family Support</p>
              <p className="font-mono text-lg font-bold text-amber-400 mt-1">{sym}{familySpent}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5">
              <p className="text-[11px] text-slate-400">Personal / Myself</p>
              <p className="font-mono text-lg font-bold text-blue-400 mt-1">{sym}{personalSpent}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5">
              <p className="text-[11px] text-slate-400">Business Costs</p>
              <p className="font-mono text-lg font-bold text-emerald-400 mt-1">{sym}{businessSpent}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5">
              <p className="text-[11px] text-slate-400">AI Tool Subscriptions</p>
              <p className="font-mono text-lg font-bold text-cyan-400 mt-1">{sym}{aiSpent}</p>
            </div>
          </div>
        </div>

        {/* 4. Budget & Savings Health Check */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            4. Capital Reserves & Budget Performance
          </h3>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Savings Vault Reserves:</span>
              <span className="font-mono font-bold text-purple-400">{sym}{overview.savingsBalance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Planned Monthly Spending Cap:</span>
              <span className="font-mono font-bold text-slate-300">{sym}{db.settings.monthlySpendingLimit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Budget Headroom Remaining:</span>
              <span className="font-mono font-bold text-emerald-400">{sym}{overview.monthlyBudgetRemaining}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-4 flex justify-between text-[10px] text-slate-500">
          <span>XirfadoNet Owner Operating System • Private & Proprietary</span>
          <span>Verified by Owner Dashboard</span>
        </div>
      </div>
    </div>
  );
};
