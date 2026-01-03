
import React, { useState } from 'react';
import { UserProfile, ApplicantProfile, ProjectEvaluationResult } from '../types';
import { evaluateProjectIdea } from '../services/geminiService';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../services/audioService';

interface RegistrationProps {
  onRegister: (profile: UserProfile) => void;
  onStaffLogin?: () => void;
}

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
    technologies: '',
    agreedToTerms: false,
    agreedToContract: false,
    signedContractName: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProjectEvaluationResult | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(05|5)\d{8}$/;

    if (!formData.firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب';
    if (!formData.lastName.trim()) newErrors.lastName = 'اللقب (العائلة) مطلوب';
    if (!formData.startupName.trim()) newErrors.startupName = 'اسم المشروع مطلوب';
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'تنسيق البريد الإلكتروني غير صحيح';
    }
    
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'رقم الجوال مطلوب';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'رقم الجوال يجب أن يكون سعودياً صحيحاً (مثال: 05xxxxxxxx)';
    }

    if (!formData.startupDescription.trim()) {
      newErrors.startupDescription = 'وصف الفكرة مطلوب لتقييم المشروع';
    } else if (formData.startupDescription.length < 20) {
      newErrors.startupDescription = 'الوصف قصير جداً، يرجى تقديم تفاصيل أكثر (20 حرفاً على الأقل)';
    }
    
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'يجب الموافقة على الشروط والأحكام للمتابعة';
    }

    if (!formData.agreedToContract) {
      newErrors.agreedToContract = 'يجب الموافقة على بنود عقد الاحتضان للمتابعة';
    }

    const expectedName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    if (!formData.signedContractName.trim()) {
      newErrors.signedContractName = 'التوقيع الرقمي مطلوب';
    } else if (formData.signedContractName.trim() !== expectedName) {
      newErrors.signedContractName = `التوقيع يجب أن يطابق الاسم المدخل: (${expectedName})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyzeIdea = async () => {
    if (!formData.startupDescription || formData.startupDescription.length < 20) {
      setErrors(prev => ({ 
        ...prev, 
        startupDescription: 'يرجى كتابة وصف مفصل للفكرة (20 حرفاً على الأقل) قبل التحليل' 
      }));
      playErrorSound();
      return;
    }
    
    setErrors(prev => {
      const { startupDescription, ...rest } = prev;
      return rest;
    });

    setIsAnalyzing(true);
    try {
      const tempProfile: ApplicantProfile = {
        codeName: `${formData.firstName} ${formData.lastName}`,
        projectStage: 'Idea',
        sector: formData.industry,
        goal: 'Initial Analysis',
        techLevel: 'Medium'
      };
      const result = await evaluateProjectIdea(formData.startupDescription, tempProfile);
      setAnalysisResult(result);
      playCelebrationSound();
    } catch (e) {
      playErrorSound();
      alert("عذراً، فشل التحليل. يرجى التأكد من اتصال الإنترنت.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onRegister({
        ...formData,
        contractSignedAt: new Date().toISOString()
      });
    } else {
      playErrorSound();
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const today = new Date().toLocaleDateString('ar-SA');

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans text-white" dir="rtl">
      <style>{`
        .contract-scroll::-webkit-scrollbar { width: 6px; }
        .contract-scroll::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
        .contract-scroll { scroll-behavior: smooth; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>

      {/* Side Brand Panel */}
      <div className="hidden lg:flex lg:w-1/3 relative bg-slate-900 flex-col justify-between p-12 text-white border-l border-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter">AI Accelerator</span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6">مرحلة <br/><span className="text-blue-500">التعاقد الذكي.</span></h1>
          <p className="text-lg text-slate-400 max-w-xs">نضمن لك بيئة قانونية واضحة من اليوم الأول لنركز معاً على بناء المنتج ونمو الشركة.</p>
        </div>
        
        <div className="relative z-10 space-y-6">
           <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl backdrop-blur-md">
              <h4 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-2">النظام القضائي</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">تخضع هذه الاتفاقية لأنظمة وقوانين المملكة العربية السعودية وتعتبر ملزمة للطرفين فور التوقيع الرقمي.</p>
           </div>
        </div>
      </div>

      {/* Main Registration Area */}
      <div className="w-full lg:w-2/3 flex flex-col p-6 md:p-12 overflow-y-auto bg-slate-950">
        <div className="max-w-3xl w-full mx-auto animate-fade-in-up">
          <header className="mb-12">
            <h2 className="text-4xl font-black mb-2">بوابة رائد الأعمال</h2>
            <p className="text-slate-400">يرجى إكمال البيانات تمهيداً لتوقيع عقد الاحتضان الرسمي.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-12 pb-20">
            {/* Section 1: User Data */}
            <div className="space-y-8">
               <h3 className="text-xl font-black text-blue-500 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-sm">1</span>
                  البيانات الشخصية والمهنية
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">الاسم الأول</label>
                  <input 
                    name="firstName"
                    className={`w-full p-4 bg-white/5 border rounded-2xl outline-none transition-all ${errors.firstName ? 'border-rose-500 bg-rose-500/5 animate-shake' : 'border-white/10 focus:border-blue-500'}`}
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})} 
                  />
                  {errors.firstName && <p className="text-[10px] font-bold text-rose-500 px-1">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">اللقب (العائلة)</label>
                  <input 
                    name="lastName"
                    className={`w-full p-4 bg-white/5 border rounded-2xl outline-none transition-all ${errors.lastName ? 'border-rose-500 bg-rose-500/5 animate-shake' : 'border-white/10 focus:border-blue-500'}`}
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                  />
                  {errors.lastName && <p className="text-[10px] font-bold text-rose-500 px-1">{errors.lastName}</p>}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">اسم المشروع / الشركة الناشئة</label>
                  <input 
                    name="startupName"
                    className={`w-full p-4 bg-white/5 border rounded-2xl outline-none transition-all ${errors.startupName ? 'border-rose-500 bg-rose-500/5 animate-shake' : 'border-white/10 focus:border-blue-500'}`}
                    value={formData.startupName} 
                    onChange={e => setFormData({...formData, startupName: e.target.value})} 
                  />
                  {errors.startupName && <p className="text-[10px] font-bold text-rose-500 px-1">{errors.startupName}</p>}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">وصف الفكرة</label>
                  <textarea 
                    name="startupDescription"
                    className={`w-full h-32 p-4 bg-white/5 border rounded-2xl outline-none transition-all resize-none ${errors.startupDescription ? 'border-rose-500 bg-rose-500/5 animate-shake' : 'border-white/10 focus:border-blue-500'}`}
                    value={formData.startupDescription} 
                    onChange={e => setFormData({...formData, startupDescription: e.target.value})} 
                  />
                  {errors.startupDescription && <p className="text-[10px] font-bold text-rose-500 px-1">{errors.startupDescription}</p>}
                  <button type="button" onClick={handleAnalyzeIdea} disabled={isAnalyzing} className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest mt-1">
                     {isAnalyzing ? 'جاري التحليل...' : '✨ تحليل ذكي مبدئي للفكرة (اختياري)'}
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">البريد الإلكتروني الرسمي</label>
                  <input 
                    name="email"
                    type="email" 
                    className={`w-full p-4 bg-white/5 border rounded-2xl outline-none transition-all ${errors.email ? 'border-rose-500 bg-rose-500/5 animate-shake' : 'border-white/10 focus:border-blue-500'}`}
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                  {errors.email && <p className="text-[10px] font-bold text-rose-500 px-1">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">رقم الجوال (السعودية)</label>
                  <input 
                    name="phone"
                    className={`w-full p-4 bg-white/5 border rounded-2xl outline-none transition-all ${errors.phone ? 'border-rose-500 bg-rose-500/5 animate-shake' : 'border-white/10 focus:border-blue-500'}`}
                    placeholder="05xxxxxxxx" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                  {errors.phone && <p className="text-[10px] font-bold text-rose-500 px-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: The Formal Contract */}
            <div className="pt-10 border-t border-white/5 space-y-8">
               <h3 className="text-xl font-black text-blue-500 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-sm">2</span>
                  عقد الاحتضان والتسريع الافتراضي
               </h3>
               
               <div className={`bg-white text-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden border transition-all ${errors.agreedToTerms || errors.agreedToContract || errors.signedContractName ? 'border-rose-500' : 'border-slate-200'}`}>
                  <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                     <span className="font-black text-slate-400 text-xs uppercase tracking-widest">Official Legal Document</span>
                     <span className="font-bold text-blue-600 text-xs">تاريخ العقد: {today}</span>
                  </div>

                  <div className="p-8 md:p-12 h-96 overflow-y-auto contract-scroll text-sm leading-loose text-slate-700 font-medium">
                     <div className="text-center mb-8">
                        <h4 className="text-2xl font-black text-slate-900 underline underline-offset-8 decoration-blue-500">عقد احتضان وتسريع افتراضي</h4>
                        <p className="mt-4 text-slate-500 font-bold">الحمد لله وحده، والصلاة والسلام على من لا نبي بعده، وبعد:</p>
                     </div>

                     <p className="mb-6">تم بعون الله وتوفيقه في يوم ({new Date().toLocaleDateString('ar-SA', {weekday: 'long'})}) الموافق ({today}) إبرام هذا العقد بين كل من:</p>
                     
                     <div className="space-y-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <p><strong>أولًا: الطرف الأول (الحاضنة / المسرّعة):</strong></p>
                        <p>الاسم: مسرعة بيزنس ديفلوبرز الذكية (Business Developers AI Accelerator)</p>
                        <p>العنوان: الرياض، المملكة العربية السعودية</p>
                        <p>ويشار إليها في هذا العقد بـ “الحاضنة”.</p>
                        
                        <div className="h-px bg-slate-200 my-4"></div>

                        <p><strong>ثانيًا: الطرف الثاني (المستفيد / المشروع المحتضَن):</strong></p>
                        <p>اسم صاحب المشروع: {formData.firstName || '____'} {formData.lastName || '____'}</p>
                        <p>اسم الشركة / المشروع: {formData.startupName || '________________'}</p>
                        <p>العنوان: {formData.email || '________________'}</p>
                        <p>ويشار إليه في هذا العقد بـ “المحتضَن”.</p>
                     </div>

                     <div className="space-y-6">
                        <p><strong>المادة الأولى: التمهيد</strong><br/>يُعد التمهيد أعلاه جزءًا لا يتجزأ من هذا العقد ومكملًا ومفسرًا له.</p>
                        <p><strong>المادة الثانية: موضوع العقد</strong><br/>يهدف هذا العقد إلى احتضان المشروع المملوك للطرف الثاني ضمن برنامج احتضان افتراضي تقدمه الحاضنة، وتمكين المحتضَن من تطوير فكرته أو مشروعه الناشئ مهنيًا، تقنيًا، وتشغيليًا.</p>
                        <p><strong>المادة الثالثة: مدة برنامج الاحتضان</strong><br/>مدة برنامج الاحتضان هي (3) أشهر تبدأ من تاريخ توقيع هذا العقد. ويلتزم المحتضَن بالاستمرار في البرنامج حتى نهايته.</p>
                        <p><strong>المادة الرابعة: التزامات المحتضَن</strong><br/>الالتزام الكامل بحضور وتنفيذ جميع متطلبات برنامج الاحتضان، وتزويد الحاضنة بجميع المعلومات والبيانات اللازمة، وعدم التعاقد مع جهة منافسة خلال مدة الاحتضان.</p>
                        <p><strong>المادة الخامسة: التزامات الحاضنة</strong><br/>تقديم الإرشاد، الدعم الفني، الاستشارات، والمتابعة وفق البرنامج المعتمد، وتوفير بيئة احتضان افتراضية مناسبة.</p>
                        <p><strong>المادة السادسة: مرحلة التسريع (اختيارية)</strong><br/>بعد إتمام الاحتضان بنجاح، يحق للمحتضَن طلب الانضمام لبرنامج التسريع. وفي حال الموافقة، يحق للمحتضنة تمويل تطوير المنتج التقني مقابل نسبة 15% من ملكية الشركة أو قيمة مالية يتفق عليها لاحقاً.</p>
                        <p><strong>المادة السابعة: الملكية الفكرية</strong><br/>تعود ملكية الفكرة الأساسية للمشروع للمحتضَن. ولا يحق للمحتضَن استخدام أي أدوات أو منهجيات خاصة بالحاضنة خارج إطار التعاون.</p>
                        <p><strong>المادة الثامنة: السرية</strong><br/>يلتزم الطرفان بالمحافظة على سرية جميع المعلومات والبيانات وعدم إفشائها لأي طرف ثالث.</p>
                        <p><strong>المادة التاسعة: إنهاء العقد</strong><br/>يحق للحاضنة إنهاء العقد في حال إخلال المحتضَن بالتزاماته دون أي التزام مالي أو تعويض.</p>
                        <p><strong>المادة العاشرة: أحكام عامة</strong><br/>يخضع هذا العقد لأنظمة وقوانين المملكة العربية السعودية. أي نزاع يتم حله وديًا، وفي حال تعذّر ذلك يكون الاختصاص للمحاكم المختصة.</p>
                     </div>
                  </div>

                  <div className="p-8 md:p-12 border-t border-slate-100 bg-slate-50/50">
                     <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-4">
                           <input 
                              type="checkbox" 
                              id="terms"
                              name="agreedToTerms"
                              checked={formData.agreedToTerms} 
                              onChange={e => setFormData({...formData, agreedToTerms: e.target.checked})}
                              className={`w-6 h-6 accent-blue-600 cursor-pointer shadow-sm ${errors.agreedToTerms ? 'ring-2 ring-rose-500' : ''}`}
                           />
                           <label htmlFor="terms" className="text-sm font-black text-slate-900 cursor-pointer select-none">أوافق على الشروط والأحكام العامة للمنصة وسياسة الخصوصية.</label>
                        </div>
                        {errors.agreedToTerms && <p className="text-[10px] font-bold text-rose-500 pr-10">{errors.agreedToTerms}</p>}

                        <div className="flex items-center gap-4">
                           <input 
                              type="checkbox" 
                              id="contract-agreement"
                              name="agreedToContract"
                              checked={formData.agreedToContract} 
                              onChange={e => setFormData({...formData, agreedToContract: e.target.checked})}
                              className={`w-6 h-6 accent-blue-600 cursor-pointer shadow-sm ${errors.agreedToContract ? 'ring-2 ring-rose-500' : ''}`}
                           />
                           <label htmlFor="contract-agreement" className="text-sm font-black text-slate-900 cursor-pointer select-none">أقر أنا الطرف الثاني بقبول كافة بنود عقد الاحتضان المذكور أعلاه والالتزام بها.</label>
                        </div>
                        {errors.agreedToContract && <p className="text-[10px] font-bold text-rose-500 pr-10">{errors.agreedToContract}</p>}
                     </div>

                     <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-1">التوقيع الرقمي (اكتب اسمك الكامل للمطابقة)</label>
                        <div className="relative group">
                           <input 
                              name="signedContractName"
                              className={`w-full p-6 bg-white border-2 rounded-[1.5rem] outline-none text-2xl font-serif italic text-blue-900 placeholder-slate-200 transition-all shadow-inner
                                 ${errors.signedContractName ? 'border-rose-500 bg-rose-50 animate-shake' : 'border-slate-200 focus:border-blue-500'}
                              `}
                              placeholder="الاسم الأول + اللقب"
                              value={formData.signedContractName}
                              onChange={e => setFormData({...formData, signedContractName: e.target.value})}
                           />
                           {formData.signedContractName && formData.signedContractName.trim() === `${formData.firstName.trim()} ${formData.lastName.trim()}` && formData.firstName !== '' ? (
                              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl animate-fade-in">
                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                                 <span className="text-xs font-black uppercase tracking-widest">Verified</span>
                              </div>
                           ) : formData.signedContractName && (
                              <p className="text-[10px] font-bold text-rose-500 mt-2 pr-2">{errors.signedContractName || 'الاسم لا يطابق البيانات المدخلة أعلاه'}</p>
                           )}
                           {errors.signedContractName && !formData.signedContractName && <p className="text-[10px] font-bold text-rose-500 mt-2 pr-2">{errors.signedContractName}</p>}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* General Error Feedback Box */}
            {Object.keys(errors).length > 0 && (
               <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl animate-shake">
                  <p className="text-xs font-black text-rose-500 mb-3 uppercase tracking-widest">يرجى تصحيح التنبيهات الموضحة في النموذج أعلاه</p>
                  <ul className="text-xs text-rose-400 space-y-1.5 list-disc list-inside font-bold">
                     <li>يرجى التأكد من تعبئة كافة الحقول المطلوبة بشكل صحيح.</li>
                     <li>تأكد من مطابقة التوقيع الرقمي لاسمك المسجل والموافقة على كافة البنود.</li>
                  </ul>
               </div>
            )}

            <button 
              type="submit" 
              className="w-full py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-[2.2rem] font-black text-xl shadow-2xl shadow-blue-900/30 transition-all transform active:scale-95 flex items-center justify-center gap-4 group"
            >
              <span>اعتماد العقد والدخول</span>
              <svg className="w-7 h-7 transform rotate-180 group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>
        </div>
      </div>

      {/* Initial AI Validation Result Modal */}
      {analysisResult && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in" dir="rtl">
           <div className="bg-slate-900 rounded-[3rem] max-w-2xl w-full shadow-2xl border border-white/10 overflow-hidden animate-fade-in-up">
              <div className="bg-slate-800 p-8 md:p-10 border-b border-white/5 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">✨</div>
                    <div>
                       <h3 className="text-2xl font-black text-white">التحقق المبدئي من الفكرة</h3>
                       <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">AI Validation Hub</p>
                    </div>
                 </div>
                 <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white transition-colors">✕</button>
              </div>

              <div className="p-8 md:p-10 space-y-8 overflow-y-auto max-h-[60vh] contract-scroll">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">درجة الجدوى الأولية</span>
                    <div className="text-4xl font-black text-blue-500">{analysisResult.totalScore}<span className="text-lg text-slate-600 ml-1">/100</span></div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <h4 className="text-xs font-black text-green-500 uppercase tracking-widest pr-2">نقاط القوة</h4>
                       <div className="space-y-2">
                          {analysisResult.strengths.map((s, i) => (
                            <div key={i} className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl text-xs font-medium text-green-100 flex items-start gap-3">
                               <span className="text-green-500">✓</span> {s}
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest pr-2">مخاطر محتملة</h4>
                       <div className="space-y-2">
                          {analysisResult.weaknesses.map((w, i) => (
                            <div key={i} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-xs font-medium text-rose-100 flex items-start gap-3">
                               <span className="text-rose-500">!</span> {w}
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="p-6 bg-white/5 border border-white/5 rounded-3xl relative group">
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">رأي المستشار الذكي</div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{analysisResult.aiOpinion}"</p>
                 </div>
              </div>

              <div className="p-8 md:p-10 bg-slate-800/50 border-t border-white/5 flex flex-col gap-4">
                 <button 
                  onClick={() => setAnalysisResult(null)}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                 >
                   تعديل وصف الفكرة بناءً على النتائج
                 </button>
                 <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">يمكنك دائماً العودة لهذا التحليل لاحقاً في لوحة التحكم</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
