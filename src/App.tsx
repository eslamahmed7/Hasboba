import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { OnboardingScreen } from './pages/OnboardingScreen';
import { Dashboard } from './pages/Dashboard';
import { BusinessPage } from './pages/BusinessPage';
import { SocialPage } from './pages/SocialPage';
import { AssetsPage } from './pages/AssetsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPanel } from './components/NotificationsPanel';
import { SubscriptionModal } from './components/SubscriptionModal';
import { UpdateModal } from './components/UpdateModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { supabase } from './lib/supabase';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Home, CreditCard, Plus, BarChart2, User2 } from 'lucide-react';
import type { TabType } from './types';

// ── 5-Tab Petroleum Navigation ───────────────────────────────────────────────
const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'الرئيسية',  icon: Home },
  { id: 'assets',    label: 'الحسابات',  icon: CreditCard },
  { id: 'social',    label: 'إضافة',     icon: Plus },
  { id: 'business',  label: 'المعاملات', icon: BarChart2 },
  { id: 'analytics', label: 'حسابي',     icon: User2 },
];

const ACCENT = '#00adb5';
const ACCENT_GLOW = 'rgba(0,173,181,0.35)';

function MainApp() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ version: string; changelog: string; download_url: string } | null>(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      CapacitorUpdater.notifyAppReady()
        .then(() => console.log('Capacitor Updater: App ready notified successfully'))
        .catch(err => console.error('Capacitor Updater failed to notify app ready', err));
    }

    const CURRENT_VERSION = '1.0.0';
    const checkUpdate = async () => {
      try {
        const { data } = await supabase
          .from('app_version')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data && data.version && data.version !== CURRENT_VERSION) {
          setUpdateInfo(data);
        }
      } catch (err) {
        console.error('Failed to check for updates', err);
      }
    };
    checkUpdate();
  }, []);

  if (!user) return <OnboardingScreen />;

  const handleNavClick = (id: TabType) => {
    if (id === 'social') {
      // Global Add Button triggers modal
      setShowAddModal(true);
    } else {
      setActiveTab(id);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center" style={{ background: '#07100f' }}>
      {/* Phone frame */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '430px',
          height: '100dvh',
          maxHeight: '900px',
          background: '#0b1315',
          borderRadius: window.innerWidth > 430 ? '40px' : '0',
          boxShadow: window.innerWidth > 430
            ? '0 30px 80px rgba(0,0,0,0.9), 0 0 0 1px #1e3035'
            : 'none',
        }}
      >
        {/* Status bar — desktop only */}
        <div className="hidden sm:flex items-center justify-between px-6 py-2 text-white/40 text-xs shrink-0 z-10">
          <span>9:41</span>
          <div className="w-24 h-5 bg-[#0b1315] rounded-full" />
          <span>●●●</span>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full overflow-y-auto scrollbar-hide"
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  onOpenAI={() => setActiveTab('analytics')}
                  onOpenNotifications={() => setShowNotifications(true)}
                  onRequireUpgrade={() => setShowSubscription(true)}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === 'business'  && <BusinessPage />}
              {activeTab === 'assets'    && <AssetsPage />}
              {activeTab === 'analytics' && (
                <AnalyticsPage
                  onOpenNotifications={() => setShowNotifications(true)}
                  onRequireUpgrade={() => setShowSubscription(true)}
                  onNavigate={setActiveTab}
                />
              )}
              {/* Note: 'social' tab opens the SocialPage via routing (e.g. from Dashboard or Analytics) 
                  even though the bottom nav button overrides it to open AddModal.
              */}
              {activeTab === 'social'    && <SocialPage />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Modals */}
        <AddTransactionModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          onRequireUpgrade={() => setShowSubscription(true)}
        />
        
        <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

        <AnimatePresence>
          {showSubscription && (
            <SubscriptionModal onClose={() => setShowSubscription(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {updateInfo && (
            <UpdateModal
              version={updateInfo.version}
              changelog={updateInfo.changelog}
              downloadUrl={updateInfo.download_url}
              onClose={() => setUpdateInfo(null)}
            />
          )}
        </AnimatePresence>

        {/* ── Bottom Navigation ─────────────────────────────────────────────────── */}
        <div
          className="shrink-0 safe-bottom relative z-40"
          style={{
            background: '#0d1a1d',
            borderTop: '1px solid #1e3035',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center justify-around px-1 pt-2 pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCenter = item.id === 'social';
              const isActive = activeTab === item.id && !isCenter;

              if (isCenter) {
                return (
                  <div key={item.id} className="flex flex-col items-center -mt-6">
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleNavClick(item.id)}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-50"
                      style={{
                        background: `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`,
                        boxShadow: `0 4px 20px ${ACCENT_GLOW}, 0 0 0 3px #0d1a1d`,
                      }}
                    >
                      <Icon size={26} color="#ffffff" strokeWidth={2.5} />
                    </motion.button>
                    <span className="text-[10px] mt-1 font-bold" style={{ color: '#4a7a80' }}>
                      {item.label}
                    </span>
                  </div>
                );
              }

              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNavClick(item.id)}
                  className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
                >
                  <div className="relative">
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      style={{ color: isActive ? ACCENT : '#4a7a80' }}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute -inset-1 rounded-full blur-sm opacity-50"
                        style={{ background: ACCENT }}
                      />
                    )}
                  </div>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: isActive ? ACCENT : '#4a7a80' }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -bottom-1 w-1 h-1 rounded-full"
                      style={{ background: ACCENT }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
