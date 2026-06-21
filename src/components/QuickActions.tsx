import { motion } from 'framer-motion';
import { CreditCard, Repeat, HelpCircle, BarChart3 } from 'lucide-react';

const quickActions = [
  { icon: CreditCard, label: 'Subscriptions', color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
  { icon: BarChart3, label: 'Reports', color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
  { icon: Repeat, label: 'Recurring', color: 'bg-green-500/20', iconColor: 'text-green-400' },
  { icon: HelpCircle, label: 'AI Help', color: 'bg-orange-500/20', iconColor: 'text-orange-400' },
];

export function QuickActions() {
  return (
    <div className="px-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Quick Actions
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass flex flex-col items-center justify-center py-4 rounded-2xl hover:bg-white/10 transition-all"
          >
            <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-2`}>
              <action.icon size={20} className={action.iconColor} />
            </div>
            <span className="text-xs text-gray-400 font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
