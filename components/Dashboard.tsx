
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { LevelData, UserProfile } from '../types';
import { playPositiveSound } from '../services/audioService';
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

const NAV_ITEMS = [
  { id: 'home', label: 'الرئيسية', icon: '🏠', section: 'main' },
  { id: 'notifications', label: 'الإشعارات', icon: '🔔', badge: 3, section: 'main' },
  { id: 'calendar', label: 'التقويم', icon: '📅', section: 'main' },
  { id: 'startup_profile', label: 'ملف الشركة', icon: '📈', section: 'main' },
  { id: 'my_requests', label: 'طلباتي', icon: '📋', section: 'main' },
  { id: 'sessions', label: 'جلساتي', icon: '👤', section: 'main' },
  { id: 'events', label: 'الفعاليات', icon: '🚀', section: 'main' },
  
  { id: 'bootcamp', label: 'المعسكر التدريبي', icon: '🚀', section: 'program' },
  { id: 'program_manager', label: 'مدير البرنامج', icon: '👥', section: 'program' },
  { id: 'tasks', label: 'المهام والتسليمات', icon: '📝', section: 'program' },
  { id: 'forms', label: 'النماذج', icon: '📄', section: 'program' },
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

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 ${isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8f9fa] text-slate-900'}`} dir="rtl">
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 0px; }
        .nav-item-active { background: ${isDark ? 'rgba(59, 130, 246, 0.1)' : '#ffffff'}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
      `}</style>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} ${isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-[#f3f4f6] border-slate-200'} border-l flex flex-col`}>
        {/* Logo Section */}
        <div className="p-8 text-center">
          <div className="flex flex-col items-center gap-1">
             <span className="text-3xl font-black text-blue-600 tracking-tighter">code</span>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">مركز ريادة الأعمال الرقمية</p>
             <p className="text-[8px] text-slate-400">Center of Digital Entrepreneurship</p>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 mb-8">
           <div className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-white shadow-sm'}`}>
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                 {user.firstName.charAt(0)}
              </div>
              <div className="overflow-hidden text-right">
                 <h4 className="font-black text-sm uppercase truncate leading-tight">{user.firstName} {user.lastName}</h4>
                 <p className="text-[11px] font-bold text-blue-500 mt-1">ريادي</p>
              </div>
           </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 sidebar-scroll space-y-6">
           {/* Section: الرئيسية */}
           <div className="space-y-1">
              {NAV_ITEMS.filter(i => i.section === 'main').map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveNav(item.id); playPositiveSound(); }}
                  className={`w-full flex items-center justify-between p-3 transition-all group ${activeNav === item.id ? 'nav-item-active text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xl transition-transform group-hover:scale-110 ${activeNav === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.icon}</span>
                    <span className="text-sm font-black">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
           </div>

           {/* Divider with Title */}
           <div className="pt-4 border-t border-slate-200/50">
              <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">CODE MVPLAB - COHORT 15</p>
              <div className="space-y-1">
                {NAV_ITEMS.filter(i => i.section === 'program').map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveNav(item.id); playPositiveSound(); }}
                    className={`w-full flex items-center gap-4 p-3 transition-all group ${activeNav === item.id ? 'nav-item-active text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <span className={`text-xl transition-transform group-hover:scale-110 ${activeNav === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.icon}</span>
                    <span className="text-sm font-black">{item.label}</span>
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200/50 space-y-4">
           <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">الخدمات</span>
           </div>
           <button onClick={toggleTheme} className="w-full flex items-center gap-4 p-3 text-slate-500 hover:text-blue-600 transition-all rounded-xl hover:bg-white/50">
              <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
              <span className="text-sm font-black">{isDark ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
           </button>
           <button onClick={onLogout} className="w-full flex items-center gap-4 p-3 text-rose-500 hover:bg-rose-50 transition-all rounded-xl">
              <span className="text-xl">🚪</span>
              <span className="text-sm font-black">تسجيل الخروج</span>
           </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header / Top Bar */}
        <header className={`h-20 border-b flex items-center justify-between px-8 shrink-0 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-slate-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <h2 className="text-xl font-black">{NAV_ITEMS.find(i => i.id === activeNav)?.label}</h2>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Startup Pulse</span>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-xs font-bold">النظام نشط</span>
                </div>
             </div>
             <button onClick={onOpenProAnalytics} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">مركز البيانات</button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           {activeNav === 'home' && (
             <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm relative overflow-hidden`}>
                      <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">التقدم في المعسكر</p>
                      <h3 className="text-4xl font-black text-blue-600">{Math.round(progress)}%</h3>
                      <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                      </div>
                   </div>
                   <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm relative overflow-hidden`}>
                      <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">المحطات المكتملة</p>
                      <h3 className="text-4xl font-black text-emerald-500">{completedCount} <span className="text-sm text-slate-400">/ {levels.length}</span></h3>
                   </div>
                   <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm relative overflow-hidden`}>
                      <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">الأوسمة الرقمية</p>
                      <h3 className="text-4xl font-black text-amber-500">💎 4</h3>
                   </div>
                </div>

                {/* Levels Grid */}
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black">المسار التدريبي المعتمد</h3>
                      {!user.hasCompletedAssessment && (
                        <button onClick={onStartAssessment} className="text-xs font-black text-blue-600 hover:underline">أكمل التقييم لفتح المسار</button>
                      )}
                   </div>
                   
                   <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${!user.hasCompletedAssessment ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                      {levels.map((level, idx) => (
                        <div 
                          key={level.id}
                          onClick={() => !level.isLocked && onSelectLevel(level.id)}
                          className={`p-8 rounded-[2.5rem] border transition-all duration-300 group ${level.isLocked ? 'bg-slate-50 border-slate-200' : `${isDark ? 'bg-slate-900 border-slate-800 hover:border-blue-500' : 'bg-white border-slate-100 hover:border-blue-400 shadow-sm'} cursor-pointer hover:-translate-y-2`}`}
                        >
                           <div className="flex justify-between items-start mb-8">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${level.isLocked ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                                 {level.isCompleted ? '✅' : level.icon}
                              </div>
                              {level.isLocked && <span className="text-xl">🔒</span>}
                           </div>
                           <h4 className={`text-xl font-black mb-3 ${level.isLocked ? 'text-slate-400' : ''}`}>{level.title}</h4>
                           <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6 line-clamp-2">{level.description}</p>
                           {!level.isLocked && (
                             <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <span className={`text-[10px] font-black uppercase ${level.isCompleted ? 'text-green-500' : 'text-blue-600'}`}>
                                  {level.isCompleted ? 'المهمة تمت' : 'ابدأ الآن'}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                   <svg className="w-4 h-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </div>
                             </div>
                           )}
                        </div>
                      ))}
                   </div>
                </div>

                {progress === 100 && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden text-center">
                     <div className="relative z-10 space-y-6">
                        <h3 className="text-4xl font-black">مبروك التخرج! 🎓</h3>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto">لقد أتممت كافة المستويات بنجاح. مشروعك الآن جاهز لمرحلة التوسع والاستثمار.</p>
                        <button onClick={onShowCertificate} className="px-12 py-5 bg-white text-blue-900 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">عرض شهادة التخرج</button>
                     </div>
                  </div>
                )}
             </div>
           )}

           {activeNav !== 'home' && (
             <div className="flex flex-col items-center justify-center h-full text-center opacity-30 select-none">
                <div className="text-9xl mb-8">🛠️</div>
                <h3 className="text-4xl font-black mb-4">قيد التطوير</h3>
                <p className="text-xl font-bold">هذه الصفحة ستكون متاحة قريباً في التحديث القادم لمسرعة CODE.</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};
