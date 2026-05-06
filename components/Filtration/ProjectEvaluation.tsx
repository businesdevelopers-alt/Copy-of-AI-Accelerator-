
import React, { useState } from 'react';
import { ApplicantProfile, ProjectEvaluationResult } from '../../types';
import { evaluateProjectIdea } from '../../services/geminiService';
import { playCelebrationSound, playPositiveSound, playErrorSound } from '../../services/audioService';

interface ProjectEvaluationProps {
  profile: ApplicantProfile;
  initialText?: string;
  onComplete: (result: ProjectEvaluationResult) => void;
}

export const ProjectEvaluation: React.FC<ProjectEvaluationProps> = ({ profile, initialText = '', onComplete }) => {
  const [ideaText, setIdeaText] = useState(initialText);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ProjectEvaluationResult | null>(null);

  const handleAnalyze = async () => {
    if (!ideaText.trim() && inputMode === 'text') return;
    
    setIsAnalyzing(true);
    playPositiveSound();

    try {
      const textToAnalyze = inputMode === 'file' 
        ? `مشروع في مجال ${profile.sector} بمرحلة ${profile.projectStage}. تم رفع ملف توضيحي يتناول الحل المبتكر للمشكلة السوقية المحددة.` 
        : ideaText;

      const evalResult = await evaluateProjectIdea(textToAnalyze, profile);
      setResult(evalResult);
      
      if (evalResult.classification === 'Green') {
        playCelebrationSound();
      } else {
        playPositiveSound();
      }
    } catch (error) {
      console.error("Evaluation failed", error);
      playErrorSound();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusStyle = (cls: string) => {
    switch (cls) {
      case 'Green': return { bg: 'bg-green-500', text: 'text-green-700', label: 'جاهز للاحتضان', icon: '🟢' };
      case 'Yellow': return { bg: 'bg-amber-500', text: 'text-amber-700', label: 'يحتاج تطوير', icon: '🟡' };
      case 'Red': return { bg: 'bg-rose-500', text: 'text-rose-700', label: 'غير واضح', icon: '🔴' };
      default: return { bg: 'bg-brand-bg0', text: 'text-brand-primary', label: 'قيد المراجعة', icon: '⚪' };
    }
  };

  if (result) {
    const status = getStatusStyle(result.classification);
    
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 md:p-8 font-sans text-right" dir="rtl">
        <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl border border-brand-primary/10 overflow-hidden animate-fade-in-up">
          
          <div className="bg-slate-100 p-10 md:p-14 text-brand-primary relative">
            <div className="absolute top-0 left-0 w-80 h-80 bg-brand-primary rounded-br-full opacity-10 blur-3xl"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center font-bold shadow-lg">BD</div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-gray">نظام التحقق الذكي (AAS)</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">نتائج التحقق من الفكرة</h2>
                <p className="text-brand-primary font-bold">مشروع: {profile.codeName}</p>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="text-center">
                    <div className="w-28 h-28 rounded-full border-8 border-brand-primary/10 flex items-center justify-center relative">
                       <svg className="w-full h-full absolute inset-0 transform -rotate-90">
                          <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-brand-primary/5" />
                          <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * result.totalScore / 100)} className="text-brand-hover transition-all duration-1000" />
                       </svg>
                       <span className="text-3xl font-bold">{result.totalScore}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-3 block text-slate-500">مؤشر الجدوى</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-14 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Scores Column */}
              <div className="space-y-8">
                <h3 className="font-bold text-xl text-brand-primary flex items-center gap-3">
                   <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                   تحليل المحاور الاستراتيجية
                </h3>
                
                {[
                  { label: 'وضوح الفكرة', score: result.clarity, icon: '💡' },
                  { label: 'القيمة المقترحة', score: result.value, icon: '🎯' },
                  { label: 'التميز والابتكار', score: result.innovation, icon: '🧠' },
                  { label: 'الجدوى السوقية', score: result.market, icon: '📊' },
                  { label: 'الجاهزية للتنفيذ', score: result.readiness, icon: '⚙️' },
                ].map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-brand-gray flex items-center gap-2">
                         <span className="text-base">{item.icon}</span> {item.label}
                       </span>
                       <span className="text-sm font-bold text-brand-primary">{item.score}/20</span>
                    </div>
                    <div className="h-2.5 bg-brand-primary/5 rounded-full overflow-hidden shadow-inner">
                       <div 
                         className={`h-full rounded-full transition-all duration-1000 ease-out ${status.bg}`} 
                         style={{ width: `${(item.score / 20) * 100}%` }}
                       ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths & Weaknesses Column */}
              <div className="space-y-10">
                 <div className="space-y-4">
                    <h4 className="text-xs font-bold text-green-500 uppercase tracking-widest px-2">نقاط القوة (Strengths)</h4>
                    <div className="space-y-2">
                       {result.strengths.map((s, i) => (
                         <div key={i} className="flex gap-3 items-center p-4 bg-green-500/5 border border-green-500/10 rounded-2xl text-green-100 text-sm font-medium">
                            <span className="text-green-500 font-bold">✓</span> {s}
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest px-2">مخاطر وتحديات (Weaknesses/Risks)</h4>
                    <div className="space-y-2">
                       {result.weaknesses.map((w, i) => (
                         <div key={i} className="flex gap-3 items-center p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-100 text-sm font-medium">
                            <span className="text-rose-500 font-bold">!</span> {w}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* AI Verdict */}
            <div className="p-8 rounded-[2.5rem] bg-brand-primary/5 border border-brand-primary/10 relative group">
               <div className="absolute top-[-20px] right-8 w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-xl text-2xl">🤖</div>
               <h3 className="text-lg font-bold text-brand-primary mb-4 pr-12">خلاصة رأي المستشار الذكي</h3>
               <p className="text-slate-600 leading-relaxed text-lg font-medium italic pr-4 border-r-2 border-brand-primary/20">
                 "{result.aiOpinion}"
               </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-brand-primary/10">
               <button 
                 onClick={() => setResult(null)}
                 className="flex-1 py-5 rounded-[1.8rem] bg-brand-primary/5 border border-brand-primary/20 text-white font-bold hover:bg-brand-primary/10 transition-all"
               >
                 تعديل وصف الفكرة
               </button>
               <button 
                 onClick={() => onComplete(result)}
                 className={`flex-[2] py-5 rounded-[1.8rem] text-brand-primary font-bold text-lg shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 ${status.bg} hover:brightness-110`}
               >
                 <span>المتابعة إلى اختبار الترشيح</span>
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4 md:p-8 font-sans text-right" dir="rtl">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12 animate-fade-in-up">
           <div className="inline-flex items-center gap-3 bg-brand-hover/10 text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-brand-primary/20">
             <span className="animate-pulse">✨</span> AI Content Analysis
           </div>
           <h1 className="text-3xl md:text-3xl font-bold text-brand-primary mb-4 tracking-tight leading-tight">فلنتحقق من قوة فكرتك</h1>
           <p className="text-brand-gray text-lg font-medium max-w-lg mx-auto">ارفع عرضك التوضيحي أو اكتب وصفاً تفصيلياً ليقوم الذكاء الاصطناعي برصد الثغرات ونقاط القوة.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-brand-primary/10 overflow-hidden animate-fade-in-up">
           <div className="flex border-b border-brand-primary/10 bg-brand-primary/5 p-3">
             <button 
               onClick={() => setInputMode('text')}
               className={`flex-1 py-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-3 ${inputMode === 'text' ? 'bg-slate-100 text-brand-primary shadow-xl border border-brand-primary/10' : 'text-slate-500 hover:text-slate-600'}`}
             >
               <span>✏️</span> وصف الفكرة
             </button>
             <button 
               onClick={() => setInputMode('file')}
               className={`flex-1 py-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-3 ${inputMode === 'file' ? 'bg-slate-100 text-brand-primary shadow-xl border border-brand-primary/10' : 'text-slate-500 hover:text-slate-600'}`}
             >
               <span>📎</span> رفع ملف (Pitch Deck)
             </button>
           </div>

           <div className="p-8 md:p-12">
             {inputMode === 'text' ? (
               <div className="space-y-6">
                 <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pr-2">أخبرنا عن جوهر مشروعك</label>
                    <span className="text-[10px] text-brand-hover font-bold px-3 py-1 bg-brand-primary/10 rounded-lg">{ideaText.length} حرف</span>
                 </div>
                 <textarea 
                   className="w-full h-64 p-8 bg-slate-100/50 border border-brand-primary/10 rounded-[2rem] focus:bg-slate-100 focus:ring-4 focus:ring-blue-500/5 focus:border-brand-primary/20 outline-none transition-all resize-none text-brand-primary leading-relaxed text-lg shadow-inner placeholder-slate-600"
                   placeholder="ما هي المشكلة التي لاحظتها؟ وكيف ستقوم بحلها بشكل مختلف ومربح؟"
                   value={ideaText}
                   onChange={(e) => setIdeaText(e.target.value)}
                 ></textarea>
               </div>
             ) : (
               <div className="border-4 border-dashed border-brand-primary/10 rounded-[3rem] h-64 flex flex-col items-center justify-center bg-brand-primary/5 hover:bg-brand-primary/5 hover:border-brand-primary/20 transition-all cursor-pointer group">
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform border border-brand-primary/10">
                    <svg className="w-10 h-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="font-bold text-slate-600">اضغط لرفع ملف العرض التوضيحي</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">PDF, DOCX, PPTX (MAX 10MB)</p>
               </div>
             )}

             <div className="mt-10">
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing || (inputMode === 'text' && ideaText.length < 20)}
                 className="w-full bg-brand-primary hover:bg-brand-hover disabled:bg-slate-100 disabled:text-slate-600 text-white font-bold py-6 rounded-[2rem] shadow-2xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-4 group active:scale-95 overflow-hidden relative"
               >
                 {isAnalyzing ? (
                   <>
                     <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                     <span className="text-lg">جاري التحقق من الثغرات والفرص...</span>
                   </>
                 ) : (
                   <>
                     <span className="text-xl">تفعيل التحقق من الفكرة</span>
                     <svg className="w-6 h-6 group-hover:translate-x-[-6px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                   </>
                 )}
               </button>
               {ideaText.length < 20 && inputMode === 'text' && (
                 <p className="text-center text-[10px] text-rose-500 mt-4 font-bold uppercase tracking-widest animate-pulse">يرجى كتابة 20 حرفاً على الأقل للتحليل</p>
               )}
             </div>
             
             <p className="text-center text-[10px] text-slate-600 mt-10 font-bold uppercase tracking-[0.4em]">
               Powered by Google Gemini 3 • Virtual Acceleration Core
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};
