
import React, { useState } from 'react';

interface RoadmapPageProps {
  onStart: () => void;
  onBack: () => void;
}

interface LevelDetail {
  id: number;
  title: string;
  icon: string;
  goal: string;
  desc: string;
  outputs: string[];
  color: string;
  aiTools: string[];
  challenge: string;
  expertTip: string;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onStart, onBack }) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelDetail | null>(null);

  const levels: LevelDetail[] = [
    { 
      id: 1, 
      title: 'التحقق من الفكرة', 
      icon: '💡', 
      goal: 'التأكد من جدوى الحل لمشكلة حقيقية.',
      desc: 'في هذه المرحلة، ننتقل من مجرد "توقع" وجود مشكلة إلى "التأكد" منها عبر أدوات التحقق الذكي والبحث الميداني الرقمي.',
      outputs: ['تحليل المشكلة بدقة', 'صياغة فرضيات الحل', 'تحديد الجمهور المستهدف الأولي'],
      color: 'from-blue-500 to-cyan-400',
      aiTools: ['Gemini Idea Validator', 'Market Scraper AI'],
      challenge: 'إثبات وجود 3 نقاط ألم حقيقية يعاني منها العميل.',
      expertTip: 'لا تقع في حب فكرتك، بل اقع في حب المشكلة التي تحاول حلها.'
    },
    { 
      id: 2, 
      title: 'نموذج العمل التجاري', 
      icon: '📊', 
      goal: 'تصميم محرك الربح والاستدامة.',
      desc: 'بناء الهيكل الذي يوضح كيف سيخلق مشروعك قيمة، وكيف سيحصل على عوائد مالية مستدامة وقابلة للتوسع.',
      outputs: ['مخطط نموذج العمل (BMC)', 'تحديد شركاء النجاح', 'هيكل الإيرادات والتكاليف'],
      color: 'from-indigo-500 to-purple-400',
      aiTools: ['Business Model Canvas Generator', 'Revenue Logic AI'],
      challenge: 'تحديد مصدر دخل واحد على الأقل يضمن تدفقاً نقدياً مستمراً.',
      expertTip: 'الربحية ليست هدفاً فحسب، بل هي وقود الاستدامة لمشروعك.'
    },
    { 
      id: 3, 
      title: 'تحليل السوق والمنافسين', 
      icon: '🔎', 
      goal: 'فهم الساحة التنافسية وتحديد الميزة.',
      desc: 'التعمق في أرقام السوق، وفهم تحركات المنافسين لاقتناص ثغرات لا يراها غيرك وتحويلها لفرص نمو.',
      outputs: ['تحليل SWOT الاحترافي', 'تحديد حجم السوق (TAM/SAM)', 'مصفوفة التميز التنافسي'],
      color: 'from-emerald-500 to-teal-400',
      aiTools: ['Competitor Intel AI', 'Market Dynamics Analyzer'],
      challenge: 'العثور على "المحيط الأزرق" (منطقة خالية من المنافسة الشرسة).',
      expertTip: 'نافس حيث لا يوجد الآخرون، أو كن مختلفاً لدرجة تجعل المنافسة غير ذات صلة.'
    },
    { 
      id: 4, 
      title: 'المنتج الأولي (MVP)', 
      icon: '🛠️', 
      goal: 'بناء أول نسخة قابلة للتجربة.',
      desc: 'التركيز على المزايا الأساسية التي تعالج المشكلة لإطلاق منتجك بأقل تكلفة وأسرع وقت لاختباره واقعياً.',
      outputs: ['تحديد المزايا الجوهرية', 'رسم رحلة المستخدم (User Flow)', 'خطة الاختبار مع العملاء'],
      color: 'from-amber-500 to-orange-400',
      aiTools: ['Feature Prioritization AI', 'UX Journey Builder'],
      challenge: 'إطلاق نسخة وظيفية بالكامل بأقل من 20% من الميزانية الكلية.',
      expertTip: 'إذا لم تشعر بالخجل من النسخة الأولى لمنتجك، فأنت قد أطلقت المنتج بعد فوات الأوان.'
    },
    { 
      id: 5, 
      title: 'الخطة المالية والتمويل', 
      icon: '💰', 
      goal: 'إثبات الربحية وجاذبية الاستثمار.',
      desc: 'تحويل الرؤية إلى لغة الأرقام التي يبحث عنها المستثمر؛ من التدفقات النقدية إلى تقييم الشركة المستقبلي.',
      outputs: ['توقعات مالية لـ 3 سنوات', 'حساب نقطة التعادل', 'تحديد الاحتياج التمويلي'],
      color: 'from-rose-500 to-pink-400',
      aiTools: ['Financial Forecaster AI', 'Valuation Engine'],
      challenge: 'إثبات أن كل ريال مستثمر سيولد عائداً مضاعفاً في 5 سنوات.',
      expertTip: 'المستثمر لا يشتري أحلامك، بل يشتري الأرقام التي تثبت قدرتك على تحقيقها.'
    },
    { 
      id: 6, 
      title: 'عرض الاستثمار النهائي', 
      icon: '🚀', 
      goal: 'إبهار المستثمرين وإغلاق الجولة.',
      desc: 'صياغة قصتك الريادية في عرض تقديمي (Pitch Deck) يجمع بين قوة الأرقام وعاطفة الرؤية لإقناع الممولين.',
      outputs: ['تصميم Pitch Deck احترافي', 'إتقان فن الإلقاء (Pitching)', 'مهارات التفاوض مع المستثمرين'],
      color: 'from-slate-800 to-slate-600',
      aiTools: ['Pitch Deck Designer AI', 'Q&A Simulator'],
      challenge: 'إقناع لجنة التحكيم الافتراضية في عرض مدته 3 دقائق فقط.',
      expertTip: 'قصتك هي ما سيتذكرونه، والأرقام هي ما سيجعلوهم يوقعون الشيك.'
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans overflow-x-hidden relative">
      <style>{`
        .bg-white shadow-sm border border-brand-primary/10-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        @keyframes line-draw {
          0% { height: 0; }
          100% { height: 100%; }
        }
        .animate-line {
          animation: line-draw 2s ease-out forwards;
        }
        .pulse-timeline {
          box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
          animation: pulse-ring 2s infinite;
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
      `}</style>

      {/* Page Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-brand-gray hover:text-brand-primary transition-all">
                <svg className="w-6 h-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </button>
             <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">خارطة طريق رائد الأعمال</h1>
                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-1">الرحلة المنهجية من الفكرة إلى الاستثمار</p>
             </div>
          </div>
          <button 
            onClick={onStart} 
            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-hover shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
          >
            ابدأ رحلتك الآن
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-24 space-y-4 animate-fade-in">
           <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
             Step-by-Step Evolution
           </div>
           <h2 className="text-3xl md:text-3xl font-bold text-slate-900 tracking-tight">مسارك نحو الريادة العالمية</h2>
           <p className="text-slate-500 max-w-3xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
             صممنا لك رحلة متكاملة من 6 محطات محورية مدعومة بأحدث تقنيات الذكاء الاصطناعي، لتضمن تحويل فكرتك إلى مشروع جاهز لاقتناص فرص الاستثمار.
           </p>
        </div>

        <div className="relative">
           {/* Vertical Line for Timeline (Desktop) */}
           <div className="hidden lg:block absolute right-1/2 top-0 bottom-0 w-1 bg-slate-200 -mr-0.5 rounded-full overflow-hidden">
              <div className="w-full bg-brand-primary animate-line"></div>
           </div>

           <div className="space-y-32 md:space-y-20">
              {levels.map((level, idx) => (
                <div key={level.id} className={`flex flex-col lg:flex-row items-center gap-12 group animate-fade-in-up`} style={{ animationDelay: `${idx * 0.15}s` }}>
                   
                   {/* Content Column */}
                   <div className={`flex-1 w-full order-2 ${idx % 2 === 0 ? 'lg:order-1 lg:text-left' : 'lg:order-3 lg:text-right'}`}>
                      <div 
                        onClick={() => setSelectedLevel(level)}
                        className={`bg-white shadow-sm border border-brand-primary/10-card p-10 rounded-[3.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border-r-8 cursor-pointer ${idx % 2 === 0 ? 'lg:border-r-0 lg:border-l-8 border-brand-primary' : 'border-brand-primary'}`}
                      >
                         <div className="flex flex-col gap-6">
                            <div className="space-y-2">
                               <h3 className="text-3xl font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{level.title}</h3>
                               <p className="text-brand-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2 lg:justify-start">
                                  <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
                                  الهدف: {level.goal}
                               </p>
                            </div>
                            
                            <p className="text-slate-600 font-medium leading-relaxed">
                               {level.desc}
                            </p>

                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                               <span className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em]">أبرز المخرجات: {level.outputs.length} محاور</span>
                               <button className="text-brand-primary text-xs font-bold hover:underline underline-offset-4 flex items-center gap-2">
                                 <span>استكشاف المحطة</span>
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Central Indicator */}
                   <div className="relative z-20 flex-shrink-0 order-1 lg:order-2">
                      <div className={`w-24 h-24 rounded-[3rem] bg-gradient-to-br ${level.color} shadow-2xl flex items-center justify-center text-3xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 pulse-timeline`}>
                         {level.icon}
                      </div>
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-white text-brand-primary rounded-full flex items-center justify-center font-bold text-sm border-4 border-slate-50">
                         {level.id}
                      </div>
                   </div>

                   {/* Empty Column for spacing (Desktop) */}
                   <div className={`hidden lg:block flex-1 order-3 ${idx % 2 === 0 ? 'lg:order-3' : 'lg:order-1'}`}></div>
                </div>
              ))}
           </div>
        </div>
      </main>

      {/* Smart Deep-Dive Overlay */}
      {selectedLevel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-md animate-fade-in">
           <div className="bg-white rounded-[4rem] max-w-4xl w-full shadow-2xl overflow-hidden animate-fade-in-up flex flex-col md:flex-row relative">
              <button 
               onClick={() => setSelectedLevel(null)}
               className="absolute top-8 left-8 p-3 rounded-full hover:bg-slate-100 text-brand-gray transition-all z-20 hover:rotate-90"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className={`md:w-1/3 bg-gradient-to-br ${selectedLevel.color} p-12 text-brand-primary flex flex-col justify-between relative overflow-hidden`}>
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -z-0"></div>
                 <div className="relative z-10">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-3xl mb-8 shadow-xl border border-brand-primary/30 transform -rotate-6">
                      {selectedLevel.icon}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-60 mb-3">المحطة {selectedLevel.id}</p>
                    <h3 className="text-3xl font-bold leading-tight mb-6">{selectedLevel.title}</h3>
                 </div>
                 <div className="relative z-10 space-y-6">
                    <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">أدوات الذكاء الاصطناعي المدمجة:</p>
                       <div className="flex flex-wrap gap-2">
                          {selectedLevel.aiTools.map((tool, i) => (
                            <span key={i} className="text-[10px] font-bold bg-brand-primary/10 px-3 py-1.5 rounded-xl border border-brand-primary/20 backdrop-blur-md">{tool}</span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="md:w-2/3 p-12 md:p-16 overflow-y-auto max-h-[85vh]">
                 <div className="space-y-10">
                    <div className="space-y-6">
                       <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-4">
                          <span className="w-3 h-8 bg-brand-primary rounded-full"></span>
                          تفاصيل هذه المحطة
                       </h4>
                       <p className="text-slate-600 text-lg leading-relaxed font-medium">{selectedLevel.desc}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                       <div className="bg-brand-primary/5/50 p-8 rounded-[2.5rem] border border-brand-primary">
                          <h5 className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">ما ستقوم بإنتاجه فعلياً:</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {selectedLevel.outputs.map((out, i) => (
                               <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm">
                                  <div className="w-6 h-6 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">✓</div>
                                  <span className="text-xs font-bold text-brand-primary">{out}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                       <div className="bg-orange-50/50 p-8 rounded-[2.5rem] border border-orange-100">
                          <h5 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4">تحدي العبور (Gate Keeper):</h5>
                          <p className="text-sm font-bold text-orange-900 leading-relaxed italic">
                            "{selectedLevel.challenge}"
                          </p>
                       </div>
                    </div>

                    <div className="p-8 bg-white text-brand-primary rounded-[2.5rem] relative overflow-hidden group">
                       <div className="absolute top-[-20px] left-[-20px] text-3xl opacity-5 group-hover:rotate-12 transition-transform duration-700">💭</div>
                       <h5 className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] mb-3">نصيحة من خبير بيزنس ديفلوبرز:</h5>
                       <p className="text-lg font-bold leading-relaxed opacity-95">"{selectedLevel.expertTip}"</p>
                    </div>

                    <button 
                      onClick={() => { setSelectedLevel(null); onStart(); }}
                      className="w-full py-6 bg-brand-primary text-white rounded-[2.5rem] font-bold text-xl shadow-2xl shadow-brand-primary/20 hover:bg-brand-primary transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4"
                    >
                      <span>ابدأ هذه المحطة الآن 🚀</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
