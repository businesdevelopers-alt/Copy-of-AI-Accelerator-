
import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UserProfile, LevelData, RadarMetrics } from '../../types';

interface AdminDashboardProps {
  user?: UserProfile;
  levels?: LevelData[];
  metrics?: RadarMetrics;
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, levels, metrics, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'ai_insights'>('overview');
  const [command, setCommand] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isDark, setIsDark] = useState(() => {
    return (localStorage.getItem('dashboard_theme_mode') === 'dark');
  });

  useEffect(() => {
    const handleStorage = () => {
      setIsDark(localStorage.getItem('dashboard_theme_mode') === 'dark');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Mocked metrics if not provided (for fallback)
  const activeMetrics = metrics || {
    readiness: 75,
    analysis: 82,
    tech: 60,
    personality: 90,
    strategy: 70,
    ethics: 95
  };

  // Radar Chart Logic
  const getRadarPoints = (m: RadarMetrics, scale: number = 80, center: number = 100) => {
    const keys: (keyof RadarMetrics)[] = ['readiness', 'analysis', 'tech', 'personality', 'strategy', 'ethics'];
    const angleStep = (Math.PI * 2) / keys.length;
    return keys.map((key, i) => {
      const value = (m[key] / 100) * scale;
      const angle = i * angleStep - Math.PI / 2;
      return `${center + value * Math.cos(angle)},${center + value * Math.sin(angle)}`;
    }).join(' ');
  };

  const completedLevels = levels?.filter(l => l.isCompleted).length || 0;
  const progressPercent = Math.round((completedLevels / (levels?.length || 1)) * 100);

  const handleAIQuery = async () => {
    if (!command.trim()) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const context = user ? `المشروع: ${user.startupName}، القطاع: ${user.industry}، التقدم: ${progressPercent}%` : 'إدارة عامة';
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `أنت مستشار استراتيجي. بناءً على سياق المستخدم (${context})، أجب على الاستفسار: "${command}" باحترافية واختصار.`,
      });
      setAiResponse(response.text || "لم يتم استلام رد.");
    } catch (e) {
      setAiResponse("عذراً، حدث خطأ في التواصل مع المستشار.");
    } finally {
      setIsProcessing(false);
    }
  };

  const lifecycleStages = [
    { id: 'idea', label: 'فكرة مصدقة', status: 'completed' },
    { id: 'filtration', label: 'نظام التصفية', status: 'completed' },
    { id: 'incubation', label: 'مرحلة النمو', status: 'current' },
    { id: 'funding', label: 'جاهز للاستثمار', status: 'pending' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#020617] text-brand-primary' : 'bg-white text-brand-primary'} font-sans transition-colors duration-500 selection:bg-brand-hover/30 overflow-x-hidden`} dir="rtl">
      <div className="flex h-screen overflow-hidden">
        
        {/* Pro Sidebar */}
        <aside className={`w-80 ${isDark ? 'bg-[#0f172a] border-slate-200' : 'bg-brand-bg border-slate-200'} border-l p-8 flex flex-col gap-10 z-20`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/20 transform rotate-3">
               <svg className="w-7 h-7 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
            <div>
              <h2 className={`text-xl font-bold tracking-tight leading-none ${isDark ? 'text-brand-primary' : 'text-slate-900'}`}>نبض المشروع</h2>
              <p className="text-[10px] font-bold text-brand-hover uppercase tracking-widest mt-1">PRO Dashboard</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'overview', label: 'مؤشرات الأداء', icon: '🎯' },
              { id: 'activity', label: 'سجل النشاط الذكي', icon: '📜' },
              { id: 'ai_insights', label: 'المستشار الاستراتيجي', icon: '🧠' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all
                  ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : `${isDark ? 'text-slate-500 hover:bg-brand-primary/5 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className={`${isDark ? 'bg-[#1e293b]/50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'} p-6 rounded-[2rem] border backdrop-blur-md`}>
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-brand-primary text-xs font-bold shadow-lg">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                   <p className={`text-xs font-bold truncate ${isDark ? 'text-brand-primary' : 'text-slate-900'}`}>{user?.name || 'رائد أعمال'}</p>
                   <p className="text-[9px] text-slate-500 truncate">{user?.startupName || 'مشروع ناشئ'}</p>
                </div>
             </div>
             <button onClick={onBack} className={`w-full py-3 ${isDark ? 'bg-brand-primary/5 hover:bg-red-500/10 hover:text-red-400 border-brand-primary/20' : 'bg-slate-50 border-slate-200 hover:bg-red-50 hover:text-red-600'} border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all`}>
                إغلاق المركز
             </button>
          </div>
        </aside>

        {/* Main Dashboard Area */}
        <main className={`flex-1 overflow-y-auto flex flex-col ${isDark ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]' : 'bg-slate-50'} relative transition-colors duration-500`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
          
          <div className="max-w-6xl mx-auto p-10 flex-1 w-full">
            
            {/* Header Area */}
            <header className="flex justify-between items-end mb-12 animate-fade-in">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-brand-primary/10 text-brand-hover text-[10px] font-bold px-3 py-1 rounded-full border border-brand-primary/20 uppercase tracking-widest">Command Center</span>
                  </div>
                  <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {activeTab === 'overview' ? 'مركز القيادة والسيطرة' : activeTab === 'activity' ? 'أرشيف العمليات' : 'الذكاء الاستراتيجي'}
                  </h1>
                  <p className={`${isDark ? 'text-slate-500' : 'text-slate-500'} text-sm font-medium mt-2`}>تحليل لحظي لـ {user?.startupName} بناءً على معايير السوق.</p>
               </div>
               
               {/* Application Lifecycle Tracking */}
               <div className={`hidden lg:flex items-center gap-2 ${isDark ? 'bg-brand-primary/50 border-slate-200' : 'bg-white border-slate-200'} p-2 rounded-2xl border`}>
                  {lifecycleStages.map((stage, i) => (
                    <div key={stage.id} className="flex items-center gap-2">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${stage.status === 'current' ? 'bg-brand-primary text-white shadow-lg' : stage.status === 'completed' ? (isDark ? 'text-green-500' : 'text-green-600') : 'text-slate-500'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${stage.status === 'current' ? 'bg-white animate-pulse' : stage.status === 'completed' ? 'bg-green-500' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`}></div>
                         <span className="text-[10px] font-bold whitespace-nowrap">{stage.label}</span>
                      </div>
                      {i < lifecycleStages.length - 1 && <div className={`w-4 h-px ${isDark ? 'bg-slate-100' : 'bg-slate-200'}`}></div>}
                    </div>
                  ))}
               </div>
            </header>

            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* KPIs Center: Numeric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up">
                  {[
                    { label: 'مستوى النضج', val: `${progressPercent}%`, sub: 'نحو الجاهزية', color: 'blue', icon: '📈' },
                    { label: 'أداء الاختبارات', val: '84/100', sub: 'أعلى من المتوسط', color: 'emerald', icon: '🏆' },
                    { label: 'توصيات ذكية', val: '07', sub: 'تتطلب مراجعة', color: 'amber', icon: '💡' },
                    { label: 'قوة السوق', val: '8.2', sub: 'مؤشر تنافسي', color: 'rose', icon: '🌍' },
                  ].map((s, i) => (
                    <div key={i} className={`${isDark ? 'bg-brand-primary/50 border-slate-200' : 'bg-white border-slate-200'} border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-brand-primary/20 transition-all duration-500`}>
                       <div className={`absolute top-0 left-0 w-24 h-24 bg-${s.color}-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                       <div className="flex justify-between items-start relative z-10">
                          <div>
                             <p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-brand-gray'} uppercase tracking-widest mb-1`}>{s.label}</p>
                             <h4 className={`text-3xl font-bold ${isDark ? 'text-brand-primary' : 'text-brand-primary'}`}>{s.val}</h4>
                             <p className="text-[10px] font-bold text-brand-gray mt-2">{s.sub}</p>
                          </div>
                          <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">{s.icon}</span>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Radar and Detailed Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Efficiency Radar */}
                  <div className={`${isDark ? 'bg-brand-primary/50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'} rounded-[3rem] p-8 border flex flex-col items-center animate-fade-in-up`} style={{ animationDelay: '0.1s' }}>
                     <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-8 self-start flex items-center gap-3`}>
                        <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                        رادار الكفاءة
                     </h3>
                     <div className="relative w-full aspect-square max-w-[250px]">
                        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                           {[1, 0.75, 0.5, 0.25].map((scale, idx) => (
                             <polygon 
                               key={idx} 
                               points={getRadarPoints({ readiness: 100, analysis: 100, tech: 100, personality: 100, strategy: 100, ethics: 100 }, 80 * scale)} 
                               fill="none" 
                               stroke={isDark ? "#1e293b" : "#f1f5f9"} 
                               strokeWidth="1" 
                             />
                           ))}
                           {[0, 60, 120, 180, 240, 300].map(angle => (
                             <line 
                               key={angle} 
                               x1="100" y1="100" 
                               x2={100 + 80 * Math.cos((angle * Math.PI) / 180 - Math.PI / 2)} 
                               y2={100 + 80 * Math.sin((angle * Math.PI) / 180 - Math.PI / 2)} 
                               stroke={isDark ? "#1e293b" : "#f1f5f9"} strokeWidth="1"
                             />
                           ))}
                           <polygon 
                             points={getRadarPoints(activeMetrics)} 
                             fill="rgba(59, 130, 246, 0.2)" 
                             stroke="#3b82f6" 
                             strokeWidth="3" 
                           />
                           {getRadarPoints(activeMetrics).split(' ').map((p, i) => {
                             const [x, y] = p.split(',');
                             return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />;
                           })}
                        </svg>
                        
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">الجاهزية</div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">الشخصية</div>
                     </div>
                     <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                        <div className={`${isDark ? 'bg-[#020617] border-slate-200' : 'bg-slate-50 border-slate-100'} p-3 rounded-2xl border`}>
                           <p className="text-[9px] text-slate-500 font-bold mb-1">نقاط القوة</p>
                           <p className="text-xs font-bold text-green-500">العقلية الريادية</p>
                        </div>
                        <div className={`${isDark ? 'bg-[#020617] border-slate-200' : 'bg-slate-50 border-slate-100'} p-3 rounded-2xl border`}>
                           <p className="text-[9px] text-slate-500 font-bold mb-1">فرص التحسين</p>
                           <p className="text-xs font-bold text-brand-primary">العمق التقني</p>
                        </div>
                     </div>
                  </div>

                  {/* Growth Benchmarks */}
                  <div className={`${isDark ? 'bg-brand-primary/50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'} lg:col-span-2 rounded-[3rem] p-10 border relative overflow-hidden animate-fade-in-up`} style={{ animationDelay: '0.2s' }}>
                     <div className={`absolute top-0 right-0 w-full h-full ${isDark ? 'bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)]'} bg-[size:30px_30px] pointer-events-none`}></div>
                     <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-10 flex justify-between items-center relative z-10`}>
                        تطور النضج الاستراتيجي
                        <span className="text-[10px] font-bold text-brand-hover bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20">Target v1.2</span>
                     </h3>
                     
                     <div className="h-64 flex items-end gap-5 relative z-10">
                        {[45, 62, 55, 78, 85, 92].map((v, i) => (
                           <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                              <div className={`${isDark ? 'bg-slate-100' : 'bg-slate-100'} w-full rounded-2xl relative overflow-hidden h-full`}>
                                 <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-xl transition-all duration-1000 ease-out delay-300" style={{ height: `${v}%` }}></div>
                              </div>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Phase {i+1}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
               <div className="animate-fade-in-up space-y-8">
                  <div className={`${isDark ? 'bg-brand-primary/50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'} border rounded-[3rem] p-10`}>
                     <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-4 mb-10`}>
                        <span className="w-3 h-8 bg-emerald-500 rounded-full"></span>
                        سجل التفاعلات الذكية
                     </h3>
                     <div className={`space-y-6 relative before:absolute before:right-6 before:top-2 before:bottom-2 before:w-0.5 ${isDark ? 'before:bg-slate-100' : 'before:bg-slate-100'} pr-12`}>
                        {[
                           { event: 'تم اجتياز اختبار "تحليل المنافسين"', type: 'Test', date: 'منذ ساعتين', score: '92%', color: 'emerald' },
                           { event: 'المستشار الذكي قام بمراجعة تمرين "نموذج العمل"', type: 'AI Review', date: 'أمس الساعة 4:20 م', score: 'Passed', color: 'blue' },
                        ].map((item, i) => (
                           <div key={i} className="relative group">
                              <div className={`absolute -right-14 top-1 w-4 h-4 rounded-full border-4 ${isDark ? 'border-[#020617]' : 'border-white'} bg-${item.color}-500 shadow-md z-10`}></div>
                              <div className={`${isDark ? 'bg-slate-100/30 border-slate-200/50 hover:bg-slate-100/50' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'} p-5 rounded-3xl border transition-all flex justify-between items-center`}>
                                 <div>
                                    <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-brand-primary'} mb-1`}>{item.event}</p>
                                    <span className="text-[10px] text-slate-500">{item.date}</span>
                                 </div>
                                 <p className={`text-lg font-bold ${isDark ? 'text-brand-primary' : 'text-slate-900'}`}>{item.score}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'ai_insights' && (
              <div className="animate-fade-in space-y-8">
                 <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-12 rounded-[4rem] text-brand-primary shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 max-w-2xl">
                       <h3 className="text-3xl font-bold mb-4">اسأل المستشار الاستراتيجي</h3>
                       <div className="relative mt-10">
                          <input 
                            type="text" 
                            className="w-full pl-40 pr-8 py-6 bg-brand-primary/10 backdrop-blur-md border border-brand-primary/30 text-white rounded-[2rem] outline-none shadow-2xl font-bold placeholder-blue-200 focus:bg-white focus:text-slate-900 transition-all"
                            placeholder="كيف أبدأ أول جولة استثمارية؟"
                            value={command}
                            onChange={e => setCommand(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAIQuery()}
                          />
                          <button 
                            onClick={handleAIQuery}
                            disabled={isProcessing || !command.trim()}
                            className="absolute left-3 top-3 bottom-3 bg-white text-brand-primary px-10 rounded-2xl font-bold text-xs transition-all flex items-center gap-3 active:scale-95 shadow-lg"
                          >
                             {isProcessing ? 'جاري التحليل...' : 'تحليل الاستفسار'}
                          </button>
                       </div>
                    </div>
                 </div>

                 {aiResponse && (
                    <div className={`${isDark ? 'bg-white/80 border-brand-primary/20' : 'bg-white border-brand-primary shadow-xl'} backdrop-blur-xl border p-10 rounded-[3.5rem] animate-fade-in-up relative`}>
                       <p className={`text-xl font-medium leading-loose ${isDark ? 'text-slate-200' : 'text-brand-primary'} italic`}>"{aiResponse}"</p>
                    </div>
                 )}
              </div>
            )}
          </div>

          {/* Footer Area */}
          <footer className={`p-10 border-t ${isDark ? 'border-slate-200 bg-brand-bg/30' : 'border-slate-200 bg-brand-primary/50'}`}>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-brand-primary' : 'bg-white'} flex items-center justify-center text-white text-[10px] font-bold`}>BD</div>
                <p className={`text-xs font-bold ${isDark ? 'text-brand-gray' : 'text-slate-600'} uppercase tracking-widest`}>مركز القيادة والسيطرة الاستراتيجي</p>
              </div>
              <div className="flex gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <a href="#" className="hover:text-brand-hover transition-colors">مؤشرات القطاع</a>
                <a href="#" className="hover:text-brand-hover transition-colors">قاعدة المعرفة</a>
                <a href="#" className="hover:text-brand-hover transition-colors">طلب استشارة خاصة</a>
              </div>
              <p className={`text-[9px] font-bold ${isDark ? 'text-brand-primary' : 'text-slate-600'} uppercase tracking-[0.5em]`}>Business Developers Hub • 2024</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
