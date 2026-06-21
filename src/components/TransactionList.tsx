import { motion } from 'framer-motion';
import {
  Utensils, Car, Gamepad2, ShoppingBag, HeartPulse, Receipt,
  GraduationCap, Gift, Home, User, TrendingUp, MoreHorizontal,
  Briefcase, Laptop, BarChart2, Sparkles, PlusCircle, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import type { Transaction } from '../types';
import { formatCurrency, formatShortDate } from '../utils/format';

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

interface TransactionListProps {
  transactions: Transaction[];
  currencySymbol: string;
}

export function TransactionList({ transactions, currencySymbol }: TransactionListProps) {
  return (
    <div className="px-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Recent Transactions
      </h3>
      {transactions.slice(0, 6).map((transaction, index) => {
        const Icon = iconMap[transaction.category.toLowerCase()] || MoreHorizontal;
        const isIncome = transaction.type === 'income';

        return (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isIncome ? 'bg-income/20' : 'bg-expense/20'
                }`}
              >
                <Icon
                  size={20}
                  className={isIncome ? 'text-income-light' : 'text-expense-light'}
                />
              </div>
              <div>
                <p className="font-medium text-white">{transaction.description}</p>
                <p className="text-xs text-gray-400">
                  {transaction.category} • {formatShortDate(transaction.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold ${
                  isIncome ? 'text-income-light' : 'text-expense-light'
                }`}
              >
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currencySymbol)}
              </span>
              {isIncome ? (
                <ArrowDownLeft size={16} className="text-income-light" />
              ) : (
                <ArrowUpRight size={16} className="text-expense-light" />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
