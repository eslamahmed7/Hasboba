import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Bell, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: Props) {
  const { notifications, markNotificationRead, clearNotifications } = useApp();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 left-0 w-[85vw] max-w-sm bg-[#0b1120] border-r border-[#1f2937] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-5 py-6 border-b border-[#1f2937] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell size={24} className="text-white" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0b1120]">
                      {unreadCount}
                    </div>
                  )}
                </div>
                <h2 className="text-white font-bold text-lg">الإشعارات</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center hover:bg-[#1f2937] transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 border-b border-[#1f2937] flex justify-between items-center bg-[#111827]">
                <button
                  onClick={clearNotifications}
                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 size={14} /> مسح الكل
                </button>
                <button
                  onClick={() => notifications.forEach(n => markNotificationRead(n.id))}
                  className="text-xs font-bold text-[#4ade80] hover:text-[#22c55e] flex items-center gap-1"
                >
                  <Check size={14} /> تحديد كـ مقروء
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-5 flex flex-col gap-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                  <Bell size={48} className="text-gray-500 mb-4" />
                  <p className="text-gray-400 text-sm">لا توجد إشعارات جديدة</p>
                </div>
              ) : (
                notifications.map(n => {
                  const Icon = n.type === 'warning' ? AlertCircle : n.type === 'success' ? CheckCircle : Info;
                  const colorClass = n.type === 'warning' ? 'text-red-400 bg-red-400/10' : n.type === 'success' ? 'text-[#4ade80] bg-[#4ade80]/10' : 'text-blue-400 bg-blue-400/10';

                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative overflow-hidden rounded-2xl border transition-all ${
                        n.isRead ? 'bg-[#111827] border-[#1f2937]' : 'bg-[#1a2535] border-[#374151]'
                      }`}
                      onClick={() => !n.isRead && markNotificationRead(n.id)}
                    >
                      {!n.isRead && (
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-8 bg-[#4ade80] rounded-r-full" />
                      )}
                      <div className="p-4 flex gap-4">
                        <div className="flex-1 text-right">
                          <h4 className={`text-sm font-bold mb-1 ${n.isRead ? 'text-gray-300' : 'text-white'}`}>
                            {n.title}
                          </h4>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-gray-600 mt-2 block" style={{direction:'ltr'}}>
                            {new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                          <Icon size={20} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
