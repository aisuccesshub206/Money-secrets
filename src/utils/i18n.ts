export type Language = 'en' | 'so';

export interface Translations {
  // Navigation & Groups
  overview: string;
  dashboard: string;
  money: string;
  income: string;
  expenses: string;
  transactions: string;
  budgets: string;
  business: string;
  courses: string;
  courseSales: string;
  customers: string;
  mentorship: string;
  aiSubscriptions: string;
  personalFinance: string;
  savings: string;
  goals: string;
  work: string;
  websiteTasks: string;
  contentPlanner: string;
  dailyPlanner: string;
  insights: string;
  analytics: string;
  monthlyReports: string;
  aiMoneyAssistant: string;
  system: string;
  settings: string;

  // Header & Dashboard
  welcome: string;
  ownerControlCenter: string;
  addIncome: string;
  addExpense: string;
  recordSale: string;
  addCourse: string;
  currentBalance: string;
  incomeThisMonth: string;
  expensesThisMonth: string;
  netProfitThisMonth: string;
  netProfit: string;
  totalIncome: string;
  totalExpenses: string;
  incomeToday: string;
  incomeThisWeek: string;
  expensesToday: string;
  expensesThisWeek: string;
  unitsSold: string;
  courseRevenue: string;
  revenueReceived: string;
  outstandingAmount: string;

  // Empty States
  noIncomeYet: string;
  noIncomeSub: string;
  noExpensesYet: string;
  noExpensesSub: string;
  noTransactionsYet: string;
  noTransactionsSub: string;
  noCoursesYet: string;
  noCoursesSub: string;
  noSalesYet: string;
  noSalesSub: string;
  noCustomersYet: string;
  noCustomersSub: string;
  noSavingsYet: string;
  noSavingsSub: string;
  noTasksYet: string;

  // Forms & Actions
  amount: string;
  date: string;
  source: string;
  category: string;
  allocation: string;
  description: string;
  paymentMethod: string;
  paymentStatus: string;
  customerNameOptional: string;
  customerWhatsapp: string;
  courseOrServiceOptional: string;
  notes: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  confirmDelete: string;
  confirmDeleteText: string;
  status: string;
  price: string;
  quantity: string;
  salePrice: string;
  amountReceived: string;
  selectCourse: string;
  chooseCategory: string;

  // Allocations (Money Buckets)
  family: string;
  myself: string;
  other: string;

  // Budgets
  dailyLimit: string;
  weeklyLimit: string;
  monthlyLimit: string;
  budgetStatus: string;
  safeToSpend: string;
  approachingLimit: string;
  limitExceeded: string;
  remainingToday: string;
  remainingThisMonth: string;
  spentToday: string;

  // Recent & Summaries
  recentTransactions: string;
  incomeVsExpenses: string;
  courseSalesSummary: string;
  viewAll: string;
  noData: string;

  // Statuses
  paid: string;
  pending: string;
  partial: string;
  refunded: string;
  active: string;
  draft: string;
  inactive: string;

  // Feedback
  savedSuccessfully: string;
  deletedSuccessfully: string;
  invalidAmount: string;
  requiredFields: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Groups
    overview: 'Overview',
    dashboard: 'Dashboard',
    money: 'Money',
    income: 'Income',
    expenses: 'Expenses',
    transactions: 'Transactions',
    budgets: 'Budgets',
    business: 'Business',
    courses: 'Courses',
    courseSales: 'Course Sales',
    customers: 'Customers',
    mentorship: 'Mentorship',
    aiSubscriptions: 'AI Subscriptions',
    personalFinance: 'Personal Finance',
    savings: 'Savings',
    goals: 'Financial Goals',
    work: 'Work',
    websiteTasks: 'Website Tasks',
    contentPlanner: 'Content Planner',
    dailyPlanner: 'Daily Planner',
    insights: 'Insights',
    analytics: 'Analytics',
    monthlyReports: 'Monthly Reports',
    aiMoneyAssistant: 'AI Money Assistant',
    system: 'System',
    settings: 'Settings',

    // Header & Dashboard
    welcome: 'Welcome,',
    ownerControlCenter: 'Private Business & Money Control Center',
    addIncome: '+ Add Income',
    addExpense: '+ Add Expense',
    recordSale: '+ Record Course Sale',
    addCourse: '+ Add Course',
    currentBalance: 'Current Balance',
    incomeThisMonth: 'Income This Month',
    expensesThisMonth: 'Expenses This Month',
    netProfitThisMonth: 'Net Profit This Month',
    netProfit: 'Net Profit',
    totalIncome: 'Total Income',
    totalExpenses: 'Total Expenses',
    incomeToday: 'Income Today',
    incomeThisWeek: 'Income This Week',
    expensesToday: 'Expenses Today',
    expensesThisWeek: 'Expenses This Week',
    unitsSold: 'Units Sold',
    courseRevenue: 'Course Revenue',
    revenueReceived: 'Revenue Received',
    outstandingAmount: 'Outstanding',

    // Empty States
    noIncomeYet: 'No income recorded yet.',
    noIncomeSub: 'Start by adding your first income transaction.',
    noExpensesYet: 'No expenses recorded yet.',
    noExpensesSub: 'Log your first business or personal expense.',
    noTransactionsYet: 'No transactions recorded yet.',
    noTransactionsSub: 'Add your first income or expense transaction to see it here.',
    noCoursesYet: 'No courses added yet.',
    noCoursesSub: 'Create your first course to track curriculum and sales.',
    noSalesYet: 'No course sales recorded yet.',
    noSalesSub: 'Record student purchases to track your course revenue.',
    noCustomersYet: 'No customers recorded yet.',
    noCustomersSub: 'Customer profiles will appear as you record sales or add clients.',
    noSavingsYet: 'No savings goals created yet.',
    noSavingsSub: 'Create an emergency or project savings target.',
    noTasksYet: 'No tasks scheduled.',

    // Forms & Actions
    amount: 'Amount',
    date: 'Date',
    source: 'Income Source',
    category: 'Category',
    allocation: 'Spending Allocation',
    description: 'Description',
    paymentMethod: 'Payment Method',
    paymentStatus: 'Payment Status',
    customerNameOptional: 'Customer Name (Optional)',
    customerWhatsapp: 'WhatsApp (Optional)',
    courseOrServiceOptional: 'Course or Service (Optional)',
    notes: 'Notes / Reference',
    save: 'Save Record',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Confirm Deletion',
    confirmDeleteText: 'Are you sure you want to delete this record? This action cannot be undone.',
    status: 'Status',
    price: 'Price',
    quantity: 'Quantity Sold',
    salePrice: 'Sale Price (Unit)',
    amountReceived: 'Amount Received',
    selectCourse: 'Select Course',
    chooseCategory: 'Choose Category',

    // Allocations
    family: 'Family',
    myself: 'Myself',
    other: 'Other',

    // Budgets
    dailyLimit: 'Daily Limit',
    weeklyLimit: 'Weekly Limit',
    monthlyLimit: 'Monthly Limit',
    budgetStatus: 'Budget Status',
    safeToSpend: 'Safe to spend',
    approachingLimit: 'Approaching limit',
    limitExceeded: 'Daily limit exceeded by',
    remainingToday: 'Remaining today',
    remainingThisMonth: 'Remaining this month',
    spentToday: 'Spent today',

    // Recent & Summaries
    recentTransactions: 'Recent Transactions',
    incomeVsExpenses: 'Monthly Income vs Expenses',
    courseSalesSummary: 'Course Sales Summary',
    viewAll: 'View All',
    noData: 'No records available',

    // Statuses
    paid: 'Paid',
    pending: 'Pending',
    partial: 'Partial',
    refunded: 'Refunded',
    active: 'Active',
    draft: 'Draft',
    inactive: 'Inactive',

    // Feedback
    savedSuccessfully: 'Record saved successfully.',
    deletedSuccessfully: 'Record deleted successfully.',
    invalidAmount: 'Please enter a valid amount greater than 0.',
    requiredFields: 'Please fill in all required fields.',
  },

  so: {
    // Navigation & Groups
    overview: 'Guudmar',
    dashboard: 'Dashboard',
    money: 'Lacagta',
    income: 'Dakhli',
    expenses: 'Kharash',
    transactions: 'Dhaqdhaqaaqa',
    budgets: 'Miisaaniyadda',
    business: 'Ganacsiga',
    courses: 'Koorsooyin',
    courseSales: 'Iibka Koorsooyinka',
    customers: 'Macaamiil',
    mentorship: 'Tababarka Gaarka ah',
    aiSubscriptions: 'Rukunyada AI',
    personalFinance: 'Maaliyadda Gaarka ah',
    savings: 'Kayd',
    goals: 'Yoolal',
    work: 'Shaqada',
    websiteTasks: 'Hawlaha Websaydhka',
    contentPlanner: 'Qorshaha Nuxurka',
    dailyPlanner: 'Qorshaha Maalinta',
    insights: 'Xogta & Falanqaynta',
    analytics: 'Falanqaynta',
    monthlyReports: 'Warbixinta Bishan',
    aiMoneyAssistant: 'Kaaliyaha AI ee Lacagta',
    system: 'Habka',
    settings: 'Dejinta',

    // Header & Dashboard
    welcome: 'Kusoo dhawoow,',
    ownerControlCenter: 'Xarunta Maamulka Ganacsiga & Lacagta ee XirfadoNet',
    addIncome: '+ Ku dar Dakhli',
    addExpense: '+ Ku dar Kharash',
    recordSale: '+ Diiwaangeli Iibka Koorsada',
    addCourse: '+ Ku dar Koorsada',
    currentBalance: 'Hadhaaga Lacagta',
    incomeThisMonth: 'Dakhliga Bishan',
    expensesThisMonth: 'Kharashka Bishan',
    netProfitThisMonth: 'Faa’iidada Bishan',
    netProfit: 'Faa’iidada Saafiga ah',
    totalIncome: 'Wadarta Dakhliga',
    totalExpenses: 'Wadarta Kharashka',
    incomeToday: 'Dakhliga Maanta',
    incomeThisWeek: 'Dakhliga Todobaadkan',
    expensesToday: 'Kharashka Maanta',
    expensesThisWeek: 'Kharashka Todobaadkan',
    unitsSold: 'Tirada la Iibiyey',
    courseRevenue: 'Dakhliga Koorsada',
    revenueReceived: 'Lacagta la Helay',
    outstandingAmount: 'Lacagta Dhiman',

    // Empty States
    noIncomeYet: 'Weli wax dakhli ah lama diiwaangelin.',
    noIncomeSub: 'Ku bilow adigoo ku daraya dakhligii kuugu horreeyay.',
    noExpensesYet: 'Weli wax kharash ah lama diiwaangelin.',
    noExpensesSub: 'Diiwaangeli kharashkaaga ganacsi ama midkaaga gaarka ah.',
    noTransactionsYet: 'Weli wax dhaqdhaqaaq lacageed ah ma jiro.',
    noTransactionsSub: 'Ku dar dakhli ama kharash si aad halkan ugu aragto.',
    noCoursesYet: 'Weli koorsooyin lama abuurin.',
    noCoursesSub: 'Abuur koorsadaadii ugu horraysay si aad ula socoto iibkeeda.',
    noSalesYet: 'Weli ma jiro iib koorso oo la diiwaangeliyey.',
    noSalesSub: 'Diiwaangeli iibka ardayda si aad u aragto dakhliga koorsooyinka.',
    noCustomersYet: 'Weli macaamiil lama diiwaangelin.',
    noCustomersSub: 'Macaamiishu waxay halkan ka muuqan doonaan marka aad iib diiwaangeliso.',
    noSavingsYet: 'Weli yoolal kayd ah ma jiraan.',
    noSavingsSub: 'Sameyso yool kayd ah oo loogu talagalay xaaladaha degdegga ah.',
    noTasksYet: 'Wax hawlo ah ma qorshaysna.',

    // Forms & Actions
    amount: 'Qadarka Lacagta',
    date: 'Taariikhda',
    source: 'Isha Dakhliga',
    category: 'Qaybta Kharashka',
    allocation: 'U Qoondeynta Lacagta',
    description: 'Faahfaahin',
    paymentMethod: 'Habka Lacag-bixinta',
    paymentStatus: 'Xaaladda Lacag-bixinta',
    customerNameOptional: 'Magaca Macmiilka (Ikhtiyaari)',
    customerWhatsapp: 'WhatsApp (Ikhtiyaari)',
    courseOrServiceOptional: 'Koorsada ama Adeegga (Ikhtiyaari)',
    notes: 'Qoraal / Tixraac',
    save: 'Keydi Diiwaanka',
    cancel: 'Ka noqo',
    edit: 'Wax ka beddel',
    delete: 'Tirtir',
    confirmDelete: 'Xaqiiji Tirtirista',
    confirmDeleteText: 'Ma hubtaa inaad tirtirto diiwaankan? Tallaabadan dib looma celin karo.',
    status: 'Xaaladda',
    price: 'Qiimaha',
    quantity: 'Tirada la Iibiyey',
    salePrice: 'Qiimaha Hal Xabbo',
    amountReceived: 'Qadarka la Helay',
    selectCourse: 'Dooro Koorsada',
    chooseCategory: 'Dooro Qaybta',

    // Allocations
    family: 'Qoyska',
    myself: 'Naftayda',
    other: 'Kale',

    // Budgets
    dailyLimit: 'Xadka Maalinta',
    weeklyLimit: 'Xadka Todobaadka',
    monthlyLimit: 'Xadka Bishan',
    budgetStatus: 'Xaaladda Miisaaniyadda',
    safeToSpend: 'Waa ammaan in la isticmaalo',
    approachingLimit: 'Waxaad ku dhowdahay xadka',
    limitExceeded: 'Waxaad dhaafeysaa xadka maalinlaha ah lacag dhan',
    remainingToday: 'Waxaa kuu haray maanta',
    remainingThisMonth: 'Waxaa kuu haray bishan',
    spentToday: 'Maanta la isticmaalay',

    // Recent & Summaries
    recentTransactions: 'Dhaqdhaqaaqyadii Ugu Dambeeyay',
    incomeVsExpenses: 'Dakhliga iyo Kharashka Bishan',
    courseSalesSummary: 'Xogta Iibka Koorsooyinka',
    viewAll: 'Eeg Dhammaan',
    noData: 'Xog ma jirto',

    // Statuses
    paid: 'La Bixiyay',
    pending: 'Wuu Dhiman yahay',
    partial: 'Qayb baa la Bixiyay',
    refunded: 'La Celiyay',
    active: 'Shaqeynaya',
    draft: 'Qabyo',
    inactive: 'Aan Shaqeynin',

    // Feedback
    savedSuccessfully: 'Diiwaanka si guul leh ayaa loo keydiyay.',
    deletedSuccessfully: 'Diiwaanka si guul leh ayaa loo tirtiray.',
    invalidAmount: 'Fadlan geli qadar sax ah oo ka weyn 0.',
    requiredFields: 'Fadlan buuxi meelaha qasabka ah.',
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang] || translations.en;
}
