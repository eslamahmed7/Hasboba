import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Users, Plus, X, Trash2, ChevronDown, ChevronUp,
  TrendingUp, DollarSign, CheckCircle, Clock, Pause,
  UserPlus, Wallet, BarChart3, ArrowRight, Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { TeamMember, ProjectExpense } from '../types';

const projectColors = ['#4ade80', '#60a5fa', '#f97316', '#a855f7', '#ec4899', '#facc15', '#14b8a6'];

const statusConfig = {
  active:    { label: 'نشط',     color: '#4ade80', bg: '#4ade8015', icon: TrendingUp },
  completed: { label: 'مكتمل',   color: '#60a5fa', bg: '#60a5fa15', icon: CheckCircle },
  paused:    { label: 'متوقف',   color: '#facc15', bg: '#facc1515', icon: Pause },
};

export function BusinessPage() {
  const {
    projects, addProject, updateProject, deleteProject,
    teamBudgets, addTeamBudget, updateTeamBudget, deleteTeamBudget,
    user,
  } = useApp();

  const sym = user?.currency || 'EGP';
  const fmt = (n: number) => n.toLocaleString('en-US');

  // ─── Tabs ───────────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<'projects' | 'teams'>('projects');

  // ─── Project Modal ───────────────────────────────────────────────────────────
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    name: '', clientName: '', totalBudget: '', amountCollected: '',
    status: 'active' as 'active' | 'completed' | 'paused', color: '#4ade80',
  });
  const [projectExpenses, setProjectExpenses] = useState<{ label: string; amount: string }[]>([]);

  // ─── Team Modal ──────────────────────────────────────────────────────────────
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', color: '#60a5fa', icon: '👥' });
  const [teamMembers, setTeamMembers] = useState<{ name: string; contribution: string; phone: string }[]>([
    { name: '', contribution: '', phone: '' }
  ]);

  // ─── Add Expense row ─────────────────────────────────────────────────────────
  const addExpenseRow = () => setProjectExpenses(prev => [...prev, { label: '', amount: '' }]);
  const updateExpenseRow = (i: number, field: 'label' | 'amount', val: string) => {
    setProjectExpenses(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  };
  const removeExpenseRow = (i: number) => setProjectExpenses(prev => prev.filter((_, idx) => idx !== i));

  const handleAddProject = () => {
    if (!newProject.name || !newProject.totalBudget) return;
    const expenses: ProjectExpense[] = projectExpenses
      .filter(e => e.label && e.amount)
      .map(e => ({ id: crypto.randomUUID(), label: e.label, amount: parseFloat(e.amount) }));
    addProject({
      name: newProject.name,
      clientName: newProject.clientName,
      totalBudget: parseFloat(newProject.totalBudget),
      amountCollected: parseFloat(newProject.amountCollected || '0'),
      expenses,
      status: newProject.status,
      color: newProject.color,
    });
    setNewProject({ name: '', clientName: '', totalBudget: '', amountCollected: '', status: 'active', color: '#4ade80' });
    setProjectExpenses([]);
    setShowProjectModal(false);
  };

  const handleAddTeam = () => {
    if (!newTeam.name) return;
    const members: TeamMember[] = teamMembers
      .filter(m => m.name)
      .map((m, i) => ({
        id: crypto.randomUUID(),
        name: m.name,
        phone: m.phone,
        role: i === 0 ? 'owner' : 'member',
        contribution: parseFloat(m.contribution || '0'),
      }));
    const totalBalance = members.reduce((s, m) => s + m.contribution, 0);
    addTeamBudget({ name: newTeam.name, description: newTeam.description, color: newTeam.color, icon: newTeam.icon, totalBalance, members });
    setNewTeam({ name: '', description: '', color: '#60a5fa', icon: '👥' });
    setTeamMembers([{ name: '', contribution: '', phone: '' }]);
    setShowTeamModal(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-4">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center">
              <Briefcase size={16} className="text-[#4ade80]" />
            </div>
          </div>
          <h1 className="text-white font-bold text-xl">بيزنس ومشاريع</h1>
        </div>
        <p className="text-gray-500 text-xs text-right">تتبع مشاريعك وفرق العمل والمدفوعات</p>
      </div>

      {/* Section Tabs */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 bg-[#111827] border border-[#1f2937] rounded-2xl p-1">
          {[
            { id: 'projects', label: 'مشاريع العمل الحر', icon: Briefcase },
            { id: 'teams',    label: 'ميزانيات الفريق',  icon: Users },
          ].map(s => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive ? 'bg-[#4ade80] text-black shadow-[0_0_12px_rgba(74,222,128,0.3)]' : 'text-gray-500'
                }`}
              >
                <Icon size={15} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Projects Section ─────────────────────────────────────────────────── */}
      {activeSection === 'projects' && (
        <div className="px-5">
          {/* Summary Strip */}
          {projects.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: 'إجمالي التعاقدات', value: fmt(projects.reduce((s, p) => s + p.totalBudget, 0)), color: 'text-white' },
                { label: 'تم التحصيل', value: fmt(projects.reduce((s, p) => s + p.amountCollected, 0)), color: 'text-[#4ade80]' },
                { label: 'نشط', value: projects.filter(p => p.status === 'active').length.toString(), color: 'text-[#60a5fa]' },
              ].map(c => (
                <div key={c.label} className="bg-[#111827] border border-[#1f2937] rounded-2xl p-3 text-center">
                  <p className={`${c.color} font-black text-base`}>{c.value}</p>
                  <p className="text-gray-500 text-[10px] mt-1">{c.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={() => setShowProjectModal(true)}
            className="w-full mb-4 py-3.5 rounded-2xl border border-dashed border-[#4ade80]/30 bg-[#4ade80]/5 flex items-center justify-center gap-2 text-[#4ade80] text-sm font-bold hover:bg-[#4ade80]/10 transition-all"
          >
            <Plus size={18} />
            إضافة مشروع جديد
          </button>

          {/* Projects List */}
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#111827] border border-[#1f2937] flex items-center justify-center mb-4">
                <Briefcase size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-bold text-base mb-1">لا يوجد مشاريع بعد</p>
              <p className="text-gray-600 text-sm">أضف مشروعك الأول لتتبع الأرباح والمصاريف</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map((p, i) => {
                const StatusIcon = statusConfig[p.status].icon;
                const totalExp = p.expenses.reduce((s, e) => s + e.amount, 0);
                const netProfit = p.amountCollected - totalExp;
                const collectPct = p.totalBudget > 0 ? Math.min((p.amountCollected / p.totalBudget) * 100, 100) : 0;
                const isExpanded = expandedProject === p.id;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#111827] border border-[#1f2937] rounded-3xl overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => deleteProject(p.id)} className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all">
                            <Trash2 size={13} className="text-red-400" />
                          </button>
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold`} style={{ color: statusConfig[p.status].color, backgroundColor: statusConfig[p.status].bg }}>
                            <StatusIcon size={10} />
                            {statusConfig[p.status].label}
                          </div>
                        </div>
                        <div className="text-right">
                          <h3 className="text-white font-bold text-base">{p.name}</h3>
                          {p.clientName && <p className="text-gray-500 text-xs mt-0.5">العميل: {p.clientName}</p>}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">{Math.round(collectPct)}% تم التحصيل</span>
                          <span className="text-gray-400" style={{ direction: 'ltr' }}>{fmt(p.amountCollected)} / {fmt(p.totalBudget)} {sym}</span>
                        </div>
                        <div className="h-2 bg-[#1f2937] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${collectPct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex justify-between">
                        <button
                          onClick={() => setExpandedProject(isExpanded ? null : p.id)}
                          className="flex items-center gap-1 text-gray-500 text-xs hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          التفاصيل
                        </button>
                        <div className="flex items-center gap-3 text-xs">
                          <span className={netProfit >= 0 ? 'text-[#4ade80] font-bold' : 'text-red-400 font-bold'}>
                            صافي: {netProfit >= 0 ? '+' : ''}{fmt(netProfit)} {sym}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-[#1f2937] overflow-hidden"
                        >
                          <div className="p-5 space-y-3">
                            {/* Status Toggle */}
                            <div className="flex gap-2">
                              {(['active', 'completed', 'paused'] as const).map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateProject(p.id, { status: s })}
                                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                                    p.status === s ? 'border-current' : 'border-[#1f2937] text-gray-500'
                                  }`}
                                  style={p.status === s ? { color: statusConfig[s].color, borderColor: statusConfig[s].color, backgroundColor: statusConfig[s].bg } : {}}
                                >
                                  {statusConfig[s].label}
                                </button>
                              ))}
                            </div>

                            {/* Expenses List */}
                            {p.expenses.length > 0 && (
                              <div>
                                <p className="text-gray-500 text-xs mb-2 text-right">مصاريف المشروع</p>
                                {p.expenses.map(e => (
                                  <div key={e.id} className="flex justify-between items-center py-1.5 border-b border-[#1f2937] last:border-0">
                                    <span className="text-gray-400 text-xs">{fmt(e.amount)} {sym}</span>
                                    <span className="text-white text-xs font-medium">{e.label}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center pt-2">
                                  <span className="text-red-400 text-xs font-bold">- {fmt(totalExp)} {sym}</span>
                                  <span className="text-gray-500 text-xs">إجمالي المصاريف</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Teams Section ────────────────────────────────────────────────────── */}
      {activeSection === 'teams' && (
        <div className="px-5">
          {/* Add Button */}
          <button
            onClick={() => setShowTeamModal(true)}
            className="w-full mb-4 py-3.5 rounded-2xl border border-dashed border-[#60a5fa]/30 bg-[#60a5fa]/5 flex items-center justify-center gap-2 text-[#60a5fa] text-sm font-bold hover:bg-[#60a5fa]/10 transition-all"
          >
            <Plus size={18} />
            إنشاء ميزانية فريق جديدة
          </button>

          {teamBudgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#111827] border border-[#1f2937] flex items-center justify-center mb-4">
                <Users size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-bold text-base mb-1">لا توجد ميزانيات فريق</p>
              <p className="text-gray-600 text-sm">أنشئ صندوق مشترك مع أصدقائك أو عائلتك</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {teamBudgets.map((tb, i) => {
                const isExpanded = expandedTeam === tb.id;
                return (
                  <motion.div
                    key={tb.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#111827] border border-[#1f2937] rounded-3xl overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => deleteTeamBudget(tb.id)} className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all">
                            <Trash2 size={13} className="text-red-400" />
                          </button>
                          <button onClick={() => setExpandedTeam(isExpanded ? null : tb.id)} className="text-gray-500 hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold text-base">{tb.name}</h3>
                          <span className="text-2xl">{tb.icon}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 rtl:space-x-reverse">
                            {tb.members.slice(0, 3).map((m, mi) => (
                              <div key={m.id} className="w-7 h-7 rounded-full border-2 border-[#111827] flex items-center justify-center text-xs font-bold" style={{ backgroundColor: tb.color + '30', color: tb.color }}>
                                {m.name.charAt(0)}
                              </div>
                            ))}
                            {tb.members.length > 3 && <div className="w-7 h-7 rounded-full border-2 border-[#111827] bg-[#1f2937] flex items-center justify-center text-[10px] text-gray-400">+{tb.members.length - 3}</div>}
                          </div>
                          <span className="text-gray-500 text-xs">{tb.members.length} أعضاء</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-black text-lg" style={{ color: tb.color }}>{fmt(tb.totalBalance)}</p>
                          <p className="text-gray-500 text-[10px]">{sym} إجمالي</p>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-[#1f2937] overflow-hidden"
                        >
                          <div className="p-5">
                            {tb.description && <p className="text-gray-400 text-xs text-right mb-3">{tb.description}</p>}
                            <p className="text-gray-500 text-xs mb-3 text-right font-medium">مساهمات الأعضاء</p>
                            {tb.members.map(m => (
                              <div key={m.id} className="flex items-center justify-between py-2 border-b border-[#1f2937] last:border-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#4ade80] text-xs font-bold">{fmt(m.contribution)} {sym}</span>
                                  {m.role === 'owner' && <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded-full">مالك</span>}
                                </div>
                                <div className="flex items-center gap-2 text-right">
                                  <div>
                                    <p className="text-white text-sm font-bold">{m.name}</p>
                                    {m.phone && <p className="text-gray-500 text-[10px]">{m.phone}</p>}
                                  </div>
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: tb.color + '20', color: tb.color }}>
                                    {m.name.charAt(0)}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {/* Add member inline */}
                            <button
                              onClick={() => {
                                const name = prompt('اسم العضو الجديد:');
                                if (!name) return;
                                const contribution = parseFloat(prompt('مساهمة العضو:') || '0');
                                const newMember: TeamMember = { id: crypto.randomUUID(), name, role: 'member', contribution };
                                updateTeamBudget(tb.id, {
                                  members: [...tb.members, newMember],
                                  totalBalance: tb.totalBalance + contribution,
                                });
                              }}
                              className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-[#1f2937] text-gray-500 text-xs flex items-center justify-center gap-1 hover:border-[#4ade80]/30 hover:text-[#4ade80] transition-all"
                            >
                              <UserPlus size={13} />
                              إضافة عضو
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Add Project Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showProjectModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowProjectModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1120] rounded-t-[32px] border-t border-[#1f2937] max-h-[90vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex justify-center py-4"><div className="w-12 h-1.5 bg-gray-700 rounded-full" /></div>
              <div className="px-6 pb-10">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowProjectModal(false)} className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center"><X size={18} className="text-gray-400" /></button>
                  <h3 className="text-white font-bold text-lg">مشروع جديد</h3>
                  <div className="w-8" />
                </div>

                {/* Color Picker */}
                <div className="flex gap-2 flex-wrap justify-end mb-5">
                  {projectColors.map(c => (
                    <button key={c} onClick={() => setNewProject(p => ({ ...p, color: c }))}
                      className={`w-9 h-9 rounded-xl border-2 transition-all ${newProject.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>

                {[
                  { key: 'name', label: 'اسم المشروع', placeholder: 'مثال: تصميم موقع الشركة', type: 'text' },
                  { key: 'clientName', label: 'اسم العميل', placeholder: 'اختياري', type: 'text' },
                  { key: 'totalBudget', label: 'إجمالي قيمة التعاقد', placeholder: '0.00', type: 'number' },
                  { key: 'amountCollected', label: 'ما تم تحصيله حتى الآن', placeholder: '0.00', type: 'number' },
                ].map(f => (
                  <div key={f.key} className="mb-4">
                    <p className="text-gray-400 text-xs mb-2 text-right font-medium">{f.label}</p>
                    <input type={f.type} value={(newProject as any)[f.key]} onChange={e => setNewProject(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-3.5 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/40" />
                  </div>
                ))}

                {/* Status */}
                <p className="text-gray-400 text-xs mb-2 text-right font-medium">حالة المشروع</p>
                <div className="flex gap-2 mb-5">
                  {(['active', 'completed', 'paused'] as const).map(s => (
                    <button key={s} onClick={() => setNewProject(p => ({ ...p, status: s }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${newProject.status === s ? 'border-current' : 'border-[#1f2937] text-gray-500'}`}
                      style={newProject.status === s ? { color: statusConfig[s].color, borderColor: statusConfig[s].color, backgroundColor: statusConfig[s].bg } : {}}>
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>

                {/* Expenses */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={addExpenseRow} className="text-[#4ade80] text-xs font-bold flex items-center gap-1"><Plus size={13} />إضافة مصروف</button>
                    <p className="text-gray-400 text-xs font-medium">مصاريف المشروع (اختياري)</p>
                  </div>
                  {projectExpenses.map((e, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2">
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input type="text" value={e.label} onChange={ev => updateExpenseRow(idx, 'label', ev.target.value)}
                          placeholder="وصف المصروف" className="flex-1 sm:w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2 text-white text-sm text-right placeholder-gray-600 focus:outline-none" />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input type="number" value={e.amount} onChange={ev => updateExpenseRow(idx, 'amount', ev.target.value)}
                          placeholder="المبلغ" className="flex-1 sm:w-24 bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2 text-white text-sm text-right placeholder-gray-600 focus:outline-none" />
                        <button onClick={() => removeExpenseRow(idx)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0"><X size={14} className="text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handleAddProject} disabled={!newProject.name || !newProject.totalBudget}
                  className="w-full py-4 rounded-2xl bg-[#4ade80] text-black font-bold text-base shadow-[0_0_20px_rgba(74,222,128,0.3)] disabled:opacity-40 disabled:bg-[#1f2937] disabled:text-gray-500 disabled:shadow-none transition-all">
                  حفظ المشروع
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Add Team Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showTeamModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTeamModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1120] rounded-t-[32px] border-t border-[#1f2937] max-h-[90vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex justify-center py-4"><div className="w-12 h-1.5 bg-gray-700 rounded-full" /></div>
              <div className="px-6 pb-10">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowTeamModal(false)} className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center"><X size={18} className="text-gray-400" /></button>
                  <h3 className="text-white font-bold text-lg">ميزانية فريق جديدة</h3>
                  <div className="w-8" />
                </div>

                {/* Icon Picker */}
                <div className="flex gap-2 flex-wrap justify-end mb-4">
                  {['👥', '🏠', '🎉', '✈️', '💼', '🎓', '🏋️', '🍕'].map(icon => (
                    <button key={icon} onClick={() => setNewTeam(t => ({ ...t, icon }))}
                      className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center border transition-all ${newTeam.icon === icon ? 'border-[#60a5fa] bg-[#60a5fa]/10' : 'border-[#1f2937] bg-[#111827]'}`}>
                      {icon}
                    </button>
                  ))}
                </div>

                {/* Color Picker */}
                <div className="flex gap-2 flex-wrap justify-end mb-5">
                  {projectColors.map(c => (
                    <button key={c} onClick={() => setNewTeam(t => ({ ...t, color: c }))}
                      className={`w-8 h-8 rounded-xl border-2 transition-all ${newTeam.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>

                <div className="mb-4">
                  <p className="text-gray-400 text-xs mb-2 text-right font-medium">اسم الميزانية</p>
                  <input value={newTeam.name} onChange={e => setNewTeam(t => ({ ...t, name: e.target.value }))} placeholder="مثال: إجازة صيفية"
                    className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-3.5 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#60a5fa]/40" />
                </div>
                <div className="mb-5">
                  <p className="text-gray-400 text-xs mb-2 text-right font-medium">وصف (اختياري)</p>
                  <input value={newTeam.description} onChange={e => setNewTeam(t => ({ ...t, description: e.target.value }))} placeholder="ادخر معنا للرحلة..."
                    className="w-full bg-[#111827] border border-[#1f2937] rounded-xl py-3.5 px-4 text-white text-right text-sm placeholder-gray-600 focus:outline-none focus:border-[#60a5fa]/40" />
                </div>

                {/* Members */}
                <p className="text-gray-400 text-xs mb-3 text-right font-medium">أعضاء الفريق (الأول هو المالك)</p>
                {teamMembers.map((m, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2 sm:items-center">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input value={m.name} onChange={e => setTeamMembers(prev => prev.map((mem, i) => i === idx ? { ...mem, name: e.target.value } : mem))}
                        placeholder="الاسم" className="flex-1 sm:w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2 text-white text-sm text-right placeholder-gray-600 focus:outline-none" />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input value={m.contribution} onChange={e => setTeamMembers(prev => prev.map((mem, i) => i === idx ? { ...mem, contribution: e.target.value } : mem))}
                        placeholder="المبلغ" type="number" className="flex-1 sm:w-24 bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2 text-white text-sm text-right placeholder-gray-600 focus:outline-none" />
                      {idx > 0 && <button onClick={() => setTeamMembers(prev => prev.filter((_, i) => i !== idx))} className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0"><X size={14} className="text-red-400" /></button>}
                      {idx === 0 && <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0 text-sm">👑</div>}
                    </div>
                  </div>
                ))}
                <button onClick={() => setTeamMembers(prev => [...prev, { name: '', contribution: '', phone: '' }])}
                  className="w-full py-2.5 mb-5 rounded-xl border border-dashed border-[#1f2937] text-gray-500 text-xs flex items-center justify-center gap-1 hover:border-[#60a5fa]/30 hover:text-[#60a5fa] transition-all">
                  <UserPlus size={13} /> إضافة عضو آخر
                </button>

                <button onClick={handleAddTeam} disabled={!newTeam.name}
                  className="w-full py-4 rounded-2xl bg-[#60a5fa] text-black font-bold text-base shadow-[0_0_20px_rgba(96,165,250,0.3)] disabled:opacity-40 disabled:bg-[#1f2937] disabled:text-gray-500 disabled:shadow-none transition-all">
                  إنشاء الميزانية
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
