import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

// Helper to detect if a message is Somali
function detectMessageLanguage(text: string, defaultLang: string = 'en'): 'so' | 'en' {
  if (!text) return defaultLang === 'so' ? 'so' : 'en';
  const clean = text.toLowerCase().trim();

  const somaliPatterns = [
    /\b(asc|asalaamu|assalamu|salaan|salaamu|calaykum|alaykum|sidee|tahay|tihin|iska|waran|warama|nabad|nabadeey|haye|haaye|hoo|wll|walaal|walaalayaal|mahadsanid|fadlan|rabaa|doonayaa|sheeg|iigu|igu|halkan|halkee|maxaa|maxay|cusub)\b/,
    /\b(somali|soomaali|soomaalida|af-soomaali|afsoomaali|somalia)\b/,
    /\b(bishan|maanta|shalay|berri|todobaadkan|sanadkan|hadda|mar)\b/,
    /\b(imisa|immisa|intee|le'?eg|leeg|sideen|maxaa|maxay|goorma|xaggee|midkee|koorsadee)\b/,
    /\b(dakhli|dakhliga|dakhligayga|lacag|lacagta|lacagtayda|hadhaa|hadhaaga|kayd|kaydsaday|kaydiyay|kaydka)\b/,
    /\b(kharash|kharashka|kharashkayga|kharashyada|qarash|qarashka|gareeyay|gareeyey|gareeyo|baxay|galay)\b/,
    /\b(soo\s+gashay|soo\s+galay|iibiyay|iibiyey|iibisay|iibka|koorso|koorsada|koorsooyinka)\b/,
    /\b(dhaqaale|dhaqaalahayga|maamuli|maamulaa|yareyn|yareeyo|dhimi|dhimista)\b/,
    /\b(qoys|qoyska|qoyskayga|naftaada|naftayda|awoodaa|awoodi|faa'?iido|faa'?iidada)\b/,
    /\b(waxaan|ayaan|ayaa|baa|waa|iyo|ee|oo|ah|ku|ka|la|aan|ii|iga|kuu|isu|inaad|inaan|caawi|caawinaad)\b/,
    /\b\w+(kayga|tayda|hayga|kaygu|taydu|kooda|ooda|ayey|ayay|iisa|eeda)\b/,
  ];

  let somaliScore = 0;
  for (const pattern of somaliPatterns) {
    if (pattern.test(clean)) {
      somaliScore += 1;
    }
  }

  const englishPatterns = [
    /\b(how\s+much|what\s+is|what\s+were|can\s+i|how\s+can|how\s+do|which\s+course|tell\s+me)\b/,
    /\b(money|income|earn|earned|spent|spend|spending|expenses|expense)\b/,
    /\b(balance|profit|revenue|saved|savings|budget|afford|reduce|manage)\b/,
    /\b(today|yesterday|this\s+month|this\s+week|course|sales|sold|hello|hi)\b/,
  ];

  let englishScore = 0;
  for (const pattern of englishPatterns) {
    if (pattern.test(clean)) {
      englishScore += 1;
    }
  }

  if (somaliScore > 0 && somaliScore >= englishScore) {
    return 'so';
  }
  if (englishScore > somaliScore) {
    return 'en';
  }
  return defaultLang === 'so' ? 'so' : 'en';
}

// Deterministic local financial analytical answer function
function generateLocalAnswer(
  question: string,
  overview: any,
  db: any,
  sym: string,
  defaultIsSomali: boolean
): string {
  const q = (question || '').toLowerCase();
  const lang = detectMessageLanguage(question, defaultIsSomali ? 'so' : 'en');
  const isSomali = lang === 'so';

  // 0. Greetings / Welcome
  if (
    q === 'asc' ||
    q.includes('salaam') ||
    q.includes('sidee tahay') ||
    q.includes('iska waran') ||
    q.includes('maxaa cusub') ||
    q.includes('haye') ||
    q.startsWith('hi ') ||
    q === 'hi' ||
    q.startsWith('hello')
  ) {
    if (isSomali) {
      return `👋 **Asc! Soo dhawoow.** Waxaan ahay Kaaliyahaaga Gaarka ah ee Maaliyadda & Ganacsiga XirfadoNet.\n\nWaxaan halkan u joogaa inaan kugu caawiyo falanqaynta dakhligaaga, xakamaynta kharashkaaga, diiwaangelinta iibka koorsooyinka, iyo maaraynta yoolalkaaga kaydka.\n\nSideen maanta kuu caawin karaa? Waxaad i waydiin kartaa:\n- Dakhliga ama kharashka kuu galay bishan\n- Sida loo dhimo kharashaadkaaga\n- Hadhaagaaga lacageed ee diyaar kaaga ah`;
    }
    return `👋 **Hello and welcome!** I am your private AI Business & Financial Advisor for XirfadoNet.\n\nI am here to help you monitor your revenue, track your expenses, manage course sales, and plan your savings.\n\nHow can I help you today? You can ask me:\n- How much money you earned or spent this month\n- Tips on optimizing and reducing your expenses\n- Your current available balance or course performance`;
  }

  // Language affirmation
  if (
    q.includes('af somali') ||
    q.includes('somalia') ||
    q.includes('soomaali') ||
    (q.includes('somali') && !q.includes('shilling'))
  ) {
    if (isSomali) {
      return `🇸🇴 **Haa, si buuxda ayaan kuugu adeegayaa Af-Soomaali saafi ah!**\n\nWaxaad igu waydiin kartaa su'aal kasta oo ku saabsan ganacsigaaga XirfadoNet, dakhligaaga, kharashyadaada, iibka koorsooyinkaaga, iyo maamulka dhaqaalahaaga. Maxaad jeclaan lahayd inaad ogaato maanta?`;
    }
    return `🇸🇴 **Yes! I fully support both Somali (Af-Soomaali) and English.** You can ask any question in Somali or English at any time, and I will respond in that language.`;
  }

  // 1. Course Sale statement (e.g. "Waxaan iibiyay course qiimihiisu yahay $20" or "Maanta waxaan iibiyay course...")
  if (
    (q.includes('iibiyay') || q.includes('iibiyey') || q.includes('iibisay') || q.includes('sold')) &&
    (q.includes('course') || q.includes('koorso') || q.includes('koorsada') || q.includes('$') || q.includes('20'))
  ) {
    const amountMatch = q.match(/\$?(\d+(\.\d+)?)/);
    const saleAmount = amountMatch ? amountMatch[1] : '20';

    if (isSomali) {
      return `🎉 **Hambalyo iibka koorsada!**\n\nWaxaad xustay inaad iibisay koorso qiimaheedu yahay **${sym}${saleAmount}**.\n\n⚠️ **Ogeysiis Muhiim ah:** Kaaliyaha AI ma awoodo inuu si toos ah database-ka wax ugu qoro ama u diiwaangeliyo iibkan adigoon xaqiijin.\n\n📌 **Sida aad u diiwaangelin karto iibkan dashboard-ka:**\n1. Tag qaybta **Koorsooyinka (Courses)** ama **Iibka Koorsooyinka** ee dhinaca bidix.\n2. Riix batoonka **"+ Diiwaangeli Iib"** (Record Course Sale).\n3. Dooro koorsada la iibiyay, geli qiimaha (${sym}${saleAmount}) iyo habka lacag-bixinta (tusaale: EVC, Waafi, ama Kaash).\n4. Markaad kaydiso, lacagtani waxay si toos ah ugu darsami doontaa dakhligaaga guud, faa'iidadaada, iyo hadhaagaaga.`;
    }
    return `🎉 **Congratulations on the course sale!**\n\nYou mentioned selling a course for **${sym}${saleAmount}**.\n\n⚠️ **Important Note:** As an analytical AI assistant, I do not automatically insert or alter financial database records without your explicit submission in the system.\n\n📌 **How to record this sale in your dashboard:**\n1. Navigate to the **Courses** or **Course Sales** section in the sidebar.\n2. Click the **"+ Record Course Sale"** button.\n3. Select the course, enter the sale amount (${sym}${saleAmount}), and choose the payment method (e.g. EVC, Waafi, Cash).\n4. Once submitted, this sale will immediately reflect in your total income, net profit, and available balance.`;
  }

  // 2. How much money did I receive this month? (Bishan imisa lacag ah ayaa ii soo gashay?)
  if (
    q.includes('soo gashay') ||
    q.includes('soo galay') ||
    q.includes('dakhli') ||
    q.includes('helay bishan') ||
    q.includes('earn this month') ||
    q.includes('receive') ||
    q.includes('income this month') ||
    (q.includes('income') && q.includes('month')) ||
    (q.includes('earn') && q.includes('month'))
  ) {
    if (overview.incomeThisMonth === 0 && overview.totalIncome === 0) {
      return isSomali
        ? `💰 **Dakhliga Bishan:**\n\nWeli wax dakhli ah laguma diiwaangelin bishan (${sym}0.00). Sidoo kale, wadarta guud ee dakhliga diiwaangashan waa ${sym}0.00.\n\nWaxaad bilaabi kartaa inaad dakhli ku darto adigoo riixaya batoonka **"+ Diiwaangeli Dakhli"** ama aad diiwaangelisaa iibka koorsooyinka.`
        : `💰 **Income Received This Month:**\n\nNo income has been recorded yet this month (${sym}0.00). Total recorded lifetime income is also ${sym}0.00.\n\nYou can start by clicking the **"+ Add Income"** button or recording a course sale in the dashboard.`;
    }
    return isSomali
      ? `💰 **Dakhliga la Helay Bishan:**\n- **Bishan:** ${sym}${overview.incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Todobaadkan:** ${sym}${overview.incomeThisWeek.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Maanta:** ${sym}${overview.incomeToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Guud ahaan:** ${sym}${overview.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `💰 **Income Received This Month:**\n- **This Month:** ${sym}${overview.incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **This Week:** ${sym}${overview.incomeThisWeek.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Today:** ${sym}${overview.incomeToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **All-Time Income:** ${sym}${overview.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 3. How to reduce expenses / manage finances (Sideen kharashkayga u yareyn karaa? / Sideen dhaqaalahayga u maamuli karaa?)
  if (
    q.includes('yareyn') ||
    q.includes('dhimi') ||
    q.includes('dhimista') ||
    q.includes('yareeyo') ||
    q.includes('maamuli') ||
    q.includes('maamulaa') ||
    q.includes('reduce') ||
    q.includes('cut expenses') ||
    q.includes('manage my finance') ||
    q.includes('manage my money')
  ) {
    const totalExp = overview.totalExpenses ?? 0;
    const breakdown = overview.bucketBreakdown;
    const aiSub = overview.aiTotalMonthly ?? 0;

    if (isSomali) {
      return `💡 **Talooyin Ficil ah oo ku saabsan Maamulka & Dhimista Kharashka:**\n\n` +
        (totalExp === 0
          ? `Hadda ma jiro wax kharash ah oo laguu diiwaangeliyay (${sym}0.00). Si aad dhaqaalahaaga si sax ah ugu maamusho, raac qodobadan muhiimka ah:\n`
          : `Wadarta kharashkaaga hadda waa **${sym}${totalExp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (Qoyska: ${sym}${(breakdown?.Family?.amount ?? 0).toFixed(2)}, Naftaada: ${sym}${(breakdown?.Myself?.amount ?? 0).toFixed(2)}, Ganacsiga: ${sym}${(breakdown?.Business?.amount ?? 0).toFixed(2)}).\n\n`) +
        `1. **Kala Saaridda Lacagta Ganacsiga & Qoyska:** Si adag u kala saar lacagta shaqada XirfadoNet iyo kharashka qoyska/naftaada.\n` +
        `2. **Dib u Eegista Rukunyada AI:** Xaqiiji qalabka AI iyo software-yada (${sym}${aiSub.toFixed(2)}/bishii) inaad isticmaasho kuwa muhiimka ah oo keliya.\n` +
        `3. **Xadka Kharashka Maalinlaha ah:** Deji xad maalinle ah (Daily Limit) qaybta Dejinta si aad uga fogaato kharashyada aan qorshaysnayn.\n` +
        `4. **Yoolka Kaydka (20% Rule):** Dhig ugu yaraan 20% dakhli kasta oo soo gala sanduuqa kaydka ka hor inta aanad wax kharash ah bixin.`;
    }

    return `💡 **Practical Advice for Expense Optimization & Money Management:**\n\n` +
      (totalExp === 0
        ? `No expenses have been recorded yet (${sym}0.00). To manage your finances proactively from day one:\n`
        : `Your recorded total spending is **${sym}${totalExp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (Family: ${sym}${(breakdown?.Family?.amount ?? 0).toFixed(2)}, Personal: ${sym}${(breakdown?.Myself?.amount ?? 0).toFixed(2)}, Business: ${sym}${(breakdown?.Business?.amount ?? 0).toFixed(2)}).\n\n`) +
      `1. **Strict Bucket Separation:** Keep your XirfadoNet business operating capital isolated from family and personal discretionary spending.\n` +
      `2. **Audit AI & SaaS Subscriptions:** Currently at ${sym}${aiSub.toFixed(2)}/mo. Cancel any redundant subscriptions not directly generating value.\n` +
      `3. **Daily Spending Caps:** Enforce daily limits in Settings > Budgets to prevent impulsive outflows.\n` +
      `4. **20% Savings Buffer:** Automatically sweep 20% of all incoming course revenues into your savings vault before distributing funds.`;
  }

  // 4. How much did I spend? (Lacag intee le’eg ayaan kharash gareeyay?)
  if (
    q.includes('kharash gareeyay') ||
    q.includes('kharash gareeyey') ||
    q.includes('kharash igu baxay') ||
    q.includes('wadarta kharashka') ||
    q.includes('how much did i spend') ||
    q.includes('total spend') ||
    (q.includes('how much') && q.includes('spend') && !q.includes('family') && !q.includes('myself') && !q.includes('afford'))
  ) {
    if (overview.totalExpenses === 0) {
      return isSomali
        ? `💸 **Kharashaadka:** Weli wax kharash ah lama diiwaangelin (${sym}0.00). Ma jiro kharash ganacsi ama mid gaar ah oo la qoray.`
        : `💸 **Expenses Recorded:** No expenses recorded yet (${sym}0.00). You have not logged any business or personal expenses.`;
    }
    return isSomali
      ? `💸 **Kharashka la Diiwaangeliyey:**\n- **Wadarta Guud:** ${sym}${overview.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Bishan:** ${sym}${overview.expensesThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Maanta:** ${sym}${overview.expensesToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `💸 **Expenses Recorded:**\n- **Total Lifetime Expenses:** ${sym}${overview.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **This Month:** ${sym}${overview.expensesThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Today:** ${sym}${overview.expensesToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 5. Highest expenses this month (Maxaa kharash badan iga galay bishan?)
  if (
    q.includes('kharash badan') ||
    q.includes('ugu badan') ||
    q.includes('highest expense') ||
    q.includes('most expensive') ||
    q.includes('top expense')
  ) {
    if (overview.totalExpenses === 0) {
      return isSomali
        ? `📊 **Kharashka Ugu Badan:** Maadaama aan weli wax kharash ah la diiwaangelin bishan (${sym}0.00), ma jiraan kharashyo gaar ah oo la falanqeyn karo.`
        : `📊 **Highest Expenses:** Since no expenses have been recorded yet this month (${sym}0.00), there are no expense categories to rank.`;
    }
    const breakdown = overview.bucketBreakdown;
    return isSomali
      ? `📊 **Falanqaynta Kharashaadka Bishan:**\n- **Qoyska:** ${sym}${(breakdown?.Family?.amount ?? 0).toFixed(2)}\n- **Naftaada:** ${sym}${(breakdown?.Myself?.amount ?? 0).toFixed(2)}\n- **Ganacsiga:** ${sym}${(breakdown?.Business?.amount ?? 0).toFixed(2)}\n- **Wadarta Guud:** ${sym}${overview.totalExpenses.toFixed(2)}`
      : `📊 **Expense Breakdown:**\n- **Family:** ${sym}${(breakdown?.Family?.amount ?? 0).toFixed(2)}\n- **Personal (Myself):** ${sym}${(breakdown?.Myself?.amount ?? 0).toFixed(2)}\n- **Business:** ${sym}${(breakdown?.Business?.amount ?? 0).toFixed(2)}\n- **Total Spending:** ${sym}${overview.totalExpenses.toFixed(2)}`;
  }

  // 6. Savings (Lacag intee le’eg ayaan kaydsaday?)
  if (q.includes('kaydsaday') || q.includes('kaydiyay') || q.includes('kaydka') || q.includes('saved') || q.includes('savings')) {
    const savings = overview.savingsBalance ?? 0;
    const goalsCount = db.savingsGoals?.length ?? 0;
    return isSomali
      ? `🏦 **Xogta Kaydka:**\n- **Wadarta Kaydsan:** **${sym}${savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n- **Yoolalka Kaydka ee Firfircoon:** ${goalsCount}\n${savings === 0 ? '\n*Fadlan riix batoonka Kaydka (Savings) si aad u abuurto yool kayd ah ama lacag ugu shubto sanduuqaaga.*' : ''}`
      : `🏦 **Savings Summary:**\n- **Total Saved:** **${sym}${savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n- **Active Savings Goals:** ${goalsCount}\n${savings === 0 ? '\n*You can create a savings goal or deposit funds by visiting the Savings section.*' : ''}`;
  }

  // 7. Family spending
  if (q.includes('family') || q.includes('qoys')) {
    const familySpent = overview.bucketBreakdown?.Family?.amount ?? 0;
    if (familySpent === 0) {
      return isSomali
        ? `👨‍👩‍👧 **Kharashka Qoyska:** Wax kharash ah oo qoyska ku baxay lama diiwaangelin (${sym}0.00).`
        : `👨‍👩‍👧 **Family Spending:** You have recorded ${sym}0.00 spent on family. No family transactions exist yet.`;
    }
    const percent = overview.totalExpenses > 0 ? Math.round((familySpent / overview.totalExpenses) * 100) : 0;
    return isSomali
      ? `👨‍👩‍👧 **Kharashka Qoyska:** Waxaad qoyska ku bixisay **${sym}${familySpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (${percent}% ee wadarta kharashaadkaaga).`
      : `👨‍👩‍👧 **Family Allocation:** You have spent **${sym}${familySpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** on family support (${percent}% of total expenses).`;
  }

  // 8. Personal spending
  if (q.includes('myself') || q.includes('personal') || q.includes('naftayd')) {
    const myselfSpent = overview.bucketBreakdown?.Myself?.amount ?? 0;
    if (myselfSpent === 0) {
      return isSomali
        ? `👤 **Kharashka Naftaada:** Wax kharash ah oo naftaada ku baxay lama diiwaangelin (${sym}0.00).`
        : `👤 **Personal (Myself) Spending:** You have recorded ${sym}0.00 spent on personal needs.`;
    }
    const percent = overview.totalExpenses > 0 ? Math.round((myselfSpent / overview.totalExpenses) * 100) : 0;
    return isSomali
      ? `👤 **Kharashka Naftaada:** Waxaad naftaada ku bixisay **${sym}${myselfSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (${percent}% ee wadarta kharashaadkaaga).`
      : `👤 **Personal Allocation:** You have spent **${sym}${myselfSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** on personal/myself expenses (${percent}% of total expenses).`;
  }

  // 9. Which course earned the most?
  if (q.includes('which course') || q.includes('best') || q.includes('top course') || q.includes('koorsadee') || q.includes('koorsada ugu')) {
    const topCourse = overview.topCourse;
    if (!topCourse || !topCourse.title || topCourse.salesCount === 0) {
      return isSomali
        ? `📚 **Iibka Koorsooyinka:** Weli ma jiro iib koorso oo la diiwaangeliyay. Wadarta dakhliga koorsooyinka waa ${sym}0.00.`
        : `📚 **Course Performance:** No course sales have been recorded yet. Total course revenue is ${sym}0.00 across ${db.courses?.length || 0} catalog courses.`;
    }
    return isSomali
      ? `📚 **Koorsada Ugu Dakhliga Badan:**\n- **Koorsada:** **${topCourse.title}**\n- **Tirada la Iibiyay:** ${topCourse.salesCount} enrollments\n- **Dakhliga la Helay:** ${sym}${(topCourse.revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `📚 **Top Earning Course:**\n- **Course:** **${topCourse.title}**\n- **Enrollments:** ${topCourse.salesCount} units sold\n- **Revenue Received:** ${sym}${(topCourse.revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Catalog Courses:** ${db.courses?.length || 0} total`;
  }

  // 10. Current balance
  if (q.includes('current balance') || q.includes('hadhaaga') || q.includes('balance')) {
    return isSomali
      ? `💳 **Hadhaaga Lacagta:** **${sym}${overview.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n- **Wadarta Dakhliga:** ${sym}${overview.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Wadarta Kharashka:** ${sym}${overview.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Faa'iidada Saafiga ah:** ${sym}${overview.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `💳 **Current Liquid Balance:** **${sym}${overview.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n- **Total Income:** ${sym}${overview.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Total Expenses:** ${sym}${overview.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Net Profit:** ${sym}${overview.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 11. Affordability
  if (q.includes('afford') || q.includes('awoodaa') || q.includes('awoodi')) {
    const match = q.match(/\$?(\d+(\.\d+)?)/);
    const requestedAmount = match ? parseFloat(match[1]) : 20;
    const balance = overview.availableBalance ?? 0;
    const dailyLimit = overview.dailyBudgetRemaining ?? 0;

    if (balance < requestedAmount) {
      return isSomali
        ? `⚠️ **Hubinta Awoodda Lacageed ee ${sym}${requestedAmount}:**\n- **Hadhaagaaga Hadda:** ${sym}${balance.toFixed(2)}\n- **Go'aanka:** **Maya**, bixinta ${sym}${requestedAmount} waxay ka badan tahay hadhaagaaga oo ah ${sym}${balance.toFixed(2)}.`
        : `⚠️ **Affordability Check for ${sym}${requestedAmount}:**\n- **Current Balance:** ${sym}${balance.toFixed(2)}\n- **Verdict:** **No**, spending ${sym}${requestedAmount} exceeds your current available balance of ${sym}${balance.toFixed(2)}.`;
    }

    if (dailyLimit > 0 && requestedAmount > dailyLimit) {
      return isSomali
        ? `⚠️ **Digniin Miisaaniyad ${sym}${requestedAmount}:**\n- **Hadhaagaaga Hadda:** ${sym}${balance.toFixed(2)}\n- **Xadka Maanta kuu haray:** ${sym}${dailyLimit.toFixed(2)}\n- **Go'aanka:** Lacag waad haysataa, laakiin waxay ${sym}${(requestedAmount - dailyLimit).toFixed(2)} dhaafaysaa xadkaaga kharashka maalinlaha ah.`
        : `⚠️ **Affordability Warning for ${sym}${requestedAmount}:**\n- **Current Balance:** ${sym}${balance.toFixed(2)} (sufficient cash)\n- **Remaining Daily Budget:** ${sym}${dailyLimit.toFixed(2)}\n- **Verdict:** You have sufficient cash, but spending ${sym}${requestedAmount} will exceed your configured daily spending limit by ${sym}${(requestedAmount - dailyLimit).toFixed(2)}.`;
    }

    return isSomali
      ? `✅ **Waa Ammaan in la Bixiyo ${sym}${requestedAmount}:**\n- **Hadhaagaaga Hadda:** ${sym}${balance.toFixed(2)}\n- **Go'aanka:** **Haa**, waxaad si ammaan ah u bixin kartaa ${sym}${requestedAmount}. Waxaa kuu haraya ${sym}${(balance - requestedAmount).toFixed(2)}.`
      : `✅ **Affordability Approved for ${sym}${requestedAmount}:**\n- **Current Available Balance:** ${sym}${balance.toFixed(2)}\n- **Verdict:** **Yes**, you can comfortably afford ${sym}${requestedAmount}. It leaves you with ${sym}${(balance - requestedAmount).toFixed(2)} in available cash.`;
  }

  // Default summary
  return isSomali
    ? `📊 **Xogta Maaliyadeed ee XirfadoNet:**\n- **Hadhaaga Lacagta:** ${sym}${overview.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Dakhliga Bishan:** ${sym}${overview.incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Kharashka Bishan:** ${sym}${overview.expensesThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Faa'iidada Saafiga ah:** ${sym}${overview.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Iibka Koorsooyinka:** ${overview.totalCourseUnitsSold} enrollments.`
    : `📊 **Financial Summary for XirfadoNet:**\n- **Available Balance:** ${sym}${overview.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Net Profit:** ${sym}${overview.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Income This Month:** ${sym}${overview.incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Expenses This Month:** ${sym}${overview.expensesThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Course Units Sold:** ${overview.totalCourseUnitsSold} enrollments.`;
}

export const AIAssistantView: React.FC = () => {
  const { db, overview, language } = useApp();
  const isSomali = language === 'so';

  const welcomeText = isSomali
    ? `Kusoo dhawoow ${db.settings.ownerName || 'Ridwan'}! Waxaan ahay Kaaliyahaaga Gaarka ah ee Maaliyadda & Ganacsiga XirfadoNet.\n\nWaxaan toos ugu xiranahay xogta dhabta ah ee keydsan: dakhliga, kharashaadka, iibka koorsooyinka, qoyska, naftaada, iyo yoolalka kaydka.\n\nWaydii su'aal kasta ama taabo mid ka mid ah su'aalaha hoose:`
    : `Hello ${db.settings.ownerName || 'Ridwan'}! I am your private AI Business & Financial Advisor for XirfadoNet.\n\nI have real-time access to all your stored financial records: course sales, customer payments, personal & family spending buckets, and savings vaults.\n\nAsk me anything or tap one of the quick questions below:`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: welcomeText,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update initial welcome message if language toggle changes before chat begins
  React.useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'msg_welcome') {
        return [
          {
            ...prev[0],
            text: welcomeText,
          },
        ];
      }
      return prev;
    });
  }, [language, welcomeText]);

  const sym = db.settings.currencySymbol;

  const quickQuestions = isSomali
    ? [
        'Bishan imisa lacag ah ayaa ii soo gashay?',
        'Sideen kharashkayga u yareyn karaa?',
        'Waxaan iibiyay course qiimihiisu yahay $20.',
        'Lacag intee le’eg ayaan kharash gareeyay?',
        'Sideen dhaqaalahayga u maamuli karaa?',
        'Lacag intee le’eg ayaan kaydsaday?',
        'Maxaa kharash badan iga galay bishan?',
        'Waa maxay hadhaaga lacagtayda hadda?',
      ]
    : [
        'How much money did I earn this month?',
        'How can I reduce my expenses?',
        'I sold a course for $20 today.',
        'How much money did I spend?',
        'How can I manage my finances?',
        'How much have I saved?',
        'What were my highest expenses this month?',
        'What is my current balance?',
      ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Compute category spending breakdown
    const categoryTotals: Record<string, number> = {};
    (db.expenseTransactions || []).forEach((e: any) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (e.amount || 0);
    });

    // Build complete financial context for AI
    const financialContext = {
      ownerName: db.settings.ownerName,
      currency: sym,
      totals: {
        availableBalance: overview.availableBalance,
        totalIncome: overview.totalIncome,
        incomeToday: overview.incomeToday,
        incomeThisWeek: overview.incomeThisWeek,
        incomeThisMonth: overview.incomeThisMonth,
        totalExpenses: overview.totalExpenses,
        expensesToday: overview.expensesToday,
        expensesThisWeek: overview.expensesThisWeek,
        expensesThisMonth: overview.expensesThisMonth,
        businessRevenue: overview.businessIncome,
        businessExpenses: overview.businessExpenses,
        netProfit: overview.netProfit,
        totalCourseSalesCount: overview.totalCourseUnitsSold,
        courseRevenue: overview.totalCourseRevenueReceived,
        totalCustomers: overview.totalCustomersCount,
        savingsBalance: overview.savingsBalance,
        dailyBudgetRemaining: overview.dailyBudgetRemaining,
        weeklyBudgetRemaining: overview.weeklyBudgetRemaining,
        monthlyBudgetRemaining: overview.monthlyBudgetRemaining,
      },
      buckets: {
        family: overview.bucketBreakdown.Family.amount,
        myself: overview.bucketBreakdown.Myself.amount,
        business: overview.bucketBreakdown.Business.amount,
        savings: overview.savingsBalance,
      },
      expenseCategoriesSummary: categoryTotals,
      topCourse: overview.topCourse,
      aiTotalMonthly: overview.aiTotalMonthly,
      savings: {
        activeGoalsCount: db.savingsGoals.length,
        goals: db.savingsGoals.map((g: any) => ({ name: g.name, target: g.targetAmount, current: g.currentAmount })),
      },
      courses: db.courses.map((c: any) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        salesCount: db.courseSales.filter((s: any) => s.courseId === c.id).length,
      })),
      hasRecords: (overview.totalIncome > 0 || overview.totalExpenses > 0),
    };

    try {
      let answerText = '';

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          question: q,
          financialContext,
          dashboardLanguage: language,
        }),
      });

      if (res && res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data && typeof data.answer === 'string') {
            answerText = data.answer;
          }
        } else {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (data && typeof data.answer === 'string') {
              answerText = data.answer;
            }
          } catch {
            // Not JSON
          }
        }
      }

      // If server response didn't supply answer, compute local calculation
      if (!answerText) {
        answerText = generateLocalAnswer(q, overview, db, sym, isSomali);
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: answerText,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Graceful local deterministic fallback
      const fallbackText = generateLocalAnswer(q, overview, db, sym, isSomali);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Bot className="h-6 w-6 text-cyan-400" />
          {isSomali ? 'Kaaliyaha AI ee Lacagta' : 'AI Business & Money Advisor'}
        </h1>
        <p className="text-xs text-slate-400">
          {isSomali
            ? 'Toos ugu xiran xogta dhabta ah ee XirfadoNet: dakhli, kharash, koorsooyin, iyo kayd.'
            : 'Grounded directly in your real XirfadoNet transactions, course sales, budgets, and savings data.'}
        </p>
      </div>

      {/* Main Chat Box */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:p-6 flex flex-col h-[650px] justify-between shadow-2xl">
        {/* Messages feed */}
        <div className="overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0 border border-cyan-500/30">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-500 text-slate-950 font-medium'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-2 font-mono ${
                      isUser ? 'text-slate-900/70' : 'text-slate-500'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 text-xs text-cyan-300 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>{isSomali ? 'Falanqaynaya xogta maaliyadeed ee XirfadoNet...' : 'Analyzing XirfadoNet financial database...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input & Quick Chips */}
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isSomali ? "Waydii wax kasta oo ku saabsan ganacsigaaga ama lacagtaada..." : "Ask anything about your business or personal finances..."}
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95 disabled:opacity-50 transition-all shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
