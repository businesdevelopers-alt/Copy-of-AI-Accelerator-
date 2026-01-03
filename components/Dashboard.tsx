
import React, { useState, useMemo } from 'react';
import { LevelData, UserProfile, DIGITAL_SHIELDS } from '../types';
import { playPositiveSound } from '../services/audioService';

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
  { id: 'bootcamp', label: 'المعسكر التدريبي', icon: '🚀', section: 'program' },
  { id: 'tasks', label: 'المهام والتسليمات', icon: '📝', section: 'program' },
];

export const Dashboard: React.FC<DashboardProps> = ({ user, levels, onSelectLevel, onShowCertificate, onLogout, onOpenProAnalytics, onStartAssessment }) => {
  const [activeNav, setActiveNav] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('dashboard_theme_mode') as any) || 'light');

  const completedCount = levels.filter(l => l.isCompleted).length;
  const progress = (completedCount / levels.length) * 100;
  const isDark = themeMode === 'dark';

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setThemeMode(next);
    localStorage.setItem('dashboard_theme_mode', next);
    playPositiveSound();
  };

  const currentLevelIndex = levels.findIndex(l => !l.isCompleted);
  const activeLevelId = currentLevelIndex !== -1 ? levels[currentLevelIndex].id : (completedCount === levels.length ? levels.length : -1);

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
      `}</style>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} ${isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-[#f3f4f6] border-slate-200'} border-l flex flex-col`}>
        <div className="p-8 text-center">
          <div className="flex flex-col items-center gap-1">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
             </div>
             <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight leading-none uppercase`}>بيزنس ديفلوبرز</span>
             <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">مسرعة الأعمال الذكية</p>
          </div>
        </div>

        <div className="px-4 mb-8">
           <div className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${isDark ? 'bg-slate-800 border-slate-700 shadow-md' : 'bg-white border-white shadow-sm'}`}>
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0">
                 {user.firstName.charAt(0)}
              </div>
              <div className="overflow-hidden text-right">
                 <h4 className="font-black text-xs uppercase truncate leading-tight">{user.firstName} {user.lastName}</h4>
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
          <button onClick={onOpenProAnalytics} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[11px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">التحليلات</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
           {activeNav === 'home' && (
             <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">خزانة الأوسمة</p>
                      <h3 className="text-4xl font-black text-amber-500">🛡️ {completedCount}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-2">دروع رقمية مكتسبة</p>
                   </div>

                   <div className={`p-6 rounded-[2rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm relative overflow-hidden group`}>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">المحطات</p>
                      <h3 className="text-4xl font-black text-emerald-500">{completedCount}<span className="text-sm text-slate-400">/6</span></h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-2">مكتملة بنجاح</p>
                   </div>
                </div>

                {/* Digital Shields / Badges Showcase */}
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

                {/* Levels List View */}
                <div className="space-y-6">
                   <div className="flex justify-between items-center px-2">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black tracking-tight">المنهج التدريبي المفتوح</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تجاوز المستويات لفتح الدروع</p>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      {levels.map((level, idx) => (
                        <div 
                          key={level.id}
                          onClick={() => onSelectLevel(level.id)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group cursor-pointer
                            ${isDark ? 'bg-slate-900 border-slate-800 hover:border-blue-500 hover:bg-slate-800 shadow-md' : 'bg-white border-slate-100 hover:border-blue-400 hover:shadow-lg shadow-sm'}
                          `}
                        >
                           <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-2xl shadow-inner transition-colors
                             ${level.isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}
                           `}>
                              {level.isCompleted ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              ) : level.icon}
                           </div>

                           <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${level.isCompleted ? 'text-green-500' : 'text-blue-500'}`}>Level 0{level.id}</span>
                                {level.isCompleted && <span className="text-[10px] text-amber-500 font-black">● الدرع مكتسب</span>}
                              </div>
                              <h4 className="text-sm font-black truncate">{level.title}</h4>
                              <p className={`text-[11px] font-medium leading-tight truncate max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{level.description}</p>
                           </div>

                           <div className="hidden sm:flex items-center gap-4 px-4 shrink-0">
                              {level.isCompleted ? (
                                <span className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 uppercase tracking-widest">Completed</span>
                              ) : (
                                <div className="flex items-center gap-2 group-hover:translate-x-[-4px] transition-transform">
                                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Open Unit</span>
                                   <svg className="w-4 h-4 text-blue-600 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </div>
                              )}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {progress === 100 && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden text-center group">
                     <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="relative z-10 space-y-4">
                        <div className="text-4xl mb-2 animate-bounce">🎓</div>
                        <h3 className="text-3xl font-black">تهانينا! لقد جمعت كافة الدروع</h3>
                        <p className="text-blue-100 text-sm max-w-xl mx-auto font-medium">مشروعك الآن يمتلك الجاهزية الكاملة ومجموعتك من الدروع الرقمية جاهزة للعرض.</p>
                        <button onClick={onShowCertificate} className="mt-4 px-10 py-4 bg-white text-blue-900 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all active:scale-95">عرض وثيقة التخرج والدروع</button>
                     </div>
                  </div>
                )}
             </div>
           )}

           {activeNav !== 'home' && (
             <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-30 select-none">
                <div className="text-9xl mb-8 animate-float">🛠️</div>
                <h3 className="text-3xl font-black mb-4">قيد التطوير</h3>
                <p className="text-lg font-bold max-w-md mx-auto leading-relaxed">هذه الميزة ستتوفر قريباً في التحديث القادم لمنصة بيزنس ديفلوبرز الذكية.</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};
