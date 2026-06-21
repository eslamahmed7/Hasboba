import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Transaction, Debt, SavingsGoal, Subscription, Achievement, User, AppConfig, PromoCode, Asset, TeamBudget, Project } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  debts: Debt[];
  addDebt: (d: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (g: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  subscriptions: Subscription[];
  addSubscription: (s: Omit<Subscription, 'id'>) => void;
  deleteSubscription: (id: string) => void;
  achievements: Achievement[];
  triggerAchievement: (id: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  syncLocalToCloud: () => Promise<void>;
  isDark: boolean;
  toggleTheme: () => void;
  balance: { current: number; income: number; expenses: number };
  appConfig: AppConfig;
  updateAppConfig: (config: Partial<AppConfig>) => void;
  addPromoCode: (promo: Omit<PromoCode, 'id'>) => void;
  deletePromoCode: (id: string) => void;
  incrementPromoCodeUsage: (code: string) => void;
  // ─── New domains ───────────────────────────────────────────────────────────
  assets: Asset[];
  addAsset: (a: Omit<Asset, 'id' | 'createdAt'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  teamBudgets: TeamBudget[];
  addTeamBudget: (tb: Omit<TeamBudget, 'id' | 'createdAt'>) => void;
  updateTeamBudget: (id: string, updates: Partial<TeamBudget>) => void;
  deleteTeamBudget: (id: string) => void;
  projects: Project[];
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Local storage helpers
const load = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
const save = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// Valid UUID Generator for client-side state matching
const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const defaultAchievements: Achievement[] = [
  { id: '1', name: 'بداية الرحلة', description: 'سجل أول معاملة', icon: 'flag', tier: 'bronze', earned: false },
  { id: '2', name: 'محافظ على الميزانية', description: 'ابقَ في نطاق الميزانية لمدة 3 أشهر', icon: 'trophy', tier: 'gold', earned: false },
  { id: '3', name: 'موفر منتظم', description: 'أضف للادخار 4 أسابيع متتالية', icon: 'piggy-bank', tier: 'silver', earned: false },
  { id: '4', name: 'هدف مكتمل', description: 'أمل هدف ادخار واحد', icon: 'check-circle', tier: 'platinum', earned: false },
  { id: '5', name: 'محترف الفواتير', description: 'أضف 10 اشتراكات', icon: 'star', tier: 'silver', earned: false },
  { id: '6', name: 'عبقري المال', description: 'استخدم مستشار الذكاء الاصطناعي 5 مرات', icon: 'brain', tier: 'gold', earned: false },
];

const defaultAppConfig: AppConfig = {
  aiSubscriptionPrice: 200,
  aiSubscriptionDiscountPrice: null,
  promoCodes: [],
};

// Mapping functions for database compatibility
const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  name: profile.name,
  email: profile.email || '',
  phone: profile.phone || '',
  country: profile.country || 'مصر',
  currency: profile.currency || 'EGP',
  currencySymbol: profile.currency_symbol || 'ج.م',
  payday: profile.payday || 1,
  theme: profile.theme || 'dark',
  plan: profile.plan || 'free',
  isAdmin: profile.is_admin || false,
});

const mapDbToTransaction = (t: any): Transaction => ({
  id: t.id,
  type: t.type,
  amount: Number(t.amount),
  category: t.category,
  description: t.description || '',
  date: t.date,
  icon: t.icon || '',
});

const mapTransactionToDb = (t: Transaction, userId: string) => ({
  id: t.id,
  user_id: userId,
  type: t.type,
  amount: t.amount,
  category: t.category,
  description: t.description,
  date: t.date,
  icon: t.icon,
});

const mapDbToDebt = (d: any): Debt => ({
  id: d.id,
  contactName: d.contact_name,
  phone: d.phone || '',
  amount: Number(d.amount),
  dueDate: d.due_date,
  type: d.type,
  isPaid: d.is_paid,
  notes: d.notes || '',
});

const mapDebtToDb = (d: Debt, userId: string) => ({
  id: d.id,
  user_id: userId,
  contact_name: d.contactName,
  phone: d.phone,
  amount: d.amount,
  due_date: d.dueDate,
  type: d.type,
  is_paid: d.isPaid,
  notes: d.notes,
});

const mapDbToSavingsGoal = (g: any): SavingsGoal => ({
  id: g.id,
  name: g.name,
  targetAmount: Number(g.target_amount),
  currentAmount: Number(g.current_amount),
  icon: g.icon,
  color: g.color,
  deadline: g.deadline || '',
});

const mapSavingsGoalToDb = (g: SavingsGoal, userId: string) => ({
  id: g.id,
  user_id: userId,
  name: g.name,
  target_amount: g.targetAmount,
  current_amount: g.currentAmount,
  icon: g.icon,
  color: g.color,
  deadline: g.deadline || null,
});

const mapDbToSubscription = (s: any): Subscription => ({
  id: s.id,
  name: s.name,
  amount: Number(s.amount),
  billingDate: s.billing_date,
  icon: s.icon,
  color: s.color,
  category: s.category,
});

const mapSubscriptionToDb = (s: Subscription, userId: string) => ({
  id: s.id,
  user_id: userId,
  name: s.name,
  amount: s.amount,
  billing_date: s.billingDate,
  icon: s.icon,
  color: s.color,
  category: s.category,
});

const mapDbToAchievement = (a: any): Achievement => ({
  id: a.id,
  name: a.name,
  description: a.description,
  icon: a.icon,
  tier: a.tier,
  earned: a.earned,
  earnedDate: a.earned_date || undefined,
});

const mapAchievementToDb = (a: Achievement, userId: string) => ({
  id: a.id,
  user_id: userId,
  name: a.name,
  description: a.description,
  icon: a.icon,
  tier: a.tier,
  earned: a.earned,
  earned_date: a.earnedDate || null,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(() => load('hasboba_user', null));
  const [transactions, setTransactions] = useState<Transaction[]>(() => load('hasboba_txns', []));
  const [debts, setDebts] = useState<Debt[]>(() => load('hasboba_debts', []));
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => load('hasboba_goals', []));
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => load('hasboba_subs', []));
  const [achievements, setAchievements] = useState<Achievement[]>(() => load('hasboba_ach', defaultAchievements));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => load('hasboba_notifs', []));
  const [isDark, setIsDark] = useState(() => load('hasboba_dark', true));
  const [appConfig, setAppConfig] = useState<AppConfig>(() => load('hasboba_app_config', defaultAppConfig));
  // ─── New domains ─────────────────────────────────────────────────────────
  const [assets, setAssets] = useState<Asset[]>(() => load('hasboba_assets', []));
  const [teamBudgets, setTeamBudgets] = useState<TeamBudget[]>(() => load('hasboba_teams', []));
  const [projects, setProjects] = useState<Project[]>(() => load('hasboba_projects', []));

  // Sync state to local storage as fallback
  useEffect(() => { save('hasboba_user', user); }, [user]);
  useEffect(() => { save('hasboba_txns', transactions); }, [transactions]);
  useEffect(() => { save('hasboba_debts', debts); }, [debts]);
  useEffect(() => { save('hasboba_goals', savingsGoals); }, [savingsGoals]);
  useEffect(() => { save('hasboba_subs', subscriptions); }, [subscriptions]);
  useEffect(() => { save('hasboba_ach', achievements); }, [achievements]);
  useEffect(() => { save('hasboba_notifs', notifications); }, [notifications]);
  useEffect(() => { save('hasboba_dark', isDark); }, [isDark]);
  useEffect(() => { save('hasboba_app_config', appConfig); }, [appConfig]);
  useEffect(() => { save('hasboba_assets', assets); }, [assets]);
  useEffect(() => { save('hasboba_teams', teamBudgets); }, [teamBudgets]);
  useEffect(() => { save('hasboba_projects', projects); }, [projects]);

  const updateAppConfig = (config: Partial<AppConfig>) => {
    setAppConfig(prev => ({ ...prev, ...config }));
  };

  const addPromoCode = (promo: Omit<PromoCode, 'id'>) => {
    const newP: PromoCode = { ...promo, id: generateUUID() };
    setAppConfig(prev => ({ ...prev, promoCodes: [...prev.promoCodes, newP] }));
  };

  const deletePromoCode = (id: string) => {
    setAppConfig(prev => ({ ...prev, promoCodes: prev.promoCodes.filter(p => p.id !== id) }));
  };

  const incrementPromoCodeUsage = (code: string) => {
    setAppConfig(prev => ({
      ...prev,
      promoCodes: prev.promoCodes.map(p =>
        p.code.toLowerCase() === code.toLowerCase()
          ? { ...p, usageCount: p.usageCount + 1 }
          : p
      ),
    }));
  };

  const addNotification = (n: Omit<AppNotification, 'id' | 'date' | 'isRead'>) => {
    setNotifications(prev => {
      // Prevent duplicates
      if (prev.some(p => p.title === n.title && p.message === n.message && new Date().getTime() - new Date(p.date).getTime() < 86400000)) return prev;
      return [{ ...n, id: generateUUID(), date: new Date().toISOString(), isRead: false }, ...prev];
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => setNotifications([]);

  // Auto-generate notifications
  useEffect(() => {
    if (!user) return;
    const today = new Date();
    
    // Check due debts
    debts.forEach(d => {
      if (!d.isPaid) {
        const due = new Date(d.dueDate);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 3 && diffDays >= 0) {
          addNotification({
            title: 'تذكير بدين مستحق',
            message: `موعد سداد ${d.amount} لـ ${d.contactName} يقترب! (باقي ${diffDays} أيام)`,
            type: 'warning'
          });
        }
      }
    });

    // Check subscriptions
    subscriptions.forEach(s => {
      const [monthStr, dayStr, yearStr] = s.billingDate.split(' '); // e.g. "يونيو 10, 2024"
      // Simple parse or just rely on a date format if possible
      // Assuming naive string for now, but let's try to parse if valid
      const bd = new Date(s.billingDate);
      if (!isNaN(bd.getTime())) {
        const diffDays = Math.ceil((bd.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 3 && diffDays >= 0) {
          addNotification({
            title: 'تجديد اشتراك قادم',
            message: `اشتراك ${s.name} سيتم تجديده قريباً (باقي ${diffDays} أيام)`,
            type: 'warning'
          });
        }
      }
    });

  }, [debts, subscriptions, user]);


  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : 'light';
  }, [isDark]);

  const fetchAndSyncData = async (userId: string) => {
    try {
      // 1. Profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!profileErr && profile) {
        setUserState(mapProfileToUser(profile));
      } else {
        // Fallback: Use metadata from auth user session if table/row doesn't exist
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const meta = session.user.user_metadata || {};
          const fallbackUser: User = {
            id: userId,
            name: meta.name || 'مستخدم جديد',
            email: session.user.email || '',
            phone: session.user.phone || '',
            country: meta.country || 'مصر',
            currency: meta.currency || 'EGP',
            currencySymbol: meta.currency_symbol || 'ج.م',
            payday: Number(meta.payday || 1),
            theme: meta.theme || 'dark',
            plan: 'free',
            isAdmin: false,
          };
          // Attempt to insert it to database so it exists next time (fails silently if SQL tables aren't built)
          try {
            await supabase.from('profiles').insert({
              id: userId,
              name: fallbackUser.name,
              email: fallbackUser.email,
              phone: fallbackUser.phone,
              country: fallbackUser.country,
              currency: fallbackUser.currency,
              currency_symbol: fallbackUser.currencySymbol,
              payday: fallbackUser.payday,
              theme: fallbackUser.theme
            });
          } catch (e) {
            console.error('Silent insert fallback profile failed:', e);
          }
          setUserState(fallbackUser);
        }
      }

      // 2. Transactions
      const { data: txns, error: txnsErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!txnsErr && txns) {
        setTransactions(txns.map(mapDbToTransaction));
      }

      // 3. Debts
      const { data: dbt, error: debtsErr } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!debtsErr && dbt) {
        setDebts(dbt.map(mapDbToDebt));
      }

      // 4. Savings
      const { data: goals, error: goalsErr } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!goalsErr && goals) {
        setSavingsGoals(goals.map(mapDbToSavingsGoal));
      }

      // 5. Subscriptions
      const { data: subs, error: subsErr } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!subsErr && subs) {
        setSubscriptions(subs.map(mapDbToSubscription));
      }

      // 6. Achievements
      const { data: ach, error: achErr } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId);
      if (!achErr && ach && ach.length > 0) {
        setAchievements(ach.map(mapDbToAchievement));
      } else {
        // First login setup defaults
        const dbDefaults = defaultAchievements.map(a => mapAchievementToDb(a, userId));
        await supabase.from('achievements').insert(dbDefaults);
        setAchievements(defaultAchievements);
      }

    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
    }
  };

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchAndSyncData(session.user.id);
      } else {
        setUserState(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchAndSyncData(session.user.id);
      } else {
        setUserState(null);
        setTransactions([]);
        setDebts([]);
        setSavingsGoals([]);
        setSubscriptions([]);
        setAchievements(defaultAchievements);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setUser = async (u: User | null) => {
    setUserState(u);
    if (u) {
      try {
        await supabase
          .from('profiles')
          .update({
            name: u.name,
            country: u.country,
            currency: u.currency,
            currency_symbol: u.currencySymbol,
            payday: u.payday,
            theme: u.theme,
            updated_at: new Date().toISOString(),
          })
          .eq('id', u.id);
      } catch (err) {
        console.error('Failed to sync profile update to Supabase:', err);
      }
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: generateUUID() };
    setTransactions(prev => [newT, ...prev]);

    let updatedAch = achievements;
    const firstTxnAch = achievements.find(a => a.id === '1');
    if (firstTxnAch && !firstTxnAch.earned) {
      updatedAch = achievements.map(a =>
        a.id === '1' ? { ...a, earned: true, earnedDate: new Date().toISOString() } : a
      );
      setAchievements(updatedAch);
    }

    if (user) {
      try {
        await supabase.from('transactions').insert(mapTransactionToDb(newT, user.id));
        if (firstTxnAch && !firstTxnAch.earned) {
          const achToSync = updatedAch.find(a => a.id === '1')!;
          await supabase.from('achievements').upsert(mapAchievementToDb(achToSync, user.id));
        }
      } catch (err) {
        console.error('Failed to save transaction to Supabase:', err);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (user) {
      try {
        await supabase.from('transactions').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete transaction from Supabase:', err);
      }
    }
  };

  const addDebt = async (d: Omit<Debt, 'id'>) => {
    const newD = { ...d, id: generateUUID() };
    setDebts(prev => [newD, ...prev]);
    if (user) {
      try {
        await supabase.from('debts').insert(mapDebtToDb(newD, user.id));
      } catch (err) {
        console.error('Failed to save debt to Supabase:', err);
      }
    }
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    if (user) {
      try {
        const existing = debts.find(d => d.id === id);
        if (existing) {
          const merged = { ...existing, ...updates };
          await supabase.from('debts').upsert(mapDebtToDb(merged, user.id));
        }
      } catch (err) {
        console.error('Failed to update debt in Supabase:', err);
      }
    }
  };

  const deleteDebt = async (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    if (user) {
      try {
        await supabase.from('debts').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete debt from Supabase:', err);
      }
    }
  };

  const addSavingsGoal = async (g: Omit<SavingsGoal, 'id'>) => {
    const newG = { ...g, id: generateUUID() };
    setSavingsGoals(prev => [newG, ...prev]);
    if (user) {
      try {
        await supabase.from('savings_goals').insert(mapSavingsGoalToDb(newG, user.id));
      } catch (err) {
        console.error('Failed to save savings goal to Supabase:', err);
      }
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    let earnedGoalAch = false;
    let updatedAch = achievements;

    setSavingsGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const updated = { ...g, ...updates };
      if (updated.currentAmount >= updated.targetAmount) {
        const goalAch = achievements.find(ac => ac.id === '4');
        if (goalAch && !goalAch.earned) {
          earnedGoalAch = true;
          updatedAch = achievements.map(ac =>
            ac.id === '4' ? { ...ac, earned: true, earnedDate: new Date().toISOString() } : ac
          );
          setAchievements(updatedAch);
        }
      }
      return updated;
    }));

    if (user) {
      try {
        const existing = savingsGoals.find(g => g.id === id);
        if (existing) {
          const merged = { ...existing, ...updates };
          await supabase.from('savings_goals').upsert(mapSavingsGoalToDb(merged, user.id));
          if (earnedGoalAch) {
            const achToSync = updatedAch.find(a => a.id === '4')!;
            await supabase.from('achievements').upsert(mapAchievementToDb(achToSync, user.id));
          }
        }
      } catch (err) {
        console.error('Failed to update savings goal in Supabase:', err);
      }
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    let shouldRevokeAch = false;
    let updatedAch = achievements;

    setSavingsGoals(prev => {
      const remaining = prev.filter(g => g.id !== id);
      // Check if there are any completed goals left
      const hasCompletedGoals = remaining.some(g => g.currentAmount >= g.targetAmount);
      
      if (!hasCompletedGoals) {
        const goalAch = achievements.find(ac => ac.id === '4');
        if (goalAch && goalAch.earned) {
          shouldRevokeAch = true;
          updatedAch = achievements.map(ac =>
            ac.id === '4' ? { ...ac, earned: false, earnedDate: undefined } : ac
          );
          setAchievements(updatedAch);
        }
      }
      return remaining;
    });

    if (user) {
      try {
        await supabase.from('savings_goals').delete().eq('id', id);
        if (shouldRevokeAch) {
          const achToSync = updatedAch.find(a => a.id === '4')!;
          await supabase.from('achievements').upsert(mapAchievementToDb(achToSync, user.id));
        }
      } catch (err) {
        console.error('Failed to delete savings goal from Supabase:', err);
      }
    }
  };

  const addSubscription = async (s: Omit<Subscription, 'id'>) => {
    const newS = { ...s, id: generateUUID() };
    setSubscriptions(prev => [newS, ...prev]);

    let updatedAch = achievements;
    let earnedSubsAch = false;
    if (subscriptions.length + 1 >= 10) {
      const subsAch = achievements.find(a => a.id === '5');
      if (subsAch && !subsAch.earned) {
        earnedSubsAch = true;
        updatedAch = achievements.map(a =>
          a.id === '5' ? { ...a, earned: true, earnedDate: new Date().toISOString() } : a
        );
        setAchievements(updatedAch);
      }
    }

    if (user) {
      try {
        await supabase.from('subscriptions').insert(mapSubscriptionToDb(newS, user.id));
        if (earnedSubsAch) {
          const achToSync = updatedAch.find(a => a.id === '5')!;
          await supabase.from('achievements').upsert(mapAchievementToDb(achToSync, user.id));
        }
      } catch (err) {
        console.error('Failed to save subscription to Supabase:', err);
      }
    }
  };

  const deleteSubscription = async (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    if (user) {
      try {
        await supabase.from('subscriptions').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete subscription from Supabase:', err);
      }
    }
  };

  const triggerAchievement = async (id: string) => {
    let updated = false;
    let targetAch: Achievement | null = null;
    
    setAchievements(prev => prev.map(a => {
      if (a.id === id && !a.earned) {
        updated = true;
        targetAch = { ...a, earned: true, earnedDate: new Date().toISOString() };
        return targetAch;
      }
      return a;
    }));

    if (updated && targetAch && user) {
      try {
        await supabase.from('achievements').upsert(mapAchievementToDb(targetAch, user.id));
      } catch (err) {
        console.error('Failed to sync achievement to Supabase:', err);
      }
    }
  };

  // Background Auto-sync (periodically and when online)
  useEffect(() => {
    if (!user) return;

    const handleOnline = () => {
      syncLocalToCloud().catch(err => console.error('Failed to sync on online event:', err));
    };

    window.addEventListener('online', handleOnline);

    const interval = setInterval(() => {
      syncLocalToCloud().catch(err => console.error('Periodic auto-sync failed:', err));
    }, 120000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, [user, transactions, debts, savingsGoals, subscriptions, achievements]);

  // Full Manual synchronization function
  const syncLocalToCloud = async () => {
    if (!user) return;
    try {
      // 1. Sync Profile
      await supabase.from('profiles').upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        currency: user.currency,
        currency_symbol: user.currencySymbol,
        payday: user.payday,
        theme: user.theme,
        updated_at: new Date().toISOString(),
      });

      // 2. Sync Transactions
      if (transactions.length > 0) {
        const dbTxns = transactions.map(t => mapTransactionToDb(t, user.id));
        await supabase.from('transactions').upsert(dbTxns);
      }

      // 3. Sync Debts
      if (debts.length > 0) {
        const dbDebts = debts.map(d => mapDebtToDb(d, user.id));
        await supabase.from('debts').upsert(dbDebts);
      }

      // 4. Sync Savings Goals
      if (savingsGoals.length > 0) {
        const dbGoals = savingsGoals.map(g => mapSavingsGoalToDb(g, user.id));
        await supabase.from('savings_goals').upsert(dbGoals);
      }

      // 5. Sync Subscriptions
      if (subscriptions.length > 0) {
        const dbSubs = subscriptions.map(s => mapSubscriptionToDb(s, user.id));
        await supabase.from('subscriptions').upsert(dbSubs);
      }

      // 6. Sync Achievements
      if (achievements.length > 0) {
        const dbAch = achievements.map(a => mapAchievementToDb(a, user.id));
        await supabase.from('achievements').upsert(dbAch);
      }
    } catch (err) {
      console.error('Failed manual cloud sync:', err);
      throw err;
    }
  };

  const toggleTheme = () => setIsDark(prev => !prev);

  // ─── Assets CRUD ─────────────────────────────────────────────────────────
  const addAsset = async (a: Omit<Asset, 'id' | 'createdAt'>) => {
    const newA: Asset = { ...a, id: generateUUID(), createdAt: new Date().toISOString() };
    setAssets(prev => [newA, ...prev]);
    if (user) {
      try {
        await supabase.from('assets').insert({
          id: newA.id, user_id: user.id, name: newA.name, type: newA.type,
          amount: newA.amount, value_per_unit: newA.valuePerUnit,
          total_value: newA.totalValue, currency: newA.currency,
          notes: newA.notes || null, created_at: newA.createdAt,
        });
      } catch (err) { console.error('Failed to save asset:', err); }
    }
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    if (user) {
      try {
        const existing = assets.find(a => a.id === id);
        if (existing) {
          const merged = { ...existing, ...updates };
          await supabase.from('assets').upsert({
            id: merged.id, user_id: user.id, name: merged.name, type: merged.type,
            amount: merged.amount, value_per_unit: merged.valuePerUnit,
            total_value: merged.totalValue, currency: merged.currency,
            notes: merged.notes || null,
          });
        }
      } catch (err) { console.error('Failed to update asset:', err); }
    }
  };

  const deleteAsset = async (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    if (user) {
      try { await supabase.from('assets').delete().eq('id', id); }
      catch (err) { console.error('Failed to delete asset:', err); }
    }
  };

  // ─── Team Budgets CRUD ───────────────────────────────────────────────────
  const addTeamBudget = async (tb: Omit<TeamBudget, 'id' | 'createdAt'>) => {
    const newTB: TeamBudget = { ...tb, id: generateUUID(), createdAt: new Date().toISOString() };
    setTeamBudgets(prev => [newTB, ...prev]);
    if (user) {
      try {
        await supabase.from('team_budgets').insert({
          id: newTB.id, user_id: user.id, name: newTB.name,
          description: newTB.description || null,
          total_balance: newTB.totalBalance,
          members: newTB.members, color: newTB.color, icon: newTB.icon,
          created_at: newTB.createdAt,
        });
      } catch (err) { console.error('Failed to save team budget:', err); }
    }
  };

  const updateTeamBudget = async (id: string, updates: Partial<TeamBudget>) => {
    setTeamBudgets(prev => prev.map(tb => tb.id === id ? { ...tb, ...updates } : tb));
    if (user) {
      try {
        const existing = teamBudgets.find(tb => tb.id === id);
        if (existing) {
          const merged = { ...existing, ...updates };
          await supabase.from('team_budgets').upsert({
            id: merged.id, user_id: user.id, name: merged.name,
            description: merged.description || null,
            total_balance: merged.totalBalance,
            members: merged.members, color: merged.color, icon: merged.icon,
          });
        }
      } catch (err) { console.error('Failed to update team budget:', err); }
    }
  };

  const deleteTeamBudget = async (id: string) => {
    setTeamBudgets(prev => prev.filter(tb => tb.id !== id));
    if (user) {
      try { await supabase.from('team_budgets').delete().eq('id', id); }
      catch (err) { console.error('Failed to delete team budget:', err); }
    }
  };

  // ─── Projects CRUD ───────────────────────────────────────────────────────
  const addProject = async (p: Omit<Project, 'id' | 'createdAt'>) => {
    const newP: Project = { ...p, id: generateUUID(), createdAt: new Date().toISOString() };
    setProjects(prev => [newP, ...prev]);
    if (user) {
      try {
        await supabase.from('projects').insert({
          id: newP.id, user_id: user.id, name: newP.name,
          client_name: newP.clientName,
          total_budget: newP.totalBudget,
          amount_collected: newP.amountCollected,
          expenses: newP.expenses, status: newP.status,
          color: newP.color, created_at: newP.createdAt,
        });
      } catch (err) { console.error('Failed to save project:', err); }
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (user) {
      try {
        const existing = projects.find(p => p.id === id);
        if (existing) {
          const merged = { ...existing, ...updates };
          await supabase.from('projects').upsert({
            id: merged.id, user_id: user.id, name: merged.name,
            client_name: merged.clientName,
            total_budget: merged.totalBudget,
            amount_collected: merged.amountCollected,
            expenses: merged.expenses, status: merged.status, color: merged.color,
          });
        }
      } catch (err) { console.error('Failed to update project:', err); }
    }
  };

  const deleteProject = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (user) {
      try { await supabase.from('projects').delete().eq('id', id); }
      catch (err) { console.error('Failed to delete project:', err); }
    }
  };

  const balance = transactions.reduce((acc, t) => {
    if (t.type === 'income') {
      acc.income += t.amount;
      acc.current += t.amount;
    } else {
      acc.expenses += t.amount;
      acc.current -= t.amount;
    }
    return acc;
  }, { current: 0, income: 0, expenses: 0 });

  return (
    <AppContext.Provider value={{
      user, setUser,
      transactions, addTransaction, deleteTransaction,
      debts, addDebt, updateDebt, deleteDebt,
      savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
      subscriptions, addSubscription, deleteSubscription,
      achievements, triggerAchievement, notifications, markNotificationRead, clearNotifications, syncLocalToCloud,
      isDark, toggleTheme, balance,
      appConfig, updateAppConfig, addPromoCode, deletePromoCode, incrementPromoCodeUsage,
      assets, addAsset, updateAsset, deleteAsset,
      teamBudgets, addTeamBudget, updateTeamBudget, deleteTeamBudget,
      projects, addProject, updateProject, deleteProject,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
