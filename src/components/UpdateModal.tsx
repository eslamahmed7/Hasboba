import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Star } from 'lucide-react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

interface UpdateModalProps {
  version: string;
  changelog: string;
  downloadUrl: string;
  onClose: () => void;
}

export function UpdateModal({ version, changelog, downloadUrl, onClose }: UpdateModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (!downloadUrl) return;

    if (!Capacitor.isNativePlatform()) {
      // Fallback on web browser: open download URL in a new browser tab
      await Browser.open({ url: downloadUrl });
      return;
    }

    try {
      setIsDownloading(true);
      setErrorMsg(null);
      setDownloadProgress(0);

      // Add a listener to track the download progress percentage (0-100)
      const progressListener = await CapacitorUpdater.addListener('download', (event) => {
        setDownloadProgress(event.percent);
      });

      // 1. Download the zipped web bundle from downloadUrl
      const result = await CapacitorUpdater.download({
        url: downloadUrl,
        version: version,
      });

      // Cleanup listener after download is finished
      progressListener.remove();

      // 2. Apply the update bundle and reload the webview
      await CapacitorUpdater.set(result);

      // Fallback reload just in case the native restart wasn't immediate
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to apply Live Update:', err);
      setErrorMsg(err.message || 'فشل تثبيت التحديث تلقائياً. يرجى المحاولة مرة أخرى.');
      setIsDownloading(false);
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
        onClick={isDownloading ? undefined : onClose}
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
          {!isDownloading && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <div className="w-16 h-16 rounded-full bg-[#4ade80]/20 flex items-center justify-center border border-[#4ade80]/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
            {isDownloading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              >
                <Download size={28} className="text-[#4ade80]" />
              </motion.div>
            ) : (
              <Download size={28} className="text-[#4ade80]" />
            )}
          </div>
        </div>

        <div className="p-6 text-center">
          <h2 className="text-white font-bold text-xl mb-1">
            {isDownloading ? 'جاري تنزيل التحديث الفوري' : 'تحديث جديد متاح!'}
          </h2>
          <div className="inline-block px-3 py-1 rounded-full bg-[#1a2535] border border-[#2d3b4e] text-[#4ade80] text-xs font-bold mb-5">
            الإصدار {version}
          </div>

          {errorMsg ? (
            <div className="bg-[#ef4444]/10 rounded-2xl p-4 border border-[#ef4444]/30 mb-2 text-right">
              <p className="text-sm text-[#f87171] mb-4 text-center">{errorMsg}</p>
              <button
                onClick={handleUpdate}
                className="w-full py-3 rounded-xl bg-[#ef4444] text-white font-bold text-sm hover:bg-[#dc2626] transition-colors"
              >
                إعادة المحاولة 🔄
              </button>
              <button
                onClick={onClose}
                className="w-full mt-2 py-2 text-gray-400 text-xs hover:text-white transition-colors text-center"
              >
                إلغاء
              </button>
            </div>
          ) : isDownloading ? (
            <div className="bg-[#0b1120] rounded-2xl p-5 border border-[#1f2937] mb-2 text-center">
              <p className="text-sm text-gray-300 mb-3 font-semibold">
                تحميل ملفات البرمجة... {downloadProgress}%
              </p>
              <div className="w-full bg-[#1a2535] border border-[#2d3b4e] h-3 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] shadow-[0_0_12px_rgba(74,222,128,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                يرجى عدم إغلاق التطبيق. سيتم إعادة تشغيل الشاشة تلقائياً فور اكتمال التحديث وتطبيق الأكواد الجديدة.
              </p>
            </div>
          ) : (
            <>
              {changesList.length > 0 && (
                <div className="bg-[#0b1120] rounded-2xl p-4 border border-[#1f2937] mb-6 text-right">
                  <h3 className="text-gray-400 text-xs font-bold mb-3 flex items-center gap-1.5 justify-end">
                    <span>المميزات الجديدة:</span>
                    <Star size={14} className="text-yellow-500" />
                  </h3>
                  <ul className="space-y-2">
                    {changesList.map((change, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300 justify-end">
                        <span className="text-right">{change}</span>
                        <span className="text-[#4ade80] shrink-0 mt-1">•</span>
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
            </>
          )}
        </div>
        </motion.div>
      </div>
    </>
  );
}
