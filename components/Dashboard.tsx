
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

const CUSTOM_ICONS = ['🚀', '💡', '📊', '🔎', '🛠️', '💰', '🏢', '🌍', '🎯', '⚖️', '🧠', '⚙️', '🧪', '📈', '📣'];

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
        <span className={`text-2xl font-black ${theme.accent} tabular-nums transition-colors duration-500`}>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

const PathTrend: React.FC<{ levels: LevelData[]; theme: CardTheme; isDark: boolean }> = ({ levels, theme, isDark }) => {
  const chartData = useMemo(() => levels.map(l => ({ name: `L${l.id}`, status: l.isCompleted ? 100 : l.isLocked ? 0 : 25, fullLabel: l.title })), [levels]);
  return (
    <div className={`w-full h-[70px] ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'} rounded-xl border p-1 relative overflow-hidden group`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
          <defs><linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={theme.colorHex} stopOpacity={0.3}/><stop offset="95%" stopColor={theme.colorHex} stopOpacity={0}/></linearGradient></defs>
          <Tooltip content={({ active, payload }) => (active && payload?.length ? <div className={`${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'} p-2 rounded-lg border shadow-xl text-right`}><p className="text-[10px] font-black mb-0.5">{payload[0].payload.fullLabel}</p></div> : null)} />
          <Area type="monotone" dataKey="status" stroke={theme.colorHex} strokeWidth={2} fillOpacity={1} fill="url(#colorStatus)" animationDuration={1000} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const LevelListItem = React.memo<{
  level: LevelData;
  isDark: boolean;
  activeTheme: CardTheme;
  customIcon: string | null;
  levelThemes: Record<number, string>;
  levelIcons: Record<number, string>;
  openCustomizer: number | null;
  onSetLevelTheme: (levelId: number, themeId: string) => void;
  onSetLevelIcon: (levelId: number, icon: string) => void;
  onToggleCustomizer: (id: number) => void;
  onSelectLevel: (id: number) => void;
  idx: number;
}>(({ level, isDark, activeTheme, customIcon, levelThemes, levelIcons, openCustomizer, onSetLevelTheme, onSetLevelIcon, onToggleCustomizer, onSelectLevel, idx }) => {
  return (
    <div 
      onClick={() => !level.isLocked && onSelectLevel(level.id)} 
      className={`relative rounded-2xl px-4 py-2.5 transition-all duration-300 flex items-center gap-3 group animate-fade-in-up border ${level.isLocked ? (isDark ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-50/50 border-slate-100 opacity-80') : `${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} hover:shadow-md hover:border-blue-300 cursor-pointer active:scale-[0.98]`} ${level.isLocked ? 'cursor-not-allowed' : ''}`} 
      style={{ animationDelay: `${idx * 0.03}s` }}
    >
      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-lg transition-all ${level.isLocked ? (isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400') : level.isCompleted ? (isDark ? 'bg-green-900/30 text-green-500' : 'bg-green-100 text-green-600') : `${activeTheme.bg} ${activeTheme.accent}`}`}>
        {level.isCompleted ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : (customIcon || level.icon)}
      </div>
      
      <div className="flex-1 overflow-hidden text-right">
        <div className="flex justify-between items-center">
          <h3 className={`text-xs font-black truncate transition-colors ${level.isLocked ? (isDark ? 'text-slate-600' : 'text-slate-400') : (isDark ? 'text-white' : 'text-slate-900')}`}>{level.title}</h3>
          <span className={`text-[9px] font-black uppercase ${level.isCompleted ? 'text-green-500' : level.isLocked ? 'text-slate-400' : activeTheme.accent}`}>
            {level.isCompleted ? 'مكتمل' : level.isLocked ? 'مغلق' : 'متاح'}
          </span>
        </div>
        {!level.isLocked && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className={`flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-1 rounded-full overflow-hidden`}>
              <div className={`h-full rounded-full transition-all duration-1000 ${level.isCompleted ? 'bg-green-500' : activeTheme.dot}`} style={{ width: `${level.isCompleted ? 100 : 0}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {!level.isLocked && (
        <div className="flex items-center" onClick={e => e.stopPropagation()}>
           <button onClick={() => onToggleCustomizer(level.id)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'} transition-all`} title="تخصيص المظهر">
             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
           </button>
           {openCustomizer === level.id && (
              <div className={`absolute left-0 top-full mt-1 w-64 ${isDark ? 'bg-slate-800 border-slate-700 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'} rounded-2xl border p-3 z-50 animate-fade-in-up origin-top-left`}>
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 pr-1 text-right">لون المحطة</p>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {Object.values(CARD_THEMES).map(t => (
                        <button key={t.id} onClick={() => onSetLevelTheme(level.id, t.id)} className={`w-5 h-5 rounded-full border ${t.dot} ${levelThemes[level.id] === t.id ? 'ring-1 ring-blue-500 ring-offset-1 ring-offset-white' : 'border-transparent hover:scale-110 transition-transform'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="h-px bg-slate-100/10"></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 pr-1 text-right">أيقونة المحطة</p>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {CUSTOM_ICONS.map(icon => (
                        <button key={icon} onClick={() => onSetLevelIcon(level.id, icon)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs border transition-all ${levelIcons[level.id] === icon ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
});

export const Dashboard: React.FC<DashboardProps> = ({ user, levels, onSelectLevel, onShowCertificate, onLogout, onOpenProAnalytics, onStartAssessment }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openCustomizer, setOpenCustomizer] = useState<number | null>(null);
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

  const [levelIcons, setLevelIcons] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('dashboard_level_icons');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const syncWithStorage = () => {
      const icons = localStorage.getItem('dashboard_level_icons');
      if (icons) setLevelIcons(JSON.parse(icons));
    };
    window.addEventListener('storage', syncWithStorage);
    return () => window.removeEventListener('storage', syncWithStorage);
  }, []);

  const activeGlobalTheme = CARD_THEMES[globalThemeId];
  const profileRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const completedCount = levels.filter(l => l.isCompleted).length;
  const progress = (completedCount / levels.length) * 100;
  const allCompleted = completedCount === levels.length;
  const isDark = themeMode === 'dark';

  useEffect(() => localStorage.setItem('dashboard_layout_v2', JSON.stringify(layout)), [layout]);
  useEffect(() => localStorage.setItem('dashboard_level_themes', JSON.stringify(levelThemes)), [levelThemes]);
  useEffect(() => localStorage.setItem('dashboard_level_icons', JSON.stringify(levelIcons)), [levelIcons]);
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

  const handleSetGlobalTheme = useCallback((themeId: string) => {
    setGlobalThemeId(themeId);
    playPositiveSound();
  }, []);

  const handleSetLevelTheme = useCallback((levelId: number, themeId: string) => {
    setLevelThemes(prev => ({ ...prev, [levelId]: themeId }));
    playPositiveSound();
  }, []);

  const handleSetLevelIcon = useCallback((levelId: number, icon: string) => {
    setLevelIcons(prev => ({ ...prev, [levelId]: icon }));
    playPositiveSound();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setIsSettingsOpen(false);
      
      if (openCustomizer !== null) {
        const target = e.target as HTMLElement;
        if (!target.closest('.relative.rounded-2xl')) {
          setOpenCustomizer(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openCustomizer]);

  const filteredLevels = useMemo(() => levels.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase())), [levels, searchTerm]);
  const columnCount = containerWidth > 640 ? 2 : 1;
  const rowCount = Math.ceil(filteredLevels.length / columnCount);

  const VirtualRow = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const startIdx = index * columnCount;
    const rowItems = filteredLevels.slice(startIdx, startIdx + columnCount);
    return (
      <div style={style} className="flex gap-3 pb-3">
        {rowItems.map((level, i) => {
          const theme = CARD_THEMES[levelThemes[level.id] || globalThemeId];
          const icon = levelIcons[level.id] || null;
          return (
            <div key={level.id} className="flex-1">
              <LevelListItem 
                level={level} 
                isDark={isDark} 
                activeTheme={theme} 
                customIcon={icon}
                levelThemes={levelThemes} 
                levelIcons={levelIcons}
                openCustomizer={openCustomizer} 
                onSetLevelTheme={handleSetLevelTheme} 
                onSetLevelIcon={handleSetLevelIcon}
                onToggleCustomizer={(id) => setOpenCustomizer(prev => prev === id ? null : id)} 
                onSelectLevel={onSelectLevel} 
                idx={startIdx + i} 
              />
            </div>
          );
        })}
        {rowItems.length < columnCount && <div className="flex-1" />}
      </div>
    );
  }, [filteredLevels, columnCount, isDark, levelThemes, levelIcons, globalThemeId, openCustomizer, handleSetLevelTheme, handleSetLevelIcon, onSelectLevel]);

  const renderSection = (id: string) => {
    switch (id) {
      case 'welcome': return (
        <div className="mb-4 space-y-4">
          <div className="animate-fade-in-up text-right">
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-0.5 transition-colors duration-500`}>مرحباً بك، {user.firstName} 👋</h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs font-bold`}>مشروعك <span className={`${activeGlobalTheme.accent} transition-colors duration-500`}>"{user.startupName}"</span> في مسار التطوير.</p>
          </div>
          
          {allCompleted ? (
            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-4 rounded-2xl text-white shadow-lg animate-fade-in-up relative overflow-hidden group">
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-3">
                  <div className="text-right">
                     <h3 className="text-lg font-black mb-0.5">تهانينا على التخرج! 🎉</h3>
                     <p className="text-yellow-50 text-[10px] font-medium">أتممت المسار بنجاح، مشروعك الآن جاهز لمواجهة العالم.</p>
                  </div>
                  <button onClick={onShowCertificate} className="px-4 py-2 bg-white text-amber-900 rounded-lg font-black text-[10px] shadow-md hover:scale-105 transition-all flex items-center gap-1.5">عرض الشهادة</button>
               </div>
            </div>
          ) : !user.hasCompletedAssessment && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-2xl text-white shadow-lg animate-fade-in-up border border-blue-500/20 relative overflow-hidden group">
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-3">
                  <div className="text-right">
                     <h3 className="text-lg font-black mb-0.5">أكمل اختبارات الترشيح</h3>
                     <p className="text-blue-100 text-[10px] font-medium">ابدأ الآن لاجتياز مراحل التقييم الذكي والانضمام للمسرعة.</p>
                  </div>
                  <button onClick={onStartAssessment} className="px-4 py-2 bg-white text-blue-900 rounded-lg font-black text-[10px] shadow-md hover:scale-105 transition-all">ابدأ الاختبارات</button>
               </div>
            </div>
          )}
        </div>
      );
      case 'profile_stats': return (
        <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} p-4 rounded-[1.5rem] border animate-fade-in-up`}>
           <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100/10 text-right">
              <div className={`w-8 h-8 rounded-lg ${activeGlobalTheme.primary} text-white flex items-center justify-center text-sm font-black shadow-md shrink-0`}>{(user.firstName).charAt(0)}</div>
              <div className="overflow-hidden">
                 <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'} truncate`}>{user.firstName} {user.lastName}</h4>
                 <p className="text-slate-400 text-[8px] font-bold truncate">{user.email}</p>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'القطاع', val: user.industry, icon: '🏭' },
                { label: 'الحالة', val: user.hasCompletedAssessment ? 'مقبول' : 'تقييم', icon: '📝', highlight: true },
                { label: 'الهاتف', val: user.phone.slice(-4), icon: '📞' },
                { label: 'العمر', val: user.age || '?', icon: '👤' },
              ].map((item, i) => (
                <div key={i} className={`flex flex-col p-2 rounded-xl transition-colors ${isDark ? 'bg-slate-800/40 border border-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</span>
                   <span className={`text-[10px] font-black truncate ${item.highlight ? (user.hasCompletedAssessment ? 'text-green-500' : 'text-amber-500') : (isDark ? 'text-slate-200' : 'text-slate-700')}`}>
                      {item.val}
                   </span>
                </div>
              ))}
           </div>
           {allCompleted && (
              <button onClick={onShowCertificate} className="w-full mt-2.5 flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500 text-white shadow-md text-[10px] font-black transform active:scale-95">
                 <span>🎓 شهادة التخرج</span>
              </button>
           )}
        </div>
      );
      case 'progress': return (
        <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-4 rounded-[1.5rem] border relative overflow-hidden animate-fade-in-up`}>
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="shrink-0"><RadialProgress progress={user.hasCompletedAssessment ? progress : 0} theme={activeGlobalTheme} isDark={isDark} size={80} /></div>
            <div className="flex-1 text-right">
              <span className={`text-[9px] font-black uppercase tracking-widest mb-1 block ${activeGlobalTheme.accent}`}>ملخص الأداء</span>
              <div className="space-y-2">
                 <div className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/50 border-slate-100'} p-2 rounded-xl border`}>
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
             <div className="bg-slate-50 border border-slate-200 p-6 rounded-[1.5rem] text-center mb-4 flex flex-col items-center">
                <span className="text-2xl mb-2">🔒</span>
                <h4 className="text-sm font-black text-slate-800 mb-0.5">المسار التعليمي مغلق</h4>
                <p className="text-slate-500 text-[10px] max-w-sm">أكمل التقييم بنجاح للوصول للمستويات.</p>
             </div>
           )}
           <div className="h-[400px] w-full">
             <List height={400} itemCount={rowCount} itemSize={88} width="100%" className="hide-scrollbar">{VirtualRow}</List>
           </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0f172a]' : 'bg-gray-50'} flex flex-col font-sans transition-colors duration-500`}>
      <header className={`sticky top-0 z-40 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-200 shadow-sm'} backdrop-blur-md border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-14 items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md ${activeGlobalTheme.primary}`}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div><div className="text-right"><h1 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'} leading-none`}>بيزنس ديفلوبرز</h1><span className={`text-[7px] font-bold uppercase tracking-widest mt-0.5 block ${activeGlobalTheme.accent}`}>Terminal Hub</span></div></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleThemeMode} className={`p-1.5 rounded-lg transition-all border ${isDark ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}>
              {isDark ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 16.243l.707.707M7.757 7.757l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className={`p-1.5 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-400'} rounded-lg transition-all border`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <div className="relative" ref={profileRef}><button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`h-8 w-8 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-slate-900'} flex items-center justify-center text-white font-black shadow-sm`}>{(user.firstName).charAt(0)}</button>{isProfileOpen && (<div className={`absolute left-0 mt-3 w-56 rounded-xl shadow-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border p-1.5 z-50 animate-fade-in text-right`}><div className={`p-3 ${isDark ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg mb-1.5`}><h4 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'} text-xs mb-0.5`}>{user.startupName}</h4><p className={`text-[8px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{user.industry}</p></div><button onClick={onLogout} className="w-full flex items-center justify-end gap-2 px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">تسجيل الخروج<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button></div>)}</div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-12">{renderSection('welcome')}</div>
          <div className="lg:col-span-4 space-y-4">
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
           <div ref={settingsRef} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-[1.5rem] w-full max-w-lg shadow-2xl border animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]`}>
              <div className={`px-6 py-4 ${isDark ? 'border-slate-800' : 'border-slate-100'} border-b flex justify-between items-center`}>
                 <button onClick={() => setIsSettingsOpen(false)} className={`p-1.5 ${isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-50 text-slate-400'} rounded-lg transition-colors`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 <div className="flex items-center gap-2">
                    <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>الإعدادات</h3>
                    <span className="text-xl">⚙️</span>
                 </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-8">
                 <section>
                    <h4 className={`text-[10px] font-black ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mb-3`}>وضع العرض</h4>
                    <div className="grid grid-cols-2 gap-2">
                       <button onClick={() => setThemeMode('light')} className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${!isDark ? 'border-blue-600 bg-blue-50/50' : 'border-slate-800 bg-slate-800/30 text-slate-500'}`}><span className="text-lg">☀️</span><span className="font-black text-[11px]">نهاري</span></button>
                       <button onClick={() => setThemeMode('dark')} className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${isDark ? 'border-blue-600 bg-blue-600/20 text-white' : 'border-slate-100 bg-white text-slate-500'}`}><span className="text-lg">🌙</span><span className="font-black text-[11px]">ليلي</span></button>
                    </div>
                 </section>
                 <section>
                    <h4 className={`text-[10px] font-black ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mb-3`}>السمة اللونية</h4>
                    <div className="grid grid-cols-4 gap-2">
                       {Object.values(CARD_THEMES).map((theme) => (
                         <button key={theme.id} onClick={() => handleSetGlobalTheme(theme.id)} className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${globalThemeId === theme.id ? (isDark ? 'border-white bg-slate-800' : 'border-slate-900 bg-slate-50') : (isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}`}>
                            <div className={`w-4 h-4 rounded-full ${theme.primary}`}></div>
                            <span className="text-[9px] font-black">{theme.label.split(' ')[0]}</span>
                         </button>
                       ))}
                    </div>
                 </section>
              </div>

              <div className={`px-6 py-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'} border-t`}>
                 <button onClick={() => setIsSettingsOpen(false)} className={`w-full py-2.5 ${activeGlobalTheme.primary} text-white rounded-lg font-black text-xs shadow-lg`}>تطبيق التغييرات</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
