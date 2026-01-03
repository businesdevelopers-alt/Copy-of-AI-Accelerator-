
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LevelData, UserProfile, DIGITAL_SHIELDS, SECTORS, TaskRecord, SERVICES_CATALOG, ServiceItem, ServicePackage, ServiceRequest } from '../types';
import { storageService } from '../services/storageService';
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
  { id: 'services', label: 'خدمات التنفيذ', icon: '🛠️' }, // تبويب جديد
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

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8f9fa] text-slate-900'}`} dir="rtl">
      <style>{`
        .service-card { transition: all 0.3s ease; }
        .service-card:hover { transform: translateY(-4px); }
        .status-badge { font-size: 9px; font-weight: 900; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; }
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
            <button key={item.id} onClick={() => { setActiveNav(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl font-bold transition-all ${activeNav === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200/50'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
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
           <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2">☰</button>
           <h2 className="font-black text-lg">{NAV_ITEMS.find(i => i.id === activeNav)?.label}</h2>
           <button onClick={onOpenProAnalytics} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg">تحليلات PRO</button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
           {activeNav === 'home' && (
             <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase opacity-60">إنجاز المسار</p>
                        <h3 className="text-4xl font-black mt-1">{Math.round(progress)}%</h3>
                      </div>
                      <div className="absolute bottom-0 left-0 h-1.5 bg-white/20 w-full"><div className="bg-white h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div></div>
                   </div>
                   <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <p className="text-[10px] font-black text-slate-400 uppercase">الأوسمة</p>
                      <h3 className="text-4xl font-black mt-1">🛡️ {completedCount}</h3>
                   </div>
                   <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <p className="text-[10px] font-black text-slate-400 uppercase">طلبات الخدمات</p>
                      <h3 className="text-4xl font-black mt-1">🛠️ {userRequests.length}</h3>
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-xl font-black">المنهج التدريبي</h3>
                   <div className="space-y-3">
                      {levels.map(level => (
                        <div key={level.id} onClick={() => !level.isLocked && onSelectLevel(level.id)} className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${level.isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:border-blue-500 shadow-sm bg-white/5'}`}>
                           <div className="flex items-center gap-4">
                              <span className="text-2xl">{level.isCompleted ? '✅' : level.icon}</span>
                              <div>
                                <h4 className="font-black text-sm">{level.title}</h4>
                                <p className="text-xs text-slate-500">{level.description}</p>
                              </div>
                           </div>
                           {level.isLocked ? <span>🔒</span> : <span className="text-blue-500 text-xs font-black">دخول ←</span>}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}

           {activeNav === 'services' && (
             <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                <div className="text-center space-y-4">
                   <h3 className="text-4xl font-black">خدمات التنفيذ الاختيارية</h3>
                   <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                     البرنامج مجاني، ولكننا نوفر لك فريقاً محترفاً لتسريع بناء مخرجاتك بجودة عالمية حسب الحاجة.
                   </p>
                </div>

                {/* Status bar for current requests */}
                {userRequests.length > 0 && (
                  <div className={`p-6 rounded-[2rem] border ${isDark ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-100'} mb-10`}>
                     <h4 className="text-xs font-black text-blue-600 uppercase mb-4 tracking-widest">طلباتك الحالية:</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {userRequests.map(req => {
                          const svc = SERVICES_CATALOG.find(s => s.id === req.serviceId);
                          return (
                            <div key={req.id} className="bg-white/80 p-4 rounded-2xl border border-white flex justify-between items-center shadow-sm">
                               <div>
                                  <p className="text-xs font-black text-slate-900">{svc?.title}</p>
                                  <p className="text-[9px] text-slate-400 font-bold">{new Date(req.requestedAt).toLocaleDateString('ar-EG')}</p>
                               </div>
                               <span className={`status-badge ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {req.status}
                               </span>
                            </div>
                          );
                        })}
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {SERVICES_CATALOG.map(service => (
                     <div key={service.id} className={`service-card p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : ''}`}>
                        <div>
                           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-inner border border-slate-50">
                              {service.icon}
                           </div>
                           <h4 className="text-2xl font-black mb-4 leading-tight">{service.title}</h4>
                           <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">{service.description}</p>
                           <div className="space-y-4 mb-10">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الباقات المتاحة:</p>
                              {service.packages.map(pkg => (
                                <div key={pkg.id} className="flex justify-between items-center py-2 border-b border-slate-50">
                                   <span className="text-xs font-bold text-slate-700">{pkg.name}</span>
                                   <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{pkg.price}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                        <button 
                          onClick={() => { setSelectedService(service); playPositiveSound(); }}
                          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                        >
                           طلب تفاصيل الخدمة
                        </button>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {/* Keep other navigations (bootcamp, tasks, etc) */}
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

           {activeNav !== 'home' && activeNav !== 'startup_profile' && activeNav !== 'tasks' && activeNav !== 'services' && (
             <div className="flex flex-col items-center justify-center py-40 opacity-20"><span className="text-9xl mb-4">🏗️</span><h3 className="text-2xl font-black">قيد التطوير</h3></div>
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
                    <p className="text-blue-500 text-xs font-bold uppercase tracking-widest">اختيار الباقة والمواصفات</p>
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
                      placeholder="اشرح احتياجك بدقة، أو اذكر أي تفاصيل تقنية..."
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
                           <span>إرسال طلب التنفيذ</span>
                           <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth={3} /></svg>
                         </>
                       )}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Task Modal - Existing */}
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
