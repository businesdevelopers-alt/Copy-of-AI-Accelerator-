
import React, { useState, useEffect } from 'react';
import { playPositiveSound } from '../services/audioService';

interface AchievementsPageProps {
  onBack: () => void;
}

const STATS = [
  { label: 'شركة متخرجة', value: 185, suffix: '+', icon: '🚀', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { label: 'دولة مشاركة', value: 14, suffix: '', icon: '🌍', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { label: 'تمويل مستقطب', value: 42, suffix: 'M$', icon: '💰', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  { label: 'وظيفة مستحدثة', value: 2400, suffix: '+', icon: '👥', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
];

const IMPACT_SECTORS = [
  { name: 'الذكاء الاصطناعي', percentage: 45, icon: '🤖', color: 'from-blue-500 to-indigo-600' },
  { name: 'التقنية المالية', percentage: 25, icon: '💳', color: 'from-emerald-500 to-teal-600' },
  { name: 'التجارة الإلكترونية', percentage: 15, icon: '🛒', color: 'from-amber-500 to-orange-600' },
  { name: 'التقنية الصحية', percentage: 15, icon: '🩺', color: 'from-rose-500 to-pink-600' },
];

const SUCCESS_STORIES = [
  {
    name: 'سارة المنصور',
    role: 'المؤسس التنفيذي',
    company: 'تيك-لوجيك (TechLogic)',
    sector: 'SaaS / AI',
    quote: 'المسرعة لم تكن مجرد برنامج تدريبي، بل كانت المحرك الحقيقي الذي نقلنا من مجرد فكرة على ورق إلى منتج يخدم آلاف المستخدمين اليوم.',
    image: '👩‍💻',
    color: 'blue',
    exitValue: 'Value: $2.4M'
  },
  {
    name: 'محمد العبدالله',
    role: 'مؤسس شريك',
    company: 'منصة عِلم (Eilm)',
    sector: 'EdTech',
    quote: 'أدوات التحليل الذكي في المنصة وفرت علينا شهوراً من البحث السوقي التقليدي. استطعنا إغلاق جولة Seed في وقت قياسي.',
    image: '👨‍🔬',
    color: 'emerald',
    exitValue: 'Seed: $1.2M'
  },
  {
    name: 'ليلى الحربي',
    role: 'المدير التقني',
    company: 'نبتة (Nabta)',
    sector: 'AgriTech',
    quote: 'بناء الـ MVP كان التحدي الأكبر، وبمساعدة المستشارين الذكيين والبشريين في المسرعة، أطلقنا نسخة تتجاوز توقعات عملائنا.',
    image: '👩‍🌾',
    color: 'rose',
    exitValue: 'MVP: Live'
  }
];

const COUNTRIES = [
  { name: 'السعودية', flag: '🇸🇦', growth: '+45%', activeProjects: 82 },
  { name: 'الإمارات', flag: '🇦🇪', growth: '+22%', activeProjects: 34 },
  { name: 'مصر', flag: '🇪🇬', growth: '+30%', activeProjects: 41 },
  { name: 'الأردن', flag: '🇯🇴', growth: '+15%', activeProjects: 18 },
  { name: 'الكويت', flag: '🇰🇼', growth: '+12%', activeProjects: 12 },
  { name: 'المغرب', flag: '🇲🇦', growth: '+18%', activeProjects: 15 },
];

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onBack }) => {
  const [counts, setCounts] = useState(STATS.map(() => 0));
  const [activeSector, setActiveSector] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const timers = STATS.map((stat, index) => {
      let currentStep = 0;
      return setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const nextValue = Math.round(stat.value * progress);
        
        setCounts(prev => {
          const newCounts = [...prev];
          newCounts[index] = nextValue;
          return newCounts;
        });

        if (currentStep >= steps) {
          clearInterval(timers[index]);
        }
      }, interval);
    });

    return () => timers.forEach(clearInterval);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans selection:bg-blue-100 overflow-x-hidden" dir="rtl">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
        .glass-premium { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.03); }
        .gradient-heading { background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-pattern { background-image: radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.03) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.03) 0px, transparent 50%); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      {/* Luxury Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { playPositiveSound(); onBack(); }} 
              className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 group active:scale-90"
            >
              <svg className="w-6 h-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="h-10 w-px bg-slate-200"></div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">سجل الإنجازات</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Business Developers Excellence Hub</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase">System Integrity</p>
                <p className="text-xs font-bold text-emerald-500 flex items-center gap-2">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                   Verified Success Data
                </p>
             </div>
             <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-900 shadow-inner">BD</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-40 hero-pattern">
        
        {/* Dynamic Hero Section */}
        <section className="text-center space-y-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -z-10 animate-pulse-soft"></div>
          
          <div className="space-y-6">
             <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-slate-100">
                <span className="text-blue-600">★</span> تقرير الأثر السنوي لعام 2024 <span className="text-blue-600">★</span>
             </div>
             <h2 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter gradient-heading">
               نصنع المستقبل، <br/>
               بأيدي روادنا المبدعين.
             </h2>
             <p className="text-slate-500 text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-medium">
               أكثر من مجرد مسرعة أعمال؛ نحن النظام البيئي الذي يحول الأحلام الجريئة إلى شركات رائدة تساهم في صياغة الاقتصاد الرقمي العربي.
             </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap justify-center gap-12 pt-8">
             {[
               { label: 'متوسط الوصول لـ MVP', value: '8 أسابيع' },
               { label: 'معدل نجاح الجولات', value: '74%' },
               { label: 'رضا المستثمرين', value: '4.9/5' }
             ].map((m, i) => (
               <div key={i} className="text-center">
                  <p className="text-2xl font-black text-slate-900">{m.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{m.label}</p>
               </div>
             ))}
          </div>
        </section>

        {/* Impact Counters - Re-imagined */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {STATS.map((s, i) => (
             <div 
               key={i} 
               className={`p-12 bg-white rounded-[4rem] border ${s.border} shadow-2xl shadow-slate-200/40 flex flex-col items-center text-center group hover:scale-[1.03] transition-all duration-700 relative overflow-hidden`}
             >
                <div className={`absolute -top-10 -right-10 w-40 h-40 ${s.bg} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-1000`}></div>
                <div className={`w-24 h-24 ${s.bg} rounded-[2.5rem] flex items-center justify-center text-5xl mb-10 group-hover:rotate-12 transition-transform shadow-inner border-2 border-white relative z-10`}>
                   {s.icon}
                </div>
                <h4 className={`text-7xl font-black ${s.color} mb-4 tracking-tighter tabular-nums relative z-10`}>
                  {counts[i]}{s.suffix}
                </h4>
                <p className="text-slate-400 font-black text-sm uppercase tracking-[0.2em] relative z-10">{s.label}</p>
             </div>
           ))}
        </section>

        {/* Sectors of Excellence - NEW SECTION */}
        <section className="space-y-16">
           <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-12">
              <div className="space-y-2">
                 <h3 className="text-4xl font-black text-slate-900">تركيزنا القطاعي</h3>
                 <p className="text-slate-500 font-medium">نستثمر في العقول التي تبتكر في القطاعات الحيوية.</p>
              </div>
              <div className="flex gap-2">
                 <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">Impact View</div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {IMPACT_SECTORS.map((sector, i) => (
                <div key={i} className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-lg group hover:shadow-2xl transition-all">
                   <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sector.color} flex items-center justify-center text-3xl mb-8 shadow-xl text-white`}>
                      {sector.icon}
                   </div>
                   <h4 className="text-xl font-black text-slate-900 mb-2">{sector.name}</h4>
                   <div className="flex items-end gap-4">
                      <span className="text-4xl font-black text-slate-900">{sector.percentage}%</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full mb-2 overflow-hidden">
                         <div className={`h-full bg-gradient-to-l ${sector.color} transition-all duration-1000`} style={{ width: `${sector.percentage}%` }}></div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Geographic Leadership Dashboard */}
        <section className="bg-[#0f172a] rounded-[5rem] p-12 md:p-24 text-white relative overflow-hidden shadow-3xl">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[180px]"></div>
           <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px]"></div>
           
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                 <div className="space-y-4">
                    <h3 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">ريادة تمتد <br/> عبر القارات</h3>
                    <p className="text-slate-400 text-xl leading-relaxed font-medium">
                      نجاحنا يتخطى الحدود. نحن فخورون بدعم رواد الأعمال من ١٤ دولة، مما يجعل بيزنس ديفلوبرز المسرعة الأكثر تنوعاً في المنطقة.
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 text-center group hover:bg-white/10 transition-colors">
                       <p className="text-5xl font-black text-blue-400 mb-2">١,٢٠٠+</p>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">طلب انضمام سنوي</p>
                    </div>
                    <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 text-center group hover:bg-white/10 transition-colors">
                       <p className="text-5xl font-black text-emerald-400 mb-2">٨٨٪</p>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">معدل تخرج المشاريع</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                 {COUNTRIES.map((c, i) => (
                   <div key={i} className="p-6 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/5 flex flex-col gap-4 group hover:border-blue-500/50 transition-all">
                      <div className="flex justify-between items-center">
                         <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">{c.flag}</span>
                         <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg">{c.growth}</span>
                      </div>
                      <div>
                         <p className="text-sm font-black mb-1">{c.name}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.activeProjects} مشروع نشط</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Wall of Success: Elite Founders */}
        <section className="space-y-24">
           <div className="text-center space-y-6">
              <h3 className="text-5xl font-black text-slate-900 tracking-tight">نخبة خريجينا</h3>
              <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium leading-relaxed">شهادات من قادة غيروا موازين العمل في شركاتهم الناشئة.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {SUCCESS_STORIES.map((story, i) => (
                <div key={i} className="flex flex-col group">
                   <div className="p-12 bg-white rounded-[4rem] border border-slate-100 shadow-xl relative flex-1 flex flex-col justify-between transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)]">
                      <div className="text-8xl text-slate-50 absolute top-10 right-12 select-none group-hover:text-blue-50 transition-colors italic">“</div>
                      <div className="relative z-10">
                         <div className="flex justify-between items-center mb-10">
                            <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                               {story.sector}
                            </div>
                            <span className="text-[10px] font-black text-blue-600">{story.exitValue}</span>
                         </div>
                         <p className="text-2xl font-bold text-slate-800 leading-[1.7] mb-12">
                           {story.quote}
                         </p>
                      </div>
                      <div className="flex items-center gap-6 pt-10 border-t border-slate-50 relative z-10">
                         <div className={`w-20 h-20 bg-${story.color}-50 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner border-2 border-white`}>
                            {story.image}
                         </div>
                         <div>
                            <p className="text-xl font-black text-slate-900 leading-tight">{story.name}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{story.role}</p>
                            <p className="text-xs font-black text-blue-600 mt-1">{story.company}</p>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Global Impact CTA - NEW LOOK */}
        <section className="pb-32">
           <div className="bg-slate-900 p-12 md:p-24 rounded-[5rem] text-center relative overflow-hidden group shadow-3xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-0"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] -z-0"></div>
              
              <div className="relative z-10 space-y-16">
                 <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl animate-float border border-white/20">
                    <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                 </div>
                 <div className="space-y-6">
                    <h3 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">هل مشروعك هو قصتنا <br/> القادمة؟</h3>
                    <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
                      انضم اليوم لأقوى مجتمع ريادي ذكي في المنطقة وابدأ رحلة التحول من فكرة بسيطة إلى علامة فارقة.
                    </p>
                 </div>
                 <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                    <button 
                      onClick={() => { playPositiveSound(); onBack(); }}
                      className="px-16 py-7 bg-blue-600 hover:bg-blue-500 text-white text-2xl font-black rounded-[2.5rem] shadow-2xl shadow-blue-900/40 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4"
                    >
                       <span>سجل مشروعك مجاناً</span>
                       <svg className="w-8 h-8 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                 </div>
              </div>
           </div>
        </section>

      </main>

      {/* Modern Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
         <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-5">
               <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-xl">BD</div>
               <div className="text-right">
                  <span className="text-lg font-black text-slate-900 uppercase tracking-tighter block leading-none">بيزنس ديفلوبرز</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">The Future of Acceleration</span>
               </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">IMPACT REPORT • 2024 EDITION</p>
               <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-200"></div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
