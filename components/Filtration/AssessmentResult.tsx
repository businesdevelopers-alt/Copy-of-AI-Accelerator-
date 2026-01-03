
import React, { useEffect, useState } from 'react';
import { FinalResult } from '../../types';
import { playCelebrationSound, playErrorSound } from '../../services/audioService';

interface AssessmentResultProps {
  result: FinalResult;
  onContinue: () => void;
}

const getRadarPoints = (metrics: any, scale: number = 100, center: number = 150) => {
  const keys = ['readiness', 'analysis', 'tech', 'personality', 'strategy', 'ethics'];
  const total = keys.length;
  const angleStep = (Math.PI * 2) / total;
  
  const points = keys.map((key, i) => {
    const value = (metrics[key as keyof typeof metrics] / 100) * scale;
    const angle = i * angleStep - Math.PI / 2;
    const x = center + value * Math.cos(angle);
    const y = center + value * Math.sin(angle);
    return `${x},${y}`;
  });
  
  return points.join(' ');
};

export const AssessmentResult: React.FC<AssessmentResultProps> = ({ result, onContinue }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (result.isQualified) {
      playCelebrationSound();
    } else {
      playErrorSound();
    }
    const interval = setInterval(() => {
      setAnimatedScore(prev => {
        if (prev >= result.score) {
          clearInterval(interval);
          return result.score;
        }
        return prev + 1;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [result.score, result.isQualified]);

  const radarPath = getRadarPoints(result.metrics);
  const fullPath = getRadarPoints({ readiness: 100, analysis: 100, tech: 100, personality: 100, strategy: 100, ethics: 100 });

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        <div className="flex flex-col items-center animate-fade-in-up">
           <h2 className="text-2xl font-bold mb-6">مخطط الكفاءة الذكي</h2>
           <div className="relative w-[320px] h-[320px]">
             <svg width="320" height="320" viewBox="0 0 300 300" className="drop-shadow-2xl">
                <polygon points={fullPath} fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <polygon points={getRadarPoints({ readiness: 75, analysis: 75, tech: 75, personality: 75, strategy: 75, ethics: 75 })} fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 2" />
                <polygon points={getRadarPoints({ readiness: 50, analysis: 50, tech: 50, personality: 50, strategy: 50, ethics: 50 })} fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 2" />
                <polygon points={radarPath} fill={result.isQualified ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"} stroke={result.isQualified ? "#22c55e" : "#ef4444"} strokeWidth="3" className="transition-all duration-1000 ease-out" />
                <text x="150" y="35" textAnchor="middle" fill="#94a3b8" fontSize="10">الجاهزية</text>
                <text x="260" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10">التحليل</text>
                <text x="260" y="210" textAnchor="middle" fill="#94a3b8" fontSize="10">التقنية</text>
                <text x="150" y="275" textAnchor="middle" fill="#94a3b8" fontSize="10">الشخصية</text>
                <text x="40" y="210" textAnchor="middle" fill="#94a3b8" fontSize="10">الاستراتيجية</text>
                <text x="40" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10">الأخلاقيات</text>
             </svg>
           </div>
        </div>

        <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 animate-fade-in-up shadow-2xl relative overflow-hidden">
           <div className={`absolute top-0 right-0 w-2 h-full ${result.isQualified ? 'bg-green-500' : 'bg-red-500'}`}></div>
           
           <div className="flex justify-between items-center mb-6">
             <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">نتيجة اختبار القبول</div>
             <div className={`text-6xl font-black ${result.isQualified ? 'text-green-400' : 'text-red-400'}`}>
               {animatedScore}<span className="text-xl text-slate-500">/100</span>
             </div>
           </div>

           <div className="mb-8 space-y-4">
             <h3 className="text-2xl font-black text-white">
               {result.isQualified ? "🎉 تهانينا! تم قبولك في المسرعة" : "⚠️ تحتاج فكرتك لمزيد من النضج"}
             </h3>
             <p className="text-slate-400 text-sm leading-relaxed">
               {result.isQualified 
                 ? "لقد تجاوزت عتبة القبول بنجاح. درجاتك في التحليل وجدوى المشروع تؤهلك لبدء المحطات الست في مسرعة بيزنس ديفلوبرز." 
                 : "لم تصل درجاتك إلى الحد الأدنى المطلوب (70%). نوصيك بمراجعة خطة التطوير المقترحة وإعادة المحاولة بعد تحسين جوانب الضعف."}
             </p>
             <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border ${result.isQualified ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
               الحد الأدنى للقبول: 70%
             </div>
           </div>

           <button 
             onClick={onContinue}
             className={`w-full py-5 rounded-2xl font-black shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 ${
                result.isQualified 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20' 
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20'
             }`}
           >
             {result.isQualified ? "استعراض التقرير النهائي" : "عرض خطة التحسين المطلوبة"}
           </button>
        </div>
      </div>
    </div>
  );
};
