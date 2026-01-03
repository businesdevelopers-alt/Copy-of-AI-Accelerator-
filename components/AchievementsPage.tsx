
import React from 'react';

interface AchievementsPageProps {
  onBack: () => void;
}

const STATS = [
  { label: 'شركات متخرجة', value: '185+', icon: '🚀', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'دول تقدمت منها شركات', value: '14', icon: '🌍', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'تمويل تم جمعه', value: '$42M', icon: '💰', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'فرص عمل مستحدثة', value: '2,400+', icon: '👥', color: 'text-purple-600', bg: 'bg-purple-50' },
];

const COUNTRIES = [
  { name: 'المملكة العربية السعودية', flag: '🇸🇦', count: '450+' },
  { name: 'الإمارات العربية المتحدة', flag: '🇦🇪', count: '120+' },
  { name: 'مصر', flag: '🇪🇬', count: '310+' },
  { name: 'الأردن', flag: '🇯🇴', count: '85+' },
  { name: 'الكويت', flag: '🇰🇼', count: '60+' },
  { name: 'المغرب', flag: '🇲🇦', count: '95+' },
  { name: 'عُمان', flag: '🇴🇲', count: '40+' },
  { name: 'البحرين', flag: '🇧🇭', count: '35+' },
];

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100" dir="rtl">
      <style>{`
        @keyframes counter-glow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.2)); }
          50% { filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5)); }
        }
        .animate-glow { animation: counter-glow 3s infinite; }
      `}</style>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-slate-100 group">
              <svg className="w-6 h-6 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900">سجل الإنجازات والأثر</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Impact Report • AI Accelerator</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
             <span className="text-xs font-bold text-slate-400">آخر تحديث: ديسمبر 2024</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        
        {/* Hero Section */}
        <section className="text-center space-y-8 animate-fade-in">
           <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              Our Track Record
           </div>
           <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">
             نبني المستقبل <br/> 
             <span className="text-blue-600">بأرقام تتحدث عن نفسها.</span>
           </h2>
           <p className="text-slate-500 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
             فخورون بدعم جيل جديد من المبدعين في المنطقة العربية وخارجها، وتزويدهم بالأدوات اللازمة لبناء شركات ذات أثر اقتصادي واجتماعي مستدام.
           </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {STATS.map((s, i) => (
             <div key={i} className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center text-center group hover:border-blue-500/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-20 h-20 ${s.bg} rounded-[2rem] flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner`}>
                   {s.icon}
                </div>
                <h4 className={`text-5xl font-black ${s.color} mb-3 tracking-tighter animate-glow`}>{s.value}</h4>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{s.label}</p>
             </div>
           ))}
        </section>

        {/* Geography Section */}
        <section className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20"></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-[150px] opacity-10"></div>
           
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                 <h3 className="text-4xl md:text-5xl font-black leading-tight">انتشارنا الجغرافي <br/> في المنطقة العربية</h3>
                 <p className="text-slate-400 text-lg leading-relaxed">
                   استقبلنا طلبات من أكثر من ١٤ دولة، مع تمثيل قوي من المراكز الريادية الكبرى في الشرق الأوسط وشمال أفريقيا. هذا التنوع يثري بيئة المسرعة بتبادل الخبرات العابرة للحدود.
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                       <p className="text-3xl font-black text-blue-400">1,200+</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">طلب انضمام كلي</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                       <p className="text-3xl font-black text-emerald-400">72%</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">معدل نمو سنوي</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 {COUNTRIES.map((c, i) => (
                   <div key={i} className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                         <span className="text-2xl">{c.flag}</span>
                         <span className="text-xs font-bold truncate">{c.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-blue-400">{c.count}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Success Mentions */}
        <section className="space-y-16">
           <div className="text-center space-y-4">
              <h3 className="text-4xl font-black text-slate-900">قالوا عن المسرعة</h3>
              <p className="text-slate-500 max-w-xl mx-auto font-medium">قصص نجاح من رواد أعمال بدؤوا من الصفر ووصلوا للعالمية بمساعدة أدواتنا الذكية.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 relative group">
                 <div className="text-4xl text-blue-600 mb-6 opacity-40">"</div>
                 <p className="text-xl font-bold text-slate-700 leading-relaxed italic mb-8">
                   "بفضل المسرعة الذكية، استطعنا اختصار زمن بناء نموذج العمل من أشهر إلى أسابيع قليلة. مراجعة AI كانت دقيقة جداً وأعطتنا تنبيهات لم نكن نراها."
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">س</div>
                    <div>
                       <p className="text-sm font-black text-slate-900">سارة المنصور</p>
                       <p className="text-[10px] text-slate-500 font-bold">مؤسس شركة "تيك-لوجيك"</p>
                    </div>
                 </div>
              </div>
              <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 relative group">
                 <div className="text-4xl text-emerald-600 mb-6 opacity-40">"</div>
                 <p className="text-xl font-bold text-slate-700 leading-relaxed italic mb-8">
                   "أداة توليد Pitch Deck ساعدتني في إغلاق أول جولة استثمارية Pre-Seed بقيمة ٥٠٠ ألف دولار. التقارير كانت مقنعة جداً للمستثمرين."
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black">م</div>
                    <div>
                       <p className="text-sm font-black text-slate-900">محمد العبدالله</p>
                       <p className="text-[10px] text-slate-500 font-bold">مؤسس منصة "سوق-ذكي"</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA */}
        <section className="pb-20 text-center">
           <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-20 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <h3 className="text-4xl md:text-5xl font-black mb-8 relative z-10">كن جزءاً من قصة نجاحنا القادمة</h3>
              <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto relative z-10">سجل الآن وابدأ رحلتك في أول مسرعة أعمال افتراضية مدعومة بالكامل بالذكاء الاصطناعي.</p>
              <button onClick={onBack} className="px-14 py-6 bg-white text-blue-900 text-xl font-black rounded-[2rem] shadow-xl hover:scale-105 transition-all relative z-10">ابدأ رحلتك الآن</button>
           </div>
        </section>

      </main>

      <footer className="py-12 border-t border-slate-100 text-center bg-white">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">Business Developers Impact Report • 2024</p>
      </footer>
    </div>
  );
};
