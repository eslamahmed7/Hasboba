import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingDown, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const categoryColors: Record<string, string> = {
  'طعام': '#f97316', 'مواصلات': '#3b82f6', 'ترفيه': '#a855f7',
  'تسوق': '#ec4899', 'صحة': '#ef4444', 'فواتير': '#eab308',
  'تعليم': '#6366f1', 'هدايا': '#f43f5e', 'سكن': '#14b8a6',
  'شخصي': '#6b7280', 'استثمار': '#22c55e', 'أخرى': '#64748b',
  'راتب': '#22c55e', 'عمل حر': '#3b82f6', 'هدية': '#ec4899',
  'مكافأة': '#eab308',
};

export function ReportsPage() {
  const { transactions, balance, user } = useApp();
  const reportRef = useRef<HTMLDivElement>(null);
  const sym = user?.currency || 'EGP';
  const formatNum = (n: number) => n.toLocaleString('en-US');

  const spending: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    spending[t.category] = (spending[t.category] || 0) + t.amount;
  });

  const totalExpenses = balance.expenses || 0;
  const categories = Object.entries(spending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Build conic gradient for donut
  let cumulative = 0;
  const segments = categories.map(([cat, amount]) => {
    const pct = totalExpenses > 0 ? (amount / totalExpenses) * 360 : 0;
    const start = cumulative;
    cumulative += pct;
    return { cat, amount, start, end: cumulative, color: categoryColors[cat] || '#64748b' };
  });

  const conicGradient = segments.length > 0
    ? `conic-gradient(${segments.map(s => `${s.color} ${s.start}deg ${s.end}deg`).join(', ')})`
    : `conic-gradient(#1f2937 0deg 360deg)`;

  const exportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0d13',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      const isApp = (window as any).Capacitor;
      if (isApp && navigator.canShare) {
        const blob = pdf.output('blob');
        const file = new File([blob], 'hasboba-report.pdf', { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'تقرير حسبوبة المالي' });
          return;
        }
      }
      pdf.save('hasboba-report.pdf');
    } catch (err: any) {
      alert('خطأ في تصدير PDF: ' + (err?.message || err));
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-4">
      <div ref={reportRef} className="bg-[#0a0d13]">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2">
            <ChevronDown size={14} className="text-gray-400" />
            <span className="text-white text-xs font-medium">هذا الشهر</span>
          </div>
          <h1 className="text-white font-bold text-base">التقارير</h1>
        </div>

        {/* Donut chart */}
        <div className="px-5 mb-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
            <h2 className="text-white font-bold text-sm text-right mb-4">المصاريف حسب الفئة</h2>

            {totalExpenses === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <TrendingDown size={32} className="text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm">لا توجد مصاريف بعد</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-5 relative">
                  <div
                    className="w-44 h-44 rounded-full relative flex items-center justify-center"
                    style={{ background: conicGradient }}
                  >
                    <div className="w-28 h-28 bg-[#111827] rounded-full absolute flex flex-col items-center justify-center">
                      <span className="text-white font-black text-lg">{formatNum(totalExpenses)}</span>
                      <span className="text-gray-500 text-xs">{sym}</span>
                    </div>
                  </div>
                </div>

                {/* Legend with percentages */}
                <div className="flex flex-col gap-2">
                  {categories.map(([cat, amt]) => {
                    const pct = Math.round((amt / totalExpenses) * 100);
                    const color = categoryColors[cat] || '#64748b';
                    return (
                      <div key={cat} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs font-medium w-8 text-right">{formatNum(amt)}</span>
                          <span className="text-gray-500 text-xs">{sym}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-gray-400 text-xs">{pct}%</span>
                              <span className="text-white text-xs font-medium">{cat}</span>
                            </div>
                            {/* Mini progress bar */}
                            <div className="h-1 bg-[#1f2937] rounded-full mt-1 w-32">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="px-5 grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'الرصيد', value: balance.current, color: 'text-white' },
            { label: 'الدخل', value: balance.income, color: 'text-[#4ade80]' },
            { label: 'المصاريف', value: balance.expenses, color: 'text-red-400' },
          ].map(item => (
            <div key={item.label} className="bg-[#111827] border border-[#1f2937] rounded-2xl p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">{item.label}</p>
              <p className={`${item.color} font-black text-sm`}>{formatNum(item.value)}</p>
              <p className="text-gray-600 text-xs">{sym}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export PDF Button */}
      <div className="px-5 mt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={exportPDF}
          className="w-full py-4 rounded-2xl bg-[#4ade80] text-black font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.3)]"
        >
          <Download size={20} />
          تصدير تقرير PDF
        </motion.button>
      </div>
    </div>
  );
}
