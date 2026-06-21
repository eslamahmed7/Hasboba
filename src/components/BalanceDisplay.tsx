import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface BalanceDisplayProps {
  balance: number;
  currencySymbol: string;
}

export function BalanceDisplay({ balance }: BalanceDisplayProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center py-6">
      <h2 className="text-2xl font-bold text-white mb-8">{t('vault.title')}</h2>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative flex items-center justify-center w-56 h-56"
      >
        {/* Outer subtle glow */}
        <div className="absolute inset-0 rounded-full bg-[#3ff18e] opacity-10 blur-3xl scale-150" />

        {/* Central glowing neon ring */}
        <div 
          className="absolute inset-0 rounded-full border-[6px] border-[#3ff18e] shadow-[0_0_30px_rgba(63,241,142,0.6),inset_0_0_20px_rgba(63,241,142,0.4)]"
          style={{ boxShadow: '0 0 30px rgba(63,241,142,0.6), inset 0 0 20px rgba(63,241,142,0.4)' }}
        />

        {/* Inner content */}
        <div className="relative flex flex-col items-center justify-center z-10">
          <span className="text-4xl font-bold text-white mb-2">
            {balance.toLocaleString('en-US')}
          </span>
          <span className="text-sm text-gray-400 font-medium">
            {t('currency')}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
