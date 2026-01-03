
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { LevelData, UserProfile } from '../types';
import { playCelebrationSound, playPositiveSound } from '../services/audioService';
import { 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { FixedSizeList as List } from 'react-window';

interface DashboardProps {
  user: UserProfile;
  levels: LevelData[];
  onSelectLevel: (id: number) => void;
  onShowCertificate: () => void;
  onLogout?: () => void;
  onOpenProAnalytics?: () => void;
  onStartAssessment?: () => void;
}

interface LayoutItem {
  id: 'welcome' | 'progress' | 'levels' | 'profile_stats';
  visible: boolean;
  label: string;
  icon: string;
}

interface CardTheme {
  id: string;
  bg: string;
  accent: string;
  border: string;
  dot: string;
  hover: string;
  label: string;
  glow: string;
  primary: string;
  colorHex: string;
}

const CARD_THEMES: Record<string, CardTheme> = {
  blue: { id: 'blue', label: 'الأزرق الملكي', bg: 'bg-blue-50/30', accent: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-500', hover: 'hover:border-blue-400', glow: 'rgba(59, 130, 246, 0.5)', primary: 'bg-blue-600', colorHex: '#2563eb' },
  emerald: { id: 'emerald', label: 'الأخضر الحيوي', bg: 'bg-emerald-50/30', accent: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500', hover: 'hover:border-emerald-400', glow: 'rgba(16, 185, 129, 0.5)', primary: 'bg-emerald-600', colorHex: '#059669' },
  rose: { id: 'rose', label: 'الوردي الطموح', bg: 'bg-rose-50/30', accent: 'text-rose-600', border: 'border-rose-100', dot: 'bg-rose-500', hover: 'hover:border-rose-400', glow: 'rgba(244, 63, 94, 0.5)', primary: 'bg-rose-600', colorHex: '#e11d48' },
  amber: { id: 'amber', label: 'الذهبي المشرق', bg: 'bg-amber-50/30', accent: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-500', hover: 'hover:border-amber-400', glow: 'rgba(245, 158, 11, 0.5)', primary: 'bg-amber-600', colorHex: '#d97706' },
  indigo: { id: 'indigo', label: 'الأرجواني العميق', bg: 'bg-indigo-50/30', accent: 'text-indigo-600', border: 'border-indigo-100', dot: 'bg-indigo-500', hover: 'hover:border-indigo-400', glow: 'rgba(99, 102, 241, 0.5)', primary: 'bg-indigo-600', colorHex: '#4f46e5' },
  violet: { id: 'violet', label: 'البنفسجي الإبداعي', bg: 'bg-violet-50/30', accent: 'text-violet-600', border: 'border-violet-100', dot: 'bg-violet-500', hover: 'hover:border-violet-400', glow: 'rgba(139, 92, 246, 0.5)', primary: 'bg-violet-600', colorHex: '#7c3aed' },
  slate: { id: 'slate', label: 'الرمادي الهادئ', bg: 'bg-slate-50/50', accent: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-600', hover: 'hover:border-slate-400', glow: 'rgba(71, 85, 105, 0.5)', primary: 'bg-slate-800', colorHex: '#334155' },
};

const DEFAULT_LAYOUT: LayoutItem[] = [
  { id: 'welcome', visible: true, label: 'قسم الترحيب', icon: '👋' },
  { id: 'profile_stats', visible: true, label: 'بيانات الحساب', icon: '👤' },
  { id: 'progress', visible: true, label: 'تحليل الإنجاز', icon: '📈' },
  { id: 'levels', visible: true, label: 'مستويات المسرعة', icon: '🚀' },
];

const RadialProgress: React.FC<{ progress: number; theme: CardTheme; isDark: boolean; size?: number }> = ({ progress, theme, isDark, size = 220 }) => {
  const data = useMemo(() => [
    { name: 'Completed', value: progress }, 
    { name: 'Remaining', value: 100 - progress }
  ], [progress]);
  
  return (
    <div className="relative flex items-center justify-center animate-fade-in mx-auto" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={size * 0.3} outerRadius={size * 0.4} paddingAngle={5} dataKey="value" startAngle={90} endAngle={450} stroke="none">
            <Cell fill={theme.colorHex} />
            <Cell fill={isDark ? "#1e293b" : "#f1f5f9"} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className={`text-4xl font-black ${theme.accent} tabular-nums transition-colors duration-500`}>{Math.round(progress)}%</span>
        <span className={`text-[8px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mt-1`}>اكتمال المسار</span>
      </div>
    </div>
  );
};

const PathTrend: React.FC<{ levels: LevelData[]; theme: CardTheme; isDark: boolean }> = ({ levels, theme, isDark }) => {
  const chartData = useMemo(() => levels.map(l => ({ name: `L${l.id}`, status: l.isCompleted ? 100 : l.isLocked ? 0 : 25, fullLabel: l.title })), [levels]);
  return (
    <div className={`w-full h-[100px] ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'} rounded-2xl border p-2 relative overflow-hidden group`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs><linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={theme.colorHex} stopOpacity={0.3}/><stop offset="95%" stopColor={theme.colorHex} stopOpacity={0}/></linearGradient></defs>
          <Tooltip content={({ active, payload }) => (active && payload?.length ? <div className={`${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'} p-3 rounded-xl border shadow-xl text-right`}><p className="text-xs font-black mb-1">{payload[0].payload.fullLabel}</p><p className="text-[10px] font-bold text-blue-600">الحالة: {payload[0].value === 100 ? 'مكتمل' : 'قيد العمل'}</p></div> : null)} />
          <Area type="monotone" dataKey="status" stroke={theme.colorHex} strokeWidth={3} fillOpacity={1} fill="url(#colorStatus)" animationDuration={1000} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const LevelCard = React.memo<{
  level: LevelData;
  isDark: boolean;
  activeTheme: CardTheme;
  levelThemes: Record<number, string>;
  openThemePicker: number | null;
  onSetLevelTheme: (levelId: number, themeId: string) => void;
  onToggleThemePicker: (id: number) => void;
  onSelectLevel: (id: number) => void;
  idx: number;
}>(({ level, isDark, activeTheme, levelThemes, openThemePicker, onSetLevelTheme, onToggleThemePicker, onSelectLevel, idx }) => {
  return (
    <div 
      onClick={() => !level.isLocked && onSelectLevel(level.id)} 
      className={`relative rounded-[2rem] p-6 transition-all duration-500 flex flex-col group animate-fade-in-up h-full ${level.isLocked ? (isDark ? 'bg-slate-900/50 border-slate-800 opacity-60 grayscale' : 'bg-slate-50 border-slate-100 opacity-80 grayscale') : `${isDark ? 'bg-slate-900 border-slate-800' : `${activeTheme.bg} bg-white border ${activeTheme.border}`} shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer active:scale-95`} ${level.isLocked ? 'cursor-not-allowed' : ''}`} 
      style={{ animationDelay: `${idx * 0.05}s` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${level.isLocked ? (isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400') : level.isCompleted ? (isDark ? 'bg-green-900/50 text-green-500 shadow-lg' : 'bg-green-100 text-green-600 shadow-lg shadow-green-50') : `${activeTheme.bg.replace('/30', '')} ${activeTheme.accent} shadow-lg`}`}>{level.id}</div>
        {!level.isLocked && (
          <div className="relative theme-picker-container" onClick={e => e.stopPropagation()}>
            <button onClick={() => onToggleThemePicker(level.id)} className={`p-1.5 rounded-lg ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-500' : 'bg-white/50 hover:bg-white text-slate-400'} transition-all border border-transparent hover:border-slate-100`} title="تخصيص">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.828 2.828a2 2 0 010 2.828l-8.486 8.486L5 21" /></svg>
            </button>
            {openThemePicker === level.id && (
              <div className={`absolute left-0 top-full mt-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-xl shadow-2xl border p-2 z-30 flex gap-1 animate-fade-in origin-top-left`}>
                {Object.values(CARD_THEMES).map(t => (
                  <button key={t.id} onClick={() => onSetLevelTheme(level.id, t.id)} className={`w-6 h-6 rounded-full transition-transform hover:scale-125 border-2 ${t.dot} ${levelThemes[level.id] === t.id ? 'ring-2 ring-offset-2 ring-slate-500' : 'border-transparent'}`} />
                ))}
              </div>
            )}
          </div>
        )}
        {level.isCompleted && <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
      </div>
      <h3 className={`text-xl font-black mb-2 transition-colors ${level.isLocked ? (isDark ? 'text-slate-700' : 'text-slate-400') : `${isDark ? 'text-white' : 'text-slate-900'} group-hover:${activeTheme.accent}`}`}>{level.title}</h3>
      <p className={`text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-6 leading-relaxed flex-grow line-clamp-2`}>{level.description}</p>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
             <span className={level.isLocked ? (isDark ? 'text-slate-800' : 'text-slate-300') : (isDark ? 'text-slate-500' : 'text-slate-400')}>التقدم</span>
             <span className={level.isLocked ? (isDark ? 'text-slate-800' : 'text-slate-300') : activeTheme.accent}>{level.isCompleted ? 100 : 0}%</span>
          </div>
          <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-1 rounded-full overflow-hidden`}>
             <div className={`h-full rounded-full transition-all duration-1000 ${level.isCompleted ? 'bg-green-500' : `${activeTheme.dot} opacity-40`}`} style={{ width: `${level.isCompleted ? 100 : 0}%` }}></div>
          </div>
        </div>
        <div className={`w-full py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${!level.isLocked && !level.isCompleted ? (isDark ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700' : 'bg-slate-900 text-white') : (isDark ? 'bg-slate-900/50 text-slate-800' : 'bg-slate-100 text-slate-300')}`}>
          {!level.isLocked && !level.isCompleted ? 'ابدأ الآن' : level.isCompleted ? 'مكتمل ✅' : 'مغلق'}
        </div>
      </div>
    </div>
  );
});

export const Dashboard: React.FC<DashboardProps> = ({ user, levels, onSelectLevel, onShowCertificate, onLogout, onOpenProAnalytics, onStartAssessment }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openThemePicker, setOpenThemePicker] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const levelsContainerRef = useRef<HTMLDivElement>(null);
  
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('dashboard_theme_mode') as 'light' | 'dark') || 'light';
  });

  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    const saved = localStorage.getItem('dashboard_layout_v2');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  const [globalThemeId, setGlobalThemeId] = useState<string>(() => localStorage.getItem('dashboard_global_theme') || 'blue');
  const [levelThemes, setLevelThemes] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('dashboard_level_themes');
    return saved ? JSON.parse(saved) : {};
  });

  const activeGlobalTheme = CARD_THEMES[globalThemeId];
  const profileRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const completedCount = levels.filter(l => l.isCompleted).length;
  const progress = (completedCount / levels.length) * 100;
  const allCompleted = completedCount === levels.length;
  const isDark = themeMode === 'dark';

  useEffect(() => localStorage.setItem('dashboard_layout_v2', JSON.stringify(layout)), [layout]);
  useEffect(() => localStorage.setItem('dashboard_level_themes', JSON.stringify(levelThemes)), [levelThemes]);
  useEffect(() => localStorage.setItem('dashboard_global_theme', globalThemeId), [globalThemeId]);
  useEffect(() => localStorage.setItem('dashboard_theme_mode', themeMode), [themeMode]);

  useEffect(() => {
    if (!levelsContainerRef.current) return;
    const observer = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width));
    observer.observe(levelsContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleThemeMode = useCallback(() => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
    playPositiveSound();
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setLayout(prev => prev.map(item => item.id === id ? { ...item, visible: !item.visible } : item));
    playPositiveSound();
  }, []);

  const moveItem = useCallback((index: number, direction: 'up' | 'down') => {
    setLayout(prev => {
      const newLayout = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newLayout.length) return prev;
      [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
      return newLayout;
    });
    playPositiveSound();
  }, []);

  const handleSetGlobalTheme = useCallback((themeId: string) => {
    setGlobalThemeId(themeId);
    playPositiveSound();
  }, []);

  const handleSetLevelTheme = useCallback((levelId: number, themeId: string) => {
    setLevelThemes(prev => ({ ...prev, [levelId]: themeId }));
    setOpenThemePicker(null);
    playPositiveSound();
  }, []);

  const resetAllIndividualThemes = useCallback(() => {
    setLevelThemes({});
    playCelebrationSound();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setIsSettingsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLevels = useMemo(() => levels.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase())), [levels, searchTerm]);
  const columnCount = containerWidth > 640 ? 2 : 1;
  const rowCount = Math.ceil(filteredLevels.length / columnCount);

  const VirtualRow = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const startIdx = index * columnCount;
    const rowItems = filteredLevels.slice(startIdx, startIdx + columnCount);
    return (
      <div style={style} className="flex gap-6 pb-6">
        {rowItems.map((level, i) => {
          const theme = CARD_THEMES[levelThemes[level.id] || globalThemeId];
          return (
            <div key={level.id} className="flex-1">
              <LevelCard level={level} isDark={isDark} activeTheme={theme} levelThemes={levelThemes} openThemePicker={openThemePicker} onSetLevelTheme={handleSetLevelTheme} onToggleThemePicker={(id) => setOpenThemePicker(prev => prev === id ? null : id)} onSelectLevel={onSelectLevel} idx={startIdx + i} />
            </div>
          );
        })}
        {rowItems.length < columnCount && <div className="flex-1" />}
      </div>
    );
  }, [filteredLevels, columnCount, isDark, levelThemes, globalThemeId, openThemePicker, handleSetLevelTheme, onSelectLevel]);

  const renderSection = (id: string) => {
    switch (id) {
      case 'welcome': return (
        <div className="mb-4 space-y-6">
          <div className="animate-fade-in-up text-right">
            <h2 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-2 transition-colors duration-500`}>مرحباً بك، {user.firstName} 👋</h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold`}>هذه مساحتك الشخصية لمتابعة وتطوير مشروعك <span className={`${activeGlobalTheme.accent} transition-colors duration-500`}>"{user.startupName}"</span>.</p>
          </div>
          
          {allCompleted ? (
            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-8 rounded-[2.5rem] text-white shadow-2xl animate-fade-in-up border border-yellow-400/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12"></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="max-w-md text-right">
                     <span className="bg-white/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">لقد تخرجت! 🎉</span>
                     <h3 className="text-3xl font-black mb-2">تهانينا على إتمام المسار</h3>
                     <p className="text-yellow-50 text-sm font-medium leading-relaxed">لقد أتممت كافة مستويات مسرعة الأعمال بنجاح. مشروعك الآن جاهز لمواجهة العالم وجذب الاستثمارات.</p>
                  </div>
                  <button 
                    onClick={onShowCertificate}
                    className="px-10 py-5 bg-white text-amber-900 rounded-[1.8rem] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>عرض شهادة التخرج</span>
                  </button>
               </div>
            </div>
          ) : !user.hasCompletedAssessment && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl animate-fade-in-up border border-blue-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12"></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="max-w-md text-right">
                     <span className="bg-white/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">الخطوة التالية</span>
                     <h3 className="text-2xl font-black mb-2">أكمل اختبارات الترشيح</h3>
                     <p className="text-blue-100 text-sm font-medium leading-relaxed">تحتاج لاجتياز 3 مراحل (تحليل الشخصية، الاختبار التحليلي، تقييم الفكرة) للبدء رسمياً في مسار المسرعة.</p>
                  </div>
                  <button 
                    onClick={onStartAssessment}
                    className="px-10 py-5 bg-white text-blue-900 rounded-[1.8rem] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap"
                  >
                    <span>ابدأ الاختبارات الآن</span>
                    <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
               </div>
            </div>
          )}
        </div>
      );
      case 'profile_stats': return (
        <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} p-6 rounded-[2rem] border animate-fade-in-up h-full overflow-hidden`}>
           <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100/10 text-right">
              <div className={`w-12 h-12 rounded-xl ${activeGlobalTheme.primary} text-white flex items-center justify-center text-xl font-black shadow-lg shrink-0`}>{(user.firstName).charAt(0)}</div>
              <div className="overflow-hidden">
                 <h4 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'} truncate`}>{user.firstName} {user.lastName}</h4>
                 <p className="text-slate-400 text-[10px] font-bold truncate">{user.email}</p>
              </div>
           </div>
           <div className="space-y-1">
              {[
                { label: 'قطاع المشروع', val: user.industry, icon: '🏭' },
                { label: 'حالة الطلب', val: user.hasCompletedAssessment ? 'مقبول ✅' : 'قيد التقييم ⏳', icon: '📝', highlight: true },
                { label: 'رقم الهاتف', val: user.phone, icon: '📞' },
                { label: 'العمر', val: user.age || 'غير محدد', icon: '👤' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                   <div className="flex items-center gap-3">
                      <span className="text-sm grayscale group-hover:grayscale-0">{item.icon}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.label}</span>
                   </div>
                   <span className={`text-xs font-black ${item.highlight ? (user.hasCompletedAssessment ? 'text-green-500' : 'text-amber-500') : (isDark ? 'text-slate-200' : 'text-slate-700')}`}>
                      {item.val}
                   </span>
                </div>
              ))}

              {allCompleted && (
                <button 
                  onClick={onShowCertificate}
                  className={`w-full mt-4 flex items-center justify-between p-4 rounded-2xl bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-all transform active:scale-95`}
                >
                   <div className="flex items-center gap-3">
                      <span className="text-lg">🎓</span>
                      <span className="text-xs font-black uppercase tracking-widest">شهادة التخرج</span>
                   </div>
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
              )}
           </div>
        </div>
      );
      case 'progress': return (
        <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-8 rounded-[2.5rem] border relative overflow-hidden group animate-fade-in-up h-full`}>
          <div className="flex flex-col gap-8 relative z-10">
            <div className="shrink-0"><RadialProgress progress={user.hasCompletedAssessment ? progress : 0} theme={activeGlobalTheme} isDark={isDark} size={160} /></div>
            <div className="space-y-6 w-full text-right">
              <div>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 block ${activeGlobalTheme.accent}`}>تحليل الإنجاز</span>
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} leading-none`}>ملخص الأداء</h3>
              </div>
              <div className="space-y-4">
                 <div className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/50 border-slate-100'} p-5 rounded-2xl border`}>
                   <span className={`text-[10px] font-black ${isDark ? 'text-slate-500' : 'text-slate-500'} uppercase mb-2 block`}>النمو في المسار</span>
                   <PathTrend levels={levels} theme={activeGlobalTheme} isDark={isDark} />
                 </div>
              </div>
            </div>
          </div>
        </div>
      );
      case 'levels': return (
        <div ref={levelsContainerRef} className={`w-full ${!user.hasCompletedAssessment ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
           {!user.hasCompletedAssessment && (
             <div className="bg-slate-50 border border-slate-200 p-12 rounded-[3rem] text-center mb-10 flex flex-col items-center">
                <span className="text-5xl mb-6">🔒</span>
                <h4 className="text-xl font-black text-slate-800 mb-2">المسار التعليمي مغلق حالياً</h4>
                <p className="text-slate-500 text-sm max-w-sm">أكمل اختبارات الترشيح والتقييم بنجاح لتتمكن من الوصول إلى محطات البرنامج الست.</p>
             </div>
           )}
           <div className="h-[600px] w-full">
             <List height={600} itemCount={rowCount} itemSize={350} width="100%" className="hide-scrollbar">{VirtualRow}</List>
           </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0f172a]' : 'bg-gray-50'} flex flex-col font-sans transition-colors duration-500`}>
      <header className={`sticky top-0 z-40 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-200 shadow-sm'} backdrop-blur-md border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-20 items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${activeGlobalTheme.primary}`}>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div><div className="text-right"><h1 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'} leading-none`}>بيزنس ديفلوبرز</h1><span className={`text-[9px] font-bold uppercase tracking-widest mt-1 block ${activeGlobalTheme.accent}`}>Hub Terminal</span></div></div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleThemeMode} className={`p-2.5 rounded-xl transition-all border ${isDark ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}>
              {isDark ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 16.243l.707.707M7.757 7.757l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg> : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className={`p-2.5 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-400'} rounded-xl transition-all border`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <div className="relative" ref={profileRef}><button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`h-10 w-10 rounded-xl ${isDark ? 'bg-blue-600' : 'bg-slate-900'} flex items-center justify-center text-white font-black shadow-sm`}>{(user.firstName).charAt(0)}</button>{isProfileOpen && (<div className={`absolute left-0 mt-3 w-64 rounded-2xl shadow-2xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border p-2 z-50 animate-fade-in text-right`}><div className={`p-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'} rounded-xl mb-2`}><h4 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'} text-sm mb-1`}>{user.startupName}</h4><p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{user.industry}</p></div><button onClick={onLogout} className="w-full flex items-center justify-end gap-3 px-4 py-3 text-sm font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">تسجيل الخروج<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button></div>)}</div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-12">{renderSection('welcome')}</div>
          <div className="lg:col-span-4 space-y-8">
             {renderSection('profile_stats')}
             {renderSection('progress')}
          </div>
          <div className="lg:col-span-8">
             {renderSection('levels')}
          </div>
        </div>
      </main>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in text-right">
           <div ref={settingsRef} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-[3rem] w-full max-w-2xl shadow-2xl border animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]`}>
              <div className={`px-10 py-8 ${isDark ? 'border-slate-800' : 'border-slate-100'} border-b flex justify-between items-center`}>
                 <button onClick={() => setIsSettingsOpen(false)} className={`p-3 ${isDark ? 'hover:bg-slate-800 text-slate-500 hover:text-white' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-900'} rounded-2xl transition-colors`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 <div className="flex items-center gap-4">
                    <div>
                       <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>إعدادات المنصة</h3>
                       <p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest`}>Terminal Settings</p>
                    </div>
                    <span className="text-3xl">⚙️</span>
                 </div>
              </div>

              <div className="p-10 overflow-y-auto space-y-12">
                 <section>
                    <h4 className={`text-sm font-black ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mb-6`}>وضع العرض</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => setThemeMode('light')} className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 ${!isDark ? 'border-blue-600 bg-blue-50/50' : 'border-slate-800 bg-slate-800/30 text-slate-500'}`}><span className="text-2xl">☀️</span><span className="font-black text-sm">خلفية بيضاء</span></button>
                       <button onClick={() => setThemeMode('dark')} className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 ${isDark ? 'border-blue-600 bg-blue-600/20 text-white' : 'border-slate-100 bg-white text-slate-500'}`}><span className="text-2xl">🌙</span><span className="font-black text-sm">الوضع المظلم</span></button>
                    </div>
                 </section>
                 <section>
                    <h4 className={`text-sm font-black ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mb-6`}>السمة اللونية</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       {Object.values(CARD_THEMES).map((theme) => (
                         <button key={theme.id} onClick={() => handleSetGlobalTheme(theme.id)} className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 relative group ${globalThemeId === theme.id ? (isDark ? 'border-white bg-slate-800' : 'border-slate-900 bg-slate-50 shadow-md') : (isDark ? 'border-slate-800 bg-slate-900 hover:border-slate-700' : 'border-slate-100 hover:border-slate-200 bg-white')}`}>
                            <div className={`w-8 h-8 rounded-full ${theme.primary} shadow-sm group-hover:scale-110 transition-transform`}></div>
                            <span className={`text-[11px] font-black ${globalThemeId === theme.id ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-500' : 'text-slate-600')}`}>{theme.label.split(' ')[0]}</span>
                         </button>
                       ))}
                    </div>
                 </section>
              </div>

              <div className={`px-10 py-8 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'} border-t flex gap-4`}>
                 <button onClick={() => setIsSettingsOpen(false)} className={`flex-1 py-4 ${activeGlobalTheme.primary} text-white rounded-2xl font-black text-sm shadow-xl transition-all`}>حفظ الإعدادات</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
