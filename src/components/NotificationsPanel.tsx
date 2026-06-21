import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

// ── Theme constants ────────────────────────────────────────────────────────────
const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BORDER  = '#1e3035';
const BG_MODAL = '#0f1d20';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: Props) {
  const { notifications, markNotificationRead, clearNotifications } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <ShieldAlert size={16} style={{ color: '#f43f5e' }} />;
      case 'info': return <Activity size={16} style={{ color: '#60a5fa' }} />;
      case 'success': return <Check size={16} style={{ color: '#34d399' }} />;
      case 'ai': return <Sparkles size={16} style={{ color: ACCENT }} />;
      default: return <Bell size={16} style={{ color: '#6a9ca2' }} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'alert': return 'rgba(244,63,94,0.15)';
      case 'info': return 'rgba(96,165,250,0.15)';
      case 'success': return 'rgba(52,211,153,0.15)';
      case 'ai': return `rgba(0,173,181,0.15)`;
      default: return BG_CARD;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm z-50 flex flex-col"
            style={{ background: BG_MODAL, borderLeft: `1px solid ${BORDER}` }}>
            
            <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${BORDER}`, background: BG_CARD }}>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: BG_BASE, color: '#6a9ca2' }}>
                <X size={16} />
              </button>
              <h2 className="text-white font-bold text-lg">الإشعارات</h2>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3" style={{ background: BG_BASE }}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                    <Bell size={24} style={{ color: '#2d4a50' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#6a9ca2' }}>لا توجد إشعارات جديدة</p>
                </div>
              ) : (
                notifications.map(n => (
                  <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => markNotificationRead(n.id)}
                    className="p-4 rounded-2xl cursor-pointer transition-all border"
                    style={{
                      background: n.isRead ? BG_CARD : `rgba(0,173,181,0.05)`,
                      borderColor: n.isRead ? BORDER : `rgba(0,173,181,0.2)`
                    }}>
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-[10px]" style={{ color: '#4a7a80' }}>
                        {new Date(n.createdAt).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white text-sm font-bold text-right">{n.title}</h4>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: getColor(n.type) }}>
                          {getIcon(n.type)}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-right leading-relaxed" style={{ color: '#a0b8bc' }}>{n.message}</p>
                  </motion.div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4" style={{ borderTop: `1px solid ${BORDER}`, background: BG_CARD }}>
                <button onClick={clearNotifications}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
                  style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e' }}>
                  <Trash2 size={16} /> مسح كل الإشعارات
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
