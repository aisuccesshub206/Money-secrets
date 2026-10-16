import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MentorshipClient, PaymentStatus } from '../../types';
import { getTodayDateString } from '../../utils/storage';
import {
  Handshake,
  PlusCircle,
  MessageCircle,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  X,
  TrendingUp,
} from 'lucide-react';

export const MentorshipView: React.FC = () => {
  const {
    db,
    addMentorshipClient,
    editMentorshipClient,
    deleteMentorshipClient,
  } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<MentorshipClient | null>(null);

  // Form states
  const [clientName, setClientName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [packageTitle, setPackageTitle] = useState('1-on-1 Full Stack AI Career Mentorship (4 Sessions)');
  const [price, setPrice] = useState(db.settings.defaultMentorshipPrice.toString());
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [sessionsPlanned, setSessionsPlanned] = useState('4');
  const [sessionsCompleted, setSessionsCompleted] = useState('0');
  const [nextSession, setNextSession] = useState('');
  const [notes, setNotes] = useState('');

  const sym = db.settings.currencySymbol;

  // Active vs Completed
  const activeClients = db.mentorshipClients.filter(c => c.sessionsCompleted < c.sessionsPlanned);
  const completedClients = db.mentorshipClients.filter(c => c.sessionsCompleted >= c.sessionsPlanned);
  const totalRevenue = db.mentorshipClients
    .filter(c => c.paymentStatus === 'Paid')
    .reduce((sum, c) => sum + c.price, 0);

  const handleOpenAdd = () => {
    setEditingClient(null);
    setClientName('');
    setWhatsapp('');
    setEmail('');
    setPackageTitle('1-on-1 Full Stack AI Coaching (4 Sessions)');
    setPrice(db.settings.defaultMentorshipPrice.toString());
    setPaymentStatus('Paid');
    setStartDate(getTodayDateString());
    setSessionsPlanned('4');
    setSessionsCompleted('0');
    setNextSession('');
    setNotes('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (client: MentorshipClient) => {
    setEditingClient(client);
    setClientName(client.clientName);
    setWhatsapp(client.whatsapp);
    setEmail(client.email);
    setPackageTitle(client.package);
    setPrice(client.price.toString());
    setPaymentStatus(client.paymentStatus);
    setStartDate(client.startDate);
    setSessionsPlanned(client.sessionsPlanned.toString());
    setSessionsCompleted(client.sessionsCompleted.toString());
    setNextSession(client.nextSession || '');
    setNotes(client.notes || '');
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price) || 0;
    const plan = parseInt(sessionsPlanned, 10) || 1;
    const done = parseInt(sessionsCompleted, 10) || 0;

    if (editingClient) {
      editMentorshipClient(editingClient.id, {
        clientName,
        whatsapp,
        email,
        package: packageTitle,
        price: p,
        paymentStatus,
        startDate,
        sessionsPlanned: plan,
        sessionsCompleted: done,
        nextSession: nextSession || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addMentorshipClient({
        clientName,
        whatsapp,
        email,
        package: packageTitle,
        price: p,
        paymentStatus,
        startDate,
        sessionsPlanned: plan,
        sessionsCompleted: done,
        nextSession: nextSession || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsAddOpen(false);
  };

  const incrementSession = (client: MentorshipClient) => {
    if (client.sessionsCompleted < client.sessionsPlanned) {
      editMentorshipClient(client.id, {
        sessionsCompleted: client.sessionsCompleted + 1,
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Handshake className="h-6 w-6 text-cyan-400" />
            1-on-1 Mentorship Coaching
          </h1>
          <p className="text-xs text-slate-400">
            Premium high-ticket client packages (Default: {sym}{db.settings.defaultMentorshipPrice}/package).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Add Mentorship Client</span>
        </button>
      </div>

      {/* 3 Metric Cards as Requested in Section 12 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Mentorship Clients</p>
          <p className="mt-2 font-mono text-3xl font-black text-cyan-400">
            {activeClients.length}
          </p>
          <p className="text-[10px] text-slate-500">Sessions in progress</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed Mentorships</p>
          <p className="mt-2 font-mono text-3xl font-black text-emerald-400">
            {completedClients.length}
          </p>
          <p className="text-[10px] text-slate-500">Finished all planned sessions</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mentorship Revenue</p>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {sym}{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-400">High-ticket margin</p>
        </div>
      </div>

      {/* Active Clients */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">Active Clients ({activeClients.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeClients.map((client) => {
            const waLink = client.whatsapp
              ? `https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}`
              : null;
            const progressPct = Math.round((client.sessionsCompleted / client.sessionsPlanned) * 100);

            return (
              <div
                key={client.id}
                className="rounded-3xl border border-cyan-500/20 bg-slate-900 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{client.clientName}</h3>
                      <p className="text-[11px] text-cyan-300 font-medium">{client.package}</p>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {sym}{client.price}
                    </span>
                  </div>

                  {/* Sessions progress bar */}
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-3">
                    <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                      <span>Sessions Progress:</span>
                      <span className="font-mono font-bold">
                        {client.sessionsCompleted} / {client.sessionsPlanned} ({progressPct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="mt-3 flex justify-between items-center pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400">
                        Next: {client.nextSession || 'TBD'}
                      </span>
                      <button
                        onClick={() => incrementSession(client)}
                        className="rounded-lg bg-cyan-500/20 px-2 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/30"
                      >
                        + 1 Done
                      </button>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="mt-3 flex gap-2">
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-400"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Started: {client.startDate}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEdit(client)} className="p-1 text-slate-400 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove mentorship client ${client.clientName}?`)) {
                          deleteMentorshipClient(client.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Clients */}
      {completedClients.length > 0 && (
        <div className="pt-4">
          <h2 className="text-sm font-bold text-slate-400 mb-3">Completed Mentorships ({completedClients.length})</h2>
          <div className="space-y-2">
            {completedClients.map((c) => (
              <div key={c.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="font-bold text-white">{c.clientName}</p>
                    <p className="text-[11px] text-slate-400">{c.package} • Completed all {c.sessionsPlanned} sessions</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-white">{sym}{c.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white">
                {editingClient ? 'Edit Mentorship' : 'New Mentorship Client'}
              </h2>
              <button onClick={() => setIsAddOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price ({sym}) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Package Title *</label>
                <input
                  type="text"
                  required
                  value={packageTitle}
                  onChange={(e) => setPackageTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sessions Planned</label>
                  <input
                    type="number"
                    value={sessionsPlanned}
                    onChange={(e) => setSessionsPlanned(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sessions Completed</label>
                  <input
                    type="number"
                    value={sessionsCompleted}
                    onChange={(e) => setSessionsCompleted(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Next Session Date</label>
                  <input
                    type="date"
                    value={nextSession}
                    onChange={(e) => setNextSession(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-cyan-500 py-2.5 font-bold text-slate-950 hover:bg-cyan-400"
              >
                Save Mentorship
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
