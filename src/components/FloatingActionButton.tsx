import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, PenLine, Camera, Mic } from 'lucide-react';
import type { FABAction } from '../types';

interface FloatingActionButtonProps {
  onAction: (action: FABAction) => void;
}

const fabItems = [
  {
    id: 'manual' as FABAction,
    icon: PenLine,
    label: 'Manual Entry',
    color: 'bg-primary-500',
    hoverColor: 'hover:bg-primary-600',
  },
  {
    id: 'camera' as FABAction,
    icon: Camera,
    label: 'Scan Receipt',
    color: 'bg-income',
    hoverColor: 'hover:bg-income-dark',
  },
  {
    id: 'voice' as FABAction,
    icon: Mic,
    label: 'Voice Entry',
    color: 'bg-expense',
    hoverColor: 'hover:bg-expense-dark',
  },
];

export function FloatingActionButton({ onAction }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleAction = (action: FABAction) => {
    onAction(action);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Action items */}
            <div className="flex flex-col-reverse items-center gap-4 mb-4">
              {fabItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 400,
                    damping: 20,
                  }}
                  onClick={() => handleAction(item.id)}
                  className={`${item.color} ${item.hoverColor} flex items-center gap-3 px-5 py-3 rounded-full shadow-lg transition-all duration-200`}
                >
                  <item.icon size={20} className="text-white" />
                  <span className="text-white font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg flex items-center justify-center group overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary-400 opacity-0 group-hover:opacity-30 transition-opacity" />

        {/* Rotating gradient border */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Plus
            size={28}
            className="text-white relative z-10 transition-transform duration-300"
          />
        </motion.div>

        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-primary-400"
        />
      </motion.button>

      {/* Subtle hint text */}
      {!isOpen && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap"
        >
          Add Transaction
        </motion.span>
      )}
    </div>
  );
}
