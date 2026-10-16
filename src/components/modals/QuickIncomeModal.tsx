import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { IncomeSource, PaymentMethod } from '../../types';
import { getTodayDateString } from '../../utils/storage';
import { X, PlusCircle, Check, Edit2 } from 'lucide-react';

export const QuickIncomeModal: React.FC = () => {
  const {
    isIncomeModalOpen,
    setIsIncomeModalOpen,
    editingIncome,
    setEditingIncome,
    addIncome,
    editIncome,
    db,
    language,
  } = useApp();

  const sym = db.settings.currencySymbol;
  const isSomali = language === 'so';

  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [source, setSource] = useState<IncomeSource>('Course Sale');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [courseOrService, setCourseOrService] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EVC');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Initialize form state
  useEffect(() => {
    if (!isIncomeModalOpen) return;

    if (editingIncome) {
      setAmount(editingIncome.amount?.toString() || '');
      setDate(editingIncome.date || getTodayDateString());
      setSource(editingIncome.source || 'Course Sale');
      setCustomerName(editingIncome.customerName || '');
      setCustomerWhatsapp(editingIncome.customerWhatsapp || '');
      setCustomerEmail(editingIncome.customerEmail || '');
      setCourseOrService(editingIncome.courseOrService || '');
      setSelectedCourseId(editingIncome.courseId || '');
      setPaymentMethod(editingIncome.paymentMethod || 'EVC');
      setNotes(editingIncome.notes || '');
    } else {
      setAmount('');
      setDate(getTodayDateString());
      setSource('Course Sale');
      setCustomerName('');
      setCustomerWhatsapp('');
      setCustomerEmail('');
      setCourseOrService('');
      setSelectedCourseId('');
      setPaymentMethod('EVC');
      setNotes('');
    }
  }, [isIncomeModalOpen, editingIncome]);

  if (!isIncomeModalOpen) return null;

  const handleClose = () => {
    setIsIncomeModalOpen(false);
    setEditingIncome(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    let targetCourseName = courseOrService;
    if (source === 'Course Sale' && selectedCourseId) {
      const found = db.courses.find(c => c.id === selectedCourseId);
      if (found) targetCourseName = found.name;
    }

    if (editingIncome) {
      editIncome(editingIncome.id, {
        amount: parsedAmount,
        date,
        source,
        customerName: customerName.trim() || undefined,
        customerWhatsapp: customerWhatsapp.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        courseOrService: targetCourseName.trim() || undefined,
        courseId: selectedCourseId || undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } else {
      addIncome({
        amount: parsedAmount,
        date,
        source,
        customerName: customerName.trim() || undefined,
        customerWhatsapp: customerWhatsapp.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        courseOrService: targetCourseName.trim() || undefined,
        courseId: selectedCourseId || undefined,
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
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {editingIncome ? <Edit2 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingIncome
                  ? (isSomali ? 'Wax ka beddel Dakhliga' : 'Edit Income Transaction')
                  : (isSomali ? 'Diiwaangeli Dakhli' : 'Add Income')}
              </h2>
              <p className="text-xs text-slate-400">
                {isSomali
                  ? 'Waxay si toos ah u kordhinaysaa hadhaaga lacagta'
                  : 'Instantly increases your available cash balance'}
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <p className="mt-3 text-base font-bold text-white">
              {editingIncome
                ? (isSomali ? 'Dakhliga waa la cusboonaysiiyey!' : 'Income Updated!')
                : (isSomali ? 'Dakhliga waa la diiwaangeliyey!' : 'Income Recorded!')}
            </p>
            <p className="text-xs text-emerald-400 mt-1">
              {isSomali ? 'Hadhaaga lacagta waa la cusboonaysiiyey.' : 'Available balance updated automatically.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isSomali ? `Qadarka Lacagta (${sym}) *` : `Amount (${sym}) *`}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-400 font-mono">
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
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-4 text-xl font-bold font-mono text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Income Source & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Isha Dakhliga (Source) *' : 'Income Source *'}
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as IncomeSource)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Course Sale">Course Sale</option>
                  <option value="Mentorship">Mentorship</option>
                  <option value="Website Service">Website Service</option>
                  <option value="AI Service">AI Service</option>
                  <option value="Other">Other</option>
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Course or Service details */}
            {source === 'Course Sale' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Dooro Koorsada' : 'Select Course (Optional)'}
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    const course = db.courses.find(c => c.id === e.target.value);
                    if (course && !amount) setAmount(course.price.toString());
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- {isSomali ? 'Koorso kasta' : 'Choose Course'} --</option>
                  {db.courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({sym}{c.price})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Magaca Adeegga ama Mashruuca' : 'Course or Service Title (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isSomali ? 'Tusaale: 1-on-1 Mentorship ama Website Design' : 'e.g. 1-on-1 Mentorship or Website Design'}
                  value={courseOrService}
                  onChange={(e) => setCourseOrService(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

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
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details (Optional) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isSomali ? 'Xogta Macmiilka (Ikhtiyaari)' : 'Customer Details (Optional)'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder={isSomali ? 'Magaca Macmiilka' : 'Customer Full Name'}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="WhatsApp (+252...)"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <input
                type="email"
                placeholder="Email (Optional)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isSomali ? 'Qoraal / Tixraac (Notes)' : 'Notes / Reference (Optional)'}
              </label>
              <input
                type="text"
                placeholder={isSomali ? 'Tusaale: TXN-10928 EVC Plus' : 'e.g. TXN-10928 EVC Plus transfer'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 active:scale-[0.98] transition-all"
              >
                {editingIncome
                  ? (isSomali ? 'Kaydi Isbeddelka' : 'Save Income Changes')
                  : (isSomali ? '+ Ku dar Dakhliga' : '+ Add Income Transaction')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
