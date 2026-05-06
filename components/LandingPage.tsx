
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, 
  Lightbulb, 
  BarChart3, 
  Search, 
  Hammer, 
  DollarSign, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { StartupRecord } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onPathFinder: () => void;
  onSmartFeatures: () => void;
  onGovDashboard: () => void;
  onRoadmap: () => void;
  onTools: () => void;
  onAchievements: () => void;
  onMentorship: () => void;
  onIncubation: () => void;
  onCommunity: () => void;
  onLegalClick: (type: 'PRIVACY' | 'TERMS' | 'CONTACT') => void;
  onLogin?: () => void;
}

interface JourneyStep {
  id: number;
  title: string;
  icon: React.ReactNode;
  goal: string;
  deliverables: string[];
  gradient: string;
  glow: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  { id: 1, title: 'التحقق من الفكرة', icon: <Lightbulb className="w-8 h-8" />, goal: 'إثبات وجود مشكلة حقيقية واحتياج سوقي للحل المقترح.', deliverables: ['تحليل المشكلة بدقة', 'تحديد الجمهور المستهدف', 'صياغة عرض القيمة'], gradient: 'from-blue-500 to-cyan-400', glow: 'rgba(59, 130, 246, 0.1)' },
  { id: 2, title: 'نموذج العمل', icon: <BarChart3 className="w-8 h-8" />, goal: 'تصميم محرك الربح وضمان استدامة المشروع وقابلية التوسع.', deliverables: ['مخطط BMC الاحترافي', 'قنوات التوزيع', 'هيكل الإيرادات'], gradient: 'from-indigo-500 to-purple-400', glow: 'rgba(99, 102, 241, 0.1)' },
  { id: 3, title: 'تحليل السوق', icon: <Search className="w-8 h-8" />, goal: 'دراسة المنافسين وتحديد الميزة التنافسية الفريدة في السوق.', deliverables: ['تحليل SWOT المعمق', 'حجم السوق TAM/SAM', 'مصفوفة التميز'], gradient: 'from-emerald-500 to-teal-400', glow: 'rgba(16, 185, 129, 0.1)' },
  { id: 4, title: 'بناء الـ MVP', icon: <Hammer className="w-8 h-8" />, goal: 'إطلاق نسخة أولية لاختبار الحل مع عملاء حقيقيين بأقل التكاليف.', deliverables: ['تحديد المزايا الجوهرية', 'رسم رحلة المستخدم', 'خطة الاختبار'], gradient: 'from-amber-500 to-orange-400', glow: 'rgba(245, 158, 11, 0.1)' },
  { id: 5, title: 'الخطة المالية', icon: <DollarSign className="w-8 h-8" />, goal: 'بناء التوقعات المالية الواقعية وجذب اهتمام المستثمرين.', deliverables: ['توقعات التدفق النقدي', 'نقطة التعادل', 'التقييم الاستثماري'], gradient: 'from-rose-500 to-pink-400', glow: 'rgba(244, 63, 94, 0.1)' },
  { id: 6, title: 'عرض الاستثمار', icon: <Rocket className="w-8 h-8" />, goal: 'تجهيز ملف العرض النهائي وإغلاق أول جولة تمويلية ناجحة.', deliverables: ['Pitch Deck عالمي', 'مهارات الإلقاء', 'قائمة المستهدفين'], gradient: 'from-blue-900 to-slate-900', glow: 'rgba(30, 41, 59, 0.1)' }
];

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, onRoadmap, onTools, onAchievements, onMentorship, onIncubation, onCommunity, onLegalClick, onLogin 
}) => {
  const [registeredStartups, setRegisteredStartups] = useState<StartupRecord[]>([]);

  useEffect(() => {
    setRegisteredStartups(storageService.getAllStartups());
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-primary font-sans selection:bg-brand-hover/30 overflow-x-hidden" dir="rtl">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-mesh opacity-50" />
      
      {/* Header */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-[100] bg-white/90 shadow-sm border-b border-brand-primary/10 border-b border-brand-primary/10 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
               <Zap className="w-6 h-6 text-white fill-white" />
             </div>
             <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight leading-none uppercase">بيزنس ديفلوبرز</span>
                <span className="text-[9px] font-bold text-brand-primary uppercase tracking-[0.2em] mt-0.5">AI Virtual Accelerator</span>
             </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold">
            <button onClick={onIncubation} className="text-brand-primary hover:text-blue-300 transition-colors">الاحتضان</button>
            <button onClick={onRoadmap} className="hover:text-brand-primary transition-colors">المسار</button>
            <button onClick={onCommunity} className="hover:text-brand-primary transition-colors">المجتمع</button>
            <button onClick={onTools} className="hover:text-brand-primary transition-colors">الأدوات</button>
            <button onClick={onMentorship} className="hover:text-brand-primary transition-colors">الإرشاد</button>
            <button onClick={onAchievements} className="hover:text-brand-primary transition-colors">الإنجازات</button>
            <div className="h-4 w-px bg-brand-primary/10" />
            <button onClick={onLogin} className="hover:text-brand-primary transition-colors px-2">دخول الأعضاء</button>
            <button 
              onClick={onStart}
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-primary/20 active:scale-95"
            >
              ابدأ الآن
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-right space-y-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-xs font-bold border border-brand-primary/20"
              >
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                <span className="uppercase tracking-[0.2em]">الجيل القادم من مسرعات الأعمال</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl lg:text-3xl font-bold leading-[1.1] tracking-tight"
              >
                ابنِ مشروعك <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-indigo-500 relative">
                  بمجرد فكرة.
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute -bottom-2 right-0 h-2 bg-brand-primary/30 rounded-full"
                  />
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-brand-gray max-w-lg leading-relaxed font-medium"
              >
                حوّل رؤيتك إلى واقع ملموس من خلال أول منصة تدريب ريادي مدعومة كلياً بالذكاء الاصطناعي في الوطن العربي.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-4 justify-end lg:justify-start"
              >
                 <button 
                  onClick={onStart}
                  className="px-10 py-5 bg-brand-primary hover:bg-brand-hover text-white text-xl font-bold rounded-2xl shadow-2xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-3 group"
                >
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform rotate-180" />
                  <span>انضم للمسرعة</span>
                </button>
                <button 
                  onClick={onLogin}
                  className="px-10 py-5 bg-white shadow-sm border border-brand-primary/10 border-brand-primary/20 hover:border-brand-primary/20 text-brand-primary text-lg font-bold rounded-2xl transition-all"
                >
                  تسجيل الدخول
                </button>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-brand-primary/20 blur-[150px] -z-10" />
              <div className="bg-white shadow-sm border border-brand-primary/10 rounded-[4rem] p-4 border-brand-primary/20 rotate-2 hover:rotate-0 transition-all duration-700">
                <div className="bg-white/80 rounded-[3.5rem] p-12 border border-brand-primary/10 min-h-[500px] flex flex-col justify-center items-center text-center">
                   <div className="w-20 h-20 bg-brand-primary/20 rounded-3xl mb-8 flex items-center justify-center border border-brand-primary/20">
                      <Zap className="w-10 h-10 text-brand-primary" />
                   </div>
                   <h3 className="text-3xl font-bold mb-4 uppercase tracking-tighter text-brand-primary">AI Dashboard</h3>
                   <p className="text-slate-500 font-bold mb-10 italic">"نظام ذكي متكامل لإدارة نمو شركتك الناشئة"</p>
                   <div className="w-full space-y-3 mb-10 text-right">
                      <div className="h-1 bg-brand-primary/5 rounded-full w-full overflow-hidden">
                        <motion.div 
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                          className="h-full w-1/3 bg-brand-primary shadow-[0_0_15px_rgba(37,99,235,0.8)]"
                        />
                      </div>
                      <div className="flex justify-between gap-4">
                        <div className="h-8 bg-brand-primary/5 rounded-lg flex-1" />
                        <div className="h-8 bg-brand-primary/5 rounded-lg flex-[2]" />
                      </div>
                   </div>
                   <button onClick={onLogin} className="w-full py-4 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-primary/20">
                     دخول المنصة
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-right mb-20 space-y-4">
             <h2 className="text-3xl font-bold tracking-tight">مسارك الريادي الذكي</h2>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-sm text-right">6 مستويات احترافية لبناء مشروعك من الصفر</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {JOURNEY_STEPS.map((step, idx) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className={`absolute -inset-1 bg-gradient-to-br ${step.gradient} rounded-[2.5rem] opacity-0 group-hover:opacity-20 transition-all blur-xl`} />
                <div className="relative bg-white shadow-sm border border-brand-primary/10 p-10 rounded-[2.5rem] h-full border-brand-primary/10 flex flex-col justify-between hover:border-brand-primary/30 transition-all text-right">
                  <div>
                    <div className={`w-16 h-16 rounded-2xl bg-brand-primary/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                      {step.icon}
                    </div>
                    <h4 className="text-2xl font-bold mb-4">{step.title}</h4>
                    <p className="text-brand-gray font-medium leading-relaxed mb-8">{step.goal}</p>
                    
                    <div className="space-y-3">
                      {step.deliverables.slice(0, 2).map((d, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500 justify-start flex-row-reverse">
                          <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-10 pt-6 border-t border-brand-primary/10 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Phase 0{step.id}</span>
                    <ArrowRight className="w-5 h-5 text-brand-hover group-hover:-translate-x-1 transition-transform rotate-180" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white/90 shadow-sm border-b border-brand-primary/10 border-t border-brand-primary/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-20 text-right">
             <div className="space-y-8">
                <div className="flex items-center gap-3 justify-end">
                   <span className="text-2xl font-bold uppercase tracking-tight">بيزنس ديفلوبرز</span>
                   <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg">
                      <Zap className="w-5 h-5 text-brand-primary fill-brand-primary" />
                   </div>
                </div>
                <p className="text-slate-500 max-w-sm ml-auto leading-loose font-medium">
                  نحن نؤمن بأن المستقبل يُبنى بالعقول المبدعة والتقنيات الذكية. مهمتنا هي تمكين كل رائد أعمال من تحويل فكرته إلى أثر ملموس.
                </p>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                <div className="space-y-4">
                   <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-primary">البوابة</h5>
                   <div className="flex flex-col gap-3 text-sm font-bold text-brand-gray">
                      <button onClick={onIncubation} className="hover:text-brand-primary transition-colors text-right">الاحتضان</button>
                      <button onClick={onMentorship} className="hover:text-brand-primary transition-colors text-right">الإرشاد</button>
                      <button onClick={onAchievements} className="hover:text-brand-primary transition-colors text-right">الإنجازات</button>
                      <button onClick={onCommunity} className="hover:text-brand-primary transition-colors text-right">مجتمع الشركات</button>
                   </div>
                </div>
                <div className="space-y-4">
                   <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-primary">المصادر</h5>
                   <div className="flex flex-col gap-3 text-sm font-bold text-brand-gray">
                      <button onClick={onTools} className="hover:text-brand-primary transition-colors text-right">الأدوات</button>
                      <button onClick={onRoadmap} className="hover:text-brand-primary transition-colors text-right">المسار</button>
                      <button onClick={() => onLegalClick('PRIVACY')} className="hover:text-brand-primary transition-colors text-right">الخصوصية</button>
                   </div>
                </div>
                <div className="space-y-4">
                   <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-primary">تواصل</h5>
                   <div className="flex flex-col gap-3 text-sm font-bold text-brand-gray">
                      <button onClick={() => onLegalClick('CONTACT')} className="hover:text-brand-primary transition-colors text-right">الدعم الفني</button>
                      <button className="hover:text-brand-primary transition-colors text-right">البريدية</button>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="pt-10 border-t border-brand-primary/10 flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.5em]">Business Developers Hub • 2024</p>
             <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                <span>Powered by</span>
                <span className="text-brand-gray text-xs">Google Gemini AI</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
