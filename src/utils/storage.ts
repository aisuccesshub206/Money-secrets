import {
  Course,
  CourseSale,
  Customer,
  IncomeTransaction,
  ExpenseTransaction,
  SavingsGoal,
  SavingsTransaction,
  FinancialGoal,
  MentorshipClient,
  AISubscription,
  WebsiteTask,
  ContentTask,
  DailyTask,
  NotificationItem,
  AppSettings,
  User,
  DatabaseState,
} from '../types';

const STORAGE_KEY = 'xirfadonet_dashboard_database_v2';
const LEGACY_STORAGE_KEY = 'xirfadonet_dashboard_database_v1';

// Today's date formatted as YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Format relative date offset from today
export function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export const defaultSettings: AppSettings = {
  currency: 'USD',
  currencySymbol: '$',
  language: 'en',
  openingBalance: 0,
  dailySpendingLimit: 0,
  weeklySpendingLimit: 0,
  monthlySpendingLimit: 0,
  defaultMentorshipPrice: 100,
  monthlyIncomeGoal: 0,
  categorySpendingLimits: {
    Food: 0,
    Transport: 0,
    'Personal / Myself': 0,
    'AI Tools': 0,
    Family: 0,
  },
  businessName: 'XirfadoNet',
  ownerName: 'Ridwan',
  ownerEmail: 'owner@xirfadonet.com',
  notificationsEnabled: true,
  requirePin: false,
  securityPin: '1234',
};

export const defaultUser: User = {
  id: 'usr_owner_01',
  email: 'owner@xirfadonet.com',
  name: 'Ridwan (Owner)',
  role: 'owner',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  isAuthenticated: true,
  pin: '1234',
};

// CLEAN DEFAULT STATE: EVERYTHING DEFAULTS TO $0 WITH ZERO FAKE TRANSACTIONS
export function getCleanInitialData(): DatabaseState {
  return {
    user: defaultUser,
    settings: defaultSettings,
    courses: [],
    courseSales: [],
    customers: [],
    incomeTransactions: [],
    expenseTransactions: [],
    savingsGoals: [],
    savingsTransactions: [],
    financialGoals: [],
    mentorshipClients: [],
    aiSubscriptions: [],
    websiteTasks: [],
    contentTasks: [],
    dailyTasks: [],
    notifications: [],
  };
}

// Known hardcoded demo IDs that were auto-generated in previous versions
const DEMO_INCOME_IDS = new Set([
  'inc_01', 'inc_02', 'inc_03', 'inc_04', 'inc_05', 'inc_06',
  'inc_07', 'inc_08', 'inc_09', 'inc_10', 'inc_11',
]);
const DEMO_EXPENSE_IDS = new Set([
  'exp_01', 'exp_02', 'exp_03', 'exp_04', 'exp_05', 'exp_06',
  'exp_07', 'exp_08', 'exp_09', 'exp_10',
]);
const DEMO_SALE_IDS = new Set([
  'sale_01', 'sale_02', 'sale_03', 'sale_04', 'sale_05',
  'sale_06', 'sale_07', 'sale_08', 'sale_09',
]);
const DEMO_CUSTOMER_IDS = new Set([
  'cust_01', 'cust_02', 'cust_03', 'cust_04', 'cust_05', 'cust_06', 'cust_07',
]);
const DEMO_COURSE_IDS = new Set([
  'crs_01', 'crs_02', 'crs_03', 'crs_04', 'crs_05',
]);

// Helper to filter out only old demo data while preserving real user records
function removeDemoDataSafely(parsed: any): DatabaseState {
  const clean = getCleanInitialData();

  const realIncomes = (parsed.incomeTransactions || []).filter(
    (t: any) => !DEMO_INCOME_IDS.has(t.id) && !t.isDemo
  );
  const realExpenses = (parsed.expenseTransactions || []).filter(
    (t: any) => !DEMO_EXPENSE_IDS.has(t.id) && !t.isDemo
  );
  const realSales = (parsed.courseSales || []).filter(
    (s: any) => !DEMO_SALE_IDS.has(s.id) && !s.isDemo
  );
  const realCustomers = (parsed.customers || []).filter(
    (c: any) => !DEMO_CUSTOMER_IDS.has(c.id) && !c.isDemo
  );
  const realCourses = (parsed.courses || []).filter(
    (c: any) => !DEMO_COURSE_IDS.has(c.id) && !c.isDemo
  );

  return {
    ...clean,
    user: { ...defaultUser, ...(parsed.user || {}) },
    settings: { ...defaultSettings, ...(parsed.settings || {}) },
    courses: realCourses,
    courseSales: realSales,
    customers: realCustomers,
    incomeTransactions: realIncomes,
    expenseTransactions: realExpenses,
    savingsGoals: (parsed.savingsGoals || []).filter((g: any) => !g.id?.startsWith('svg_0')),
    savingsTransactions: (parsed.savingsTransactions || []).filter((t: any) => !t.id?.startsWith('svt_0')),
    financialGoals: (parsed.financialGoals || []).filter((g: any) => !g.id?.startsWith('fgl_0')),
    mentorshipClients: (parsed.mentorshipClients || []).filter((m: any) => !m.id?.startsWith('ment_0')),
    aiSubscriptions: (parsed.aiSubscriptions || []).filter((a: any) => !a.id?.startsWith('ai_0')),
    websiteTasks: (parsed.websiteTasks || []).filter((w: any) => !w.id?.startsWith('wtsk_0')),
    contentTasks: (parsed.contentTasks || []).filter((c: any) => !c.id?.startsWith('ctsk_0')),
    dailyTasks: (parsed.dailyTasks || []).filter((d: any) => !d.id?.startsWith('dtsk_0')),
    notifications: (parsed.notifications || []).filter((n: any) => !n.id?.startsWith('notif_0')),
  };
}

// Load database from localStorage
export function loadDatabase(): DatabaseState {
  if (typeof window === 'undefined') {
    return getCleanInitialData();
  }
  try {
    // Check v2 first and clean out any demo records safely
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      const cleaned = removeDemoDataSafely(parsed);
      return cleaned;
    }

    // Check v1 legacy to migrate any real user data, removing demo records
    const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawV1) {
      const parsed = JSON.parse(rawV1);
      const cleaned = removeDemoDataSafely(parsed);
      saveDatabase(cleaned);
      // Remove legacy
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return cleaned;
    }

    // Completely new session: clean $0 initial data
    const fresh = getCleanInitialData();
    saveDatabase(fresh);
    return fresh;
  } catch (e) {
    console.error('Failed to load database, initializing fresh $0 data:', e);
    const fresh = getCleanInitialData();
    saveDatabase(fresh);
    return fresh;
  }
}

// Persist database to localStorage
export function saveDatabase(data: DatabaseState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save database to localStorage:', e);
  }
}

// Reset database to completely clean $0 state
export function resetDatabaseToClean(): DatabaseState {
  const clean = getCleanInitialData();
  saveDatabase(clean);
  return clean;
}

// Optional sample demo data (ONLY loaded if explicitly requested by owner from Settings)
export function getSampleDemoData(): DatabaseState {
  const today = getTodayDateString();
  const yesterday = getDateOffset(-1);
  const sampleCourses: Course[] = [
    {
      id: 'sample_crs_1',
      name: 'Full-Stack Web Development',
      description: 'Modern full-stack web engineering with React & TypeScript.',
      price: 35,
      category: 'Software Development',
      lessonsCount: 30,
      status: 'Active',
      createdAt: yesterday,
    },
    {
      id: 'sample_crs_2',
      name: 'Remote Work & Freelancing Mastery',
      description: 'Strategies for landing remote tech clients worldwide.',
      price: 25,
      category: 'Freelancing',
      lessonsCount: 18,
      status: 'Active',
      createdAt: yesterday,
    },
  ];

  return {
    ...getCleanInitialData(),
    courses: sampleCourses,
  };
}
