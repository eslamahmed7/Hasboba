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
import { supabase } from './lib/supabase';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import {
  LayoutDashboard, Briefcase, Heart, TrendingUp, Sparkles
} from 'lucide-react';
import type { TabType } from './types';

const navItems: { id: TabType; label: string; icon: React.ElementType; activeColor: string; glowColor: string }[] = [
  { id: 'social',    label: 'تحويش',        icon: Heart,           activeColor: '#ec4899', glowColor: 'rgba(236,72,153,0.4)' },
  { id: 'business',  label: 'بيزنس',       icon: Briefcase,       activeColor: '#60a5fa', glowColor: 'rgba(96,165,250,0.4)' },
  { id: 'dashboard', label: 'الرئيسية',   icon: LayoutDashboard, activeColor: '#4ade80', glowColor: 'rgba(74,222,128,0.4)' },
  { id: 'assets',    label: 'استثمار',      icon: TrendingUp,      activeColor: '#a855f7', glowColor: 'rgba(168,85,247,0.4)' },
  { id: 'analytics', label: 'تحليلات',      icon: Sparkles,        activeColor: '#facc15', glowColor: 'rgba(250,204,21,0.4)' },
];

function MainApp() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ version: string; changelog: string; download_url: string } | null>(null);

  useEffect(() => {
    // Notify CapacitorUpdater that app is ready (only on native platforms)
    if (Capacitor.isNativePlatform()) {
      CapacitorUpdater.notifyAppReady()
        .then(() => console.log('Capacitor Updater: App ready notified successfully'))
        .catch(err => console.error('Capacitor Updater failed to notify app ready', err));
    }

    const CURRENT_VERSION = '1.0.0'; // Hardcoded current version

    const checkUpdate = async () => {
      try {
        const { data, error } = await supabase
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

  return (
    <div className="min-h-screen bg-[#070a10] flex justify-center items-center">
      {/* Phone frame wrapper */}
      <div
        className="relative flex flex-col overflow-hidden bg-[#0a0d13]"
        style={{
          width: '100%',
          maxWidth: '430px',
          height: '100dvh',
          maxHeight: '900px',
          borderRadius: window.innerWidth > 430 ? '40px' : '0',
          boxShadow: window.innerWidth > 430
            ? '0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px #1f2937'
            : 'none',
        }}
      >
        {/* Status bar — desktop only */}
        <div className="hidden sm:flex items-center justify-between px-6 py-2 text-white/60 text-xs shrink-0">
          <span>9:41</span>
          <div className="w-24 h-5 bg-[#0a0d13] rounded-full" />
          <span>●●●</span>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="h-full overflow-y-auto scrollbar-hide"
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  onOpenAI={() => setActiveTab('analytics')}
                  onOpenNotifications={() => setShowNotifications(true)}
                  onRequireUpgrade={() => setShowSubscription(true)}
                />
              )}
              {activeTab === 'business'  && <BusinessPage />}
              {activeTab === 'social'    && <SocialPage />}
              {activeTab === 'assets'    && <AssetsPage />}
              {activeTab === 'analytics' && (
                <AnalyticsPage
                  onOpenNotifications={() => setShowNotifications(true)}
                  onRequireUpgrade={() => setShowSubscription(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Notifications Panel */}
        <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

        {/* Subscription Modal */}
        <AnimatePresence>
          {showSubscription && (
            <SubscriptionModal onClose={() => setShowSubscription(false)} />
          )}
        </AnimatePresence>

        {/* Update Modal */}
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

        {/* ─── Bottom Navigation ────────────────────────────────────────────────── */}
        <div className="shrink-0 bg-[#0d1117] border-t border-[#1f2937] safe-bottom">
          <div className="flex items-center justify-around px-1 pt-2 pb-1">
            {navItems.map((item, i) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isCenterTab = i === 2; // "تحويش" (Heart) is center

              if (isCenterTab) {
                return (
                  <div key={item.id} className="flex flex-col items-center">
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setActiveTab(item.id)}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: isActive ? item.activeColor : '#1a2535',
                        boxShadow: isActive ? `0 0 22px ${item.glowColor}` : 'none',
                      }}
                    >
                      <Icon size={24} color={isActive ? '#000' : '#6b7280'} />
                    </motion.button>
                    <span
                      className="text-[10px] mt-1 font-bold"
                      style={{ color: isActive ? item.activeColor : '#4b5563' }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              }

              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveTab(item.id)}
                  className="flex flex-col items-center gap-0.5 py-1 px-3 transition-all"
                >
                  <div className="relative">
                    <Icon
                      size={22}
                      style={{ color: isActive ? item.activeColor : '#4b5563' }}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 blur-md opacity-60"
                        style={{ backgroundColor: item.activeColor }}
                      />
                    )}
                  </div>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: isActive ? item.activeColor : '#4b5563' }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: item.activeColor }}
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
