import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Bot, User, Sparkles, Send, Loader2, RefreshCw, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ── Theme constants ────────────────────────────────────────────────────────────
const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BORDER  = '#1e3035';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

export function AICoachPage({ onClose, onRequireUpgrade }: { onClose: () => void, onRequireUpgrade?: () => void }) {
  const { user, balance, transactions } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: `أهلاً بك يا ${user?.name || 'صديقي'}! 👋\n\nأنا مستشارك المالي الذكي. بناءً على بياناتك، لقد قمت بإنفاق **${balance.expenses.toLocaleString()} ${user?.currency}** هذا الشهر. كيف يمكنني مساعدتك اليوم؟`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || user?.plan !== 'pro') {
      if (user?.plan !== 'pro') onRequireUpgrade?.();
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `هذه ميزة تجريبية للمستشار الذكي. في النسخة النهائية، سيقوم بتحليل ميزانيتك وتقديم نصائح مخصصة لك بناءً على معاملاتك.\n\nلديك الآن **${transactions.length}** معاملة مسجلة.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const suggestions = [
    "كيف أقلل مصاريفي هذا الشهر؟",
    "حلل إنفاقي في آخر أسبوعين",
    "اقترح خطة لادخار 20% من الراتب"
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: BG_BASE }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}`, background: BG_CARD }}>
        <button onClick={onClose} className="text-sm font-bold transition-colors" style={{ color: '#6a9ca2' }}>
          إغلاق
        </button>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <h1 className="text-white font-bold text-sm">المستشار المالي (AI)</h1>
            <p className="text-[10px]" style={{ color: ACCENT }}>متصل دائمًا</p>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `rgba(0,173,181,0.15)` }}>
            <Sparkles size={16} style={{ color: ACCENT }} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
            
            <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center ${msg.role === 'ai' ? 'mt-1' : ''}`}
              style={{ background: msg.role === 'ai' ? `rgba(0,173,181,0.15)` : BG_CARD, border: `1px solid ${BORDER}` }}>
              {msg.role === 'ai'
                ? <Bot size={16} style={{ color: ACCENT }} />
                : <User size={16} style={{ color: '#6a9ca2' }} />
              }
            </div>

            <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed`}
              style={{
                background: msg.role === 'ai' ? BG_CARD : `rgba(0,173,181,0.1)`,
                border: msg.role === 'ai' ? `1px solid ${BORDER}` : `1px solid ${ACCENT}30`,
                color: msg.role === 'ai' ? '#e5e7eb' : 'white',
                borderRadius: msg.role === 'ai' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              }}>
              <ReactMarkdown className="prose prose-invert prose-sm rtl max-w-none">
                {msg.content}
              </ReactMarkdown>
              <p className="text-[9px] mt-2 text-left" style={{ color: '#4a7a80' }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `rgba(0,173,181,0.15)` }}>
              <Bot size={16} style={{ color: ACCENT }} />
            </div>
            <div className="rounded-2xl rounded-tr-sm px-4 py-3 flex gap-1 items-center" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4" style={{ background: BG_BASE, borderTop: `1px solid ${BORDER}` }}>
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide rtl" style={{ direction: 'rtl' }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: '#a0b8bc' }}>
              {s}
            </button>
          ))}
        </div>
        <div className="relative flex items-center gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="اسأل مستشارك المالي..."
            className="w-full rounded-2xl py-3 pr-4 pl-12 text-sm text-right focus:outline-none placeholder-[#3a6068]"
            style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
          <button onClick={handleSend} disabled={!input.trim()}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-50"
            style={{ background: ACCENT }}>
            <Send size={14} className="-ml-0.5 text-[#07100f]" />
          </button>
        </div>
      </div>
    </div>
  );
}
