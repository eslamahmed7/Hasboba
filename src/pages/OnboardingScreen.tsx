import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, ChevronLeft, Loader2, AlertCircle, Lock,
  Smartphone, Eye, EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

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
        // Trigger next step for country selection
        setStep('country');
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password,
        });
        if (loginError) throw loginError;
        // AppContext onAuthStateChange will handle the rest
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
      // Save additional data
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        // Check if any profiles exist
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

  // Welcome screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-[#070a10] flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col items-center"
        >
          {/* Globe illustration */}
          <div className="relative mb-8">
            <div className="w-52 h-52 rounded-full relative flex items-center justify-center">
              {/* Outer glow rings */}
              <div className="absolute inset-0 rounded-full border border-[#4ade80]/10" />
              <div className="absolute inset-3 rounded-full border border-[#4ade80]/15" />
              <div className="absolute inset-7 rounded-full border border-[#4ade80]/20" />
              {/* Core */}
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 40% 40%, #1a4a2e, #0d2218)',
                  boxShadow: '0 0 60px rgba(74,222,128,0.25), inset 0 0 30px rgba(74,222,128,0.1)',
                }}
              >
                {/* Chart bars inside globe */}
                <div className="flex items-end gap-1">
                  {[20, 35, 25, 40, 30].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: h }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                      className="w-2 rounded-sm bg-[#4ade80]"
                      style={{ opacity: 0.6 + i * 0.08 }}
                    />
                  ))}
                </div>
              </div>
              {/* Floating dots */}
              {[
                { top: '10%', left: '20%', size: 6, delay: 0 },
                { top: '70%', left: '15%', size: 4, delay: 0.3 },
                { top: '20%', right: '15%', size: 5, delay: 0.6 },
                { bottom: '15%', right: '25%', size: 7, delay: 0.9 },
              ].map((dot, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 + i * 0.5, delay: dot.delay }}
                  className="absolute rounded-full bg-[#4ade80]"
                  style={{ width: dot.size, height: dot.size, ...dot }}
                />
              ))}
            </div>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#4ade80]/20 border border-[#4ade80]/30 flex items-center justify-center">
              <span className="text-[#4ade80] font-black text-sm">ح</span>
            </div>
            <span className="text-white font-black text-2xl">حسبوبة</span>
          </div>
          <p className="text-gray-400 text-sm text-center mb-10">
            مساعدك المالي الذكي بالذكاء الاصطناعي
          </p>

          {/* CTA text */}
          <p className="text-gray-300 text-base text-center font-medium mb-1">
            تحكم في أموالك
          </p>
          <p className="text-gray-500 text-sm text-center mb-8">
            وابنِ مستقبلاً أفضل
          </p>

          {/* Auth buttons */}
          <div className="w-full flex flex-col gap-3 mb-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { setAuthAction('signup'); setStep('auth'); }}
              className="w-full py-4 rounded-2xl bg-[#4ade80] text-black font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.3)]"
            >
              <Smartphone size={20} />
              إنشاء حساب جديد
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { setAuthAction('login'); setStep('auth'); }}
              className="w-full py-4 rounded-2xl bg-[#111827] border border-[#1f2937] text-white font-bold text-base flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              تسجيل الدخول
            </motion.button>
          </div>

          <p className="text-gray-600 text-xs text-center">
            بالمتابعة، أنت توافق على{' '}
            <span className="text-[#4ade80]">الشروط والأحكام</span>
            {' '}و{' '}
            <span className="text-[#4ade80]">سياسة الخصوصية</span>
          </p>
        </motion.div>
      </div>
    );
  }

  // Auth step
  if (step === 'auth') {
    return (
      <div className="min-h-screen bg-[#070a10] flex flex-col p-6">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm mx-auto flex flex-col h-full pt-8"
        >
          {/* Back button */}
          <button
            onClick={() => setStep('welcome')}
            className="flex items-center gap-1.5 text-gray-400 mb-8 self-end"
          >
            <ChevronLeft size={18} />
            <span className="text-sm">رجوع</span>
          </button>

          <h2 className="text-white font-black text-2xl text-right mb-1">
            {authAction === 'signup' ? 'إنشاء حساب' : 'أهلاً بعودتك!'}
          </h2>
          <p className="text-gray-500 text-sm text-right mb-6">
            {authAction === 'signup' ? 'أنشئ حسابك وابدأ رحلتك المالية' : 'سجل دخولك للوصول لحسابك'}
          </p>

          {/* Auth mode toggle */}
          <div className="flex gap-2 bg-[#111827] rounded-2xl p-1 mb-5">
            {[
              { id: 'phone', label: 'رقم الهاتف', icon: Smartphone },
              { id: 'email', label: 'بريد إلكتروني', icon: Mail },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setAuthMode(m.id as 'phone' | 'email')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  authMode === m.id ? 'bg-[#4ade80] text-black' : 'text-gray-500'
                }`}
              >
                <m.icon size={15} />
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {authAction === 'signup' && (
              <div>
                <p className="text-gray-500 text-xs mb-1.5 text-right">الاسم الكامل</p>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثل: أحمد محمد"
                  className="w-full bg-[#111827] border border-[#1f2937] rounded-2xl py-3.5 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40"
                />
              </div>
            )}

            <div>
              <p className="text-gray-500 text-xs mb-1.5 text-right">
                {authMode === 'phone' ? 'رقم الهاتف' : 'البريد الإلكتروني'}
              </p>
              {authMode === 'phone' ? (
                <div className="flex gap-2">
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    type="tel"
                    className="flex-1 bg-[#111827] border border-[#1f2937] rounded-2xl py-3.5 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40"
                  />
                  <div className="bg-[#111827] border border-[#1f2937] rounded-2xl px-3 flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">+20</span>
                    <span className="text-base">🇪🇬</span>
                  </div>
                </div>
              ) : (
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  type="email"
                  className="w-full bg-[#111827] border border-[#1f2937] rounded-2xl py-3.5 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40"
                />
              )}
            </div>

            <div>
              <p className="text-gray-500 text-xs mb-1.5 text-right">كلمة المرور</p>
              <div className="relative">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} className="text-gray-500" /> : <Eye size={16} className="text-gray-500" />}
                </button>
                <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-[#111827] border border-[#1f2937] rounded-2xl py-3.5 pr-10 pl-10 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40"
                />
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-3"
            >
              <p className="text-red-400 text-sm flex-1 text-right">{error}</p>
              <AlertCircle size={16} className="text-red-400 shrink-0" />
            </motion.div>
          )}

          <div className="mt-auto pt-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAuth}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#4ade80] text-black font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_0_20px_rgba(74,222,128,0.3)]"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : null}
              {loading ? 'جاري المعالجة...' : authAction === 'signup' ? 'التالي' : 'تسجيل الدخول'}
            </motion.button>

            <button
              onClick={() => setAuthAction(authAction === 'signup' ? 'login' : 'signup')}
              className="w-full mt-4 text-gray-400 text-sm text-center"
            >
              {authAction === 'signup'
                ? 'لديك حساب بالفعل؟ '
                : 'ليس لديك حساب؟ '
              }
              <span className="text-[#4ade80] font-bold">
                {authAction === 'signup' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Country step
  if (step === 'country') {
    return (
      <div className="min-h-screen bg-[#070a10] flex flex-col p-6">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm mx-auto flex flex-col h-full pt-8"
        >
          <button onClick={() => setStep('auth')} className="flex items-center gap-1.5 text-gray-400 mb-8 self-end">
            <ChevronLeft size={18} />
            <span className="text-sm">رجوع</span>
          </button>

          <h2 className="text-white font-black text-2xl text-right mb-1">اختر دولتك</h2>
          <p className="text-gray-500 text-sm text-right mb-6">سيتم ضبط العملة تلقائياً</p>

          <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide">
            {countries.map(country => (
              <button
                key={country.currency}
                onClick={() => setSelectedCountry(country)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  selectedCountry.currency === country.currency
                    ? 'bg-[#4ade80]/10 border-[#4ade80]/40'
                    : 'bg-[#111827] border-[#1f2937]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedCountry.currency === country.currency && (
                    <div className="w-5 h-5 rounded-full bg-[#4ade80] flex items-center justify-center">
                      <span className="text-black text-xs font-black">✓</span>
                    </div>
                  )}
                  <span className={`text-sm font-medium ${selectedCountry.currency === country.currency ? 'text-white' : 'text-gray-400'}`}>
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

          <button
            onClick={() => setStep('payday')}
            className="w-full mt-4 py-4 rounded-2xl bg-[#4ade80] text-black font-bold text-base shadow-[0_0_20px_rgba(74,222,128,0.3)]"
          >
            التالي
          </button>
        </motion.div>
      </div>
    );
  }

  // Payday step
  return (
    <div className="min-h-screen bg-[#070a10] flex flex-col p-6">
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-sm mx-auto flex flex-col pt-8"
      >
        <button onClick={() => setStep('country')} className="flex items-center gap-1.5 text-gray-400 mb-8 self-end">
          <ChevronLeft size={18} />
          <span className="text-sm">رجوع</span>
        </button>

        <h2 className="text-white font-black text-2xl text-right mb-1">اختر يوم راتبك</h2>
        <p className="text-gray-400 text-sm text-right mb-2">ده اليوم اللي بيجيلك فيه راتبك كل شهر</p>
        <p className="text-gray-600 text-xs text-right mb-6">هيساعدنا نعمل لك ميزانية شهرية دقيقة ✨</p>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
            <motion.button
              key={day}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPayday(day)}
              className={`aspect-square rounded-2xl text-sm font-bold transition-all ${
                payday === day
                  ? 'bg-[#4ade80] text-black shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                  : 'bg-[#111827] text-gray-400 border border-[#1f2937]'
              }`}
            >
              {day}
            </motion.button>
          ))}
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 mb-6 text-center">
          <p className="text-gray-500 text-sm">يوم الراتب المختار</p>
          <p className="text-[#4ade80] font-black text-3xl mt-1">{payday}</p>
          <p className="text-gray-400 text-sm">من كل شهر</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleFinishOnboarding}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#4ade80] text-black font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.3)]"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : null}
          {loading ? 'جاري الإعداد...' : 'ابدأ رحلتك المالية 🚀'}
        </motion.button>
      </motion.div>
    </div>
  );
}
