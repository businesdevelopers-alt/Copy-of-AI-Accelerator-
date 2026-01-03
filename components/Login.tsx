
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
  const [password, setPassword] = useState(''); // Simulated password field
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate small delay
    setTimeout(() => {
      const result = storageService.loginUser(email);
      
      if (result) {
        const profile: UserProfile = {
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          phone: result.user.phone,
          startupName: result.startup.name,
          startupDescription: result.startup.description,
          industry: result.startup.industry,
          name: `${result.user.firstName} ${result.user.lastName}`
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

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans overflow-hidden text-white" dir="rtl">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-center p-20">
        <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10 space-y-8">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
             <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-6xl font-black leading-tight">عد إلينا مجدداً <br/><span className="text-blue-500">لإكمال مسارك.</span></h1>
          <p className="text-xl text-slate-400 max-w-md">أنت الآن أقرب من أي وقت مضى لتحقيق رؤيتك الريادية. سجل دخولك لمتابعة الدروس وتحليل النتائج.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950">
        <div className="max-w-md w-full animate-fade-in-up">
           <header className="mb-12">
              <h2 className="text-4xl font-black text-white mb-4">تسجيل الدخول</h2>
              <p className="text-slate-400 font-medium">أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم.</p>
           </header>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-widest pr-1">البريد الإلكتروني</label>
                 <input 
                   type="email" 
                   required
                   className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-white font-bold"
                   placeholder="name@company.com"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                 />
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center pr-1">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">كلمة المرور</label>
                    <button type="button" className="text-[10px] font-black text-blue-500 hover:text-blue-400">نسيت كلمة المرور؟</button>
                 </div>
                 <input 
                   type="password" 
                   className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-white font-bold"
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
                   className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.8rem] font-black text-xl shadow-2xl shadow-blue-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-4 group disabled:opacity-50"
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
                 <button 
                   type="button" 
                   onClick={onBack}
                   className="w-full py-4 text-slate-500 hover:text-white font-bold text-sm transition-colors"
                 >
                   العودة للرئيسية
                 </button>
              </div>
           </form>

           <footer className="mt-16 text-center border-t border-white/5 pt-8">
              <p className="text-slate-500 text-xs">ليس لديك حساب؟ <button onClick={onBack} className="text-blue-500 font-black hover:underline">سجل مشروعك الآن</button></p>
           </footer>
        </div>
      </div>
    </div>
  );
};
