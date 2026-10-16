import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DateFilterRange, DateFilter } from '../../types';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BookOpen,
  Scale,
  PlusCircle,
  MinusCircle,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Globe,
  CheckCircle,
  Users,
  PiggyBank,
  ShoppingBag,
  Clock,
  PieChart,
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const {
    overview,
    db,
    t,
    language,
    setLanguage,
    dateFilter,
    setDateFilter,
    setIsIncomeModalOpen,
    setIsExpenseModalOpen,
    setIsCourseSaleModalOpen,
    setActiveTab,
  } = useApp();

  const sym = db.settings.currencySymbol;
  const isSomali = language === 'so';

  // Custom date range inputs
  const [showCustomRange, setShowCustomRange] = useState(dateFilter.range === 'custom');
  const [customStart, setCustomStart] = useState(dateFilter.startDate || '');
  const [customEnd, setCustomEnd] = useState(dateFilter.endDate || '');

  // Formatted date string in English or Somali
  const now = new Date();
  const dateFormatted = now.toLocaleDateString(language === 'so' ? 'so-SO' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Recent transactions list (last 6)
  const recentTransactions = [
    ...db.incomeTransactions.map(inc => ({ ...inc, kind: 'income' as const })),
    ...db.expenseTransactions.map(exp => ({ ...exp, kind: 'expense' as const })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const hasAnyTransactions = db.incomeTransactions.length > 0 || db.expenseTransactions.length > 0;
  const hasIncome = db.incomeTransactions.length > 0;
  const hasExpenses = db.expenseTransactions.length > 0;
  const hasCourses = db.courses.length > 0;
  const hasCourseSales = db.courseSales.length > 0;

  // Handle date filter change
  const handleRangeChange = (range: DateFilterRange) => {
    if (range === 'custom') {
      setShowCustomRange(true);
      setDateFilter({ range: 'custom', startDate: customStart, endDate: customEnd });
    } else {
      setShowCustomRange(false);
      setDateFilter({ range });
    }
  };

  const handleApplyCustom = () => {
    if (customStart || customEnd) {
      setDateFilter({ range: 'custom', startDate: customStart, endDate: customEnd });
    }
  };

  const filterOptions: { id: DateFilterRange; labelEn: string; labelSo: string }[] = [
    { id: 'today', labelEn: 'Today', labelSo: 'Maanta' },
    { id: '7days', labelEn: '7 Days', labelSo: '7 Maalmood' },
    { id: '30days', labelEn: '30 Days', labelSo: '30 Maalmood' },
    { id: '3months', labelEn: '3 Months', labelSo: '3 Bilood' },
    { id: '6months', labelEn: '6 Months', labelSo: '6 Bilood' },
    { id: '1year', labelEn: '1 Year', labelSo: '1 Sannad' },
    { id: 'all', labelEn: 'All Time', labelSo: 'Dhammaan' },
    { id: 'custom', labelEn: 'Custom', labelSo: 'Gaar ah' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP BAR: Welcome, Date, Language Selector & 2 Primary Quick Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t.welcome} {db.settings.ownerName || 'Ridwan'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>{dateFormatted}</span>
          </p>
        </div>

        {/* Controls: Language Selector & Primary Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Toggle: English | Soomaali */}
          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                language === 'en'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <span className="text-slate-700 px-0.5">|</span>
            <button
              onClick={() => setLanguage('so')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                language === 'so'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Soomaali
            </button>
          </div>

          {/* Quick Action: + Add Income */}
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t.addIncome}</span>
          </button>

          {/* Quick Action: + Add Expense */}
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/25 active:scale-95 transition-all"
          >
            <MinusCircle className="h-4 w-4" />
            <span>{t.addExpense}</span>
          </button>

          {/* Quick Action: Record Course Sale */}
          <button
            onClick={() => setIsCourseSaleModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25 active:scale-95 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isSomali ? '+ Iib Koorsada' : '+ Course Sale'}</span>
          </button>
        </div>
      </div>

      {/* 2. DATE FILTER BAR: Today, 7 Days, 30 Days, 3 Months, 6 Months, 1 Year, Custom */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-2.5">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider shrink-0">
            {isSomali ? 'Mudada:' : 'Range:'}
          </span>
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleRangeChange(opt.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                dateFilter.range === opt.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isSomali ? opt.labelSo : opt.labelEn}
            </button>
          ))}
        </div>

        {/* Custom date range inputs */}
        {showCustomRange && (
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
            />
            <span className="text-slate-500 text-xs">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
            />
            <button
              onClick={handleApplyCustom}
              className="rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Spending Limit Warning Banner (Only if daily limit is configured > 0 and exceeded) */}
      {overview.dailyLimitExceededAmount > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3 sm:p-4 text-rose-300 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                {t.limitExceeded} {sym}{overview.dailyLimitExceededAmount.toFixed(2)}.
              </p>
              <p className="text-xs text-rose-400">
                {t.spentToday}: {sym}{overview.dailySpent.toFixed(2)} / {sym}{db.settings.dailySpendingLimit.toFixed(2)}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="rounded-lg bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 shrink-0 ml-2"
          >
            {t.budgets}
          </button>
        </div>
      )}

      {/* 3. HERO SUMMARY CARDS: 4 Primary Financial Figures (Starting at $0 when empty) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Available Balance */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 p-5 shadow-lg shadow-emerald-950/10">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              {t.currentBalance}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-white">
            {sym}{overview.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {hasAnyTransactions
              ? `${db.incomeTransactions.length} in • ${db.expenseTransactions.length} out`
              : t.noTransactionsYet}
          </p>
        </div>

        {/* Card 2: Net Profit */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              {t.netProfit}
            </span>
            <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className={`mt-3 font-mono text-3xl font-extrabold ${overview.netProfit >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
            {sym}{overview.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {t.totalIncome}: {sym}{overview.totalIncome.toLocaleString()} • {t.totalExpenses}: {sym}{overview.totalExpenses.toLocaleString()}
          </p>
        </div>

        {/* Card 3: Income This Month */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              {t.incomeThisMonth}
            </span>
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-emerald-400">
            {sym}{overview.incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {t.incomeToday}: {sym}{overview.incomeToday.toLocaleString()} • {t.incomeThisWeek}: {sym}{overview.incomeThisWeek.toLocaleString()}
          </p>
        </div>

        {/* Card 4: Expenses This Month */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              {t.expensesThisMonth}
            </span>
            <div className="p-2 rounded-xl bg-slate-800 text-rose-400">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-rose-400">
            {sym}{overview.expensesThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {t.expensesToday}: {sym}{overview.expensesToday.toLocaleString()} • {t.expensesThisWeek}: {sym}{overview.expensesThisWeek.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 4. SECONDARY METRICS ROW: Detailed 8 Cards for Full Control */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* Income Today */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">{t.incomeToday}</p>
          <p className="font-mono text-base font-bold text-emerald-400 mt-1">
            {sym}{overview.incomeToday.toLocaleString()}
          </p>
        </div>

        {/* Income This Week */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">{t.incomeThisWeek}</p>
          <p className="font-mono text-base font-bold text-emerald-400 mt-1">
            {sym}{overview.incomeThisWeek.toLocaleString()}
          </p>
        </div>

        {/* Expenses Today */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">{t.expensesToday}</p>
          <p className="font-mono text-base font-bold text-rose-400 mt-1">
            {sym}{overview.expensesToday.toLocaleString()}
          </p>
        </div>

        {/* Expenses This Week */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">{t.expensesThisWeek}</p>
          <p className="font-mono text-base font-bold text-rose-400 mt-1">
            {sym}{overview.expensesThisWeek.toLocaleString()}
          </p>
        </div>

        {/* Total Course Sales */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-[10px] text-indigo-400 uppercase font-semibold">{t.unitsSold}</p>
          <p className="font-mono text-base font-bold text-white mt-1">
            {overview.totalCourseUnitsSold}
          </p>
        </div>

        {/* Total Customers */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-[10px] text-amber-400 uppercase font-semibold">{isSomali ? 'Macaamiil' : 'Customers'}</p>
          <p className="font-mono text-base font-bold text-white mt-1">
            {overview.totalCustomersCount}
          </p>
        </div>

        {/* Savings Vault Balance */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-[10px] text-purple-400 uppercase font-semibold">{t.savings}</p>
          <p className="font-mono text-base font-bold text-purple-300 mt-1">
            {sym}{overview.savingsBalance.toLocaleString()}
          </p>
        </div>

        {/* Monthly Budget Remaining */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-[10px] text-teal-400 uppercase font-semibold">Budget Left</p>
          <p className="font-mono text-base font-bold text-teal-300 mt-1">
            {sym}{Math.max(0, overview.monthlyBudgetRemaining).toLocaleString()}
          </p>
        </div>
      </div>

      {/* 5. VISUAL SECTION:
         - Left: Monthly Income vs Expenses Chart
         - Right: Course Sales Breakdown
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Income vs Expenses (Clean, Simple Visualization) */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="h-4 w-4 text-emerald-400" />
                <span>{t.incomeVsExpenses}</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {!hasIncome && !hasExpenses ? (
              <div className="py-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-5 space-y-2">
                <p className="text-xs font-semibold text-slate-300">{t.noTransactionsYet}</p>
                <p className="text-[11px] text-slate-500">{t.noTransactionsSub}</p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => setIsIncomeModalOpen(true)}
                    className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    {t.addIncome}
                  </button>
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="rounded-xl bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
                  >
                    {t.addExpense}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {/* Income bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">{t.income}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{sym}{overview.incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          overview.incomeThisMonth + overview.expensesThisMonth > 0
                            ? Math.round((overview.incomeThisMonth / (overview.incomeThisMonth + overview.expensesThisMonth)) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Expense bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">{t.expenses}</span>
                    <span className="font-mono font-bold text-rose-400">
                      -{sym}{overview.expensesThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          overview.incomeThisMonth + overview.expensesThisMonth > 0
                            ? Math.round((overview.expensesThisMonth / (overview.incomeThisMonth + overview.expensesThisMonth)) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Net Cash Flow Box */}
                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-3.5 flex justify-between items-center text-xs">
                  <span className="text-slate-400">{t.netProfitThisMonth}:</span>
                  <span className={`font-mono font-bold text-sm ${overview.netProfitThisMonth >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {overview.netProfitThisMonth >= 0 ? '+' : ''}{sym}{overview.netProfitThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course Sales Performance Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">{t.courseSalesSummary}</h2>
              </div>
              <button
                onClick={() => setActiveTab('courses')}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                {t.courses} ({db.courses.length})
              </button>
            </div>

            {!hasCourses && !hasCourseSales ? (
              <div className="py-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-5 space-y-2">
                <p className="text-xs font-semibold text-slate-300">{t.noCoursesYet}</p>
                <p className="text-[11px] text-slate-500">{t.noCoursesSub}</p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    {t.addCourse}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">{t.unitsSold}</p>
                    <p className="font-mono text-xl font-bold text-white mt-1">
                      {overview.totalCourseUnitsSold}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-[10px] text-emerald-400 uppercase font-semibold">{t.revenueReceived}</p>
                    <p className="font-mono text-xl font-bold text-emerald-400 mt-1">
                      {sym}{overview.totalCourseRevenueReceived.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-[10px] text-amber-400 uppercase font-semibold">{t.outstandingAmount}</p>
                    <p className="font-mono text-xl font-bold text-amber-400 mt-1">
                      {sym}{overview.totalCourseOutstanding.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Quick actions for course sales */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">
                    {db.courses.length} {t.courses.toLowerCase()} • {db.courseSales.length} {isSomali ? 'iib' : 'sales'}
                  </span>
                  <button
                    onClick={() => setIsCourseSaleModalOpen(true)}
                    className="rounded-xl bg-cyan-600 px-3 py-1.5 font-bold text-white hover:bg-cyan-500"
                  >
                    {t.recordSale}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. RECENT TRANSACTIONS LEDGER with Clean Empty States */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white">{t.recentTransactions}</h2>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-6 space-y-2">
            <p className="text-sm font-bold text-white">{t.noTransactionsYet}</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">{t.noTransactionsSub}</p>
            <div className="pt-3 flex justify-center gap-2.5">
              <button
                onClick={() => setIsIncomeModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{t.addIncome}</span>
              </button>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
              >
                <MinusCircle className="h-4 w-4" />
                <span>{t.addExpense}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {recentTransactions.map((txn) => {
              const isInc = txn.kind === 'income';
              return (
                <div key={txn.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                        isInc ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {isInc ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {isInc ? (txn as any).courseOrService || (txn as any).source : (txn as any).description}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {txn.date} • {txn.paymentMethod} {isInc ? (txn as any).customerName ? `• ${(txn as any).customerName}` : '' : `• ${(txn as any).bucket}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-mono text-sm font-bold ${isInc ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isInc ? '+' : '-'}{sym}{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
