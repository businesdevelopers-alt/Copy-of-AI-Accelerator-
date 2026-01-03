
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LevelData, UserProfile, DIGITAL_SHIELDS, SECTORS, TaskRecord, SERVICES_CATALOG, ServiceItem, ServicePackage, ServiceRequest, OpportunityAnalysis } from '../types';
import { storageService } from '../services/storageService';
import { discoverOpportunities } from '../services/geminiService';
import { playPositiveSound, playCelebrationSound } from '../services/audioService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';

interface DashboardProps {
  user: UserProfile;
  levels: LevelData[];
  onSelectLevel: (id: number) => void;
  onShowCertificate: () => void;
  onLogout?: () => void;
  onOpenProAnalytics?: () => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'الرئيسية', icon: '🏠' },
  { id: 'calendar', label: 'التقويم', icon: '📅' },
  { id: 'startup_profile', label: 'ملف الشركة', icon: '📈' },
  { id: 'bootcamp', label: 'المنهج التدريبي', icon: '📚' },
  { id: 'tasks', label: 'المهام والتسليمات', icon: '📝' },
  { id: 'opportunity_lab', label: 'مختبر الفرص', icon: '🧭' },
  { id: 'services', label: 'خدمات التنفيذ', icon: '🛠️' }, 
];

export const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, levels, onSelectLevel, onShowCertificate, onLogout, onOpenProAnalytics }) => {
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

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8f9fa] text-slate-900'}`} dir="rtl">
      <style>{`
        .service-card { transition: all 0.3s ease; }
        .service-card:hover { transform: translateY(-4px); }
        .status-badge { font-size: 9px; font-weight: 900; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; }
        .active-dot { position: relative; }
        .active-dot::after { content: ''; position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #22c55e; border-radius: 50%; border: 2px solid white; }
        .radar-scan { animation: scan 3s linear infinite; }
        @keyframes scan { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Compact List Styles */
        .level-row { transition: all 0.2s ease; border-right: 4px solid transparent; }
        .level-row:not(.is-locked):hover { border-right-color: #3b82f6; transform: scale(1.005); }
      `}</style>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 lg:static transition-transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} border-l flex flex-col`}>
        <div className="p-8 text-center border-b border-slate-200/10">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
            {userProfile.logo ? <img src={userProfile.logo} className="w-full h-full object-cover" /> : <span className="text-white text-2xl font-black">BD</span>}
          </div>
          <h2 className="font-black text-sm truncate">{userProfile.startupName}</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button 
              key={item.id} 
              onClick={() => { setActiveNav(item.id); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all ${activeNav === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200/50'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </div>
              {item.id === 'services' && userRequests.length > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  {userRequests.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-200/10 space-y-2">
          <button onClick={() => { const n = isDark ? 'light' : 'dark'; setThemeMode(n); localStorage.setItem('dashboard_theme_mode', n); }} className="w-full p-3 rounded-xl border border-slate-200/20 text-xs font-bold">{isDark ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي'}</button>
          <button onClick={onLogout} className="w-full p-3 text-rose-500 font-bold text-xs">تسجيل الخروج</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-slate-200/10 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md">
           <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-2xl">☰</button>
           <h2 className="font-black text-lg">{NAV_ITEMS.find(i => i.id === activeNav)?.label}</h2>
           <button onClick={onOpenProAnalytics} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg">تحليلات PRO</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           {activeNav === 'home' && (
             <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                   <div className="p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase opacity-60">إنجاز المسار</p>
                        <h3 className="text-3xl font-black mt-1">{Math.round(progress)}%</h3>
                      </div>
                      <div className="absolute bottom-0 left-0 h-1.5 bg-white/20 w-full"><div className="bg-white h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div></div>
                   </div>
                   <div className={`p-6 rounded-[2rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <p className="text-[10px] font-black text-slate-400 uppercase">الأوسمة</p>
                      <h3 className="text-3xl font-black mt-1">🛡️ {completedCount}</h3>
                   </div>
                   <div className={`p-6 rounded-[2rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <p className="text-[10px] font-black text-slate-400 uppercase">طلبات الخدمات</p>
                      <h3 className="text-3xl font-black mt-1">🛠️ {userRequests.length}</h3>
                   </div>
                </div>

                {/* Bootcamp Section with Refactored Compact List */}
                <div className="space-y-4">
                   <div className="flex justify-between items-center px-2">
                      <h3 className="text-xl font-black">المنهج التدريبي</h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{completedCount} من {levels.length} مكتمل</span>
                   </div>
                   
                   <div className={`rounded-[2rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm overflow-hidden`}>
                      <div className="divide-y divide-slate-100/10">
                        {levels.map((level, idx) => (
                          <div 
                            key={level.id} 
                            onClick={() => !level.isLocked && onSelectLevel(level.id)} 
                            className={`level-row p-4 flex items-center justify-between transition-all ${level.isLocked ? 'opacity-40 grayscale cursor-not-allowed is-locked' : 'cursor-pointer hover:bg-slate-50/5'} group`}
                          >
                             <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${level.isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
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

                       <div className={`p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden`}>
                          <h4 className="text-lg font-black mb-6 flex items-center gap-3">
                             <span className="text-2xl">⚡</span>
                             فوز سريع (Quick Win)
                          </h4>
                          <p className="text-base font-medium leading-relaxed mb-8">
                             {oppResult.quickWinAction}
                          </p>
                          <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-500 transition-all shadow-lg active:scale-95">تطبيق الإجراء الآن</button>
                       </div>

                       <button 
                         onClick={() => { setOppResult(null); playPositiveSound(); }}
                         className="w-full py-5 border-2 border-dashed border-slate-200 text-slate-400 rounded-[2rem] font-black text-sm hover:border-blue-300 hover:text-blue-500 transition-all"
                       >
                          إعادة المسح الاستراتيجي ↺
                       </button>
                    </div>
                  </div>
                )}
             </div>
           )}

           {activeNav === 'services' && (
             <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-10">
                   <div className="space-y-2">
                      <h3 className="text-4xl font-black">خدمات التنفيذ الاختيارية</h3>
                      <p className="text-slate-500 max-w-2xl font-medium leading-relaxed">
                        البرنامج مجاني، ولكننا نوفر لك فريقاً محترفاً لتسريع بناء مخرجاتك بجودة عالمية حسب الحاجة.
                      </p>
                   </div>
                   {userRequests.length > 0 && (
                     <div className="px-6 py-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-black text-blue-900">لديك {userRequests.length} طلبات قيد المتابعة</span>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {SERVICES_CATALOG.map(service => (
                     <div key={service.id} className={`service-card p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : ''}`}>
                        <div>
                           <div className="flex justify-between items-start mb-8">
                              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-slate-50">
                                 {service.icon}
                              </div>
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${service.category === 'Design' ? 'bg-purple-100 text-purple-600' : service.category === 'Tech' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                 {service.category}
                              </span>
                           </div>
                           <h4 className="text-2xl font-black mb-4 leading-tight">{service.title}</h4>
                           <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 h-20 overflow-hidden line-clamp-3">{service.description}</p>
                           
                           <div className="space-y-4 mb-10">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الباقات المقترحة:</p>
                              {service.packages.map(pkg => (
                                <div key={pkg.id} className="flex justify-between items-center py-2 border-b border-slate-50 group/pkg">
                                   <span className="text-xs font-bold text-slate-700">{pkg.name}</span>
                                   <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded group-hover/pkg:bg-blue-600 group-hover/pkg:text-white transition-colors">{pkg.price}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                        <button 
                          onClick={() => { setSelectedService(service); playPositiveSound(); }}
                          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                        >
                           تخصيص وطلب الخدمة
                        </button>
                     </div>
                   ))}
                </div>

                {userRequests.length > 0 && (
                  <div className="mt-20 space-y-8 animate-fade-in-up">
                    <h4 className="text-xl font-black flex items-center gap-3">
                       <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                       سجل طلباتك الحالية
                    </h4>
                    <div className={`rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
                       <table className="w-full text-right">
                          <thead className={`text-[10px] font-black text-slate-400 uppercase tracking-widest border-b ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                             <tr>
                                <th className="px-8 py-5">الخدمة</th>
                                <th className="px-8 py-5">الباقة</th>
                                <th className="px-8 py-5">التاريخ</th>
                                <th className="px-8 py-5">الحالة</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50/10">
                             {userRequests.map(req => {
                               const svc = SERVICES_CATALOG.find(s => s.id === req.serviceId);
                               const pkg = svc?.packages.find(p => p.id === req.packageId);
                               return (
                                 <tr key={req.id} className="hover:bg-blue-50/5">
                                    <td className="px-8 py-6 font-black text-sm">{svc?.title}</td>
                                    <td className="px-8 py-6 text-xs font-bold text-slate-500">{pkg?.name}</td>
                                    <td className="px-8 py-6 text-xs text-slate-400 font-mono">{new Date(req.requestedAt).toLocaleDateString('ar-EG')}</td>
                                    <td className="px-8 py-6">
                                       <span className={`status-badge ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
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
             <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
                <div className={`p-10 rounded-[3rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                   <div className="flex flex-col md:flex-row gap-10">
                      <div className="flex flex-col items-center gap-4">
                         <div onClick={() => fileInputRef.current?.click()} className="w-40 h-40 rounded-[3rem] border-4 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden bg-slate-50">
                            {userProfile.logo ? <img src={userProfile.logo} className="w-full h-full object-cover" /> : <span className="text-4xl">📁</span>}
                         </div>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                         <p className="text-[10px] font-black text-slate-400 uppercase">رفع شعار المشروع</p>
                      </div>
                      <div className="flex-1 space-y-6">
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400">اسم المشروع</label>
                            <input className={`w-full p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} outline-none focus:border-blue-500 font-bold`} value={userProfile.startupName} onChange={e => setUserProfile({...userProfile, startupName: e.target.value})} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400">القطاع</label>
                            <select className={`w-full p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} font-bold outline-none`} value={userProfile.industry} onChange={e => setUserProfile({...userProfile, industry: e.target.value})}>
                               {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400">وصف المشروع</label>
                            <textarea className={`w-full h-32 p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} outline-none focus:border-blue-500 resize-none font-medium`} value={userProfile.startupDescription} onChange={e => setUserProfile({...userProfile, startupDescription: e.target.value})} />
                         </div>
                         <button onClick={handleSaveProfile} disabled={isSaving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all">{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</button>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeNav === 'tasks' && (
             <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {userTasks.map(task => (
                     <div key={task.id} className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between ${task.status === 'LOCKED' ? 'opacity-40 grayscale' : ''}`}>
                        <div>
                           <div className="flex justify-between items-center mb-4">
                              <span className={`text-[10px] font-black px-2 py-1 rounded ${task.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-600' : task.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{task.status}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Level 0{task.levelId}</span>
                           </div>
                           <h4 className="font-black text-lg mb-2">{task.title}</h4>
                           <p className="text-xs text-slate-500 leading-relaxed mb-6">{task.description}</p>
                        </div>
                        {task.status === 'ASSIGNED' && <button onClick={() => { setSelectedTask(task); playPositiveSound(); }} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-xs">تسليم المخرج</button>}
                        {task.status === 'SUBMITTED' && <div className="text-center text-[10px] font-bold text-slate-400 py-3 border border-dashed rounded-xl">بانتظار المراجعة</div>}
                     </div>
                   ))}
                </div>
             </div>
           )}
        </div>
      </main>

      {/* Service Request Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
           <div className={`max-w-2xl w-full p-10 rounded-[3rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-2xl animate-fade-in-up`}>
              <div className="flex justify-between items-start mb-8">
                 <button onClick={() => { setSelectedService(null); setSelectedPackage(null); }} className="text-slate-400 hover:text-slate-900 transition-colors">✕</button>
                 <div className="text-right">
                    <h3 className="text-2xl font-black mb-1">{selectedService.title}</h3>
                    <p className="text-blue-500 text-xs font-bold uppercase tracking-widest">تخصيص الطلب</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedService.packages.map(pkg => (
                      <button 
                        key={pkg.id} 
                        onClick={() => { setSelectedPackage(pkg); playPositiveSound(); }}
                        className={`p-6 rounded-[2rem] border-2 text-right transition-all flex flex-col gap-2 relative overflow-hidden
                          ${selectedPackage?.id === pkg.id ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-slate-100 hover:border-blue-300'}
                        `}
                      >
                         {selectedPackage?.id === pkg.id && <div className="absolute top-4 left-4 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">✓</div>}
                         <h5 className="font-black text-lg">{pkg.name}</h5>
                         <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">سعر {pkg.price}</p>
                         <ul className="mt-4 space-y-1">
                            {pkg.features.map((f, i) => <li key={i} className="text-[9px] font-bold text-slate-500">• {f}</li>)}
                         </ul>
                      </button>
                    ))}
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">تفاصيل إضافية أو ملاحظات</label>
                    <textarea 
                      className={`w-full h-32 p-5 rounded-[1.5rem] border outline-none focus:border-blue-500 resize-none font-medium ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                      placeholder="اشرح احتياجك بدقة، أو اذكر أي تفاصيل تقنية تساعد فريقنا..."
                      value={requestDetails}
                      onChange={e => setRequestDetails(e.target.value)}
                    />
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => { setSelectedService(null); setSelectedPackage(null); }} className="flex-1 py-4 font-black text-slate-400">إلغاء</button>
                    <button 
                      onClick={handleServiceRequest} 
                      disabled={!selectedPackage || isRequesting} 
                      className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {isRequesting ? (
                         <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>جاري الإرسال...</span>
                         </>
                       ) : (
                         <>
                           <span>تأكيد طلب التنفيذ</span>
                           <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth={3} /></svg>
                         </>
                       )}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
           <div className={`max-w-xl w-full p-10 rounded-[3rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-2xl`}>
              <h3 className="text-2xl font-black mb-4">تسليم: {selectedTask.title}</h3>
              <p className="text-slate-500 text-sm mb-6">{selectedTask.description}</p>
              <textarea className={`w-full h-64 p-6 rounded-3xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} outline-none focus:border-blue-500 mb-6 font-medium`} placeholder="الصق رابط المخرج أو اكتب تفاصيل التسليم هنا..." value={submissionText} onChange={e => setSubmissionText(e.target.value)} />
              <div className="flex gap-4">
                 <button onClick={() => setSelectedTask(null)} className="flex-1 py-4 font-black text-slate-400">إلغاء</button>
                 <button onClick={handleTaskSubmit} disabled={!submissionText.trim()} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all">إرسال للمراجعة</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
