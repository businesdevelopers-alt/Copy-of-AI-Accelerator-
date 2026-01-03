
import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onStart: () => void;
  onPathFinder: () => void;
  onSmartFeatures: () => void;
  onGovDashboard: () => void;
  onRoadmap: () => void;
  onTools: () => void;
  onLegalClick: (type: 'PRIVACY' | 'TERMS' | 'CONTACT') => void;
  onLogin?: () => void;
}

interface JourneyStep {
  id: number;
  title: string;
  icon: string;
  goal: string;
  deliverables: string[];
  gradient: string;
  glow: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  { id: 1, title: 'التحقق من الفكرة', icon: '💡', goal: 'إثبات وجود مشكلة حقيقية واحتياج سوقي للحل المقترح.', deliverables: ['تحليل المشكلة بدقة', 'تحديد الجمهور المستهدف', 'صياغة عرض القيمة'], gradient: 'from-blue-500 to-cyan-400', glow: 'rgba(59, 130, 246, 0.1)' },
  { id: 2, title: 'نموذج العمل', icon: '📊', goal: 'تصميم محرك الربح وضمان استدامة المشروع وقابلية التوسع.', deliverables: ['مخطط BMC الاحترافي', 'قنوات التوزيع', 'هيكل الإيرادات'], gradient: 'from-indigo-500 to-purple-400', glow: 'rgba(99, 102, 241, 0.1)' },
  { id: 3, title: 'تحليل السوق', icon: '🔎', goal: 'دراسة المنافسين وتحديد الميزة التنافسية الفريدة في السوق.', deliverables: ['تحليل SWOT المعمق', 'حجم السوق TAM/SAM', 'مصفوفة التميز'], gradient: 'from-emerald-500 to-teal-400', glow: 'rgba(16, 185, 129, 0.1)' },
  { id: 4, title: 'بناء الـ MVP', icon: '🛠️', goal: 'إطلاق نسخة أولية لاختبار الحل مع عملاء حقيقيين بأقل التكاليف.', deliverables: ['تحديد المزايا الجوهرية', 'رسم رحلة المستخدم', 'خطة الاختبار'], gradient: 'from-amber-500 to-orange-400', glow: 'rgba(245, 158, 11, 0.1)' },
  { id: 5, title: 'الخطة المالية', icon: '💰', goal: 'بناء التوقعات المالية الواقعية وجذب اهتمام المستثمرين.', deliverables: ['توقعات التدفق النقدي', 'نقطة التعادل', 'التقييم الاستثماري'], gradient: 'from-rose-500 to-pink-400', glow: 'rgba(244, 63, 94, 0.1)' },
  { id: 6, title: 'عرض الاستثمار', icon: '🚀', goal: 'تجهيز ملف العرض النهائي وإغلاق أول جولة تمويلية ناجحة.', deliverables: ['Pitch Deck عالمي', 'مهارات الإلقاء', 'قائمة المستهدفين'], gradient: 'from-slate-700 to-slate-900', glow: 'rgba(30, 41, 59, 0.1)' }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onPathFinder, onRoadmap, onTools, onLegalClick, onLogin }) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden scroll-smooth text-slate-900">
      <style>{`
        .glass-journey { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(226, 232, 240, 0.8); }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .journey-line { background: linear-gradient(to bottom, #3b82f6, #8b5cf6, #ec4899, #e2e8f0); }
        .bg-dot-pattern { background-image: radial-gradient(#e2e8f0 1.5px, transparent 1.5px); background-size: 30px 30px; }
      `}</style>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 transition-transform hover:rotate-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">بيزنس ديفلوبرز</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">AI Virtual Accelerator</span>
          </div>
        </div>
        <div className="hidden md:flex gap-8 items-center text-sm font-bold text-slate-500">
          <button onClick={onRoadmap} className="hover:text-blue-600 transition-colors">خارطة الطريق</button>
          <button onClick={onTools} className="hover:text-blue-600 transition-colors">الأدوات</button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button onClick={onLogin} className="text-slate-900 hover:text-blue-600 transition-colors px-4">تسجيل الدخول</button>
          <button onClick={onStart} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">ابدأ مجاناً</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-dot-pattern">
        <div className="absolute top-0 right-0 w-1/2 h-screen bg-blue-50 rounded-bl-[10rem] -z-10 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-in-up text-right">
            <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-xs font-black border border-blue-100">
              <span className="animate-bounce">✨</span>
              <span className="uppercase tracking-widest text-[10px]">مستقبل ريادة الأعمال يبدأ هنا</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-tight">
              صمم مشروعك <br/>
              <span className="text-blue-600 relative inline-block">بذكاء فائق.
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 358 12" fill="none">
                  <path d="M3 9C118.957 4.47226 239.043 4.47226 355 9" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
              حوّل فكرتك إلى شركة ناشئة ناجحة وجاهزة للاستثمار من خلال أول مسار تدريبي ذكي في المنطقة معتمد على تقنيات Gemini AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 pt-4 justify-end">
              <button onClick={onStart} className="px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white text-xl font-black rounded-[2rem] shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3 group active:scale-95">
                <span>ابدأ رحلتك الآن</span>
                <svg className="w-6 h-6 group-hover:translate-x-[-4px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button onClick={onLogin} className="px-10 py-6 bg-white border-2 border-slate-200 hover:border-blue-600 text-slate-900 hover:text-blue-600 text-lg font-black rounded-[2rem] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm">
                تسجيل الدخول
              </button>
            </div>
            <div className="pt-4">
              <button onClick={onPathFinder} className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 justify-end">
                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">💬</span>
                تحدث مع الموجه الذكي لتحديد مسارك
              </button>
            </div>
          </div>
          <div className="relative hidden lg:block animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100 rounded-full blur-[100px] -z-10 opacity-60"></div>
            <div className="bg-white p-4 rounded-[4rem] border border-slate-100 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
              <div className="bg-slate-50 rounded-[3rem] shadow-inner p-10 text-slate-900 min-h-[500px] flex flex-col justify-center text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl shadow-blue-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black mb-4">بوابة المسرعة</h3>
                <p className="text-slate-500 font-medium mb-8 italic">"الوصول إلى أدوات الذكاء الاصطناعي الأكثر تقدماً لرواد الأعمال"</p>
                <div className="space-y-3">
                  <div className="h-12 bg-white rounded-xl border border-slate-100 w-full animate-pulse"></div>
                  <div className="h-12 bg-white rounded-xl border border-slate-100 w-3/4 mx-auto animate-pulse"></div>
                </div>
                <button onClick={onLogin} className="w-full mt-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-colors shadow-lg">دخول الأعضاء</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24 animate-fade-in">
            <h2 className="text-5xl font-black text-slate-900 mb-6">رحلتك نحو الريادة</h2>
            <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">٦ محطات استراتيجية صممت بعناية لتنتقل بمشروعك من مجرد فكرة إلى شركة ناشئة جاهزة للاستثمار العالمي.</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 journey-line -translate-x-1/2 hidden md:block opacity-30 rounded-full"></div>

            <div className="space-y-24">
              {JOURNEY_STEPS.map((step, idx) => (
                <div key={step.id} className={`flex flex-col md:flex-row items-center gap-12 ${idx % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  
                  <div className="flex-1 w-full animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div 
                      onMouseEnter={() => setHoveredStep(step.id)}
                      onMouseLeave={() => setHoveredStep(null)}
                      className={`glass-journey p-10 rounded-[3rem] transition-all duration-500 relative group overflow-hidden ${hoveredStep === step.id ? 'scale-[1.03] shadow-2xl shadow-slate-200 border-blue-200' : 'shadow-xl shadow-slate-100 border-slate-100'}`}
                    >
                      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${step.gradient} opacity-[0.05] rounded-bl-[4rem]`}></div>
                      
                      <div className="flex items-center gap-6 mb-10 text-right">
                        <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${step.gradient} flex items-center justify-center text-5xl shadow-xl group-hover:rotate-6 transition-transform transform text-white`}>
                          {step.icon}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1.5">المرحلة {step.id}</p>
                          <h3 className="text-3xl font-black text-slate-900 leading-tight">{step.title}</h3>
                        </div>
                      </div>

                      <div className="space-y-8 text-right">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 justify-end">
                             الهدف الاستراتيجي
                             <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          </h4>
                          <p className="text-slate-700 font-bold leading-relaxed">{step.goal}</p>
                        </div>

                        <div className="pt-8 border-t border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">المخرجات الرئيسية للمحطة:</h4>
                          <div className="flex flex-wrap gap-2.5 justify-end">
                            {step.deliverables.map((d, i) => (
                              <span key={i} className="px-5 py-2.5 bg-white text-slate-600 text-[11px] font-black rounded-2xl border border-slate-200 shadow-sm group-hover:border-blue-500 transition-colors flex items-center gap-2">
                                <span className="text-blue-600 text-sm">✓</span>
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-20 flex-shrink-0 hidden md:block">
                    <div className={`w-14 h-14 rounded-full bg-white border-[6px] border-slate-50 flex items-center justify-center text-slate-900 font-black text-lg transition-all duration-500 shadow-lg ${hoveredStep === step.id ? `bg-blue-600 text-white border-white scale-125` : ''}`}>
                      {step.id}
                    </div>
                  </div>

                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-32 text-center">
            <button onClick={onStart} className="px-14 py-7 bg-slate-900 text-white text-xl font-black rounded-[2.5rem] shadow-2xl hover:bg-blue-600 transition-all transform hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-4 mx-auto group">
              <span>انطلق في رحلتك الآن</span>
              <svg className="w-7 h-7 transform rotate-180 group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 bg-white text-center">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-12">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="text-xl font-black text-slate-900 uppercase tracking-tight">بيزنس ديفلوبرز</span>
               </div>
               <div className="flex gap-10 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                 <button onClick={() => onLegalClick('PRIVACY')} className="hover:text-blue-600 transition-colors underline-offset-8 hover:underline">سياسة الخصوصية</button>
                 <button onClick={() => onLegalClick('TERMS')} className="hover:text-blue-600 transition-colors underline-offset-8 hover:underline">الشروط والأحكام</button>
                 <button onClick={() => onLegalClick('CONTACT')} className="hover:text-blue-600 transition-colors underline-offset-8 hover:underline">تواصل معنا</button>
               </div>
            </div>
            <div className="pt-10 border-t border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.6em]">Business Developers Hub • 2024 • Powered by Google Gemini AI</p>
            </div>
         </div>
      </footer>
    </div>
  );
};
