
import React, { useState, useMemo } from 'react';
import { UserProfile, ProjectEvaluationResult, ApplicantProfile } from '../types';
import { evaluateProjectIdea } from '../services/geminiService';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../services/audioService';

interface RegistrationProps {
  onRegister: (profile: UserProfile) => void;
  onStaffLogin?: () => void;
}

const INDUSTRIES = [
  { value: 'Technology', label: 'تقنية وتكنولوجيا' },
  { value: 'E-commerce', label: 'تجارة إلكترونية' },
  { value: 'Health', label: 'صحة وطب' },
  { value: 'Education', label: 'تعليم' },
  { value: 'Food', label: 'أغذية ومشروبات' },
  { value: 'RealEstate', label: 'عقارات وإنشاءات' },
  { value: 'Finance', label: 'مالية واستثمار' },
  { value: 'Logistics', label: 'لوجستيات ونقل' },
  { value: 'AI', label: 'ذكاء اصطناعي' },
  { value: 'Other', label: 'أخرى' }
];

export const Registration: React.FC<RegistrationProps> = ({ onRegister, onStaffLogin }) => {
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    startupName: '',
    startupDescription: '',
    industry: 'Technology',
    phone: '',
    email: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProjectEvaluationResult | null>(null);

  const handleAnalyzeIdea = async () => {
    if (!formData.startupDescription || formData.startupDescription.length < 20) {
      setErrors(prev => ({ ...prev, startupDescription: 'يرجى كتابة وصف للفكرة (20 حرفاً على الأقل) للتحليل' }));
      playErrorSound();
      return;
    }
    setIsAnalyzing(true);
    setErrors({});
    playPositiveSound();

    try {
      const tempProfile: ApplicantProfile = {
        codeName: `${formData.firstName} ${formData.lastName}`,
        projectStage: 'Idea',
        sector: formData.industry,
        goal: 'Registration Analysis',
        techLevel: 'Medium'
      };
      const result = await evaluateProjectIdea(formData.startupDescription, tempProfile);
      setAnalysisResult(result);
      playCelebrationSound();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'مطلوب';
    if (!formData.lastName.trim()) newErrors.lastName = 'مطلوب';
    if (!formData.startupName.trim()) newErrors.startupName = 'مطلوب';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'بريد غير صحيح';
    if (!formData.phone.trim()) newErrors.phone = 'مطلوب';

    if (Object.keys(newErrors).length === 0) {
      onRegister(formData);
    } else {
      setErrors(newErrors);
      playErrorSound();
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans overflow-hidden text-white" dir="rtl">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-between p-16 text-white">
        <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter">AI Accelerator</span>
          </div>
          <h1 className="text-6xl font-black leading-tight mb-8 text-white">خطوتك الأولى <br/> نحو العالمية.</h1>
          <p className="text-xl text-slate-400 max-w-md leading-relaxed">انضم إلى مجتمع رواد الأعمال الأكثر طموحاً، وابدأ ببناء مشروعك باستخدام أدوات الذكاء الاصطناعي الأكثر تقدماً.</p>
        </div>
        <div className="relative z-10 flex flex-col gap-6">
           <div className="bg-white/5 backdrop-blur-md p-8 rounded-[3rem] border border-white/10">
              <p className="text-sm font-bold text-blue-400 mb-2">لماذا تسجل معنا؟</p>
              <ul className="space-y-3 text-sm text-slate-300">
                 <li className="flex items-center gap-3"><span>✓</span> تحليل فوري للفكرة بالذكاء الاصطناعي.</li>
                 <li className="flex items-center gap-3"><span>✓</span> لوحة تحكم Pro لمتابعة نمو مشروعك.</li>
                 <li className="flex items-center gap-3"><span>✓</span> رادار كفاءة يحدد نقاط قوتك وضعفك.</li>
              </ul>
           </div>
           {onStaffLogin && (
             <button onClick={onStaffLogin} className="self-start text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-colors">
               Admin & Staff Access Portal →
             </button>
           )}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950 overflow-y-auto">
        <div className="max-w-xl w-full animate-fade-in-up">
          <header className="mb-10 text-right">
            <h2 className="text-3xl font-black text-white mb-2">تسجيل عضوية جديدة</h2>
            <p className="text-slate-400 font-medium">أكمل بياناتك الشخصية وبيانات شركتك للانطلاق.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pr-1">الاسم الأول</label>
                <input 
                  className={`w-full px-5 py-4 bg-white/5 border rounded-2xl outline-none transition-all text-white ${errors.firstName ? 'border-red-500' : 'border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'}`}
                  placeholder="أحمد"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pr-1">اللقب (العائلة)</label>
                <input 
                  className={`w-full px-5 py-4 bg-white/5 border rounded-2xl outline-none transition-all text-white ${errors.lastName ? 'border-red-500' : 'border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'}`}
                  placeholder="الراجحي"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pr-1">اسم الشركة / المشروع</label>
              <input 
                className={`w-full px-5 py-4 bg-white/5 border rounded-2xl outline-none transition-all text-white ${errors.startupName ? 'border-red-500' : 'border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'}`}
                placeholder="اسم شركتك الناشئة"
                value={formData.startupName}
                onChange={e => setFormData({...formData, startupName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pr-1">رقم التواصل</label>
                <input 
                  className={`w-full px-5 py-4 bg-white/5 border rounded-2xl outline-none transition-all text-white ${errors.phone ? 'border-red-500' : 'border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'}`}
                  placeholder="05xxxxxxx"
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pr-1">البريد الإلكتروني</label>
                <input 
                  className={`w-full px-5 py-4 bg-white/5 border rounded-2xl outline-none transition-all text-white ${errors.email ? 'border-red-500' : 'border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'}`}
                  placeholder="name@company.com"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pr-1">مجال العمل</label>
              <select 
                className="w-full px-5 py-4 bg-slate-900 border border-white/10 rounded-2xl outline-none focus:border-blue-500 font-bold appearance-none text-white"
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
              >
                {INDUSTRIES.map(ind => <option key={ind.value} value={ind.value} className="bg-slate-900">{ind.label}</option>)}
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pr-1">وصف موجز للفكرة</label>
              </div>
              <textarea 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl h-28 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none text-white"
                placeholder="ما المشكلة التي تحلها؟ وما هو حلك الفريد؟"
                value={formData.startupDescription}
                onChange={e => { setFormData({...formData, startupDescription: e.target.value}); setAnalysisResult(null); }}
              />
              <button 
                type="button"
                onClick={handleAnalyzeIdea}
                disabled={isAnalyzing}
                className="mt-3 text-[10px] font-black text-blue-400 hover:text-blue-300 flex items-center gap-2 uppercase tracking-wider"
              >
                {isAnalyzing ? <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div> : '✨'}
                {isAnalyzing ? 'جاري التحليل الذكي...' : 'اضغط للتحليل الأولي لفكرتك بالذكاء الاصطناعي'}
              </button>
            </div>

            {analysisResult && (
              <div className="p-5 bg-blue-600 rounded-3xl text-white animate-fade-in-up">
                 <h4 className="font-black text-xs mb-2 flex items-center gap-2"><span>🤖</span> تحليل Gemini:</h4>
                 <p className="text-[11px] leading-relaxed opacity-90 italic">"{analysisResult.aiOpinion}"</p>
                 <div className="mt-4 flex justify-between items-center border-t border-white/20 pt-3">
                    <span className="text-[10px] font-black uppercase">درجة الجاهزية:</span>
                    <span className="text-xl font-black">{analysisResult.totalScore}/100</span>
                 </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
            >
              <span>تأكيد العضوية والدخول</span>
              <svg className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
