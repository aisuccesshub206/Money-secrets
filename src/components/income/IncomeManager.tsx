import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IncomeSource, PaymentMethod } from '../../types';
import {
  Wallet,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const IncomeManager: React.FC = () => {
  const {
    db,
    overview,
    deleteIncome,
    setEditingIncome,
    setIsIncomeModalOpen,
    t,
    language,
  } = useApp();

  const isSomali = language === 'so';
  const sym = db.settings.currencySymbol;

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Filtered income transactions
  const filtered = db.incomeTransactions.filter((inc) => {
    const matchesSearch =
      !search ||
      (inc.courseOrService && inc.courseOrService.toLowerCase().includes(search.toLowerCase())) ||
      (inc.customerName && inc.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (inc.notes && inc.notes.toLowerCase().includes(search.toLowerCase())) ||
      (inc.customerWhatsapp && inc.customerWhatsapp.includes(search));

    const matchesSource = sourceFilter === 'all' || inc.source === sourceFilter;
    const matchesMethod = methodFilter === 'all' || inc.paymentMethod === methodFilter;

    return matchesSearch && matchesSource && matchesMethod;
  });

  // Aggregations by source
  const sourceBreakdown = (['Course Sale', 'Mentorship', 'Website Service', 'AI Service', 'Other'] as IncomeSource[]).map(src => {
    const amount = db.incomeTransactions
      .filter(t => t.source === src)
      .reduce((sum, t) => sum + t.amount, 0);
    return { source: src, amount };
  });

  // Aggregations by payment method
  const methodBreakdown = (['EVC', 'Waafi', 'Bank', 'Card', 'Cash', 'Other'] as PaymentMethod[]).map(m => {
    const amount = db.incomeTransactions
      .filter(t => t.paymentMethod === m)
      .reduce((sum, t) => sum + t.amount, 0);
    return { method: m, amount };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-400" />
            Money & Income Manager
          </h1>
          <p className="text-xs text-slate-400">
            Track and record every dollar coming into XirfadoNet across all revenue channels.
          </p>
        </div>

        <button
          onClick={() => setIsIncomeModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Add Income</span>
        </button>
      </div>

      {/* Top 4 Key Income Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Lifetime Income</p>
          <p className="mt-2 font-mono text-2xl font-black text-emerald-400">
            {sym}{overview.totalIncome.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">{db.incomeTransactions.length} transactions recorded</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Income Today</p>
          <p className="mt-2 font-mono text-2xl font-black text-emerald-400">
            {sym}{overview.incomeToday.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">24-hour revenue</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Income This Week</p>
          <p className="mt-2 font-mono text-2xl font-black text-emerald-400">
            {sym}{overview.incomeThisWeek.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">Past 7 days</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Income This Month</p>
          <p className="mt-2 font-mono text-2xl font-black text-emerald-400">
            {sym}{overview.incomeThisMonth.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">Monthly goal: {sym}{db.settings.monthlyIncomeGoal}</p>
        </div>
      </div>

      {/* Breakdowns by Source & Payment Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-xs font-bold text-white mb-3 flex items-center justify-between">
            <span>Income by Source</span>
            <span className="text-[10px] text-slate-400">All-time</span>
          </h2>
          <div className="space-y-2">
            {sourceBreakdown.map(item => (
              <div key={item.source} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{item.source}</span>
                <span className="font-mono font-bold text-emerald-400">{sym}{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-xs font-bold text-white mb-3 flex items-center justify-between">
            <span>Income by Payment Method</span>
            <span className="text-[10px] text-slate-400">All-time</span>
          </h2>
          <div className="space-y-2">
            {methodBreakdown.map(item => (
              <div key={item.method} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{item.method}</span>
                <span className="font-mono font-bold text-white">{sym}{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table & Filters */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by customer, course, WhatsApp, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">All Sources</option>
              <option value="Course Sale">Course Sale</option>
              <option value="Mentorship">Mentorship</option>
              <option value="Website Service">Website Service</option>
              <option value="AI Service">AI Service</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">All Methods</option>
              <option value="EVC">EVC</option>
              <option value="Waafi">Waafi</option>
              <option value="Bank">Bank</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 pl-2">Date</th>
                <th className="pb-3">Source & Title</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Method</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-sm font-bold text-white">
                        {db.incomeTransactions.length === 0
                          ? (isSomali ? 'Weli wax dakhli ah lama diiwaangelin.' : 'No income recorded yet.')
                          : (isSomali ? 'Wax dakhli ah laguma helin xulashadan.' : 'No income transactions match your filters.')}
                      </p>
                      <p className="text-xs text-slate-400">
                        {db.incomeTransactions.length === 0
                          ? (isSomali ? 'Ku bilow adigoo ku daraya dakhligii kuugu horreeyay.' : 'Start by adding your first income transaction.')
                          : (isSomali ? 'Isku day inaad beddesho miirayaasha.' : 'Try adjusting your search or filters.')}
                      </p>
                      <button
                        onClick={() => {
                          setEditingIncome(null);
                          setIsIncomeModalOpen(true);
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>{t.addIncome}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pl-2 font-mono text-slate-400">{inc.date}</td>
                    <td className="py-3">
                      <p className="font-bold text-white">{inc.courseOrService || inc.source}</p>
                      <span className="inline-block rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                        {inc.source}
                      </span>
                    </td>
                    <td className="py-3">
                      <p className="text-slate-200">{inc.customerName || '—'}</p>
                      {inc.customerWhatsapp && (
                        <p className="font-mono text-[10px] text-slate-500">{inc.customerWhatsapp}</p>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                        {inc.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      +{sym}{inc.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingIncome(inc);
                            setIsIncomeModalOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(isSomali ? 'Ma hubtaa inaad tirtirto dakhligan?' : 'Delete this income record? Available balance will decrease.')) {
                              deleteIncome(inc.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
