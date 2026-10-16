import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  BookOpen,
  Menu,
  Plus,
  PlusCircle,
  MinusCircle,
  Calculator,
  X,
  ShoppingBag,
} from 'lucide-react';

interface BottomNavProps {
  onOpenMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMobileMenu }) => {
  const {
    activeTab,
    setActiveTab,
    setIsIncomeModalOpen,
    setIsExpenseModalOpen,
    setIsAffordModalOpen,
    setIsCourseSaleModalOpen,
  } = useApp();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const tabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'money', label: 'Income', icon: Wallet },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'courses', label: 'Courses', icon: BookOpen },
  ];

  return (
    <>
      {/* Quick Action Floating Sheet for Mobile */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsSheetOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-t-3xl border-t border-slate-800 bg-slate-900 p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-700" />
            
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-sm font-bold text-white">Quick Record Action</h3>
              <button
                onClick={() => setIsSheetOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  setIsSheetOpen(false);
                  setIsIncomeModalOpen(true);
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center active:scale-95 transition-transform"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-emerald-400">+ Add Income</span>
              </button>

              <button
                onClick={() => {
                  setIsSheetOpen(false);
                  setIsExpenseModalOpen(true);
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-center active:scale-95 transition-transform"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white">
                  <MinusCircle className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-rose-400">+ Add Expense</span>
              </button>

              <button
                onClick={() => {
                  setIsSheetOpen(false);
                  setIsCourseSaleModalOpen(true);
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 text-center active:scale-95 transition-transform"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-slate-950">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-cyan-400">Course Sale</span>
              </button>

              <button
                onClick={() => {
                  setIsSheetOpen(false);
                  setIsAffordModalOpen(true);
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 text-center active:scale-95 transition-transform"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
                  <Calculator className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-indigo-300">Can I Afford This?</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-800 bg-slate-950/95 px-2 backdrop-blur-lg md:hidden pb-safe">
        {/* Tab 1: Overview */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Overview</span>
        </button>

        {/* Tab 2: Income */}
        <button
          onClick={() => setActiveTab('money')}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'money' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Wallet className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Income</span>
        </button>

        {/* Center: Quick Action Button */}
        <div className="flex flex-1 items-center justify-center">
          <button
            onClick={() => setIsSheetOpen(true)}
            className="flex h-11 w-11 -translate-y-2 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
            aria-label="Quick Action"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Expenses */}
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'expenses' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Receipt className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Expenses</span>
        </button>

        {/* Tab 4: More Menu */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-1 flex-col items-center justify-center py-1 text-slate-400 active:text-white"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
};
