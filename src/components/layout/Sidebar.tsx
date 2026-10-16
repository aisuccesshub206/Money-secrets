import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  History,
  Scale,
  BookOpen,
  ShoppingBag,
  Users,
  Handshake,
  Cpu,
  PiggyBank,
  Target,
  CheckSquare,
  Film,
  CalendarDays,
  PieChart,
  FileSpreadsheet,
  Bot,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavGroup {
  groupName: string;
  items: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { activeTab, setActiveTab, overview, db, t } = useApp();

  const sym = db.settings.currencySymbol;

  // Grouped Navigation structure directly following user requirements
  const navigationGroups: NavGroup[] = [
    {
      groupName: t.overview,
      items: [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
      ],
    },
    {
      groupName: t.money,
      items: [
        { id: 'money', label: t.income, icon: Wallet, badge: overview.incomeThisMonth > 0 ? `${sym}${Math.round(overview.incomeThisMonth)}` : undefined },
        { id: 'expenses', label: t.expenses, icon: Receipt, badge: overview.expensesThisMonth > 0 ? `${sym}${Math.round(overview.expensesThisMonth)}` : undefined },
        { id: 'history', label: t.transactions, icon: History },
        { id: 'budgets', label: t.budgets, icon: Scale },
      ],
    },
    {
      groupName: t.business,
      items: [
        { id: 'courses', label: t.courses, icon: BookOpen, badge: db.courses.length > 0 ? db.courses.length : undefined },
        { id: 'course-sales', label: t.courseSales, icon: ShoppingBag, badge: overview.totalCourseUnitsSold > 0 ? overview.totalCourseUnitsSold : undefined },
        { id: 'customers', label: t.customers, icon: Users, badge: db.customers.length > 0 ? db.customers.length : undefined },
        { id: 'mentorship', label: t.mentorship, icon: Handshake },
        { id: 'ai-tools', label: t.aiSubscriptions, icon: Cpu },
      ],
    },
    {
      groupName: t.personalFinance,
      items: [
        { id: 'savings', label: t.savings, icon: PiggyBank, badge: overview.savingsBalance > 0 ? `${sym}${overview.savingsBalance}` : undefined },
        { id: 'goals', label: t.goals, icon: Target },
      ],
    },
    {
      groupName: t.work,
      items: [
        { id: 'tasks', label: t.websiteTasks, icon: CheckSquare },
        { id: 'content', label: t.contentPlanner, icon: Film },
        { id: 'planner', label: t.dailyPlanner, icon: CalendarDays },
      ],
    },
    {
      groupName: t.insights,
      items: [
        { id: 'analytics', label: t.analytics, icon: PieChart },
        { id: 'reports', label: t.monthlyReports, icon: FileSpreadsheet },
        { id: 'ai-assistant', label: t.aiMoneyAssistant, icon: Bot },
      ],
    },
    {
      groupName: t.system,
      items: [
        { id: 'settings', label: t.settings, icon: Settings },
      ],
    },
  ];

  const handleSelect = (tab: NavigationTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-800">
      <div>
        {/* Mobile close button */}
        <div className="flex items-center justify-between pb-3 md:hidden border-b border-slate-800 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-emerald-400">XirfadoNet</span>
            <span className="text-xs text-slate-400">{t.dashboard}</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grouped Nav Items */}
        <div className="space-y-4">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {group.groupName}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-slate-950' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-semibold ${
                          isActive
                            ? 'bg-slate-950 text-emerald-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Owner Badge */}
      <div className="mt-6 border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between rounded-2xl bg-slate-900/60 p-2.5 border border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs font-mono">
              XN
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{db.settings.ownerName || 'Ridwan'}</p>
              <p className="text-[10px] text-slate-400 leading-tight">Owner</p>
            </div>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-800/80 md:bg-slate-950 md:shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-slate-950 border-r border-slate-800 p-2 shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
