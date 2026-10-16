import React from 'react';
import { useApp } from '../../context/AppContext';
import { MoneyBucket } from '../../types';
import {
  PieChart,
  Users,
  User,
  Briefcase,
  PiggyBank,
  Layers,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

export const MoneySeparationView: React.FC = () => {
  const { overview, db, setActiveTab } = useApp();
  const sym = db.settings.currencySymbol;

  const buckets: {
    id: MoneyBucket;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    amount: number;
    percentage: number;
    borderColor: string;
    bgColor: string;
    textColor: string;
    barColor: string;
  }[] = [
    {
      id: 'Family',
      title: 'Family Support',
      description: 'Groceries, health assistance, household bills, and parent/family transfers',
      icon: Users,
      amount: overview.bucketBreakdown.Family.amount,
      percentage: overview.bucketBreakdown.Family.percentage,
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-300',
      barColor: 'bg-amber-500',
    },
    {
      id: 'Myself',
      title: 'Myself / Personal',
      description: 'Personal books, cafes, transport, fitness, clothes, and personal spending',
      icon: User,
      amount: overview.bucketBreakdown.Myself.amount,
      percentage: overview.bucketBreakdown.Myself.percentage,
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-300',
      barColor: 'bg-blue-500',
    },
    {
      id: 'Business',
      title: 'XirfadoNet Business',
      description: 'Web hosting, domains, AI API tools, advertising, equipment, and production',
      icon: Briefcase,
      amount: overview.bucketBreakdown.Business.amount,
      percentage: overview.bucketBreakdown.Business.percentage,
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-300',
      barColor: 'bg-emerald-500',
    },
    {
      id: 'Savings',
      title: 'Savings & Reserves',
      description: 'Emergency safety reserve, workstation upgrades, and long-term funds',
      icon: PiggyBank,
      amount: overview.savingsBalance,
      percentage: Math.min(100, Math.round((overview.savingsBalance / Math.max(1, overview.totalIncome)) * 100)),
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-300',
      barColor: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <PieChart className="h-6 w-6 text-cyan-400" />
          Money Separation: Family • Myself • Business • Savings
        </h1>
        <p className="text-xs text-slate-400">
          Clear visual boundaries so your business income never accidentally swallows personal or family reserves.
        </p>
      </div>

      {/* Visual Percentage Distribution Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Expenditure Ratio</h2>
          <span className="text-xs text-slate-400 font-mono">100% Total Outflow</span>
        </div>

        <div className="flex h-5 w-full rounded-xl overflow-hidden bg-slate-950 p-1 border border-slate-800 gap-1">
          {buckets.map((b) => (
            <div
              key={b.id}
              className={`${b.barColor} rounded-md transition-all relative group`}
              style={{ width: `${Math.max(5, b.percentage)}%` }}
              title={`${b.title}: ${b.percentage}%`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          {buckets.map((b) => (
            <div key={b.id} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${b.barColor}`} />
              <span className="text-slate-300 font-medium">{b.title}:</span>
              <span className="font-bold text-white font-mono">{b.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buckets.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.id}
              className={`rounded-3xl border ${b.borderColor} ${b.bgColor} p-6 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <Icon className={`h-5 w-5 ${b.textColor}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{b.title}</h3>
                      <p className="text-[11px] text-slate-400">{b.description}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 ${b.textColor}`}>
                    {b.percentage}%
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/60">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Total Allocated</p>
                  <p className="mt-1 font-mono text-3xl font-black text-white">
                    {sym}{b.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setActiveTab(b.id === 'Savings' ? 'savings' : 'expenses')}
                  className="flex items-center gap-1 text-xs font-bold text-white hover:underline"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Owner Takeaway Advice */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs font-bold text-white mb-1">💡 Owner Budgeting Principle:</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Keep business operations lean. Ideally, business tools should take &lt; 20% of revenue, family support is planned in advance, and at least 20% of net course sales gets swept straight into the Savings Vault.
        </p>
      </div>
    </div>
  );
};
