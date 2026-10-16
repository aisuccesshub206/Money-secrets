import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { AuthPages } from './components/auth/AuthPages';

// Feature Views
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { IncomeManager } from './components/income/IncomeManager';
import { ExpenseManager } from './components/expenses/ExpenseManager';
import { MoneySeparationView } from './components/separation/MoneySeparationView';
import { BudgetLimitsView } from './components/budgets/BudgetLimitsView';
import { CourseManager } from './components/courses/CourseManager';
import { CustomerDatabase } from './components/customers/CustomerDatabase';
import { MentorshipView } from './components/mentorship/MentorshipView';
import { SavingsView } from './components/savings/SavingsView';
import { FinancialGoalsView } from './components/goals/FinancialGoalsView';
import { BusinessExpensesView } from './components/business/BusinessExpensesView';
import { AIToolsTracker } from './components/ai-tools/AIToolsTracker';
import { AIAssistantView } from './components/ai-assistant/AIAssistantView';
import { TasksAndPlannerView } from './components/planner/TasksAndPlannerView';
import { MonthlyReportView } from './components/reports/MonthlyReportView';
import { TransactionHistory } from './components/history/TransactionHistory';
import { SettingsView } from './components/settings/SettingsView';

// Global Modals
import { QuickIncomeModal } from './components/modals/QuickIncomeModal';
import { QuickExpenseModal } from './components/modals/QuickExpenseModal';
import { CanIAffordThisModal } from './components/modals/CanIAffordThisModal';
import { CourseSaleModal } from './components/courses/CourseSaleModal';
import { SavingsDepositModal } from './components/savings/SavingsDepositModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';

const DashboardShell: React.FC = () => {
  const { isAuthenticated, activeTab } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If user is not authenticated, show secure Owner Auth portal
  if (!isAuthenticated) {
    return <AuthPages />;
  }

  // Active view router
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OverviewDashboard />;
      case 'money':
        return <IncomeManager />;
      case 'expenses':
        return <ExpenseManager />;
      case 'separation':
        return <MoneySeparationView />;
      case 'budgets':
        return <BudgetLimitsView />;
      case 'courses':
        return <CourseManager initialView="catalog" />;
      case 'course-sales':
        return <CourseManager initialView="sales" />;
      case 'customers':
        return <CustomerDatabase />;
      case 'mentorship':
        return <MentorshipView />;
      case 'savings':
        return <SavingsView />;
      case 'goals':
        return <FinancialGoalsView />;
      case 'business':
        return <BusinessExpensesView />;
      case 'ai-tools':
        return <AIToolsTracker />;
      case 'ai-assistant':
        return <AIAssistantView />;
      case 'tasks':
        return <TasksAndPlannerView initialTab="website" />;
      case 'content':
        return <TasksAndPlannerView initialTab="content" />;
      case 'planner':
        return <TasksAndPlannerView initialTab="daily" />;
      case 'reports':
      case 'analytics':
        return <MonthlyReportView />;
      case 'history':
        return <TransactionHistory />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* Main Body with Sidebar & Content */}
      <div className="flex flex-1">
        <Sidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto w-full mb-16 md:mb-0">
          {renderActiveView()}
        </main>
      </div>

      {/* iOS-optimized Mobile Thumb Bottom Navigation */}
      <BottomNav onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

      {/* Global Modals & Drawers */}
      <QuickIncomeModal />
      <QuickExpenseModal />
      <CanIAffordThisModal />
      <CourseSaleModal />
      <SavingsDepositModal />
      <NotificationDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DashboardShell />
    </AppProvider>
  );
}
