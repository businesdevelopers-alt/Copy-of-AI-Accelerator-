
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Calendar, 
  Briefcase, 
  BookOpen, 
  CheckSquare, 
  Compass, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  ChevronLeft,
  Search,
  Zap,
  Award,
  BarChart,
  Layout,
  ArrowRight,
  Rocket
} from 'lucide-react';
import { LevelData, UserProfile, DIGITAL_SHIELDS, SECTORS, TaskRecord, SERVICES_CATALOG, ServiceItem, ServicePackage, ServiceRequest, OpportunityAnalysis } from '../types';
import { storageService } from '../services/storageService';
import { discoverOpportunities } from '../services/geminiService';
import { playPositiveSound, playCelebrationSound } from '../services/audioService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';

interface DashboardProps {
  user: UserProfile;
  levels: LevelData[];
  onSelectLevel: (id: number) => void;
  onShowCertificate: () => void;
  onLogout?: () => void;
  onOpenProAnalytics?: () => void;
  onUpdateLevelUI?: (id: number, icon: string, color: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
  { id: 'bootcamp', label: 'المنهج التدريبي', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'tasks', label: 'المهام', icon: <CheckSquare className="w-5 h-5" /> },
  { id: 'opportunity_lab', label: 'مختبر الفرص', icon: <Compass className="w-5 h-5" /> },
  { id: 'services', label: 'الخدمات', icon: <Settings className="w-5 h-5" /> }, 
  { id: 'startup_profile', label: 'ملف الشركة', icon: <Briefcase className="w-5 h-5" /> },
];

const PRESET_COLORS = [
  { name: 'أزرق', class: 'bg-blue-600' },
  { name: 'أخضر', class: 'bg-emerald-600' },
  { name: 'أحمر', class: 'bg-rose-600' },
  { name: 'بنفسجي', class: 'bg-indigo-600' },
  { name: 'برتقالي', class: 'bg-orange-500' },
  { name: 'ذهبي', class: 'bg-amber-500' },
  { name: 'وردي', class: 'bg-pink-600' },
  { name: 'سحابي', class: 'bg-slate-500' },
];

export const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, levels, onSelectLevel, onShowCertificate, onLogout, onOpenProAnalytics, onUpdateLevelUI }) => {
  const [activeNav, setActiveNav] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('dashboard_theme_mode') as any) || 'light');
  
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUser);
  const [userTasks, setUserTasks] = useState<TaskRecord[]>([]);
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [requestDetails, setRequestDetails] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Customization States
  const [editingLevel, setEditingLevel] = useState<LevelData | null>(null);
  const [customIcon, setCustomIcon] = useState('');
  const [customColor, setCustomColor] = useState('');

  // Opportunity Lab States
  const [oppResult, setOppResult] = useState<OpportunityAnalysis | null>(null);
  const [isAnalyzingOpp, setIsAnalyzingOpp] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedCount = levels.filter(l => l.isCompleted).length;
  const progress = (completedCount / levels.length) * 100;
  const isDark = themeMode === 'dark';

  useEffect(() => {
    const session = storageService.getCurrentSession();
    if (session) {
      const tasks = storageService.getUserTasks(session.uid);
      setUserTasks(tasks);
      const requests = storageService.getUserServiceRequests(session.uid);
      setUserRequests(requests);

      const startups = storageService.getAllStartups();
      const currentStartup = startups.find(s => s.projectId === session.projectId);
      if (currentStartup) {
        setUserProfile(prev => ({
          ...prev,
          startupName: currentStartup.name,
          startupDescription: currentStartup.description,
          industry: currentStartup.industry,
          logo: localStorage.getItem(`logo_${session.uid}`) || undefined
        }));
      }
    }
  }, [activeNav]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUserProfile(prev => ({ ...prev, logo: base64 }));
        const session = storageService.getCurrentSession();
        if (session) localStorage.setItem(`logo_${session.uid}`, base64);
        playPositiveSound();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    const session = storageService.getCurrentSession();
    if (session) {
      const startups = storageService.getAllStartups();
      const index = startups.findIndex(s => s.projectId === session.projectId);
      if (index > -1) {
        startups[index].name = userProfile.startupName;
        startups[index].description = userProfile.startupDescription;
        startups[index].industry = userProfile.industry;
        localStorage.setItem('db_startups', JSON.stringify(startups));
      }
    }
    setTimeout(() => {
      setIsSaving(false);
      playCelebrationSound();
      alert('تم حفظ بيانات الشركة.');
    }, 800);
  };

  const handleTaskSubmit = () => {
    if (!selectedTask || !submissionText.trim()) return;
    const session = storageService.getCurrentSession();
    storageService.submitTask(session.uid, selectedTask.id, submissionText);
    setUserTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: 'SUBMITTED' } : t));
    setSelectedTask(null);
    setSubmissionText('');
    playPositiveSound();
  };

  const handleServiceRequest = () => {
    if (!selectedService || !selectedPackage) return;
    setIsRequesting(true);
    const session = storageService.getCurrentSession();
    
    setTimeout(() => {
      const newReq = storageService.requestService(session.uid, selectedService.id, selectedPackage.id, requestDetails);
      setUserRequests(prev => [...prev, newReq]);
      setIsRequesting(false);
      setSelectedService(null);
      setSelectedPackage(null);
      setRequestDetails('');
      playCelebrationSound();
      alert('تم إرسال طلب الخدمة بنجاح، سيقوم مستشارنا بالتواصل معك لمناقشة التفاصيل.');
    }, 1200);
  };

  const handleRunOppAnalysis = async () => {
    setIsAnalyzingOpp(true);
    playPositiveSound();
    try {
      const result = await discoverOpportunities(userProfile.startupName, userProfile.startupDescription, userProfile.industry);
      setOppResult(result);
      playCelebrationSound();
    } catch (e) {
      alert("فشل التحليل الاستراتيجي.");
    } finally {
      setIsAnalyzingOpp(false);
    }
  };

  const handleSaveCustomization = () => {
    if (editingLevel && onUpdateLevelUI) {
      onUpdateLevelUI(editingLevel.id, customIcon, customColor);
      setEditingLevel(null);
      playPositiveSound();
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans`} dir="rtl">
      <div className="fixed inset-0 -z-10 bg-mesh opacity-30" />

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 lg:static transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'} border-l backdrop-blur-xl flex flex-col shadow-2xl`}>
        <div className="p-8 text-center border-b border-white/5">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/30 overflow-hidden border-4 border-white/10"
          >
            {userProfile.logo ? (
              <img src={userProfile.logo} className="w-full h-full object-cover" />
            ) : (
              <Zap className="w-10 h-10 text-white fill-white" />
            )}
          </motion.div>
          <h2 className="font-black text-sm truncate uppercase tracking-tighter">{userProfile.startupName}</h2>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black border border-blue-500/20">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span>نشط الآن</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button 
              key={item.id} 
              onClick={() => { setActiveNav(item.id); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all group ${activeNav === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <div className="flex items-center gap-4">
                <span className={`transition-transform duration-300 ${activeNav === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </div>
              {activeNav === item.id && (
                <motion.div layoutId="activeNav" className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-3">
          <button 
            onClick={() => { const n = isDark ? 'light' : 'dark'; setThemeMode(n); localStorage.setItem('dashboard_theme_mode', n); }} 
            className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl border border-white/5 text-xs font-black hover:bg-white/5 transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{isDark ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
          </button>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 p-3.5 text-rose-500 font-black text-xs hover:bg-rose-500/10 rounded-2xl transition-all">
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 glass-dark z-40">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 glass rounded-xl">
               <Layout className="w-5 h-5" />
             </button>
             <h2 className="font-black text-2xl tracking-tighter uppercase">
               {NAV_ITEMS.find(i => i.id === activeNav)?.label}
             </h2>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-4 py-2 glass rounded-xl border-white/5">
                <Search className="w-4 h-4 text-slate-500" />
                <input type="text" placeholder="بحث سريع..." className="bg-transparent border-none outline-none text-xs font-bold w-32" />
             </div>
             <button onClick={onOpenProAnalytics} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2">
               <BarChart className="w-4 h-4" />
               <span>تحليلات PRO</span>
             </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <AnimatePresence mode="wait">
             <motion.div 
               key={activeNav}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="min-h-full"
             >
                {activeNav === 'home' && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.1 }}
                         className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] text-white shadow-2xl relative overflow-hidden"
                       >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px]" />
                          <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                              <p className="text-[11px] font-black uppercase opacity-60 tracking-[0.2em]">نسبة الإنجاز المحققة</p>
                              <h3 className="text-4xl font-black mt-2">{Math.round(progress)}%</h3>
                            </div>
                            <div className="mt-8 space-y-2">
                               <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full bg-white shadow-[0_0_10px_white]"
                                  />
                               </div>
                               <p className="text-[10px] font-bold opacity-60">أحسنت! أنت تتقدم بشكل رائع</p>
                            </div>
                          </div>
                       </motion.div>

                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.2 }}
                         className="p-8 glass rounded-[3rem] border-white/5 relative overflow-hidden group"
                       >
                          <Award className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">الأوسمة الرقمية</p>
                          <h3 className="text-4xl font-black mt-2 flex items-center gap-1.5 flex-row-reverse justify-end">
                            <span className="text-xl text-slate-600">/ 6</span>
                            <span className="text-blue-500">{completedCount}</span>
                          </h3>
                          <div className="mt-6 flex gap-2">
                             {Array.from({length: 6}).map((_, i) => (
                               <div key={i} className={`w-2 h-2 rounded-full ${i < completedCount ? 'bg-blue-500' : 'bg-white/10'}`} />
                             ))}
                          </div>
                       </motion.div>

                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.3 }}
                         className="p-8 glass rounded-[3rem] border-white/5 relative overflow-hidden group"
                       >
                          <Zap className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">الخدمات النشطة</p>
                          <h3 className="text-4xl font-black mt-2 text-indigo-500">{userRequests.length}</h3>
                          <p className="mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">فريق التنفيذ جاهز لمساعدتك</p>
                       </motion.div>
                    </div>

                    {/* Startup Maturity Timeline */}
                    <div className="space-y-6">
                       <h3 className="text-xl font-black flex items-center gap-3">
                          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                          خريطة نضج المشروع
                       </h3>
                       <div className={`p-8 md:p-10 rounded-[2.5rem] border ${isDark ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'} relative overflow-hidden`}>
                          <div className="relative">
                             {/* Horizontal Line Background */}
                             <div className={`timeline-line ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                             <div className="timeline-line-fill" style={{ width: `${Math.max(0, (completedCount - 0.5) / 5.5) * 100}%` }}></div>

                             {/* Steps */}
                             <div className="flex justify-between relative">
                                {levels.map((level, idx) => (
                                  <div key={level.id} className="step-node flex flex-col items-center gap-4">
                                     <div 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border-4 transition-all duration-700
                                          ${level.isCompleted 
                                            ? (level.customColor || 'bg-blue-600') + ' border-white text-white shadow-lg' 
                                            : (level.isLocked ? 'bg-slate-100 border-white text-slate-300' : 'bg-white border-blue-600 text-blue-600 animate-pulse')
                                          }
                                        `}
                                     >
                                        {level.isCompleted ? '✓' : idx + 1}
                                     </div>
                                     <div className="text-center max-w-[80px]">
                                        <p className={`text-[10px] font-black leading-tight uppercase ${level.isLocked ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                           {level.title.split(' ')[0]}
                                        </p>
                                        {!level.isLocked && !level.isCompleted && (
                                           <span className="text-[8px] font-bold text-blue-500 animate-pulse">المحطة الحالية</span>
                                        )}
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Training Curriculum Compact List */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-center px-2">
                          <h3 className="text-xl font-black">المنهج التدريبي</h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{completedCount} من {levels.length} مكتمل</span>
                       </div>
                       
                       <div className={`rounded-[2rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm overflow-hidden`}>
                          <div className="divide-y divide-slate-100/10">
                            {levels.map((level) => (
                              <div 
                                key={level.id} 
                                onClick={() => !level.isLocked && onSelectLevel(level.id)} 
                                className={`level-row p-4 flex items-center justify-between transition-all ${level.isLocked ? 'opacity-40 grayscale cursor-not-allowed is-locked' : 'cursor-pointer hover:bg-slate-50/5'} group`}
                              >
                                 <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${level.isCompleted ? (level.customColor || 'bg-green-100') + ' text-white' : 'bg-slate-50 text-slate-400'}`}>
                                       {level.isCompleted ? '✓' : level.icon}
                                    </div>
                                    <div className="truncate">
                                      <h4 className="font-black text-sm text-slate-800 group-hover:text-blue-600 transition-colors dark:text-slate-100">
                                        <span className="text-slate-400 text-[10px] font-bold ml-2">0{level.id}.</span>
                                        {level.title}
                                      </h4>
                                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{level.description}</p>
                                    </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-4 shrink-0 pr-4">
                                    {!level.isLocked && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setEditingLevel(level); setCustomIcon(level.icon); setCustomColor(level.customColor || ''); playPositiveSound(); }}
                                        className="edit-btn p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-blue-600 transition-all text-xs"
                                        title="تخصيص المظهر"
                                      >
                                        🎨
                                      </button>
                                    )}
                                    {level.isLocked ? (
                                       <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                          <span className="text-[10px]">🔒</span>
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">مغلق</span>
                                       </div>
                                    ) : (
                                       <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${level.isCompleted ? 'bg-green-50 border-green-100 text-green-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                          <span className="text-[10px]">{level.isCompleted ? '●' : '→'}</span>
                                          <span className="text-[9px] font-black uppercase tracking-tighter">{level.isCompleted ? 'مكتمل' : 'دخول'}</span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeNav === 'opportunity_lab' && (
                  <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                     <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black border border-blue-100 uppercase tracking-widest">
                           AI Opportunity Agent
                        </div>
                        <h3 className="text-4xl font-black">مختبر الفرص والنمو</h3>
                        <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                           استخدم وكيل الذكاء الاصطناعي لاكتشاف أسواق جغرافية جديدة أو شرائح عملاء غير مخدومة لمشروعك.
                        </p>
                     </div>

                     {!oppResult && !isAnalyzingOpp && (
                       <div className="flex flex-col items-center py-20 space-y-10">
                          <div className="relative w-40 h-40">
                             <div className="absolute inset-0 border-4 border-slate-200 rounded-full border-dashed"></div>
                             <div className="absolute inset-0 flex items-center justify-center text-6xl">🧭</div>
                          </div>
                          <button 
                            onClick={handleRunOppAnalysis}
                            className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-blue-600 transition-all transform active:scale-95 flex items-center gap-4"
                          >
                             <span>تفعيل مسح الفرص الاستراتيجي</span>
                             <svg className="w-6 h-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          </button>
                       </div>
                     )}

                     {isAnalyzingOpp && (
                        <div className="flex flex-col items-center py-20 space-y-8">
                           <div className="relative w-48 h-48">
                              <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                              <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute w-1 h-full bg-blue-500/30 radar-scan"></div>
                                    <span className="text-4xl animate-pulse">🔎</span>
                                 </div>
                              </div>
                           </div>
                           <div className="text-center space-y-2">
                             <h4 className="text-2xl font-black text-slate-800 animate-pulse">جاري تحليل بيانات السوق العالمي...</h4>
                             <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Scanning Untapped Ecosystems via Gemini 3 Pro</p>
                           </div>
                        </div>
                     )}

                     {oppResult && (
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
                         <div className="lg:col-span-2 space-y-8">
                            <h4 className="text-xl font-black flex items-center gap-3">
                               <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                               الأسواق الجغرافية المقترحة
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {oppResult.newMarkets.map((m, i) => (
                                 <div key={i} className={`p-8 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative group ${isDark ? 'bg-slate-900 border-slate-800' : ''}`}>
                                    <div className="flex justify-between items-start mb-6">
                                       <h5 className="text-xl font-black text-blue-600">{m.region}</h5>
                                       <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${m.entryBarrier === 'Low' ? 'bg-green-100 text-green-600' : m.entryBarrier === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>عائق: {m.entryBarrier}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">{m.reasoning}</p>
                                    <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">العائد المتوقع:</span>
                                       <span className="text-xs font-black text-emerald-600">{m.potentialROI}</span>
                                    </div>
                                 </div>
                               ))}
                            </div>

                            <h4 className="text-xl font-black flex items-center gap-3 pt-8">
                               <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                               شرائح العملاء غير المخدومة
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {oppResult.untappedSegments.map((s, i) => (
                                 <div key={i} className={`p-8 bg-slate-50 rounded-[3rem] border border-slate-100 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                                    <h5 className="text-lg font-black text-slate-800 mb-4">{s.segmentName}</h5>
                                    <p className="text-xs text-slate-500 font-bold mb-4">الاحتياج المفقود: {s.needs}</p>
                                    <div className="p-4 bg-white/60 rounded-2xl border border-white">
                                       <p className="text-xs font-black text-blue-600 mb-1">استراتيجية الوصول:</p>
                                       <p className="text-[11px] text-slate-700 font-medium">{s.strategy}</p>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-8">
                            <div className={`p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden group`}>
                               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px]"></div>
                               <h4 className="text-lg font-black mb-6 flex items-center gap-3">
                                  <span className="text-2xl">🌊</span>
                                  استراتيجية المحيط الأزرق
                               </h4>
                               <p className="text-base font-medium leading-loose italic opacity-95">
                                  "{oppResult.blueOceanIdea}"
                                </p>
                            </div>

                            <div className="p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                               <h4 className="text-lg font-black mb-6 flex items-center gap-3">
                                  <span className="text-2xl">⚡</span>
                                  فوز سريع (Quick Win)
                               </h4>
                               <p className="text-base font-medium leading-relaxed mb-8">
                                  {oppResult.quickWinAction}
                               </p>
                               <button className="w-full py-4 bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-2xl font-black text-xs transition-all active:scale-95">
                                   ابدأ التنفيذ الآن
                                </button>
                             </div>
                          </div>
                       </div>
                     )}
                  </div>
                )}

                {activeNav === 'services' && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-20">
                     <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                        <div className="space-y-2 text-right">
                           <h3 className="text-4xl font-black tracking-tight">خدمات التنفيذ الاحترافية</h3>
                           <p className="text-slate-500 max-w-2xl font-medium leading-relaxed">
                             البرنامج مجاني بالكامل، ولكننا نوفر لك وصولاً حصرياً لخبراء تنفيذيين لمساعدتك في بناء مخرجاتك بجودة استثمارية.
                           </p>
                        </div>
                        {userRequests.length > 0 && (
                          <div className="px-6 py-3 glass rounded-2xl flex items-center gap-4">
                             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                             <span className="text-xs font-black text-blue-400">لديك {userRequests.length} طلبات نشطة</span>
                          </div>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {SERVICES_CATALOG.map((service, idx) => (
                          <motion.div 
                            key={service.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group p-10 glass rounded-[3rem] border-white/5 flex flex-col justify-between hover:border-blue-500/30 transition-all text-right"
                          >
                             <div>
                                <div className="flex justify-between items-start mb-8">
                                   <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                                      {service.icon}
                                   </div>
                                   <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${service.category === 'Design' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : service.category === 'Tech' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                      {service.category}
                                   </span>
                                </div>
                                <h4 className="text-2xl font-black mb-4 leading-tight group-hover:text-blue-400 transition-colors">{service.title}</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 h-20 overflow-hidden line-clamp-3">{service.description}</p>
                                
                                <div className="space-y-4 mb-10">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">خيارات الأداء:</p>
                                   {service.packages.map(pkg => (
                                     <div key={pkg.id} className="flex justify-between items-center py-2 border-b border-white/5 group/pkg flex-row-reverse">
                                        <span className="text-xs font-bold text-slate-400">{pkg.name}</span>
                                        <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg group-hover/pkg:bg-blue-600 group-hover/pkg:text-white transition-all">{pkg.price}</span>
                                     </div>
                                   ))}
                                </div>
                             </div>
                             <button 
                               onClick={() => { setSelectedService(service); playPositiveSound(); }}
                               className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3"
                             >
                                <span>ابدأ التنفيذ</span>
                                <Zap className="w-4 h-4 fill-white" />
                             </button>
                          </motion.div>
                        ))}
                     </div>

                     {userRequests.length > 0 && (
                       <div className="mt-20 space-y-8">
                         <h4 className="text-xl font-black flex items-center gap-3 justify-end">
                            سجل الطلبات
                            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                         </h4>
                         <div className="glass rounded-[2.5rem] border-white/5 overflow-hidden">
                            <table className="w-full text-right">
                               <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                  <tr>
                                     <th className="px-8 py-5">المشروع / الخدمة</th>
                                     <th className="px-8 py-5">الخطة</th>
                                     <th className="px-8 py-5">تاريخ الطلب</th>
                                     <th className="px-8 py-5 text-center">الحالة</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-white/5">
                                  {userRequests.map(req => {
                                    const svc = SERVICES_CATALOG.find(s => s.id === req.serviceId);
                                    const pkg = svc?.packages.find(p => p.id === req.packageId);
                                    return (
                                      <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                                         <td className="px-8 py-6 font-black text-sm">{svc?.title}</td>
                                         <td className="px-8 py-6 text-xs font-bold text-slate-500">{pkg?.name}</td>
                                         <td className="px-8 py-6 text-xs text-slate-500 font-mono">{new Date(req.requestedAt).toLocaleDateString('ar-EG')}</td>
                                         <td className="px-8 py-6 flex justify-center">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                               {req.status === 'PENDING' ? 'قيد المراجعة' : req.status}
                                            </span>
                                         </td>
                                      </tr>
                                    );
                                  })}
                               </tbody>
                            </table>
                         </div>
                       </div>
                     )}
                  </div>
                )}

                {activeNav === 'startup_profile' && (
                  <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                     <div className="glass p-12 rounded-[4rem] border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] -z-10" />
                        
                        <div className="flex flex-col md:flex-row gap-16">
                           <div className="flex flex-col items-center gap-6">
                              <motion.div 
                                whileHover={{ scale: 1.02 }}
                                onClick={() => fileInputRef.current?.click()} 
                                className="w-48 h-48 rounded-[3.5rem] bg-white/5 border-4 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all overflow-hidden relative group"
                              >
                                 {userProfile.logo ? (
                                   <img src={userProfile.logo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" title="Logo" />
                                 ) : (
                                    <div className="flex flex-col items-center gap-3">
                                       <Zap className="w-12 h-12 text-slate-600" />
                                       <span className="text-[10px] font-black text-slate-500">اختر شعاراً</span>
                                    </div>
                                 )}
                              </motion.div>
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Business Identity</p>
                           </div>
                           
                           <div className="flex-1 space-y-8 text-right">
                              <div className="space-y-4">
                                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">عنوان التجربة الريادية</label>
                                 <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold text-xl transition-all" value={userProfile.startupName} onChange={e => setUserProfile({...userProfile, startupName: e.target.value})} dir="rtl" />
                              </div>
                              
                              <div className="space-y-4">
                                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">القطاع السوقي المستهدف</label>
                                 <select className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold outline-none appearance-none focus:border-blue-500 transition-all cursor-pointer" value={userProfile.industry} onChange={e => setUserProfile({...userProfile, industry: e.target.value})} dir="rtl">
                                    {SECTORS.map(s => <option key={s.value} value={s.value} className="bg-slate-900">{s.label}</option>)}
                                 </select>
                              </div>
                              
                              <div className="space-y-4">
                                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">رؤية المشروع (Project Vision)</label>
                                 <textarea className="w-full h-40 bg-white/5 border border-white/10 p-6 rounded-[2rem] outline-none focus:border-blue-500 resize-none font-medium leading-relaxed" value={userProfile.startupDescription} onChange={e => setUserProfile({...userProfile, startupDescription: e.target.value})} dir="rtl" />
                              </div>
                              
                              <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSaveProfile} 
                                disabled={isSaving} 
                                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3"
                              >
                                {isSaving ? (
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                ) : (
                                  <span>حفظ المجلد الشخصي</span>
                                )}
                              </motion.button>
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {activeNav === 'tasks' && (
                  <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {userTasks.map((task, idx) => (
                          <motion.div 
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: idx * 0.05 }}
                             key={task.id} 
                             className={`p-10 glass rounded-[3rem] border-white/5 flex flex-col justify-between text-right relative overflow-hidden group ${task.status === 'LOCKED' ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                          >
                             <div className="relative z-10">
                                <div className="flex justify-between items-center mb-8">
                                   <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${task.status === 'ASSIGNED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : task.status === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                      {task.status}
                                   </span>
                                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">PHASE 0{task.levelId}</span>
                                </div>
                                <h4 className="font-black text-2xl mb-4 group-hover:text-blue-400 transition-colors">{task.title}</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">{task.description}</p>
                             </div>
                             
                             {task.status === 'ASSIGNED' && (
                               <motion.button 
                                 whileHover={{ x: -10 }}
                                 onClick={() => { setSelectedTask(task); playPositiveSound(); }} 
                                 className="w-full py-4 glass border-white/10 hover:border-blue-500/50 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 group/btn transition-all"
                               >
                                 <span>تسليم المخرج</span>
                                 <ArrowRight className="w-4 h-4 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                               </motion.button>
                             )}
                             
                             {task.status === 'SUBMITTED' && (
                                <div className="text-center text-[10px] font-black text-slate-500 py-4 border border-dashed border-white/10 rounded-2xl uppercase tracking-widest">
                                  In Review Process
                                </div>
                             )}

                             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors" />
                          </motion.div>
                        ))}
                     </div>
                  </div>
                )}
             </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {/* Level Customization Modal */}
        {editingLevel && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl text-right">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="max-w-md w-full p-10 rounded-[3.5rem] glass-dark border-white/10 shadow-2xl"
             >
                <h3 className="text-2xl font-black mb-8 tracking-tighter uppercase">تخصيص المسار</h3>
                
                <div className="space-y-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الرمز التعبيري المحطة</label>
                      <input 
                         className="w-full bg-white/5 border border-white/10 p-6 text-4xl text-center rounded-[2.5rem] outline-none focus:border-blue-500 transition-all font-sans"
                         value={customIcon}
                         onChange={e => setCustomIcon(e.target.value.substring(0, 4))}
                      />
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">سمة اللون البصري</label>
                      <div className="grid grid-cols-4 gap-4">
                         {PRESET_COLORS.map(color => (
                            <button 
                               key={color.name}
                               onClick={() => setCustomColor(color.class)}
                               className={`w-12 h-12 rounded-2xl transition-all border-4 ${color.class} ${customColor === color.class ? 'border-white ring-4 ring-blue-500/50 scale-110' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
                               title={color.name}
                            />
                         ))}
                      </div>
                   </div>

                   <div className="pt-6 flex gap-4">
                      <button onClick={() => setEditingLevel(null)} className="flex-1 py-5 font-black text-slate-500 hover:text-white transition-colors">إلغاء</button>
                      <button onClick={handleSaveCustomization} className="flex-[2] py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black shadow-2xl shadow-blue-600/30 transition-all active:scale-95">حفظ التغييرات</button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}

        {/* Service Request Modal */}
        {selectedService && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl text-right">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 30 }}
               className="max-w-4xl w-full p-12 rounded-[4rem] glass-dark border-white/10 shadow-3xl"
             >
                <div className="flex justify-between items-start mb-10">
                   <button onClick={() => { setSelectedService(null); setSelectedPackage(null); }} className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all transform hover:rotate-90">✕</button>
                   <div>
                      <h3 className="text-4xl font-black mb-2 tracking-tight">{selectedService.title}</h3>
                      <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Excellence Configuration</p>
                   </div>
                </div>

                <div className="space-y-10">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {selectedService.packages.map(pkg => (
                        <button 
                          key={pkg.id} 
                          onClick={() => { setSelectedPackage(pkg); playPositiveSound(); }} 
                          className={`p-8 rounded-[3.5rem] border-2 text-right transition-all flex flex-col gap-4 relative overflow-hidden group
                            ${selectedPackage?.id === pkg.id ? 'border-blue-600 bg-blue-600/10 shadow-2xl' : 'border-white/5 bg-white/5 hover:border-white/20'}
                          `}
                        >
                           {selectedPackage?.id === pkg.id && (
                             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-6 left-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">✓</motion.div>
                           )}
                           <h5 className="font-black text-2xl tracking-tight">{pkg.name}</h5>
                           <p className="text-base text-blue-400 font-black tracking-widest">{pkg.price}</p>
                           <ul className="mt-4 space-y-3">
                              {pkg.features.map((f, i) => (
                                <li key={i} className="text-xs font-bold text-slate-500 flex items-center gap-2 justify-end">
                                  <span>{f}</span>
                                  <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                                </li>
                              ))}
                           </ul>
                        </button>
                      ))}
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ملاحظات إضافية للتنفيذ</label>
                      <textarea 
                         className="w-full h-32 bg-white/5 border border-white/10 p-6 rounded-[2.5rem] outline-none focus:border-blue-500 transition-all resize-none font-medium text-lg font-sans"
                         placeholder="مثال: تفضيلات الألوان، رابط شعار حالي، أو أي ملاحظات تقنية تساعد فريقنا..."
                         value={requestDetails}
                         onChange={e => setRequestDetails(e.target.value)}
                      />
                   </div>

                   <button 
                     disabled={!selectedPackage || isRequesting}
                     onClick={handleServiceRequest}
                     className="w-full py-7 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-[2.5rem] font-black text-xl transition-all shadow-3xl shadow-blue-600/40 flex items-center justify-center gap-4 active:scale-[0.98]"
                   >
                     {isRequesting ? (
                       <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                       <>
                         <span>تأكيد طلب التميز</span>
                         <Rocket className="w-7 h-7" />
                       </>
                     )}
                   </button>
                </div>
             </motion.div>
          </div>
        )}

        {/* Task Submission Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl text-right">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 50 }}
              className="max-w-2xl w-full p-12 rounded-[4.5rem] glass-dark border-white/10 shadow-3xl"
            >
               <div className="flex justify-between items-start mb-8">
                  <button onClick={() => setSelectedTask(null)} className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all">✕</button>
                   <div>
                      <h3 className="text-4xl font-black mb-1 tracking-tighter">{selectedTask.title}</h3>
                      <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Deliverable Submission</p>
                   </div>
                </div>

                <div className="space-y-10">
                   <textarea 
                      className="w-full h-56 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] outline-none focus:border-blue-500 transition-all resize-none font-medium text-lg leading-relaxed font-sans"
                      placeholder="الصق رابط المخرج (Google Drive, Figma, GitHub) أو صف مخرجاتك هنا بالتفصيل..."
                      value={submissionText}
                      onChange={e => setSubmissionText(e.target.value)}
                   />
                   
                   <div className="flex gap-6">
                      <button onClick={() => setSelectedTask(null)} className="flex-1 py-6 font-black text-slate-500 hover:text-white transition-colors text-lg">إلغاء</button>
                      <button 
                        onClick={() => handleTaskSubmit()} 
                        disabled={!submissionText.trim()}
                        className="flex-[2] py-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-[2rem] font-black shadow-2xl shadow-blue-600/40 transition-all active:scale-95 text-lg"
                      >
                         إرسال للمراجعة النهائية
                      </button>
                   </div>
                </div>
             </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
