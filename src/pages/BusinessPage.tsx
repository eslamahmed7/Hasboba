import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Users, Plus, X, Trash2, ChevronDown, ChevronUp,
  TrendingUp, CheckCircle, Pause, UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { TeamMember, ProjectExpense } from '../types';

// ── Theme constants ────────────────────────────────────────────────────────────
const ACCENT  = '#00adb5';
const BG_BASE = '#0b1315';
const BG_CARD = '#132226';
const BORDER  = '#1e3035';
const BG_MODAL = '#0f1d20';

const projectColors = [ACCENT, '#60a5fa', '#f97316', '#a855f7', '#ec4899', '#facc15', '#14b8a6'];

const statusConfig = {
  active:    { label: 'نشط',     color: ACCENT,    bg: `rgba(0,173,181,0.15)`, icon: TrendingUp },
  completed: { label: 'مكتمل',   color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', icon: CheckCircle },
  paused:    { label: 'متوقف',   color: '#facc15', bg: 'rgba(250,204,21,0.15)', icon: Pause },
};

export function BusinessPage() {
  const {
    projects, addProject, updateProject, deleteProject,
    teamBudgets, addTeamBudget, updateTeamBudget, deleteTeamBudget,
    user,
  } = useApp();

  const sym = user?.currency || 'EGP';
  const fmt = (n: number) => n.toLocaleString('en-US');

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<'projects' | 'teams'>('projects');

  // ── Project Modal ───────────────────────────────────────────────────────────
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [expandedProject, setExpandedProject]   = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    name: '', clientName: '', totalBudget: '', amountCollected: '',
    status: 'active' as 'active' | 'completed' | 'paused', color: ACCENT,
  });
  const [projectExpenses, setProjectExpenses] = useState<{ label: string; amount: string }[]>([]);

  // ── Team Modal ──────────────────────────────────────────────────────────────
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [expandedTeam, setExpandedTeam]   = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', color: ACCENT, icon: '👥' });
  const [teamMembers, setTeamMembers] = useState<{ name: string; contribution: string; phone: string }[]>([
    { name: '', contribution: '', phone: '' }
  ]);

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
    setNewProject({ name: '', clientName: '', totalBudget: '', amountCollected: '', status: 'active', color: ACCENT });
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
    setNewTeam({ name: '', description: '', color: ACCENT, icon: '👥' });
    setTeamMembers([{ name: '', contribution: '', phone: '' }]);
    setShowTeamModal(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-28" style={{ background: BG_BASE }}>
      
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="w-10 h-10 rounded-full flex items-center justify-center relative" style={{ background: BG_CARD }}>
          <Briefcase size={20} style={{ color: '#a0b8bc' }} />
        </div>
        <div className="text-right">
          <h1 className="text-white font-bold text-xl leading-tight">المعاملات وبيزنس</h1>
          <p className="text-xs font-medium" style={{ color: '#6a9ca2' }}>تتبع مشاريعك وفرق العمل</p>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 rounded-2xl p-1.5" style={{ background: BG_CARD }}>
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
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: isActive ? ACCENT : 'transparent',
                  color: isActive ? 'white' : '#4a7a80',
                  boxShadow: isActive ? `0 0 12px rgba(0,173,181,0.3)` : 'none',
                }}
              >
                <Icon size={15} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Projects Section ─────────────────────────────────────────────────── */}
      {activeSection === 'projects' && (
        <div className="px-4">
          {/* Summary Strip */}
          {projects.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'إجمالي التعاقدات', value: fmt(projects.reduce((s, p) => s + p.totalBudget, 0)), color: 'white' },
                { label: 'تم التحصيل',     value: fmt(projects.reduce((s, p) => s + p.amountCollected, 0)), color: ACCENT },
                { label: 'نشط',            value: projects.filter(p => p.status === 'active').length.toString(), color: '#60a5fa' },
              ].map(c => (
                <div key={c.label} className="rounded-2xl p-3 text-center" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                  <p className="font-black text-base" style={{ color: c.color }}>{c.value}</p>
                  <p className="text-[10px] mt-1" style={{ color: '#4a7a80' }}>{c.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={() => setShowProjectModal(true)}
            className="w-full mb-4 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
            style={{ border: `1.5px dashed ${ACCENT}40`, background: `rgba(0,173,181,0.05)`, color: ACCENT }}
          >
            <Plus size={18} />
            إضافة مشروع جديد
          </button>

          {/* Projects List */}
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                <Briefcase size={32} style={{ color: '#2d4a50' }} />
              </div>
              <p className="font-bold text-base mb-1" style={{ color: '#6a9ca2' }}>لا يوجد مشاريع بعد</p>
              <p className="text-sm" style={{ color: '#3a6068' }}>أضف مشروعك الأول لتتبع الأرباح والمصاريف</p>
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
                    className="rounded-3xl overflow-hidden"
                    style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => deleteProject(p.id)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all" style={{ background: 'rgba(244,63,94,0.1)' }}>
                            <Trash2 size={13} style={{ color: '#f43f5e' }} />
                          </button>
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold`} style={{ color: statusConfig[p.status].color, background: statusConfig[p.status].bg }}>
                            <StatusIcon size={10} />
                            {statusConfig[p.status].label}
                          </div>
                        </div>
                        <div className="text-right">
                          <h3 className="text-white font-bold text-base">{p.name}</h3>
                          {p.clientName && <p className="text-xs mt-0.5" style={{ color: '#4a7a80' }}>العميل: {p.clientName}</p>}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: '#4a7a80' }}>{Math.round(collectPct)}% تم التحصيل</span>
                          <span style={{ color: '#6a9ca2', direction: 'ltr' }}>{fmt(p.amountCollected)} / {fmt(p.totalBudget)} {sym}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#0b1315' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${collectPct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="h-full rounded-full"
                            style={{ background: p.color }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <button
                          onClick={() => setExpandedProject(isExpanded ? null : p.id)}
                          className="flex items-center gap-1 text-xs transition-colors"
                          style={{ color: '#6a9ca2' }}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          التفاصيل
                        </button>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-bold" style={{ color: netProfit >= 0 ? ACCENT : '#f43f5e' }}>
                            صافي: {netProfit >= 0 ? '+' : ''}{fmt(netProfit)} {sym}
                          </span>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                          style={{ borderTop: `1px solid ${BORDER}` }}
                        >
                          <div className="p-5 space-y-3">
                            {/* Status Toggle */}
                            <div className="flex gap-2">
                              {(['active', 'completed', 'paused'] as const).map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateProject(p.id, { status: s })}
                                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all border`}
                                  style={{
                                    border: p.status === s ? `1px solid ${statusConfig[s].color}` : `1px solid ${BORDER}`,
                                    color: p.status === s ? statusConfig[s].color : '#4a7a80',
                                    background: p.status === s ? statusConfig[s].bg : 'transparent'
                                  }}
                                >
                                  {statusConfig[s].label}
                                </button>
                              ))}
                            </div>

                            {/* Expenses List */}
                            {p.expenses.length > 0 && (
                              <div>
                                <p className="text-xs mb-2 text-right" style={{ color: '#4a7a80' }}>مصاريف المشروع</p>
                                {p.expenses.map(e => (
                                  <div key={e.id} className="flex justify-between items-center py-1.5 border-b last:border-0" style={{ borderColor: BORDER }}>
                                    <span className="text-xs" style={{ color: '#6a9ca2' }}>{fmt(e.amount)} {sym}</span>
                                    <span className="text-white text-xs font-medium">{e.label}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center pt-2">
                                  <span className="text-xs font-bold" style={{ color: '#f43f5e' }}>- {fmt(totalExp)} {sym}</span>
                                  <span className="text-xs" style={{ color: '#4a7a80' }}>إجمالي المصاريف</span>
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

      {/* ── Teams Section ────────────────────────────────────────────────────── */}
      {activeSection === 'teams' && (
        <div className="px-4">
          <button
            onClick={() => setShowTeamModal(true)}
            className="w-full mb-4 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
            style={{ border: `1.5px dashed rgba(96,165,250,0.4)`, background: `rgba(96,165,250,0.05)`, color: '#60a5fa' }}
          >
            <Plus size={18} />
            إنشاء ميزانية فريق جديدة
          </button>

          {teamBudgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                <Users size={32} style={{ color: '#2d4a50' }} />
              </div>
              <p className="font-bold text-base mb-1" style={{ color: '#6a9ca2' }}>لا توجد ميزانيات فريق</p>
              <p className="text-sm" style={{ color: '#3a6068' }}>أنشئ صندوق مشترك مع أصدقائك أو عائلتك</p>
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
                    className="rounded-3xl overflow-hidden"
                    style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => deleteTeamBudget(tb.id)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all" style={{ background: 'rgba(244,63,94,0.1)' }}>
                            <Trash2 size={13} style={{ color: '#f43f5e' }} />
                          </button>
                          <button onClick={() => setExpandedTeam(isExpanded ? null : tb.id)} className="transition-colors" style={{ color: '#6a9ca2' }}>
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
                            {tb.members.slice(0, 3).map((m) => (
                              <div key={m.id} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: BG_CARD, background: tb.color + '30', color: tb.color }}>
                                {m.name.charAt(0)}
                              </div>
                            ))}
                            {tb.members.length > 3 && <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px]" style={{ borderColor: BG_CARD, background: BORDER, color: '#6a9ca2' }}>+{tb.members.length - 3}</div>}
                          </div>
                          <span className="text-xs" style={{ color: '#4a7a80' }}>{tb.members.length} أعضاء</span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-lg" style={{ color: tb.color }}>{fmt(tb.totalBalance)}</p>
                          <p className="text-[10px]" style={{ color: '#4a7a80' }}>{sym} إجمالي</p>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                          style={{ borderTop: `1px solid ${BORDER}` }}
                        >
                          <div className="p-5">
                            {tb.description && <p className="text-xs text-right mb-3" style={{ color: '#6a9ca2' }}>{tb.description}</p>}
                            <p className="text-xs mb-3 text-right font-medium" style={{ color: '#4a7a80' }}>مساهمات الأعضاء</p>
                            {tb.members.map(m => (
                              <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: BORDER }}>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold" style={{ color: ACCENT }}>{fmt(m.contribution)} {sym}</span>
                                  {m.role === 'owner' && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(250,204,21,0.1)', color: '#facc15' }}>مالك</span>}
                                </div>
                                <div className="flex items-center gap-2 text-right">
                                  <div>
                                    <p className="text-white text-sm font-bold">{m.name}</p>
                                    {m.phone && <p className="text-[10px]" style={{ color: '#4a7a80' }}>{m.phone}</p>}
                                  </div>
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: tb.color + '20', color: tb.color }}>
                                    {m.name.charAt(0)}
                                  </div>
                                </div>
                              </div>
                            ))}
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
                              className="mt-3 w-full py-2.5 rounded-xl border border-dashed text-xs flex items-center justify-center gap-1 transition-all"
                              style={{ borderColor: BORDER, color: '#6a9ca2' }}
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

      {/* ── Add Project Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showProjectModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowProjectModal(false)}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
            <motion.div
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide rounded-t-[28px]"
              style={{ background: BG_MODAL, borderTop: `1px solid ${BORDER}` }}
            >
              <div className="flex justify-center py-3"><div className="w-10 h-1 rounded-full" style={{ background: '#243a3f' }} /></div>
              <div className="px-5 pb-10">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowProjectModal(false)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: BG_CARD }}>
                    <X size={18} style={{ color: '#6a9ca2' }} />
                  </button>
                  <h3 className="text-white font-bold text-lg">مشروع جديد</h3>
                  <div className="w-9" />
                </div>

                <div className="flex gap-2 flex-wrap justify-end mb-5">
                  {projectColors.map(c => (
                    <button key={c} onClick={() => setNewProject(p => ({ ...p, color: c }))}
                      className={`w-9 h-9 rounded-xl border-2 transition-all ${newProject.color === c ? 'scale-110' : ''}`}
                      style={{ backgroundColor: c, borderColor: newProject.color === c ? 'white' : 'transparent' }} />
                  ))}
                </div>

                {[
                  { key: 'name', label: 'اسم المشروع', placeholder: 'مثال: تصميم موقع الشركة', type: 'text' },
                  { key: 'clientName', label: 'اسم العميل', placeholder: 'اختياري', type: 'text' },
                  { key: 'totalBudget', label: 'إجمالي قيمة التعاقد', placeholder: '0.00', type: 'number' },
                  { key: 'amountCollected', label: 'ما تم تحصيله حتى الآن', placeholder: '0.00', type: 'number' },
                ].map(f => (
                  <div key={f.key} className="mb-4">
                    <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>{f.label}</p>
                    <input type={f.type} value={(newProject as any)[f.key]} onChange={e => setNewProject(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl py-3.5 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]"
                      style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                  </div>
                ))}

                <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>حالة المشروع</p>
                <div className="flex gap-2 mb-5">
                  {(['active', 'completed', 'paused'] as const).map(s => (
                    <button key={s} onClick={() => setNewProject(p => ({ ...p, status: s }))}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border"
                      style={{
                        border: newProject.status === s ? `1px solid ${statusConfig[s].color}` : `1px solid ${BORDER}`,
                        color: newProject.status === s ? statusConfig[s].color : '#4a7a80',
                        background: newProject.status === s ? statusConfig[s].bg : 'transparent'
                      }}>
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={addExpenseRow} className="text-xs font-bold flex items-center gap-1" style={{ color: ACCENT }}><Plus size={13} />إضافة مصروف</button>
                    <p className="text-xs font-medium" style={{ color: '#4a7a80' }}>مصاريف المشروع (اختياري)</p>
                  </div>
                  {projectExpenses.map((e, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2">
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input type="text" value={e.label} onChange={ev => updateExpenseRow(idx, 'label', ev.target.value)}
                          placeholder="وصف المصروف" className="flex-1 sm:w-full rounded-xl px-3 py-2 text-sm text-right focus:outline-none placeholder-[#3a6068]" style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input type="number" value={e.amount} onChange={ev => updateExpenseRow(idx, 'amount', ev.target.value)}
                          placeholder="المبلغ" className="flex-1 sm:w-24 rounded-xl px-3 py-2 text-sm text-right focus:outline-none placeholder-[#3a6068]" style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                        <button onClick={() => removeExpenseRow(idx)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(244,63,94,0.1)' }}>
                          <X size={14} style={{ color: '#f43f5e' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handleAddProject} disabled={!newProject.name || !newProject.totalBudget}
                  className="w-full py-4 rounded-2xl font-bold text-base transition-all"
                  style={{
                    background: newProject.name && newProject.totalBudget ? `linear-gradient(135deg, ${ACCENT} 0%, #008891 100%)` : BG_CARD,
                    color: newProject.name && newProject.totalBudget ? 'white' : '#3a6068',
                    boxShadow: newProject.name && newProject.totalBudget ? `0 4px 20px rgba(0,173,181,0.3)` : 'none'
                  }}>
                  حفظ المشروع
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Add Team Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showTeamModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTeamModal(false)}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
            <motion.div
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto scrollbar-hide rounded-t-[28px]"
              style={{ background: BG_MODAL, borderTop: `1px solid ${BORDER}` }}
            >
              <div className="flex justify-center py-3"><div className="w-10 h-1 rounded-full" style={{ background: '#243a3f' }} /></div>
              <div className="px-5 pb-10">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowTeamModal(false)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: BG_CARD }}>
                    <X size={18} style={{ color: '#6a9ca2' }} />
                  </button>
                  <h3 className="text-white font-bold text-lg">ميزانية فريق جديدة</h3>
                  <div className="w-9" />
                </div>

                <div className="flex gap-2 flex-wrap justify-end mb-4">
                  {['👥', '🏠', '🎉', '✈️', '💼', '🎓', '🏋️', '🍕'].map(icon => (
                    <button key={icon} onClick={() => setNewTeam(t => ({ ...t, icon }))}
                      className="w-11 h-11 rounded-2xl text-xl flex items-center justify-center transition-all"
                      style={{
                        background: newTeam.icon === icon ? `rgba(96,165,250,0.15)` : BG_CARD,
                        border: `1px solid ${newTeam.icon === icon ? '#60a5fa' : BORDER}`
                      }}>
                      {icon}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap justify-end mb-5">
                  {projectColors.map(c => (
                    <button key={c} onClick={() => setNewTeam(t => ({ ...t, color: c }))}
                      className={`w-8 h-8 rounded-xl border-2 transition-all ${newTeam.color === c ? 'scale-110' : ''}`}
                      style={{ backgroundColor: c, borderColor: newTeam.color === c ? 'white' : 'transparent' }} />
                  ))}
                </div>

                <div className="mb-4">
                  <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>اسم الميزانية</p>
                  <input value={newTeam.name} onChange={e => setNewTeam(t => ({ ...t, name: e.target.value }))} placeholder="مثال: إجازة صيفية"
                    className="w-full rounded-xl py-3.5 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]" style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                </div>
                <div className="mb-5">
                  <p className="text-xs mb-2 text-right font-medium" style={{ color: '#6a9ca2' }}>وصف (اختياري)</p>
                  <input value={newTeam.description} onChange={e => setNewTeam(t => ({ ...t, description: e.target.value }))} placeholder="ادخر معنا للرحلة..."
                    className="w-full rounded-xl py-3.5 px-4 text-sm text-right focus:outline-none placeholder-[#3a6068]" style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                </div>

                <p className="text-xs mb-3 text-right font-medium" style={{ color: '#4a7a80' }}>أعضاء الفريق (الأول هو المالك)</p>
                {teamMembers.map((m, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2 sm:items-center">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input value={m.name} onChange={e => setTeamMembers(prev => prev.map((mem, i) => i === idx ? { ...mem, name: e.target.value } : mem))}
                        placeholder="الاسم" className="flex-1 sm:w-full rounded-xl px-3 py-2 text-sm text-right focus:outline-none placeholder-[#3a6068]" style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input value={m.contribution} onChange={e => setTeamMembers(prev => prev.map((mem, i) => i === idx ? { ...mem, contribution: e.target.value } : mem))}
                        placeholder="المبلغ" type="number" className="flex-1 sm:w-24 rounded-xl px-3 py-2 text-sm text-right focus:outline-none placeholder-[#3a6068]" style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: 'white' }} />
                      {idx > 0 && <button onClick={() => setTeamMembers(prev => prev.filter((_, i) => i !== idx))} className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(244,63,94,0.1)' }}><X size={14} style={{ color: '#f43f5e' }} /></button>}
                      {idx === 0 && <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-sm" style={{ background: 'rgba(250,204,21,0.1)' }}>👑</div>}
                    </div>
                  </div>
                ))}
                <button onClick={() => setTeamMembers(prev => [...prev, { name: '', contribution: '', phone: '' }])}
                  className="w-full py-2.5 mb-5 rounded-xl border border-dashed text-xs flex items-center justify-center gap-1 transition-all" style={{ borderColor: BORDER, color: '#60a5fa' }}>
                  <UserPlus size={13} /> إضافة عضو آخر
                </button>

                <button onClick={handleAddTeam} disabled={!newTeam.name}
                  className="w-full py-4 rounded-2xl font-bold text-base transition-all"
                  style={{
                    background: newTeam.name ? `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)` : BG_CARD,
                    color: newTeam.name ? 'white' : '#3a6068',
                    boxShadow: newTeam.name ? `0 4px 20px rgba(59,130,246,0.3)` : 'none'
                  }}>
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
