export type NavigationTab =
  | 'dashboard'
  | 'money'
  | 'expenses'
  | 'history'
  | 'budgets'
  | 'separation'
  | 'business'
  | 'courses'
  | 'course-sales'
  | 'customers'
  | 'mentorship'
  | 'ai-tools'
  | 'savings'
  | 'goals'
  | 'tasks'
  | 'content'
  | 'planner'
  | 'analytics'
  | 'reports'
  | 'ai-assistant'
  | 'settings';

export type MoneyBucket = 'Family' | 'Myself' | 'Business' | 'Other' | 'Savings';

export type IncomeSource =
  | 'Course Sale'
  | 'Mentorship'
  | 'Website Service'
  | 'AI Service'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'EVC'
  | 'Waafi'
  | 'Bank'
  | 'Card'
  | 'Other';

export type ExpenseCategory =
  | 'Family'
  | 'Personal / Myself'
  | 'Business'
  | 'Food'
  | 'Transport'
  | 'Internet / Phone'
  | 'AI Tools'
  | 'Website / Hosting'
  | 'Domain'
  | 'Marketing'
  | 'Education'
  | 'Bills'
  | 'Other';

export type CourseStatus = 'Active' | 'Draft' | 'Inactive';

export type PaymentStatus = 'Paid' | 'Pending' | 'Partial' | 'Refunded';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ContentStage =
  | 'Idea'
  | 'Writing'
  | 'Recording'
  | 'Editing'
  | 'Ready'
  | 'Published';

export type ContentType =
  | 'Course Lesson'
  | 'Article'
  | 'YouTube Video'
  | 'Facebook Video'
  | 'TikTok'
  | 'AI Tutorial'
  | 'Other';

export type GoalType =
  | 'Monthly income'
  | 'Course sales'
  | 'Savings'
  | 'Customers'
  | 'Profit'
  | 'Business growth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin';
  avatar?: string;
  pin?: string;
  isAuthenticated: boolean;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  lessonsCount?: number;
  status: CourseStatus;
  thumbnail?: string;
  notes?: string;
  createdAt: string;
}

export interface CourseSale {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  quantity: number;
  salePrice: number;
  amountReceived: number;
  outstandingAmount: number;
  customerId?: string;
  customerName?: string;
  customerWhatsapp?: string;
  customerEmail?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  incomeTransactionId?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  whatsapp: string;
  email: string;
  purchasedCourseIds: string[];
  totalPaid: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  lastPurchaseDate?: string;
}

export interface IncomeTransaction {
  id: string;
  amount: number;
  date: string; // ISO string YYYY-MM-DD
  source: IncomeSource;
  customerName?: string;
  customerWhatsapp?: string;
  customerEmail?: string;
  courseOrService?: string;
  courseId?: string;
  customerId?: string;
  courseSaleId?: string;
  mentorshipClientId?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface ExpenseTransaction {
  id: string;
  amount: number;
  date: string; // ISO string YYYY-MM-DD
  category: ExpenseCategory;
  bucket: MoneyBucket;
  subcategory?: string;
  description: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  aiSubscriptionId?: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  notes?: string;
  createdAt: string;
}

export interface SavingsTransaction {
  id: string;
  savingsGoalId: string;
  savingsGoalName: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  unit?: string;
  deadline?: string;
  notes?: string;
  createdAt: string;
}

export interface MentorshipClient {
  id: string;
  clientName: string;
  whatsapp: string;
  email: string;
  package: string;
  price: number;
  paymentStatus: PaymentStatus;
  startDate: string;
  sessionsPlanned: number;
  sessionsCompleted: number;
  nextSession?: string;
  notes?: string;
  createdAt: string;
}

export interface AISubscription {
  id: string;
  toolName: string;
  monthlyPrice: number;
  billingCycle: 'Monthly' | 'Annual';
  nextPaymentDate: string;
  category: 'Video' | 'Image' | 'Writing' | 'Coding' | 'Hosting' | 'API' | 'Other';
  notes?: string;
  isActive: boolean;
  websiteUrl?: string;
}

export interface WebsiteTask {
  id: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  dueDate?: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  createdAt: string;
}

export interface ContentTask {
  id: string;
  title: string;
  description?: string;
  contentType: ContentType;
  courseId?: string;
  courseName?: string;
  stage: ContentStage;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

export interface DailyTask {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  priority: PriorityLevel;
  isImportant: boolean;
  isCompleted: boolean;
  isRecurring: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  title: string;
  message: string;
  date: string;
  read: boolean;
  targetTab?: NavigationTab;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  language: 'en' | 'so';
  openingBalance: number;
  dailySpendingLimit: number;
  weeklySpendingLimit: number;
  monthlySpendingLimit: number;
  defaultMentorshipPrice: number;
  monthlyIncomeGoal: number;
  categorySpendingLimits: Record<string, number>;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  notificationsEnabled: boolean;
  requirePin: boolean;
  securityPin: string;
}

export interface DatabaseState {
  user: User;
  settings: AppSettings;
  courses: Course[];
  courseSales: CourseSale[];
  customers: Customer[];
  incomeTransactions: IncomeTransaction[];
  expenseTransactions: ExpenseTransaction[];
  savingsGoals: SavingsGoal[];
  savingsTransactions: SavingsTransaction[];
  financialGoals: FinancialGoal[];
  mentorshipClients: MentorshipClient[];
  aiSubscriptions: AISubscription[];
  websiteTasks: WebsiteTask[];
  contentTasks: ContentTask[];
  dailyTasks: DailyTask[];
  notifications: NotificationItem[];
}

export type DateFilterRange =
  | 'today'
  | '7days'
  | '30days'
  | '3months'
  | '6months'
  | '1year'
  | 'all'
  | 'custom';

export interface DateFilter {
  range: DateFilterRange;
  startDate?: string;
  endDate?: string;
}

export interface AffordabilityResult {
  amount: number;
  category?: string;
  status: 'safe' | 'caution' | 'danger';
  headline: string;
  message: string;
  availableBalanceAfter: number;
  dailyBudgetImpact: {
    budget: number;
    spentToday: number;
    afterSpend: number;
    exceedsBy?: number;
  };
  weeklyBudgetImpact: {
    budget: number;
    spentThisWeek: number;
    afterSpend: number;
    exceedsBy?: number;
  };
  monthlyBudgetImpact: {
    budget: number;
    spentThisMonth: number;
    afterSpend: number;
    exceedsBy?: number;
  };
  upcomingAIDueSoon: number;
}
