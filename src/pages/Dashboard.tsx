import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, Camera, Mic, PenLine,
  TrendingUp, TrendingDown, Trash2, Bell,
  Utensils, Car, Gamepad2, ShoppingBag, HeartPulse, Receipt,
  GraduationCap, Gift, Home, User, MoreHorizontal,
  Briefcase, Laptop, BarChart2, Sparkles, PlusCircle, Eye, EyeOff,
  ChevronLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseReceiptImage, parseVoiceCommand } from '../lib/gemini';

const iconMap: Record<string, React.ElementType> = {
  utensils: Utensils, car: Car, 'gamepad-2': Gamepad2,
  'shopping-bag': ShoppingBag, 'heart-pulse': HeartPulse, receipt: Receipt,
  'graduation-cap': GraduationCap, gift: Gift, home: Home, user: User,
  'trending-up': TrendingUp, 'more-horizontal': MoreHorizontal,
  briefcase: Briefcase, laptop: Laptop, 'bar-chart-2': BarChart2,
  sparkles: Sparkles, 'plus-circle': PlusCircle,
};

const expenseCategories = [
  { id: '1', name: 'طعام', icon: 'utensils', color: '#f97316' },
  { id: '2', name: 'مواصلات', icon: 'car', color: '#3b82f6' },
  { id: '3', name: 'تسوق', icon: 'shopping-bag', color: '#ec4899' },
  { id: '4', name: 'فواتير', icon: 'receipt', color: '#eab308' },
  { id: '5', name: 'ترفيه', icon: 'gamepad-2', color: '#a855f7' },
  { id: '6', name: 'صحة', icon: 'heart-pulse', color: '#ef4444' },
  { id: '7', name: 'تعليم', icon: 'graduation-cap', color: '#6366f1' },
  { id: '8', name: 'هدايا', icon: 'gift', color: '#f43f5e' },
  { id: '9', name: 'سكن', icon: 'home', color: '#14b8a6' },
  { id: '10', name: 'شخصي', icon: 'user', color: '#6b7280' },
  { id: '11', name: 'استثمار', icon: 'bar-chart-2', color: '#22c55e' },
  { id: '12', name: 'أخرى', icon: 'more-horizontal', color: '#64748b' },
];

const incomeCategories = [
  { id: '1', name: 'راتب', icon: 'briefcase', color: '#22c55e' },
  { id: '2', name: 'عمل حر', icon: 'laptop', color: '#3b82f6' },
  { id: '3', name: 'هدية', icon: 'gift', color: '#ec4899' },
  { id: '4', name: 'مكافأة', icon: 'sparkles', color: '#eab308' },
  { id: '5', name: 'استثمار', icon: 'bar-chart-2', color: '#a855f7' },
  { id: '6', name: 'أخرى', icon: 'more-horizontal', color: '#64748b' },
];

interface DashboardProps {
  onOpenAI?: () => void;
  onOpenNotifications?: () => void;
  onRequireUpgrade?: () => void;
}

export function Dashboard({ onOpenAI, onOpenNotifications, onRequireUpgrade }: DashboardProps) {
  const { transactions, addTransaction, deleteTransaction, balance, user, notifications } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'manual' | 'camera' | 'voice'>('manual');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [manualVoiceInput, setManualVoiceInput] = useState('');
  const recognitionRef = useRef<any>(null);

  // Auto start/stop listening when voice mode opens/closes
  useEffect(() => {
    if (showModal && modalMode === 'voice') {
      startVoiceListening();
    } else {
      stopVoiceListening();
    }
    return () => {
      stopVoiceListening();
    };
  }, [showModal, modalMode]);

  const startVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }
    
    setVoiceText('');
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'ar-EG';
    
    rec.onstart = () => {
      setIsListening(true);
    };
    
    rec.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
    };
    
    rec.onend = () => {
      setIsListening(false);
    };
    
    rec.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setVoiceText(transcript);
        handleVoiceAnalysis(transcript);
      }
    };
    
    recognitionRef.current = rec;
    rec.start();
  };

  const stopVoiceListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
  };

  const handleVoiceAnalysis = async (textToAnalyze: string) => {
    setIsProcessing(true);
    try {
      const result = await parseVoiceCommand(textToAnalyze);
      if (result) {
        setTxType(result.type || 'expense');
        setAmount(String(result.amount));
        setDescription(result.description);
        setSelectedCategory(result.category);
        setModalMode('manual');
      } else {
        alert('تعذر تحليل الأمر الصوتي. يرجى إدخال المعاملة يدوياً.');
      }
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء معالجة الصوت: ' + (err?.message || err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const mimeType = file.type;
          
          const result = await parseReceiptImage(base64Data, mimeType);
          if (result) {
            setTxType(result.type || 'expense');
            setAmount(String(result.amount));
            setDescription(result.description);
            setSelectedCategory(result.category);
            setModalMode('manual');
          } else {
            alert('تعذر قراءة بيانات الفاتورة. يرجى إدخال البيانات يدوياً.');
          }
        } catch (err: any) {
          console.error(err);
          alert('حدث خطأ أثناء معالجة الصورة بالذكاء الاصطناعي: ' + (err?.message || err));
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء قراءة الملف.');
      setIsProcessing(false);
    }
  };

  const sym = user?.currency || 'EGP';
  const categories = txType === 'expense' ? expenseCategories : incomeCategories;

  const filtered = transactions.filter(tx => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    if (s === 'الدخل' && tx.type === 'income') return true;
    if (s === 'المصاريف' && tx.type === 'expense') return true;
    return tx.description.toLowerCase().includes(s) ||
           tx.category.toLowerCase().includes(s);
  });

  const recentTx = filtered.slice(0, 15);

  const handleSubmit = () => {
    if (!amount || !selectedCategory) return;
    addTransaction({
      type: txType,
      amount: parseFloat(amount),
      category: selectedCategory,
      description: description || selectedCategory,
      date: new Date().toISOString().split('T')[0],
    });
    setAmount(''); setDescription(''); setSelectedCategory(null);
    setShowModal(false);
  };

  const formatNum = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatDate = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    const diff = Math.floor((today.getTime() - date.getTime()) / 86400000);
    if (diff === 0) return 'اليوم';
    if (diff === 1) return 'أمس';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCatColor = (name: string) => {
    const all = [...expenseCategories, ...incomeCategories];
    return all.find(c => c.name === name)?.color || '#64748b';
  };

  const getCatIcon = (name: string): React.ElementType => {
    const all = [...expenseCategories, ...incomeCategories];
    const cat = all.find(c => c.name === name);
    return iconMap[cat?.icon || 'more-horizontal'] || MoreHorizontal;
  };

  return (
    <div className="flex flex-col h-full pb-4">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">الشاشة الرئيسية</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (user?.plan !== 'pro' && onRequireUpgrade) {
                onRequireUpgrade();
              } else if (onOpenAI) {
                onOpenAI();
              }
            }}
            className="w-10 h-10 rounded-full bg-[#1a2535] flex items-center justify-center border border-yellow-500/30 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors" />
            <Sparkles size={20} className="text-yellow-500" />
          </button>
          <button
            onClick={onOpenNotifications}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors relative"
          >
            <Bell size={22} className="text-white" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#070a10]" />
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-5 mb-6">
        <div className="relative">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث ذكي..."
            className="w-full bg-[#111827] border border-[#1f2937] rounded-2xl py-3 pr-12 pl-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#4ade80]/40 text-right"
          />
        </div>
      </div>

      {/* Balance Ring */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          className="relative flex items-center justify-center"
          style={{ width: 220, height: 220 }}
        >
          {/* Glow */}
          <div className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)',
            }}
          />
          {/* Outer ring gradient */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="94" fill="none" stroke="#111827" strokeWidth="4" />
            <circle
              cx="100" cy="100" r="94" fill="none"
              stroke="url(#ringGrad)" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 94 * 0.85} ${2 * Math.PI * 94}`}
              transform="rotate(-90 100 100)"
              style={{ filter: 'drop-shadow(0 0 12px rgba(74,222,128,0.4))' }}
            />
          </svg>

          <div className="relative z-10 flex flex-col items-center pt-2">
            <p className="text-gray-300 text-sm mb-1">الرصيد الحالي</p>
            <div className="flex flex-col items-center">
              <span className="text-white font-bold text-3xl mb-1 tracking-tight">
                {showBalance ? formatNum(balance.current) : '••••••'}
              </span>
              <span className="text-gray-400 font-medium text-sm">{sym}</span>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="mt-3 p-1.5 rounded-full hover:bg-white/5 transition-colors">
              {showBalance ? <Eye size={18} className="text-gray-400" /> : <EyeOff size={18} className="text-gray-400" />}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Income / Expense cards */}
      <div className="px-5 flex gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-[#111827] border border-[#1f2937] rounded-2xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#166534]/30 border border-[#22c55e]/30 flex items-center justify-center">
              <TrendingDown size={14} className="text-[#4ade80]" />
            </div>
            <p className="text-gray-400 text-sm font-medium">الدخل</p>
          </div>
          <div>
            <p className="text-[#4ade80] font-bold text-lg">{formatNum(balance.income)} <span className="text-xs">{sym}</span></p>
            <p className="text-gray-500 text-xs mt-1">هذا الشهر</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex-1 bg-[#111827] border border-[#1f2937] rounded-2xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#7f1d1d]/30 border border-[#ef4444]/30 flex items-center justify-center">
              <TrendingUp size={14} className="text-red-400" />
            </div>
            <p className="text-gray-400 text-sm font-medium">المصاريف</p>
          </div>
          <div>
            <p className="text-red-400 font-bold text-lg">{formatNum(balance.expenses)} <span className="text-xs">{sym}</span></p>
            <p className="text-gray-500 text-xs mt-1">هذا الشهر</p>
          </div>
        </motion.div>
      </div>

      {/* Recent transactions */}
      <div className="px-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <button className="text-gray-400 text-sm hover:text-white transition-colors">
            عرض الكل
          </button>
          <h3 className="text-white font-bold text-base">المعاملات الأخيرة</h3>
        </div>

        {recentTx.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Receipt size={32} className="text-gray-600 mb-3" />
            <p className="text-gray-500 text-sm">لا توجد معاملات بعد</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-20">
            {recentTx.map((tx, i) => {
              const Icon = getCatIcon(tx.category);
              const color = getCatColor(tx.category);
              const isIncome = tx.type === 'income';
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                    <div className="text-left" style={{ direction: 'ltr' }}>
                      <p className={`font-bold text-sm ${isIncome ? 'text-[#4ade80]' : 'text-red-400'}`}>
                        {isIncome ? '+' : '-'}{formatNum(tx.amount)} {sym}
                      </p>
                      <p className="text-gray-500 text-xs text-right mt-0.5">{formatDate(tx.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-white text-sm font-bold">{tx.description}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{tx.category}</p>
                    </div>
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border"
                      style={{ backgroundColor: color + '15', borderColor: color + '30' }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setModalMode('manual'); setShowModal(true); }}
          className="w-14 h-14 rounded-full bg-[#4ade80] flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.4)]"
        >
          <Plus size={28} className="text-[#070a10]" strokeWidth={3} />
        </motion.button>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1120] rounded-t-[32px] border-t border-[#1f2937] max-h-[90vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex justify-center py-4">
                <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
              </div>

              <div className="px-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center">
                    <X size={18} className="text-gray-400" />
                  </button>
                  <h3 className="text-white font-bold text-lg">إضافة معاملة</h3>
                  <div className="w-8" />
                </div>

                {/* Input mode selector */}
                <div className="flex gap-2 mb-6 border-b border-[#1f2937] pb-4">
                  {[
                    { id: 'voice', label: 'صوتي (AI)', icon: Mic },
                    { id: 'camera', label: 'كاميرا (AI)', icon: Camera },
                    { id: 'manual', label: 'يدوي', icon: PenLine },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        if ((m.id === 'voice' || m.id === 'camera') && user?.plan !== 'pro') {
                          setShowModal(false);
                          if (onRequireUpgrade) onRequireUpgrade();
                        } else {
                          setModalMode(m.id as typeof modalMode);
                        }
                      }}
                      className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-2xl transition-all ${
                        modalMode === m.id ? 'text-[#4ade80]' : 'text-gray-500'
                      }`}
                    >
                      <m.icon size={22} className={modalMode === m.id ? 'text-[#4ade80]' : 'text-gray-500'} />
                      <span className="text-xs font-bold">{m.label}</span>
                    </button>
                  ))}
                </div>

                {modalMode === 'camera' ? (
                  <div className="text-center py-6">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      id="camera-direct-input"
                      className="hidden"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="gallery-file-input"
                      className="hidden"
                    />
                    <div 
                      onClick={() => !isProcessing && document.getElementById('camera-direct-input')?.click()}
                      className="w-full max-w-[240px] aspect-[3/4] mx-auto bg-[#111827] border-2 border-dashed border-[#4ade80]/40 rounded-3xl flex flex-col items-center justify-center gap-4 mb-6 relative overflow-hidden cursor-pointer"
                    >
                      {isProcessing && (
                        <motion.div
                          animate={{ y: ['0px', '320px', '0px'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                          className="absolute left-0 right-0 h-1 bg-[#4ade80] shadow-[0_0_12px_#4ade80] z-10"
                        />
                      )}
                      <div className="absolute inset-0 bg-[#4ade80]/5" />
                      <Camera size={48} className="text-[#4ade80]/60" />
                      <p className="text-gray-400 text-sm px-4">
                        {isProcessing ? 'جاري قراءة الفاتورة بالذكاء الاصطناعي...' : 'اضغط لفتح الكاميرا والتقاط الفاتورة'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => document.getElementById('camera-direct-input')?.click()}
                        disabled={isProcessing}
                        className="flex-1 py-4 rounded-2xl bg-[#4ade80] text-[#070a10] font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md hover:bg-[#4ade80]/90 transition-all"
                      >
                        <Camera size={16} />
                        التقاط بالكاميرا
                      </button>
                      <button 
                        onClick={() => document.getElementById('gallery-file-input')?.click()}
                        disabled={isProcessing}
                        className="flex-1 py-4 rounded-2xl bg-[#1f2937] text-white border border-[#374151] font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md hover:bg-[#2e3b4e] transition-all"
                      >
                        <PlusCircle size={16} className="text-[#4ade80]" />
                        رفع من المعرض
                      </button>
                    </div>
                    <p className="text-gray-500 text-xs mt-4 flex items-center justify-center gap-1">
                      <Sparkles size={12} /> مدعوم بـ Gemini AI
                    </p>
                  </div>
                ) : modalMode === 'voice' ? (
                  <div className="text-center py-10">
                    <motion.div
                      animate={{ scale: isListening ? [1, 1.15, 1] : 1 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      onClick={() => isListening ? stopVoiceListening() : startVoiceListening()}
                      className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg cursor-pointer transition-all ${
                        isListening 
                          ? 'bg-red-500/20 border border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse' 
                          : 'bg-[#0ea5e9]/20 border border-[#0ea5e9]/40 shadow-[0_0_30px_rgba(14,165,233,0.3)]'
                      }`}
                    >
                      <Mic size={40} className={isListening ? 'text-red-500' : 'text-[#0ea5e9]'} />
                    </motion.div>
                    
                    <p className="text-white font-bold text-lg mb-2">
                      {isProcessing ? 'جاري تحليل كلامك...' : isListening ? 'جاري الاستماع... تحدّث الآن' : 'اضغط على الميكروفون للتحدث'}
                    </p>
                    
                    {voiceText ? (
                      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 mb-4 mx-auto max-w-[320px] text-right">
                        <span className="text-gray-500 text-xs block mb-1">النص المكتشف:</span>
                        <p className="text-white text-sm font-medium">{voiceText}</p>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm mb-6">مثال: "صرفت 50 جنيه مواصلات اليوم"</p>
                    )}

                    {isListening && (
                      <div className="flex justify-center gap-1.5 mb-6">
                        {[3, 5, 8, 12, 8, 5, 10, 6, 9, 4, 7].map((h, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [h * 2, h * 4, h * 2] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                            className="w-1.5 bg-[#0ea5e9] rounded-full"
                            style={{ height: h * 2 }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-[#1f2937] max-w-[320px] mx-auto">
                      <p className="text-gray-400 text-xs text-right mb-2 font-medium">أو اكتب جملة المعاملة هنا:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={manualVoiceInput}
                          onChange={e => setManualVoiceInput(e.target.value)}
                          placeholder="مثال: صرفت 100 جنيه في السوبرماركت"
                          className="flex-1 bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white text-right text-xs placeholder-gray-600 focus:outline-none focus:border-[#0ea5e9]/50"
                        />
                        <button
                          onClick={() => manualVoiceInput.trim() && handleVoiceAnalysis(manualVoiceInput)}
                          disabled={isProcessing || !manualVoiceInput.trim()}
                          className="px-4 bg-[#0ea5e9] text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all hover:bg-[#0ea5e9]/80"
                        >
                          تحليل
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-500 text-xs mt-6 flex items-center justify-center gap-1">
                      <Sparkles size={12} /> مدعوم بـ Gemini AI
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 bg-[#111827] rounded-xl p-1 mb-6">
                      <button
                        onClick={() => { setTxType('expense'); setSelectedCategory(null); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${txType === 'expense' ? 'bg-[#374151] text-white' : 'text-gray-500'}`}
                      >
                        مصروف
                      </button>
                      <button
                        onClick={() => { setTxType('income'); setSelectedCategory(null); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${txType === 'income' ? 'bg-[#374151] text-white' : 'text-gray-500'}`}
                      >
                        دخل
                      </button>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-400 text-xs mb-2 text-right font-medium">المبلغ</p>
                      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 flex items-center justify-between focus-within:border-[#4ade80]/50 transition-colors">
                        <span className="text-gray-400 font-medium">{sym}</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="bg-transparent text-white text-3xl font-bold text-right focus:outline-none w-full"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-400 text-xs mb-3 text-right font-medium">التصنيف</p>
                      <div className="grid grid-cols-4 gap-3">
                        {categories.map(cat => {
                          const Icon = iconMap[cat.icon] || MoreHorizontal;
                          const isSelected = selectedCategory === cat.name;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => { setSelectedCategory(cat.name); if (!description) setDescription(cat.name); }}
                              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border ${
                                isSelected
                                  ? 'border-[#4ade80] bg-[#4ade80]/10'
                                  : 'border-[#1f2937] bg-[#111827] hover:bg-[#1f2937]'
                              }`}
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: isSelected ? cat.color : cat.color + '20' }}
                              >
                                <Icon size={20} style={{ color: isSelected ? '#000' : cat.color }} />
                              </div>
                              <span className={`text-[10px] font-bold truncate w-full text-center ${isSelected ? 'text-[#4ade80]' : 'text-gray-400'}`}>
                                {cat.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className="text-gray-400 text-xs mb-2 text-right font-medium">ملاحظة (اختياري)</p>
                      <input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="مثال: غداء مع الأصدقاء"
                        className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-3.5 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40"
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!amount || !selectedCategory}
                      className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                        amount && selectedCategory
                          ? 'bg-[#4ade80] text-[#070a10] shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                          : 'bg-[#1f2937] text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      حفظ المعاملة
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
