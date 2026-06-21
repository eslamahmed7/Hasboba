import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface IncomeExpenseCardsProps {
  income: number;
  expenses: number;
}

export function IncomeExpenseCards({ income, expenses }: IncomeExpenseCardsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-4 px-6 mb-8 justify-center">
      {/* Income Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 max-w-[160px] rounded-2xl bg-[#2b4c3e] border border-[#3ff18e]/30 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3ff18e]/20 transition-colors"
        style={{ boxShadow: '0 4px 20px rgba(63,241,142,0.1)' }}
      >
        <span className="text-lg font-bold text-[#3ff18e] mb-1">{t('money.in')}</span>
        <span className="text-sm font-medium text-white mb-0.5">{t('money.in.sub')}</span>
        <span className="text-sm font-bold text-[#3ff18e]">
          {income.toLocaleString('en-US')} {t('currency')}
        </span>
      </motion.div>

      {/* Expense Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 max-w-[160px] rounded-2xl bg-[#4a342e] border border-[#f18e3f]/30 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#f18e3f]/20 transition-colors"
        style={{ boxShadow: '0 4px 20px rgba(241,142,63,0.1)' }}
      >
        <span className="text-lg font-bold text-[#f18e3f] mb-1">{t('money.out')}</span>
        <span className="text-sm font-medium text-white mb-0.5">{t('money.out.sub')}</span>
        <span className="text-sm font-bold text-[#f18e3f]">
          {expenses.toLocaleString('en-US')} {t('currency')}
        </span>
      </motion.div>
    </div>
  );
}
