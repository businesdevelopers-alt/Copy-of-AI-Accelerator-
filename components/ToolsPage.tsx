
import React, { useState, useRef, useEffect } from 'react';
import { 
  generateStartupIdea, 
  generateProjectDetails, 
  generateProductSpecs, 
  generateLeanBusinessPlan,
  generatePitchDeckOutline,
  generateFounderCV
} from '../services/geminiService';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../services/audioService';

interface ToolsPageProps {
  onBack: () => void;
}

type ToolID = 'IDEA' | 'CV' | 'PRODUCT' | 'PLAN' | 'DECK';

interface ToolMeta {
  id: ToolID;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  features: string[];
}

const TOOLS_META: ToolMeta[] = [
  {
    id: 'IDEA',
    title: 'مولد الأفكار الابتكارية',
    description: 'استخرج أفكاراً لمشاريع ناشئة بناءً على شغفك واتجاهات السوق الحالية.',
    icon: '💡',
    color: 'blue',
    gradient: 'from-blue-600 to-cyan-400',
    features: ['تحليل القطاعات', 'ثلاثة خيارات ذكية', 'تحديد الميزة']
  },
  {
    id: 'CV',
    title: 'بروفايل المؤسس (CV)',
    description: 'صمم سيرة ذاتية احترافية تبرز مهاراتك القيادية وتربطها برؤية مشروعك أمام المستثمرين.',
    icon: '👤',
    color: 'purple',
    gradient: 'from-purple-600 to-indigo-400',
    features: ['نبذة احترافية', 'إبراز المهارات', 'مواءمة استثمارية']
  },
  {
    id: 'PRODUCT',
    title: 'مهندس المنتج (MVP)',
    description: 'حدد المزايا الجوهرية لمنتجك الأولي وصمم رحلة المستخدم التقنية باحترافية.',
    icon: '⚙️',
    color: 'emerald',
    gradient: 'from-emerald-600 to-teal-400',
    features: ['مزايا Core MVP', 'User Flow', 'معايير النجاح']
  },
  {
    id: 'PLAN',
    title: 'خطة العمل المرنة',
    description: 'ابنِ خطة عمل استراتيجية (Business Plan) تغطي القيمة المضافة، الإيرادات، التكاليف، والسوق المستهدف.',
    icon: '📊',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-400',
    features: ['نموذج الربح', 'قنوات التوزيع', 'تحليل التكاليف']
  },
  {
    id: 'DECK',
    title: 'مصمم العرض الاستثماري',
    description: 'صغ هيكلاً قوياً لعرضك التقديمي (Investment Pitch Deck) لاقتناص فرص التمويل.',
    icon: '🚀',
    color: 'indigo',
    gradient: 'from-indigo-600 to-blue-700',
    features: ['7 شرائح استراتيجية', 'صياغة استثمارية', 'وضوح مالي']
  }
];

export const ToolsPage: React.FC<ToolsPageProps> = ({ onBack }) => {
  const [activeTool, setActiveTool] = useState<ToolID | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const ideaFileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [ideaForm, setIdeaForm] = useState({ sector: '', interest: '' });
  const [cvForm, setCvForm] = useState({ name: '', experience: '', skills: '', vision: '' });
  const [productForm, setProductForm] = useState({ projectName: '', description: '' });
  const [planForm, setPlanForm] = useState({ startupName: '', industry: '', problem: '', solution: '', targetMarket: '' });
  const [deckForm, setDeckForm] = useState({ startupName: '', problem: '', solution: '' });

  const handleGenerate = async () => {
    if (!activeTool) return;
    setIsLoading(true);
    setResult(null);
    playPositiveSound();

    try {
      let res;
      if (activeTool === 'IDEA') res = await generateStartupIdea(ideaForm);
      else if (activeTool === 'CV') res = await generateFounderCV(cvForm);
      else if (activeTool === 'PRODUCT') res = await generateProductSpecs(productForm);
      else if (activeTool === 'PLAN') res = await generateLeanBusinessPlan(planForm);
      else if (activeTool === 'DECK') res = await generatePitchDeckOutline(deckForm);
      
      setResult(res);
      playCelebrationSound();
    } catch (error) {
      console.error(error);
      playErrorSound();
      alert("عذراً، حدث خطأ في النظام الذكي. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdeaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple logic to split by lines if possible, otherwise put all in interest
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length >= 2) {
        setIdeaForm({
          sector: lines[0].trim(),
          interest: lines.slice(1).join('\n').trim()
        });
      } else {
        setIdeaForm(prev => ({ ...prev, interest: text.trim() }));
      }
      playPositiveSound();
    };
    reader.onerror = () => {
      playErrorSound();
      alert("فشل في قراءة الملف.");
    };
    reader.readAsText(file);
  };

  const copyToClipboard = () => {
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text);
    alert("تم نسخ المحتوى بنجاح!");
  };

  const resetTool = () => {
    setActiveTool(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900" dir="rtl">
      <style>{`
        .tool-card {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tool-card:hover { 
          transform: translateY(-12px) scale(1.02);
          border-color: #3b82f6; 
          box-shadow: 0 40px 80px -20px rgba(59, 130, 246, 0.15); 
        }
        .tool-card:active {
          transform: scale(0.98);
        }
        @keyframes slide-up-soft {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up-soft 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .snap-shelf {
          scroll-snap-type: x mandatory;
        }
        .snap-item {
          scroll-snap-align: start;
        }
        
        .studio-gradient {
          background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.05), transparent 40%),
                      radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.05), transparent 40%);
        }
      `}</style>

      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={activeTool ? resetTool : onBack} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all active:scale-95 group border border-slate-100">
              <svg className={`w-6 h-6 transform ${activeTool ? '' : 'rotate-180'} transition-transform group-hover:-translate-x-1`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tight">استوديو الأدوات الذكية</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1.5">Elite AI Workbench • Version 2.5</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6">
             <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl flex items-center gap-4 shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">System Status</span>
                <div className="h-4 w-px bg-white/10"></div>
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   <span className="text-[10px] font-black uppercase">Gemini 3 Pro</span>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 studio-gradient">
        
        {/* Tool Selection Hub */}
        {!activeTool && (
          <div className="animate-slide-up space-y-16">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
               <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                  <span className="animate-spin-slow">✨</span>
                  Accelerator Toolkit
               </div>
               <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                 عزز طموحك <br/> 
                 <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-indigo-500">بأدوات ريادية ذكية</span>
               </h2>
               <p className="text-slate-500 text-xl font-medium leading-relaxed">
                 انتقل من الفكرة إلى التنفيذ في دقائق. اختر أحد المختبرات المتخصصة أدناه لنقوم بمساعدتك في صياغة مستندات مشروعك بمعايير عالمية.
               </p>
            </div>

            <div 
                ref={shelfRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
               >
                  {TOOLS_META.map((tool, idx) => (
                    <button 
                      key={tool.id} 
                      onClick={() => { playPositiveSound(); setActiveTool(tool.id); }}
                      className="text-right group p-10 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm tool-card relative overflow-hidden flex flex-col"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                        <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${tool.gradient} opacity-[0.03] rounded-bl-[6rem] group-hover:scale-125 transition-transform duration-1000`}></div>
                        
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-12 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner border border-slate-50 relative">
                           <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-[2.5rem]`}></div>
                           {tool.icon}
                        </div>
                        
                        <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                          {tool.title}
                        </h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-12 flex-grow text-base line-clamp-3">
                          {tool.description}
                        </p>
                        
                        <div className="space-y-4 pt-10 border-t border-slate-50">
                           {tool.features.map((f, i) => (
                             <div key={i} className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                                <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${tool.gradient} shadow-sm group-hover:animate-pulse`}></span>
                                {f}
                             </div>
                           ))}
                        </div>

                        <div className="mt-12 flex items-center justify-between">
                           <div className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                              <span>فتح المختبر</span>
                              <svg className="w-4 h-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7" /></svg>
                           </div>
                           <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-300">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                           </div>
                        </div>
                    </button>
                  ))}
            </div>
          </div>
        )}

        {/* Active Workspace */}
        {activeTool && (
          <div className="flex flex-col lg:flex-row gap-12 animate-slide-up">
            
            {/* Control Form Sidebar */}
            <div className="lg:w-[440px] shrink-0 bg-white p-10 md:p-12 rounded-[4rem] shadow-2xl border border-slate-100 h-fit sticky top-28 group">
               <div className="mb-12 flex items-center gap-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${TOOLS_META.find(t => t.id === activeTool)?.gradient} rounded-[2rem] flex items-center justify-center text-4xl shadow-xl text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {TOOLS_META.find(t => t.id === activeTool)?.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                      {TOOLS_META.find(t => t.id === activeTool)?.title}
                    </h2>
                    <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mt-1.5">Input Parameters</p>
                  </div>
               </div>

               <div className="space-y-8">
                  {activeTool === 'IDEA' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">إدخال البيانات</label>
                        <button 
                          onClick={() => ideaFileInputRef.current?.click()}
                          className="text-[10px] font-black text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-3 py-1 rounded-lg transition-all"
                        >
                          <span>📁 رفع ملف نصي (TXT)</span>
                        </button>
                        <input 
                          type="file" 
                          ref={ideaFileInputRef} 
                          className="hidden" 
                          accept=".txt" 
                          onChange={handleIdeaFileChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">قطاع العمل المفضل</label>
                        <input 
                          className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all font-bold" 
                          value={ideaForm.sector} 
                          onChange={e => setIdeaForm({...ideaForm, sector: e.target.value})} 
                          placeholder="مثال: التقنية المالية، الاستدامة..." 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">ما هي اهتماماتك؟</label>
                        <textarea 
                          className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all font-medium resize-none" 
                          value={ideaForm.interest} 
                          onChange={e => setIdeaForm({...ideaForm, interest: e.target.value})} 
                          placeholder="تحدث عن المشكلات التي تلاحظها أو المهارات التي تملكها..." 
                        />
                      </div>
                    </div>
                  )}

                  {activeTool === 'CV' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">الاسم الكامل</label>
                        <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all font-bold" value={cvForm.name} onChange={e => setCvForm({...cvForm, name: e.target.value})} placeholder="اسم المؤسس" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">الخبرات العملية</label>
                        <textarea className="w-full h-24 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all font-medium resize-none" value={cvForm.experience} onChange={e => setCvForm({...cvForm, experience: e.target.value})} placeholder="اذكر أهم الأدوار السابقة..." />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">المهارات الأساسية</label>
                        <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all font-bold" value={cvForm.skills} onChange={e => setCvForm({...cvForm, skills: e.target.value})} placeholder="مهارات تقنية أو قيادية..." />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">رؤية مشروعك الحالي</label>
                        <textarea className="w-full h-24 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all font-medium resize-none" value={cvForm.vision} onChange={e => setCvForm({...cvForm, vision: e.target.value})} placeholder="لماذا أنت الشخص المناسب لهذا المشروع؟" />
                      </div>
                    </div>
                  )}

                  {activeTool === 'PRODUCT' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">اسم المشروع</label>
                        <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all font-bold" value={productForm.projectName} onChange={e => setProductForm({...productForm, projectName: e.target.value})} placeholder="اسم شركتك الناشئة" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">وصف مختصر للحل</label>
                        <textarea className="w-full h-44 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all font-medium resize-none" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} placeholder="كيف سيعمل منتجك؟ وما هي الفائدة المباشرة للعميل؟" />
                      </div>
                    </div>
                  )}

                  {activeTool === 'PLAN' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">اسم الشركة</label>
                          <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold" value={planForm.startupName} onChange={e => setPlanForm({...planForm, startupName: e.target.value})} placeholder="اسم المشروع" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">القطاع</label>
                          <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold" value={planForm.industry} onChange={e => setPlanForm({...planForm, industry: e.target.value})} placeholder="مثال: SaaS" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">المشكلة التي تعالجها</label>
                        <textarea className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-medium resize-none" value={planForm.problem} onChange={e => setPlanForm({...planForm, problem: e.target.value})} placeholder="ما هو الألم الذي يشعر به العميل؟" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الحل المقترح</label>
                        <textarea className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-medium resize-none" value={planForm.solution} onChange={e => setPlanForm({...planForm, solution: e.target.value})} placeholder="كيف ينهي مشروعك هذا الألم؟" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">السوق المستهدف</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold" value={planForm.targetMarket} onChange={e => setPlanForm({...planForm, targetMarket: e.target.value})} placeholder="من هم عملاؤك المحتملون؟" />
                      </div>
                    </div>
                  )}

                  {activeTool === 'DECK' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">اسم المشروع</label>
                        <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all font-bold" value={deckForm.startupName} onChange={e => setDeckForm({...deckForm, startupName: e.target.value})} placeholder="اسم شركتك الناشئة" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">المشكلة السوقية</label>
                        <textarea className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all font-medium resize-none" value={deckForm.problem} onChange={e => setDeckForm({...deckForm, problem: e.target.value})} placeholder="ما هو التحدي الصعب الذي تحاول حله؟" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">الحل المبتكر</label>
                        <textarea className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all font-medium resize-none" value={deckForm.solution} onChange={e => setDeckForm({...deckForm, solution: e.target.value})} placeholder="كيف يحل مشروعك هذا التحدي بشكل فريد؟" />
                      </div>
                    </div>
                  )}

                  <div className="pt-10">
                    <button 
                      onClick={handleGenerate} 
                      disabled={isLoading}
                      className="w-full py-6 bg-slate-900 hover:bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 group overflow-hidden relative"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-4">
                           <div className="w-6 h-6 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                           <span className="tracking-widest uppercase text-xs">Processing...</span>
                        </div>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                          <span>توليد المستند الذكي</span>
                          <svg className="w-6 h-6 transform rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </>
                      )}
                    </button>
                  </div>
               </div>
            </div>

            {/* Results Output Canvas */}
            <div className="flex-1 bg-white p-12 md:p-16 rounded-[4.5rem] shadow-2xl border border-slate-100 min-h-[800px] flex flex-col relative overflow-hidden">
               
               <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] -z-0"></div>
               <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[100px] -z-0"></div>

               {!result && !isLoading && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 select-none relative z-10">
                    <div className="w-64 h-64 bg-slate-50 rounded-full flex items-center justify-center text-9xl mb-12 shadow-inner animate-pulse">🤖</div>
                    <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">بانتظار مدخلاتك</h3>
                    <p className="max-w-md text-xl font-medium leading-relaxed text-slate-500">املأ البيانات في لوحة التحكم الجانبية، وسيقوم محرك Gemini AI بصياغة أفكارك ومخططاتك بأسلوب ريادي رفيع المستوى.</p>
                 </div>
               )}

               {isLoading && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                    <div className="relative w-44 h-44 mb-14">
                       <div className="absolute inset-0 border-[12px] border-slate-50 rounded-full"></div>
                       <div className="absolute inset-0 border-[12px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                       <div className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce">✨</div>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">جاري التحليل والصياغة...</h3>
                    <p className="text-slate-400 text-lg font-bold uppercase tracking-widest animate-pulse">Generative AI in Progress</p>
                 </div>
               )}

               {result && (
                 <div className="relative z-10 flex flex-col h-full animate-slide-up">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 pb-12 border-b border-slate-100">
                       <div>
                          <h3 className="text-4xl font-black text-slate-900 flex items-center gap-5">
                             <span className="w-3.5 h-12 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)]"></span>
                             المخرج النهائي
                          </h3>
                          <p className="text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-xs">Output generated via Gemini AI</p>
                       </div>
                       <div className="flex gap-4 w-full md:w-auto">
                          <button onClick={copyToClipboard} className="flex-1 md:flex-none px-10 py-5 bg-slate-900 text-white rounded-[1.8rem] text-sm font-black shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-4">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            <span>نسخ النص</span>
                          </button>
                          <button onClick={() => window.print()} className="p-5 bg-white border border-slate-200 text-slate-600 rounded-[1.5rem] hover:bg-slate-50 transition-all shadow-sm active:scale-90">
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                          </button>
                       </div>
                    </div>

                    <div className="flex-1 bg-slate-50/40 p-10 md:p-16 rounded-[4rem] border border-slate-100 shadow-inner overflow-y-auto max-h-[800px] custom-scrollbar">
                        {activeTool === 'DECK' && result.slides ? (
                           <div className="space-y-16">
                              {result.slides.map((slide: any, i: number) => (
                                <div key={i} className="bg-white p-14 rounded-[3.5rem] shadow-sm border border-slate-100 relative group hover:border-blue-200 transition-colors">
                                   <span className="absolute top-10 left-12 text-7xl font-black text-slate-50 select-none group-hover:text-blue-50 transition-colors">0{i+1}</span>
                                   <h4 className="text-3xl font-black text-blue-600 mb-10 relative z-10 pb-5 border-b border-slate-50">{slide.title}</h4>
                                   <p className="text-slate-700 leading-relaxed text-2xl font-medium whitespace-pre-wrap relative z-10">{slide.content}</p>
                                </div>
                              ))}
                           </div>
                        ) : (
                           <div className="prose prose-slate max-w-none prose-p:text-2xl prose-p:leading-[3rem] prose-p:text-slate-700 prose-li:text-xl prose-headings:font-black prose-headings:text-blue-600 whitespace-pre-wrap font-medium">
                             {result}
                           </div>
                        )}
                    </div>
                    
                    <div className="mt-12 p-8 bg-blue-600 rounded-[3rem] shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="flex items-center gap-6">
                          <span className="text-4xl bg-white/20 p-3 rounded-2xl backdrop-blur-sm">🧠</span>
                          <div className="text-white">
                             <p className="font-black text-lg">تحليل ذكي مكتمل</p>
                             <p className="text-white/70 font-bold text-xs">تم بناء هذه المخرجات بناءً على أفضل الممارسات في مسرعات الأعمال العالمية.</p>
                          </div>
                       </div>
                       <button onClick={resetTool} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/20">تغيير الأداة ⊕</button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-slate-200 text-center bg-white/50 no-print">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">Professional Entrepreneurship Studio • AI Powered • 2024</p>
      </footer>
    </div>
  );
};
