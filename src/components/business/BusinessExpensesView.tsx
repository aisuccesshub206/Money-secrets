import React from 'react';
import { useApp } from '../../context/AppContext';
import { Briefcase, TrendingUp, ArrowDownRight, Globe, Cpu, Megaphone, Wifi, Server } from 'lucide-react';

export const BusinessExpensesView: React.FC = () => {
  const { db, overview, setIsExpenseModalOpen } = useApp();
  const sym = db.settings.currencySymbol;

  // Business transactions only
  const businessExpenses = db.expenseTransactions.filter(e => e.bucket === 'Business');
  const totalBusinessSpent = businessExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by business categories
  const categoriesMap = new Map<string, number>();
  businessExpenses.forEach(e => {
    categoriesMap.set(e.category, (categoriesMap.get(e.category) || 0) + e.amount);
  });

  const profitMargin = overview.businessIncome > 0
    ? Math.round((overview.netProfit / overview.businessIncome) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-emerald-400" />
            Business Operations & Profitability
          </h1>
          <p className="text-xs text-slate-400">
            Dedicated P&L statement: Hosting, AI tools, domains, ads, and net operating profit for XirfadoNet.
          </p>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all self-start sm:self-auto"
        >
          <span>+ Log Business Expense</span>
        </button>
      </div>

      {/* TOP 3 P&L METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Business Revenue */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Business Revenue
          </p>
          <p className="mt-2 font-mono text-3xl font-black text-emerald-400">
            {sym}{overview.businessIncome.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Courses, mentorship, website & AI client services
          </p>
        </div>

        {/* Business Expenses */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Business Expenses
          </p>
          <p className="mt-2 font-mono text-3xl font-black text-rose-400">
            {sym}{overview.businessExpenses.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Tools, hosting, advertising, internet, and infrastructure
          </p>
        </div>

        {/* Business Net Profit & Margin */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Net Business Profit
            </p>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {profitMargin}% Margin
            </span>
          </div>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {sym}{overview.netProfit.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-emerald-300">
            Operating profit retained
          </p>
        </div>
      </div>

      {/* Business Cost Center Breakdown */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-sm font-bold text-white mb-4">Business Cost Centers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from(categoriesMap.entries()).map(([cat, amount]) => (
            <div key={cat} className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5">
              <p className="text-[11px] text-slate-400 truncate">{cat}</p>
              <p className="mt-1 font-mono text-lg font-bold text-rose-400">{sym}{amount.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">
                {Math.round((amount / Math.max(1, totalBusinessSpent)) * 100)}% of business costs
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Business Transactions Ledger */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-sm font-bold text-white mb-3">All Business Expenses ({businessExpenses.length})</h2>
        <div className="divide-y divide-slate-800/80">
          {businessExpenses.map((exp) => (
            <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">{exp.description}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {exp.date} • {exp.category} • {exp.paymentMethod}
                </p>
              </div>
              <span className="font-mono font-bold text-rose-400 text-sm">
                -{sym}{exp.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
