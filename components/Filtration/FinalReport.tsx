
import React from 'react';
import { ApplicantProfile, FinalResult } from '../../types';

interface FinalReportProps {
  profile: ApplicantProfile;
  result: FinalResult;
  onStartJourney: () => void;
}

export const FinalReport: React.FC<FinalReportProps> = ({ profile, result, onStartJourney }) => {
  return (
    <div className="min-h-screen bg-brand-bg py-10 px-4 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200" id="report-print">
        {/* Header */}
        <div className="bg-white text-brand-primary p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary rounded-bl-full opacity-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="text-center md:text-right">
                <h1 className="text-3xl font-bold mb-2">تقرير الترشيح والتقييم</h1>
                <p className="text-brand-gray uppercase tracking-widest text-xs font-bold">مسرعة الأعمال الذكية AI Accelerator</p>
             </div>
             <div className="flex items-center gap-4">
                <div className="bg-brand-primary/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-brand-primary/30 text-center">
                  <span className="block text-[10px] text-brand-gray font-bold mb-1 uppercase">الدرجة النهائية</span>
                  <span className="block font-bold text-3xl text-green-400">{result.score}/100</span>
                </div>
                <div className="bg-green-500 text-brand-primary px-4 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-green-900/20">
                   مؤهل للاحتضان ✅
                </div>
             </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 md:p-12">
           {/* Candidate Info Grid */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] text-brand-gray uppercase font-bold">المتقدم</p>
                <p className="font-bold text-brand-primary truncate">{profile.codeName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-brand-gray uppercase font-bold">المرحلة</p>
                <p className="font-bold text-slate-900">
                    {profile.projectStage === 'Idea' ? '💡 فكرة' : profile.projectStage === 'Prototype' ? '🧩 نموذج' : '🚀 منتج'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-brand-gray uppercase font-bold">النمط القيادي</p>
                <p className="font-bold text-brand-primary text-sm">{result.leadershipStyle}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-brand-gray uppercase font-bold">التاريخ</p>
                <p className="font-bold text-slate-900">{new Date().toLocaleDateString('ar-EG')}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* AI Project Evaluation Summary */}
              <div>
                <h3 className="font-bold text-brand-primary mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-brand-primary rounded-full"></span>
                  تحليل المشروع (AI Analysis)
                </h3>
                {result.projectEval && (
                  <div className="space-y-4">
                    {[
                      { l: 'وضوح الفكرة', s: result.projectEval.clarity },
                      { l: 'القيمة المقترحة', s: result.projectEval.value },
                      { l: 'التميز والابتكار', s: result.projectEval.innovation },
                      { l: 'الجدوى السوقية', s: result.projectEval.market },
                      { l: 'الجاهزية للتنفيذ', s: result.projectEval.readiness },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-500 w-24 shrink-0">{m.l}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="bg-brand-primary h-full rounded-full" 
                            style={{ width: `${(m.s / 20) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{m.s}/20</span>
                      </div>
                    ))}
                    
                    <div className="mt-8 p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary">
                       <p className="text-xs font-bold text-brand-primary mb-2">رأي المستشار الذكي:</p>
                       <p className="text-sm text-brand-primary leading-relaxed italic">"{result.projectEval.aiOpinion}"</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Achievements & Badges */}
              <div>
                <h3 className="font-bold text-brand-primary mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
                  الأوسمة المكتسبة
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {result.badges.map((badge) => (
                     <div key={badge.id} className="flex items-center gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-brand-primary transition-colors">
                        <div className="text-3xl">{badge.icon}</div>
                        <div>
                          <p className="font-bold text-brand-primary text-[10px] uppercase leading-tight">{badge.name}</p>
                          <span className="text-[8px] text-brand-gray font-bold">تم التحقق منها</span>
                        </div>
                     </div>
                   ))}
                   <div className="flex items-center gap-3 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 p-4 rounded-2xl shadow-md">
                      <div className="text-3xl">🏅</div>
                      <div>
                        <p className="font-bold text-amber-900 text-[10px] uppercase leading-tight">وسام التأهل الرسمي</p>
                        <span className="text-[8px] text-amber-600 font-bold">Business Developers</span>
                      </div>
                   </div>
                </div>

                <div className="mt-8 p-6 bg-white text-brand-primary rounded-3xl">
                   <h4 className="font-bold text-brand-primary text-sm mb-3">التوصية النهائية</h4>
                   <p className="text-xs text-slate-600 leading-relaxed">
                     بناءً على التقييم المتكامل للشخصية، التفكير التحليلي، وجدوى المشروع؛ يُوصى بقبول المتقدم في برنامج الاحتضان المكثف مع التركيز على تطوير "نموذج العمل التجاري" كمرحلة أولى.
                   </p>
                </div>
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-8 flex flex-col md:flex-row gap-4 border-t border-slate-200 no-print">
           <button onClick={() => window.print()} className="flex-1 bg-white border-2 border-slate-200 text-brand-primary py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
             حفظ كتقرير PDF
           </button>
           <button 
             onClick={onStartJourney}
             className="flex-[1.5] bg-brand-primary text-white py-4 rounded-2xl font-bold hover:bg-brand-hover transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-95"
           >
             <span className="text-lg">دخول لوحة تحكم الاحتضان</span>
             <span className="text-2xl animate-pulse">🚀</span>
           </button>
        </div>
      </div>
      
      <p className="text-center text-brand-gray text-[10px] mt-8 font-bold uppercase tracking-widest no-print">
        جميع الحقوق محفوظة © بيزنس ديفلوبرز 2024 • نظام الترشيح الذكي v2.0
      </p>
    </div>
  );
};
