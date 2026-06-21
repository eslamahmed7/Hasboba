export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  icon?: string;
}

export interface Debt {
  id: string;
  contactName: string;
  phone?: string;
  amount: number;
  dueDate: string;
  type: 'owed' | 'owe';
  isPaid: boolean;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  deadline?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDate: string;
  icon: string;
  color: string;
  category: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earned: boolean;
  earnedDate?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  isRead: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  currency: string;
  currencySymbol: string;
  payday: number;
  theme: 'dark' | 'light';
  aiTone?: 'professional' | 'friendly' | 'strict';
  aiDetailLevel?: 'brief' | 'detailed';
  plan?: 'free' | 'pro';
  isAdmin?: boolean;
}

// ─── NEW: 5-Tab Layout Types ─────────────────────────────────────────────────

export type TabType = 'dashboard' | 'business' | 'social' | 'assets' | 'analytics';
export type FABAction = 'income' | 'expense' | 'manual' | 'camera' | 'voice' | null;

// Asset tracking (gold, certificates, forex, etc.)
export interface Asset {
  id: string;
  name: string;
  type: 'gold' | 'certificate' | 'forex' | 'stocks' | 'other';
  amount: number;        // quantity / units
  valuePerUnit: number;  // price per unit in user currency
  totalValue: number;    // amount * valuePerUnit
  currency: string;
  notes?: string;
  createdAt: string;
}

// Team Budget member
export interface TeamMember {
  id: string;
  name: string;
  phone?: string;
  role: 'owner' | 'member';
  contribution: number;
}

// Team Budget (group fund)
export interface TeamBudget {
  id: string;
  name: string;
  description?: string;
  totalBalance: number;
  members: TeamMember[];
  createdAt: string;
  color: string;
  icon: string;
}

// Freelance/Project tracking
export interface ProjectExpense {
  id: string;
  label: string;
  amount: number;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  totalBudget: number;       // total contract value
  amountCollected: number;   // payments received so far
  expenses: ProjectExpense[];
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  color: string;
}

// ─── Promo & Config ──────────────────────────────────────────────────────────

export interface PromoCode {
  id: string;
  code: string;
  discountPercentage: number;
  expiresAt: string;
  isActive: boolean;
  usageLimit?: number | null;
  usageCount: number;
}

export interface AppConfig {
  aiSubscriptionPrice: number;
  aiSubscriptionDiscountPrice: number | null;
  promoCodes: PromoCode[];
}
