import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, ChevronLeft, Loader2, AlertCircle, Lock,
  Smartphone, Eye, EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

// ── Theme constants ────────────────────────────────────────────────────────────
const ACCENT  = '#00adb5';
const BG_DEEP = '#07100f';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BORDER  = '#1e3035';

type Step = 'welcome' | 'auth' | 'country' | 'payday';

const countries = [
  { name: 'مصر', flag: '🇪🇬', currency: 'EGP', symbol: 'ج.م' },
  { name: 'السعودية', flag: '🇸🇦', currency: 'SAR', symbol: 'ر.س' },
  { name: 'الإمارات', flag: '🇦🇪', currency: 'AED', symbol: 'د.إ' },
  { name: 'الكويت', flag: '🇰🇼', currency: 'KWD', symbol: 'د.ك' },
  { name: 'قطر', flag: '🇶🇦', currency: 'QAR', symbol: 'ر.ق' },
  { name: 'المغرب', flag: '🇲🇦', currency: 'MAD', symbol: 'د.م' },
  { name: 'الأردن', flag: '🇯🇴', currency: 'JOD', symbol: 'د.أ' },
  { name: 'المملكة المتحدة', flag: '🇬🇧', currency: 'GBP', symbol: '£' },
  { name: 'الولايات المتحدة', flag: '🇺🇸', currency: 'USD', symbol: '$' },
];

export function OnboardingScreen() {
  const { setUser } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [authAction, setAuthAction] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [payday, setPayday] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getFinalEmail = () =>
    authMode === 'email' ? email.trim() : `${phone.replace(/[^0-9]/g, '')}@hasboba.app`;

  const handleAuth = async () => {
    const finalEmail = getFinalEmail();
    if (!finalEmail || !password) return;
    setLoading(true);
    setError('');
    try {
      if (authAction === 'signup') {
        if (!name) { setError('من فضلك ادخل اسمك'); setLoading(false); return; }
        const { error: signUpError } = await supabase.auth.signUp({
          email: finalEmail,
          password,
          options: {
            data: {
              name,
              country: selectedCountry.name,
              currency: selectedCountry.currency,
              currency_symbol: selectedCountry.symbol,
              payday,
            }
          }
        });
        if (signUpError) throw signUpError;
        setStep('country');
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password,
        });
        if (loginError) throw loginError;
      }
    } catch (err: any) {
      let msg = err.message || 'حدث خطأ';
      if (msg.includes('Invalid login credentials')) msg = 'بيانات الدخول غير صحيحة';
      if (msg.includes('User already registered')) msg = 'البريد الإلكتروني مسجل بالفعل';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOnboarding = async () => {
    const finalEmail = getFinalEmail();
    if (!finalEmail || !password) return;
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        const isFirstUser = count === 0;

        await supabase.from('profiles').upsert({
          id: authUser.id,
          name,
          email: finalEmail,
          country: selectedCountry.name,
          currency: selectedCountry.currency,
          currency_symbol: selectedCountry.symbol,
          payday,
          is_admin: isFirstUser,
          plan: isFirstUser ? 'pro' : 'free',
        });
        setUser({
          id: authUser.id,
          name,
          email: finalEmail,
          phone: authMode === 'phone' ? phone : '',
          country: selectedCountry.name,
          currency: selectedCountry.currency,
          currencySymbol: selectedCountry.symbol,
          payday,
          theme: 'dark',
          isAdmin: isFirstUser,
          plan: isFirstUser ? 'pro' : 'free',
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: BG_DEEP }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm flex flex-col items-center">
          
          <div className="relative mb-8">
            <div className="w-52 h-52 rounded-full relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border" style={{ borderColor: `rgba(0,173,181,0.1)` }} />
              <div className="absolute inset-3 rounded-full border" style={{ borderColor: `rgba(0,173,181,0.15)` }} />
              <div className="absolute inset-7 rounded-full border" style={{ borderColor: `rgba(0,173,181,0.2)` }} />
              
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 40% 40%, #008891, #003a3f)',
                  boxShadow: `0 0 60px rgba(0,173,181,0.25), inset 0 0 30px rgba(0,173,181,0.1)`,
                }}
              >
                <div className="flex items-end gap-1">
                  {[20, 35, 25, 40, 30].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: h }} transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                      className="w-2 rounded-sm" style={{ background: ACCENT, opacity: 0.6 + i * 0.08 }} />
                  ))}
                </div>
              </div>
              
              {[
                { top: '10%', left: '20%', size: 6, delay: 0 },
                { top: '70%', left: '15%', size: 4, delay: 0.3 },
                { top: '20%', right: '15%', size: 5, delay: 0.6 },
                { bottom: '15%', right: '25%', size: 7, delay: 0.9 },
              ].map((dot, i) => (
                <motion.div key={i} animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 + i * 0.5, delay: dot.delay }}
                  className="absolute rounded-full" style={{ background: ACCENT, width: dot.size, height: dot.size, ...dot }} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `rgba(0,173,181,0.15)`, border: `1px solid rgba(0,173,181,0.3)` }}>
              <span className="font-black text-sm" style={{ color: ACCENT }}>ح</span>
            </div>
            <span className="text-white font-black text-2xl">حسبوبة</span>
          </div>
          <p className="text-xs text-center mb-10" style={{ color: '#4a7a80' }}>
            مساعدك المالي الذكي بالذكاء الاصطناعي
          </p>

          <p className="text-white text-base text-center font-bold mb-1">تحكم في أموالك</p>
          <p className="text-sm text-center mb-8" style={{ color: '#6a9ca2' }}>وابنِ مستقبلاً أفضل</p>

          <div className="w-full flex flex-col gap-3 mb-6">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setAuthAction('signup'); setStep('auth'); }}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`, color: 'white', boxShadow: `0 4px 20px rgba(0,173,181,0.3)` }}>
              <Smartphone size={20} /> إنشاء حساب جديد
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setAuthAction('login'); setStep('auth'); }}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
              style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }}>
              <Mail size={20} /> تسجيل الدخول
            </motion.button>
          </div>

          <p className="text-[10px] text-center" style={{ color: '#4a7a80' }}>
            بالمتابعة، أنت توافق على <span style={{ color: ACCENT }}>الشروط والأحكام</span> و <span style={{ color: ACCENT }}>سياسة الخصوصية</span>
          </p>
        </motion.div>
      </div>
    );
  }

  if (step === 'auth') {
    return (
      <div className="min-h-screen flex flex-col p-6" style={{ background: BG_DEEP }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm mx-auto flex flex-col h-full pt-8">
          
          <button onClick={() => setStep('welcome')} className="flex items-center gap-1.5 mb-8 self-end transition-colors" style={{ color: '#6a9ca2' }}>
            <ChevronLeft size={18} /> <span className="text-sm">رجوع</span>
          </button>

          <h2 className="text-white font-black text-2xl text-right mb-1">
            {authAction === 'signup' ? 'إنشاء حساب' : 'أهلاً بعودتك!'}
          </h2>
          <p className="text-sm text-right mb-6" style={{ color: '#6a9ca2' }}>
            {authAction === 'signup' ? 'أنشئ حسابك وابدأ رحلتك المالية' : 'سجل دخولك للوصول لحسابك'}
          </p>

          <div className="flex gap-2 rounded-2xl p-1 mb-5" style={{ background: BG_CARD }}>
            {[
              { id: 'phone', label: 'رقم الهاتف', icon: Smartphone },
              { id: 'email', label: 'بريد إلكتروني', icon: Mail },
            ].map(m => (
              <button key={m.id} onClick={() => setAuthMode(m.id as 'phone' | 'email')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: authMode === m.id ? ACCENT : 'transparent',
                  color: authMode === m.id ? 'white' : '#4a7a80',
                  boxShadow: authMode === m.id ? `0 0 12px rgba(0,173,181,0.3)` : 'none'
                }}>
                <m.icon size={15} /> {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {authAction === 'signup' && (
              <div>
                <p className="text-xs mb-1.5 text-right" style={{ color: '#6a9ca2' }}>الاسم الكامل</p>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="مثل: أحمد محمد"
                  className="w-full rounded-2xl py-3.5 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                  style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
              </div>
            )}

            <div>
              <p className="text-xs mb-1.5 text-right" style={{ color: '#6a9ca2' }}>
                {authMode === 'phone' ? 'رقم الهاتف' : 'البريد الإلكتروني'}
              </p>
              {authMode === 'phone' ? (
                <div className="flex gap-2">
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01xxxxxxxxx" type="tel"
                    className="flex-1 rounded-2xl py-3.5 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                    style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                  <div className="rounded-2xl px-3 flex items-center gap-1.5" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                    <span className="text-xs" style={{ color: '#4a7a80' }}>+20</span>
                    <span className="text-base">🇪🇬</span>
                  </div>
                </div>
              ) : (
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" type="email"
                  className="w-full rounded-2xl py-3.5 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                  style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
              )}
            </div>

            <div>
              <p className="text-xs mb-1.5 text-right" style={{ color: '#6a9ca2' }}>كلمة المرور</p>
              <div className="relative">
                <button onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff size={16} style={{ color: '#4a7a80' }} /> : <Eye size={16} style={{ color: '#4a7a80' }} />}
                </button>
                <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#4a7a80' }} />
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full rounded-2xl py-3.5 pr-10 pl-10 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                  style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
              </div>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl p-3 mt-3"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
              <p className="text-sm flex-1 text-right" style={{ color: '#f43f5e' }}>{error}</p>
              <AlertCircle size={16} style={{ color: '#f43f5e' }} className="shrink-0" />
            </motion.div>
          )}

          <div className="mt-auto pt-6">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAuth} disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`, color: 'white', boxShadow: `0 4px 20px rgba(0,173,181,0.3)` }}>
              {loading && <Loader2 size={20} className="animate-spin" />}
              {loading ? 'جاري المعالجة...' : authAction === 'signup' ? 'التالي' : 'تسجيل الدخول'}
            </motion.button>

            <button onClick={() => setAuthAction(authAction === 'signup' ? 'login' : 'signup')} className="w-full mt-4 text-sm text-center" style={{ color: '#6a9ca2' }}>
              {authAction === 'signup' ? 'لديك حساب بالفعل؟ ' : 'ليس لديك حساب؟ '}
              <span className="font-bold" style={{ color: ACCENT }}>{authAction === 'signup' ? 'تسجيل الدخول' : 'إنشاء حساب'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'country') {
    return (
      <div className="min-h-screen flex flex-col p-6" style={{ background: BG_DEEP }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm mx-auto flex flex-col h-full pt-8">
          <button onClick={() => setStep('auth')} className="flex items-center gap-1.5 mb-8 self-end" style={{ color: '#6a9ca2' }}>
            <ChevronLeft size={18} /> <span className="text-sm">رجوع</span>
          </button>

          <h2 className="text-white font-black text-2xl text-right mb-1">اختر دولتك</h2>
          <p className="text-sm text-right mb-6" style={{ color: '#6a9ca2' }}>سيتم ضبط العملة تلقائياً</p>

          <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide">
            {countries.map(country => (
              <button key={country.currency} onClick={() => setSelectedCountry(country)}
                className="flex items-center justify-between p-4 rounded-2xl transition-all"
                style={{
                  background: selectedCountry.currency === country.currency ? `rgba(0,173,181,0.15)` : BG_CARD,
                  border: `1px solid ${selectedCountry.currency === country.currency ? ACCENT : BORDER}`
                }}>
                <div className="flex items-center gap-2">
                  {selectedCountry.currency === country.currency && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: ACCENT }}>
                      <span className="text-white text-xs font-black">✓</span>
                    </div>
                  )}
                  <span className={`text-sm font-medium ${selectedCountry.currency === country.currency ? 'text-white' : 'text-[#4a7a80]'}`}>
                    {country.currency} · {country.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{country.name}</span>
                  <span className="text-xl">{country.flag}</span>
                </div>
              </button>
            ))}
          </div>

          <button onClick={() => setStep('payday')}
            className="w-full mt-4 py-4 rounded-2xl font-bold text-base transition-all"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`, color: 'white', boxShadow: `0 4px 20px rgba(0,173,181,0.3)` }}>
            التالي
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6" style={{ background: BG_DEEP }}>
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm mx-auto flex flex-col pt-8">
        <button onClick={() => setStep('country')} className="flex items-center gap-1.5 mb-8 self-end" style={{ color: '#6a9ca2' }}>
          <ChevronLeft size={18} /> <span className="text-sm">رجوع</span>
        </button>

        <h2 className="text-white font-black text-2xl text-right mb-1">اختر يوم راتبك</h2>
        <p className="text-sm text-right mb-2" style={{ color: '#6a9ca2' }}>ده اليوم اللي بيجيلك فيه راتبك كل شهر</p>
        <p className="text-xs text-right mb-6" style={{ color: '#4a7a80' }}>هيساعدنا نعمل لك ميزانية شهرية دقيقة ✨</p>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
            <motion.button key={day} whileTap={{ scale: 0.9 }} onClick={() => setPayday(day)}
              className="aspect-square rounded-2xl text-sm font-bold transition-all"
              style={{
                background: payday === day ? ACCENT : BG_CARD,
                color: payday === day ? 'white' : '#4a7a80',
                border: `1px solid ${payday === day ? ACCENT : BORDER}`,
                boxShadow: payday === day ? `0 0 15px rgba(0,173,181,0.4)` : 'none'
              }}>
              {day}
            </motion.button>
          ))}
        </div>

        <div className="rounded-2xl p-4 mb-6 text-center" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-sm" style={{ color: '#6a9ca2' }}>يوم الراتب المختار</p>
          <p className="font-black text-3xl mt-1" style={{ color: ACCENT }}>{payday}</p>
          <p className="text-sm" style={{ color: '#4a7a80' }}>من كل شهر</p>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleFinishOnboarding} disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`, color: 'white', boxShadow: `0 4px 20px rgba(0,173,181,0.3)` }}>
          {loading && <Loader2 size={20} className="animate-spin" />}
          {loading ? 'جاري الإعداد...' : 'ابدأ رحلتك المالية 🚀'}
        </motion.button>
      </motion.div>
    </div>
  );
}
