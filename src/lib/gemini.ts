import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBBlhDfQloXaI8sPPq6GJH6UnOlWBuVMM4';
const genAI = new GoogleGenerativeAI(API_KEY);

// Categories definitions to restrict output
const EXPENSE_CATEGORIES = ['طعام', 'مواصلات', 'تسوق', 'فواتير', 'ترفيه', 'صحة', 'تعليم', 'هدايا', 'سكن', 'شخصي', 'استثمار', 'أخرى'];
const INCOME_CATEGORIES = ['راتب', 'عمل حر', 'هدية', 'مكافأة', 'استثمار', 'أخرى'];

export interface UserFinancialContext {
  name: string;
  currency: string;
  aiTone: 'friendly' | 'professional' | 'strict';
  aiDetailLevel: 'brief' | 'detailed';
  balance: { current: number; income: number; expenses: number };
  recentTransactions: Array<{
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
  }>;
  debts: Array<{
    contactName: string;
    amount: number;
    dueDate: string;
    type: 'owed' | 'owe';
    isPaid: boolean;
  }>;
  subscriptions: Array<{
    name: string;
    amount: number;
    billingDate: string;
  }>;
  savingsGoals: Array<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
  }>;
}

/**
 * Communicates with Gemini to get financial coach response
 */
export async function getGeminiAICoachResponse(
  messages: Array<{ role: 'user' | 'ai'; text: string }>,
  context: UserFinancialContext
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format context summary
    const txSummary = context.recentTransactions
      .map(t => `- [${t.date}] ${t.type === 'income' ? 'دخل' : 'مصروف'}: ${t.amount} ${context.currency} (${t.category} - ${t.description})`)
      .join('\n');
    
    const debtSummary = context.debts
      .map(d => `- ${d.type === 'owe' ? 'دين عليه لـ' : 'دين له عند'} ${d.contactName}: ${d.amount} ${context.currency} (تاريخ الاستحقاق: ${d.dueDate}, الحالة: ${d.isPaid ? 'تم السداد' : 'غير مسدد'})`)
      .join('\n');

    const subSummary = context.subscriptions
      .map(s => `- اشتراك ${s.name}: ${s.amount} ${context.currency} (تاريخ الفاتورة: ${s.billingDate})`)
      .join('\n');

    const savingsSummary = context.savingsGoals
      .map(g => `- هدف ${g.name}: تم جمع ${g.currentAmount} من أصل ${g.targetAmount} ${context.currency} (الموعد: ${g.deadline || 'غير محدد'})`)
      .join('\n');

    // Build instruction prompt based on user tone and detail level
    let tonePrompt = '';
    if (context.aiTone === 'strict') {
      tonePrompt = 'أسلوبك صارم وحازم جداً (Strict Persona). إذا كان هناك إسراف أو عجز، قم بتوبيخ المستخدم بلهجة جادة وحذره من التبذير. ركز على التقشف وحثه على إيقاف النفقات غير الضرورية فوراً. لا تكن لطيفاً بشكل مفرط، كن حاسماً كمدرب مالي صارم.';
    } else if (context.aiTone === 'professional') {
      tonePrompt = 'أسلوبك مهني ورسمي وموضوعي (Professional Persona). قدم تحليلات مالية دقيقة وموثوقة بلغة واضحة ومهذبة ومنظمة، مع التركيز على الأرقام والخطوات العملية المحسوبة دون عواطف زائدة.';
    } else {
      tonePrompt = 'أسلوبك ودود ولطيف ومحفز (Friendly/Empathetic Persona). استخدم رموزاً تعبيرية (Emojis) بشكل معقول، شجع المستخدم في خطواته، وكن مرشداً مالياً دافئاً ولطيفاً.';
    }

    let detailPrompt = '';
    if (context.aiDetailLevel === 'brief') {
      detailPrompt = 'الاستجابة يجب أن تكون موجزة ومباشرة جداً (خلفية سريعة بحد أقصى 2-3 جمل)، لا تطل في التفاصيل أو المقدمات.';
    } else {
      detailPrompt = 'الاستجابة يجب أن تكون مفصلة وشاملة تشمل تحليلات بالأرقام، جداول مقترحة أو خطوات عملية مرتبة إذا دعت الحاجة.';
    }

    const systemInstruction = `
أنت "حسبوبة AI" - مستشار مالي ذكي وتطبيق إدارة مالية شخصية متطور.
يجب أن تتحدث مع المستخدم باللغة العربية حصراً.
يجب كتابة جميع الأرقام باستخدام الأرقام الإنجليزية (مثل 1, 2, 3، 500، 1200) ولا تستخدم الأرقام العربية المشرقية (مثل ١، ٢، ٣).
الاختصارات المالية والعملات اكتبها بالإنجليزية أو اختصار العملة الإنجليزية (مثل EGP، USD).
تجنب استخدام عناوين ماركداون ضخمة (لا تستخدم # أو ##، استخدم فقط ### كحد أقصى للترتيب لتناسب شاشة الهاتف).

بيانات المستخدم المالية الحالية:
- اسم المستخدم: ${context.name}
- الرصيد الحالي: ${context.balance.current} ${context.currency}
- إجمالي الدخل: ${context.balance.income} ${context.currency}
- إجمالي المصاريف: ${context.balance.expenses} ${context.currency}

المعاملات الأخيرة:
${txSummary || 'لا توجد معاملات مسجلة بعد.'}

الديون القائمة:
${debtSummary || 'لا توجد ديون مسجلة.'}

الاشتراكات الشهرية:
${subSummary || 'لا توجد اشتراكات مسجلة.'}

أهداف الادخار:
${savingsSummary || 'لا توجد أهداف ادخار مسجلة.'}

تفضيلات الأسلوب:
- الأسلوب المطلوب: ${context.aiTone} -> ${tonePrompt}
- تفصيل الإجابة: ${context.aiDetailLevel} -> ${detailPrompt}

يرجى الإجابة عن سؤال أو استفسار المستخدم بناءً على السياق المالي المذكور أعلاه وتفضيلات الأسلوب.
`;

    // Map message history to Gemini format
    const chatHistory = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Check if history has user message to trigger response
    const lastUserMessage = chatHistory[chatHistory.length - 1];
    const previousHistory = chatHistory.slice(0, chatHistory.length - 1);

    const chat = model.startChat({
      history: previousHistory,
      systemInstruction: systemInstruction,
    });

    const response = await chat.sendMessage(lastUserMessage ? lastUserMessage.parts[0].text : 'أهلاً بك');
    return response.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'عذراً، حدث خطأ أثناء الاتصال بمستشار الذكاء الاصطناعي. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.';
  }
}

/**
 * Parses receipt/invoice image using Gemini 1.5 Flash
 */
export async function parseReceiptImage(
  base64Data: string,
  mimeType: string
): Promise<{
  amount: number;
  category: string;
  description: string;
  type: 'expense';
} | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const prompt = `
أنت قارئ فواتير ذكي. قم بتحليل صورة الفاتورة المستلمة واستخرج البيانات التالية بدقة.
تأكد من استخراج المبلغ الإجمالي المدفوع (Total Amount).
قم بتصنيف المعاملة إلى واحدة من الفئات التالية حصراً:
${JSON.stringify(EXPENSE_CATEGORIES)}

يجب إرجاع النتيجة بتنسيق JSON فقط يحتوي على المفاتيح التالية:
- amount: (رقم) القيمة الإجمالية للفاتورة بالإنجليزية
- category: (نص) أحد التصنيفات المعتمدة أعلاه
- description: (نص) وصف مختصر باللغة العربية لمحتوى الفاتورة (مثال: "وجبة غداء"، "شراء مستلزمات بقالة")
- type: (نص) دائماً "expense"

مثال للرد المطلوب:
{
  "amount": 150.50,
  "category": "طعام",
  "description": "طلب وجبة من مطعم",
  "type": "expense"
}

لا تضف أي نصوص توضيحية أو وسوم ماركداون (لا تستخدم \`\`\`json). أرجع النص كـ JSON صالح ومباشر.
`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            imagePart
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const text = result.response.text();
    return cleanAndParseJson(text);
  } catch (error) {
    console.error('Error parsing receipt image via Gemini:', error);
    throw error;
  }
}

/**
 * Robust JSON extraction helper to handle markdown wrappers and formatting anomalies
 */
function cleanAndParseJson(text: string): any {
  let clean = text.trim();
  if (clean.includes('```')) {
    const firstIndex = clean.indexOf('```');
    const lastIndex = clean.lastIndexOf('```');
    if (firstIndex !== -1 && lastIndex !== -1 && firstIndex !== lastIndex) {
      let content = clean.substring(firstIndex + 3, lastIndex);
      if (content.startsWith('json')) {
        content = content.substring(4);
      }
      clean = content.trim();
    } else {
      clean = clean.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
  }
  
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.warn("Direct JSON parsing failed, attempting extraction...", e);
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const extracted = clean.substring(start, end + 1);
      return JSON.parse(extracted);
    }
    throw e;
  }
}

/**
 * Parses financial voice commands using Gemini 1.5 Flash
 */
export async function parseVoiceCommand(
  text: string
): Promise<{
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
} | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
أنت محلل أوامر صوتية ذكي لتطبيق إدارة مالية شخصية.
المستخدم قام بإملاء أمر صوتي باللغة العربية (أو العامية المصرية/العربية) يصف معاملة مالية (مثال: "صرفت 50 جنيه في المواصلات"، "جالي راتب 8000 جنيه"، "دفعت فاتورة الكهرباء 200 جنيه").

قم بتحليل النص التالي بدقة واستخرج تفاصيل المعاملة:
"${text}"

القواعد:
1. تحديد نوع المعاملة (type): إما "expense" (مصروف) أو "income" (دخل).
2. استخراج المبلغ (amount): رقم صحيح أو عشري بالإنجليزية.
3. تصنيف المعاملة (category):
   - إذا كان مصروفاً (expense)، يجب أن يكون أحد هذه التصنيفات حصراً: ${JSON.stringify(EXPENSE_CATEGORIES)}
   - إذا كان دخلاً (income)، يجب أن يكون أحد هذه التصنيفات حصراً: ${JSON.stringify(INCOME_CATEGORIES)}
4. استخراج الوصف (description): وصف مختصر ومفهوم للمعاملة باللغة العربية.

يجب إرجاع النتيجة بتنسيق JSON فقط يحتوي على المفاتيح التالية:
- amount: (رقم) القيمة المستخرجة
- category: (نص) التصنيف المعتمد
- description: (نص) وصف مختصر
- type: (نص) "income" أو "expense"

مثال للرد المطلوب:
{
  "amount": 75,
  "category": "ترفيه",
  "description": "تذكرة سينما",
  "type": "expense"
}

لا تضف أي نصوص توضيحية أو وسوم ماركداون (لا تستخدم \`\`\`json). أرجع النص كـ JSON صالح ومباشر.
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    return cleanAndParseJson(responseText);
  } catch (error) {
    console.error('Error parsing voice command via Gemini:', error);
    throw error;
  }
}
