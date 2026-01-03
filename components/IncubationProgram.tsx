
import React from 'react';
import { playPositiveSound } from '../services/audioService';

interface IncubationProgramProps {
  onBack: () => void;
  onApply: () => void;
}

export const IncubationProgram: React.FC<IncubationProgramProps> = ({ onBack, onApply }) => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900" dir="rtl">
      <style>{`
        .program-card { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .program-card:hover { transform: translateY(-8px); box-shadow: 0 30px 60px -15px rgba(0,0,0,0.1); }
        .gradient-border { position: relative; border-radius: 2rem; background: #fff; padding: 2rem; }
        .gradient-border::before { content: ""; position: absolute; inset: -2px; border-radius: 2.1rem; padding: 2px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
      `}</style>

      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all active:scale-95 group">
              <svg className="w-6 h-6 transform rotate-180 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">برنامج الاحتضان والتسريع</h1>
          </div>
          <button onClick={onApply} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">قدّم طلبك الآن</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        
        {/* Value Proposition Hero */}
        <section className="text-center space-y-10 animate-fade-in">
           <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
             The Virtual Accelerator Model
           </div>
           <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
             الدخول مجاني. القيمة تُبنى. <br/> 
             <span className="text-blue-600">النتائج تُموَّل.</span>
           </h2>
           <p className="text-slate-500 text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-medium">
             نحن حاضنة ومسرّعة افتراضية تدعم الشركات الناشئة من الفكرة إلى المنتج، ببرنامج احتضان مجاني بالكامل يركّز على الجدية، التنفيذ، والجاهزية للنمو.
           </p>
        </section>

        {/* Why Free? Section */}
        <section className="space-y-16">
           <div className="text-center space-y-4">
              <h3 className="text-3xl font-black text-slate-900">لماذا الاحتضان لدينا مجاني؟</h3>
              <p className="text-slate-500 font-medium">لأننا نؤمن أن القيمة الحقيقية تظهر عند التنفيذ، وليس في الأوراق.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'الأفكار تُختبر قبل أن تُموَّل', desc: 'نمنحك البيئة المناسبة لاختبار فرضياتك في السوق دون أي ضغوط مالية.', icon: '🧪' },
                { title: 'الوقت والالتزام أهم من الرسوم', desc: 'استثمارك الحقيقي هو وقتك وجهدك؛ نحن نبحث عن الجدية وليس عن ميزانيتك.', icon: '⏳' },
                { title: 'القيمة تظهر عند التنفيذ', desc: 'الاحتضان لدينا ليس تدريباً نظرياً، بل مرحلة ترشيح وبناء حقيقية للمستقبل.', icon: '🏗️' }
              ].map((item, i) => (
                <div key={i} className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center gap-6 group hover:bg-blue-600 transition-all duration-500">
                   <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform">
                      {item.icon}
                   </div>
                   <h4 className="text-xl font-black text-slate-900 group-hover:text-white transition-colors">{item.title}</h4>
                   <p className="text-slate-500 text-sm font-medium leading-relaxed group-hover:text-blue-50 transition-colors">{item.desc}</p>
                </div>
              ))}
           </div>
           <div className="bg-blue-600 p-12 rounded-[4rem] text-center text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
              <p className="text-2xl md:text-3xl font-bold leading-relaxed relative z-10">
                الاحتضان المجاني لدينا ليس مجرد دروس… بل هو رحلة لخلق قيمة حقيقية، <br className="hidden md:block" /> 
                أما الدخل… فيأتي فقط عندما نفتح لك أبواباً حقيقية للنمو.
              </p>
           </div>
        </section>

        {/* Program Components */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-10">
              <div className="space-y-4">
                 <h3 className="text-4xl font-black text-slate-900">ماذا ستحصل في الـ 8 أسابيع؟</h3>
                 <div className="flex gap-4">
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">6–8 أسابيع</span>
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100">مجانية بالكامل</span>
                 </div>
              </div>
              <div className="space-y-4">
                 {[
                   'تقييم فكرة المشروع ونموذج العمل بدقة',
                   'تحديد السوق المستهدف وملف العميل المثالي',
                   'بناء خارطة طريق واضحة للمنتج الأولي (MVP)',
                   'جلسات إرشاد أسبوعية مع خبراء متخصصين',
                   'مراجعات تنفيذ واقعية لمخرجات مشروعك',
                   'قرار واضح في النهاية: (استمرار – تسريع – إعادة تهيئة)'
                 ].map((text, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-black shrink-0">✓</div>
                      <p className="font-bold text-slate-700">{text}</p>
                   </div>
                 ))}
              </div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest pt-4">لا رسوم خفية • لا نسبة من الشركة • لا التزام مالي في هذه المرحلة</p>
           </div>
           <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-[100px] opacity-30"></div>
              <div className="gradient-border relative z-10 space-y-8 shadow-2xl">
                 <h4 className="text-2xl font-black text-slate-900 mb-6">مخطط الرحلة</h4>
                 <div className="space-y-8 relative before:absolute before:right-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {[
                      { week: '1-2', title: 'التثبت والتحقق', desc: 'هل المشكلة حقيقية؟' },
                      { week: '3-4', title: 'هيكلة القيمة', desc: 'كيف ستحصل على المال؟' },
                      { week: '5-6', title: 'هندسة المنتج', desc: 'بناء خارطة الـ MVP.' },
                      { week: '7-8', title: 'يوم العرض والقرار', desc: 'تحديد مسار النمو.' }
                    ].map((step, i) => (
                      <div key={i} className="relative pr-10">
                         <div className="absolute right-0 top-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-black z-10 shadow-lg border-4 border-white"></div>
                         <h5 className="font-black text-blue-600 text-sm">أسبوع {step.week}</h5>
                         <p className="font-bold text-slate-900">{step.title}</p>
                         <p className="text-xs text-slate-500">{step.desc}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* Revenue Model - Transparency */}
        <section className="space-y-16">
           <div className="text-center space-y-4">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">أين تأتي مصادر دخلنا؟</h3>
              <p className="text-slate-500 text-lg font-medium">الشفافية هي أساس علاقتنا معك من اليوم الأول.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6 program-card">
                 <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">🚀</div>
                 <h4 className="text-2xl font-black text-slate-900">برنامج التسريع (اختياري)</h4>
                 <p className="text-slate-600 leading-relaxed font-medium">بعد التخرج من الاحتضان، يمكن للشركات المؤهلة الانضمام للتسريع لاختراق السوق.</p>
                 <ul className="space-y-3 text-sm font-bold text-slate-500">
                    <li className="flex items-center gap-3">● تطوير التطبيق مقابل 15% من الشركة</li>
                    <li className="flex items-center gap-3">● أو تسعير مالي يتم الاتفاق عليه</li>
                    <li className="flex items-center gap-3">● نموذج هجين (نسبة + دفعة مخفضة)</li>
                 </ul>
              </div>
              <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6 program-card">
                 <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">🛠️</div>
                 <h4 className="text-2xl font-black text-slate-900">خدمات تنفيذ اختيارية</h4>
                 <p className="text-slate-600 leading-relaxed font-medium">البرنامج مجاني، لكن نوفر خدمات احترافية لمن يرغب في سرعة التنفيذ.</p>
                 <ul className="space-y-3 text-sm font-bold text-slate-500">
                    <li className="flex items-center gap-3">● تصميم UI/UX وهوية بصرية</li>
                    <li className="flex items-center gap-3">● بناء Landing Pages ونماذج مالية</li>
                    <li className="flex items-center gap-3">● إعداد Pitch Deck المستثمرين</li>
                 </ul>
              </div>
              <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6 program-card">
                 <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">👥</div>
                 <h4 className="text-2xl font-black text-slate-900">عضوية ما بعد الاحتضان</h4>
                 <p className="text-slate-600 leading-relaxed font-medium">للشركات التي ترغب بالاستمرار في مجتمعنا والحصول على دعم مستمر.</p>
                 <ul className="space-y-3 text-sm font-bold text-slate-500">
                    <li className="flex items-center gap-3">● جلسات مرشدين دورية</li>
                    <li className="flex items-center gap-3">● قوالب وأدوات تشغيل حصرية</li>
                    <li className="flex items-center gap-3">● فرص شراكات واستثمار</li>
                 </ul>
              </div>
              <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6 program-card">
                 <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">🤝</div>
                 <h4 className="text-2xl font-black text-slate-900">بوابة الشركاء</h4>
                 <p className="text-slate-600 leading-relaxed font-medium">نربط الشركات الجاهزة بمستثمرين ومزودي خدمات عالميين.</p>
                 <ul className="space-y-3 text-sm font-bold text-slate-500">
                    <li className="flex items-center gap-3">● رعاية البرامج والشراكات</li>
                    <li className="flex items-center gap-3">● عمولات إحالة لا تؤثر على رائد الأعمال</li>
                    <li className="flex items-center gap-3">● إمكانية الاستثمار المباشر</li>
                 </ul>
              </div>
           </div>
        </section>

        {/* How we Select? */}
        <section className="bg-slate-900 p-12 md:p-24 rounded-[5rem] text-white text-center space-y-16 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
           
           <div className="space-y-4 relative z-10">
              <h3 className="text-4xl md:text-5xl font-black">كيف نختار الشركات؟</h3>
              <p className="text-slate-400 text-lg md:text-xl font-medium">نقبل القليل الجاد، لا الكثير العشوائي.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {[
                { title: 'التزام حقيقي', sub: 'نبحث عن شغف يتجاوز الكلمات إلى الأفعال.' },
                { title: 'مشكلة واضحة', sub: 'حلول لمعاناة حقيقية في السوق.' },
                { title: 'قابلة للتنفيذ', sub: 'أفكار يمكن بناؤها ضمن موارد المسرعة.' },
                { title: 'استعداد للتعلّم', sub: 'عقلية مرنة تتقبل التوجيه والقرار.' }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                   <h4 className="text-xl font-black text-blue-400 mb-3">{item.title}</h4>
                   <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.sub}</p>
                </div>
              ))}
           </div>

           <div className="pt-10 relative z-10">
              <button onClick={onApply} className="px-16 py-7 bg-white text-blue-900 text-2xl font-black rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all active:scale-95">قدم الآن واختبر جاهزيتك</button>
              <p className="text-slate-500 mt-6 text-sm font-bold">احصل على قرار واضح خلال أيام قليلة.</p>
           </div>
        </section>

        {/* Final Statement */}
        <footer className="text-center pb-20">
           <h4 className="text-4xl md:text-6xl font-black text-slate-200 uppercase tracking-tighter mb-4">No Dreams. Only Builds.</h4>
           <p className="text-slate-500 text-2xl font-bold max-w-2xl mx-auto leading-relaxed">
             نحن لا نبيع أحلاماً، <br/> 
             نحن نبني مشاريع… ومن ينجح، ننجح معه.
           </p>
        </footer>

      </main>
    </div>
  );
};
