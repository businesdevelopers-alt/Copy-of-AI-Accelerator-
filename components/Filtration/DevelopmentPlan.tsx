
import React from 'react';
import { ApplicantProfile, FinalResult } from '../../types';

interface DevelopmentPlanProps {
  profile: ApplicantProfile;
  result: FinalResult;
  onRestart: () => void;
}

export const DevelopmentPlan: React.FC<DevelopmentPlanProps> = ({ result, onRestart }) => {
  return (
    <div className="min-h-screen bg-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">خطة التطوير الشخصي</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            أنت في الطريق الصحيح، ولكن لضمان نجاح مشروعك، نقترح عليك العمل على النقاط التالية قبل الانضمام للحاضنة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           {/* Weakness Analysis */}
           <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
             <h3 className="font-bold text-red-800 mb-4 text-lg">نقاط التحسين المطلوبة</h3>
             <ul className="space-y-3">
               {result.metrics.tech < 50 && (
                 <li className="flex gap-2 items-start text-red-700 text-sm">
                   <span className="mt-1">❌</span>
                   <span>تعزيز المعرفة التقنية الأساسية للمشروع.</span>
                 </li>
               )}
               {result.metrics.analysis < 50 && (
                 <li className="flex gap-2 items-start text-red-700 text-sm">
                   <span className="mt-1">❌</span>
                   <span>تحسين مهارات تحليل السوق والأرقام المالية.</span>
                 </li>
               )}
               {result.metrics.readiness < 50 && (
                 <li className="flex gap-2 items-start text-red-700 text-sm">
                   <span className="mt-1">❌</span>
                   <span>توضيح نموذج العمل بشكل أكبر.</span>
                 </li>
               )}
               {/* Default item if all strictly > 50 but average is low */}
               <li className="flex gap-2 items-start text-red-700 text-sm">
                   <span className="mt-1">⚠️</span>
                   <span>زيادة الخبرة العملية في إدارة المشاريع الناشئة.</span>
                 </li>
             </ul>
           </div>

           {/* 7 Day Plan */}
           <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4 text-lg">خطة 7 أيام مقترحة</h3>
             <div className="space-y-4 relative">
                <div className="absolute top-2 right-3 bottom-2 w-0.5 bg-slate-200"></div>
                {[1, 2, 3].map(day => (
                  <div key={day} className="relative pr-8">
                     <div className="absolute right-0 top-1 w-6 h-6 bg-white border-2 border-blue-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                       {day}
                     </div>
                     <h4 className="font-bold text-slate-800 text-sm">اليوم {day}: البحث والتحليل</h4>
                     <p className="text-xs text-slate-500 mt-1">دراسة 3 منافسين محليين وعالميين وكتابة نقاط قوتهم.</p>
                  </div>
                ))}
             </div>
           </div>
        </div>

        <div className="text-center">
           <button 
             onClick={onRestart}
             className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
           >
             إعادة التقييم بعد التطوير
           </button>
        </div>
      </div>
    </div>
  );
};
