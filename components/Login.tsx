
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';
import { playPositiveSound, playErrorSound } from '../services/audioService';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent, targetEmail?: string) => {
    if (e) e.preventDefault();
    
    const finalEmail = targetEmail || email;
    if (!finalEmail) return;

    setIsLoading(true);
    setError(null);

    // Simulate small delay
    setTimeout(() => {
      const result = storageService.loginUser(finalEmail);
      
      if (result) {
        const profile: UserProfile = {
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          phone: result.user.phone,
          startupName: result.startup.name,
          startupDescription: result.startup.description,
          industry: result.startup.industry,
          name: `${result.user.firstName} ${result.user.lastName}`,
          hasCompletedAssessment: result.startup.status === 'APPROVED'
        };
        
        playPositiveSound();
        onLoginSuccess(profile);
      } else {
        setError('عذراً، لم نجد حساباً مسجلاً بهذا البريد الإلكتروني.');
        playErrorSound();
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    const demoEmail = storageService.seedDemoAccount();
    setEmail(demoEmail);
    setPassword('demo123');
    handleSubmit(undefined, demoEmail);
  };

  return (
    <div className="min-h-screen flex bg-brand-bg font-sans overflow-hidden text-brand-primary" dir="rtl">
      <div className="hidden lg:flex lg:w-1/2 relative bg-white flex-col justify-center p-20">
        <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10 space-y-8">
          <div className="w-16 h-16 bg-brand-primary rounded-3xl flex items-center justify-center border border-brand-primary/30 shadow-2xl">
             <svg className="w-9 h-9 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-3xl font-bold leading-tight">عد إلينا مجدداً <br/><span className="text-brand-hover">لإكمال مسارك.</span></h1>
          <p className="text-xl text-brand-gray max-w-md">أنت الآن أقرب من أي وقت مضى لتحقيق رؤيتك الريادية. سجل دخولك لمتابعة الدروس وتحليل النتائج.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-brand-bg">
        <div className="max-w-md w-full animate-fade-in-up">
           <header className="mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4">تسجيل الدخول</h2>
              <p className="text-brand-gray font-medium">أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم.</p>
           </header>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pr-1">البريد الإلكتروني</label>
                 <input 
                   type="email" 
                   required
                   className="w-full px-6 py-5 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-blue-500/5 transition-all text-white font-bold"
                   placeholder="name@company.com"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                 />
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center pr-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">كلمة المرور</label>
                    <button type="button" className="text-[10px] font-bold text-brand-hover hover:text-brand-primary">نسيت كلمة المرور؟</button>
                 </div>
                 <input 
                   type="password" 
                   className="w-full px-6 py-5 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-blue-500/5 transition-all text-white font-bold"
                   placeholder="••••••••"
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                 />
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-shake">
                   <span className="text-xl">⚠️</span>
                   <p className="text-sm font-bold text-rose-400">{error}</p>
                </div>
              )}

              <div className="pt-4 space-y-4">
                 <button 
                   type="submit" 
                   disabled={isLoading}
                   className="w-full py-6 bg-brand-primary hover:bg-brand-hover text-white rounded-[1.8rem] font-bold text-xl shadow-2xl shadow-brand-primary/20 transition-all transform active:scale-95 flex items-center justify-center gap-4 group disabled:opacity-50"
                 >
                   {isLoading ? (
                     <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : (
                     <>
                        <span>دخول للمسرعة</span>
                        <svg className="w-6 h-6 transform rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                     </>
                   )}
                 </button>

                 <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-primary/20"></div></div>
                    <div className="relative flex justify-center text-xs font-bold uppercase"><span className="bg-slate-950 px-4 text-slate-500 tracking-widest">أو استكشف كضيف</span></div>
                 </div>

                 <button 
                   type="button" 
                   onClick={handleDemoLogin}
                   disabled={isLoading}
                   className="w-full py-5 bg-brand-primary/5 hover:bg-brand-primary/10 border-2 border-dashed border-brand-primary/30 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                   <span>👀 الدخول بحساب تجريبي</span>
                   <span className="text-[10px] bg-brand-hover/20 px-2 py-0.5 rounded text-blue-300">بدون تسجيل</span>
                 </button>

                 <button 
                   type="button" 
                   onClick={onBack}
                   className="w-full py-4 text-slate-500 hover:text-brand-primary font-bold text-sm transition-colors"
                 >
                   العودة للرئيسية
                 </button>
              </div>
           </form>

           <footer className="mt-16 text-center border-t border-brand-primary/10 pt-8">
              <p className="text-slate-500 text-xs">ليس لديك حساب؟ <button onClick={onBack} className="text-brand-hover font-bold hover:underline">سجل مشروعك الآن</button></p>
           </footer>
        </div>
      </div>
    </div>
  );
};
