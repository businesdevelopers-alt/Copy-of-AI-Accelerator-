
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LevelData, UserProfile, DIGITAL_SHIELDS, SECTORS, TaskRecord } from '../types';
import { storageService } from '../services/storageService';
import { playPositiveSound, playCelebrationSound } from '../services/audioService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell
} from 'recharts';

interface DashboardProps {
  user: UserProfile;
  levels: LevelData[];
  onSelectLevel: (id: number) => void;
  onShowCertificate: () => void;
  onLogout?: () => void;
  onOpenProAnalytics?: () => void;
  onStartAssessment?: () => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'الرئيسية', icon: '🏠', section: 'main' },
  { id: 'notifications', label: 'الإشعارات', icon: '🔔', badge: 3, section: 'main' },
  { id: 'calendar', label: 'التقويم', icon: '📅', section: 'main' },
  { id: 'startup_profile', label: 'ملف الشركة', icon: '📈', section: 'main' },
  { id: 'sessions', label: 'جلساتي', icon: '👤', section: 'main' },
  { id: 'bootcamp', label: 'المنهج التدريبي', icon: '📚', section: 'program' },
  { id: 'tasks', label: 'المهام والتسليمات', icon: '📝', section: 'program' },
];

const COLOR_OPTIONS = [
  { id: 'blue', label: 'أزرق', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', activeBg: 'bg-blue-600' },
  { id: 'emerald', label: 'زمردي', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', activeBg: 'bg-emerald-600' },
  { id: 'rose', label: 'وردي', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', activeBg: 'bg-rose-600' },
  { id: 'amber', label: 'كهرماني', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', activeBg: 'bg-amber-600' },
  { id: 'purple', label: 'بنفسجي', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', activeBg: 'bg-purple-600' },
  { id: 'indigo', label: 'نيلي', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', activeBg: 'bg-indigo-600' },
];

const CALENDAR_EVENTS = [
  { id: 1, title: 'ورشة عمل: استراتيجيات النمو', date: '2024-05-15', time: '10:00 ص', type: 'workshop', color: 'blue' },
  { id: 2, title: 'جلسة إرشادية: مراجعة نموذج العمل', date: '2024-05-18', time: '02:00 م', type: 'mentorship', color: 'purple' },
  { id: 3, title: 'الموعد النهائي: تسليم MVP', date: '2024-05-22', time: '11:59 م', type: 'deadline', color: 'rose' },
  { id: 4, title: 'لقاء المستثمرين الشهري', date: '2024-05-28', time: '05:00 م', type: 'event', color: 'emerald' },
];

interface Customization {
  icon: string;
  colorId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, levels, onSelectLevel, onShowCertificate, onLogout, onOpenProAnalytics, onStartAssessment }) => {
  const [activeNav, setActiveNav] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('dashboard_theme_mode') as any) || 'light');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  
  // Tasks State
  const [userTasks, setUserTasks] = useState<TaskRecord[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUser);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customizations, setCustomizations] = useState<Record<number, Customization>>(() => {
    const saved = localStorage.getItem('user_level_customizations');
    return saved ? JSON.parse(saved) : {};
  });

  const completedCount = levels.filter(l => l.isCompleted).length;
  const progress = (completedCount / levels.length) * 100;
  const isDark = themeMode === 'dark';

  // Load Tasks Effect
  useEffect(() => {
    const session = storageService.getCurrentSession();
    if (session) {
      const tasks = storageService.getUserTasks(session.uid);
      setUserTasks(tasks);
    }
  }, [activeNav]);

  const growthData = useMemo(() => [
    { name: 'البداية', value: 10 },
    { name: 'المحطة 1', value: levels[0]?.isCompleted ? 25 : 15 },
    { name: 'المحطة 2', value: levels[1]?.isCompleted ? 45 : 25 },
    { name: 'المحطة 3', value: levels[2]?.isCompleted ? 60 : 40 },
    { name: 'المحطة 4', value: levels[3]?.isCompleted ? 75 : 55 },
    { name: 'المحطة 5', value: levels[4]?.isCompleted ? 90 : 70 },
    { name: 'المحطة 6', value: levels[5]?.isCompleted ? 100 : 85 },
  ], [levels]);

  const skillsData = useMemo(() => [
    { subject: 'استراتيجية', A: levels[1]?.isCompleted ? 90 : 40, fullMark: 100 },
    { subject: 'سوق', A: levels[2]?.isCompleted ? 85 : 30, fullMark: 100 },
    { subject: 'تقنية', A: levels[3]?.isCompleted ? 95 : 20, fullMark: 100 },
    { subject: 'مالية', A: levels[4]?.isCompleted ? 80 : 15, fullMark: 100 },
    { subject: 'عرض', A: levels[5]?.isCompleted ? 100 : 10, fullMark: 100 },
    { subject: 'تحقق', A: levels[0]?.isCompleted ? 90 : 50, fullMark: 100 },
  ], [levels]);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setThemeMode(next);
    localStorage.setItem('dashboard_theme_mode', next);
    playPositiveSound();
  };

  const handleUpdateCustomization = (levelId: number, data: Partial<Customization>) => {
    const updated = {
      ...customizations,
      [levelId]: {
        ...(customizations[levelId] || { icon: levels.find(l => l.id === levelId)?.icon || '🚀', colorId: 'blue' }),
        ...data
      }
    };
    setCustomizations(updated);
    localStorage.setItem('user_level_customizations', JSON.stringify(updated));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile(prev => ({ ...prev, logo: reader.result as string }));
        playPositiveSound();
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfileChanges = () => {
    setIsSavingProfile(true);
    setTimeout(() => {
      localStorage.setItem('db_user_profile', JSON.stringify(userProfile));
      setIsSavingProfile(false);
      playCelebrationSound();
      alert('تم تحديث بيانات الشركة بنجاح!');
    }, 1000);
  };

  const handleTaskSubmission = () => {
    if (!selectedTask || !submissionText.trim()) return;
    setIsSubmittingTask(true);
    const session = storageService.getCurrentSession();
    
    setTimeout(() => {
      storageService.submitTask(session.uid, selectedTask.id, submissionText);
      // Refresh local tasks
      setUserTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: 'SUBMITTED', submission: { content: submissionText, submittedAt: new Date().toISOString() } } : t));
      setIsSubmittingTask(false);
      setSelectedTask(null);
      setSubmissionText('');
      playPositiveSound();
      alert('تم تسليم المهمة بنجاح، سيقوم الموجهون بمراجعتها قريباً.');
    }, 1500);
  };

  const LevelsList = () => (
    <div className="space-y-3">
      {levels.map((level, idx) => {
        const custom = customizations[level.id];
        const color = COLOR_OPTIONS.find(c => c.id === (custom?.colorId || 'blue')) || COLOR_OPTIONS[0];
        const isLocked = level.isLocked;

        return (
          <div 
            key={level.id}
            onClick={() => !isLocked && onSelectLevel(level.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group
              ${isLocked ? 'opacity-60 grayscale cursor-not-allowed border-slate-200' : 'cursor-pointer'}
              ${!isLocked && isDark ? 'bg-slate-900 border-slate-800 hover:border-blue-500 hover:bg-slate-800 shadow-md' : ''}
              ${!isLocked && !isDark ? 'bg-white border-slate-100 hover:border-blue-400 hover:shadow-lg shadow-sm' : ''}
            `}
          >
             <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-2xl shadow-inner transition-colors
               ${level.isCompleted ? 'bg-green-100 text-green-600' : 
                 isLocked ? 'bg-slate-100 text-slate-400' : `${color.bg} ${color.text} group-hover:${color.activeBg} group-hover:text-white`}
             `}>
                {level.isCompleted ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : isLocked ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                ) : (custom?.icon || level.icon)}
             </div>

             <div className="flex-1 min-w-0 pr-2 text-right">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${level.isCompleted ? 'text-green-500' : isLocked ? 'text-slate-400' : color.text}`}>Level 0{level.id}</span>
                  {level.isCompleted && <span className="text-[10px] text-amber-500 font-black">● الدرع مكتسب</span>}
                  {isLocked && <span className="text-[10px] text-slate-400 font-black">● مغلق حالياً</span>}
                </div>
                <h4 className="text-sm font-black truncate">{level.title}</h4>
                <p className={`text-[11px] font-medium leading-tight truncate max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{level.description}</p>
             </div>

             <div className="hidden sm:flex items-center gap-4 px-4 shrink-0">
                {level.isCompleted ? (
                  <span className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 uppercase tracking-widest">Completed</span>
                ) : isLocked ? (
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Locked</span>
                ) : (
                  <div className="flex items-center gap-2 group-hover:translate-x-[-4px] transition-transform">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${color.text}`}>فتح المحطة</span>
                     <svg className={`w-4 h-4 transform rotate-180 ${color.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                )}
             </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 ${isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8f9fa] text-slate-900'}`} dir="rtl">
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 0px; }
        .nav-item-active { background: ${isDark ? 'rgba(59, 130, 246, 0.1)' : '#ffffff'}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .active-ring { animation: pulse-ring 2s infinite; }
        @keyframes shield-glow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.4)); }
          50% { filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.8)); }
        }
        .shield-active { animation: shield-glow 3s infinite; }
        .chart-card { transition: all 0.3s ease; }
        .chart-card:hover { transform: translateY(-5px); }
        .calendar-day { transition: all 0.2s ease; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 1rem; border-width: 1px; }
        .profile-input { width: 100%; padding: 1rem; border-radius: 1rem; outline: none; border-width: 2px; transition: all 0.3s; }
        .task-card { transition: all 0.3s ease; border-radius: 2rem; border-width: 1px; overflow: hidden; position: relative; }
        .task-card:hover { transform: translateY(-4px); }
      `}</style>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} ${isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-[#f3f4f6] border-slate-200'} border-l flex flex-col`}>
        <div className="p-8 text-center">
          <div className="flex flex-col items-center gap-1">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-2 overflow-hidden">
                {userProfile.logo ? (
                  <img src={userProfile.logo} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                )}
             </div>
             <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight leading-none uppercase`}>بيزنس ديفلوبرز</span>
             <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">مسرعة الأعمال الذكية</p>
          </div>
        </div>

        <div className="px-4 mb-8">
           <div className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${isDark ? 'bg-slate-800 border-slate-700 shadow-md' : 'bg-white border-white shadow-sm'}`}>
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0 overflow-hidden">
                 {userProfile.logo ? <img src={userProfile.logo} className="w-full h-full object-cover" /> : userProfile.firstName.charAt(0)}
              </div>
              <div className="overflow-hidden text-right">
                 <h4 className="font-black text-xs uppercase truncate leading-tight">{userProfile.firstName} {userProfile.lastName}</h4>
                 <p className="text-[10px] font-bold text-blue-500 mt-1">رائد أعمال</p>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sidebar-scroll space-y-6">
           <div className="space-y-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveNav(item.id); playPositiveSound(); if(window.innerWidth < 1024) setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 transition-all group ${activeNav === item.id ? 'nav-item-active text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xl transition-transform group-hover:scale-110 ${activeNav === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.icon}</span>
                    <span className="text-sm font-black">{item.label}</span>
                  </div>
                </button>
              ))}
           </div>
        </div>

        <div className="p-6 border-t border-slate-200/50 space-y-4">
           <button onClick={toggleTheme} className="w-full flex items-center gap-4 p-3 text-slate-500 hover:text-blue-600 transition-all rounded-xl">
              <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
              <span className="text-sm font-black">{isDark ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
           </button>
           <button onClick={onLogout} className="w-full flex items-center gap-4 p-3 text-rose-500 hover:bg-rose-50 transition-all rounded-xl">
              <span className="text-xl">🚪</span>
              <span className="text-sm font-black">تسجيل الخروج</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        <header className={`h-20 border-b flex items-center justify-between px-6 shrink-0 z-30 transition-colors duration-500 ${isDark ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white/80 border-slate-100 shadow-sm'} backdrop-blur-md`}>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <h2 className="text-lg font-black tracking-tight">{NAV_ITEMS.find(i => i.id === activeNav)?.label}</h2>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={() => { setIsCustomizerOpen(true); playPositiveSound(); }}
              className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-blue-400' : 'bg-white border-slate-100 text-slate-500 hover:text-blue-600'}`}
              title="تخصيص المظهر"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
             </button>
             <button onClick={onOpenProAnalytics} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[11px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">التحليلات</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
           {activeNav === 'home' && (
             <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className={`p-6 rounded-[2rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm relative overflow-hidden group`}>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">إنجاز المسار</p>
                      <h3 className="text-4xl font-black text-blue-600">{Math.round(progress)}%</h3>
                      <div className="h-1.5 bg-slate-100/50 rounded-full overflow-hidden mt-4">
                        <div className="bg-blue-600 h-full transition-all duration-1000 group-hover:opacity-80" style={{ width: `${progress}%` }}></div>
                      </div>
                   </div>
                   
                   <div className={`p-6 rounded-[2rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm relative overflow-hidden group`}>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">الأوسمة</p>
                      <h3 className="text-4xl font-black text-amber-500">🛡️ {completedCount}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-2">دروع رقمية مكتسبة</p>
                   </div>

                   <div className={`p-6 rounded-[2rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm relative overflow-hidden group`}>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">المهام المنجزة</p>
                      <h3 className="text-4xl font-black text-emerald-500">{userTasks.filter(t => t.status === 'APPROVED' || t.status === 'SUBMITTED').length}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-2">مخرجات عملية سلمت</p>
                   </div>

                   <div className={`p-6 rounded-[2rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm relative overflow-hidden group`}>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">ساعات التعلم</p>
                      <h3 className="text-4xl font-black text-purple-500">{completedCount * 2.5}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-2">إجمالي ساعات التدريب</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className={`lg:col-span-2 p-8 rounded-[3rem] border chart-card ${isDark ? 'bg-slate-900/50 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'}`}>
                      <div className="flex justify-between items-center mb-8">
                         <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">منحنى نمو المشروع</h3>
                            <p className="text-xs font-bold text-blue-500">مؤشر الجاهزية الاستثمارية</p>
                         </div>
                         <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-[10px] font-black uppercase text-slate-500">Real-time AI Index</span>
                         </div>
                      </div>
                      <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                               <defs>
                                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                               <YAxis hide domain={[0, 100]} />
                               <Tooltip 
                                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', backgroundColor: isDark ? '#1e293b' : '#fff' }}
                                  labelStyle={{ fontWeight: 'black', color: '#3b82f6' }}
                               />
                               <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className={`p-8 rounded-[3rem] border chart-card ${isDark ? 'bg-slate-900/50 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'}`}>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">توازن المهارات</h3>
                      <div className="h-[300px] w-full flex items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                               <PolarGrid stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                               <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                               <Radar
                                  name="المستوى"
                                  dataKey="A"
                                  stroke="#3b82f6"
                                  fill="#3b82f6"
                                  fillOpacity={0.6}
                               />
                               <Tooltip />
                            </RadarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>

                <div className={`p-8 rounded-[3rem] border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex justify-between items-center mb-10 px-2">
                       <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">سجل الدروع الرقمية المعتمدة</h3>
                       <span className="text-[10px] font-bold text-blue-500">يتم التوثيق على Blockchain</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                       {DIGITAL_SHIELDS.map((shield, idx) => {
                          const level = levels.find(l => l.id === shield.levelId);
                          const isEarned = level?.isCompleted;
                          return (
                            <div key={shield.id} className="flex flex-col items-center gap-3 group">
                               <div className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center text-4xl shadow-xl transition-all duration-700 relative border-4
                                  ${isEarned 
                                    ? `bg-gradient-to-br ${shield.color} border-white shield-active scale-110` 
                                    : 'bg-slate-100 border-slate-200 text-slate-300 grayscale opacity-40'
                                  }
                               `}>
                                  {isEarned && <div className="absolute inset-0 bg-white/20 rounded-[2rem] animate-pulse"></div>}
                                  <span className="relative z-10">{shield.icon}</span>
                               </div>
                               <div className="text-center">
                                  <p className={`text-[9px] font-black uppercase leading-tight ${isEarned ? 'text-blue-600' : 'text-slate-400'}`}>{shield.name}</p>
                                  {!isEarned && <p className="text-[7px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">قيد الانتظار</p>}
                               </div>
                            </div>
                          );
                       })}
                    </div>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center px-2">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black tracking-tight">نظرة عامة على المنهج</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تابع تقدمك في الرحلة الريادية</p>
                      </div>
                      <button onClick={() => setActiveNav('bootcamp')} className="text-xs font-black text-blue-600 hover:underline">عرض المنهج كاملاً</button>
                   </div>
                   <LevelsList />
                </div>
             </div>
           )}

           {activeNav === 'tasks' && (
             <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4 px-2">
                   <div className="space-y-1">
                      <h3 className="text-3xl font-black tracking-tight">المهام والتسليمات</h3>
                      <p className="text-sm font-medium text-slate-500">كل محطة تكتمل تفرض عليك مهمة عملية لضمان تطبيق ما تعلمته.</p>
                   </div>
                   <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} flex items-center gap-4`}>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase">المهام المتبقية</p>
                         <p className="text-xl font-black text-blue-600">{userTasks.filter(t => t.status === 'ASSIGNED').length}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">📝</div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {userTasks.map((task) => (
                     <div key={task.id} className={`task-card p-8 flex flex-col justify-between h-full border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} ${task.status === 'LOCKED' ? 'opacity-50 grayscale' : ''}`}>
                        <div>
                           <div className="flex justify-between items-start mb-6">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border
                                ${task.status === 'LOCKED' ? 'text-slate-400 border-slate-200' : 
                                  task.status === 'ASSIGNED' ? 'text-blue-500 border-blue-100 bg-blue-50' : 
                                  task.status === 'SUBMITTED' ? 'text-amber-600 border-amber-100 bg-amber-50' : 'text-green-600 border-green-100 bg-green-50'}
                              `}>
                                 {task.status === 'LOCKED' ? 'مغلقة' : task.status === 'ASSIGNED' ? 'مطلوبة' : task.status === 'SUBMITTED' ? 'بانتظار المراجعة' : 'مكتملة'}
                              </span>
                              <span className="text-[10px] font-black text-slate-400">Level 0{task.levelId}</span>
                           </div>
                           <h4 className="text-lg font-black mb-3">{task.title}</h4>
                           <p className="text-xs text-slate-500 leading-relaxed mb-6">{task.description}</p>
                           <div className="flex items-center gap-2 mb-8">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">المخرج المتوقع:</span>
                              <span className="text-[10px] font-black text-blue-500">{task.deliverableType}</span>
                           </div>
                        </div>

                        {task.status === 'ASSIGNED' && (
                          <button 
                            onClick={() => { setSelectedTask(task); playPositiveSound(); }}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-blue-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                          >
                             تسليم المهمة الآن
                             <svg className="w-4 h-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth={3} /></svg>
                          </button>
                        )}
                        {task.status === 'SUBMITTED' && (
                          <div className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] text-center border border-dashed border-slate-200 uppercase tracking-widest">
                             تم التسليم في {new Date(task.submission?.submittedAt || '').toLocaleDateString('ar-EG')}
                          </div>
                        )}
                        {task.status === 'LOCKED' && (
                          <div className="flex items-center justify-center gap-2 text-slate-300 font-black text-[10px] uppercase tracking-widest">
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth={3} /></svg>
                             أكمل المستوى التعليمي لفتح المهمة
                          </div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeNav === 'startup_profile' && (
             <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
                <div className={`p-10 rounded-[3rem] border ${isDark ? 'bg-slate-900/50 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'} relative overflow-hidden`}>
                    <div className="flex flex-col md:flex-row gap-12">
                       {/* Logo Upload Section */}
                       <div className="flex flex-col items-center gap-6">
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-44 h-44 rounded-[3.5rem] border-4 border-dashed cursor-pointer relative group overflow-hidden flex items-center justify-center transition-all
                              ${isDark ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}
                            `}
                          >
                             {userProfile.logo ? (
                               <img src={userProfile.logo} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Logo" />
                             ) : (
                               <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-100">
                                  <span className="text-4xl">📁</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest">رفع الشعار</span>
                               </div>
                             )}
                             <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white font-black text-xs uppercase">تغيير الصورة</span>
                             </div>
                             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">PNG, JPG (Square Preferred)</p>
                       </div>

                       {/* Basic Info Inputs */}
                       <div className="flex-1 space-y-6">
                          <div>
                             <h3 className="text-2xl font-black mb-2">هوية المشروع</h3>
                             <p className="text-sm font-medium text-slate-500">حدث بيانات مشروعك لتظهر بشكل احترافي في التقارير والشهادة.</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase pr-2">اسم الشركة الناشئة</label>
                                <input 
                                  className={`profile-input ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-400'}`} 
                                  value={userProfile.startupName}
                                  onChange={e => setUserProfile({...userProfile, startupName: e.target.value})}
                                />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase pr-2">القطاع</label>
                                <select 
                                  className={`profile-input font-bold ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-400'}`}
                                  value={userProfile.industry}
                                  onChange={e => setUserProfile({...userProfile, industry: e.target.value})}
                                >
                                   {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                             </div>
                          </div>

                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-slate-400 uppercase pr-2">وصف المشروع الاستراتيجي</label>
                             <textarea 
                               className={`profile-input h-32 resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-400'}`}
                               value={userProfile.startupDescription}
                               onChange={e => setUserProfile({...userProfile, startupDescription: e.target.value})}
                               placeholder="صف مشروعك والقيمة التي يقدمها..."
                             />
                          </div>
                       </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                       <h4 className="text-sm font-black uppercase tracking-widest text-blue-500 mb-6 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                          بيانات الفريق والتقنية
                       </h4>
                       <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase pr-2">سنة التأسيس</label>
                                <input type="number" className={`profile-input ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} value={userProfile.foundationYear} onChange={e => setUserProfile({...userProfile, foundationYear: parseInt(e.target.value)})} />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase pr-2">عدد المؤسسين</label>
                                <input type="number" className={`profile-input ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} value={userProfile.foundersCount} onChange={e => setUserProfile({...userProfile, foundersCount: parseInt(e.target.value)})} />
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-slate-400 uppercase pr-2">التقنيات المستخدمة (Stack)</label>
                             <input className={`profile-input ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} value={userProfile.technologies} onChange={e => setUserProfile({...userProfile, technologies: e.target.value})} placeholder="مثال: React, Node.js, AI Models..." />
                          </div>
                       </div>
                    </div>

                    <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                       <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                          التواصل الاحترافي
                       </h4>
                       <div className="space-y-6">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-slate-400 uppercase pr-2">البريد الإلكتروني للعمل</label>
                             <input type="email" disabled className={`profile-input opacity-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} value={userProfile.email} />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-slate-400 uppercase pr-2">رقم الجوال</label>
                             <input className={`profile-input ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} value={userProfile.phone} onChange={e => setUserProfile({...userProfile, phone: e.target.value})} />
                          </div>
                       </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                   <button onClick={() => { setActiveNav('home'); playPositiveSound(); }} className="px-10 py-4 font-black text-sm text-slate-500 hover:text-slate-900 transition-colors">إلغاء</button>
                   <button 
                    onClick={saveProfileChanges}
                    disabled={isSavingProfile}
                    className="px-16 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3"
                   >
                      {isSavingProfile ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>جاري الحفظ...</span>
                        </>
                      ) : (
                        <>
                          <span>حفظ التعديلات</span>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </>
                      )}
                   </button>
                </div>
             </div>
           )}

           {activeNav === 'calendar' && (
             <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                <div className="flex justify-between items-end mb-4 px-2">
                   <div className="space-y-1">
                      <h3 className="text-3xl font-black tracking-tight">جدول الرحلة</h3>
                      <p className="text-sm font-medium text-slate-500">نظرة عامة على الورش، الجلسات، والمواعيد النهائية.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {/* Calendar Grid */}
                   <div className={`lg:col-span-2 p-8 rounded-[3rem] border ${isDark ? 'bg-slate-900/50 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'}`}>
                      <div className="flex justify-between items-center mb-10">
                         <h4 className="text-lg font-black">مايو ٢٠٢٤</h4>
                         <div className="flex gap-2">
                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">◀</button>
                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">▶</button>
                         </div>
                      </div>

                      <div className="grid grid-cols-7 gap-2 text-center mb-4">
                        {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(day => (
                          <div key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{day}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 31 }, (_, i) => {
                          const day = i + 1;
                          const dateStr = `2024-05-${day.toString().padStart(2, '0')}`;
                          const events = CALENDAR_EVENTS.filter(e => e.date === dateStr);
                          const isToday = day === new Date().getDate();

                          return (
                            <div key={day} className={`calendar-day border ${isDark ? 'border-slate-800/50 hover:bg-slate-800' : 'border-slate-50 hover:bg-slate-50'} ${isToday ? 'bg-blue-600/5 border-blue-500/20' : ''}`}>
                               <span className={`text-xs font-black mb-1 ${isToday ? 'text-blue-500' : 'text-slate-400'}`}>{day}</span>
                               <div className="flex flex-wrap gap-1 justify-center">
                                  {events.map(e => (
                                    <div key={e.id} className={`w-1.5 h-1.5 rounded-full bg-${e.color}-500 shadow-sm`}></div>
                                  ))}
                               </div>
                            </div>
                          );
                        })}
                      </div>
                   </div>

                   {/* Events Sidebar */}
                   <div className="space-y-6">
                      <div className={`p-8 rounded-[3rem] border ${isDark ? 'bg-slate-900/50 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'}`}>
                         <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">أحداث قادمة</h4>
                         <div className="space-y-6">
                            {CALENDAR_EVENTS.map(event => (
                              <div key={event.id} className="flex gap-4 group cursor-pointer">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110 bg-${event.color}-500/10 text-${event.color}-500`}>
                                    {event.type === 'workshop' ? '🎓' : event.type === 'mentorship' ? '🤝' : event.type === 'deadline' ? '⏰' : '⭐️'}
                                 </div>
                                 <div className="overflow-hidden">
                                    <h5 className={`text-xs font-black truncate leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{event.title}</h5>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{event.date} • {event.time}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeNav === 'bootcamp' && (
             <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
                <div className={`p-10 rounded-[3rem] ${isDark ? 'bg-slate-900' : 'bg-white shadow-sm'} border ${isDark ? 'border-slate-800' : 'border-slate-100'} relative overflow-hidden`}>
                   <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600/5 rounded-br-full"></div>
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                           Curriculum & Path
                        </div>
                        <h3 className="text-3xl font-black">المنهج التدريبي المعتمد</h3>
                        <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
                           لقد قمنا بتصميم هذا المنهج ليكون خارطة طريقك من مرحلة الفكرة الجنينية وحتى الجاهزية التامة لعرض مشروعك أمام المستثمرين. كل محطة تمنحك درعاً رقمياً يوثق مهاراتك المكتسبة.
                        </p>
                      </div>
                      <button 
                        onClick={() => setIsCustomizerOpen(true)}
                        className={`px-6 py-4 rounded-2xl font-black text-xs transition-all flex items-center gap-3 border shadow-md active:scale-95 shrink-0 ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-100 hover:bg-slate-50 text-blue-600'}`}
                      >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                         تخصيص أيقونات وألوان المنهج
                      </button>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center px-4">
                      <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">وحدات المنهج التدريبي</h4>
                      <span className="text-[10px] font-bold text-slate-400">{completedCount} / {levels.length} مكتملة</span>
                   </div>
                   <LevelsList />
                </div>
             </div>
           )}

           {activeNav !== 'home' && activeNav !== 'bootcamp' && activeNav !== 'calendar' && activeNav !== 'startup_profile' && activeNav !== 'tasks' && (
             <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-30 select-none">
                <div className="text-9xl mb-8 animate-float">🛠️</div>
                <h3 className="text-3xl font-black mb-4">قيد التطوير</h3>
                <p className="text-lg font-bold max-w-md mx-auto leading-relaxed">هذه الميزة ستتوفر قريباً في التحديث القادم لمنصة بيزنس ديفلوبرز الذكية.</p>
             </div>
           )}
        </div>
      </main>

      {/* Task Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in" dir="rtl">
           <div className={`w-full max-w-2xl rounded-[3rem] border shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="p-8 border-b border-slate-100/10 flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="text-2xl font-black">تسليم مخرج: {selectedTask.title}</h3>
                    <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">Submission Gateway</p>
                 </div>
                 <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors opacity-40 hover:opacity-100">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                 <div className={`p-6 rounded-2xl border-r-4 border-blue-600 ${isDark ? 'bg-slate-800/50' : 'bg-blue-50/50'}`}>
                    <h4 className="font-black text-sm mb-2 uppercase tracking-widest text-blue-500">متطلبات المهمة:</h4>
                    <p className="text-sm font-medium leading-relaxed">{selectedTask.description}</p>
                 </div>

                 <div className="space-y-4">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pr-2">تأكيد المخرج ({selectedTask.deliverableType})</label>
                    <textarea 
                       className={`w-full h-64 p-6 rounded-[2rem] outline-none border-2 transition-all font-medium text-sm resize-none shadow-inner
                        ${isDark ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white' : 'bg-slate-50 border-slate-100 focus:border-blue-500 text-slate-900'}
                       `}
                       placeholder="اكتب خلاصة العمل هنا، أو ضع رابط الملف المرفوع (Google Drive, Dropbox, إلخ)..."
                       value={submissionText}
                       onChange={e => setSubmissionText(e.target.value)}
                    />
                 </div>
              </div>

              <div className="p-8 border-t border-slate-100/10 flex justify-end gap-4 shrink-0">
                 <button onClick={() => setSelectedTask(null)} className="px-8 py-4 font-black text-xs text-slate-400">إلغاء</button>
                 <button 
                  onClick={handleTaskSubmission}
                  disabled={isSubmittingTask || !submissionText.trim()}
                  className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                 >
                   {isSubmittingTask ? (
                     <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>جاري التسليم...</span>
                     </>
                   ) : (
                     <>
                        <span>إرسال للمراجعة</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                     </>
                   )}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Customizer Modal */}
      {isCustomizerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in" dir="rtl">
           <div className={`w-full max-w-2xl rounded-[3rem] border shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="p-8 border-b border-slate-100/10 flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="text-2xl font-black">تخصيص المنهج التدريبي</h3>
                    <p className="text-slate-500 text-xs font-bold mt-1">اجعل رحلتك التعليمية فريدة ومناسبة لأسلوبك.</p>
                 </div>
                 <button onClick={() => setIsCustomizerOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors opacity-40 hover:opacity-100">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                 {levels.map((level) => {
                    const custom = customizations[level.id];
                    const currentColor = COLOR_OPTIONS.find(c => c.id === (custom?.colorId || 'blue')) || COLOR_OPTIONS[0];

                    return (
                      <div key={level.id} className={`p-6 rounded-[2rem] border transition-all ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                         <div className="flex items-center gap-4 mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${currentColor.bg} ${currentColor.text}`}>
                               {custom?.icon || level.icon}
                            </div>
                            <div className="text-right">
                               <h4 className="font-black text-sm">{level.title}</h4>
                               <p className="text-[10px] font-bold text-slate-400">Level 0{level.id}</p>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pr-1">الأيقونة (رمز تعبيري)</label>
                               <input 
                                  type="text"
                                  className={`w-full p-3 rounded-xl border outline-none text-center text-2xl ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100'}`}
                                  value={custom?.icon || level.icon}
                                  onChange={(e) => handleUpdateCustomization(level.id, { icon: e.target.value })}
                                  placeholder="أيقونة..."
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pr-1">سمة اللون</label>
                               <div className="flex flex-wrap gap-2">
                                  {COLOR_OPTIONS.map(opt => (
                                    <button 
                                      key={opt.id}
                                      onClick={() => handleUpdateCustomization(level.id, { colorId: opt.id })}
                                      className={`w-8 h-8 rounded-lg transition-all transform active:scale-90 ${opt.activeBg} ${custom?.colorId === opt.id || (!custom && opt.id === 'blue') ? 'ring-4 ring-offset-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}`}
                                      title={opt.label}
                                    />
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                    );
                 })}
              </div>

              <div className="p-8 border-t border-slate-100/10 flex justify-end shrink-0">
                 <button 
                  onClick={() => { setIsCustomizerOpen(false); playCelebrationSound(); }}
                  className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95"
                 >
                   حفظ التغييرات
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
