import {
  DatabaseState,
  DateFilter,
  IncomeTransaction,
  ExpenseTransaction,
  AffordabilityResult,
  MoneyBucket,
  SavingsGoal,
  SavingsTransaction,
  Course,
  CourseSale,
  AISubscription,
} from '../types';

export interface CalculatedOverview {
  availableBalance: number;
  totalIncome: number;
  incomeToday: number;
  incomeThisWeek: number;
  incomeThisMonth: number;
  totalExpenses: number;
  expensesToday: number;
  expensesThisWeek: number;
  expensesThisMonth: number;
  netProfit: number;
  netProfitThisMonth: number;
  businessIncome: number;
  businessExpenses: number;
  totalCourseUnitsSold: number;
  totalCourseRevenueReceived: number;
  totalCourseOutstanding: number;
  totalCustomersCount: number;
  savingsBalance: number;
  monthlyBudgetRemaining: number;
  dailyBudgetRemaining: number;
  weeklyBudgetRemaining: number;
  dailySpent: number;
  weeklySpent: number;
  monthlySpent: number;
  dailyBudgetStatus: 'safe' | 'warning' | 'danger';
  weeklyBudgetStatus: 'safe' | 'warning' | 'danger';
  monthlyBudgetStatus: 'safe' | 'warning' | 'danger';
  dailyLimitExceededAmount: number;
  bucketBreakdown: Record<MoneyBucket, { amount: number; percentage: number }>;
  topCourse: {
    id: string;
    title: string;
    salesCount: number;
    revenue: number;
  } | null;
  aiTotalMonthly: number;
  aiTotalYearly: number;
  upcomingAIDueCount: number;
}

// Helper to determine if a date is within a specific range
export function isWithinDateFilter(dateStr: string, filter: DateFilter): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  switch (filter.range) {
    case 'today':
      return dateStr === todayStr;
    case '7days': {
      const past7 = new Date();
      past7.setDate(past7.getDate() - 7);
      past7.setHours(0, 0, 0, 0);
      return d >= past7;
    }
    case '30days': {
      const past30 = new Date();
      past30.setDate(past30.getDate() - 30);
      past30.setHours(0, 0, 0, 0);
      return d >= past30;
    }
    case '3months': {
      const past90 = new Date();
      past90.setDate(past90.getDate() - 90);
      past90.setHours(0, 0, 0, 0);
      return d >= past90;
    }
    case '6months': {
      const past180 = new Date();
      past180.setDate(past180.getDate() - 180);
      past180.setHours(0, 0, 0, 0);
      return d >= past180;
    }
    case '1year': {
      const past365 = new Date();
      past365.setDate(past365.getDate() - 365);
      past365.setHours(0, 0, 0, 0);
      return d >= past365;
    }
    case 'custom': {
      if (filter.startDate && filter.endDate) {
        return dateStr >= filter.startDate && dateStr <= filter.endDate;
      }
      if (filter.startDate) return dateStr >= filter.startDate;
      if (filter.endDate) return dateStr <= filter.endDate;
      return true;
    }
    case 'all':
    default:
      return true;
  }
}

// Check if date is today
export function isDateToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

// Check if date is within last 7 days
export function isDateThisWeek(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const past7 = new Date();
  past7.setDate(past7.getDate() - 7);
  past7.setHours(0, 0, 0, 0);
  return d >= past7;
}

// Check if date is in current calendar month
export function isDateThisMonth(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

// Core Financial Calculations Engine
export function calculateOverview(db: DatabaseState, dateFilter?: DateFilter): CalculatedOverview {
  const {
    incomeTransactions = [],
    expenseTransactions = [],
    savingsTransactions = [],
    savingsGoals = [],
    courses = [],
    courseSales = [],
    customers = [],
    aiSubscriptions = [],
    settings,
  } = db;

  const openingBalance = settings.openingBalance || 0;

  // 1. Savings Calculations (Transfers, not expenses or income)
  const totalSavingsDeposits = savingsTransactions
    .filter((t: SavingsTransaction) => t.type === 'deposit')
    .reduce((sum: number, t: SavingsTransaction) => sum + (t.amount || 0), 0);
  const totalSavingsWithdrawals = savingsTransactions
    .filter((t: SavingsTransaction) => t.type === 'withdraw')
    .reduce((sum: number, t: SavingsTransaction) => sum + (t.amount || 0), 0);
  const netSavingsMoved = totalSavingsDeposits - totalSavingsWithdrawals;
  const savingsBalance = savingsGoals.reduce((sum: number, g: SavingsGoal) => sum + (g.currentAmount || 0), 0);

  // 2. All-Time Actual Recorded Income & Expenses
  const allTimeIncome = incomeTransactions.reduce((sum: number, t: IncomeTransaction) => sum + (t.amount || 0), 0);
  const allTimeExpenses = expenseTransactions.reduce((sum: number, t: ExpenseTransaction) => sum + (t.amount || 0), 0);

  // Operating liquid balance formula:
  // Operating Balance = Opening Balance + Income Received - Expenses Paid - Net Savings Vault Transfers
  const availableBalance = openingBalance + allTimeIncome - allTimeExpenses - netSavingsMoved;

  // Filtered transactions if a filter is provided
  const filteredIncomes = dateFilter
    ? incomeTransactions.filter((t: IncomeTransaction) => isWithinDateFilter(t.date, dateFilter))
    : incomeTransactions;
  const filteredExpenses = dateFilter
    ? expenseTransactions.filter((t: ExpenseTransaction) => isWithinDateFilter(t.date, dateFilter))
    : expenseTransactions;

  // Income metrics
  const totalIncome = filteredIncomes.reduce((sum: number, t: IncomeTransaction) => sum + (t.amount || 0), 0);
  const incomeToday = incomeTransactions
    .filter((t: IncomeTransaction) => isDateToday(t.date))
    .reduce((sum: number, t: IncomeTransaction) => sum + (t.amount || 0), 0);
  const incomeThisWeek = incomeTransactions
    .filter((t: IncomeTransaction) => isDateThisWeek(t.date))
    .reduce((sum: number, t: IncomeTransaction) => sum + (t.amount || 0), 0);
  const incomeThisMonth = incomeTransactions
    .filter((t: IncomeTransaction) => isDateThisMonth(t.date))
    .reduce((sum: number, t: IncomeTransaction) => sum + (t.amount || 0), 0);

  // Expense metrics
  const totalExpenses = filteredExpenses.reduce((sum: number, t: ExpenseTransaction) => sum + (t.amount || 0), 0);
  const expensesToday = expenseTransactions
    .filter((t: ExpenseTransaction) => isDateToday(t.date))
    .reduce((sum: number, t: ExpenseTransaction) => sum + (t.amount || 0), 0);
  const expensesThisWeek = expenseTransactions
    .filter((t: ExpenseTransaction) => isDateThisWeek(t.date))
    .reduce((sum: number, t: ExpenseTransaction) => sum + (t.amount || 0), 0);
  const expensesThisMonth = expenseTransactions
    .filter((t: ExpenseTransaction) => isDateThisMonth(t.date))
    .reduce((sum: number, t: ExpenseTransaction) => sum + (t.amount || 0), 0);

  // Business revenue & expenses
  const businessIncome = incomeTransactions
    .filter((t: IncomeTransaction) =>
      t.source === 'Course Sale' ||
      t.source === 'Mentorship' ||
      t.source === 'Website Service' ||
      t.source === 'AI Service'
    )
    .reduce((sum: number, t: IncomeTransaction) => sum + (t.amount || 0), 0);

  const businessExpenses = expenseTransactions
    .filter((t: ExpenseTransaction) => t.bucket === 'Business')
    .reduce((sum: number, t: ExpenseTransaction) => sum + (t.amount || 0), 0);

  // Net Profit (All-time and This Month)
  const netProfit = allTimeIncome - allTimeExpenses;
  const netProfitThisMonth = incomeThisMonth - expensesThisMonth;

  // Course sales calculations
  // Non-refunded sales
  const validSales = courseSales.filter((s: CourseSale) => s.paymentStatus !== 'Refunded');
  const totalCourseUnitsSold = validSales.reduce((sum: number, s: CourseSale) => sum + (s.quantity || 1), 0);
  const totalCourseRevenueReceived = validSales.reduce((sum: number, s: CourseSale) => sum + (s.amountReceived || 0), 0);
  const totalCourseOutstanding = validSales.reduce((sum: number, s: CourseSale) => sum + (s.outstandingAmount || 0), 0);
  const totalCustomersCount = customers.length;

  // Spending Limits & Budgets
  const dailySpent = expensesToday;
  const weeklySpent = expensesThisWeek;
  const monthlySpent = expensesThisMonth;

  const dailyBudgetRemaining = settings.dailySpendingLimit > 0
    ? settings.dailySpendingLimit - dailySpent
    : 0;
  const weeklyBudgetRemaining = settings.weeklySpendingLimit > 0
    ? settings.weeklySpendingLimit - weeklySpent
    : 0;
  const monthlyBudgetRemaining = settings.monthlySpendingLimit > 0
    ? settings.monthlySpendingLimit - monthlySpent
    : 0;

  const dailyLimitExceededAmount = settings.dailySpendingLimit > 0
    ? Math.max(0, dailySpent - settings.dailySpendingLimit)
    : 0;

  const getStatus = (spent: number, limit: number): 'safe' | 'warning' | 'danger' => {
    if (limit <= 0) return 'safe';
    const ratio = spent / limit;
    if (ratio >= 1.0) return 'danger';
    if (ratio >= 0.8) return 'warning';
    return 'safe';
  };

  const dailyBudgetStatus = getStatus(dailySpent, settings.dailySpendingLimit);
  const weeklyBudgetStatus = getStatus(weeklySpent, settings.weeklySpendingLimit);
  const monthlyBudgetStatus = getStatus(monthlySpent, settings.monthlySpendingLimit);

  // Money Separation (Family vs Myself vs Business vs Other)
  const buckets: Record<MoneyBucket, number> = {
    Family: 0,
    Myself: 0,
    Business: 0,
    Other: 0,
    Savings: 0,
  };

  filteredExpenses.forEach((t: ExpenseTransaction) => {
    const b: MoneyBucket = (t.bucket as MoneyBucket) || 'Other';
    if (buckets[b] !== undefined) {
      buckets[b] += t.amount || 0;
    } else {
      buckets.Other += t.amount || 0;
    }
  });

  const totalBucketSpent = Math.max(1, Object.values(buckets).reduce((a: number, b: number) => a + b, 0));
  const hasAnyExpenses = filteredExpenses.length > 0;

  const bucketBreakdown: Record<MoneyBucket, { amount: number; percentage: number }> = {
    Family: {
      amount: buckets.Family,
      percentage: hasAnyExpenses ? Math.round((buckets.Family / totalBucketSpent) * 100) : 0,
    },
    Myself: {
      amount: buckets.Myself,
      percentage: hasAnyExpenses ? Math.round((buckets.Myself / totalBucketSpent) * 100) : 0,
    },
    Business: {
      amount: buckets.Business,
      percentage: hasAnyExpenses ? Math.round((buckets.Business / totalBucketSpent) * 100) : 0,
    },
    Other: {
      amount: buckets.Other,
      percentage: hasAnyExpenses ? Math.round((buckets.Other / totalBucketSpent) * 100) : 0,
    },
    Savings: {
      amount: buckets.Savings,
      percentage: hasAnyExpenses ? Math.round((buckets.Savings / totalBucketSpent) * 100) : 0,
    },
  };

  // Best Selling Course
  const coursePerformanceMap = new Map<string, { count: number; rev: number; name: string }>();
  courses.forEach((c: Course) => {
    coursePerformanceMap.set(c.id, { count: 0, rev: 0, name: c.name });
  });
  validSales.forEach((s: CourseSale) => {
    const existing = coursePerformanceMap.get(s.courseId);
    if (existing) {
      existing.count += (s.quantity || 1);
      existing.rev += (s.amountReceived || 0);
    }
  });

  let topCourse: CalculatedOverview['topCourse'] = null;
  let highestRevenue = 0;
  coursePerformanceMap.forEach((val, id) => {
    if (val.rev > highestRevenue && val.count > 0) {
      highestRevenue = val.rev;
      topCourse = {
        id,
        title: val.name,
        salesCount: val.count,
        revenue: val.rev,
      };
    }
  });

  // AI Subscriptions
  const activeAISubs = aiSubscriptions.filter((s: AISubscription) => s.isActive);
  const aiTotalMonthly = activeAISubs.reduce((sum: number, s: AISubscription) => {
    return sum + (s.billingCycle === 'Annual' ? (s.monthlyPrice || 0) / 12 : (s.monthlyPrice || 0));
  }, 0);
  const aiTotalYearly = aiTotalMonthly * 12;

  // Upcoming AI renewals within 7 days
  const now = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const upcomingAIDueCount = activeAISubs.filter((s: AISubscription) => {
    if (!s.nextPaymentDate) return false;
    const due = new Date(s.nextPaymentDate + 'T00:00:00');
    return due >= now && due <= sevenDaysLater;
  }).length;

  return {
    availableBalance,
    totalIncome,
    incomeToday,
    incomeThisWeek,
    incomeThisMonth,
    totalExpenses,
    expensesToday,
    expensesThisWeek,
    expensesThisMonth,
    netProfit,
    netProfitThisMonth,
    businessIncome,
    businessExpenses,
    totalCourseUnitsSold,
    totalCourseRevenueReceived,
    totalCourseOutstanding,
    totalCustomersCount,
    savingsBalance,
    monthlyBudgetRemaining,
    dailyBudgetRemaining,
    weeklyBudgetRemaining,
    dailySpent,
    weeklySpent,
    monthlySpent,
    dailyBudgetStatus,
    weeklyBudgetStatus,
    monthlyBudgetStatus,
    dailyLimitExceededAmount,
    bucketBreakdown,
    topCourse,
    aiTotalMonthly,
    aiTotalYearly,
    upcomingAIDueCount,
  };
}

// "Can I Afford This?" decision intelligence
export function evaluateCanIAffordThis(
  amount: number,
  category: string | undefined,
  db: DatabaseState
): AffordabilityResult {
  const overview = calculateOverview(db);
  const { settings } = db;
  const balanceAfter = overview.availableBalance - amount;

  const dailyAfter = overview.dailySpent + amount;
  const weeklyAfter = overview.weeklySpent + amount;
  const monthlyAfter = overview.monthlySpent + amount;

  const dailyExceeds = settings.dailySpendingLimit > 0 && dailyAfter > settings.dailySpendingLimit
    ? dailyAfter - settings.dailySpendingLimit
    : undefined;
  const weeklyExceeds = settings.weeklySpendingLimit > 0 && weeklyAfter > settings.weeklySpendingLimit
    ? weeklyAfter - settings.weeklySpendingLimit
    : undefined;
  const monthlyExceeds = settings.monthlySpendingLimit > 0 && monthlyAfter > settings.monthlySpendingLimit
    ? monthlyAfter - settings.monthlySpendingLimit
    : undefined;

  let status: 'safe' | 'caution' | 'danger' = 'safe';
  let headline = 'Safe to spend.';
  let message = `You have ample available balance (${settings.currencySymbol}${overview.availableBalance.toLocaleString()}) and comfortable headroom.`;

  if (balanceAfter < 0) {
    status = 'danger';
    headline = 'Not recommended. Insufficient funds.';
    message = `This purchase would put your available balance into the negative by ${settings.currencySymbol}${Math.abs(balanceAfter).toFixed(2)}.`;
  } else if (monthlyExceeds || (dailyExceeds && dailyExceeds > settings.dailySpendingLimit * 0.5)) {
    status = 'danger';
    headline = 'Not recommended. Exceeds budget.';
    message = `This purchase will push you over your planned spending limits. Monthly budget would be exceeded by ${settings.currencySymbol}${(monthlyExceeds || 0).toFixed(2)}.`;
  } else if (dailyExceeds || weeklyExceeds) {
    status = 'caution';
    headline = 'Be careful. High budget impact.';
    message = `This will significantly reduce your remaining headroom for the period.`;
  }

  return {
    amount,
    category,
    status,
    headline,
    message,
    availableBalanceAfter: balanceAfter,
    dailyBudgetImpact: {
      budget: settings.dailySpendingLimit,
      spentToday: overview.dailySpent,
      afterSpend: dailyAfter,
      exceedsBy: dailyExceeds,
    },
    weeklyBudgetImpact: {
      budget: settings.weeklySpendingLimit,
      spentThisWeek: overview.weeklySpent,
      afterSpend: weeklyAfter,
      exceedsBy: weeklyExceeds,
    },
    monthlyBudgetImpact: {
      budget: settings.monthlySpendingLimit,
      spentThisMonth: overview.monthlySpent,
      afterSpend: monthlyAfter,
      exceedsBy: monthlyExceeds,
    },
    upcomingAIDueSoon: overview.aiTotalMonthly,
  };
}

// Chart dataset builder for Income vs Expenses over past days
export function generateIncomeVsExpenseChartData(
  incomes: IncomeTransaction[],
  expenses: ExpenseTransaction[],
  daysCount = 14
) {
  const result: { date: string; label: string; income: number; expense: number; profit: number }[] = [];
  const now = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const dayIncome = incomes
      .filter((t: IncomeTransaction) => t.date === dateStr)
      .reduce((sum: number, t: IncomeTransaction) => sum + (t.amount || 0), 0);

    const dayExpense = expenses
      .filter((t: ExpenseTransaction) => t.date === dateStr)
      .reduce((sum: number, t: ExpenseTransaction) => sum + (t.amount || 0), 0);

    result.push({
      date: dateStr,
      label,
      income: dayIncome,
      expense: dayExpense,
      profit: dayIncome - dayExpense,
    });
  }

  return result;
}

// Generate expense breakdown by categories
export function generateCategoryExpenseChartData(expenses: ExpenseTransaction[]) {
  const catMap = new Map<string, number>();
  expenses.forEach((e: ExpenseTransaction) => {
    const cat = e.category || 'Other';
    catMap.set(cat, (catMap.get(cat) || 0) + (e.amount || 0));
  });

  const total = Math.max(1, expenses.reduce((s: number, e: ExpenseTransaction) => s + (e.amount || 0), 0));
  return Array.from(catMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / total) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);
}
