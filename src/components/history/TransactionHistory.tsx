import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Calendar,
  X,
  Edit2,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const {
    db,
    deleteIncome,
    deleteExpense,
    setEditingIncome,
    setEditingExpense,
    setIsIncomeModalOpen,
    setIsExpenseModalOpen,
    language,
    t,
  } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const sym = db.settings.currencySymbol;
  const isSomali = language === 'so';

  // Merge income and expenses chronologically
  const unified = [
    ...db.incomeTransactions.map(t => ({
      id: t.id,
      date: t.date,
      title: t.courseOrService || t.source,
      subtitle: t.customerName ? `Client: ${t.customerName}` : t.source,
      amount: t.amount,
      type: 'income' as const,
      category: t.source,
      paymentMethod: t.paymentMethod,
      notes: t.notes,
    })),
    ...db.expenseTransactions.map(e => ({
      id: e.id,
      date: e.date,
      title: e.description,
      subtitle: `${e.bucket} • ${e.category}`,
      amount: e.amount,
      type: 'expense' as const,
      category: e.category,
      paymentMethod: e.paymentMethod,
      notes: e.notes,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = unified.filter((txn) => {
    const matchesSearch =
      !search ||
      txn.title.toLowerCase().includes(search.toLowerCase()) ||
      txn.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      (txn.notes && txn.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'all' || txn.type === typeFilter;
    const matchesMethod = methodFilter === 'all' || txn.paymentMethod === methodFilter;

    return matchesSearch && matchesType && matchesMethod;
  });

  const handleDelete = (id: string, type: 'income' | 'expense') => {
    if (confirm(`Delete this ${type} transaction permanently?`)) {
      if (type === 'income') deleteIncome(id);
      else deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <History className="h-6 w-6 text-slate-300" />
          Complete Transaction Ledger
        </h1>
        <p className="text-xs text-slate-400">
          Chronological record of every financial movement inside XirfadoNet.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by description, customer, course, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Types (Income & Expenses)</option>
            <option value="income">Income Only (+)</option>
            <option value="expense">Expenses Only (-)</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Payment Methods</option>
            <option value="EVC">EVC</option>
            <option value="Waafi">Waafi</option>
            <option value="Bank">Bank</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
          </select>

          <span className="text-xs text-slate-400 font-mono">
            {filtered.length} entries
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="pb-3 pl-2">Date</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Description & Context</th>
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
                      {unified.length === 0
                        ? (isSomali ? 'Weli wax dhaqdhaqaaq lacageed ah ma jiro.' : 'No transactions recorded yet.')
                        : (isSomali ? 'Wax dhaqdhaqaaq ah laguma helin xulashadan.' : 'No transactions match the selected filters.')}
                    </p>
                    <p className="text-xs text-slate-400">
                      {unified.length === 0
                        ? (isSomali ? 'Ku dar dakhli ama kharash si aad halkan ugu aragto.' : 'Add your first income or expense transaction to see it here.')
                        : (isSomali ? 'Isku day inaad beddesho miirayaasha.' : 'Try adjusting your search or filters.')}
                    </p>
                    {unified.length === 0 && (
                      <div className="pt-2 flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingIncome(null);
                            setIsIncomeModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>{t.addIncome}</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingExpense(null);
                            setIsExpenseModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
                        >
                          <MinusCircle className="h-4 w-4" />
                          <span>{t.addExpense}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const isInc = t.type === 'income';

                const handleEdit = () => {
                  if (isInc) {
                    const found = db.incomeTransactions.find(inc => inc.id === t.id);
                    if (found) {
                      setEditingIncome(found);
                      setIsIncomeModalOpen(true);
                    }
                  } else {
                    const found = db.expenseTransactions.find(exp => exp.id === t.id);
                    if (found) {
                      setEditingExpense(found);
                      setIsExpenseModalOpen(true);
                    }
                  }
                };

                return (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pl-2 font-mono text-slate-400">{t.date}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isInc
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isInc ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {isInc ? (isSomali ? 'Dakhli' : 'Income') : (isSomali ? 'Kharash' : 'Expense')}
                      </span>
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-white">{t.title}</p>
                      <p className="text-[10px] text-slate-500">{t.subtitle}</p>
                    </td>
                    <td className="py-3 font-mono text-slate-300">{t.paymentMethod}</td>
                    <td className={`py-3 text-right font-mono font-bold text-sm ${
                      isInc ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isInc ? '+' : '-'}{sym}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={handleEdit}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.type)}
                          className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
