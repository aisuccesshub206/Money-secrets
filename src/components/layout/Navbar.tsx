import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  PlusCircle,
  MinusCircle,
  Bell,
  Sparkles,
  Calculator,
  Menu,
  ShieldCheck,
  LogOut,
  Wallet,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    overview,
    db,
    setIsIncomeModalOpen,
    setIsExpenseModalOpen,
    setIsAffordModalOpen,
    setIsNotificationsOpen,
    unreadNotificationsCount,
    logout,
  } = useApp();

  const sym = db.settings.currencySymbol;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-3 md:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 md:hidden active:scale-95"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 font-bold text-slate-950 shadow-md shadow-emerald-950/40">
            <span className="font-mono text-base font-extrabold tracking-tighter">XN</span>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">XirfadoNet</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Owner
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 leading-none">Business & Money Center</p>
          </div>
        </div>
      </div>

      {/* Center: Live Available Liquid Balance pill */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1.5 shadow-inner">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <span className="hidden text-[11px] font-medium uppercase tracking-wider text-slate-400 sm:inline">
            Balance
          </span>
          <span className={`font-mono text-sm font-bold ${overview.availableBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {sym}{overview.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Can I afford this quick button */}
        <button
          onClick={() => setIsAffordModalOpen(true)}
          className="hidden lg:flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 active:scale-95 transition-colors"
          title="Can I afford this spending test"
        >
          <Calculator className="h-3.5 w-3.5 text-indigo-400" />
          <span>Afford Check?</span>
        </button>
      </div>

      {/* Right: Quick +Income & +Expense & Notifications & User */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Fast + Income Button */}
        <button
          onClick={() => setIsIncomeModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">+ Income</span>
          <span className="sm:hidden font-bold">+ Inc</span>
        </button>

        {/* Fast + Expense Button */}
        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 px-2.5 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/25 active:scale-95 transition-all"
        >
          <MinusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">+ Expense</span>
          <span className="sm:hidden font-bold">+ Exp</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 active:scale-95 transition-colors"
          aria-label="Open notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile / Logout */}
        <div className="relative group ml-1">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
            title="Lock / Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
