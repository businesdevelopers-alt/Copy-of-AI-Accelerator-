
import React, { useEffect, useState } from 'react';
import { FinalResult } from '../../types';
import { playCelebrationSound } from '../../services/audioService';

interface AssessmentResultProps {
  result: FinalResult;
  onContinue: () => void;
}

// Helper to calculate polygon points for Radar Chart
const getRadarPoints = (metrics: any, scale: number = 100, center: number = 150) => {
  const keys = ['readiness', 'analysis', 'tech', 'personality', 'strategy', 'ethics'];
  const total = keys.length;
  const angleStep = (Math.PI * 2) / total;
  
  const points = keys.map((key, i) => {
    const value = (metrics[key as keyof typeof metrics] / 100) * scale;
    const angle = i * angleStep - Math.PI / 2; // Start from top
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
        
        {/* Left: Chart */}
        <div className="flex flex-col items-center animate-fade-in-up">
           <h2 className="text-2xl font-bold mb-6">التقييم الشامل</h2>
           <div className="relative w-[320px] h-[320px]">
             <svg width="320" height="320" viewBox="0 0 300 300" className="drop-shadow-2xl">
                {/* Background Grid */}
                <polygon points={fullPath} fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <polygon points={getRadarPoints({ readiness: 75, analysis: 75, tech: 75, personality: 75, strategy: 75, ethics: 75 })} fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 2" />
                <polygon points={getRadarPoints({ readiness: 50, analysis: 50, tech: 50, personality: 50, strategy: 50, ethics: 50 })} fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 2" />

                {/* Data Path */}
                <polygon points={radarPath} fill="rgba(59, 130, 246, 0.5)" stroke="#3b82f6" strokeWidth="3" className="transition-all duration-1000 ease-out" />
                
                {/* Labels */}
                <text x="150" y="35" textAnchor="middle" fill="#94a3b8" fontSize="10">الجاهزية</text>
                <text x="260" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10">التحليل</text>
                <text x="260" y="210" textAnchor="middle" fill="#94a3b8" fontSize="10">التقنية</text>
                <text x="150" y="275" textAnchor="middle" fill="#94a3b8" fontSize="10">الشخصية</text>
                <text x="40" y="210" textAnchor="middle" fill="#94a3b8" fontSize="10">الاستراتيجية</text>
                <text x="40" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10">الأخلاقيات</text>
             </svg>
           </div>
        </div>

        {/* Right: Score & Status */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 animate-fade-in-up shadow-2xl" style={{ animationDelay: '0.2s' }}>
           <div className="flex justify-between items-center mb-6">
             <div className="text-slate-400 font-bold uppercase tracking-wider text-sm">مجموع النقاط</div>
             <div className={`text-5xl font-extrabold ${result.isQualified ? 'text-green-400' : 'text-orange-400'}`}>
               {animatedScore}<span className="text-2xl text-slate-500">/100</span>
             </div>
           </div>

           <div className="mb-8">
             <h3 className="text-xl font-bold mb-2 text-white">
               {result.isQualified ? "🎉 تهانينا! أنت مؤهل." : "💡 تحتاج إلى بعض التطوير."}
             </h3>
             <p className="text-slate-400 text-sm leading-relaxed">
               {result.isQualified 
                 ? "أظهرت نتائجك توازناً ممتازاً وجاهزية عالية لبدء الاحتضان في بيزنس ديفلوبرز." 
                 : "لديك إمكانيات واعدة، لكنك تحتاج لتعزيز بعض الجوانب قبل الانضمام الرسمي."}
             </p>
           </div>

           <button 
             onClick={onContinue}
             className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1 ${
                result.isQualified 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
             }`}
           >
             {result.isQualified ? "عرض التقرير الرسمي ووسام التأهل" : "عرض خطة التطوير المقترحة"}
           </button>
        </div>

      </div>
    </div>
  );
};
