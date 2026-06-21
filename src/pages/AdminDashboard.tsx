import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Users, CreditCard, DollarSign, Activity, Bell, Settings, Search, Trash2, Edit2, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, UploadCloud, RefreshCw, X } from 'lucide-react';

const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BORDER  = '#1e3035';

export function AdminDashboard() {
  const { user } = useApp();
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, proUsers: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system'>('overview');
  const [search, setSearch] = useState('');
  
  // System updates state
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: pro } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro');
      setStats({
        totalUsers: total || 0,
        activeUsers: Math.floor((total || 0) * 0.8), // Mock active users
        proUsers: pro || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserPlan = async (id: string, currentPlan: string) => {
    const newPlan = currentPlan === 'pro' ? 'free' : 'pro';
    try {
      await supabase.from('profiles').update({ plan: newPlan }).eq('id', id);
      setUsers(users.map(u => u.id === id ? { ...u, plan: newPlan } : u));
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePushUpdate = async () => {
    if (!version || !changelog || !downloadUrl) {
      alert('يرجى تعبئة جميع الحقول');
      return;
    }
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('app_version').insert({
        version,
        changelog,
        download_url: downloadUrl,
        is_mandatory: false
      });
      if (error) throw error;
      alert('تم إرسال التحديث بنجاح لجميع المستخدمين!');
      setVersion(''); setChangelog(''); setDownloadUrl('');
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const estRevenue = stats.proUsers * 150; // Mock revenue calculation

  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6" style={{ background: BG_BASE }}>
        <XCircle size={48} style={{ color: '#f43f5e' }} className="mb-4" />
        <h2 className="text-white font-bold text-xl mb-2">عذراً، غير مصرح لك</h2>
        <p className="text-sm" style={{ color: '#6a9ca2' }}>هذه الصفحة مخصصة للمديرين فقط.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-28">
      
      {/* Header */}
      <div className="px-5 py-6">
        <h1 className="text-white font-bold text-2xl text-right mb-1">لوحة الإدارة</h1>
        <p className="text-sm text-right" style={{ color: '#6a9ca2' }}>نظرة عامة على أداء التطبيق والمستخدمين</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 p-1.5 rounded-2xl" style={{ background: BG_CARD }}>
          {[
            { id: 'overview', label: 'نظرة عامة', icon: Activity },
            { id: 'users', label: 'المستخدمين', icon: Users },
            { id: 'system', label: 'النظام والتحديثات', icon: Settings }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: isActive ? ACCENT : 'transparent',
                  color: isActive ? 'white' : '#4a7a80',
                  boxShadow: isActive ? `0 0 12px rgba(0,173,181,0.3)` : 'none'
                }}>
                <Icon size={16} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Overview Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="px-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: Users, color: ACCENT, trend: '+12%' },
              { label: 'المستخدمين النشطين', value: stats.activeUsers, icon: Activity, color: '#34d399', trend: '+5%' },
              { label: 'مستخدمي Pro', value: stats.proUsers, icon: CreditCard, color: '#facc15', trend: '+2%' },
              { label: 'الإيرادات المتوقعة', value: `${estRevenue.toLocaleString()} ج.م`, icon: DollarSign, color: '#60a5fa', trend: '+18%' },
            ].map(stat => (
              <div key={stat.label} className="p-4 rounded-2xl relative overflow-hidden" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: stat.color }} />
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: stat.color + '15' }}>
                    <stat.icon size={16} style={{ color: stat.color }} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
                    style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                    <ArrowUpRight size={10} /> {stat.trend}
                  </span>
                </div>
                <p className="font-black text-xl text-white mb-1">{stat.value}</p>
                <p className="text-xs" style={{ color: '#6a9ca2' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-3xl" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-4">
              <button className="text-xs font-bold" style={{ color: ACCENT }}>تقرير مفصل</button>
              <h3 className="text-white font-bold text-sm">الإيرادات الشهرية</h3>
            </div>
            <div className="h-40 flex items-end justify-between gap-2 pt-4">
              {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end gap-2 group">
                  <div className="w-full rounded-t-md transition-all group-hover:opacity-80"
                    style={{ height: `${h}%`, background: i === 6 ? ACCENT : BORDER }} />
                  <span className="text-[10px] text-center" style={{ color: '#4a7a80' }}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ───────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="px-4">
          <div className="flex items-center gap-2 p-3 rounded-2xl mb-4" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
            <Search size={18} style={{ color: '#4a7a80' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو البريد..."
              className="flex-1 bg-transparent border-none text-white text-sm text-right focus:outline-none placeholder-[#4a7a80]" />
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><RefreshCw className="animate-spin" style={{ color: ACCENT }} /></div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-2 mb-1">
                <span className="text-xs font-bold" style={{ color: '#6a9ca2' }}>العدد: {filteredUsers.length}</span>
                <button onClick={fetchUsers} className="text-xs font-bold flex items-center gap-1" style={{ color: ACCENT }}>
                  <RefreshCw size={12} /> تحديث
                </button>
              </div>
              
              {filteredUsers.map(u => (
                <div key={u.id} className="p-4 rounded-2xl" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <button onClick={() => toggleUserPlan(u.id, u.plan)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border"
                      style={{
                        background: u.plan === 'pro' ? 'rgba(250,204,21,0.1)' : 'transparent',
                        color: u.plan === 'pro' ? '#facc15' : '#6a9ca2',
                        borderColor: u.plan === 'pro' ? '#facc15' : BORDER
                      }}>
                      {u.plan === 'pro' ? 'Pro' : 'Free'}
                    </button>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">{u.name || 'بدون اسم'}</p>
                      <p className="text-[10px]" style={{ color: '#6a9ca2' }}>{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <span className="text-[10px]" style={{ color: '#4a7a80' }}>
                      البلد: {u.country || 'غير محدد'} ({u.currency || 'EGP'})
                    </span>
                    <span className="text-[10px]" style={{ color: '#4a7a80' }}>
                      تاريخ الانضمام: {new Date(u.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── System Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'system' && (
        <div className="px-4 space-y-4">
          <div className="p-5 rounded-3xl" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-3 mb-6 justify-end">
              <h3 className="text-white font-bold text-base">إرسال تحديث للتطبيق (OTA)</h3>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `rgba(0,173,181,0.15)` }}>
                <UploadCloud size={20} style={{ color: ACCENT }} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs mb-1.5 text-right font-medium" style={{ color: '#6a9ca2' }}>رقم الإصدار الجديد</p>
                <input value={version} onChange={e => setVersion(e.target.value)} placeholder="مثال: 1.0.2"
                  className="w-full rounded-xl py-3 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                  style={{ background: BG_BASE, border: `1px solid ${BORDER}`, color: 'white' }} />
              </div>

              <div>
                <p className="text-xs mb-1.5 text-right font-medium" style={{ color: '#6a9ca2' }}>رابط تحميل الملف (ZIP)</p>
                <input value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)} placeholder="https://example.com/update.zip" dir="ltr"
                  className="w-full rounded-xl py-3 px-4 text-sm focus:outline-none placeholder-[#3a6068]"
                  style={{ background: BG_BASE, border: `1px solid ${BORDER}`, color: 'white' }} />
              </div>

              <div>
                <p className="text-xs mb-1.5 text-right font-medium" style={{ color: '#6a9ca2' }}>ما الجديد في هذا التحديث؟</p>
                <textarea value={changelog} onChange={e => setChangelog(e.target.value)} placeholder="- تحسين الأداء&#10;- إصلاح الأخطاء"
                  className="w-full rounded-xl py-3 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068] min-h-[100px] resize-none"
                  style={{ background: BG_BASE, border: `1px solid ${BORDER}`, color: 'white' }} />
              </div>

              <button onClick={handlePushUpdate} disabled={isUpdating}
                className="w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`, color: 'white',
                  boxShadow: `0 4px 20px rgba(0,173,181,0.3)`
                }}>
                {isUpdating ? <RefreshCw className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                إرسال التحديث للمستخدمين
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
