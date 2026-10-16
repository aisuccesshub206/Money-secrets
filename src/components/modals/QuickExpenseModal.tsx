import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, MoneyBucket, PaymentMethod } from '../../types';
import { getTodayDateString } from '../../utils/storage';
import { X, MinusCircle, Check, AlertTriangle, ShieldAlert, Edit2 } from 'lucide-react';

export const QuickExpenseModal: React.FC = () => {
  const {
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    editingExpense,
    setEditingExpense,
    addExpense,
    editExpense,
    overview,
    db,
    language,
  } = useApp();

  const sym = db.settings.currencySymbol;
  const isSomali = language === 'so';

  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [bucket, setBucket] = useState<MoneyBucket>('Myself');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [subcategory, setSubcategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EVC');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Initialize form state
  useEffect(() => {
    if (!isExpenseModalOpen) return;

    if (editingExpense) {
      setAmount(editingExpense.amount?.toString() || '');
      setDate(editingExpense.date || getTodayDateString());
      setBucket(editingExpense.bucket || 'Myself');
      setCategory(editingExpense.category || 'Food');
      setSubcategory(editingExpense.subcategory || '');
      setDescription(editingExpense.description || '');
      setPaymentMethod(editingExpense.paymentMethod || 'EVC');
      setNotes(editingExpense.notes || '');
    } else {
      setAmount('');
      setDate(getTodayDateString());
      setBucket('Myself');
      setCategory('Food');
      setSubcategory('');
      setDescription('');
      setPaymentMethod('EVC');
      setNotes('');
    }
  }, [isExpenseModalOpen, editingExpense]);

  if (!isExpenseModalOpen) return null;

  const handleClose = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  // Sync default bucket when category changes
  const handleCategoryChange = (newCat: ExpenseCategory) => {
    setCategory(newCat);
    if (newCat === 'Family') setBucket('Family');
    else if (newCat === 'Personal / Myself' || newCat === 'Food' || newCat === 'Transport') setBucket('Myself');
    else if (['AI Tools', 'Website / Hosting', 'Domain', 'Marketing', 'Business', 'Internet / Phone'].includes(newCat)) setBucket('Business');
  };

  const parsedAmount = parseFloat(amount) || 0;
  const isToday = date === getTodayDateString();
  const projectedDailyTotal = isToday ? overview.dailySpent + parsedAmount : 0;
  const willExceedDaily = db.settings.dailySpendingLimit > 0 && isToday && projectedDailyTotal > db.settings.dailySpendingLimit;
  const exceededBy = willExceedDaily ? projectedDailyTotal - db.settings.dailySpendingLimit : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    if (editingExpense) {
      editExpense(editingExpense.id, {
        amount: parsedAmount,
        date,
        category,
        bucket,
        subcategory: subcategory.trim() || undefined,
        description: description.trim() || `${category} expense`,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } else {
      addExpense({
        amount: parsedAmount,
        date,
        category,
        bucket,
        subcategory: subcategory.trim() || undefined,
        description: description.trim() || `${category} expense`,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      handleClose();
    }, 600);
  };

  const buckets: { id: MoneyBucket; labelEn: string; labelSo: string; color: string }[] = [
    { id: 'Family', labelEn: '👨‍👩‍👧 Family', labelSo: '👨‍👩‍👧 Qoyska', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
    { id: 'Myself', labelEn: '👤 Myself / Personal', labelSo: '👤 Aniga Gaar ahaan', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' },
    { id: 'Business', labelEn: '💼 Business', labelSo: '💼 Ganacsiga', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
    { id: 'Other', labelEn: '🏷️ Other', labelSo: '🏷️ Kale', color: 'border-slate-500/40 bg-slate-500/10 text-slate-300' },
  ];

  const categories: ExpenseCategory[] = [
    'Family',
    'Personal / Myself',
    'Business',
    'Food',
    'Transport',
    'Internet / Phone',
    'AI Tools',
    'Website / Hosting',
    'Domain',
    'Marketing',
    'Education',
    'Bills',
    'Other',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {editingExpense ? <Edit2 className="h-5 w-5" /> : <MinusCircle className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingExpense
                  ? (isSomali ? 'Wax ka beddel Kharashka' : 'Edit Expense Record')
                  : (isSomali ? 'Diiwaangeli Kharash' : 'Add Expense')}
              </h2>
              <p className="text-xs text-slate-400">
                {isSomali
                  ? 'U qoondee Qoyska, Aniga, ama Ganacsiga'
                  : 'Assigns directly to Family, Myself, Business, or Other'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <p className="mt-3 text-base font-bold text-white">
              {editingExpense
                ? (isSomali ? 'Kharashka waa la cusboonaysiiyey!' : 'Expense Updated!')
                : (isSomali ? 'Kharashka waa la diiwaangeliyey!' : 'Expense Recorded!')}
            </p>
            <p className="text-xs text-rose-400 mt-1">
              {isSomali ? 'Hadhaaga lacagta waa la cusboonaysiiyey.' : 'Deducted from available liquid balance.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isSomali ? `Qadarka Kharashka (${sym}) *` : `Amount (${sym}) *`}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-rose-400 font-mono">
                  {sym}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-4 text-xl font-bold font-mono text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Spending Limit Warning preview */}
              {willExceedDaily && (
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-[11px] text-rose-300">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>
                    {isSomali
                      ? `Digniin: Xadka maalinlaha ah (${sym}${db.settings.dailySpendingLimit}) waxaad ku dhaafi doontaa `
                      : `Warning: Daily spending limit (${sym}${db.settings.dailySpendingLimit}) will be exceeded by `}
                    <strong>{sym}{exceededBy.toFixed(2)}</strong>!
                  </span>
                </div>
              )}
            </div>

            {/* SPENDING ALLOCATION: Family, Myself, Business, Other */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isSomali
                  ? 'U Qoondeynta Lacagta (Spending Allocation) *'
                  : 'Spending Allocation (Family, Myself, Business, Other) *'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {buckets.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => setBucket(b.id)}
                    className={`rounded-xl border p-2.5 text-xs font-bold text-left transition-all ${
                      bucket === b.id
                        ? `${b.color} ring-2 ring-rose-500/40 shadow-sm`
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {isSomali ? b.labelSo : b.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Category and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Qaybta Kharashka (Category) *' : 'Category *'}
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Taariikhda *' : 'Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Description & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Faahfaahin kooban *' : 'Description *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isSomali ? 'Tusaale: Midjourney ama Qoyska bishan' : 'e.g. Midjourney Pro or Family groceries'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Qayb hoosaad (Ikhtiyaari)' : 'Subcategory (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software, Lunch, Transport"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isSomali ? 'Habka Lacag-bixinta *' : 'Payment Method *'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {(['EVC', 'Waafi', 'Bank', 'Card', 'Cash', 'Other'] as PaymentMethod[]).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`rounded-xl py-2 px-1 text-xs font-semibold transition-all ${
                      paymentMethod === m
                        ? 'bg-rose-500 text-white font-bold shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isSomali ? 'Qoraal Dheeraad ah (Ikhtiyaari)' : 'Notes / Reference (Optional)'}
              </label>
              <input
                type="text"
                placeholder={isSomali ? 'Qoraal gaar ah ama tixraac' : 'Optional internal notes'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-rose-500 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 active:scale-[0.98] transition-all"
              >
                {editingExpense
                  ? (isSomali ? 'Kaydi Isbeddelka' : 'Save Expense Changes')
                  : (isSomali ? '- Diiwaangeli Kharashka' : '- Record Expense')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
