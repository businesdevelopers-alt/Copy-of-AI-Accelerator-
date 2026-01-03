
import React, { useState } from 'react';
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
    email: '',
    age: 0,
    birthDate: '',
    foundationYear: new Date().getFullYear(),
    foundersCount: 1,
    technologies: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProjectEvaluationResult | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(05|5)\d{8}$/;
    const currentYear = new Date().getFullYear();

    if (!formData.firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب';
    else if (formData.firstName.length < 2) newErrors.firstName = 'الاسم قصير جداً';

    if (!formData.lastName.trim()) newErrors.lastName = 'اللقب مطلوب';
    else if (formData.lastName.length < 2) newErrors.lastName = 'اللقب قصير جداً';

    if (!formData.birthDate) newErrors.birthDate = 'تاريخ الميلاد مطلوب';

    if (!formData.age || formData.age < 16) newErrors.age = 'يجب أن يكون العمر 16 سنة على الأقل';
    else if (formData.age > 90) newErrors.age = 'يرجى إدخال عمر صحيح';

    if (!formData.phone.trim()) newErrors.phone = 'رقم الجوال مطلوب';
    else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'رقم جوال غير صحيح (مثال: 05xxxxxxxx)';

    if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';

    if (!formData.startupName.trim()) newErrors.startupName = 'اسم المشروع مطلوب';
    else if (formData.startupName.length < 3) newErrors.startupName = 'اسم المشروع قصير جداً';

    if (!formData.foundationYear || formData.foundationYear < 1900) newErrors.foundationYear = 'سنة التأسيس غير منطقية';
    else if (formData.foundationYear > currentYear) newErrors.foundationYear = 'سنة التأسيس لا يمكن أن تكون في المستقبل';

    if (!formData.foundersCount || formData.foundersCount < 1) newErrors.foundersCount = 'يجب وجود مؤسس واحد على الأقل';

    if (!formData.startupDescription.trim()) newErrors.startupDescription = 'وصف المشروع مطلوب';
    else if (formData.startupDescription.length < 20) newErrors.startupDescription = 'يرجى كتابة وصف أكثر تفصيلاً (20 حرفاً على الأقل)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyzeIdea = async () => {
    if (!formData.startupDescription || formData.startupDescription.length < 20) {
      setErrors(prev => ({ ...prev, startupDescription: 'يرجى كتابة وصف للفكرة (20 حرفاً على الأقل) للتحليل' }));
      playErrorSound();
      return;
    }
    setIsAnalyzing(true);
    // Clear description error if fixed
    setErrors(prev => {
      const n = { ...prev };
      delete n.startupDescription;
      return n;
    });
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
      playErrorSound();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onRegister(formData);
    } else {
      playErrorSound();
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  const renderField = (label: string, name: keyof UserProfile, type: string = 'text', placeholder: string = '') => {
    const hasError = !!errors[name];
    return (
      <div className="space-y-2">
        <label className={`text-xs font-black uppercase tracking-widest pr-1 transition-colors ${hasError ? 'text-rose-500' : 'text-slate-500'}`}>
          {label}
        </label>
        <input 
          name={name}
          type={type} 
          className={`w-full px-5 py-4 bg-white/5 border rounded-2xl outline-none transition-all text-white font-bold
            ${hasError ? 'border-rose-500 bg-rose-500/5 focus:border-rose-400' : 'border-white/10 focus:border-blue-500 focus:bg-white/10'}
          `} 
          value={formData[name] as string | number} 
          onChange={e => {
            setFormData({...formData, [name]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value});
            if (errors[name]) {
              setErrors(prev => {
                const n = { ...prev };
                delete n[name];
                return n;
              });
            }
          }} 
          placeholder={placeholder} 
        />
        {hasError && <p className="text-[10px] font-bold text-rose-500 pr-1 animate-fade-in">{errors[name]}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans text-white" dir="rtl">
      {/* Side Panel */}
      <div className="hidden lg:flex lg:w-1/3 relative bg-slate-900 flex-col justify-between p-12 text-white border-l border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl transform -rotate-3">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter">AI Accelerator</span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6">انضم لمستقبل <br/><span className="text-blue-500">الريادة.</span></h1>
          <p className="text-lg text-slate-400 max-w-xs leading-relaxed">نحن لا نقوم فقط بتسريع الأعمال، نحن نقوم بهندسة نجاحك باستخدام الذكاء الاصطناعي.</p>
        </div>
        
        <div className="relative z-10 space-y-6">
           <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
              <h4 className="text-blue-400 font-black text-sm mb-4 uppercase tracking-widest">إحصائيات المنصة</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-2xl font-black">500+</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">خريج معتمد</p>
                 </div>
                 <div>
                    <p className="text-2xl font-black">24/7</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">دعم ذكي</p>
                 </div>
              </div>
           </div>
           {onStaffLogin && (
             <button onClick={onStaffLogin} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors">
               Admin Portal Access →
             </button>
           )}
        </div>
      </div>

      {/* Form Area */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-6 md:p-12 bg-slate-950 overflow-y-auto">
        <div className="max-w-3xl w-full animate-fade-in-up">
          <header className="mb-12 text-right">
            <h2 className="text-4xl font-black text-white mb-3">تسجيل رائد أعمال جديد</h2>
            <p className="text-slate-400 text-lg">يرجى تعبئة كافة الحقول لبدء رحلة التقييم الذكي.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Section 1: Founder Information */}
            <div className="space-y-6">
               <h3 className="text-xl font-black text-blue-500 flex items-center gap-3">
                  <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                  بيانات المؤسس الشخصية
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField('الاسم الأول', 'firstName', 'text', 'أحمد')}
                  {renderField('اللقب (العائلة)', 'lastName', 'text', 'الراجحي')}
                  {renderField('تاريخ الميلاد', 'birthDate', 'date')}
                  {renderField('العمر', 'age', 'number', '25')}
                  {renderField('رقم الجوال', 'phone', 'text', '05xxxxxxxx')}
                  {renderField('الايميل', 'email', 'email', 'name@domain.com')}
               </div>
            </div>

            {/* Section 2: Startup Information */}
            <div className="space-y-6">
               <h3 className="text-xl font-black text-blue-500 flex items-center gap-3">
                  <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                  بيانات المشروع / الشركة
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    {renderField('اسم المشروع', 'startupName', 'text', 'اسم شركتك الناشئة')}
                  </div>
                  {renderField('سنة التأسيس', 'foundationYear', 'number', '2024')}
                  {renderField('عدد المؤسسين', 'foundersCount', 'number', '1')}
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pr-1">قطاع الأعمال</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-900 border border-white/10 rounded-2xl outline-none focus:border-blue-500 font-bold appearance-none text-white" 
                      value={formData.industry} 
                      onChange={e => setFormData({...formData, industry: e.target.value})}
                    >
                      {INDUSTRIES.map(ind => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
                    </select>
                  </div>

                  {renderField('التقنيات المستخدمة', 'technologies', 'text', 'AI, Cloud, Blockchain...')}

                  <div className="space-y-2 md:col-span-2">
                    <label className={`text-xs font-black uppercase tracking-widest pr-1 transition-colors ${errors.startupDescription ? 'text-rose-500' : 'text-slate-500'}`}>
                      وصف موجز للفكرة
                    </label>
                    <textarea 
                      name="startupDescription"
                      className={`w-full px-5 py-4 bg-white/5 border rounded-2xl h-32 outline-none transition-all text-white font-medium resize-none
                        ${errors.startupDescription ? 'border-rose-500 bg-rose-500/5 focus:border-rose-400' : 'border-white/10 focus:border-blue-500'}
                      `}
                      value={formData.startupDescription} 
                      onChange={e => {
                        setFormData({...formData, startupDescription: e.target.value});
                        if (errors.startupDescription) {
                          setErrors(prev => {
                            const n = { ...prev };
                            delete n.startupDescription;
                            return n;
                          });
                        }
                      }} 
                      placeholder="ما هي المشكلة التي يحلها مشروعك؟" 
                    />
                    {errors.startupDescription && <p className="text-[10px] font-bold text-rose-500 pr-1">{errors.startupDescription}</p>}
                    
                    <button type="button" onClick={handleAnalyzeIdea} disabled={isAnalyzing} className="mt-3 text-[10px] font-black text-blue-400 hover:text-blue-300 flex items-center gap-2 uppercase tracking-widest group">
                       {isAnalyzing ? <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div> : '✨'}
                       {isAnalyzing ? 'جاري التحليل...' : 'اضغط للتحليل الأولي للفكرة بالذكاء الاصطناعي'}
                    </button>
                  </div>
               </div>
            </div>

            {analysisResult && (
              <div className="p-6 bg-blue-600 rounded-3xl text-white animate-fade-in-up border border-white/10 shadow-2xl">
                 <h4 className="font-black text-xs mb-2 flex items-center gap-2"><span>🤖</span> تحليل Gemini للجاهزية:</h4>
                 <p className="text-[11px] leading-relaxed opacity-90 italic">"{analysisResult.aiOpinion}"</p>
                 <div className="mt-4 flex justify-between items-center border-t border-white/20 pt-3">
                    <span className="text-[10px] font-black uppercase">نتيجة التقييم الأولي:</span>
                    <span className="text-xl font-black">{analysisResult.totalScore}/100</span>
                 </div>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-4 group"
            >
              <span>تأكيد البيانات والدخول</span>
              <svg className="w-6 h-6 transform rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
