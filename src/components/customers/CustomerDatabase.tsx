import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, PaymentStatus } from '../../types';
import {
  Users,
  Search,
  MessageCircle,
  Mail,
  History,
  X,
  PlusCircle,
  ExternalLink,
  Trash2,
} from 'lucide-react';

export const CustomerDatabase: React.FC = () => {
  const { db, addCustomer, editCustomer, deleteCustomer } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New customer form
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [notes, setNotes] = useState('');

  const sym = db.settings.currencySymbol;

  const filtered = db.customers.filter((c) => {
    const matchesSearch =
      !search ||
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !whatsapp.trim()) return;

    addCustomer({
      fullName: fullName.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      purchasedCourseIds: [],
      totalPaid: 0,
      paymentStatus,
      notes: notes.trim() || undefined,
    });

    setIsAddOpen(false);
    setFullName('');
    setWhatsapp('');
    setEmail('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-400" />
            Customer & Student Database
          </h1>
          <p className="text-xs text-slate-400">
            Internal directory of clients and course buyers. Direct WhatsApp contact and purchase records.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, WhatsApp (+252), email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Refunded">Refunded</option>
          </select>
          <span className="text-xs text-slate-400 font-mono">
            {filtered.length} customers
          </span>
        </div>
      </div>

      {/* Customer Cards Grid */}
      {filtered.length === 0 ? (
        <div className="py-14 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 p-8 space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-white">
            {db.customers.length === 0 ? 'No customers recorded yet.' : 'No customers match the selected filter.'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {db.customers.length === 0
              ? 'Customer profiles will appear automatically as you record course sales or when you add them manually.'
              : 'Try searching with another keyword or resetting the status filter.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Add Customer</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer) => {
          // Resolve purchased courses
          const courseNames = customer.purchasedCourseIds
            .map((id) => db.courses.find((c) => c.id === id)?.name)
            .filter(Boolean);

          const waLink = customer.whatsapp
            ? `https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, '')}`
            : null;

          return (
            <div
              key={customer.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 font-bold text-sm font-mono border border-amber-500/20">
                      {customer.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {customer.fullName}
                      </h3>
                      <span className="text-[10px] text-slate-500">
                        Added: {customer.createdAt}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      customer.paymentStatus === 'Paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : customer.paymentStatus === 'Pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {customer.paymentStatus}
                  </span>
                </div>

                {/* Contact Links */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span className="font-mono text-[11px]">{customer.whatsapp}</span>
                    </a>
                  )}

                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[11px] truncate max-w-[130px]">{customer.email}</span>
                    </a>
                  )}
                </div>

                {/* Courses List */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Purchased Courses / Services ({courseNames.length}):
                  </p>
                  {courseNames.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {courseNames.map((cName, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300"
                        >
                          {cName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No courses recorded yet</p>
                  )}
                </div>

                {customer.notes && (
                  <p className="mt-2 text-xs text-slate-400 italic">
                    "{customer.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500">Total Spent:</span>
                  <span className="ml-1 font-mono text-sm font-bold text-emerald-400">
                    {sym}{customer.totalPaid.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCustomerForHistory(customer)}
                    className="flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
                    title="View purchase history"
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>History</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete customer "${customer.fullName}"?`)) {
                        deleteCustomer(customer.id);
                      }
                    }}
                    className="rounded-lg p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* CUSTOMER PURCHASE HISTORY MODAL */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSelectedCustomerForHistory(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Purchase History</h2>
                <p className="text-xs text-slate-400">{selectedCustomerForHistory.fullName}</p>
              </div>
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {db.courseSales
                .filter(s => s.customerId === selectedCustomerForHistory.id)
                .map((sale) => (
                  <div key={sale.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{sale.courseName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{sale.date} • {sale.paymentMethod}</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {sym}{sale.amountReceived}
                    </span>
                  </div>
                ))}

              {db.courseSales.filter(s => s.customerId === selectedCustomerForHistory.id).length === 0 && (
                <p className="text-center py-6 text-xs text-slate-500">No sale transactions linked yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white">Add Customer Record</h2>
              <button onClick={() => setIsAddOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sahra Warsame"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+25261..."
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Enrolled in remote work course"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-amber-500 py-2.5 font-bold text-slate-950 hover:bg-amber-400"
              >
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
