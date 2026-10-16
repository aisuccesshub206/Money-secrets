import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, MoneyBucket, PaymentMethod } from '../../types';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  PieChart,
  ArrowDownRight,
  Edit2,
} from 'lucide-react';

export const ExpenseManager: React.FC = () => {
  const {
    db,
    overview,
    deleteExpense,
    setEditingExpense,
    setIsExpenseModalOpen,
    t,
    language,
  } = useApp();

  const isSomali = language === 'so';
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bucketFilter, setBucketFilter] = useState<string>('all');

  const sym = db.settings.currencySymbol;

  const filtered = db.expenseTransactions.filter((exp) => {
    const matchesSearch =
      !search ||
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      (exp.subcategory && exp.subcategory.toLowerCase().includes(search.toLowerCase())) ||
      (exp.notes && exp.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = categoryFilter === 'all' || exp.category === categoryFilter;
    const matchesBucket = bucketFilter === 'all' || exp.bucket === bucketFilter;

    return matchesSearch && matchesCat && matchesBucket;
  });

  // Category aggregations
  const categoryMap = new Map<string, number>();
  db.expenseTransactions.forEach(e => {
    categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
  });
  const categoryRank = Array.from(categoryMap.entries())
    .map(([cat, amount]) => ({ cat, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Receipt className="h-6 w-6 text-rose-400" />
            Expense Manager
          </h1>
          <p className="text-xs text-slate-400">
            Track business costs, family support, personal living expenses, and subscriptions.
          </p>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* Top 4 Key Expense Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Lifetime Expenses</p>
          <p className="mt-2 font-mono text-2xl font-black text-rose-400">
            {sym}{overview.totalExpenses.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">{db.expenseTransactions.length} records entered</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Expenses Today</p>
          <p className="mt-2 font-mono text-2xl font-black text-rose-400">
            {sym}{overview.expensesToday.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">
            Budget: {sym}{db.settings.dailySpendingLimit} ({sym}{Math.max(0, overview.dailyBudgetRemaining)} left)
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Expenses This Week</p>
          <p className="mt-2 font-mono text-2xl font-black text-rose-400">
            {sym}{overview.expensesThisWeek.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">Limit: {sym}{db.settings.weeklySpendingLimit}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Expenses This Month</p>
          <p className="mt-2 font-mono text-2xl font-black text-rose-400">
            {sym}{overview.expensesThisMonth.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">
            Budget: {sym}{db.settings.monthlySpendingLimit} ({sym}{overview.monthlyBudgetRemaining} left)
          </p>
        </div>
      </div>

      {/* Expense Categories Ranking */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-sm font-bold text-white mb-3">Expenses by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {categoryRank.map(({ cat, amount }) => (
            <div key={cat} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <p className="text-[11px] text-slate-400 truncate">{cat}</p>
              <p className="mt-1 font-mono text-base font-bold text-rose-400">{sym}{amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bucketFilter}
              onChange={(e) => setBucketFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">All Buckets</option>
              <option value="Family">Family</option>
              <option value="Myself">Myself</option>
              <option value="Business">Business</option>
              <option value="Savings">Savings</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categoryRank.map(c => (
                <option key={c.cat} value={c.cat}>{c.cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 pl-2">Date</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Bucket</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Method</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-sm font-bold text-white">
                        {db.expenseTransactions.length === 0
                          ? (isSomali ? 'Weli wax kharash ah lama diiwaangelin.' : 'No expenses recorded yet.')
                          : (isSomali ? 'Wax kharash ah laguma helin xulashadan.' : 'No expense records found matching filters.')}
                      </p>
                      <p className="text-xs text-slate-400">
                        {db.expenseTransactions.length === 0
                          ? (isSomali ? 'Diiwaangeli kharashkaaga ganacsi ama midkaaga gaarka ah.' : 'Start by recording your first business or personal expense.')
                          : (isSomali ? 'Isku day inaad beddesho miirayaasha.' : 'Try adjusting your search or filters.')}
                      </p>
                      <button
                        onClick={() => {
                          setEditingExpense(null);
                          setIsExpenseModalOpen(true);
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-600 shadow-md shadow-rose-500/20"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>{t.addExpense}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pl-2 font-mono text-slate-400">{exp.date}</td>
                    <td className="py-3">
                      <p className="font-bold text-white">{exp.description}</p>
                      {exp.subcategory && (
                        <p className="text-[10px] text-slate-500">{exp.subcategory}</p>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                        {exp.bucket}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{exp.category}</td>
                    <td className="py-3 font-mono text-slate-400">{exp.paymentMethod}</td>
                    <td className="py-3 text-right font-mono font-bold text-rose-400 text-sm">
                      -{sym}{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingExpense(exp);
                            setIsExpenseModalOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit expense"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(isSomali ? 'Ma hubtaa inaad tirtirto kharashkan?' : 'Delete this expense? Available liquid balance will be restored.')) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete expense"
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
