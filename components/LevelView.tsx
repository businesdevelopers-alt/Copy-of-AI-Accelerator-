
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LevelData, UserProfile, Question, DIGITAL_SHIELDS } from '../types';
import { generateLevelMaterial, generateLevelQuiz, evaluateExerciseResponse } from '../services/geminiService';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../services/audioService';
import { storageService } from '../services/storageService';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface LevelTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  border: string;
  text: string;
  ring: string;
  gradient: string;
}

const THEMES: LevelTheme[] = [
  { 
    id: 'blue', name: 'أزرق احترافي', 
    primary: 'bg-blue-600', secondary: 'bg-blue-50', accent: 'text-blue-600', 
    bg: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-700', ring: 'ring-blue-100',
    gradient: 'from-blue-600 to-indigo-700'
  },
  { 
    id: 'indigo', name: 'إنديجو عصري', 
    primary: 'bg-indigo-600', secondary: 'bg-indigo-50', accent: 'text-indigo-600', 
    bg: 'bg-indigo-50/50', border: 'border-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-100',
    gradient: 'from-indigo-600 to-purple-700'
  },
  { 
    id: 'emerald', name: 'أخضر نمو', 
    primary: 'bg-emerald-600', secondary: 'bg-emerald-50', accent: 'text-emerald-600', 
    bg: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-100',
    gradient: 'from-emerald-600 to-teal-700'
  },
  { 
    id: 'rose', name: 'وردي طموح', 
    primary: 'bg-rose-600', secondary: 'bg-rose-50', accent: 'text-rose-600', 
    bg: 'bg-rose-50/50', border: 'border-rose-100', text: 'text-rose-700', ring: 'ring-rose-100',
    gradient: 'from-rose-600 to-pink-700'
  },
  { 
    id: 'amber', name: 'ذهبي ريادي', 
    primary: 'bg-amber-600', secondary: 'bg-amber-50', accent: 'text-amber-600', 
    bg: 'bg-amber-50/50', border: 'border-amber-100', text: 'text-amber-700', ring: 'ring-amber-100',
    gradient: 'from-amber-500 to-orange-600'
  },
  { 
    id: 'violet', name: 'بنفسجي إبداعي', 
    primary: 'bg-violet-600', secondary: 'bg-violet-50', accent: 'text-violet-600', 
    bg: 'bg-violet-50/50', border: 'border-violet-100', text: 'text-violet-700', ring: 'ring-violet-100',
    gradient: 'from-violet-600 to-fuchsia-700'
  }
];

interface LevelViewProps {
  level: LevelData;
  user: UserProfile;
  onComplete: () => void;
  onBack: () => void;
  onRequestMentorship?: () => void;
}

enum Step {
  LOADING_CONTENT,
  LEARN,
  EXERCISE,
  LOADING_QUIZ,
  QUIZ,
  COMPLETED
}

const LevelIllustration: React.FC<{ levelId: number; theme: LevelTheme; wireframe?: boolean; isDarkMode?: boolean }> = ({ levelId, theme, wireframe = false, isDarkMode = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (wireframe) return;
    setIsClicked(true);
    playPositiveSound();
    setTimeout(() => setIsClicked(false), 600);
  };

  const renderIllustration = () => {
    const opacity = wireframe ? "0.1" : (isHovered ? "0.4" : "0.2");
    const strokeWidth = wireframe ? "1" : "4";
    const className = `${wireframe ? 'animate-pulse' : ''} transition-all duration-500`;
    const colorClass = "white"; 

    switch (levelId) {
      case 1:
        return (
          <svg viewBox="0 0 200 200" className={`w-full h-full ${className}`}>
            <circle cx="100" cy="100" r="50" fill={colorClass} fillOpacity={wireframe ? "0.05" : "0.1"} />
            <path d="M100 40c-27.6 0-50 22.4-50 50 0 17.1 8.6 32.2 21.7 41.2l4.3 18.8h48l4.3-18.8c13.1-9 21.7-24.1 21.7-41.2 0-27.6-22.4-50-50-50z" 
              fill={wireframe ? "none" : colorClass} fillOpacity={opacity} stroke={colorClass} strokeWidth={strokeWidth} strokeDasharray={wireframe ? "5,5" : "none"}
            />
            {!wireframe && <circle cx="100" cy="90" r="12" fill={colorClass} className="animate-bounce" style={{ animationDuration: '2s' }} />}
          </svg>
        );
      case 2:
        return (
          <svg viewBox="0 0 200 200" className={`w-full h-full ${className}`}>
            <rect x="40" y="40" width="120" height="120" rx="15" fill={wireframe ? "none" : colorClass} fillOpacity={opacity} stroke={colorClass} strokeWidth={strokeWidth} strokeDasharray={wireframe ? "5,5" : "none"} />
            {!wireframe && <rect x="55" y="55" width="40" height="40" rx="6" fill={colorClass} className="animate-bounce" />}
          </svg>
        );
      case 3:
        return (
          <svg viewBox="0 0 200 200" className={`w-full h-full ${className}`}>
            <circle cx="100" cy="100" r="70" fill="none" stroke={colorClass} strokeWidth={strokeWidth} opacity={wireframe ? "0.1" : "0.2"} strokeDasharray={wireframe ? "4,4" : "none"} />
            <circle cx="100" cy="100" r="45" fill="none" stroke={colorClass} strokeWidth={strokeWidth} opacity={wireframe ? "0.1" : "0.2"} />
          </svg>
        );
      case 4:
        return (
          <svg viewBox="0 0 200 200" className={`w-full h-full ${className}`}>
            <path d="M100 60 L115 40 L135 45 L140 65 L160 75 L155 95 L140 105 L135 125 L115 130 L100 110 L85 130 L65 125 L60 105 L40 95 L45 75 L60 65 L65 45 L85 40 Z" 
              fill={wireframe ? "none" : colorClass} fillOpacity={opacity} stroke={colorClass} strokeWidth={strokeWidth} strokeDasharray={wireframe ? "8,4" : "none"} />
          </svg>
        );
      case 5:
        return (
          <svg viewBox="0 0 200 200" className={`w-full h-full ${className}`}>
             <rect x="50" y="140" width="30" height="20" fill={colorClass} fillOpacity={opacity} stroke={colorClass} strokeWidth={wireframe ? "1" : "0"} />
             <rect x="90" y="120" width="30" height="40" fill={colorClass} fillOpacity={opacity} stroke={colorClass} strokeWidth={wireframe ? "1" : "0"} />
             <rect x="130" y="100" width="30" height="60" fill={colorClass} fillOpacity={opacity} stroke={colorClass} strokeWidth={wireframe ? "1" : "0"} />
          </svg>
        );
      case 6:
        return (
          <svg viewBox="0 0 200 200" className={`w-full h-full ${className}`}>
            <path d="M100 40 L130 100 L100 130 L70 100 Z" fill={wireframe ? "none" : colorClass} fillOpacity={opacity} stroke={colorClass} strokeWidth={strokeWidth} strokeDasharray={wireframe ? "3,3" : "none"} />
          </svg>
        );
      default:
        return <div className="text-9xl">🚀</div>;
    }
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center relative group"
      onMouseEnter={() => !wireframe && setIsHovered(true)}
      onMouseLeave={() => !wireframe && setIsHovered(false)}
      onClick={handleClick}
    >
      <div className={`w-48 h-48 transform transition-all duration-700 ${isHovered ? 'drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]' : ''}`}>
        {renderIllustration()}
      </div>
    </div>
  );
};

export const LevelView: React.FC<LevelViewProps> = ({ level, user, onComplete, onBack, onRequestMentorship }) => {
  const [step, setStep] = useState<Step>(Step.LOADING_CONTENT);
  const [content, setContent] = useState<string>('');
  const [exercisePrompt, setExercisePrompt] = useState<string>('');
  const [exerciseAnswer, setExerciseAnswer] = useState<string>('');
  const [exerciseFeedback, setExerciseFeedback] = useState<string>('');
  const [isExerciseSubmitting, setIsExerciseSubmitting] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeTheme, setActiveTheme] = useState<LevelTheme>(() => {
     const savedThemeId = localStorage.getItem('user_preferred_level_theme');
     if (savedThemeId) {
       const found = THEMES.find(t => t.id === savedThemeId);
       if (found) return found;
     }
     const defaultIdx = (level.id - 1) % THEMES.length;
     return THEMES[defaultIdx];
  });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('level_display_mode') === 'dark');
  const [currentContentPage, setCurrentContentPage] = useState(0);

  const shieldInfo = DIGITAL_SHIELDS.find(s => s.levelId === level.id);

  const contentBlocks = useMemo(() => {
    if (!content) return [];
    return content.split('\n\n').filter(b => b.trim().length > 10);
  }, [content]);

  const carouselItems = useMemo(() => {
    const items = contentBlocks.map((b, i) => ({ type: 'content' as const, data: b, index: i }));
    items.push({ type: 'resources' as const, data: '', index: contentBlocks.length });
    return items;
  }, [contentBlocks]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await generateLevelMaterial(level.id, level.title, user);
        setContent(data.content);
        setExercisePrompt(data.exercise);
        setTimeout(() => setStep(Step.LEARN), 3000);
      } catch (err) {
        console.error(err);
      }
    };
    loadContent();
  }, [level.id, level.title, user]);

  const startQuiz = async () => {
    setStep(Step.LOADING_QUIZ);
    try {
      const questions = await generateLevelQuiz(level.id, level.title, user);
      setQuizQuestions(questions);
      setQuizAnswers(new Array(questions.length).fill(-1));
      setStep(Step.QUIZ);
    } catch (e) {
      setStep(Step.LEARN); 
    }
  };

  const handleQuizSubmit = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (q.correctIndex === quizAnswers[idx]) score++;
    });
    setQuizScore(score);
    const passingScore = Math.ceil(quizQuestions.length * 0.6); 
    if (score >= passingScore) {
       playCelebrationSound();
       setTimeout(() => setStep(Step.COMPLETED), 3000); 
    } else {
      playErrorSound();
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : activeTheme.bg + ' text-slate-900'} flex flex-col font-sans transition-colors duration-500 overflow-x-hidden`}>
      <style>{`
        @keyframes shield-pop {
          0% { transform: scale(0.5) rotate(-20deg); opacity: 0; }
          70% { transform: scale(1.1) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-shield-earned { animation: shield-pop 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes float-badge {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-10px); }
        }
        .animate-float-badge { animation: float-badge 3s ease-in-out infinite; }
      `}</style>

      {/* Simplified Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-gray-100 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <button onClick={onBack} className="text-slate-400 font-black text-xs hover:text-blue-600 transition-all flex items-center gap-2">
                <svg className="w-4 h-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth={2.5} /></svg>
                خروج من المحطة
            </button>
            <div className="text-center">
                <h2 className="font-black text-sm">{level.title}</h2>
                <div className="w-32 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className={`${activeTheme.primary} h-full`} style={{ width: `${(currentContentPage / (carouselItems.length || 1)) * 100}%` }}></div>
                </div>
            </div>
            <div className="w-20"></div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-12 flex flex-col items-center">
        {step === Step.LOADING_CONTENT && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
             <div className="w-24 h-24 border-8 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="font-black text-xl animate-pulse">جاري سحب المادة العلمية من قاعدة المعرفة...</p>
          </div>
        )}

        {step === Step.LEARN && (
           <div className="w-full space-y-10 animate-fade-in">
              <div className={`p-10 md:p-16 rounded-[4rem] border shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  {carouselItems[currentContentPage]?.type === 'content' ? (
                     <article className={`prose max-w-none ${isDarkMode ? 'prose-invert text-slate-200' : 'prose-slate text-slate-800'} prose-p:text-2xl prose-p:leading-[3rem]`}>
                        {carouselItems[currentContentPage].data.split('\n').map((p, i) => <p key={i} className="mb-6">{p}</p>)}
                     </article>
                  ) : (
                    <div className="text-center space-y-8">
                       <div className="text-6xl">📚</div>
                       <h3 className="text-3xl font-black">مصادر المحطة المعتمدة</h3>
                       <p className="text-slate-500 font-medium">يمكنك تحميل الملفات الملحقة لتوسيع معرفتك بهذا الجانب.</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['دليل التنفيذ', 'نموذج PDF المعتمد', 'فيديو توضيحي', 'أدوات السوق'].map(m => (
                             <div key={m} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold hover:border-blue-500 cursor-pointer transition-colors">{m}</div>
                          ))}
                       </div>
                    </div>
                  )}
              </div>
              <div className="flex justify-between items-center px-10">
                  <button disabled={currentContentPage === 0} onClick={() => setCurrentContentPage(p => p - 1)} className="px-8 py-4 bg-slate-200 rounded-2xl font-black disabled:opacity-30">السابق</button>
                  {currentContentPage < carouselItems.length - 1 ? (
                    <button onClick={() => setCurrentContentPage(p => p + 1)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl">المتابعة</button>
                  ) : (
                    <button onClick={() => setStep(Step.EXERCISE)} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl animate-pulse">بدء التمرين التطبيقي</button>
                  )}
              </div>
           </div>
        )}

        {step === Step.EXERCISE && (
            <div className="w-full max-w-3xl space-y-10 animate-fade-in-up">
                <div className={`p-10 rounded-[3.5rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <h3 className="text-2xl font-black mb-6 flex items-center gap-4">
                        <span className="text-4xl">✏️</span>
                        تحدي المستوى {level.id}
                    </h3>
                    <p className="text-xl font-medium leading-relaxed mb-8 opacity-80">{exercisePrompt}</p>
                    <textarea 
                        className="w-full h-64 p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] outline-none focus:border-blue-500 transition-all font-bold"
                        placeholder="صغ مخرجاتك هنا ليقوم AI بمراجعتها..."
                        value={exerciseAnswer}
                        onChange={e => setExerciseAnswer(e.target.value)}
                        disabled={!!exerciseFeedback}
                    />
                    {exerciseFeedback && (
                        <div className={`mt-8 p-8 rounded-3xl border-2 ${exerciseFeedback.includes('مقبولة') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                            <p className="font-black text-lg mb-2">🤖 مراجعة المستشار:</p>
                            <p className="font-medium leading-relaxed">{exerciseFeedback}</p>
                        </div>
                    )}
                    <div className="mt-10 flex justify-end gap-4">
                       {!exerciseFeedback ? (
                         <button onClick={async () => {
                             setIsExerciseSubmitting(true);
                             const res = await evaluateExerciseResponse(exercisePrompt, exerciseAnswer);
                             setExerciseFeedback(res.feedback);
                             setIsExerciseSubmitting(false);
                         }} disabled={isExerciseSubmitting || exerciseAnswer.length < 20} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl disabled:opacity-30">إرسال للمراجعة</button>
                       ) : exerciseFeedback.includes('مقبولة') ? (
                         <button onClick={startQuiz} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl animate-bounce">انتقل للاختبار النهائي</button>
                       ) : (
                         <button onClick={() => { setExerciseFeedback(''); setExerciseAnswer(''); }} className="px-12 py-5 bg-slate-200 rounded-2xl font-black">إعادة المحاولة</button>
                       )}
                    </div>
                </div>
            </div>
        )}

        {step === Step.QUIZ && (
            <div className="w-full max-w-3xl animate-fade-in-up">
                 <div className={`p-10 rounded-[3.5rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <h3 className="text-2xl font-black mb-10 text-center">اختبار الكفاءة النهائي</h3>
                    <div className="space-y-12">
                        {quizQuestions.map((q, qIdx) => (
                            <div key={q.id} className="space-y-6">
                                <p className="font-black text-lg">{qIdx + 1}. {q.text}</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {q.options.map((opt, oIdx) => (
                                        <button 
                                            key={oIdx} 
                                            onClick={() => { const na = [...quizAnswers]; na[qIdx] = oIdx; setQuizAnswers(na); playPositiveSound(); }}
                                            className={`p-5 text-right rounded-2xl border-2 transition-all font-bold ${quizAnswers[qIdx] === oIdx ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleQuizSubmit} disabled={quizAnswers.includes(-1)} className="w-full mt-16 py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-2xl disabled:opacity-30">إنهاء الاختبار وحصد الدرع</button>
                 </div>
            </div>
        )}

        {step === Step.COMPLETED && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-fade-in">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20 rounded-full animate-pulse"></div>
                <div className={`w-64 h-64 rounded-[4rem] bg-gradient-to-br ${shieldInfo?.color} flex items-center justify-center text-[120px] shadow-2xl border-8 border-white animate-shield-earned relative z-10`}>
                   {shieldInfo?.icon}
                   <div className="absolute -top-6 -right-6 bg-yellow-400 text-white p-3 rounded-2xl font-black text-xs shadow-lg animate-bounce uppercase">درع جديد!</div>
                </div>
             </div>
             
             <div className="space-y-4">
                <h2 className="text-5xl font-black">عمل رائع!</h2>
                <h3 className="text-2xl font-black text-blue-600">لقد كسبت: {shieldInfo?.name}</h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto">تم إضافة الدرع الرقمي إلى خزانتك وتوثيقه في ملفك الريادي. أنت الآن تمتلك {level.id} من أصل 6 دروع.</p>
             </div>

             <button 
               onClick={onComplete}
               className="px-20 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl shadow-2xl transform hover:scale-105 transition-all"
             >
               العودة لاستعراض الإنجازات
             </button>
          </div>
        )}
      </main>
    </div>
  );
};
