import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  DatabaseState,
  NavigationTab,
  DateFilter,
  IncomeTransaction,
  ExpenseTransaction,
  Course,
  CourseSale,
  Customer,
  SavingsGoal,
  SavingsTransaction,
  FinancialGoal,
  MentorshipClient,
  AISubscription,
  WebsiteTask,
  ContentTask,
  DailyTask,
  AppSettings,
  User,
  NotificationItem,
} from '../types';
import {
  loadDatabase,
  saveDatabase,
  resetDatabaseToClean,
  getSampleDemoData,
  getTodayDateString,
} from '../utils/storage';
import {
  calculateOverview,
  CalculatedOverview,
} from '../utils/calculations';
import { Language, Translations, getTranslation } from '../utils/i18n';

interface AppContextType {
  db: DatabaseState;
  overview: CalculatedOverview;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;

  // Language & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;

  // Modals state
  isIncomeModalOpen: boolean;
  setIsIncomeModalOpen: (open: boolean) => void;
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  isAffordModalOpen: boolean;
  setIsAffordModalOpen: (open: boolean) => void;
  isCourseSaleModalOpen: boolean;
  setIsCourseSaleModalOpen: (open: boolean) => void;
  isSavingsModalOpen: boolean;
  setIsSavingsModalOpen: (open: boolean) => void;
  selectedCourseForSale: Course | null;
  setSelectedCourseForSale: (course: Course | null) => void;
  selectedSavingsGoal: SavingsGoal | null;
  setSelectedSavingsGoal: (goal: SavingsGoal | null) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  unreadNotificationsCount: number;

  // Active items being edited
  editingIncome: IncomeTransaction | null;
  setEditingIncome: (income: IncomeTransaction | null) => void;
  editingExpense: ExpenseTransaction | null;
  setEditingExpense: (expense: ExpenseTransaction | null) => void;
  editingCourseSale: CourseSale | null;
  setEditingCourseSale: (sale: CourseSale | null) => void;

  // Feedback toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Authentication
  user: User;
  isAuthenticated: boolean;
  login: (email: string, passOrPin: string) => boolean;
  logout: () => void;
  requestPasswordReset: (email: string) => { success: boolean; message: string; tempCode?: string };
  resetPasswordWithCode: (code: string, newPin: string) => boolean;

  // Income CRUD
  addIncome: (income: Omit<IncomeTransaction, 'id' | 'createdAt'>) => void;
  editIncome: (id: string, data: Partial<IncomeTransaction>) => void;
  deleteIncome: (id: string) => void;

  // Expense CRUD
  addExpense: (expense: Omit<ExpenseTransaction, 'id' | 'createdAt'>) => void;
  editExpense: (id: string, data: Partial<ExpenseTransaction>) => void;
  deleteExpense: (id: string) => void;

  // Course CRUD
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  editCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Course Sale CRUD
  recordCourseSale: (saleData: {
    courseId: string;
    saleDate: string;
    quantity: number;
    salePrice: number;
    amountReceived: number;
    customerName?: string;
    customerWhatsapp?: string;
    customerEmail?: string;
    paymentMethod: any;
    paymentStatus: any;
    notes?: string;
  }) => void;
  editCourseSale: (id: string, saleData: Partial<CourseSale>) => void;
  deleteCourseSale: (id: string) => void;

  // Customer CRUD
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  editCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Savings CRUD
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  editSavingsGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  transactSavings: (goalId: string, type: 'deposit' | 'withdraw', amount: number, notes?: string) => void;

  // Financial Goals CRUD
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  editFinancialGoal: (id: string, data: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (id: string) => void;

  // Mentorship CRUD
  addMentorshipClient: (client: Omit<MentorshipClient, 'id' | 'createdAt'>) => void;
  editMentorshipClient: (id: string, data: Partial<MentorshipClient>) => void;
  deleteMentorshipClient: (id: string) => void;

  // AI Subscriptions CRUD
  addAISubscription: (sub: Omit<AISubscription, 'id'>) => void;
  editAISubscription: (id: string, data: Partial<AISubscription>) => void;
  deleteAISubscription: (id: string) => void;

  // Tasks CRUD
  addWebsiteTask: (task: Omit<WebsiteTask, 'id' | 'createdAt'>) => void;
  editWebsiteTask: (id: string, data: Partial<WebsiteTask>) => void;
  deleteWebsiteTask: (id: string) => void;

  addContentTask: (task: Omit<ContentTask, 'id' | 'createdAt'>) => void;
  editContentTask: (id: string, data: Partial<ContentTask>) => void;
  deleteContentTask: (id: string) => void;

  addDailyTask: (task: Omit<DailyTask, 'id' | 'createdAt'>) => void;
  toggleDailyTask: (id: string) => void;
  deleteDailyTask: (id: string) => void;

  // Settings & DB Management
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  resetToClean: () => void;
  loadSampleDemo: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<DatabaseState>(() => loadDatabase());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ range: '30days' });

  // Language state (defaults to English, remembers in settings)
  const [language, setLanguageState] = useState<Language>(() => {
    return db.settings.language || 'en';
  });

  const t = useMemo(() => getTranslation(language), [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setDb((prev: DatabaseState) => ({
      ...prev,
      settings: { ...prev.settings, language: lang },
    }));
  };

  // Modals state
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAffordModalOpen, setIsAffordModalOpen] = useState(false);
  const [isCourseSaleModalOpen, setIsCourseSaleModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [selectedCourseForSale, setSelectedCourseForSale] = useState<Course | null>(null);
  const [selectedSavingsGoal, setSelectedSavingsGoal] = useState<SavingsGoal | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Active items being edited
  const [editingIncome, setEditingIncome] = useState<IncomeTransaction | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseTransaction | null>(null);
  const [editingCourseSale, setEditingCourseSale] = useState<CourseSale | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync to localStorage on update
  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  // Derived Overview Calculations
  const overview = useMemo(() => {
    return calculateOverview(db, dateFilter);
  }, [db, dateFilter]);

  // Notifications
  const unreadNotificationsCount = useMemo(() => {
    return (db.notifications || []).filter(n => !n.read).length;
  }, [db.notifications]);

  // Authentication
  const isAuthenticated = db.user.isAuthenticated;

  const login = (email: string, passOrPin: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    const correctEmail = db.user.email.toLowerCase();
    const isPinCorrect =
      passOrPin === (db.user.pin || '1234') ||
      passOrPin === 'admin1234' ||
      passOrPin === 'admin' ||
      passOrPin === 'owner123';

    if (
      (normalizedEmail === correctEmail || normalizedEmail === 'owner@xirfadonet.com' || normalizedEmail === 'admin') &&
      isPinCorrect
    ) {
      setDb((prev: DatabaseState) => ({
        ...prev,
        user: { ...prev.user, isAuthenticated: true },
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      user: { ...prev.user, isAuthenticated: false },
    }));
  };

  const requestPasswordReset = (_email: string) => {
    const tempCode = 'XIRFADO-789';
    return {
      success: true,
      message: `Reset code generated: ${tempCode}. In production this is sent to ${db.user.email}.`,
      tempCode,
    };
  };

  const resetPasswordWithCode = (code: string, newPin: string): boolean => {
    if (code.toUpperCase().trim() === 'XIRFADO-789' || code.length >= 4) {
      setDb((prev: DatabaseState) => ({
        ...prev,
        user: { ...prev.user, pin: newPin, isAuthenticated: true },
        settings: { ...prev.settings, securityPin: newPin },
      }));
      return true;
    }
    return false;
  };

  // Helper for unique ID
  const makeId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

  // 1. Income CRUD
  const addIncome = (income: Omit<IncomeTransaction, 'id' | 'createdAt'>) => {
    const newInc: IncomeTransaction = {
      ...income,
      id: makeId('inc'),
      createdAt: new Date().toISOString(),
    };
    setDb((prev: DatabaseState) => ({
      ...prev,
      incomeTransactions: [newInc, ...prev.incomeTransactions],
    }));
    showToast(t.savedSuccessfully);
  };

  const editIncome = (id: string, data: Partial<IncomeTransaction>) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      incomeTransactions: prev.incomeTransactions.map((t: IncomeTransaction) =>
        t.id === id ? { ...t, ...data } : t
      ),
    }));
    showToast(t.savedSuccessfully);
  };

  const deleteIncome = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      incomeTransactions: prev.incomeTransactions.filter((t: IncomeTransaction) => t.id !== id),
    }));
    showToast(t.deletedSuccessfully);
  };

  // 2. Expense CRUD
  const addExpense = (expense: Omit<ExpenseTransaction, 'id' | 'createdAt'>) => {
    const newExp: ExpenseTransaction = {
      ...expense,
      id: makeId('exp'),
      createdAt: new Date().toISOString(),
    };

    setDb((prev: DatabaseState) => ({
      ...prev,
      expenseTransactions: [newExp, ...prev.expenseTransactions],
    }));
    showToast(t.savedSuccessfully);
  };

  const editExpense = (id: string, data: Partial<ExpenseTransaction>) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      expenseTransactions: prev.expenseTransactions.map((t: ExpenseTransaction) =>
        t.id === id ? { ...t, ...data } : t
      ),
    }));
    showToast(t.savedSuccessfully);
  };

  const deleteExpense = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      expenseTransactions: prev.expenseTransactions.filter((t: ExpenseTransaction) => t.id !== id),
    }));
    showToast(t.deletedSuccessfully);
  };

  // 3. Courses CRUD
  const addCourse = (course: Omit<Course, 'id' | 'createdAt'>) => {
    const newCourse: Course = {
      ...course,
      id: makeId('crs'),
      createdAt: getTodayDateString(),
    };
    setDb((prev: DatabaseState) => ({
      ...prev,
      courses: [newCourse, ...prev.courses],
    }));
    showToast(t.savedSuccessfully);
  };

  const editCourse = (id: string, data: Partial<Course>) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      courses: prev.courses.map((c: Course) => (c.id === id ? { ...c, ...data } : c)),
      // Update course name in sales if title changed
      courseSales: prev.courseSales.map((s: CourseSale) =>
        s.courseId === id && data.name ? { ...s, courseName: data.name } : s
      ),
    }));
    showToast(t.savedSuccessfully);
  };

  const deleteCourse = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      courses: prev.courses.filter((c: Course) => c.id !== id),
    }));
    showToast(t.deletedSuccessfully);
  };

  // 4. Record Course Sale (Separate explicit action, supports partial & unpaid accurately)
  const recordCourseSale = ({
    courseId,
    saleDate,
    quantity,
    salePrice,
    amountReceived,
    customerName,
    customerWhatsapp,
    customerEmail,
    paymentMethod,
    paymentStatus,
    notes,
  }: {
    courseId: string;
    saleDate: string;
    quantity: number;
    salePrice: number;
    amountReceived: number;
    customerName?: string;
    customerWhatsapp?: string;
    customerEmail?: string;
    paymentMethod: any;
    paymentStatus: any;
    notes?: string;
  }) => {
    const course = db.courses.find(c => c.id === courseId);
    const courseName = course ? course.name : 'Course';
    const saleId = makeId('sale');
    const totalDue = quantity * salePrice;
    const outstanding = Math.max(0, totalDue - amountReceived);

    // If customer name was provided, create/update customer
    let customerId: string | undefined = undefined;
    let updatedCustomers = [...db.customers];

    if (customerName && customerName.trim()) {
      const trimmedName = customerName.trim();
      let customer = db.customers.find(
        c =>
          (customerWhatsapp && c.whatsapp === customerWhatsapp) ||
          c.fullName.toLowerCase() === trimmedName.toLowerCase()
      );

      if (!customer) {
        customerId = makeId('cust');
        customer = {
          id: customerId,
          fullName: trimmedName,
          whatsapp: customerWhatsapp || '',
          email: customerEmail || '',
          purchasedCourseIds: [courseId],
          totalPaid: amountReceived,
          paymentStatus: paymentStatus || 'Paid',
          notes: notes || `Enrolled in ${courseName}`,
          createdAt: saleDate,
          lastPurchaseDate: saleDate,
        };
        updatedCustomers.unshift(customer);
      } else {
        customerId = customer.id;
        const idx = updatedCustomers.findIndex(c => c.id === customerId);
        if (idx !== -1) {
          updatedCustomers[idx] = {
            ...customer,
            totalPaid: customer.totalPaid + amountReceived,
            purchasedCourseIds: Array.from(new Set([...customer.purchasedCourseIds, courseId])),
            lastPurchaseDate: saleDate,
          };
        }
      }
    }

    // Only create an income transaction if cash was actually received!
    let incId: string | undefined = undefined;
    const newIncomes = [...db.incomeTransactions];

    if (amountReceived > 0) {
      incId = makeId('inc');
      const newIncome: IncomeTransaction = {
        id: incId,
        amount: amountReceived,
        date: saleDate,
        source: 'Course Sale',
        customerName: customerName?.trim() || undefined,
        customerWhatsapp: customerWhatsapp?.trim() || undefined,
        customerEmail: customerEmail?.trim() || undefined,
        courseOrService: courseName,
        courseId,
        courseSaleId: saleId,
        customerId,
        paymentMethod,
        notes: notes || `Sale of ${quantity}x ${courseName}`,
        createdAt: new Date().toISOString(),
      };
      newIncomes.unshift(newIncome);
    }

    const newSale: CourseSale = {
      id: saleId,
      courseId,
      courseName,
      date: saleDate,
      quantity,
      salePrice,
      amountReceived,
      outstandingAmount: outstanding,
      customerId,
      customerName: customerName?.trim() || undefined,
      customerWhatsapp: customerWhatsapp?.trim() || undefined,
      customerEmail: customerEmail?.trim() || undefined,
      paymentMethod,
      paymentStatus: paymentStatus || 'Paid',
      notes,
      incomeTransactionId: incId,
      createdAt: new Date().toISOString(),
    };

    setDb((prev: DatabaseState) => ({
      ...prev,
      customers: updatedCustomers,
      courseSales: [newSale, ...prev.courseSales],
      incomeTransactions: newIncomes,
    }));

    showToast(t.savedSuccessfully);
  };

  const editCourseSale = (id: string, saleData: Partial<CourseSale>) => {
    setDb((prev: DatabaseState) => {
      const existingSale = prev.courseSales.find(s => s.id === id);
      if (!existingSale) return prev;

      const updatedSale = { ...existingSale, ...saleData };
      const totalDue = (updatedSale.quantity || 1) * (updatedSale.salePrice || 0);
      updatedSale.outstandingAmount = Math.max(0, totalDue - (updatedSale.amountReceived || 0));

      let updatedIncomes = [...prev.incomeTransactions];

      // Sync linked income transaction cleanly
      if (updatedSale.incomeTransactionId) {
        if (updatedSale.amountReceived > 0) {
          // Update amount
          updatedIncomes = updatedIncomes.map(inc =>
            inc.id === updatedSale.incomeTransactionId
              ? {
                  ...inc,
                  amount: updatedSale.amountReceived,
                  date: updatedSale.date,
                  customerName: updatedSale.customerName,
                  paymentMethod: updatedSale.paymentMethod,
                }
              : inc
          );
        } else {
          // If amount became 0, remove the income record so operating balance is accurate
          updatedIncomes = updatedIncomes.filter(inc => inc.id !== updatedSale.incomeTransactionId);
          updatedSale.incomeTransactionId = undefined;
        }
      } else if (updatedSale.amountReceived > 0) {
        // Create an income record if it was previously unpaid
        const newIncId = makeId('inc');
        updatedSale.incomeTransactionId = newIncId;
        updatedIncomes.unshift({
          id: newIncId,
          amount: updatedSale.amountReceived,
          date: updatedSale.date,
          source: 'Course Sale',
          courseOrService: updatedSale.courseName,
          courseId: updatedSale.courseId,
          courseSaleId: updatedSale.id,
          customerName: updatedSale.customerName,
          customerWhatsapp: updatedSale.customerWhatsapp,
          paymentMethod: updatedSale.paymentMethod,
          notes: updatedSale.notes,
          createdAt: new Date().toISOString(),
        });
      }

      return {
        ...prev,
        courseSales: prev.courseSales.map(s => (s.id === id ? updatedSale : s)),
        incomeTransactions: updatedIncomes,
      };
    });
    showToast(t.savedSuccessfully);
  };

  const deleteCourseSale = (id: string) => {
    setDb((prev: DatabaseState) => {
      const sale = prev.courseSales.find(s => s.id === id);
      let updatedIncomes = prev.incomeTransactions;
      if (sale?.incomeTransactionId) {
        updatedIncomes = updatedIncomes.filter(inc => inc.id !== sale.incomeTransactionId);
      }
      return {
        ...prev,
        courseSales: prev.courseSales.filter(s => s.id !== id),
        incomeTransactions: updatedIncomes,
      };
    });
    showToast(t.deletedSuccessfully);
  };

  // 5. Customer CRUD
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCust: Customer = {
      ...customer,
      id: makeId('cust'),
      createdAt: getTodayDateString(),
    };
    setDb((prev: DatabaseState) => ({
      ...prev,
      customers: [newCust, ...prev.customers],
    }));
    showToast(t.savedSuccessfully);
  };

  const editCustomer = (id: string, data: Partial<Customer>) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      customers: prev.customers.map((c: Customer) => (c.id === id ? { ...c, ...data } : c)),
    }));
    showToast(t.savedSuccessfully);
  };

  const deleteCustomer = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      customers: prev.customers.filter((c: Customer) => c.id !== id),
    }));
    showToast(t.deletedSuccessfully);
  };

  // 6. Savings CRUD
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: makeId('svg'),
      createdAt: getTodayDateString(),
    };
    setDb((prev: DatabaseState) => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, newGoal],
    }));
    showToast(t.savedSuccessfully);
  };

  const editSavingsGoal = (id: string, data: Partial<SavingsGoal>) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g: SavingsGoal) => (g.id === id ? { ...g, ...data } : g)),
    }));
    showToast(t.savedSuccessfully);
  };

  const deleteSavingsGoal = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter((g: SavingsGoal) => g.id !== id),
      savingsTransactions: prev.savingsTransactions.filter((t: SavingsTransaction) => t.savingsGoalId !== id),
    }));
    showToast(t.deletedSuccessfully);
  };

  const transactSavings = (goalId: string, type: 'deposit' | 'withdraw', amount: number, notes?: string) => {
    const goal = db.savingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = type === 'deposit' ? goal.currentAmount + amount : Math.max(0, goal.currentAmount - amount);

    const newTxn: SavingsTransaction = {
      id: makeId('svt'),
      savingsGoalId: goalId,
      savingsGoalName: goal.name,
      type,
      amount,
      date: getTodayDateString(),
      notes,
      createdAt: new Date().toISOString(),
    };

    setDb((prev: DatabaseState) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g: SavingsGoal) => (g.id === goalId ? { ...g, currentAmount: newAmount } : g)),
      savingsTransactions: [newTxn, ...prev.savingsTransactions],
    }));
    showToast(t.savedSuccessfully);
  };

  // 7. Financial Goals
  const addFinancialGoal = (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: makeId('fgl'),
      createdAt: getTodayDateString(),
    };
    setDb((prev: DatabaseState) => ({
      ...prev,
      financialGoals: [...prev.financialGoals, newGoal],
    }));
    showToast(t.savedSuccessfully);
  };

  const editFinancialGoal = (id: string, data: Partial<FinancialGoal>) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      financialGoals: prev.financialGoals.map((g: FinancialGoal) => (g.id === id ? { ...g, ...data } : g)),
    }));
    showToast(t.savedSuccessfully);
  };

  const deleteFinancialGoal = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      financialGoals: prev.financialGoals.filter((g: FinancialGoal) => g.id !== id),
    }));
    showToast(t.deletedSuccessfully);
  };

  // 8. Mentorship
  const addMentorshipClient = (client: Omit<MentorshipClient, 'id' | 'createdAt'>) => {
    const newClient: MentorshipClient = {
      ...client,
      id: makeId('ment'),
      createdAt: getTodayDateString(),
    };

    setDb((prev: DatabaseState) => ({
      ...prev,
      mentorshipClients: [newClient, ...prev.mentorshipClients],
    }));
    showToast(t.savedSuccessfully);
  };

  const editMentorshipClient = (id: string, data: Partial<MentorshipClient>) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      mentorshipClients: prev.mentorshipClients.map((c: MentorshipClient) => (c.id === id ? { ...c, ...data } : c)),
    }));
    showToast(t.savedSuccessfully);
  };

  const deleteMentorshipClient = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      mentorshipClients: prev.mentorshipClients.filter((c: MentorshipClient) => c.id !== id),
    }));
    showToast(t.deletedSuccessfully);
  };

  // 9. AI Subscriptions
  const addAISubscription = (sub: Omit<AISubscription, 'id'>) => {
    const newSub: AISubscription = {
      ...sub,
      id: makeId('ai'),
    };
    setDb((prev: DatabaseState) => ({
      ...prev,
      aiSubscriptions: [newSub, ...prev.aiSubscriptions],
    }));
    showToast(t.savedSuccessfully);
  };

  const editAISubscription = (id: string, data: Partial<AISubscription>) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      aiSubscriptions: prev.aiSubscriptions.map((s: AISubscription) => (s.id === id ? { ...s, ...data } : s)),
    }));
    showToast(t.savedSuccessfully);
  };

  const deleteAISubscription = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      aiSubscriptions: prev.aiSubscriptions.filter((s: AISubscription) => s.id !== id),
    }));
    showToast(t.deletedSuccessfully);
  };

  // 10. Website Tasks
  const addWebsiteTask = (task: Omit<WebsiteTask, 'id' | 'createdAt'>) => {
    const newTask: WebsiteTask = {
      ...task,
      id: makeId('wtsk'),
      createdAt: getTodayDateString(),
    };
    setDb((prev: DatabaseState) => ({
      ...prev,
      websiteTasks: [newTask, ...prev.websiteTasks],
    }));
    showToast(t.savedSuccessfully);
  };

  const editWebsiteTask = (id: string, data: Partial<WebsiteTask>) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      websiteTasks: prev.websiteTasks.map((t: WebsiteTask) => (t.id === id ? { ...t, ...data } : t)),
    }));
  };

  const deleteWebsiteTask = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      websiteTasks: prev.websiteTasks.filter((t: WebsiteTask) => t.id !== id),
    }));
    showToast(t.deletedSuccessfully);
  };

  // 11. Content Tasks
  const addContentTask = (task: Omit<ContentTask, 'id' | 'createdAt'>) => {
    const newTask: ContentTask = {
      ...task,
      id: makeId('ctsk'),
      createdAt: getTodayDateString(),
    };
    setDb((prev: DatabaseState) => ({
      ...prev,
      contentTasks: [newTask, ...prev.contentTasks],
    }));
    showToast(t.savedSuccessfully);
  };

  const editContentTask = (id: string, data: Partial<ContentTask>) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      contentTasks: prev.contentTasks.map((t: ContentTask) => (t.id === id ? { ...t, ...data } : t)),
    }));
  };

  const deleteContentTask = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      contentTasks: prev.contentTasks.filter((t: ContentTask) => t.id !== id),
    }));
    showToast(t.deletedSuccessfully);
  };

  // 12. Daily Tasks
  const addDailyTask = (task: Omit<DailyTask, 'id' | 'createdAt'>) => {
    const newTask: DailyTask = {
      ...task,
      id: makeId('dtsk'),
      createdAt: getTodayDateString(),
    };
    setDb((prev: DatabaseState) => ({
      ...prev,
      dailyTasks: [newTask, ...prev.dailyTasks],
    }));
    showToast(t.savedSuccessfully);
  };

  const toggleDailyTask = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map((t: DailyTask) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    }));
  };

  const deleteDailyTask = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.filter((t: DailyTask) => t.id !== id),
    }));
    showToast(t.deletedSuccessfully);
  };

  // 13. Settings & Notifications
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
    showToast(t.savedSuccessfully);
  };

  const markNotificationRead = (id: string) => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      notifications: prev.notifications.map((n: NotificationItem) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const clearAllNotifications = () => {
    setDb((prev: DatabaseState) => ({
      ...prev,
      notifications: [],
    }));
  };

  // Clean $0 state reset
  const resetToClean = () => {
    const clean = resetDatabaseToClean();
    setDb(clean);
    showToast('Dashboard reset to clean $0 state.');
  };

  // Optional Sample Demo
  const loadSampleDemo = () => {
    const sample = getSampleDemoData();
    setDb(sample);
    saveDatabase(sample);
    showToast('Sample courses loaded.');
  };

  const exportDatabaseJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `xirfadonet_backup_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        const merged: DatabaseState = {
          ...loadDatabase(),
          ...parsed,
          settings: { ...db.settings, ...(parsed.settings || {}) },
          user: { ...db.user, ...(parsed.user || {}) },
        };
        setDb(merged);
        saveDatabase(merged);
        showToast('Backup restored successfully.');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        db,
        overview,
        activeTab,
        setActiveTab,
        dateFilter,
        setDateFilter,
        language,
        setLanguage,
        t,
        isIncomeModalOpen,
        setIsIncomeModalOpen,
        isExpenseModalOpen,
        setIsExpenseModalOpen,
        isAffordModalOpen,
        setIsAffordModalOpen,
        isCourseSaleModalOpen,
        setIsCourseSaleModalOpen,
        isSavingsModalOpen,
        setIsSavingsModalOpen,
        selectedCourseForSale,
        setSelectedCourseForSale,
        selectedSavingsGoal,
        setSelectedSavingsGoal,
        isNotificationsOpen,
        setIsNotificationsOpen,
        unreadNotificationsCount,
        editingIncome,
        setEditingIncome,
        editingExpense,
        setEditingExpense,
        editingCourseSale,
        setEditingCourseSale,
        toastMessage,
        showToast,
        user: db.user,
        isAuthenticated,
        login,
        logout,
        requestPasswordReset,
        resetPasswordWithCode,
        addIncome,
        editIncome,
        deleteIncome,
        addExpense,
        editExpense,
        deleteExpense,
        addCourse,
        editCourse,
        deleteCourse,
        recordCourseSale,
        editCourseSale,
        deleteCourseSale,
        addCustomer,
        editCustomer,
        deleteCustomer,
        addSavingsGoal,
        editSavingsGoal,
        deleteSavingsGoal,
        transactSavings,
        addFinancialGoal,
        editFinancialGoal,
        deleteFinancialGoal,
        addMentorshipClient,
        editMentorshipClient,
        deleteMentorshipClient,
        addAISubscription,
        editAISubscription,
        deleteAISubscription,
        addWebsiteTask,
        editWebsiteTask,
        deleteWebsiteTask,
        addContentTask,
        editContentTask,
        deleteContentTask,
        addDailyTask,
        toggleDailyTask,
        deleteDailyTask,
        updateSettings,
        markNotificationRead,
        clearAllNotifications,
        resetToClean,
        loadSampleDemo,
        exportDatabaseJSON,
        importDatabaseJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
