import type { Category } from '../types';

export const expenseCategories: Category[] = [
  { id: '1', name: 'طعام', icon: 'utensils', color: 'bg-orange-500', type: 'expense' },
  { id: '2', name: 'مواصلات', icon: 'car', color: 'bg-blue-500', type: 'expense' },
  { id: '3', name: 'ترفيه', icon: 'gamepad-2', color: 'bg-purple-500', type: 'expense' },
  { id: '4', name: 'تسوق', icon: 'shopping-bag', color: 'bg-pink-500', type: 'expense' },
  { id: '5', name: 'صحة', icon: 'heart-pulse', color: 'bg-red-500', type: 'expense' },
  { id: '6', name: 'فواتير', icon: 'receipt', color: 'bg-yellow-500', type: 'expense' },
  { id: '7', name: 'تعليم', icon: 'graduation-cap', color: 'bg-indigo-500', type: 'expense' },
  { id: '8', name: 'هدايا', icon: 'gift', color: 'bg-rose-500', type: 'expense' },
  { id: '9', name: 'سكن', icon: 'home', color: 'bg-teal-500', type: 'expense' },
  { id: '10', name: 'شخصي', icon: 'user', color: 'bg-gray-500', type: 'expense' },
  { id: '11', name: 'استثمار', icon: 'trending-up', color: 'bg-green-500', type: 'expense' },
  { id: '12', name: 'أخرى', icon: 'more-horizontal', color: 'bg-slate-500', type: 'expense' },
];

export const incomeCategories: Category[] = [
  { id: '13', name: 'راتب', icon: 'briefcase', color: 'bg-green-500', type: 'income' },
  { id: '14', name: 'عمل حر', icon: 'laptop', color: 'bg-blue-500', type: 'income' },
  { id: '15', name: 'استثمار', icon: 'bar-chart-2', color: 'bg-purple-500', type: 'income' },
  { id: '16', name: 'هدية', icon: 'gift', color: 'bg-pink-500', type: 'income' },
  { id: '17', name: 'مكافأة', icon: 'sparkles', color: 'bg-yellow-500', type: 'income' },
  { id: '18', name: 'أخرى', icon: 'plus-circle', color: 'bg-gray-500', type: 'income' },
];

export const countries = [
  { name: 'مصر', currency: 'EGP', symbol: 'ج.م' },
  { name: 'السعودية', currency: 'SAR', symbol: '﷼' },
  { name: 'الإمارات', currency: 'AED', symbol: 'د.إ' },
  { name: 'الكويت', currency: 'KWD', symbol: 'د.ك' },
  { name: 'قطر', currency: 'QAR', symbol: 'ر.ق' },
  { name: 'البحرين', currency: 'BHD', symbol: 'د.ب' },
  { name: 'عمان', currency: 'OMR', symbol: 'ر.ع' },
  { name: 'المغرب', currency: 'MAD', symbol: 'د.م' },
];
