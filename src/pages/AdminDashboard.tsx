import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CreditCard, MessageSquare, Shield, CheckCircle2, AlertCircle, Settings, Tag, Bell, Plus, Trash2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export function AdminDashboard() {
  const { user, appConfig, updateAppConfig, addPromoCode, deletePromoCode, addNotification } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pricing State
  const [priceInput, setPriceInput] = useState(appConfig.aiSubscriptionPrice.toString());
  const [discountInput, setDiscountInput] = useState(appConfig.aiSubscriptionDiscountPrice?.toString() || '');
  
  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoDays, setPromoDays] = useState('7');
  const [promoLimitType, setPromoLimitType] = useState<'unlimited' | 'limited'>('unlimited');
  const [promoLimitCount, setPromoLimitCount] = useState('5');
  
  // Notification State
  const [notifMessage, setNotifMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      const mapped = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email || '',
        phone: p.phone || '',
        country: p.country || 'مصر',
        currency: p.currency || 'EGP',
        currencySymbol: p.currency_symbol || 'ج.م',
        payday: p.payday || 1,
        theme: p.theme || 'dark',
        plan: p.plan || 'free',
        isAdmin: p.is_admin || false,
      }));
      setUsers(mapped);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('تعذر جلب بيانات المستخدمين. تأكد من تعطيل RLS في Supabase للجدول profiles مؤقتاً.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (targetId: string, currentStatus: boolean) => {
    try {
      await supabase.from('profiles').update({ is_admin: !currentStatus }).eq('id', targetId);
      setUsers(prev => prev.map(u => u.id === targetId ? { ...u, isAdmin: !currentStatus } : u));
    } catch (err) {
      console.error('Error toggling admin:', err);
    }
  };

  const togglePlan = async (targetId: string, currentPlan: string) => {
    try {
      const newPlan = currentPlan === 'pro' ? 'free' : 'pro';
      await supabase.from('profiles').update({ plan: newPlan }).eq('id', targetId);
      setUsers(prev => prev.map(u => u.id === targetId ? { ...u, plan: newPlan as 'free'|'pro' } : u));
    } catch (err) {
      console.error('Error toggling plan:', err);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Shield size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">غير مصرح لك</h2>
        <p className="text-gray-400">هذه الصفحة مخصصة لمديري النظام فقط.</p>
      </div>
    );
  }

  const proUsers = users.filter(u => u.plan === 'pro').length;
  const currentPrice = appConfig.aiSubscriptionDiscountPrice !== null ? appConfig.aiSubscriptionDiscountPrice : appConfig.aiSubscriptionPrice;
  const estRevenue = proUsers * currentPrice;

  const handleSavePricing = () => {
    const p = parseFloat(priceInput);
    const d = discountInput ? parseFloat(discountInput) : null;
    if (!isNaN(p)) {
      updateAppConfig({ aiSubscriptionPrice: p, aiSubscriptionDiscountPrice: isNaN(d as any) ? null : d });
      alert('تم تحديث التسعير بنجاح');
    }
  };

  const handleAddPromo = () => {
    if (!promoCode || !promoDiscount) return;
    const expires = new Date();
    expires.setDate(expires.getDate() + (parseInt(promoDays) || 7));
    addPromoCode({
      code: promoCode.toUpperCase().trim(),
      discountPercentage: parseFloat(promoDiscount),
      expiresAt: expires.toISOString(),
      isActive: true,
      usageLimit: promoLimitType === 'limited' ? parseInt(promoLimitCount) || 1 : null,
      usageCount: 0,
    });
    setPromoCode('');
    setPromoDiscount('');
    setPromoLimitType('unlimited');
  };

  const handleSendNotification = () => {
    if (!notifMessage) return;
    // Mock sending to all users (in reality this would go to a global DB table)
    addNotification({
      title: 'إعلان من الإدارة',
      message: notifMessage,
      type: 'info'
    });
    setNotifMessage('');
    alert('تم إرسال الإشعار للمستخدمين');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24" style={{ direction: 'rtl' }}>
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-white font-bold text-2xl mb-6">لوحة الإدارة</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1a2535] p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
              <Users size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">المستخدمين</p>
              <p className="text-white font-bold text-xl">{users.length}</p>
            </div>
          </div>
          <div className="bg-[#1a2535] p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center shrink-0">
              <CreditCard size={24} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">مشتركين Pro</p>
              <p className="text-white font-bold text-xl">{proUsers}</p>
            </div>
          </div>
          <div className="bg-[#1a2535] p-4 rounded-2xl flex items-center gap-4 col-span-2">
            <div className="w-12 h-12 bg-[#4ade80]/10 rounded-full flex items-center justify-center shrink-0">
              <span className="text-[#4ade80] text-xl font-bold">ج.م</span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">الدخل التقديري الشهري</p>
              <p className="text-[#4ade80] font-bold text-xl" style={{ direction: 'ltr' }}>{estRevenue.toLocaleString()} ج.م</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Pricing Settings */}
        <div className="bg-[#1a2535] rounded-3xl overflow-hidden mb-8">
          <div className="p-4 border-b border-[#1f2937] flex items-center gap-2">
            <Settings size={20} className="text-[#4ade80]" />
            <h2 className="text-white font-bold">إعدادات تسعير الاشتراك</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-gray-400 text-xs mb-2 block">السعر الأساسي (ج.م)</label>
              <input
                type="number"
                value={priceInput}
                onChange={e => setPriceInput(e.target.value)}
                className="w-full bg-[#0f1520] border border-[#1f2937] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#4ade80]/40"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-2 block">سعر الخصم (اختياري - اترك فارغاً للإلغاء)</label>
              <input
                type="number"
                value={discountInput}
                onChange={e => setDiscountInput(e.target.value)}
                placeholder="مثال: 150"
                className="w-full bg-[#0f1520] border border-[#1f2937] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#4ade80]/40"
              />
            </div>
            <button
              onClick={handleSavePricing}
              className="w-full py-3 rounded-xl bg-[#4ade80] text-[#070a10] font-bold text-sm"
            >
              حفظ التسعير
            </button>
          </div>
        </div>

        {/* Promo Codes */}
        <div className="bg-[#1a2535] rounded-3xl overflow-hidden mb-8">
          <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={20} className="text-yellow-500" />
              <h2 className="text-white font-bold">أكواد الخصم</h2>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col gap-3 mb-6 bg-[#0f1520] p-4 rounded-2xl border border-[#1f2937]">
              <h3 className="text-white text-sm font-bold mb-1">إضافة كود جديد</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder="اسم الكود (مثال: SAVE50)"
                  className="flex-1 bg-[#1a2535] border border-[#2d3b4e] rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const discount = promoDiscount || '20';
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    let randomStr = '';
                    for (let i = 0; i < 4; i++) {
                      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    setPromoCode(`BOBA${discount}-${randomStr}`);
                  }}
                  className="px-3 py-2 sm:py-0 justify-center bg-yellow-500/10 text-yellow-500 rounded-xl text-xs font-bold border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Sparkles size={12} /> توليد تلقائي
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  value={promoDiscount}
                  onChange={e => setPromoDiscount(e.target.value)}
                  placeholder="نسبة الخصم %"
                  className="w-full sm:w-1/2 bg-[#1a2535] border border-[#2d3b4e] rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                />
                <input
                  type="number"
                  value={promoDays}
                  onChange={e => setPromoDays(e.target.value)}
                  placeholder="صلاحية بالأيام"
                  className="w-full sm:w-1/2 bg-[#1a2535] border border-[#2d3b4e] rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 mt-1 bg-[#161d2a] p-3 rounded-xl border border-[#2d3b4e]/50">
                <span className="text-gray-400 text-xs font-bold block mb-0.5">حد الاستخدام:</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setPromoLimitType('unlimited')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                      promoLimitType === 'unlimited'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                        : 'bg-[#1a2535] border-[#2d3b4e] text-gray-400 hover:text-white'
                    }`}
                  >
                    غير محدود (Unlimited)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromoLimitType('limited')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                      promoLimitType === 'limited'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                        : 'bg-[#1a2535] border-[#2d3b4e] text-gray-400 hover:text-white'
                    }`}
                  >
                    محدد بعدد مستخدمين
                  </button>
                </div>
                {promoLimitType === 'limited' && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <span className="text-gray-400 text-xs shrink-0">أقصى عدد للاستخدام:</span>
                    <input
                      type="number"
                      min="1"
                      value={promoLimitCount}
                      onChange={e => setPromoLimitCount(e.target.value)}
                      placeholder="أدخل العدد (مثال: 10)"
                      className="flex-1 bg-[#1a2535] border border-[#2d3b4e] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleAddPromo}
                className="w-full py-2.5 rounded-xl bg-[#2d3b4e] text-white font-bold text-sm hover:bg-[#3d4b5e] transition-colors mt-2 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> إضافة الكود
              </button>
            </div>

            <div className="space-y-3">
              {appConfig.promoCodes.map(promo => (
                <div key={promo.id} className="bg-[#0f1520] p-3 rounded-xl border border-[#1f2937] flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">
                      {promo.code}{' '}
                      <span className="text-yellow-500 text-xs bg-yellow-500/10 px-2 py-0.5 rounded ml-2">-{promo.discountPercentage}%</span>
                    </p>
                    <div className="flex gap-4 text-[11px] text-gray-400 mt-1">
                      <span>الاستخدام: <strong className="text-yellow-500">{promo.usageCount || 0}</strong> / {promo.usageLimit !== null && promo.usageLimit !== undefined ? promo.usageLimit : '∞'}</span>
                      <span>ينتهي: {new Date(promo.expiresAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                  <button onClick={() => deletePromoCode(promo.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {appConfig.promoCodes.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-2">لا توجد أكواد خصم حالياً</p>
              )}
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        <div className="bg-[#1a2535] rounded-3xl overflow-hidden mb-8">
          <div className="p-4 border-b border-[#1f2937] flex items-center gap-2">
            <Bell size={20} className="text-blue-500" />
            <h2 className="text-white font-bold">إرسال إشعار عام</h2>
          </div>
          <div className="p-4 space-y-4">
            <textarea
              value={notifMessage}
              onChange={e => setNotifMessage(e.target.value)}
              placeholder="اكتب رسالة ليتم إرسالها لجميع المستخدمين..."
              className="w-full bg-[#0f1520] border border-[#1f2937] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#4ade80]/40 min-h-[100px] resize-none"
            />
            <button
              onClick={handleSendNotification}
              className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors"
            >
              إرسال الإشعار
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-[#1a2535] rounded-3xl overflow-hidden mb-8">
          <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
            <h2 className="text-white font-bold">إدارة العملاء</h2>
            <button onClick={fetchUsers} className="text-sm text-[#4ade80]">تحديث</button>
          </div>
          
          <div className="p-4 space-y-4">
            {loading ? (
              <p className="text-center text-gray-500 py-4">جاري التحميل...</p>
            ) : users.map(u => (
              <div key={u.id} className="bg-[#0f1520] p-4 rounded-2xl flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                      {u.name}
                      {u.isAdmin && <Shield size={14} className="text-blue-400" />}
                    </h3>
                    <p className="text-gray-500 text-xs">{u.email}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${u.plan === 'pro' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-400'}`}>
                    {u.plan === 'pro' ? 'PRO' : 'FREE'}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => togglePlan(u.id, u.plan || 'free')}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1f2937] text-white hover:bg-[#2d3b4e]"
                  >
                    تبديل الخطة
                  </button>
                  <button
                    onClick={() => toggleAdmin(u.id, !!u.isAdmin)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1f2937] text-white hover:bg-[#2d3b4e]"
                  >
                    {u.isAdmin ? 'سحب الإدارة' : 'ترقية لأدمن'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section (Mock) */}
        <div className="bg-[#1a2535] rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-[#1f2937]">
            <h2 className="text-white font-bold flex items-center gap-2">
              <MessageSquare size={18} />
              الآراء والمقترحات (تجريبي)
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-[#0f1520] p-4 rounded-2xl">
              <p className="text-white text-sm mb-2">التطبيق ممتاز جداً وسهل الاستخدام، أتمنى إضافة ميزة تصدير PDF.</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>أحمد محمد</span>
                <span>منذ يومين</span>
              </div>
            </div>
            <div className="bg-[#0f1520] p-4 rounded-2xl">
              <p className="text-white text-sm mb-2">المستشار الذكي ساعدني كتير في توفير فلوسي.</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>سارة أحمد</span>
                <span>منذ أسبوع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
