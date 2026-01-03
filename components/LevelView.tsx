
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LevelData, UserProfile, Question } from '../types';
import { generateLevelMaterial, generateLevelQuiz, evaluateExerciseResponse } from '../services/geminiService';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../services/audioService';
import { storageService } from '../services/storageService';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';

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

const AIEngineLoader: React.FC<{ theme: LevelTheme; progress?: number }> = ({ theme, progress = 0 }) => {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <div className="absolute inset-0 border-[1px] border-slate-200 rounded-full animate-[spin_10s_linear_infinite] opacity-10"></div>
      <div className="absolute inset-4 border-[1px] border-slate-300 rounded-full animate-[spin_7s_linear_infinite_reverse] opacity-10"></div>
      <div className={`absolute w-32 h-32 rounded-full ${theme.primary} blur-[60px] opacity-20 animate-pulse`}></div>
      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
        <defs>
          <filter id="glow-ai-loader">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <g opacity="0.2" className={theme.accent}>
           <line x1="100" y1="40" x2="160" y2="100" stroke="currentColor" strokeWidth="1" />
           <line x1="160" y1="100" x2="100" y2="160" stroke="currentColor" strokeWidth="1" />
           <line x1="100" y1="160" x2="40" y2="100" stroke="currentColor" strokeWidth="1" />
           <line x1="40" y1="100" x2="100" y2="40" stroke="currentColor" strokeWidth="1" />
        </g>
        <g filter="url(#glow-ai-loader)">
           <path d="M100 75 L121.6 87.5 L121.6 112.5 L100 125 L78.4 112.5 L78.4 87.5 Z" fill="none" stroke="url(#loader-grad)" strokeWidth="4" className="animate-pulse" />
           <circle cx="100" cy="100" r="8" fill="url(#loader-grad)" className="animate-ping" />
           <circle cx="100" cy="100" r="6" fill="white" />
        </g>
      </svg>
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<LevelTheme>(() => {
     const defaultIdx = (level.id - 1) % THEMES.length;
     return THEMES[defaultIdx];
  });
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('level_display_mode') === 'dark';
  });
  
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'back' | 'complete' | null>(null);
  
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [currentContentPage, setCurrentContentPage] = useState(0);
  const [showRestoreToast, setShowRestoreToast] = useState(false);

  const loadingMessages = [
    "جاري تحليل سياق المشروع...",
    "تصميم التمارين التطبيقية...",
    "ربط قاعدة المعرفة الريادية...",
    "تجهيز بيئة التعلم الذكية...",
    "تخصيص المحتوى لمشروعك..."
  ];

  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const contentBlocks = useMemo(() => {
    if (!content) return [];
    // تقسيم المحتوى إلى أجزاء بناءً على العناوين أو الفقرات الطويلة لجعلها بطاقات
    const blocks = content.split('\n\n').filter(b => b.trim().length > 10);
    return blocks;
  }, [content]);

  const toggleDisplayMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('level_display_mode', newMode ? 'dark' : 'light');
    playPositiveSound();
  };

  // استرجاع التقدم المحفوظ عند التحميل
  useEffect(() => {
    const session = storageService.getCurrentSession();
    if (session) {
      const saved = storageService.getLevelProgress(session.uid, level.id);
      if (saved) {
        setStep(saved.step ?? Step.LOADING_CONTENT);
        setCurrentContentPage(saved.currentPage ?? 0);
        setExerciseAnswer(saved.exerciseAnswer ?? '');
        setExerciseFeedback(saved.exerciseFeedback ?? '');
        if (saved.quizAnswers) setQuizAnswers(saved.quizAnswers);
        if (saved.quizScore !== undefined) setQuizScore(saved.quizScore);
        
        if (saved.step !== Step.LOADING_CONTENT) {
           setShowRestoreToast(true);
           setTimeout(() => setShowRestoreToast(false), 4000);
        }
      }
    }
  }, [level.id]);

  // الحفظ التلقائي عند تغير الحالة
  useEffect(() => {
    const session = storageService.getCurrentSession();
    if (session && step !== Step.LOADING_CONTENT) {
      storageService.saveLevelProgress(session.uid, level.id, {
        step,
        currentPage: currentContentPage,
        exerciseAnswer,
        exerciseFeedback,
        quizAnswers,
        quizScore
      });
    }
  }, [step, currentContentPage, exerciseAnswer, exerciseFeedback, quizAnswers, quizScore, level.id]);

  useEffect(() => {
    let msgInterval: number;
    let progressInterval: number;
    if (step === Step.LOADING_CONTENT) {
      msgInterval = window.setInterval(() => {
        setLoadingMessageIdx(prev => (prev + 1) % loadingMessages.length);
      }, 1500);

      progressInterval = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1;
        });
      }, 40);
    }
    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [step]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await generateLevelMaterial(level.id, level.title, user);
        setContent(data.content);
        setExercisePrompt(data.exercise);
        
        if (step === Step.LOADING_CONTENT) {
          setTimeout(() => setStep(Step.LEARN), 4500);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadContent();
  }, [level.id, level.title, user]);

  useEffect(() => {
    if (step === Step.LEARN && contentBlocks.length > 0) {
      const progress = ((currentContentPage + 1) / contentBlocks.length) * 100;
      setReadingProgress(progress);
    }
  }, [step, currentContentPage, contentBlocks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExerciseSubmit = async () => {
    if (!exerciseAnswer.trim()) return;
    setIsExerciseSubmitting(true);
    try {
      const result = await evaluateExerciseResponse(exercisePrompt, exerciseAnswer);
      setExerciseFeedback(result.feedback);
      if (result.passed) playPositiveSound();
      else playErrorSound();
    } catch (e) {
      setExerciseFeedback("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsExerciseSubmitting(false);
    }
  };

  const startQuiz = async () => {
    setStep(Step.LOADING_QUIZ);
    try {
      const questions = await generateLevelQuiz(level.id, level.title, user);
      setQuizQuestions(questions);
      if (quizAnswers.length !== questions.length) {
         setQuizAnswers(new Array(questions.length).fill(-1));
      }
      setStep(Step.QUIZ);
    } catch (e) {
      console.error(e);
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

  const initiateExit = (action: 'back' | 'complete') => {
    setPendingAction(action);
    setShowExitModal(true);
  };

  const finalizeExit = () => {
    setShowExitModal(false);
    if (pendingAction === 'complete') onComplete();
    else onBack();
  };

  const granularProgress = useMemo(() => {
    let progress = 0;
    if (step === Step.LOADING_CONTENT) return 5;
    progress += 10;
    if (step === Step.LEARN) {
      progress += (readingProgress / 100) * 30;
      return progress;
    }
    progress += 30;
    if (step === Step.EXERCISE) {
      progress += 5;
      progress += Math.min((exerciseAnswer.length / 100) * 10, 10);
      if (exerciseFeedback) progress += 15;
      return progress;
    }
    progress += 30;
    if (step === Step.LOADING_QUIZ) return 72;
    if (step === Step.QUIZ) {
      progress += 5;
      const answeredCount = quizAnswers.filter(a => a !== -1).length;
      progress += (answeredCount / (quizQuestions.length || 1)) * 20;
      return progress;
    }
    progress += 25;
    if (step === Step.COMPLETED) return 100;
    return progress;
  }, [step, readingProgress, exerciseAnswer, exerciseFeedback, quizAnswers, quizQuestions]);

  const tasks = [
    { id: 'learn', label: 'استيعاب المادة العلمية', isCompleted: step > Step.LEARN || (step === Step.LEARN && readingProgress >= 100), isActive: step === Step.LEARN },
    { id: 'exercise', label: 'التطبيق العملي للمشروع', isCompleted: step > Step.EXERCISE || !!exerciseFeedback, isActive: step === Step.EXERCISE },
    { id: 'quiz', label: 'التقييم النهائي للمستوى', isCompleted: step === Step.COMPLETED, isActive: step === Step.QUIZ },
  ];

  const chartData = useMemo(() => {
    return [
      { name: 'بداية', value: 0 },
      { name: 'تعلم', value: step >= Step.LEARN ? (step === Step.LEARN ? readingProgress : 100) : 0 },
      { name: 'تطبيق', value: step >= Step.EXERCISE ? (step === Step.EXERCISE ? (exerciseFeedback ? 100 : 50) : 100) : 0 },
      { name: 'تقييم', value: step >= Step.QUIZ ? (step === Step.QUIZ ? (quizAnswers.filter(a => a !== -1).length / (quizQuestions.length || 1)) * 100 : 100) : 0 },
      { name: 'نهاية', value: step === Step.COMPLETED ? 100 : 0 }
    ];
  }, [step, readingProgress, exerciseFeedback, quizAnswers, quizQuestions]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : activeTheme.bg + ' text-slate-900'} flex flex-col font-sans transition-colors duration-500 overflow-x-hidden`}>
      <style>{`
        @keyframes progress-shimmer {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-progress-shimmer { animation: progress-shimmer 2s infinite linear; }
        @keyframes scanning {
          0% { transform: translateY(-50px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(150px); opacity: 0; }
        }
        .animate-scanning { animation: scanning 3s linear infinite; }
        
        .card-stack-item {
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .fade-slide-enter { opacity: 0; transform: translateX(50px); }
        .fade-slide-active { opacity: 1; transform: translateX(0); }
      `}</style>

      {/* Restore Progress Notification */}
      {showRestoreToast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-900 text-white border-slate-700'} px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up border`}>
           <span className="text-xl">🔄</span>
           <div className="text-right">
              <p className="text-sm font-black">تم استعادة تقدمك</p>
              <p className="text-[10px] text-slate-400">نحن نحفظ حالتك تلقائياً حتى لا تفقد عملك.</p>
           </div>
        </div>
      )}

      {/* Sticky Global Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-xl' : 'bg-white/90 border-gray-100 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => initiateExit('back')} 
                className={`p-2 -mr-2 text-slate-400 hover:${activeTheme.accent} hover:${activeTheme.secondary} rounded-full transition-all`}
              >
                <svg className="w-6 h-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border transition-all ${activeTheme.border} ${activeTheme.secondary}`}>
                   {level.icon}
                </div>
                <div className="flex flex-col">
                  <h2 className={`font-black text-sm md:text-base leading-none mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{level.title}</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-200/20 rounded-full overflow-hidden relative">
                        <div 
                          className={`${activeTheme.primary} h-full transition-all duration-700 relative`} 
                          style={{ width: `${granularProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-progress-shimmer"></div>
                        </div>
                    </div>
                    <span className={`text-[9px] font-black ${activeTheme.text} uppercase tabular-nums`}>التقدم: {Math.round(granularProgress)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleDisplayMode}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}
                title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>

              <div className="relative" ref={themeRef}>
                <button 
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}
                >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.828 2.828a2 2 0 010 2.828l-8.486 8.486L5 21" /></svg>
                </button>
                {isThemeMenuOpen && (
                  <div className={`absolute left-0 mt-3 w-48 rounded-2xl shadow-2xl border p-3 animate-fade-in-up origin-top-left z-50 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">مظهر الواجهة</p>
                    <div className="grid grid-cols-2 gap-2">
                       {THEMES.map(t => (
                         <button 
                           key={t.id}
                           onClick={() => { setActiveTheme(t); setIsThemeMenuOpen(false); playPositiveSound(); }}
                           className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${activeTheme.id === t.id ? (isDarkMode ? 'border-slate-100 bg-slate-800' : 'border-slate-800 bg-slate-50') : (isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-50 hover:bg-slate-50')}`}
                         >
                            <div className={`w-6 h-6 rounded-full ${t.primary} shadow-inner`}></div>
                            <span className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{t.name.split(' ')[0]}</span>
                         </button>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-md transform hover:scale-105 transition-transform active:scale-95 border border-white/10">
                   {user.name?.charAt(0) || 'U'}
                </button>
                {isProfileOpen && (
                  <div className={`absolute left-0 mt-3 w-64 rounded-[2rem] shadow-2xl border p-2 animate-fade-in-up origin-top-left z-50 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className={`p-4 rounded-[1.5rem] mb-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                       <h4 className={`font-black text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.startupName}</h4>
                       <p className="text-[10px] font-bold text-slate-400">{user.name}</p>
                    </div>
                    <button onClick={() => initiateExit('back')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}>
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      العودة للوحة التحكم
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {step === Step.LOADING_CONTENT && (
            <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 animate-fade-in">
              <div className="relative mb-16">
                 <div className="absolute inset-0 z-20 overflow-hidden rounded-[3rem]">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-scanning"></div>
                 </div>
                 <div className="absolute inset-0 z-10 flex items-center justify-center scale-150">
                    <LevelIllustration levelId={level.id} theme={activeTheme} wireframe={true} isDarkMode={isDarkMode} />
                 </div>
                 <AIEngineLoader theme={activeTheme} progress={loadingProgress} />
              </div>
              <div className="space-y-6 max-w-md mx-auto">
                <div className={`inline-flex items-center gap-3 border px-6 py-2 rounded-2xl shadow-xl backdrop-blur-sm ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
                   <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${activeTheme.primary} animate-bounce`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                      ))}
                   </div>
                   <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>توليد المحتوى للمستوى {level.id}</span>
                </div>
                <div className="h-10">
                   <h3 className={`text-2xl font-black tracking-tight animate-fade-in ${isDarkMode ? 'text-white' : 'text-slate-900'}`} key={loadingMessageIdx}>
                     {loadingMessages[loadingMessageIdx]}
                   </h3>
                </div>
                <div className={`relative w-full h-2 rounded-full overflow-hidden border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200/50 border-slate-100'}`}>
                   <div className={`${activeTheme.primary} h-full transition-all duration-300 relative shadow-[0_0_15px_rgba(59,130,246,0.3)]`} style={{ width: `${loadingProgress}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-progress-shimmer"></div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {step === Step.LEARN && (
            <div className={`rounded-[3rem] shadow-2xl border overflow-hidden animate-fade-in-up flex flex-col min-h-[750px] transition-all duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              {/* Educational Journey Header */}
              <div className={`shrink-0 relative h-48 overflow-hidden bg-gradient-to-br ${activeTheme.gradient} flex items-center px-10 md:px-16`}>
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                 <div className="relative z-10 flex items-center justify-between w-full">
                    <div className="flex items-center gap-8">
                       <div className="w-28 h-28 flex items-center justify-center bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl transform -rotate-3">
                          <LevelIllustration levelId={level.id} theme={activeTheme} isDarkMode={isDarkMode} />
                       </div>
                       <div className="text-right">
                         <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest mb-3 border border-white/10">Module In Progress</div>
                         <h3 className="text-4xl font-black text-white leading-tight">المسار التعليمي</h3>
                         <p className="text-white/80 font-bold text-lg">وحدة: {level.title}</p>
                       </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                       <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">Reading Progress Map</div>
                       <div className="flex gap-2">
                          {contentBlocks.map((_, i) => (
                             <button 
                                key={i} 
                                onClick={() => { playPositiveSound(); setCurrentContentPage(i); }}
                                className={`h-2 rounded-full transition-all duration-500 ${i === currentContentPage ? 'w-10 bg-white' : i < currentContentPage ? 'w-4 bg-white/60' : 'w-4 bg-white/20'}`}
                             ></button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Enhanced Carousel Content Area */}
              <div className={`flex-1 relative overflow-hidden p-8 md:p-12 flex flex-col items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-slate-950/40' : 'bg-slate-50/50'}`}>
                 {contentBlocks.length > 0 ? (
                   <div className="w-full max-w-4xl relative">
                      {/* Stack Effect Visuals */}
                      <div className={`absolute top-4 left-4 right-[-10px] bottom-[-10px] rounded-[3.5rem] border opacity-20 transform rotate-1 -z-10 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}></div>
                      <div className={`absolute top-2 left-2 right-[-5px] bottom-[-5px] rounded-[3.5rem] border opacity-40 transform rotate-0.5 -z-10 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}></div>

                      <div 
                        key={currentContentPage}
                        className={`p-10 md:p-16 rounded-[4rem] border shadow-2xl animate-fade-in relative overflow-hidden transition-all duration-500 min-h-[450px] flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
                      >
                         <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${activeTheme.gradient} opacity-[0.04] rounded-bl-[5rem]`}></div>
                         
                         <div>
                            <div className="flex items-center justify-between mb-10">
                               <div className="flex items-center gap-4">
                                  <span className={`w-14 h-14 ${activeTheme.secondary} ${activeTheme.accent} rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border transition-all ${activeTheme.border}`}>
                                     {currentContentPage + 1}
                                  </span>
                                  <div className="h-px w-24 bg-slate-200/50"></div>
                               </div>
                               <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                  Section {currentContentPage + 1} of {contentBlocks.length}
                               </div>
                            </div>

                            <article className={`prose max-w-none transition-colors duration-500 ${isDarkMode ? 'prose-invert text-slate-200' : 'prose-slate text-slate-800'} prose-p:text-2xl prose-p:leading-[2.8rem] prose-p:font-medium`}>
                               {contentBlocks[currentContentPage].split('\n').map((line, idx) => (
                                  <p key={idx} className="mb-6">{line}</p>
                               ))}
                            </article>
                         </div>

                         {/* AI Expert Insight Box - Appears on cards */}
                         <div className={`mt-12 p-6 rounded-3xl border-2 border-dashed flex items-center gap-5 group/insight ${isDarkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50/50 border-blue-100'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-white shadow-sm transform group-hover/insight:scale-110 transition-transform ${isDarkMode ? 'opacity-90' : ''}`}>🧠</div>
                            <div>
                               <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${activeTheme.accent}`}>تنبيه المستشار الذكي</p>
                               <p className={`text-sm font-bold leading-relaxed ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>تأكد من تطبيق هذه المفاهيم فوراً في نموذج مشروعك لضمان الفهم العميق.</p>
                            </div>
                         </div>
                      </div>

                      {/* Navigation Controls */}
                      <div className="flex justify-between items-center mt-12 px-6">
                         <button 
                            disabled={currentContentPage === 0}
                            onClick={() => { playPositiveSound(); setCurrentContentPage(prev => prev - 1); }}
                            className={`px-8 py-5 rounded-[2rem] border-2 transition-all flex items-center gap-4 font-black text-sm
                               ${currentContentPage === 0 ? 'bg-transparent text-slate-400 border-slate-200/20' : (isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700' : 'bg-white text-slate-600 border-slate-100 hover:border-blue-300 hover:shadow-xl')}
                            `}
                         >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            <span>الجزء السابق</span>
                         </button>

                         <div className="hidden sm:flex items-center gap-2">
                           {contentBlocks.map((_, i) => (
                             <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentContentPage ? `w-8 ${activeTheme.primary}` : 'bg-slate-300'}`}></div>
                           ))}
                         </div>

                         {currentContentPage < contentBlocks.length - 1 ? (
                           <button 
                             onClick={() => { playPositiveSound(); setCurrentContentPage(prev => prev + 1); }}
                             className={`px-8 py-5 rounded-[2rem] border-2 transition-all flex items-center gap-4 font-black text-sm ${isDarkMode ? 'bg-white text-slate-950 border-white hover:bg-slate-100' : 'bg-white text-slate-900 border-slate-100 hover:border-blue-300 hover:shadow-xl'} group shadow-lg`}
                           >
                              <span>الجزء التالي</span>
                              <svg className="w-5 h-5 transform rotate-180 group-hover:translate-x-[-3px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                           </button>
                         ) : (
                           <button 
                             onClick={() => { playCelebrationSound(); setStep(Step.EXERCISE); window.scrollTo(0, 0); }}
                             className={`px-10 py-5 rounded-[2rem] transition-all flex items-center gap-4 font-black text-sm ${activeTheme.primary} text-white shadow-2xl hover:opacity-95 transform hover:-translate-y-1 active:scale-95`}
                           >
                              <span>تطبيق مخرجات التعلم</span>
                              <svg className="w-6 h-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                           </button>
                         )}
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-6 text-slate-400 font-black animate-pulse">
                      <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                      <p>جاري ترتيب بطاقات المعلم الذكي...</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {step === Step.EXERCISE && (
            <div className={`rounded-[3rem] shadow-xl border overflow-hidden animate-fade-in-up transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className={`${isDarkMode ? 'bg-amber-900/20 border-amber-900/30' : 'bg-amber-50 border-amber-100'} px-8 py-8 border-b flex items-center gap-4`}>
                <div className={`p-2 rounded-2xl shadow-sm border w-16 h-16 flex items-center justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-amber-200 text-amber-600'}`}>
                   <LevelIllustration levelId={level.id} theme={activeTheme} isDarkMode={isDarkMode} />
                </div>
                <div>
                  <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>تطبيق عملي</h3>
                  <p className={`${isDarkMode ? 'text-amber-400' : 'text-amber-700'} text-sm font-bold`}>حول المعرفة إلى واقع لمشروعك</p>
                </div>
              </div>
              <div className="p-8 md:p-12">
                <div className={`flex items-start gap-4 mb-8 p-6 rounded-3xl border shadow-inner ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                   <span className="text-2xl mt-1">💡</span>
                   <p className={`text-xl font-bold leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{exercisePrompt}</p>
                </div>
                <div className="relative">
                  <textarea
                    className={`w-full p-8 border rounded-[2rem] focus:ring-4 ${activeTheme.ring} outline-none min-h-[250px] mb-4 text-lg font-medium shadow-inner transition-all tabular-nums ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:bg-slate-900' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'}`}
                    placeholder="اكتب مخرجات العمل هنا..."
                    value={exerciseAnswer}
                    onChange={(e) => setExerciseAnswer(e.target.value)}
                    disabled={!!exerciseFeedback}
                  />
                </div>
                {exerciseFeedback && (
                  <div className="space-y-6">
                    <div className={`p-8 rounded-[2rem] border-2 animate-fade-in ${exerciseFeedback.includes("مقبولة") ? (isDarkMode ? 'bg-green-900/20 border-green-800 text-green-300' : 'bg-green-50 border-green-200 text-green-800') : (isDarkMode ? 'bg-rose-900/20 border-rose-800 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800')}`}>
                      <h4 className="font-black mb-2 flex items-center gap-2">
                        {exerciseFeedback.includes("مقبولة") ? '🤖 مراجعة المستشار الذكي:' : '⚠️ ملاحظات التحسين:'}
                      </h4>
                      <p className="font-medium leading-relaxed">{exerciseFeedback}</p>
                    </div>

                    {!exerciseFeedback.includes("مقبولة") && (
                      <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-xl animate-fade-in-up flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shrink-0">🤝</div>
                        <div className="flex-1 text-center md:text-right">
                          <h4 className="text-xl font-black mb-1">هل تواجه صعوبة في هذا التمرين؟</h4>
                          <p className="text-blue-100 text-sm font-medium">يمكنك طلب جلسة إرشادية فورية مع أحد خبرائنا لمساعدتك في صياغة هذا الجزء من مشروعك.</p>
                        </div>
                        <button 
                          onClick={onRequestMentorship}
                          className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95 shrink-0"
                        >
                          طلب إرشاد بشري
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end mt-8">
                  {!exerciseFeedback ? (
                    <button onClick={handleExerciseSubmit} disabled={isExerciseSubmitting || !exerciseAnswer.trim()} className={`px-10 py-4 rounded-[1.5rem] font-black transition-all shadow-xl active:scale-95 disabled:opacity-50 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 hover:bg-black text-white'}`}>
                      {isExerciseSubmitting ? 'جاري التحليل...' : 'إرسال للمراجعة'}
                    </button>
                  ) : exerciseFeedback.includes("مقبولة") ? (
                    <button onClick={() => { playPositiveSound(); startQuiz(); window.scrollTo(0,0); }} className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-[1.5rem] font-black shadow-xl animate-pulse">الانتقال للاختبار</button>
                  ) : (
                    <button onClick={() => { setExerciseFeedback(''); setExerciseAnswer(''); }} className={`px-10 py-4 rounded-[1.5rem] font-black transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>إعادة المحاولة</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === Step.LOADING_QUIZ && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <div className={`animate-spin rounded-full h-12 w-12 border-4 ${activeTheme.accent.replace('text', 'border')} border-t-transparent`}></div>
              <p className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>توليد الأسئلة والتقارير...</p>
            </div>
          )}

          {step === Step.QUIZ && (
            <div className={`rounded-[3rem] shadow-xl border overflow-hidden animate-fade-in-up transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
               <div className={`px-8 py-8 text-white flex justify-between items-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-900'}`}>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                       <LevelIllustration levelId={level.id} theme={activeTheme} isDarkMode={isDarkMode} />
                    </div>
                    <h3 className="text-2xl font-black">اختبار نهائي للمستوى</h3>
                 </div>
                 <span className="bg-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">{quizQuestions.length} أسئلة</span>
               </div>
               <div className="p-8 md:p-12 space-y-10">
                 {quizQuestions.map((q, qIdx) => (
                   <div key={q.id} className="animate-fade-in-up" style={{ animationDelay: `${qIdx * 0.1}s` }}>
                     <div className="flex items-start gap-4 mb-6">
                       <span className={`w-8 h-8 ${activeTheme.secondary} rounded-lg flex items-center justify-center ${activeTheme.text} font-black text-sm shrink-0 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : ''}`}>{qIdx + 1}</span>
                       <p className={`font-black text-lg pt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{q.text}</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-12">
                       {q.options.map((opt, optIdx) => {
                         const isSelected = quizAnswers[qIdx] === optIdx;
                         const isSubmitted = quizScore !== null;
                         const isCorrect = q.correctIndex === optIdx;
                         const baseClass = isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-100 hover:border-blue-200';
                         
                         let stateClass = baseClass;
                         if (isSubmitted) {
                           if (isCorrect) stateClass = isDarkMode ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-500';
                           else if (isSelected) stateClass = isDarkMode ? 'bg-rose-900/30 border-rose-600 opacity-50' : 'bg-rose-50 border-rose-500 opacity-50';
                           else stateClass = 'opacity-50 ' + baseClass;
                         } else if (isSelected) {
                           stateClass = `${activeTheme.secondary} ${activeTheme.border.replace('100', '500')} shadow-lg ${isDarkMode ? 'bg-slate-800 border-blue-500' : ''}`;
                         }

                         return (
                          <label key={optIdx} className={`relative flex items-center p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all ${stateClass}`}>
                            <input type="radio" name={`q-${q.id}`} className="hidden" disabled={isSubmitted} onChange={() => { const na = [...quizAnswers]; na[qIdx] = optIdx; setQuizAnswers(na); }} />
                            <span className={`font-bold ${isSelected ? (isDarkMode ? 'text-white' : activeTheme.text) : (isDarkMode ? 'text-slate-400' : 'text-slate-700')}`}>{opt}</span>
                          </label>
                         );
                       })}
                     </div>
                   </div>
                 ))}
                 
                 <div className={`pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    {quizScore !== null ? (
                      <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>النتيجة النهائية: <span className={quizScore >= (quizQuestions.length * 0.6) ? 'text-green-600' : 'text-rose-600'}>{quizScore} / {quizQuestions.length}</span></div>
                    ) : (
                      <p className="text-slate-400 font-bold text-sm">أجب على جميع الأسئلة لتتمكن من التسليم.</p>
                    )}
                    {quizScore === null ? (
                      <button onClick={handleQuizSubmit} disabled={quizAnswers.includes(-1)} className={`${activeTheme.primary} hover:opacity-90 disabled:opacity-50 text-white px-12 py-4 rounded-[1.5rem] font-black shadow-xl transition-all`}>تسليم الإجابات</button>
                    ) : quizScore >= (quizQuestions.length * 0.6) ? (
                      <div className={`flex items-center ${activeTheme.text} font-black animate-pulse`}>جاري الانتقال لصفحة النجاح...</div>
                    ) : (
                      <button onClick={() => { setQuizScore(null); setQuizAnswers(new Array(quizQuestions.length).fill(-1)); window.scrollTo(0,0); }} className={`px-10 py-4 rounded-2xl font-black transition-all ${isDarkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>إعادة المحاولة</button>
                    )}
                 </div>
               </div>
            </div>
          )}

          {step === Step.COMPLETED && (
             <div className={`flex flex-col items-center justify-center min-h-[60vh] rounded-[4rem] p-12 text-center shadow-2xl animate-fade-in-up border transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
               <div className="w-48 h-48 mb-8 flex items-center justify-center">
                 <LevelIllustration levelId={level.id} theme={activeTheme} isDarkMode={isDarkMode} />
               </div>
               <h2 className={`text-5xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>عمل رائع!</h2>
               <p className={`text-xl font-bold mb-12 max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>لقد أكملت المستوى "{level.title}" بنجاح وتجاوزت الاختبار. أنت تقترب من التخرج!</p>
               <button 
                 onClick={() => initiateExit('complete')} 
                 className={`px-14 py-5 rounded-[2rem] font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-white text-slate-950' : 'bg-slate-900 text-white'}`}
               >
                 العودة للوحة التحكم
               </button>
             </div>
          )}
        </div>

        {/* Sidebar Checklist & Chart */}
        <aside className="hidden xl:block w-72 shrink-0 space-y-6">
          <div className="sticky top-28 space-y-6">
            <div className={`rounded-[2.5rem] p-8 border shadow-sm overflow-hidden relative transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white'}`}>
               <h4 className={`text-xs font-black mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <span className="w-2 h-4 bg-blue-600 rounded-full"></span>
                  منحنى الإنجاز (Mastery)
               </h4>
               <div className="h-32 w-full mb-6">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="curveColor" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor={activeTheme.primary.includes('blue') ? '#3b82f6' : activeTheme.primary.includes('emerald') ? '#10b981' : activeTheme.primary.includes('indigo') ? '#6366f1' : '#f43f5e'} stopOpacity={0.3}/>
                         <stop offset="95%" stopColor={activeTheme.primary.includes('blue') ? '#3b82f6' : activeTheme.primary.includes('emerald') ? '#10b981' : activeTheme.primary.includes('indigo') ? '#6366f1' : '#f43f5e'} stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <Tooltip content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                         return (
                           <div className={`border p-2 rounded-xl shadow-xl text-[10px] font-black ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
                             {payload[0].payload.name}: {Math.round(payload[0].value as number)}%
                           </div>
                         );
                       }
                       return null;
                     }} />
                     <Area 
                       type="monotone" 
                       dataKey="value" 
                       stroke={activeTheme.primary.includes('blue') ? '#3b82f6' : activeTheme.primary.includes('emerald') ? '#10b981' : activeTheme.primary.includes('indigo') ? '#6366f1' : '#f43f5e'} 
                       strokeWidth={2} 
                       fillOpacity={1} 
                       fill="url(#curveColor)" 
                       animationDuration={1500}
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
               <div className={`h-px mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
               <h4 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                  قائمة مهام المستوى
               </h4>
               <div className="space-y-6">
                  {tasks.map((task, idx) => (
                    <div key={idx} className={`flex gap-4 items-start transition-opacity duration-300 ${task.isActive ? 'opacity-100' : 'opacity-50'}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 transition-all ${task.isCompleted ? 'bg-green-50 border-green-500 text-white' : task.isActive ? `${activeTheme.border.replace('100', '500')} ${activeTheme.accent}` : (isDarkMode ? 'border-slate-800 text-slate-700' : 'border-slate-200 text-slate-300')}`}>
                        {task.isCompleted ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <span className="text-[10px] font-black">{idx + 1}</span>
                        )}
                      </div>
                      <p className={`text-[11px] font-bold leading-tight ${task.isActive ? (isDarkMode ? 'text-white' : 'text-slate-900') : (isDarkMode ? 'text-slate-600' : 'text-slate-50')}`}>{task.label}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className={`rounded-[2.5rem] p-8 md:p-12 max-lg w-full shadow-2xl border animate-fade-in-up ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-3xl font-black text-center mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>تأكيد الإجراء</h3>
            <p className={`text-center mb-10 font-bold leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {pendingAction === 'complete' 
                ? 'هل أنت متأكد من رغبتك في إنهاء المستوى والعودة للوحة التحكم؟ سيتم حفظ تقدمك تلقائياً.' 
                : 'هل أنت متأكد من رغبتك في مغادرة المستوى والعودة؟ لا تقلق، سيتم حفظ تقدمك الحالي للعودة إليه لاحقاً.'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowExitModal(false)} className={`py-4 rounded-2xl font-black transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>إلغاء</button>
              <button onClick={finalizeExit} className={`py-4 ${activeTheme.primary} text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-lg shadow-slate-200`}>نعم، متأكد</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

