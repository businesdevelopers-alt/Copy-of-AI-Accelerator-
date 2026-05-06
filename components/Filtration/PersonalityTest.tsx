
import React, { useState } from 'react';
import { PersonalityQuestion } from '../../types';
import { playPositiveSound } from '../../services/audioService';

interface PersonalityTestProps {
  onComplete: (style: string) => void;
}

const QUESTIONS: PersonalityQuestion[] = [
  {
    id: 1,
    situation: "واجهت مشكلة تقنية مفاجئة أوقفت عمل فريقك لمدة ساعة. ماذا تفعل؟",
    options: [
      { text: "أجتمع بالفريق فوراً للبحث عن حل بديل يدوي مؤقت.", style: "Operational" },
      { text: "أستغل الوقت في التخطيط للمستقبل حتى تعود الخدمة.", style: "Visionary" },
      { text: "أتواصل مع الفريق التقني وأدعمهم نفسياً لحل المشكلة.", style: "Balanced" }
    ]
  },
  {
    id: 2,
    situation: "لديك ميزانية محدودة جداً للتسويق هذا الشهر، كيف تنفقها؟",
    options: [
      { text: "أركزها كلها على حملة واحدة كبيرة ومخاطرة.", style: "Visionary" },
      { text: "أقسمها بدقة على قنوات مجربة لضمان العائد.", style: "Operational" },
      { text: "أستثمر جزءاً في تحسين المنتج ليعوّض التسويق.", style: "Balanced" }
    ]
  },
  {
    id: 3,
    situation: "موظف متميز لديك طلب زيادة في الراتب وأنت لا تملك الميزانية حالياً.",
    options: [
      { text: "أعده بأسهم مستقبلية أو نسبة من الأرباح.", style: "Visionary" },
      { text: "أصارحه بالوضع المالي وأطلب منه الصبر.", style: "Operational" },
      { text: "أبحث له عن مزايا غير مالية (مرونة، تدريب) كتعويض.", style: "Balanced" }
    ]
  },
  {
    id: 4,
    situation: "المنافس أطلق ميزة جديدة تتفوق على منتجك.",
    options: [
      { text: "أحلل الميزة بدقة وأنسخها بشكل أفضل.", style: "Operational" },
      { text: "أتجاهلها وأركز على رؤيتي الخاصة المختلفة تماماً.", style: "Visionary" },
      { text: "أستمع لآراء العملاء أولاً قبل اتخاذ أي رد فعل.", style: "Balanced" }
    ]
  },
  {
    id: 5,
    situation: "يومك مزدحم جداً بالمهام.",
    options: [
      { text: "أفوض معظم المهام وأركز على الصورة الكبيرة.", style: "Visionary" },
      { text: "أنجز كل شيء بنفسي لضمان الجودة.", style: "Operational" },
      { text: "أرتب الأولويات وأفوض ما يمكن تفويضه.", style: "Balanced" }
    ]
  },
  {
    id: 6,
    situation: "تلقيت نقداً قاسياً من مستثمر محتمل.",
    options: [
      { text: "أدافع عن فكرتي بشراسة لأنني أؤمن بها.", style: "Visionary" },
      { text: "أطلب تفاصيل وأرقام لإثبات وجهة نظره.", style: "Operational" },
      { text: "أتقبل النقد وأفكر كيف أستفيد منه لتطوير المشروع.", style: "Balanced" }
    ]
  }
];

export const PersonalityTest: React.FC<PersonalityTestProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (style: string) => {
    playPositiveSound();
    const newAnswers = [...answers, style];
    setAnswers(newAnswers);

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate Result
      const counts: Record<string, number> = {};
      newAnswers.forEach(a => counts[a] = (counts[a] || 0) + 1);
      const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      
      let finalStyle = "قائد متوازن (Balanced)";
      if (winner === "Visionary") finalStyle = "قائد ملهم (Visionary)";
      if (winner === "Operational") finalStyle = "قائد تنفيذي (Operational)";

      onComplete(finalStyle);
    }
  };

  const currentQ = QUESTIONS[currentIndex];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center mb-8">
        <h2 className="text-3xl font-bold text-brand-primary mb-2">🧠 نمط القيادة الريادية</h2>
        <p className="text-slate-500">أجب بصراحة لاكتشاف نوع شخصيتك في إدارة الأعمال.</p>
      </div>

      <div className="w-full max-w-xl relative h-[400px]">
        {/* Card Stack Effect */}
        <div className="absolute top-4 left-4 right-4 bottom-[-10px] bg-slate-200 rounded-3xl transform scale-95 opacity-50"></div>
        <div className="absolute top-2 left-2 right-2 bottom-[-5px] bg-slate-300 rounded-3xl transform scale-98 opacity-70"></div>
        
        {/* Active Card */}
        <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col justify-between animate-fade-in-up">
          <div>
            <span className="bg-brand-primary/10 text-brand-primary text-xs font-bold px-3 py-1 rounded-full">
              سؤال {currentIndex + 1} من {QUESTIONS.length}
            </span>
            <h3 className="text-2xl font-bold text-brand-primary mt-6 leading-relaxed">
              {currentQ.situation}
            </h3>
          </div>

          <div className="space-y-3 mt-8">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt.style)}
                className="w-full p-4 text-right bg-slate-50 hover:bg-brand-primary/5 border border-slate-200 hover:border-brand-primary rounded-xl transition-all duration-200 text-brand-primary font-medium hover:shadow-md active:scale-98"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xl mt-12 bg-slate-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-brand-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
