import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, PaymentStatus, Course } from '../../types';
import { getTodayDateString } from '../../utils/storage';
import { X, ShoppingBag, Check, PlusCircle, AlertCircle } from 'lucide-react';

export const CourseSaleModal: React.FC = () => {
  const {
    isCourseSaleModalOpen,
    setIsCourseSaleModalOpen,
    selectedCourseForSale,
    setSelectedCourseForSale,
    editingCourseSale,
    setEditingCourseSale,
    recordCourseSale,
    editCourseSale,
    db,
    t,
    language,
    setActiveTab,
  } = useApp();

  const sym = db.settings.currencySymbol;

  // Form states
  const [courseId, setCourseId] = useState<string>('');
  const [saleDate, setSaleDate] = useState<string>(getTodayDateString());
  const [quantity, setQuantity] = useState<string>('1');
  const [salePrice, setSalePrice] = useState<string>('0');
  const [amountReceived, setAmountReceived] = useState<string>('0');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EVC');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Initialize form when opened (for create or edit)
  useEffect(() => {
    if (!isCourseSaleModalOpen) return;

    if (editingCourseSale) {
      // Edit mode
      setCourseId(editingCourseSale.courseId);
      setSaleDate(editingCourseSale.date || getTodayDateString());
      setQuantity(editingCourseSale.quantity?.toString() || '1');
      setSalePrice(editingCourseSale.salePrice?.toString() || '0');
      setAmountReceived(editingCourseSale.amountReceived?.toString() || '0');
      setCustomerName(editingCourseSale.customerName || '');
      setCustomerWhatsapp(editingCourseSale.customerWhatsapp || '');
      setCustomerEmail(editingCourseSale.customerEmail || '');
      setPaymentMethod(editingCourseSale.paymentMethod || 'EVC');
      setPaymentStatus(editingCourseSale.paymentStatus || 'Paid');
      setNotes(editingCourseSale.notes || '');
    } else if (selectedCourseForSale) {
      // Create mode with preselected course
      setCourseId(selectedCourseForSale.id);
      setSaleDate(getTodayDateString());
      setQuantity('1');
      setSalePrice(selectedCourseForSale.price.toString());
      setAmountReceived(selectedCourseForSale.price.toString());
      setPaymentStatus('Paid');
      setCustomerName('');
      setCustomerWhatsapp('');
      setCustomerEmail('');
      setNotes('');
    } else if (db.courses.length > 0) {
      // Create mode with first course
      const first = db.courses[0];
      setCourseId(first.id);
      setSaleDate(getTodayDateString());
      setQuantity('1');
      setSalePrice(first.price.toString());
      setAmountReceived(first.price.toString());
      setPaymentStatus('Paid');
      setCustomerName('');
      setCustomerWhatsapp('');
      setCustomerEmail('');
      setNotes('');
    } else {
      setCourseId('');
      setSaleDate(getTodayDateString());
      setQuantity('1');
      setSalePrice('0');
      setAmountReceived('0');
    }
  }, [isCourseSaleModalOpen, editingCourseSale, selectedCourseForSale, db.courses]);

  if (!isCourseSaleModalOpen) return null;

  // Handle course selection
  const handleCourseChange = (id: string) => {
    setCourseId(id);
    const c = db.courses.find(course => course.id === id);
    if (c) {
      setSalePrice(c.price.toString());
      const qtyNum = parseFloat(quantity) || 1;
      const totalDue = qtyNum * c.price;
      setAmountReceived(totalDue.toString());
      setPaymentStatus('Paid');
    }
  };

  // Handle quantity change
  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    const qtyNum = parseFloat(val) || 0;
    const priceNum = parseFloat(salePrice) || 0;
    const totalDue = qtyNum * priceNum;
    setAmountReceived(totalDue.toString());
    setPaymentStatus('Paid');
  };

  // Handle unit price change
  const handlePriceChange = (val: string) => {
    setSalePrice(val);
    const qtyNum = parseFloat(quantity) || 1;
    const priceNum = parseFloat(val) || 0;
    const totalDue = qtyNum * priceNum;
    setAmountReceived(totalDue.toString());
  };

  // Calculated numbers for live preview
  const parsedQty = parseFloat(quantity) || 0;
  const parsedPrice = parseFloat(salePrice) || 0;
  const parsedReceived = parseFloat(amountReceived) || 0;
  const totalDue = Math.max(0, parsedQty * parsedPrice);
  const outstandingAmount = Math.max(0, totalDue - parsedReceived);

  // Quick buttons to set amount received
  const setFullPayment = () => {
    setAmountReceived(totalDue.toString());
    setPaymentStatus('Paid');
  };
  const setUnpaidPayment = () => {
    setAmountReceived('0');
    setPaymentStatus('Pending');
  };
  const setHalfPayment = () => {
    const half = (totalDue / 2).toFixed(2);
    setAmountReceived(half);
    setPaymentStatus('Partial');
  };

  const handleClose = () => {
    setIsCourseSaleModalOpen(false);
    setSelectedCourseForSale(null);
    setEditingCourseSale(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    if (editingCourseSale) {
      editCourseSale(editingCourseSale.id, {
        courseId,
        date: saleDate,
        quantity: parsedQty,
        salePrice: parsedPrice,
        amountReceived: parsedReceived,
        outstandingAmount,
        customerName: customerName.trim() || undefined,
        customerWhatsapp: customerWhatsapp.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        paymentMethod,
        paymentStatus,
        notes: notes.trim() || undefined,
      });
    } else {
      recordCourseSale({
        courseId,
        saleDate,
        quantity: parsedQty,
        salePrice: parsedPrice,
        amountReceived: parsedReceived,
        customerName: customerName.trim() || undefined,
        customerWhatsapp: customerWhatsapp.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        paymentMethod,
        paymentStatus,
        notes: notes.trim() || undefined,
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      handleClose();
    }, 600);
  };

  const isSomali = language === 'so';

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
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingCourseSale
                  ? (isSomali ? 'Wax ka beddel Iibka Koorsada' : 'Edit Course Sale')
                  : (isSomali ? 'Diiwaangeli Iibka Koorsada' : 'Record Course Sale')}
              </h2>
              <p className="text-xs text-slate-400">
                {isSomali
                  ? 'Iibka dhabta ah ee la helay ayaa lagu dari doonaa dakhliga'
                  : 'Cash received increases available balance; unpaid sales track outstanding'}
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

        {/* If no courses exist, offer quick redirect to add course */}
        {db.courses.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-white">
              {isSomali ? 'Weli koorsooyin lama abuurin' : 'No courses created yet'}
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {isSomali
                ? 'Fadlan marka hore ku dar koorso si aad u diiwaangeliso iibkeeda.'
                : 'Please add a course first before recording customer sales.'}
            </p>
            <button
              onClick={() => {
                handleClose();
                setActiveTab('courses');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{isSomali ? '+ Ku dar Koorsada' : '+ Add Course'}</span>
            </button>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <p className="mt-3 text-base font-bold text-white">
              {editingCourseSale
                ? (isSomali ? 'Iibka waa la cusboonaysiiyey!' : 'Sale Updated Successfully!')
                : (isSomali ? 'Iibka waa la diiwaangeliyey!' : 'Course Sale Recorded!')}
            </p>
            <p className="text-xs text-cyan-400 mt-1">
              {isSomali
                ? 'Tirada la iibiyey iyo dakhliga waa la cusboonaysiiyey.'
                : 'Units sold, course revenue, and operating balance updated.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Course Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isSomali ? 'Koorsada la Iibiyey *' : 'Select Course *'}
              </label>
              <select
                required
                value={courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {db.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {sym}{c.price} ({c.status})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Sale Date, Quantity, Sale Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Taariikhda *' : 'Sale Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Tirada (Quantity) *' : 'Quantity *'}
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? `Qiimaha Halkii Qof (${sym}) *` : `Sale Price (${sym}) *`}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                    {sym}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={salePrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-7 pr-3 text-xs font-mono font-bold text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Amount Received & Quick Presets */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-cyan-300">
                  {isSomali ? `Lacagta Dhabta ah ee la Helay (${sym}) *` : `Amount Received (${sym}) *`}
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={setFullPayment}
                    className="rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 text-cyan-300 font-bold hover:bg-cyan-500/30"
                  >
                    {isSomali ? 'Wada Buuxa' : 'Full'} ({sym}{totalDue})
                  </button>
                  <button
                    type="button"
                    onClick={setHalfPayment}
                    className="rounded-lg bg-slate-800 px-2 py-0.5 text-slate-300 hover:bg-slate-700"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={setUnpaidPayment}
                    className="rounded-lg bg-slate-800 px-2 py-0.5 text-slate-300 hover:bg-slate-700"
                  >
                    {isSomali ? 'Weli Lama Bixin' : 'Unpaid'} ($0)
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-cyan-400 font-mono">
                  {sym}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={amountReceived}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmountReceived(val);
                    const parsed = parseFloat(val) || 0;
                    if (parsed >= totalDue && totalDue > 0) setPaymentStatus('Paid');
                    else if (parsed > 0) setPaymentStatus('Partial');
                    else setPaymentStatus('Pending');
                  }}
                  className="w-full rounded-xl border border-cyan-500/40 bg-slate-950 py-2.5 pl-8 pr-3 text-lg font-mono font-bold text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* LIVE SALE SUMMARY CARD */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-cyan-500/10">
                <div className="rounded-xl bg-slate-900/80 p-2">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    {isSomali ? 'Tirada la Iibiyey' : 'Units Sold'}
                  </p>
                  <p className="font-mono text-sm font-bold text-white mt-0.5">{parsedQty}</p>
                </div>
                <div className="rounded-xl bg-slate-900/80 p-2">
                  <p className="text-[10px] text-emerald-400 uppercase font-semibold">
                    {isSomali ? 'Dakhliga la Helay' : 'Revenue Received'}
                  </p>
                  <p className="font-mono text-sm font-bold text-emerald-400 mt-0.5">
                    {sym}{parsedReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-900/80 p-2">
                  <p className="text-[10px] text-amber-400 uppercase font-semibold">
                    {isSomali ? 'Lacagta Dhiman' : 'Outstanding'}
                  </p>
                  <p className="font-mono text-sm font-bold text-amber-400 mt-0.5">
                    {sym}{outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Payment Method & Payment Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Habka Lacag-bixinta *' : 'Payment Method *'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="EVC">EVC Plus</option>
                  <option value="Waafi">Waafi</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Xaaladda Lacag-bixinta *' : 'Payment Status *'}
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Paid">Paid (Buuxda)</option>
                  <option value="Partial">Partial (Qayb)</option>
                  <option value="Pending">Pending / Unpaid (Lama bixin)</option>
                  <option value="Refunded">Refunded (La celiyey)</option>
                </select>
              </div>
            </div>

            {/* 5. Customer Information (Optional) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isSomali ? 'Xogta Macmiilka / Ardayga (Ikhtiyaari)' : 'Customer Details (Optional)'}
                </span>
                <span className="text-[10px] text-slate-500">Auto adds to directory</span>
              </div>

              <div>
                <input
                  type="text"
                  placeholder={isSomali ? 'Magaca Macmiilka (tusaale: Axmed Cali)' : 'Customer Name (e.g. Ahmed Ali)'}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="WhatsApp (+252...)"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 6. Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isSomali ? 'Qoraal Dheeraad ah / Tixraaca' : 'Notes / Transaction Reference'}
              </label>
              <input
                type="text"
                placeholder={isSomali ? 'Tusaale: EVC TXN-88129 ama heshiis gaar ah' : 'e.g. EVC TXN-88129 or special promo'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 active:scale-[0.98] transition-all"
              >
                {editingCourseSale
                  ? (isSomali ? 'Kaydi Isbeddelka Iibka' : 'Save Sale Changes')
                  : (isSomali ? '+ Diiwaangeli Iibka Koorsada' : '+ Record Course Sale')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
