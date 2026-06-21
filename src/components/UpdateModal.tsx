import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, Star } from 'lucide-react';
import { Browser } from '@capacitor/browser';

interface UpdateModalProps {
  version: string;
  changelog: string;
  downloadUrl: string;
  onClose: () => void;
}

export function UpdateModal({ version, changelog, downloadUrl, onClose }: UpdateModalProps) {
  const handleUpdate = async () => {
    if (downloadUrl) {
      await Browser.open({ url: downloadUrl });
    }
  };

  // Convert bullet points or newlines into an array
  const changesList = changelog
    ? changelog.split('\n').filter(line => line.trim() !== '').map(line => line.replace(/^- /, '').trim())
    : [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-[360px] bg-[#0f1520] border border-[#1f2937] rounded-3xl overflow-hidden pointer-events-auto"
        >
        <div className="relative h-32 bg-gradient-to-br from-[#4ade80]/20 to-transparent flex items-center justify-center border-b border-[#1f2937]/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          <div className="w-16 h-16 rounded-full bg-[#4ade80]/20 flex items-center justify-center border border-[#4ade80]/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
            <Download size={28} className="text-[#4ade80]" />
          </div>
        </div>

        <div className="p-6 text-center">
          <h2 className="text-white font-bold text-xl mb-1">تحديث جديد متاح!</h2>
          <div className="inline-block px-3 py-1 rounded-full bg-[#1a2535] border border-[#2d3b4e] text-[#4ade80] text-xs font-bold mb-5">
            الإصدار {version}
          </div>

          {changesList.length > 0 && (
            <div className="bg-[#0b1120] rounded-2xl p-4 border border-[#1f2937] mb-6 text-right">
              <h3 className="text-gray-400 text-xs font-bold mb-3 flex items-center gap-1.5">
                <Star size={14} className="text-yellow-500" />
                المميزات الجديدة:
              </h3>
              <ul className="space-y-2">
                {changesList.map((change, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-[#4ade80] shrink-0 mt-1">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleUpdate}
            className="w-full py-3.5 rounded-2xl bg-[#4ade80] text-black font-bold shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            تحديث الآن 🚀
          </button>
          
          <button
            onClick={onClose}
            className="mt-4 text-gray-500 text-xs hover:text-white transition-colors"
          >
            لاحقاً
          </button>
        </div>
        </motion.div>
      </div>
    </>
  );
}
