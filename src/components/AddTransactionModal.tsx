import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useSms } from '../hooks/useSms';
import { X, Camera, Mic, PenLine, Sparkles, PlusCircle, ArrowUpRight, ArrowDownLeft, RefreshCw, MoreHorizontal, Utensils, Car, Gamepad2, ShoppingBag, HeartPulse, Receipt, GraduationCap, Gift, Home, User, Briefcase, Laptop, BarChart2, MessageSquare } from 'lucide-react';
import { parseReceiptImage, parseVoiceCommand } from '../lib/gemini';

// ── Constants ─────────────────────────────────────────────────────────────────
const ACCENT       = '#00adb5';
const ACCENT_GLOW  = 'rgba(0,173,181,0.35)';
const BG_CARD      = '#132226';
const BORDER       = '#1e3035';
const BG_DEEP      = '#0b1315';
const BG_MODAL     = '#0f1d20';

const iconMap: Record<string, React.ElementType> = {
  utensils: Utensils, car: Car, 'gamepad-2': Gamepad2,
  'shopping-bag': ShoppingBag, 'heart-pulse': HeartPulse, receipt: Receipt,
  'graduation-cap': GraduationCap, gift: Gift, home: Home, user: User,
  briefcase: Briefcase, laptop: Laptop, 'bar-chart-2': BarChart2,
  sparkles: Sparkles, 'more-horizontal': MoreHorizontal,
};

const expenseCategories = [
  { id: '1',  name: 'طعام',     icon: 'utensils',        color: '#f97316' },
  { id: '2',  name: 'مواصلات', icon: 'car',             color: '#3b82f6' },
  { id: '3',  name: 'تسوق',    icon: 'shopping-bag',    color: '#ec4899' },
  { id: '4',  name: 'فواتير',  icon: 'receipt',         color: '#eab308' },
  { id: '5',  name: 'ترفيه',   icon: 'gamepad-2',       color: '#a855f7' },
  { id: '6',  name: 'صحة',     icon: 'heart-pulse',     color: '#ef4444' },
  { id: '7',  name: 'تعليم',   icon: 'graduation-cap',  color: '#6366f1' },
  { id: '8',  name: 'هدايا',   icon: 'gift',            color: '#f43f5e' },
  { id: '9',  name: 'سكن',     icon: 'home',            color: '#14b8a6' },
  { id: '10', name: 'شخصي',    icon: 'user',            color: '#6b7280' },
  { id: '11', name: 'استثمار', icon: 'bar-chart-2',     color: ACCENT },
  { id: '12', name: 'أخرى',   icon: 'more-horizontal',  color: '#64748b' },
];

const incomeCategories = [
  { id: '1', name: 'راتب',     icon: 'briefcase',        color: '#10b981' },
  { id: '2', name: 'عمل حر',  icon: 'laptop',           color: '#3b82f6' },
  { id: '3', name: 'هدية',    icon: 'gift',             color: '#ec4899' },
  { id: '4', name: 'مكافأة',  icon: 'sparkles',         color: '#eab308' },
  { id: '5', name: 'استثمار', icon: 'bar-chart-2',      color: '#a855f7' },
  { id: '6', name: 'أخرى',   icon: 'more-horizontal',   color: '#64748b' },
];

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequireUpgrade?: () => void;
}

export function AddTransactionModal({ isOpen, onClose, onRequireUpgrade }: AddTransactionModalProps) {
  const { addTransaction, user } = useApp();
  const { requestPermissions, getRecentBankSms } = useSms();
  const [modalMode, setModalMode] = useState<'manual' | 'camera' | 'voice' | 'sms'>('manual');
  const [txType, setTxType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [manualVoiceInput, setManualVoiceInput] = useState('');
  const [smsList, setSmsList] = useState<any[]>([]);
  const recognitionRef = useRef<any>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setModalMode('manual');
      setTxType('expense');
      setAmount('');
      setDescription('');
      setSelectedCategory(null);
      setSmsList([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modalMode === 'voice') startVoiceListening();
    else stopVoiceListening();
    return () => stopVoiceListening();
  }, [isOpen, modalMode]);

  const handleSmsScan = async () => {
    setIsProcessing(true);
    try {
      const msgs = await getRecentBankSms(10);
      setSmsList(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (modalMode === 'sms' && smsList.length === 0 && !isProcessing) {
      handleSmsScan();
    }
  }, [modalMode]);

  const startVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    setVoiceText('');
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'ar-EG';
    rec.onstart = () => setIsListening(true);
    rec.onerror = () => setIsListening(false);
    rec.onend   = () => setIsListening(false);
    rec.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) { setVoiceText(transcript); handleVoiceAnalysis(transcript); }
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const stopVoiceListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
  };

  const handleVoiceAnalysis = async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await parseVoiceCommand(text);
      if (result) {
        setTxType(result.type || 'expense');
        setAmount(String(result.amount));
        setDescription(result.description);
        setSelectedCategory(result.category);
        setModalMode('manual');
      } else {
        alert('تعذر تحليل الأمر الصوتي.');
      }
    } catch (err: any) {
      alert('خطأ: ' + (err?.message || err));
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
          const result = await parseReceiptImage(base64Data, file.type);
          if (result) {
            setTxType(result.type || 'expense');
            setAmount(String(result.amount));
            setDescription(result.description);
            setSelectedCategory(result.category);
            setModalMode('manual');
          } else {
            alert('تعذر قراءة الفاتورة.');
          }
        } catch (err: any) {
          alert('خطأ AI: ' + (err?.message || err));
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (!amount || !selectedCategory) return;
    addTransaction({
      type: txType === 'transfer' ? 'expense' : txType,
      amount: parseFloat(amount),
      category: selectedCategory,
      description: description || selectedCategory,
      date: new Date().toISOString().split('T')[0],
      icon: txType === 'expense' 
            ? expenseCategories.find(c => c.name === selectedCategory)?.icon 
            : incomeCategories.find(c => c.name === selectedCategory)?.icon,
    });
    setAmount(''); setDescription(''); setSelectedCategory(null);
    onClose();
  };

  const sym = user?.currency || 'EGP';
  const categories = txType === 'expense' ? expenseCategories : incomeCategories;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100]"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[100] max-h-[92vh] overflow-y-auto scrollbar-hide rounded-t-[28px]"
            style={{ background: BG_MODAL, borderTop: `1px solid ${BORDER}` }}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full" style={{ background: '#243a3f' }} />
            </div>

            <div className="px-5 pb-8">
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#162a2f' }}
                >
                  <X size={18} style={{ color: '#6a9ca2' }} />
                </button>
                <h3 className="text-white font-bold text-lg">
                  {txType === 'expense' ? 'إضافة مصروف' : txType === 'income' ? 'إضافة دخل' : 'تحويل'}
                </h3>
                <div className="w-9" />
              </div>

              {/* Type tabs (expense / income / transfer) */}
              <div
                className="flex gap-1.5 rounded-2xl p-1.5 mb-6"
                style={{ background: '#0b1315' }}
              >
                {([
                  { id: 'expense',  label: 'مصروف', icon: ArrowUpRight },
                  { id: 'income',   label: 'دخل',   icon: ArrowDownLeft },
                  { id: 'transfer', label: 'تحويل', icon: RefreshCw },
                ] as const).map(t => {
                  const Ico = t.icon;
                  const isActive = txType === t.id;
                  const activeColor = t.id === 'expense' ? '#f43f5e' : t.id === 'income' ? '#10b981' : ACCENT;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setTxType(t.id); setSelectedCategory(null); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: isActive ? (activeColor + '20') : 'transparent',
                        color: isActive ? activeColor : '#4a7a80',
                        border: isActive ? `1px solid ${activeColor}40` : '1px solid transparent',
                      }}
                    >
                      <Ico size={15} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* AI input mode pills */}
              <div className="flex gap-2 mb-5">
                {[
                  { id: 'manual', label: 'يدوي',      icon: PenLine  },
                  { id: 'sms',    label: 'رسائل البنك',icon: MessageSquare },
                  { id: 'voice',  label: 'صوتي (AI)', icon: Mic      },
                  { id: 'camera', label: 'كاميرا (AI)',icon: Camera   },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      if ((m.id === 'voice' || m.id === 'camera' || m.id === 'sms') && user?.plan !== 'pro') {
                        onClose();
                        if (onRequireUpgrade) onRequireUpgrade();
                      } else {
                        setModalMode(m.id as typeof modalMode);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: modalMode === m.id ? BG_CARD : 'transparent',
                      color: modalMode === m.id ? ACCENT : '#4a7a80',
                      border: `1px solid ${modalMode === m.id ? BORDER : 'transparent'}`,
                    }}
                  >
                    <m.icon size={14} />
                    {m.label}
                  </button>
                ))}
              </div>

              {/* ── SMS mode ── */}
              {modalMode === 'sms' && (
                <div className="text-center py-4">
                  {isProcessing ? (
                    <div className="py-10 flex flex-col items-center justify-center gap-3">
                      <RefreshCw size={24} className="animate-spin" style={{ color: ACCENT }} />
                      <p className="text-sm font-bold text-white">جاري قراءة الرسائل البنكية...</p>
                    </div>
                  ) : smsList.length === 0 ? (
                    <div className="py-10 text-center">
                      <MessageSquare size={40} style={{ color: '#2d4a50' }} className="mx-auto mb-3" />
                      <p className="text-sm font-bold text-[#6a9ca2]">لم يتم العثور على رسائل بنكية حديثة</p>
                      <button onClick={handleSmsScan} className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#162a2f] text-white">
                        إعادة الفحص
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-hide text-right">
                      <div className="flex items-center justify-between mb-2">
                        <button onClick={handleSmsScan} className="text-xs font-bold text-[#00adb5] flex items-center gap-1">
                          <RefreshCw size={12} /> تحديث
                        </button>
                        <p className="text-xs font-bold text-[#6a9ca2]">الرسائل البنكية الحديثة</p>
                      </div>
                      {smsList.map((sms, i) => (
                        <div key={i} onClick={() => {
                          setTxType('expense');
                          setDescription(sms.body);
                          setModalMode('manual');
                        }} className="p-3 rounded-2xl cursor-pointer" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-[#4a7a80]">{new Date(sms.date).toLocaleDateString('ar-EG')}</span>
                            <span className="text-xs font-bold text-white">{sms.address}</span>
                          </div>
                          <p className="text-xs text-[#a0b8bc] line-clamp-2 leading-relaxed">{sms.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Camera mode ── */}
              {modalMode === 'camera' && (
                <div className="text-center py-4">
                  <input type="file" accept="image/*" capture="environment"
                    onChange={handleImageUpload} id="cam-input" className="hidden" />
                  <input type="file" accept="image/*"
                    onChange={handleImageUpload} id="gal-input" className="hidden" />
                  <div
                    onClick={() => !isProcessing && document.getElementById('cam-input')?.click()}
                    className="w-full aspect-[4/3] mx-auto rounded-3xl flex flex-col items-center justify-center gap-4 mb-5 cursor-pointer relative overflow-hidden"
                    style={{ background: BG_CARD, border: `2px dashed ${ACCENT}30` }}
                  >
                    {isProcessing && (
                      <motion.div
                        animate={{ y: ['0%', '100%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute left-0 right-0 h-0.5 top-0"
                        style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }}
                      />
                    )}
                    <Camera size={40} style={{ color: ACCENT + '80' }} />
                    <p className="text-sm px-4" style={{ color: '#4a7a80' }}>
                      {isProcessing ? 'جاري قراءة الفاتورة...' : 'اضغط لالتقاط الفاتورة'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => document.getElementById('cam-input')?.click()} disabled={isProcessing}
                      className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: ACCENT, color: 'white' }}>
                      <Camera size={16} /> الكاميرا
                    </button>
                    <button onClick={() => document.getElementById('gal-input')?.click()} disabled={isProcessing}
                      className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: BG_CARD, color: 'white', border: `1px solid ${BORDER}` }}>
                      <PlusCircle size={16} style={{ color: ACCENT }} /> المعرض
                    </button>
                  </div>
                  <p className="text-xs mt-3 flex items-center justify-center gap-1" style={{ color: '#3a6068' }}>
                    <Sparkles size={11} /> مدعوم بـ Gemini AI
                  </p>
                </div>
              )}

              {/* ── Voice mode ── */}
              {modalMode === 'voice' && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ scale: isListening ? [1, 1.12, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    onClick={() => isListening ? stopVoiceListening() : startVoiceListening()}
                    className="w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 cursor-pointer"
                    style={{
                      background: isListening ? 'rgba(244,63,94,0.1)' : `rgba(0,173,181,0.1)`,
                      border: `2px solid ${isListening ? '#f43f5e' : ACCENT}60`,
                      boxShadow: `0 0 30px ${isListening ? 'rgba(244,63,94,0.3)' : ACCENT_GLOW}`,
                    }}
                  >
                    <Mic size={40} style={{ color: isListening ? '#f43f5e' : ACCENT }} />
                  </motion.div>
                  <p className="text-white font-bold text-base mb-1">
                    {isProcessing ? 'جاري تحليل كلامك...' : isListening ? 'تحدّث الآن...' : 'اضغط على الميكروفون'}
                  </p>
                  {voiceText && (
                    <div className="rounded-2xl p-3 mb-4 mx-auto max-w-xs text-right"
                      style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                      <p className="text-white text-sm">{voiceText}</p>
                    </div>
                  )}
                  {isListening && (
                    <div className="flex justify-center gap-1 mb-4">
                      {[4, 7, 12, 9, 14, 8, 11, 6].map((h, i) => (
                        <motion.div key={i}
                          animate={{ height: [h * 2, h * 3.5, h * 2] }}
                          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.1 }}
                          className="w-1.5 rounded-full" style={{ height: h * 2, background: ACCENT }} />
                      ))}
                    </div>
                  )}
                  <div className="border-t pt-4 mt-4" style={{ borderColor: BORDER }}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => manualVoiceInput.trim() && handleVoiceAnalysis(manualVoiceInput)}
                        disabled={isProcessing || !manualVoiceInput.trim()}
                        className="px-4 rounded-xl text-xs font-bold disabled:opacity-50"
                        style={{ background: ACCENT, color: 'white' }}>
                        تحليل
                      </button>
                      <input
                        value={manualVoiceInput}
                        onChange={e => setManualVoiceInput(e.target.value)}
                        placeholder="أو اكتب هنا..."
                        className="flex-1 rounded-xl px-3 py-2 text-sm text-right placeholder-[#3a6068] outline-none"
                        style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Manual mode ── */}
              {modalMode === 'manual' && (
                <>
                  {/* Big amount input */}
                  <div className="mb-5">
                    <div
                      className="rounded-2xl p-4 flex items-center gap-3"
                      style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}
                    >
                      <span className="text-sm font-bold px-2.5 py-1 rounded-lg" style={{ background: BG_DEEP, color: ACCENT }}>
                        {sym}
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-transparent text-white font-black text-right focus:outline-none flex-1"
                        style={{ fontSize: 32, lineHeight: 1 }}
                      />
                    </div>
                  </div>

                  {/* Grouped options card */}
                  <div className="rounded-2xl overflow-hidden mb-5" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                    {/* Category */}
                    <div className="p-4 border-b" style={{ borderColor: BORDER }}>
                      <p className="text-xs font-medium mb-3 text-right" style={{ color: '#6a9ca2' }}>التصنيف</p>
                      <div className="grid grid-cols-4 gap-2">
                        {categories.map(cat => {
                          const Icon = iconMap[cat.icon] || MoreHorizontal;
                          const isSel = selectedCategory === cat.name;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => { setSelectedCategory(cat.name); if (!description) setDescription(cat.name); }}
                              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all"
                              style={{
                                background: isSel ? cat.color + '18' : BG_DEEP,
                                border: `1.5px solid ${isSel ? cat.color : BORDER}`,
                              }}
                            >
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: isSel ? cat.color : cat.color + '18' }}>
                                <Icon size={18} style={{ color: isSel ? '#fff' : cat.color }} />
                              </div>
                              <span className="text-[9px] font-bold truncate w-full text-center"
                                style={{ color: isSel ? cat.color : '#4a7a80' }}>
                                {cat.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Note */}
                    <div className="p-4">
                      <input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="أضف ملاحظة... (اختياري)"
                        className="w-full bg-transparent text-sm text-right focus:outline-none placeholder-[#3a6068]"
                        style={{ color: 'white' }}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={!amount || !selectedCategory}
                    className="w-full py-4 rounded-2xl font-bold text-base transition-all"
                    style={{
                      background: amount && selectedCategory
                        ? `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`
                        : BG_CARD,
                      color: amount && selectedCategory ? 'white' : '#3a6068',
                      boxShadow: amount && selectedCategory ? `0 4px 20px ${ACCENT_GLOW}` : 'none',
                    }}
                  >
                    {txType === 'expense' ? 'إضافة المصروف' : txType === 'income' ? 'إضافة الدخل' : 'تأكيد التحويل'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
