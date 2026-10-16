import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AISubscription } from '../../types';
import { getDateOffset, getTodayDateString } from '../../utils/storage';
import {
  Cpu,
  PlusCircle,
  Calendar,
  AlertCircle,
  ExternalLink,
  Trash2,
  CheckCircle,
  X,
  DollarSign,
  Sparkles,
} from 'lucide-react';

export const AIToolsTracker: React.FC = () => {
  const { db, overview, addAISubscription, editAISubscription, deleteAISubscription } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [toolName, setToolName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('20');
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Annual'>('Monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState(getDateOffset(7));
  const [category, setCategory] = useState<AISubscription['category']>('Writing');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [notes, setNotes] = useState('');

  const sym = db.settings.currencySymbol;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(monthlyPrice) || 0;
    if (!toolName.trim()) return;

    addAISubscription({
      toolName: toolName.trim(),
      monthlyPrice: p,
      billingCycle,
      nextPaymentDate,
      category,
      websiteUrl: websiteUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      isActive: true,
    });

    setIsAddOpen(false);
    setToolName('');
    setWebsiteUrl('');
    setNotes('');
  };

  const today = new Date();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-cyan-400" />
            AI Tool Subscriptions & Stack
          </h1>
          <p className="text-xs text-slate-400">
            Track recurring AI tool costs, video generators, LLM APIs, and upcoming payment renewals.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Add AI Subscription</span>
        </button>
      </div>

      {/* Top Aggregations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total AI Costs / Month</p>
          <p className="mt-2 font-mono text-3xl font-black text-cyan-400">
            {sym}{overview.aiTotalMonthly.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-500">Active subscriptions</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Projected AI Costs / Year</p>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {sym}{overview.aiTotalYearly.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-500">12-month burn rate</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Upcoming Renewals (7 Days)</p>
          <p className="mt-2 font-mono text-3xl font-black text-amber-400">
            {overview.upcomingAIDueCount}
          </p>
          <p className="text-[10px] text-slate-500">Due within next week</p>
        </div>
      </div>

      {/* AI Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.aiSubscriptions.map((sub) => {
          const dueDate = new Date(sub.nextPaymentDate + 'T00:00:00');
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isDueSoon = diffDays >= 0 && diffDays <= 5;

          return (
            <div
              key={sub.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition-all ${
                isDueSoon
                  ? 'border-amber-500/40 bg-slate-900/90 shadow-lg shadow-amber-950/20'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      {sub.category} AI
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{sub.toolName}</h3>
                  </div>

                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-white">
                    {sym}{sub.monthlyPrice}/{sub.billingCycle === 'Monthly' ? 'mo' : 'yr'}
                  </span>
                </div>

                {/* Due renewal badge */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-300 font-mono text-[11px]">
                    Next renewal: {sub.nextPaymentDate}
                  </span>
                  {isDueSoon && (
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                      Due in {diffDays} days!
                    </span>
                  )}
                </div>

                {sub.notes && (
                  <p className="mt-3 text-xs text-slate-400 italic">
                    "{sub.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editAISubscription(sub.id, { isActive: !sub.isActive })}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      sub.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {sub.isActive ? 'Active' : 'Paused'}
                  </button>

                  {sub.websiteUrl && (
                    <a
                      href={sub.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-cyan-400"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remove subscription for ${sub.toolName}?`)) {
                      deleteAISubscription(sub.id);
                    }
                  }}
                  className="rounded-lg p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white">Add AI Tool Subscription</h2>
              <button onClick={() => setIsAddOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tool Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midjourney Pro, ChatGPT, Cursor"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price ({sym}) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Next Payment Date</label>
                  <input
                    type="date"
                    required
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  >
                    <option value="Writing">AI Writing / LLM</option>
                    <option value="Coding">Coding / IDE</option>
                    <option value="Image">AI Image</option>
                    <option value="Video">AI Video</option>
                    <option value="API">API Credits</option>
                    <option value="Hosting">Hosting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Primary use case for this tool"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-cyan-500 py-2.5 font-bold text-slate-950 hover:bg-cyan-400"
              >
                Save AI Tool
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
