
import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { StartupRecord, UserRecord, ActivityLogRecord, RadarMetrics } from '../types';
import { playPositiveSound } from '../services/audioService';

interface StaffPortalProps {
  onBack: () => void;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'startups' | 'logs' | 'stats'>('startups');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStartup, setSelectedStartup] = useState<StartupRecord | null>(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('dashboard_theme_mode') === 'dark');

  const startups = useMemo(() => storageService.getAllStartups(), []);
  const users = useMemo(() => storageService.getAllUsers(), []);
  const logs = useMemo(() => storageService.getAllLogs(), []);

  const filteredStartups = startups.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin2024') {
      setIsAuthenticated(true);
      playPositiveSound();
    } else {
      alert('كلمة مرور خاطئة');
    }
  };

  const handleUpdateStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    storageService.updateStartupStatus(id, status);
    setSelectedStartup(prev => prev ? { ...prev, status } : null);
    playPositiveSound();
  };

  // Radar Chart Helper
  const getRadarPoints = (m: RadarMetrics, scale: number = 60, center: number = 80) => {
    const keys: (keyof RadarMetrics)[] = ['readiness', 'analysis', 'tech', 'personality', 'strategy', 'ethics'];
    const angleStep = (Math.PI * 2) / keys.length;
    return keys.map((key, i) => {
      const value = (m[key] / 100) * scale;
      const angle = i * angleStep - Math.PI / 2;
      return `${center + value * Math.cos(angle)},${center + value * Math.sin(angle)}`;
    }).join(' ');
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`max-w-md w-full p-10 rounded-[2.5rem] shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} animate-fade-in-up`}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-white text-3xl font-black">S</div>
            <h2 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>بوابة الموظفين</h2>
            <p className="text-slate-500 font-bold mt-2">نظام الإدارة والسيطرة المركزي</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">كلمة مرور النظام</label>
              <input 
                type="password" 
                autoFocus
                className={`w-full px-5 py-4 rounded-2xl outline-none border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95">دخول المركز</button>
            <button type="button" onClick={onBack} className="w-full py-2 text-slate-400 font-bold text-sm">العودة للرئيسية</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'bg-[#020617] text-slate-100' : 'bg-white text-slate-900'} transition-colors duration-500`} dir="rtl">
      {/* Top Navigation */}
      <header className={`px-8 h-20 border-b flex items-center justify-between sticky top-0 z-40 backdrop-blur-md ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
             </div>
             <h1 className="text-xl font-black tracking-tight">إدارة المسرعة</h1>
          </div>
          <nav className="flex gap-4">
             {['startups', 'logs', 'stats'].map(tab => (
               <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {tab === 'startups' ? 'قاعدة الشركات' : tab === 'logs' ? 'سجل العمليات' : 'الإحصائيات العامة'}
               </button>
             ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
           <div className={`hidden md:flex flex-col text-left items-end`}>
              <p className="text-[10px] font-black text-blue-500">Administrator</p>
              <p className="text-xs font-bold opacity-60">Session: Active</p>
           </div>
           <button onClick={() => setIsDark(!isDark)} className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
              {isDark ? '☀️' : '🌙'}
           </button>
           <button onClick={() => setIsAuthenticated(false)} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-xs font-black">خروج</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto flex flex-col relative">
           <div className="p-8 flex-1 w-full">
           {activeTab === 'startups' && (
             <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-center">
                   <h2 className="text-3xl font-black">استعراض الشركات المتقدمة</h2>
                   <div className="relative w-72">
                      <input 
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl border outline-none ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                        placeholder="ابحث عن شركة..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                      <span className="absolute left-3 top-3.5 opacity-30 text-lg">🔍</span>
                   </div>
                </div>

                <div className={`rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                   <table className="w-full text-right">
                      <thead className={`text-[10px] font-black text-slate-400 uppercase tracking-widest border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                         <tr>
                            <th className="px-8 py-5">الشركة</th>
                            <th className="px-8 py-5">القطاع</th>
                            <th className="px-8 py-5">المرحلة</th>
                            <th className="px-8 py-5">مؤشر AI</th>
                            <th className="px-8 py-5">الحالة</th>
                            <th className="px-8 py-5">الإجراءات</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/10">
                         {filteredStartups.map(startup => (
                           <tr key={startup.projectId} className={`group hover:bg-blue-500/5 transition-colors cursor-pointer ${selectedStartup?.projectId === startup.projectId ? (isDark ? 'bg-blue-500/10' : 'bg-blue-50') : ''}`} onClick={() => setSelectedStartup(startup)}>
                              <td className="px-8 py-6">
                                 <div className="font-black text-sm">{startup.name}</div>
                                 <div className="text-[10px] text-slate-500">ID: {startup.projectId}</div>
                              </td>
                              <td className="px-8 py-6 font-bold text-xs">{startup.industry}</td>
                              <td className="px-8 py-6 font-bold text-xs">
                                 {startup.stage === 'Idea' ? '💡 فكرة' : startup.stage === 'Prototype' ? '🧩 نموذج' : '🚀 منتج'}
                              </td>
                              <td className="px-8 py-6">
                                 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border
                                    ${startup.aiClassification === 'Green' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                      startup.aiClassification === 'Yellow' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}
                                 `}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${startup.aiClassification === 'Green' ? 'bg-green-500' : startup.aiClassification === 'Yellow' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                    {startup.aiClassification}
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`text-[10px] font-black px-2 py-1 rounded border
                                    ${startup.status === 'APPROVED' ? 'text-green-500 border-green-500/30' : startup.status === 'REJECTED' ? 'text-red-500 border-red-500/30' : 'text-slate-400 border-slate-400/30'}
                                 `}>
                                    {startup.status}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <button className="p-2 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100">👁️</button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

           {activeTab === 'logs' && (
             <div className="animate-fade-in space-y-8">
                <h2 className="text-3xl font-black">سجل التفاعلات اللحظي</h2>
                <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                   <div className="space-y-4">
                      {logs.map((log, i) => (
                        <div key={log.logId} className="flex items-center justify-between py-4 border-b border-slate-100/10 last:border-0">
                           <div className="flex items-center gap-4">
                              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black
                                 ${log.actionType === 'LOGIN' ? 'bg-blue-100 text-blue-600' : 
                                   log.actionType === 'TEST_SUBMIT' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}
                              `}>{log.actionType.charAt(0)}</span>
                              <div>
                                 <p className="text-sm font-bold">{log.metadata}</p>
                                 <p className="text-[10px] text-slate-500 font-mono">UID: {log.uid}</p>
                              </div>
                           </div>
                           <span className="text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'stats' && (
              <div className="animate-fade-in space-y-12">
                 <h2 className="text-3xl font-black">المؤشرات العامة للنظام</h2>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                       { label: 'إجمالي الشركات', val: startups.length, color: 'blue', icon: '🏢' },
                       { label: 'المستخدمين النشطين', val: users.length, color: 'emerald', icon: '👤' },
                       { label: 'طلبات قيد المراجعة', val: startups.filter(s => s.status === 'PENDING').length, color: 'amber', icon: '⏳' },
                       { label: 'متوسط أداء AI', val: '74%', color: 'indigo', icon: '🧠' },
                    ].map((stat, i) => (
                      <div key={i} className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                         <div className="flex justify-between items-start mb-4">
                            <span className="text-3xl">{stat.icon}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest text-${stat.color}-500`}>Real-time</span>
                         </div>
                         <h4 className="text-4xl font-black mb-1">{stat.val}</h4>
                         <p className="text-xs font-bold text-slate-500 uppercase">{stat.label}</p>
                      </div>
                    ))}
                 </div>
              </div>
           )}
           </div>

           {/* Portal Footer */}
           <footer className={`mt-auto p-8 border-t ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'} transition-colors`}>
             <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-slate-900'} flex items-center justify-center text-white text-[10px] font-black`}>S</div>
                  <p className={`text-xs font-black ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-widest`}>نظام إدارة الموارد الريادية v1.0.4</p>
                </div>
                <div className="flex gap-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> DB Synchronized</span>
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> AI Core Active</span>
                </div>
                <p className={`text-[9px] font-bold ${isDark ? 'text-slate-700' : 'text-slate-300'} uppercase tracking-[0.4em]`}>BizDev Admin Terminal • 2024</p>
             </div>
           </footer>
        </main>

        {/* Right Detail Pane (Inspector) */}
        {selectedStartup && (
          <aside className={`w-[450px] border-r shrink-0 p-8 overflow-y-auto animate-fade-in-right relative transition-all ${isDark ? 'bg-[#0f172a] border-slate-800 shadow-2xl shadow-black/50' : 'bg-slate-50 border-slate-200'}`}>
             <button onClick={() => setSelectedStartup(null)} className="absolute top-8 left-8 p-2 rounded-xl hover:bg-slate-200 transition-colors">✕</button>
             
             <div className="mb-10 text-center">
                <div className="w-24 h-24 bg-white border-4 border-blue-500 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl">
                   {selectedStartup.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-black mb-1">{selectedStartup.name}</h3>
                <p className="text-sm font-bold text-blue-500">{selectedStartup.industry}</p>
             </div>

             <div className="space-y-8">
                {/* AI Analysis Result */}
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      تحليل Gemini 3 الذكي
                   </h4>
                   <p className="text-sm font-medium leading-relaxed italic opacity-80">"{selectedStartup.aiOpinion}"</p>
                   <div className="mt-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black bg-${selectedStartup.aiClassification === 'Green' ? 'green' : 'amber'}-500 text-white shadow-sm`}>{selectedStartup.aiClassification} Strategy</span>
                   </div>
                </div>

                {/* Efficiency Radar Map */}
                <div className={`p-8 rounded-3xl border flex flex-col items-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest self-start mb-6">رادار القدرات</h4>
                   <div className="relative w-40 h-40">
                      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-lg">
                         {[1, 0.7, 0.4].map(s => (
                           <polygon key={s} points={getRadarPoints({readiness: 100, analysis: 100, tech: 100, personality: 100, strategy: 100, ethics: 100}, 70 * s)} fill="none" stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeWidth="1" />
                         ))}
                         <polygon points={getRadarPoints(selectedStartup.metrics, 70)} fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />
                      </svg>
                   </div>
                   <div className="grid grid-cols-3 gap-2 w-full mt-6">
                      {Object.entries(selectedStartup.metrics).map(([key, val]) => (
                        <div key={key} className="text-center">
                           <p className="text-[8px] font-black uppercase text-slate-500">{key.substr(0,4)}</p>
                           <p className="text-xs font-black">{val}%</p>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                   <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <p className="text-[10px] text-slate-500 font-bold mb-1">المتقدم</p>
                      <p className="text-xs font-black">رائد أعمال (مؤسس)</p>
                   </div>
                   <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <p className="text-[10px] text-slate-500 font-bold mb-1">تاريخ التسجيل</p>
                      <p className="text-xs font-black">اليوم</p>
                   </div>
                </div>

                {/* Management Actions */}
                <div className="pt-8 border-t border-slate-100/10 space-y-4">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">إدارة القرار</p>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => handleUpdateStatus(selectedStartup.projectId, 'APPROVED')}
                        disabled={selectedStartup.status === 'APPROVED'}
                        className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all active:scale-95 disabled:opacity-30"
                      >
                         قبول في المسار ✅
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedStartup.projectId, 'REJECTED')}
                        disabled={selectedStartup.status === 'REJECTED'}
                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg hover:bg-red-700 transition-all active:scale-95 disabled:opacity-30"
                      >
                         رفض الطلب ❌
                      </button>
                   </div>
                   <button className={`w-full py-4 border-2 rounded-2xl text-xs font-black ${isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-white'}`}>إرسال رسالة توجيهية لرائد الأعمال</button>
                </div>
             </div>
          </aside>
        )}
      </div>
    </div>
  );
};
