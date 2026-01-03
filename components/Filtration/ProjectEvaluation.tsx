
import React, { useState } from 'react';
import { ApplicantProfile, ProjectEvaluationResult } from '../../types';
import { evaluateProjectIdea } from '../../services/geminiService';
import { playCelebrationSound, playPositiveSound, playErrorSound } from '../../services/audioService';

interface ProjectEvaluationProps {
  profile: ApplicantProfile;
  onComplete: (result: ProjectEvaluationResult) => void;
}

export const ProjectEvaluation: React.FC<ProjectEvaluationProps> = ({ profile, onComplete }) => {
  const [ideaText, setIdeaText] = useState('');
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
      default: return { bg: 'bg-slate-500', text: 'text-slate-700', label: 'قيد المراجعة', icon: '⚪' };
    }
  };

  if (result) {
    const status = getStatusStyle(result.classification);
    
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans">
        <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up">
          
          <div className="bg-slate-900 p-10 md:p-14 text-white relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-bl-full opacity-10 blur-3xl"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black shadow-lg">BD</div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">نظام التحليل التلقائي (AAS)</span>
                </div>
                <h2 className="text-4xl font-black mb-2">تقرير تقييم الفكرة</h2>
                <p className="text-blue-400 font-bold">المتقدم: {profile.codeName}</p>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-8 border-white/10 flex items-center justify-center relative">
                       <svg className="w-full h-full absolute inset-0 transform -rotate-90">
                          <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                          <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * result.totalScore / 100)} className="text-blue-500 transition-all duration-1000" />
                       </svg>
                       <span className="text-2xl font-black">{result.totalScore}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest mt-2 block opacity-50">إجمالي النقاط</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="p-10 md:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
                   <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                   تحليل المحاور الخمسة
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
                       <span className="text-xs font-black text-slate-500 flex items-center gap-2">
                         <span className="text-base">{item.icon}</span> {item.label}
                       </span>
                       <span className="text-sm font-black text-slate-900">{item.score}/20</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                       <div 
                         className={`h-full rounded-full transition-all duration-1000 ease-out ${status.bg}`} 
                         style={{ width: `${(item.score / 20) * 100}%` }}
                       ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                 <h3 className="font-black text-xl text-slate-800 mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                    رأي المستشار الذكي
                 </h3>
                 <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex-1 relative mb-6">
                    <div className="absolute -top-4 right-8 w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm text-xl">🤖</div>
                    <p className="text-slate-600 leading-relaxed font-medium italic">
                      "{result.aiOpinion}"
                    </p>
                 </div>

                 <div className={`p-6 rounded-2xl flex items-center justify-between border-2 ${status.text.replace('text', 'bg-opacity-10 bg').replace('text', 'border')}`}>
                    <div className="flex items-center gap-4">
                       <span className="text-3xl">{status.icon}</span>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">التصنيف النهائي</p>
                          <p className={`font-black text-lg ${status.text}`}>{status.label}</p>
                       </div>
                    </div>
                    <svg className={`w-6 h-6 ${status.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                 </div>
              </div>
            </div>

            <div className="mt-14 pt-10 border-t border-slate-100 flex flex-col md:flex-row gap-4">
               <button 
                 onClick={() => setResult(null)}
                 className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-5 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all active:scale-95"
               >
                 إعادة رفع الفكرة
               </button>
               <button 
                 onClick={() => onComplete(result)}
                 className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
               >
                 <span>الانتقال لمرحلة التطوير</span>
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
             AI Project Analyzer
           </div>
           <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight leading-tight">الآن نودّ التعرّف على مشروعك</h1>
           <p className="text-slate-500 text-lg">ارفع خطة العمل أو اكتب وصفاً تفصيلياً للفكرة للتحليل الذكي.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up">
           <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
             <button 
               onClick={() => setInputMode('text')}
               className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 ${inputMode === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <span>✏️</span> وصف الفكرة
             </button>
             <button 
               onClick={() => setInputMode('file')}
               className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 ${inputMode === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <span>📎</span> رفع ملف
             </button>
           </div>

           <div className="p-8 md:p-12">
             {inputMode === 'text' ? (
               <div className="space-y-4">
                 <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">تحدث عن فكرتك بحرية</label>
                    <span className="text-[10px] text-blue-500 font-bold px-2 py-1 bg-blue-50 rounded-lg">{ideaText.length} حرف</span>
                 </div>
                 <textarea 
                   className="w-full h-64 p-8 bg-slate-50 border border-slate-200 rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-slate-800 leading-relaxed text-lg shadow-inner"
                   placeholder="ما هي المشكلة؟ وما هو الحل المبتكر الذي تقدمه؟"
                   value={ideaText}
                   onChange={(e) => setIdeaText(e.target.value)}
                 ></textarea>
               </div>
             ) : (
               <div className="border-4 border-dashed border-slate-100 rounded-[3rem] h-64 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="font-black text-slate-700">اضغط لرفع ملف العرض التوضيحي</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">PDF, DOCX, PPTX</p>
               </div>
             )}

             <div className="mt-10">
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing || (inputMode === 'text' && !ideaText.trim())}
                 className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 text-white font-black py-6 rounded-2xl shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-4 group active:scale-95 overflow-hidden relative"
               >
                 {isAnalyzing ? (
                   <>
                     <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                     <span className="text-lg">جاري التحليل الشامل للمحاور...</span>
                   </>
                 ) : (
                   <>
                     <span className="text-xl">ابدأ التحليل الذكي للفكرة</span>
                     <svg className="w-6 h-6 group-hover:translate-x-[-6px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                   </>
                 )}
               </button>
             </div>
             
             <p className="text-center text-[10px] text-slate-400 mt-8 font-bold uppercase tracking-widest">
               Powered by Gemini Pro • Business Developers Hub
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};
