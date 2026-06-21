import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Download, ChevronLeft, Calendar as CalendarIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BORDER  = '#1e3035';

const COLORS = [ACCENT, '#60a5fa', '#f97316', '#a855f7', '#ec4899', '#facc15', '#14b8a6'];

export function ReportsPage() {
  const { user, transactions, balance } = useApp();
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');

  const sym = user?.currency || 'EGP';
  const fmt = (n: number) => n.toLocaleString('en-US');

  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const topCategory = pieData[0];

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
      "التاريخ,النوع,الفئة,المبلغ,الملاحظات\n" +
      transactions.map(t => 
        `"${new Date(t.date).toLocaleDateString('ar-EG')}","${t.type === 'income' ? 'دخل' : 'مصروف'}","${t.category}","${t.amount}","${t.notes || ''}"`
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_حسبوبة_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-28">
      
      <div className="px-5 mb-4 flex items-center justify-between mt-2">
        <button onClick={handleExport}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: `rgba(0,173,181,0.1)`, border: `1px solid ${ACCENT}30` }}>
          <Download size={18} style={{ color: ACCENT }} />
        </button>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
          <select value={period} onChange={e => setPeriod(e.target.value as any)}
            className="text-xs font-bold text-white bg-transparent outline-none cursor-pointer" dir="rtl">
            <option value="month">هذا الشهر</option>
            <option value="year">هذا العام</option>
            <option value="all">كل الأوقات</option>
          </select>
          <CalendarIcon size={14} style={{ color: '#6a9ca2' }} />
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="rounded-2xl p-5" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-white font-bold text-sm text-right mb-4">تحليل المصروفات</p>
          
          {pieData.length > 0 ? (
            <>
              <div className="h-52 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-28 h-28 rounded-full absolute flex flex-col items-center justify-center" style={{ background: BG_CARD }}>
                    <p className="text-[10px]" style={{ color: '#4a7a80' }}>إجمالي المصاريف</p>
                    <p className="text-white font-black text-sm">{fmt(balance.expenses)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {pieData.map((entry, index) => {
                  const pct = Math.round((entry.value / balance.expenses) * 100);
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{fmt(entry.value)} {sym}</span>
                      <div className="flex items-center gap-2">
                        <span style={{ color: '#6a9ca2' }}>{pct}%</span>
                        <span className="text-white">{entry.name}</span>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <PieChart size={32} style={{ color: '#2d4a50' }} className="mb-2" />
              <p className="text-sm" style={{ color: '#6a9ca2' }}>لا توجد مصاريف في هذه الفترة</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'الرصيد المتاح', value: balance.current, color: balance.current >= 0 ? ACCENT : '#fb7185' },
          { label: 'الدخل', value: balance.income, color: ACCENT },
          { label: 'المصاريف', value: balance.expenses, color: '#fb7185' },
          { label: 'متوسط الدفع', value: expenses.length ? Math.round(balance.expenses / expenses.length) : 0, color: 'white' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
            <p className="text-[10px] mb-1" style={{ color: '#6a9ca2' }}>{item.label}</p>
            <p className="font-black text-base" style={{ color: item.color }}>{fmt(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="px-4 mb-8">
        <button onClick={handleExport}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)`, color: 'white', boxShadow: `0 4px 20px rgba(0,173,181,0.3)` }}>
          <Download size={18} /> تحميل تقرير كامل (CSV)
        </button>
      </div>
    </div>
  );
}
