import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, Car, Gamepad2, ShoppingBag, HeartPulse, Receipt,
  GraduationCap, Gift, Home, User, TrendingUp, MoreHorizontal,
  Briefcase, Laptop, BarChart2, Sparkles, PlusCircle, X
} from 'lucide-react';
import { expenseCategories, incomeCategories } from '../data/mockData';
import type { Category, Transaction, FABAction } from '../types';

const iconMap: Record<string, React.ElementType> = {
  utensils: Utensils,
  car: Car,
  'gamepad-2': Gamepad2,
  'shopping-bag': ShoppingBag,
  'heart-pulse': HeartPulse,
  receipt: Receipt,
  'graduation-cap': GraduationCap,
  gift: Gift,
  home: Home,
  user: User,
  'trending-up': TrendingUp,
  'more-horizontal': MoreHorizontal,
  briefcase: Briefcase,
  laptop: Laptop,
  'bar-chart-2': BarChart2,
  sparkles: Sparkles,
  'plus-circle': PlusCircle,
};

interface TransactionModalProps {
  isOpen: boolean;
  actionType: FABAction;
  onClose: () => void;
  onSubmit: (transaction: Partial<Transaction>) => void;
  currencySymbol: string;
}

export function TransactionModal({ isOpen, actionType, onClose, onSubmit, currencySymbol }: TransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSubmit = () => {
    if (!amount || !selectedCategory) return;

    onSubmit({
      type,
      amount: parseFloat(amount),
      category: selectedCategory,
      description: description || selectedCategory,
      date: new Date().toISOString().split('T')[0],
    });

    setAmount('');
    setDescription('');
    setSelectedCategory(null);
    setShowCategories(false);
    onClose();
  };

  const renderInitialScreen = () => {
    if (actionType === 'camera') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 rounded-full bg-income/20 flex items-center justify-center mb-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Laptop size={40} className="text-income-light" />
            </motion.div>
          </div>
          <h3 className="text-lg font-semibold mb-2">مسح الفاتورة</h3>
          <p className="text-gray-400 text-center text-sm mb-4">
            استخدم الكاميرا لمسح الفاتورة وسيقوم الذكاء الاصطناعي باستخراج التفاصيل
          </p>
          <button className="btn-primary flex items-center gap-2">
            <Utensils size={18} />
            فتح الكاميرا
          </button>
          <p className="text-xs text-gray-500 mt-3">مدعوم بـ Gemini AI</p>
        </div>
      );
    }

    if (actionType === 'voice') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 rounded-full bg-expense/20 flex items-center justify-center mb-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles size={40} className="text-expense-light" />
            </motion.div>
          </div>
          <h3 className="text-lg font-semibold mb-2">إدخال صوتي</h3>
          <p className="text-gray-400 text-center text-sm mb-4">
            قل شيئاً مثل "صرفت 25 جنيه على البقالة اليوم"
          </p>
          <button className="btn-primary flex items-center gap-2 bg-gradient-to-r from-expense to-expense-light">
            <Sparkles size={18} />
            بدء الاستماع
          </button>
          <p className="text-xs text-gray-500 mt-3">مدعوم بـ Gemini AI</p>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-hidden"
          >
            <div className="glass-card rounded-b-none border-t border-white/10 max-h-[85vh] overflow-y-auto scrollbar-hide">
              {/* Handle */}
              <div className="flex justify-center py-2">
                <div className="w-12 h-1 bg-gray-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-4">
                <h2 className="text-xl font-bold">
                  {actionType === 'manual' ? 'إضافة معاملة' :
                   actionType === 'camera' ? 'مسح الفاتورة' :
                   'إدخال صوتي'}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {/* Content based on action type */}
              {actionType !== 'manual' ? (
                renderInitialScreen()
              ) : (
                <>
                  {/* Type Toggle */}
                  <div className="px-4 mb-4">
                    <div className="glass-dark rounded-xl p-1 flex">
                      <button
                        onClick={() => { setType('expense'); setSelectedCategory(null); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          type === 'expense' ? 'bg-expense text-white' : 'text-gray-400'
                        }`}
                      >
                        مصروف
                      </button>
                      <button
                        onClick={() => { setType('income'); setSelectedCategory(null); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          type === 'income' ? 'bg-income text-white' : 'text-gray-400'
                        }`}
                      >
                        دخل
                      </button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="px-4 mb-4">
                    <label className="text-sm text-gray-400 mb-2 block">المبلغ</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-dark-700 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-3xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="px-4 mb-4">
                    <label className="text-sm text-gray-400 mb-2 block">التصنيف</label>
                    <div className="grid grid-cols-4 gap-2">
                      {categories.map((category: Category) => {
                        const Icon = iconMap[category.icon] || MoreHorizontal;
                        const isSelected = selectedCategory === category.name;

                        return (
                          <motion.button
                            key={category.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedCategory(category.name);
                              if (!description) setDescription(category.name);
                            }}
                            className={`category-icon text-center transition-all ${
                              isSelected
                                ? `${category.color} text-white`
                                : 'glass-dark text-gray-400 hover:bg-white/5'
                            }`}
                          >
                            <div className={`w-10 h-10 ${isSelected ? 'bg-white/20' : category.color} rounded-xl flex items-center justify-center mb-1`}>
                              <Icon size={18} />
                            </div>
                            <span className="text-xs font-medium truncate w-full">
                              {category.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="px-4 mb-4">
                    <label className="text-sm text-gray-400 mb-2 block">الوصف</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="أضف ملاحظة..."
                      className="w-full bg-dark-700 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="px-4 pb-8">
                    <button
                      onClick={handleSubmit}
                      disabled={!amount || !selectedCategory}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                        amount && selectedCategory
                          ? type === 'income'
                            ? 'bg-gradient-to-r from-income to-income-light text-white'
                            : 'bg-gradient-to-r from-expense to-expense-light text-white'
                          : 'bg-dark-600 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      إضافة {type === 'income' ? 'دخل' : 'مصروف'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
