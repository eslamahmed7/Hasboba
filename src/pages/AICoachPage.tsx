import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, Sparkles, User, Bot } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGeminiAICoachResponse } from '../lib/gemini';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

interface AICoachPageProps {
  onClose: () => void;
  onRequireUpgrade?: () => void;
}

const getInitialInsights = (balance: { current: number; income: number; expenses: number }, sym: string, aiTone = 'friendly') => {
  const isStrict = aiTone === 'strict';
  const isProf = aiTone === 'professional';

  const insights: Message[] = [
    {
      id: '0',
      role: 'ai',
      text: isStrict ? `رصيدك الحالي. لنبدأ تحليل بياناتك:` : isProf ? `مرحباً بك. إليك موجز الوضع المالي الخاص بك:` : `أهلاً! 👋 أنا مستشارك المالي الذكي.\nإليك أبرز نقاط حسابك الآن:`,
      time: 'الآن',
    }
  ];
  if (balance.expenses > 0 && balance.income > 0) {
    const spendingPct = Math.round((balance.expenses / balance.income) * 100);
    let msg = `📊 نسبة الإنفاق من الدخل: **${spendingPct}%**. `;
    if (spendingPct > 80) {
      msg += isStrict ? 'هذا المعدل غير مقبول. يجب خفض النفقات فوراً.' : isProf ? 'هذا المعدل مرتفع، ينصح بترشيد النفقات.' : 'ده كتير شوية، حاول تقلل المصاريف.';
    } else {
      msg += isStrict ? 'معدل جيد. استمر في الانضباط.' : isProf ? 'معدل إنفاق ممتاز.' : 'ممتاز! نسبة الادخار كويسة.';
    }
    insights.push({ id: '1', role: 'ai', text: msg, time: 'الآن' });
  }
  if (balance.income > 0) {
    const savingsSuggestion = Math.round(balance.income * 0.1);
    insights.push({
      id: '2',
      role: 'ai',
      text: isStrict ? `يجب ادخار ${savingsSuggestion.toLocaleString('en-US')} ${sym} شهرياً بصرامة.` : isProf ? `نوصي بادخار مبلغ ${savingsSuggestion.toLocaleString('en-US')} ${sym} شهرياً لضمان الاستقرار.` : `💡 نصيحة: ادخر ${savingsSuggestion.toLocaleString('en-US')} ${sym} (10% من دخلك) كل شهر لبناء طوارئ مالية.`,
      time: 'الآن',
    });
  }
  if (balance.current < 0) {
    insights.push({
      id: '3',
      role: 'ai',
      text: isStrict ? `⚠️ الرصيد سالب. توقف عن الإنفاق وابدأ في سداد الديون.` : isProf ? `⚠️ الرصيد الحالي سلبي. يجب مراجعة النفقات لمعالجة العجز.` : `⚠️ رصيدك بالسالب! مصاريفك أكثر من دخلك. راجع المصاريف وقلل منها فوراً.`,
      time: 'الآن',
    });
  }
  return insights;
};

export function AICoachPage({ onClose, onRequireUpgrade }: AICoachPageProps) {
  const { balance, user, transactions, debts, subscriptions, savingsGoals } = useApp();
  const sym = user?.currency || 'EGP';
  const [messages, setMessages] = useState<Message[]>(() => getInitialInsights(balance, sym, user?.aiTone));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (user?.plan !== 'pro' && onRequireUpgrade) {
      onRequireUpgrade();
    }
  }, [user?.plan, onRequireUpgrade]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'ar-EG';
      
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => prev ? prev + ' ' + transcript : transcript);
        }
      };
      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('ميزة التعرف على الصوت غير مدعومة في متصفحك حالياً.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const quickQuestions = [
    'كيف أوفر فلوس؟',
    'حلل مصاريفي',
    'نصيحة للادخار',
    'خطة ميزانية شهرية',
  ];

  const sendMessage = async (text: string = input) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      time: 'الآن',
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const financialContext = {
        name: user?.name || 'مستخدم',
        currency: sym,
        aiTone: user?.aiTone || 'friendly',
        aiDetailLevel: user?.aiDetailLevel || 'detailed',
        balance: balance,
        recentTransactions: transactions.map(t => ({
          type: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description,
          date: t.date
        })),
        debts: debts.map(d => ({
          contactName: d.contactName,
          amount: d.amount,
          dueDate: d.dueDate,
          type: d.type,
          isPaid: d.isPaid
        })),
        subscriptions: subscriptions.map(s => ({
          name: s.name,
          amount: s.amount,
          billingDate: s.billingDate
        })),
        savingsGoals: savingsGoals.map(g => ({
          name: g.name,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          deadline: g.deadline
        }))
      };

      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      const aiResponse = await getGeminiAICoachResponse(chatHistory, financialContext);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiResponse,
        time: 'الآن',
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'حدث خطأ في الاتصال بمستشار الذكاء الاصطناعي. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.',
        time: 'الآن',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d13]">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[#1f2937]">
        <button onClick={onClose}>
          <X size={20} className="text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-white font-bold text-base">المستشار المالي AI</h1>
          <div className="w-8 h-8 rounded-xl bg-[#4ade80]/15 flex items-center justify-center">
            <Sparkles size={16} className="text-[#4ade80]" />
          </div>
        </div>
        <div className="w-6" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i < 4 ? i * 0.15 : 0 }}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'ai' ? 'bg-[#4ade80]/15' : 'bg-[#1a2535]'
            }`}>
              {msg.role === 'ai'
                ? <Bot size={16} className="text-[#4ade80]" />
                : <User size={16} className="text-gray-400" />
              }
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'ai'
                  ? 'bg-[#111827] border border-[#1f2937] text-gray-200 rounded-tl-sm'
                  : 'bg-[#4ade80]/10 border border-[#4ade80]/20 text-white rounded-tr-sm'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-[#4ade80]/15 flex items-center justify-center">
                <Bot size={16} className="text-[#4ade80]" />
              </div>
              <div className="bg-[#111827] border border-[#1f2937] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 bg-[#4ade80] rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="px-4 mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {quickQuestions.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="shrink-0 px-3 py-1.5 bg-[#111827] border border-[#1f2937] rounded-xl text-gray-300 text-xs font-medium hover:border-[#4ade80]/30 transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex gap-2">
        <button 
          onClick={toggleListening}
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-all ${
            isListening 
              ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
              : 'bg-[#111827] border-[#1f2937] text-gray-400'
          }`}
        >
          <Mic size={18} />
        </button>
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="اسألني عن ماليتك..."
            className="w-full bg-[#111827] border border-[#1f2937] rounded-2xl py-3 pr-4 pl-12 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40 text-right"
          />
          <button
            onClick={() => sendMessage()}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#4ade80] flex items-center justify-center"
          >
            <Send size={15} className="text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
