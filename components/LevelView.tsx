
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LevelData, UserProfile, Question, DIGITAL_SHIELDS } from '../types';
import { generateLevelMaterial, generateLevelQuiz, evaluateExerciseResponse } from '../services/geminiService';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../services/audioService';

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

const LevelIllustration: React.FC<{ levelId: number; theme: LevelTheme; wireframe?: boolean; isDarkMode?: boolean; activePage?: number }> = ({ levelId, theme, wireframe = false, isDarkMode = false, activePage = 0 }) => {
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
    const className = `${wireframe ? 'animate-pulse' : ''} transition-all duration-700 ${isClicked ? 'scale-110 rotate-3' : ''}`;
    const colorClass = isDarkMode ? "#3b82f6" : "currentColor"; 

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
            {!wireframe && <rect x="55" y="55" width="40" height="40" rx="6" fill={colorClass} className="animate-pulse" />}
            {!wireframe && activePage > 0 && <rect x="105" y="105" width="40" height="40" rx="6" fill={colorClass} fillOpacity="0.4" />}
          </svg>
        );
      case 3:
        return (
          <svg viewBox="0 0 200 200" className={`w-full h-full ${className}`}>
            <circle cx="100" cy="100" r="70" fill="none" stroke={colorClass} strokeWidth={strokeWidth} opacity={wireframe ? "0.1" : "0.2"} strokeDasharray={wireframe ? "4,4" : "none"} />
            <circle cx="100" cy="100" r="45" fill="none" stroke={colorClass} strokeWidth={strokeWidth} opacity={wireframe ? "0.1" : "0.2"} />
            {!wireframe && <path d="M100 30 L100 170 M30 100 L170 100" stroke={colorClass} strokeWidth="2" strokeDasharray="5 5" opacity="0.3" />}
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
            {!wireframe && <path d="M100 10 L100 40 M190 100 L160 100 M100 190 L100 160 M10 100 L40 100" stroke={colorClass} strokeWidth="4" strokeLinecap="round" opacity="0.4" />}
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
      <div className={`w-48 h-48 transform transition-all duration-700 ${isHovered ? 'drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]' : ''}`}>
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
  const [revealedInsights, setRevealedInsights] = useState<Record<number, boolean>>({});

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

  const toggleInsight = (idx: number) => {
    setRevealedInsights(prev => ({ ...prev, [idx]: !prev[idx] }));
    if (!revealedInsights[idx]) playPositiveSound();
  };

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
        .discovery-card { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .discovery-card:hover { transform: translateY(-4px); }
        .insight-reveal { transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); max-height: 0; opacity: 0; overflow: hidden; }
        .insight-reveal.active { max-height: 400px; opacity: 1; margin-top: 2rem; }
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
                    <div className={`${activeTheme.primary} h-full transition-all duration-700`} style={{ width: `${(currentContentPage / (carouselItems.length || 1)) * 100}%` }}></div>
                </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-12 flex flex-col items-center">
        {step === Step.LOADING_CONTENT && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
             <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                <div className={`absolute inset-0 border-8 ${activeTheme.accent} border-t-transparent rounded-full animate-spin`}></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">📚</div>
             </div>
             <div className="text-center space-y-2">
               <p className="font-black text-xl animate-pulse">جاري استدعاء المعرفة الذكية...</p>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Building Personal Learning Path</p>
             </div>
          </div>
        )}

        {step === Step.LEARN && (
           <div className="w-full space-y-12 animate-fade-in">
              <div className="flex justify-center mb-4">
                 <LevelIllustration levelId={level.id} theme={activeTheme} isDarkMode={isDarkMode} activePage={currentContentPage} />
              </div>

              <div className={`p-10 md:p-16 rounded-[4rem] border shadow-2xl transition-all duration-700 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  {carouselItems[currentContentPage]?.type === 'content' ? (
                     <div key={currentContentPage} className="animate-fade-in-up">
                        <div 
                          onClick={() => toggleInsight(currentContentPage)}
                          className={`discovery-card p-8 rounded-[2.5rem] cursor-pointer border-2 transition-all relative group
                            ${isDarkMode ? 'bg-slate-800/40 border-slate-700 hover:border-blue-500' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}
                          `}
                        >
                           <div className="absolute -top-4 -right-4 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <span className="text-xl">✨</span>
                           </div>
                           
                           <article className={`prose max-w-none ${isDarkMode ? 'prose-invert text-slate-200' : 'prose-slate text-slate-800'} prose-p:text-2xl prose-p:leading-[3.2rem]`}>
                              {carouselItems[currentContentPage].data.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
                           </article>

                           <div className="mt-8 pt-8 border-t border-slate-200/50 flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">انقر لاستكشاف الرؤية الاستراتيجية</span>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-500 ${revealedInsights[currentContentPage] ? 'rotate-180 bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth={3} /></svg>
                              </div>
                           </div>

                           <div className={`insight-reveal ${revealedInsights[currentContentPage] ? 'active' : ''}`}>
                              <div className={`p-8 rounded-3xl border-l-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-500 text-blue-100' : 'bg-blue-50 border-blue-600 text-blue-900'}`}>
                                 <h4 className="font-black text-sm mb-4 uppercase tracking-widest flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                                    رؤية استراتيجية لـ {user.startupName}
                                 </h4>
                                 <p className="text-lg font-medium leading-relaxed italic">
                                    بناءً على هذا الجزء التعليمي، يتوقع نظامنا أن التركيز على هذه النقاط سيعزز من قدرتك التنافسية في قطاع {user.industry}. حاول ربط هذه المبادئ بخطتك التنفيذية الأسبوعية القادمة.
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                    <div className="text-center space-y-10 animate-fade-in-up">
                       <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-inner text-6xl">📚</div>
                       <div className="space-y-4">
                          <h3 className="text-3xl font-black">مصادر المحطة المعتمدة</h3>
                          <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto">لقد أتممت قراءة المادة العلمية. يمكنك تعزيز فهمك عبر المصادر الإضافية التالية.</p>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['دليل التنفيذ السريع', 'نموذج PDF المعتمد', 'فيديو توضيحي (Gemini)', 'أدوات تحليل السوق'].map((m, i) => (
                             <div key={m} className={`p-8 rounded-[2rem] border-2 font-black hover:border-blue-500 cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex items-center justify-between group
                               ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}
                             `}>
                                <span>{m}</span>
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                   <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2.5} /></svg>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}
              </div>

              <div className="flex justify-between items-center px-6">
                  <button disabled={currentContentPage === 0} onClick={() => { setCurrentContentPage(p => p - 1); playPositiveSound(); }} className="px-10 py-5 bg-slate-200 text-slate-600 rounded-[1.8rem] font-black disabled:opacity-30 transition-all active:scale-95">السابق</button>
                  <div className="flex gap-2">
                     {carouselItems.map((_, i) => (
                       <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === currentContentPage ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`}></div>
                     ))}
                  </div>
                  {currentContentPage < carouselItems.length - 1 ? (
                    <button onClick={() => { setCurrentContentPage(p => p + 1); playPositiveSound(); }} className="px-12 py-5 bg-slate-900 text-white rounded-[1.8rem] font-black shadow-xl hover:bg-blue-600 transition-all active:scale-95">المتابعة</button>
                  ) : (
                    <button onClick={() => { setStep(Step.EXERCISE); playPositiveSound(); }} className="px-14 py-5 bg-blue-600 text-white rounded-[1.8rem] font-black shadow-2xl animate-pulse active:scale-95 transition-all">بدء التمرين التطبيقي</button>
                  )}
              </div>
           </div>
        )}

        {step === Step.EXERCISE && (
            <div className="w-full max-w-3xl space-y-10 animate-fade-in-up">
                <div className={`p-10 md:p-14 rounded-[4rem] border shadow-2xl relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full"></div>
                    <h3 className="text-3xl font-black mb-8 flex items-center gap-4">
                        <span className="text-5xl">✏️</span>
                        تحدي العبور للمستوى {level.id}
                    </h3>
                    <div className={`p-8 rounded-[2.5rem] mb-10 border-r-8 ${isDarkMode ? 'bg-slate-800 border-blue-500' : 'bg-blue-50 border-blue-600'}`}>
                       <p className="text-xl font-bold leading-relaxed">{exercisePrompt}</p>
                    </div>
                    <textarea 
                        className={`w-full h-64 p-8 rounded-[2.5rem] outline-none border-2 transition-all font-bold text-lg resize-none shadow-inner
                          ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'}
                        `}
                        placeholder="صغ مخرجاتك هنا ليقوم AI بمراجعتها..."
                        value={exerciseAnswer}
                        onChange={e => setExerciseAnswer(e.target.value)}
                        disabled={!!exerciseFeedback}
                    />
                    {exerciseFeedback && (
                        <div className={`mt-10 p-10 rounded-[3rem] border-2 animate-fade-in ${exerciseFeedback.includes('مقبولة') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                            <div className="flex items-center gap-4 mb-4">
                               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl">🤖</div>
                               <p className="font-black text-xl">مراجعة المستشار الذكي:</p>
                            </div>
                            <p className="font-bold text-lg leading-relaxed italic pr-4 border-r-2 border-current/20">"{exerciseFeedback}"</p>
                        </div>
                    )}
                    <div className="mt-12 flex justify-end gap-4">
                       {!exerciseFeedback ? (
                         <button onClick={async () => {
                             setIsExerciseSubmitting(true);
                             playPositiveSound();
                             const res = await evaluateExerciseResponse(exercisePrompt, exerciseAnswer);
                             setExerciseFeedback(res.feedback);
                             setIsExerciseSubmitting(false);
                         }} disabled={isExerciseSubmitting || exerciseAnswer.length < 20} className="px-14 py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl disabled:opacity-30 transition-all active:scale-95 flex items-center gap-4">
                            {isExerciseSubmitting && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            <span>إرسال للمراجعة الفورية</span>
                         </button>
                       ) : exerciseFeedback.includes('مقبولة') ? (
                         <button onClick={startQuiz} className="px-14 py-6 bg-blue-600 text-white rounded-[2rem] font-black shadow-2xl animate-bounce transition-all active:scale-95">انتقل للاختبار النهائي 🎯</button>
                       ) : (
                         <button onClick={() => { setExerciseFeedback(''); setExerciseAnswer(''); playPositiveSound(); }} className="px-14 py-6 bg-slate-200 text-slate-700 rounded-[2rem] font-black transition-all active:scale-95">إعادة صياغة الحل</button>
                       )}
                    </div>
                </div>
            </div>
        )}

        {step === Step.QUIZ && (
            <div className="w-full max-w-3xl animate-fade-in-up">
                 <div className={`p-10 md:p-14 rounded-[4rem] border shadow-2xl relative transition-all duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="text-center mb-12">
                       <span className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">Final Proficiency Assessment</span>
                       <h3 className="text-3xl font-black mt-2">اختبار الكفاءة النهائي</h3>
                    </div>
                    <div className="space-y-12">
                        {quizQuestions.map((q, qIdx) => (
                            <div key={q.id} className="space-y-6">
                                <p className="font-black text-xl flex items-center gap-4">
                                   <span className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-400">{qIdx + 1}</span>
                                   {q.text}
                                </p>
                                <div className="grid grid-cols-1 gap-4 pr-10">
                                    {q.options.map((opt, oIdx) => (
                                        <button 
                                            key={oIdx} 
                                            onClick={() => { const na = [...quizAnswers]; na[qIdx] = oIdx; setQuizAnswers(na); playPositiveSound(); }}
                                            className={`p-6 text-right rounded-3xl border-2 transition-all font-bold text-lg group relative overflow-hidden
                                              ${quizAnswers[qIdx] === oIdx 
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-xl' 
                                                : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500 text-slate-300' : 'bg-slate-50 border-slate-100 hover:border-blue-200')}
                                            `}
                                        >
                                            <span className="relative z-10">{opt}</span>
                                            {quizAnswers[qIdx] === oIdx && (
                                               <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                               </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleQuizSubmit} disabled={quizAnswers.includes(-1)} className="w-full mt-16 py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center gap-4">
                       <span>إنهاء الاختبار وحصد الدرع</span>
                       <span className="text-3xl">🛡️</span>
                    </button>
                 </div>
            </div>
        )}

        {step === Step.COMPLETED && (
          <div className="flex flex-col items-center justify-center min-h-[75vh] text-center space-y-12 animate-fade-in">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-30 rounded-full animate-pulse"></div>
                <div className={`w-72 h-72 rounded-[5rem] bg-gradient-to-br ${shieldInfo?.color} flex items-center justify-center text-[140px] shadow-3xl border-8 border-white animate-shield-earned relative z-10`}>
                   {shieldInfo?.icon}
                   <div className="absolute -top-10 -right-10 bg-yellow-400 text-white px-5 py-3 rounded-3xl font-black text-sm shadow-2xl animate-bounce uppercase tracking-widest border-4 border-white">درع جديد!</div>
                </div>
             </div>
             
             <div className="space-y-6">
                <h2 className="text-6xl font-black tracking-tight">إنجاز مذهل!</h2>
                <div className="space-y-2">
                   <h3 className="text-3xl font-black text-blue-600">لقد كسبت: {shieldInfo?.name}</h3>
                   <p className="text-slate-500 font-bold text-xl uppercase tracking-widest">Level {level.id} Mastery Achieved</p>
                </div>
                <p className="text-slate-400 font-medium max-w-xl mx-auto text-lg leading-relaxed">تم توثيق هذا الإنجاز وتشفيره في ملفك الريادي. مشروعك الآن أكثر نضجاً وقرباً من الجاهزية الاستثمارية.</p>
             </div>

             <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={onComplete}
                  className="px-16 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl shadow-2xl transform hover:scale-105 transition-all active:scale-95 flex items-center gap-4"
                >
                  العودة للوحة التحكم
                </button>
                <button 
                   onClick={() => window.print()}
                   className="px-10 py-6 bg-white border-2 border-slate-200 text-slate-600 rounded-[2.5rem] font-black text-lg transition-all hover:bg-slate-50 active:scale-95"
                >
                   مشاركة الإنجاز 🔗
                </button>
             </div>
          </div>
        )}
      </main>

      {/* Interactive Floating Feedback */}
      {step === Step.LEARN && (
        <div className="fixed bottom-8 left-8 z-50 animate-bounce">
           <div className={`p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3 transition-colors ${isDarkMode ? 'bg-slate-900 border-blue-500' : 'bg-white border-blue-100'}`}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">🧠</div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Learning Momentum</p>
                 <p className="text-xs font-black text-blue-500">مستوى التركيز: عالٍ جداً</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
