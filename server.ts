import express, { Request, Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Language detection helper
function detectLanguage(text: string, defaultLang: string = 'en'): 'so' | 'en' {
  if (!text) return defaultLang === 'so' ? 'so' : 'en';
  const clean = text.toLowerCase().trim();

  // Distinct Somali keywords, particles, greetings, interrogatives, and inflectional endings
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

  // English keyword patterns
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

// AI Assistant endpoint
app.post('/api/ai-assistant', async (req: Request, res: Response) => {
  try {
    const { question, financialContext, dashboardLanguage } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const detectedLang = detectLanguage(question, dashboardLanguage || 'en');
    const isSomali = detectedLang === 'so';

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Local deterministic analytical answer fallback if API key is not configured
      return res.json({
        answer: generateDeterministicAnswer(question, financialContext, detectedLang),
        source: 'local-analytics',
        language: detectedLang,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are the private AI Business & Financial Advisor for the Owner of XirfadoNet, an online educational & digital business platform.
You have direct, real-time access to the owner's saved financial database records provided in the context.

CRITICAL LANGUAGE RULES:
1. AUTOMATIC LANGUAGE DETECTION:
   - If the user's message is in SOMALI (Af-Soomaali): You MUST respond 100% ENTIRELY in natural, grammatically correct, fluent Somali (Af-Soomaali).
   - NEVER respond in English to a Somali message.
   - Do NOT insert English translations in parentheses (e.g., do NOT write "(Income This Month)" or "(Total Expenses)" or "(Actionable Next Steps)"). Keep the response completely in pure Somali.
   - If the user greets in Somali (e.g., "asc", "sidee tahay", "maxaa cusub"), greet warmly in Somali and offer financial assistance for XirfadoNet.
   - If the user asks to speak Somali (e.g., "af somali", "somalia"), reply proudly and completely in Somali.
   - If the user's message is in ENGLISH: You MUST respond 100% ENTIRELY in clear, professional English.
   - Understand natural, everyday Somali including informal Somali spelling, minor spelling variations, and common abbreviations (e.g., "imisa" / "immisa", "le'eg" / "leeg", "kharash" / "qarash", "soo gashay" / "soo galay", "iibiyay" / "iibiyey", "kaydsaday", "sideen dhaqaalahayga u maamuli karaa", "maxaa kharash badan iga galay bishan").
   - Follow the language of each user message dynamically if the user switches languages across turns.

REAL DATA GROUNDING & ZERO HALLUCINATIONS:
2. USE ACTUAL DATABASE RECORDS ONLY:
   - ONLY cite the real numbers provided in the financial context (current balance, monthly/weekly/daily income, total expenses, buckets: Family, Myself, Business, savings balance, top course, catalog courses, customer count).
   - NEVER invent, fabricate, or hallucinate figures, customer names, sales, or transactions.
   - NO RECORDS / ZERO DATA: If the owner asks about a metric where no records exist yet (e.g. income is $0, expenses are $0, course sales are 0), explicitly explain in the detected language that no transactions have been entered into the dashboard yet, and invite them to add their first entry using "+ Add Income" / "+ Add Expense" or recording a course sale. Never pretend there are transactions when there are none.

ACTION & COURSE SALE MESSAGES:
3. IF THE USER SAYS THEY MADE A SALE (e.g., "Maanta waxaan iibiyay course qiimihiisu yahay $20" or "Waxaan iibiyay course qiimihiisu yahay $20" or "I sold a course for $20"):
   - Understand and acknowledge the sale with congratulations.
   - CRITICAL: You must NOT claim that you have automatically added the transaction to the database or recorded the sale on your own.
   - Explain clearly how the owner can officially record the sale in the XirfadoNet dashboard:
     * In Somali: Ku bishaaree iibka, una sheeg in si dakhliga $20 loogu daro xogta rasmiga ah ee dashboard-ka, uu tago qaybta "Koorsooyinka" (Courses) ama "Iibka Koorsooyinka", riixo "+ Diiwaangeli Iib" (+ Record Sale), doorto koorsada, geliyo qiimaha ($20) iyo habka lacag-bixinta, si ay ugu muuqato dakhliga guud iyo hadhaaga.
     * In English: Congratulate the owner and explain that to record this $20 sale into the dashboard records, they should navigate to the Courses or Course Sales tab in the sidebar, click "+ Record Course Sale", pick the course, and confirm the $20 amount and payment method.

PRACTICAL FINANCIAL & BUSINESS ADVICE:
4. ACTIONABLE ADVICE:
   - When asked how to reduce expenses ("Sideen kharashkayga u yareyn karaa?") or manage money ("Sideen dhaqaalahayga u maamuli karaa?"):
     * Provide realistic, practical, structured suggestions based on the owner's actual numbers and categories (e.g., auditing AI tools subscriptions, enforcing daily spending limits, maintaining a 20% savings buffer, separating family/personal spending from business capital).
   - Format cleanly with bullet points and bold numbers.`;

    const prompt = `REAL-TIME FINANCIAL CONTEXT DATA FOR XIRFADONET:
${JSON.stringify(financialContext, null, 2)}

OWNER'S MESSAGE:
"${question}"

TARGET RESPONSE LANGUAGE: ${isSomali ? 'SOMALI (Af-Soomaali). Respond COMPLETELY in natural Somali. No English words or parenthetical translations.' : 'ENGLISH. Respond completely in clear English.'}

Provide your structured, accurate response strictly following the rules above.`;

    // Multi-model resilience: Try high-capacity gemini-2.5-flash first, then gemini-3.1-flash-lite, then gemini-3.8-flash
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let text = '';
    let selectedModel = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });
        if (response && response.text) {
          text = response.text;
          selectedModel = model;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} unavailable (${err?.status || err?.message}), checking next candidate...`);
      }
    }

    if (text) {
      return res.json({ answer: text, source: selectedModel, language: detectedLang });
    }

    // If all models hit quota or error, use local deterministic analytical answer
    return res.json({
      answer: generateDeterministicAnswer(question, financialContext, detectedLang),
      source: 'local-analytics-fallback',
      language: detectedLang,
    });
  } catch (error: any) {
    console.error('AI assistant error:', error);
    // Graceful fallback to analytical insights
    const { question, financialContext, dashboardLanguage } = req.body;
    const detectedLang = detectLanguage(question, dashboardLanguage || 'en');
    return res.json({
      answer: generateDeterministicAnswer(question, financialContext, detectedLang),
      source: 'local-analytics-fallback',
      language: detectedLang,
      warning: error.message || 'Error communicating with AI service, used direct data calculation.',
    });
  }
});

// Deterministic analytical answer function supporting Somali and English
function generateDeterministicAnswer(question: string, context: any, lang: 'so' | 'en' = 'en'): string {
  if (!context) {
    return lang === 'so'
      ? 'Xogta maaliyadeed hadda way soo shaqaynaysaa. Fadlan dib u eeg daqiiqad kadib.'
      : 'Financial data is currently loading. Please check back in a moment.';
  }

  const q = (question || '').toLowerCase();
  const c = context.currency || '$';
  const totals = context.totals || {};
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
      return `🎉 **Hambalyo iibka koorsada!**\n\nWaxaad xustay inaad iibisay koorso qiimaheedu yahay **${c}${saleAmount}**.\n\n⚠️ **Ogeysiis Muhiim ah:** Kaaliyaha AI ma awoodo inuu si toos ah database-ka wax ugu qoro ama u diiwaangeliyo iibkan adigoon xaqiijin.\n\n📌 **Sida aad u diiwaangelin karto iibkan dashboard-ka:**\n1. Tag qaybta **Koorsooyinka (Courses)** ama **Iibka Koorsooyinka** ee dhinaca bidix.\n2. Riix batoonka **"+ Diiwaangeli Iib"** (Record Course Sale).\n3. Dooro koorsada la iibiyay, geli qiimaha (${c}${saleAmount}) iyo habka lacag-bixinta (tusaale: EVC, Waafi, ama Kaash).\n4. Markaad kaydiso, lacagtani waxay si toos ah ugu darsami doontaa dakhligaaga guud, faa'iidadaada, iyo hadhaagaaga.`;
    }
    return `🎉 **Congratulations on the course sale!**\n\nYou mentioned selling a course for **${c}${saleAmount}**.\n\n⚠️ **Important Note:** As an analytical AI assistant, I do not automatically insert or alter financial database records without your explicit submission in the system.\n\n📌 **How to record this sale in your dashboard:**\n1. Navigate to the **Courses** or **Course Sales** section in the sidebar.\n2. Click the **"+ Record Course Sale"** button.\n3. Select the course, enter the sale amount (${c}${saleAmount}), and choose the payment method (e.g. EVC, Waafi, Cash).\n4. Once submitted, this sale will immediately reflect in your total income, net profit, and available balance.`;
  }

  // 2. How much money did I receive this month? (Bishan imisa lacag ah ayaa ii soo gashay?)
  if (
    q.includes('soo gashay') ||
    q.includes('soo galay') ||
    q.includes('dakhli') ||
    q.includes('helay bishan') ||
    q.includes('earn this month') ||
    q.includes('receive this month') ||
    q.includes('income this month') ||
    (q.includes('income') && q.includes('month')) ||
    (q.includes('earn') && q.includes('month'))
  ) {
    const monthIncome = totals.incomeThisMonth ?? 0;
    const allIncome = totals.totalIncome ?? 0;

    if (monthIncome === 0 && allIncome === 0) {
      if (isSomali) {
        return `💰 **Dakhliga Bishan:**\n\nWeli wax dakhli ah laguma diiwaangelin bishan (${c}0.00). Sidoo kale, wadarta guud ee dakhliga diiwaangashan waa ${c}0.00.\n\nWaxaad bilaabi kartaa inaad dakhli ku darto adigoo riixaya batoonka **"+ Diiwaangeli Dakhli"** ama aad diiwaangelisaa iibka koorsooyinka.`;
      }
      return `💰 **Income Received This Month:**\n\nNo income has been recorded yet this month (${c}0.00). Total recorded lifetime income is also ${c}0.00.\n\nYou can start by clicking the **"+ Add Income"** button or recording a course sale in the dashboard.`;
    }

    if (isSomali) {
      return `💰 **Dakhliga la Helay Bishan:**\n- **Bishan:** ${c}${monthIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Todobaadkan:** ${c}${(totals.incomeThisWeek ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Maanta:** ${c}${(totals.incomeToday ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Wadarta Guud ee Dakhliga:** ${c}${allIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `💰 **Income Received This Month:**\n- **This Month:** ${c}${monthIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **This Week:** ${c}${(totals.incomeThisWeek ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Today:** ${c}${(totals.incomeToday ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **All-Time Income:** ${c}${allIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    const totalExp = totals.totalExpenses ?? 0;
    const buckets = context.buckets || {};
    const aiSub = context.aiTotalMonthly ?? 0;

    if (isSomali) {
      return `💡 **Talooyin Ficil ah oo ku saabsan Maamulka & Dhimista Kharashka:**\n\n` +
        (totalExp === 0
          ? `Hadda ma jiro wax kharash ah oo laguu diiwaangeliyay (${c}0.00). Si aad dhaqaalahaaga si sax ah ugu maamusho, raac qodobadan muhiimka ah:\n`
          : `Wadarta kharashkaaga hadda waa **${c}${totalExp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (Qoyska: ${c}${(buckets.family ?? 0).toFixed(2)}, Naftaada: ${c}${(buckets.myself ?? 0).toFixed(2)}, Ganacsiga: ${c}${(buckets.business ?? 0).toFixed(2)}).\n\n`) +
        `1. **Kala Saaridda Lacagta Ganacsiga & Qoyska:** Si adag u kala saar lacagta shaqada XirfadoNet iyo kharashka qoyska/naftaada.\n` +
        `2. **Dib u Eegista Rukunyada AI:** Xaqiiji qalabka AI iyo software-yada (${c}${aiSub.toFixed(2)}/bishii) inaad isticmaasho kuwa muhiimka ah oo keliya.\n` +
        `3. **Xadka Kharashka Maalinlaha ah:** Deji xad maalinle ah (Daily Limit) qaybta Dejinta si aad uga fogaato kharashyada aan qorshaysnayn.\n` +
        `4. **Yoolka Kaydka (20% Rule):** Dhig ugu yaraan 20% dakhli kasta oo soo gala sanduuqa kaydka ka hor inta aanad wax kharash ah bixin.`;
    }

    return `💡 **Practical Advice for Expense Optimization & Money Management:**\n\n` +
      (totalExp === 0
        ? `No expenses have been recorded yet (${c}0.00). To manage your finances proactively from day one:\n`
        : `Your recorded total spending is **${c}${totalExp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (Family: ${c}${(buckets.family ?? 0).toFixed(2)}, Personal: ${c}${(buckets.myself ?? 0).toFixed(2)}, Business: ${c}${(buckets.business ?? 0).toFixed(2)}).\n\n`) +
      `1. **Strict Bucket Separation:** Keep your XirfadoNet business operating capital isolated from family and personal discretionary spending.\n` +
      `2. **Audit AI & SaaS Subscriptions:** Currently at ${c}${aiSub.toFixed(2)}/mo. Cancel any redundant subscriptions not directly generating value.\n` +
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
    const totalExp = totals.totalExpenses ?? 0;
    if (totalExp === 0) {
      if (isSomali) {
        return `💸 **Wadarta Kharashka:** Weli wax kharash ah laguma diiwaangelin nidaamka (${c}0.00). Ma jiro kharash ganacsi ama mid shakhsi ah oo la qoray.`;
      }
      return `💸 **Total Expenses:** No expenses recorded yet (${c}0.00). You have not logged any business or personal expenses in the dashboard.`;
    }

    if (isSomali) {
      return `💸 **Kharashka la Diiwaangeliyay:**\n- **Wadarta Guud ee Kharashka:** ${c}${totalExp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Kharashka Bishan:** ${c}${(totals.expensesThisMonth ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Kharashka Maanta:** ${c}${(totals.expensesToday ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `💸 **Expenses Recorded:**\n- **Total Lifetime Expenses:** ${c}${totalExp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **This Month:** ${c}${(totals.expensesThisMonth ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Today:** ${c}${(totals.expensesToday ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 5. Highest expenses this month (Maxaa kharash badan iga galay bishan?)
  if (
    q.includes('kharash badan') ||
    q.includes('ugu badan') ||
    q.includes('highest expense') ||
    q.includes('most expensive') ||
    q.includes('top expense')
  ) {
    const totalExp = totals.totalExpenses ?? 0;
    if (totalExp === 0) {
      if (isSomali) {
        return `📊 **Kharashka Ugu Badan:** Maadaama aan weli wax kharash ah la diiwaangelin bishan (${c}0.00), ma jiraan kharashyo gaar ah oo la falanqeyn karo.`;
      }
      return `📊 **Highest Expenses:** Since no expenses have been recorded yet this month (${c}0.00), there are no expense categories to rank.`;
    }

    const buckets = context.buckets || {};
    if (isSomali) {
      return `📊 **Falanqaynta Kharashaadka Bishan:**\n- **Qoyska:** ${c}${(buckets.family ?? 0).toFixed(2)}\n- **Naftaada:** ${c}${(buckets.myself ?? 0).toFixed(2)}\n- **Ganacsiga:** ${c}${(buckets.business ?? 0).toFixed(2)}\n- **Wadarta Guud:** ${c}${totalExp.toFixed(2)}`;
    }
    return `📊 **Expense Breakdown:**\n- **Family:** ${c}${(buckets.family ?? 0).toFixed(2)}\n- **Personal (Myself):** ${c}${(buckets.myself ?? 0).toFixed(2)}\n- **Business:** ${c}${(buckets.business ?? 0).toFixed(2)}\n- **Total Spending:** ${c}${totalExp.toFixed(2)}`;
  }

  // 6. Savings (Lacag intee le’eg ayaan kaydsaday?)
  if (q.includes('kaydsaday') || q.includes('kaydiyay') || q.includes('kaydka') || q.includes('saved') || q.includes('savings')) {
    const savings = totals.savingsBalance ?? 0;
    const goalsCount = context.savings?.activeGoalsCount ?? 0;
    if (isSomali) {
      return `🏦 **Xogta Kaydka:**\n- **Wadarta Kaydsan:** **${c}${savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n- **Yoolalka Kaydka ee Firfircoon:** ${goalsCount}\n${savings === 0 ? '\n*Fadlan riix batoonka Kaydka (Savings) si aad u abuurto yool kayd ah ama lacag ugu shubto sanduuqaaga.*' : ''}`;
    }
    return `🏦 **Savings Summary:**\n- **Total Saved:** **${c}${savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n- **Active Savings Goals:** ${goalsCount}\n${savings === 0 ? '\n*You can create a savings goal or deposit funds by visiting the Savings section.*' : ''}`;
  }

  // 7. Family allocation (Immisa ayaan ku bixiyay qoyskayga?)
  if (q.includes('family') || q.includes('qoys')) {
    const familySpent = context.buckets?.family ?? 0;
    if (familySpent === 0) {
      return isSomali
        ? `👨‍👩‍👧 **Kharashka Qoyska:** Wax kharash ah oo qoyska ku baxay lama diiwaangelin (${c}0.00).`
        : `👨‍👩‍👧 **Family Spending:** You have recorded ${c}0.00 spent on family. No family transactions exist yet.`;
    }
    const percent = totals.totalExpenses > 0 ? Math.round((familySpent / totals.totalExpenses) * 100) : 0;
    return isSomali
      ? `👨‍👩‍👧 **Kharashka Qoyska:** Waxaad qoyska ku bixisay **${c}${familySpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (${percent}% ee wadarta kharashaadkaaga).`
      : `👨‍👩‍👧 **Family Allocation:** You have spent **${c}${familySpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** on family support (${percent}% of total expenses).`;
  }

  // 8. Personal allocation (Immisa ayaan ku bixiyay naftayda?)
  if (q.includes('myself') || q.includes('personal') || q.includes('naftayd')) {
    const myselfSpent = context.buckets?.myself ?? 0;
    if (myselfSpent === 0) {
      return isSomali
        ? `👤 **Kharashka Naftaada:** Wax kharash ah oo naftaada ku baxay lama diiwaangelin (${c}0.00).`
        : `👤 **Personal (Myself) Spending:** You have recorded ${c}0.00 spent on personal needs.`;
    }
    const percent = totals.totalExpenses > 0 ? Math.round((myselfSpent / totals.totalExpenses) * 100) : 0;
    return isSomali
      ? `👤 **Kharashka Naftaada:** Waxaad naftaada ku bixisay **${c}${myselfSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (${percent}% ee wadarta kharashaadkaaga).`
      : `👤 **Personal Allocation:** You have spent **${c}${myselfSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** on personal/myself expenses (${percent}% of total expenses).`;
  }

  // 9. Which course earned the most? (Koorsadee dakhliga ugu badan keentay?)
  if (q.includes('which course') || q.includes('top course') || q.includes('koorsadee') || q.includes('koorsada ugu')) {
    const topCourse = context.topCourse;
    if (!topCourse || !topCourse.title || topCourse.salesCount === 0) {
      return isSomali
        ? `📚 **Iibka Koorsooyinka:** Weli ma jiro iib koorso oo la diiwaangeliyay. Wadarta dakhliga koorsooyinka waa ${c}0.00 guud ahaan ${context.courses?.length || 0} koorso oo ku jira nidaamka.`
        : `📚 **Course Performance:** No course sales have been recorded yet. Total course revenue is ${c}0.00 across ${context.courses?.length || 0} catalog courses.`;
    }
    return isSomali
      ? `📚 **Koorsada Ugu Dakhliga Badan:**\n- **Koorsada:** **${topCourse.title}**\n- **Tirada la Iibiyay:** ${topCourse.salesCount} enrollments\n- **Dakhliga la Helay:** ${c}${(topCourse.revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Koorsooyinka Diyaar ah:** ${context.courses?.length || 0}`
      : `📚 **Top Earning Course:**\n- **Course:** **${topCourse.title}**\n- **Enrollments:** ${topCourse.salesCount} units sold\n- **Revenue Received:** ${c}${(topCourse.revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Catalog Courses:** ${context.courses?.length || 0} total`;
  }

  // 10. Current balance (Waa maxay hadhaaga lacagtayda hadda?)
  if (q.includes('current balance') || q.includes('hadhaaga') || q.includes('balance')) {
    const balance = totals.availableBalance ?? 0;
    return isSomali
      ? `💳 **Hadhaaga Lacagta ee Hadda:** **${c}${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n- **Wadarta Dakhliga:** ${c}${(totals.totalIncome ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Wadarta Kharashka:** ${c}${(totals.totalExpenses ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Faa'iidada Saafiga ah:** ${c}${(totals.netProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `💳 **Current Liquid Balance:** **${c}${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n- **Total Income:** ${c}${(totals.totalIncome ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Total Expenses:** ${c}${(totals.totalExpenses ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Net Profit:** ${c}${(totals.netProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 11. Affordability check (Ma awoodaa inaan bixiyo $X?)
  if (q.includes('afford') || q.includes('awoodaa') || q.includes('awoodi')) {
    const match = q.match(/\$?(\d+(\.\d+)?)/);
    const requestedAmount = match ? parseFloat(match[1]) : 20;
    const balance = totals.availableBalance ?? 0;
    const dailyLimit = totals.dailyBudgetRemaining ?? 0;

    if (balance < requestedAmount) {
      return isSomali
        ? `⚠️ **Hubinta Awoodda Lacageed ee ${c}${requestedAmount}:**\n- **Hadhaagaaga Hadda:** ${c}${balance.toFixed(2)}\n- **Go'aanka:** **Maya**, bixinta ${c}${requestedAmount} waxay ka badan tahay hadhaagaaga oo ah ${c}${balance.toFixed(2)}.`
        : `⚠️ **Affordability Check for ${c}${requestedAmount}:**\n- **Current Balance:** ${c}${balance.toFixed(2)}\n- **Verdict:** **No**, spending ${c}${requestedAmount} exceeds your current available balance of ${c}${balance.toFixed(2)}.`;
    }

    if (dailyLimit > 0 && requestedAmount > dailyLimit) {
      return isSomali
        ? `⚠️ **Digniin Miisaaniyad ${c}${requestedAmount}:**\n- **Hadhaagaaga Hadda:** ${c}${balance.toFixed(2)} (lacag waa haysataa)\n- **Xadka Maanta kuu haray:** ${c}${dailyLimit.toFixed(2)}\n- **Go'aanka:** Lacag waad haysataa, laakiin waxay ${c}${(requestedAmount - dailyLimit).toFixed(2)} ka badan tahay xadkaaga maalinlaha ah.`
        : `⚠️ **Affordability Warning for ${c}${requestedAmount}:**\n- **Current Balance:** ${c}${balance.toFixed(2)} (sufficient cash)\n- **Remaining Daily Budget:** ${c}${dailyLimit.toFixed(2)}\n- **Verdict:** You have sufficient cash, but spending ${c}${requestedAmount} will exceed your configured daily spending limit by ${c}${(requestedAmount - dailyLimit).toFixed(2)}.`;
    }

    return isSomali
      ? `✅ **Waa Ammaan in la Bixiyo ${c}${requestedAmount}:**\n- **Hadhaagaaga Hadda:** ${c}${balance.toFixed(2)}\n- **Go'aanka:** **Haa**, waxaad si ammaan ah u bixin kartaa ${c}${requestedAmount}. Waxaa kuu haraya ${c}${(balance - requestedAmount).toFixed(2)}.`
      : `✅ **Affordability Approved for ${c}${requestedAmount}:**\n- **Current Available Balance:** ${c}${balance.toFixed(2)}\n- **Verdict:** **Yes**, you can comfortably afford ${c}${requestedAmount}. It leaves you with ${c}${(balance - requestedAmount).toFixed(2)} in available cash.`;
  }

  // Fallback financial summary
  if (isSomali) {
    return `📊 **Xogta Maaliyadeed ee XirfadoNet:**\n- **Hadhaaga Lacagta:** ${c}${(totals.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Dakhliga Bishan:** ${c}${(totals.incomeThisMonth ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Kharashka Bishan:** ${c}${(totals.expensesThisMonth ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Faa'iidada Saafiga ah:** ${c}${(totals.netProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Iibka Koorsooyinka:** ${totals.totalCourseSalesCount ?? 0} enrollments.\n\n*Waxaad i waydiin kartaa su'aal kasta oo ku saabsan dakhligaaga, kharashkaaga, iibka koorsooyinka, ama maamulka dhaqaalahaaga.*`;
  }

  return `📊 **Financial Summary for XirfadoNet:**\n- **Available Balance:** ${c}${(totals.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Net Profit:** ${c}${(totals.netProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Income This Month:** ${c}${(totals.incomeThisMonth ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Expenses This Month:** ${c}${(totals.expensesThisMonth ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n- **Course Units Sold:** ${totals.totalCourseSalesCount ?? 0} enrollments.`;
}

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 XirfadoNet Owner Dashboard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
