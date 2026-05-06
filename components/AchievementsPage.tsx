
import React, { useState, useEffect } from 'react';
import { playPositiveSound } from '../services/audioService';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface AchievementsPageProps {
  onBack: () => void;
}

const STATS = [
  { label: 'شركة متخرجة', value: 185, suffix: '+', growth: '+12%', icon: '🚀', color: 'text-brand-primary', bg: 'bg-brand-primary/5', border: 'border-brand-primary' },
  { label: 'دولة مشاركة', value: 14, suffix: '', growth: 'توسع مستمر', icon: '🌍', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { label: 'تمويل مستقطب', value: 42, suffix: 'M$', growth: '+24%', icon: '💰', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  { label: 'وظيفة مستحدثة', value: 2400, suffix: '+', growth: '+31%', icon: '👥', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
];

const PERFORMANCE_DATA = [
  { year: '2020', funding: 5, startups: 12 },
  { year: '2021', funding: 12, startups: 35 },
  { year: '2022', funding: 22, startups: 78 },
  { year: '2023', funding: 35, startups: 142 },
  { year: '2024', funding: 42, startups: 185 },
];

const SUCCESS_STORIES = [
  {
    name: 'سارة المنصور',
    role: 'المؤسس التنفيذي',
    company: 'تيك-لوجيك (TechLogic)',
    quote: 'المسرعة كانت المحرك الحقيقي الذي نقلنا من مجرد فكرة إلى منتج يخدم آلاف المستخدمين اليوم.',
    image: '👩‍💻',
    tags: ['SaaS', 'AI'],
    color: 'blue'
  },
  {
    name: 'محمد العبدالله',
    role: 'مؤسس شريك',
    company: 'منصة عِلم (Eilm)',
    quote: 'أدوات التحليل الذكي وفرت علينا شهوراً من البحث السوقي. استطعنا إغلاق جولة Seed في وقت قياسي.',
    image: '👨‍🔬',
    tags: ['EdTech', 'B2B'],
    color: 'emerald'
  },
];

const COUNTRIES = [
  { name: 'السعودية', count: 82, trend: '+45%' },
  { name: 'الإمارات', count: 34, trend: '+22%' },
  { name: 'مصر', count: 41, trend: '+30%' },
  { name: 'الأردن', count: 18, trend: '+15%' },
  { name: 'الكويت', count: 12, trend: '+12%' },
  { name: 'المغرب', count: 15, trend: '+18%' },
];

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onBack }) => {
  const [counts, setCounts] = useState(STATS.map(() => 0));

  useEffect(() => {
    const timers = STATS.map((stat, index) => {
      let current = 0;
      const step = Math.ceil(stat.value / 50);
      return setInterval(() => {
        current += step;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timers[index]);
        }
        setCounts(prev => {
          const next = [...prev];
          next[index] = current;
          return next;
        });
      }, 30);
    });
    return () => timers.forEach(clearInterval);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-primary/10 overflow-x-hidden" dir="rtl">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .bg-white shadow-sm border border-brand-primary/10-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.5); }
        .gradient-text { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .dark-section { background: radial-gradient(circle at top right, #1e293b, #0f172a); }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => { playPositiveSound(); onBack(); }} 
            className="flex items-center gap-3 px-5 py-2.5 bg-brand-bg hover:bg-brand-primary/5 text-brand-primary rounded-2xl transition-all border border-slate-100 group"
          >
            <svg className="w-5 h-5 transform rotate-180 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-bold text-sm">العودة للرئيسية</span>
          </button>
          <div className="flex flex-col items-end">
            <h1 className="text-xl font-bold text-slate-900">تقرير الأثر السنوي</h1>
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Business Developers Accelerator 2024</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-32">
        
        {/* Hero Section */}
        <section className="text-center space-y-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full -z-10"></div>
          <div className="inline-flex items-center gap-2 bg-brand-primary/5 text-brand-primary px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-brand-primary">
             Real Impact, Verified Growth
          </div>
          <h2 className="text-3xl md:text-3xl font-bold text-slate-900 leading-[1.1] tracking-tight max-w-4xl mx-auto">
            أرقام تجسد <br/> 
            <span className="gradient-text">قوة الابتكار.</span>
          </h2>
          <p className="text-slate-500 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
            نحن لا نبني مجرد مشاريع؛ نحن نصمم محركات اقتصادية تساهم في صياغة مستقبل ريادة الأعمال في المنطقة العربية.
          </p>
        </section>

        {/* Live Counters */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {STATS.map((s, i) => (
             <div 
               key={i} 
               className={`p-10 bg-white rounded-[3.5rem] border ${s.border} shadow-2xl shadow-slate-200/50 flex flex-col items-center text-center group hover:-translate-y-3 transition-all duration-500 relative overflow-hidden`}
             >
                <div className={`absolute top-0 right-0 w-32 h-32 ${s.bg} opacity-20 rounded-bl-[4rem] group-hover:scale-125 transition-transform duration-700`}></div>
                <div className={`w-20 h-20 ${s.bg} rounded-[2.2rem] flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner relative z-10`}>
                   {s.icon}
                </div>
                <h4 className={`text-3xl font-bold ${s.color} mb-3 tracking-tighter tabular-nums relative z-10`}>
                  {counts[i]}{s.suffix}
                </h4>
                <div className="flex flex-col items-center gap-1 relative z-10">
                   <p className="text-brand-gray font-bold text-xs uppercase tracking-widest">{s.label}</p>
                   <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{s.growth}</span>
                </div>
             </div>
           ))}
        </section>

        {/* Growth Analytics Chart */}
        <section className="space-y-12">
           <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-10">
              <div className="space-y-2">
                 <h3 className="text-3xl font-bold text-slate-900 tracking-tight">تحليل منحنى النمو</h3>
                 <p className="text-slate-500 font-medium">تطور التمويل المستقطب والمشاريع المتخرجة خلال الـ ٥ سنوات الماضية.</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-brand-hover rounded-full"></span>
                    <span className="text-xs font-bold text-slate-500">إجمالي التمويل ($M)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                    <span className="text-xs font-bold text-slate-500">عدد الشركات</span>
                 </div>
              </div>
           </div>
           
           <div className="h-[450px] w-full bg-slate-50/50 rounded-[4rem] p-10 border border-slate-100 shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERFORMANCE_DATA}>
                  <defs>
                    <linearGradient id="colorFunding" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorStartups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px' }}
                    itemStyle={{ fontWeight: 'black', fontSize: '14px' }}
                  />
                  <Area type="monotone" dataKey="funding" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorFunding)" />
                  <Area type="monotone" dataKey="startups" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorStartups)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </section>

        {/* Regional Footprint Section */}
        <section className="dark-section rounded-[5rem] p-12 md:p-24 text-brand-primary relative overflow-hidden shadow-3xl">
           <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary rounded-full blur-[150px] opacity-20"></div>
           
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                 <h3 className="text-3xl md:text-3xl font-bold leading-tight tracking-tight">ريادة تمتد <br/> عبر ١٤ دولة.</h3>
                 <p className="text-brand-gray text-xl leading-relaxed font-medium">
                   نفتخر بكوننا الوجهة الأولى لرواد الأعمال العرب. تنوعنا الجغرافي هو مصدر قوتنا، حيث تتبادل العقول الخبرات لبناء اقتصاد معرفي متكامل.
                 </p>
                 <div className="flex gap-6">
                    <div className="p-8 bg-brand-primary/5 backdrop-blur-md rounded-[2.5rem] border border-brand-primary/20 flex-1">
                       <p className="text-3xl font-bold text-brand-primary">٨٨٪</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">نسبة نجاح التخرج</p>
                    </div>
                    <div className="p-8 bg-brand-primary/5 backdrop-blur-md rounded-[2.5rem] border border-brand-primary/20 flex-1">
                       <p className="text-3xl font-bold text-emerald-400">١٢٠٠+</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">طلب انضمام سنوي</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {COUNTRIES.map((c, i) => (
                   <div key={i} className="p-6 bg-brand-primary/5 backdrop-blur-xl rounded-[2.5rem] border border-brand-primary/20 flex items-center justify-between group hover:bg-brand-primary/10 transition-all hover:scale-105">
                      <div>
                         <span className="text-sm font-bold block">{c.name}</span>
                         <span className="text-[10px] text-slate-500 font-bold">{c.count} مشروع</span>
                      </div>
                      <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-lg">{c.trend}</span>
                   </div>
                 ))}
                 <div className="col-span-2 p-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] text-center shadow-2xl">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Coming Soon</p>
                    <p className="font-bold text-lg">إطلاق مكتب التمثيل الإقليمي في شرق أفريقيا 🌍</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Wall of Success */}
        <section className="space-y-20">
           <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">شركاء النجاح</h3>
              <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium leading-relaxed">قصص واقعية لأشخاص غيروا قواعد اللعبة باستخدام منهجية بيزنس ديفلوبرز الذكية.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {SUCCESS_STORIES.map((story, i) => (
                <div key={i} className="p-12 bg-white rounded-[4rem] border border-slate-100 shadow-2xl relative group flex flex-col justify-between transition-all hover:shadow-brand-primary/20">
                   <div className="text-3xl text-brand-primary absolute top-8 right-12 select-none group-hover:text-blue-50 transition-colors">"</div>
                   <div className="relative z-10">
                      <div className="flex gap-2 mb-10">
                         {story.tags.map(tag => (
                           <span key={tag} className="px-4 py-1.5 bg-slate-50 text-brand-gray text-[10px] font-bold rounded-full border border-slate-100 uppercase tracking-widest">{tag}</span>
                         ))}
                      </div>
                      <p className="text-2xl font-bold text-brand-primary leading-relaxed mb-12 italic">
                        {story.quote}
                      </p>
                   </div>
                   <div className="flex items-center gap-6 pt-10 border-t border-slate-50 relative z-10">
                      <div className={`w-20 h-20 bg-${story.color}-50 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner border border-slate-100`}>
                         {story.image}
                      </div>
                      <div>
                         <p className="text-xl font-bold text-slate-900 leading-tight">{story.name}</p>
                         <p className="text-sm font-bold text-brand-gray mt-1">{story.role} @ <span className="text-brand-primary font-bold">{story.company}</span></p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Global Impact CTA */}
        <section className="pb-32">
           <div className="bg-white p-12 md:p-24 rounded-[5rem] text-center relative overflow-hidden group shadow-3xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] -z-0"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] -z-0"></div>
              
              <div className="relative z-10 space-y-16">
                 <div className="w-28 h-28 bg-brand-primary/10 backdrop-blur-xl rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl animate-float border border-brand-primary/30">
                    <svg className="w-14 h-14 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                 </div>
                 <div className="space-y-6">
                    <h3 className="text-3xl md:text-3xl font-bold text-brand-primary leading-tight tracking-tight">هل مشروعك هو قصتنا القادمة؟</h3>
                    <p className="text-brand-gray text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
                      انضم اليوم لأقوى مجتمع ريادي ذكي في المنطقة وابدأ رحلة التحول من فكرة بسيطة إلى علامة فارقة.
                    </p>
                 </div>
                 <button 
                   onClick={() => { playPositiveSound(); onBack(); }}
                   className="px-16 py-7 bg-brand-primary hover:bg-brand-hover text-white text-2xl font-bold rounded-[2.5rem] shadow-2xl shadow-brand-primary/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4 mx-auto"
                 >
                    <span>سجل مشروعك الآن</span>
                    <svg className="w-8 h-8 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </button>
              </div>
           </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
         <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-right">
            <div className="flex items-center gap-5">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary text-xs font-bold shadow-xl">BD</div>
               <div>
                  <span className="text-lg font-bold text-slate-900 uppercase block leading-none">بيزنس ديفلوبرز</span>
                  <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mt-1 block">AI Accelerator Impact Center</span>
               </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
               <p className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.5em]">IMPACT REPORT • 2024 EDITION</p>
               <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-200"></div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
