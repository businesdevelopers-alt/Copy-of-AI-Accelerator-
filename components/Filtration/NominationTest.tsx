
import React, { useState, useEffect } from 'react';
import { NominationData, NominationResult } from '../../types';
import { evaluateNominationForm } from '../../services/geminiService';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../../services/audioService';

interface NominationTestProps {
  onComplete: (result: NominationResult) => void;
  onReject: (reason: string) => void;
}

export const NominationTest: React.FC<NominationTestProps> = ({ onComplete, onReject }) => {
  const [step, setStep] = useState(0); // 0 is Intro
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<'IDLE' | 'COLLECTING' | 'AI_THINKING' | 'DECIDING'>('IDLE');
  const [formData, setFormData] = useState<Partial<NominationData>>({
    targetCustomerType: [],
    currentResources: [],
    tractionEvidence: [],
    hasCommercialRegister: 'IN_PROGRESS',
    hasTechnicalPartner: false,
    isCommitted10Hours: true,
    marketSize: 'MEDIUM',
    productStage: 'IDEA',
    userCount: '0',
    revenueModel: 'NOT_SET',
    weeklyHours: '10-20',
    agreesToWeeklySession: true,
    agreesToKPIs: true,
  });

  const calculateScores = (): number => {
    let score = 0;
    
    // Section B (Max 25)
    if (formData.problemStatement && formData.problemStatement.length > 50) score += 10;
    if ((formData.targetCustomerType?.length || 0) > 0) score += 5;
    if (formData.marketSize === 'LARGE') score += 5;
    else if (formData.marketSize === 'MEDIUM') score += 3;
    if (formData.whyNow && formData.whyNow.length > 30) score += 5;

    // Section C (Max 25)
    if (formData.productStage === 'TRACTION') score += 10;
    else if (formData.productStage === 'MVP') score += 7;
    else if (formData.productStage === 'PROTOTYPE') score += 4;
    if (formData.demoUrl) score += 5;
    if (formData.executionPlan === 'WEEKLY') score += 10;
    else if (formData.executionPlan === 'GENERAL') score += 5;

    // Section D (Max 25)
    if (formData.userCount === '50+') score += 10;
    else if (formData.userCount === '11-50') score += 5;
    if ((formData.tractionEvidence?.length || 0) > 0) score += 5;
    if (formData.revenueModel !== 'NOT_SET') score += 5;
    if (formData.customerAcquisitionPath) score += 5;

    // Section E (Max 25)
    if (formData.weeklyHours === '20+') score += 10;
    else if (formData.weeklyHours === '10-20') score += 7;
    if (formData.agreesToWeeklySession) score += 5;
    if (formData.agreesToKPIs) score += 5;
    if (formData.incubationReason && formData.incubationReason.length > 20) score += 5;

    return Math.min(score, 80); 
  };

  const handleNext = () => {
    if (step === 1 && !formData.isCommitted10Hours) {
      onReject("عدم التفرغ الكافي للمشروع (أقل من 10 ساعات أسبوعياً)");
      return;
    }
    setStep(prev => prev + 1);
    playPositiveSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setAnalysisPhase('AI_THINKING');
    
    try {
      // Step 1: AI Analysis Request
      const aiResult = await evaluateNominationForm(formData as NominationData);
      
      // Step 2: Delay for UX "Thinking" feel
      await new Promise(r => setTimeout(r, 2000));
      setAnalysisPhase('DECIDING');
      await new Promise(r => setTimeout(r, 1500));

      // Step 3: Logic Scoring
      const baseScore = calculateScores();
      const finalScore = baseScore + aiResult.aiScore;

      let finalCategory: NominationResult['category'] = 'REJECTION';
      if (finalScore >= 80) finalCategory = 'DIRECT_ADMISSION';
      else if (finalScore >= 70) finalCategory = 'INTERVIEW';
      else if (finalScore >= 50) finalCategory = 'PRE_INCUBATION';

      const manualRedFlags: string[] = [];
      if (formData.weeklyHours === 'LESS_5') manualRedFlags.push("التزام زمني منخفض جداً");
      if (formData.revenueModel === 'NOT_SET') manualRedFlags.push("نموذج الربح غير محدد");
      
      onComplete({
        totalScore: finalScore,
        category: finalCategory,
        redFlags: [...aiResult.redFlags, ...manualRedFlags],
        aiAnalysis: aiResult.aiAnalysis
      });
      
      if (finalScore >= 70) playCelebrationSound();
    } catch (e) {
      console.error(e);
      playErrorSound();
      alert("حدث خطأ أثناء معالجة الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleList = (field: keyof NominationData, val: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(val) ? current.filter(x => x !== val) : [...current, val];
    setFormData({ ...formData, [field]: updated });
  };

  if (step === 0) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 text-brand-primary text-right" dir="rtl">
        <div className="max-w-2xl w-full space-y-10 animate-fade-in-up">
           <div className="text-center">
              <div className="w-24 h-24 bg-brand-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-primary/20 transform rotate-3">
                 <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <h1 className="text-3xl font-bold mb-4">اختبار الترشيح الذكي</h1>
              <p className="text-brand-gray text-xl font-medium max-w-lg mx-auto leading-relaxed">
                أهلاً بك في المرحلة الثانية. سنقوم الآن بتقييم مشروعك وجاهزيتك عبر ٥ أقسام استراتيجية. درجتك في هذا الاختبار تحدد أهليتك لدخول المسرعة.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-brand-primary/5 border border-brand-primary/20 p-6 rounded-3xl">
                 <span className="text-2xl mb-2 block">📊</span>
                 <h4 className="font-bold text-sm mb-1">تقييم 360 درجة</h4>
                 <p className="text-xs text-slate-500">نحلل المشكلة، السوق، المنتج، والجذب بشكل متكامل.</p>
              </div>
              <div className="bg-brand-primary/5 border border-brand-primary/20 p-6 rounded-3xl">
                 <span className="text-2xl mb-2 block">🤖</span>
                 <h4 className="font-bold text-sm mb-1">ذكاء Gemini 3 Pro</h4>
                 <p className="text-xs text-slate-500">تتم معالجة بياناتك عبر محرك ذكاء اصطناعي لضمان الموضوعية.</p>
              </div>
           </div>

           <button 
             onClick={() => setStep(1)}
             className="w-full py-6 bg-brand-primary hover:bg-brand-hover text-white rounded-[2rem] font-bold text-xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-4"
           >
             <span>بدء اختبار القبول</span>
             <svg className="w-6 h-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
           </button>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-brand-primary text-center" dir="rtl">
        <div className="relative w-48 h-48 mb-12">
           <div className="absolute inset-0 border-8 border-brand-primary/10 rounded-full"></div>
           <div className="absolute inset-0 border-8 border-brand-primary rounded-full border-t-transparent animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">🧠</div>
        </div>
        <div className="space-y-4 max-w-md animate-fade-in">
           <h2 className="text-3xl font-bold tracking-tight">
             {analysisPhase === 'AI_THINKING' ? 'جاري تحليل البيانات...' : 'اتخاذ القرار النهائي...'}
           </h2>
           <p className="text-slate-500 font-medium leading-relaxed">
             {analysisPhase === 'AI_THINKING' 
               ? 'يقوم محرك Gemini 3 Pro بفحص مدخلاتك ومقارنتها بمعايير السوق الحالية.' 
               : 'تقوم لجنة القبول الافتراضية بمراجعة نقاط القوة والمخاطر في طلبك.'}
           </p>
        </div>
        <div className="mt-12 flex gap-2">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center py-12 px-4" dir="rtl">
      <div className="max-w-3xl w-full">
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-10 px-4">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-brand-primary text-[10px] font-bold">BD</div>
              <h2 className="text-sm font-bold text-brand-primary uppercase tracking-widest">اختبار الترشيح</h2>
           </div>
           <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">المرحلة 02 / 06</span>
        </div>

        {/* Progress Stepper */}
        <div className="flex justify-between mb-12 relative px-4">
           <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0"></div>
           {[1, 2, 3, 4, 5].map(s => (
             <div key={s} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-brand-primary text-white shadow-lg' : 'bg-white border-2 border-slate-200 text-brand-gray'}`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`text-[9px] font-bold mt-2 ${step >= s ? 'text-brand-primary' : 'text-brand-gray'}`}>
                  {['الأساسيات', 'تحليل السوق', 'خطة المنتج', 'مؤشرات الجذب', 'الالتزام والنمو'][s-1]}
                </span>
             </div>
           ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
           <div className="p-8 md:p-12">
              {step === 1 && (
                <div className="space-y-8 animate-fade-in">
                   <div className="space-y-2">
                     <h2 className="text-3xl font-bold text-slate-900">القسم A: بيانات أساسية</h2>
                     <p className="text-slate-500 font-medium">نحتاج لتوثيق هوية المشروع ومؤسسيه.</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-gray uppercase tracking-widest pr-1">اسم الشركة / المشروع</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary focus:bg-white transition-all font-bold" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="الاسم التجاري المقترح" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-gray uppercase tracking-widest pr-1">اسم المؤسس</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary focus:bg-white transition-all font-bold" value={formData.founderName} onChange={e => setFormData({...formData, founderName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-gray uppercase tracking-widest pr-1">المدينة / الدولة</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary focus:bg-white transition-all font-bold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-gray uppercase tracking-widest pr-1">رابط العرض التوضيحي (إن وجد)</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary focus:bg-white transition-all font-bold" placeholder="PDF or Website Link" value={formData.pitchDeckUrl} onChange={e => setFormData({...formData, pitchDeckUrl: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-6 pt-4">
                      <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                         <span className="font-bold text-brand-primary text-sm block">هل لديك سجل تجاري أو كيان قانوني؟</span>
                         <div className="grid grid-cols-3 gap-3">
                            {[
                              { id: 'YES', label: 'نعم' },
                              { id: 'NO', label: 'لا' },
                              { id: 'IN_PROGRESS', label: 'قيد الإجراء' }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setFormData({...formData, hasCommercialRegister: opt.id as any})}
                                className={`py-4 px-2 rounded-2xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                                  formData.hasCommercialRegister === opt.id 
                                  ? 'bg-white border-brand-primary text-brand-primary shadow-md' 
                                  : 'bg-white text-brand-gray border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                         <span className="font-bold text-brand-primary text-sm">هل لديك شريك تقني أو فريق تطوير؟</span>
                         <button onClick={() => setFormData({...formData, hasTechnicalPartner: !formData.hasTechnicalPartner})} className={`w-14 h-7 rounded-full relative transition-colors ${formData.hasTechnicalPartner ? 'bg-brand-primary' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${formData.hasTechnicalPartner ? 'left-1' : 'left-8'}`}></div>
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-fade-in">
                   <div className="space-y-2">
                     <h2 className="text-3xl font-bold text-slate-900">القسم B: السوق والمشكلة</h2>
                     <p className="text-slate-500 font-medium">الذكاء الاصطناعي سيقوم بتحليل منطق الحل الخاص بك.</p>
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-bold text-brand-primary flex justify-between">
                         <span>اشرح المشكلة التي تحلها بدقة (أهم سؤال)</span>
                         <span className="text-[10px] text-brand-hover uppercase">AI Key Indicator</span>
                      </label>
                      <textarea className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:border-brand-primary focus:bg-white transition-all font-medium text-lg resize-none shadow-inner" placeholder="ما هو الألم الحقيقي الذي يعاني منه العميل وكيف تنهيه؟" value={formData.problemStatement} onChange={e => setFormData({...formData, problemStatement: e.target.value})} />
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-bold text-brand-primary">من هو العميل المستهدف؟ (اختر المتعدد)</label>
                      <div className="flex flex-wrap gap-2">
                        {['أفراد (B2C)', 'شركات ناشئة', 'شركات كبرى (B2B)', 'جهات حكومية', 'متاجر إلكترونية'].map(c => (
                          <button key={c} onClick={() => toggleList('targetCustomerType', c)} className={`px-6 py-3 rounded-2xl text-xs font-bold border-2 transition-all ${formData.targetCustomerType?.includes(c) ? 'bg-brand-primary border-brand-primary text-white shadow-lg' : 'bg-white border-slate-100 text-brand-gray hover:border-slate-200'}`}>{c}</button>
                        ))}
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-brand-gray uppercase pr-1">حجم السوق التقريبي</label>
                         <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none" value={formData.marketSize} onChange={e => setFormData({...formData, marketSize: e.target.value as any})}>
                            <option value="SMALL">صغير (أقل من 10M SAR)</option>
                            <option value="MEDIUM">متوسط (10-100M SAR)</option>
                            <option value="LARGE">كبير (أكثر من 100M SAR)</option>
                            <option value="UNKNOWN">لا أعرف حالياً</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-brand-gray uppercase pr-1">عامل الضرورة (لماذا الآن؟)</label>
                         <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" placeholder="مثال: تغير سلوك المستهلك..." value={formData.whyNow} onChange={e => setFormData({...formData, whyNow: e.target.value})} />
                      </div>
                   </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-fade-in">
                   <div className="space-y-2">
                     <h2 className="text-3xl font-bold text-slate-900">القسم C: المنتج والتنفيذ</h2>
                     <p className="text-slate-500 font-medium">كيف ستحول الفكرة إلى واقع تقني ملموس؟</p>
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-bold text-brand-primary">المرحلة الحالية للمنتج</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                         {[
                           {id: 'IDEA', label: 'فكرة مكتوبة'},
                           {id: 'PROTOTYPE', label: 'نموذج أولي'},
                           {id: 'MVP', label: 'MVP متاح'},
                           {id: 'TRACTION', label: 'منتج + نمو'}
                         ].map(s => (
                           <button key={s.id} onClick={() => setFormData({...formData, productStage: s.id as any})} className={`p-5 rounded-2xl text-xs font-bold border-2 transition-all flex flex-col items-center gap-2 ${formData.productStage === s.id ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-slate-50 text-brand-gray hover:border-slate-100'}`}>{s.label}</button>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-bold text-brand-primary">أهم 3 ميزات سيتم بناؤها في 8 أسابيع</label>
                      <textarea className="w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:border-brand-primary focus:bg-white transition-all font-bold shadow-inner resize-none" placeholder="1. ... 2. ... 3. ..." value={formData.topFeatures} onChange={e => setFormData({...formData, topFeatures: e.target.value})} />
                   </div>
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <span className="font-bold text-brand-primary text-sm">منهجية التنفيذ الأسبوعية</span>
                      <select className="bg-white p-3 rounded-xl border border-slate-200 font-bold text-xs outline-none" value={formData.executionPlan} onChange={e => setFormData({...formData, executionPlan: e.target.value as any})}>
                         <option value="NONE">لا توجد حالياً</option>
                         <option value="GENERAL">خطة عامة مرنة</option>
                         <option value="WEEKLY">خطة عمل أسبوعية مفصلة</option>
                      </select>
                   </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-fade-in">
                   <div className="space-y-2">
                     <h2 className="text-3xl font-bold text-slate-900">القسم D: مؤشرات الجذب والإيرادات</h2>
                     <p className="text-slate-500 font-medium">هل السوق مستعد للدفع مقابل حلك؟</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className="text-sm font-bold text-brand-primary">قاعدة المستخدمين الحالية</label>
                         <div className="grid grid-cols-2 gap-2">
                            {['0 (بداية)', '1-10', '11-50', '50+ مستخدم'].map(v => (
                              <button key={v} onClick={() => setFormData({...formData, userCount: v as any})} className={`p-4 rounded-xl text-xs font-bold border-2 transition-all ${formData.userCount === v ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-md' : 'border-slate-50 text-brand-gray hover:border-slate-100'}`}>{v}</button>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-4">
                         <label className="text-sm font-bold text-brand-primary">نموذج تحقيق الربح</label>
                         <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none" value={formData.revenueModel} onChange={e => setFormData({...formData, revenueModel: e.target.value as any})}>
                            <option value="NOT_SET">غير محدد بعد</option>
                            <option value="SUBSCRIPTION">اشتراك دوري (SaaS)</option>
                            <option value="COMMISSION">عمولة من العمليات</option>
                            <option value="ANNUAL">ترخيص سنوي</option>
                            <option value="PAY_PER_USE">دفع لكل استخدام</option>
                         </select>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-bold text-brand-primary">خطة الوصول لأول 20 عميل حقيقي</label>
                      <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold shadow-inner" placeholder="ما هي قنوات البيع المباشرة التي ستعتمد عليها؟" value={formData.customerAcquisitionPath} onChange={e => setFormData({...formData, customerAcquisitionPath: e.target.value})} />
                   </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8 animate-fade-in">
                   <div className="space-y-2">
                     <h2 className="text-3xl font-bold text-slate-900">القسم E: الالتزام والملاءمة</h2>
                     <p className="text-slate-500 font-medium">الريادة تتطلب شغفاً وانضباطاً عالياً.</p>
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-bold text-brand-primary">لماذا تعتقد أنك تناسب مسرعة بيزنس ديفلوبرز؟</label>
                      <textarea className="w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:border-brand-primary font-bold shadow-inner resize-none" value={formData.incubationReason} onChange={e => setFormData({...formData, incubationReason: e.target.value})} />
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-bold text-brand-primary">ساعات الالتزام الأسبوعية بالبرنامج</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          {id: 'LESS_5', label: '< 5س'},
                          {id: '5-10', label: '5-10س'},
                          {id: '10-20', label: '10-20س'},
                          {id: '20+', label: '20+ س'}
                        ].map(h => (
                          <button key={h.id} onClick={() => setFormData({...formData, weeklyHours: h.id as any})} className={`p-4 rounded-2xl text-[10px] font-bold border-2 transition-all ${formData.weeklyHours === h.id ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-md' : 'border-slate-50 text-brand-gray'}`}>{h.label}</button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-4 pt-6 border-t border-slate-100">
                      <label className="flex items-center gap-4 group cursor-pointer">
                         <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.agreesToWeeklySession ? 'bg-brand-primary border-brand-primary text-white' : 'border-slate-200 bg-white group-hover:border-brand-primary'}`}>
                           {formData.agreesToWeeklySession && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                         </div>
                         <input type="checkbox" className="hidden" checked={formData.agreesToWeeklySession} onChange={e => setFormData({...formData, agreesToWeeklySession: e.target.checked})} />
                         <span className="text-xs font-bold text-brand-primary">أتعهد بحضور كافة الجلسات الإرشادية الأسبوعية.</span>
                      </label>
                      <label className="flex items-center gap-4 group cursor-pointer">
                         <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.agreesToKPIs ? 'bg-brand-primary border-brand-primary text-white' : 'border-slate-200 bg-white group-hover:border-brand-primary'}`}>
                           {formData.agreesToKPIs && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                         </div>
                         <input type="checkbox" className="hidden" checked={formData.agreesToKPIs} onChange={e => setFormData({...formData, agreesToKPIs: e.target.checked})} />
                         <span className="text-xs font-bold text-brand-primary">أوافق على مشاركة التقارير التشغيلية (KPIs) لمشروعي.</span>
                      </label>
                   </div>
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between gap-4">
                 {step > 1 && (
                    <button onClick={() => setStep(step - 1)} className="px-10 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95">السابق</button>
                 )}
                 <div className="flex-1"></div>
                 {step < 5 ? (
                    <button onClick={handleNext} className="px-16 py-5 bg-brand-primary text-white rounded-[1.8rem] font-bold text-sm shadow-xl shadow-brand-primary/20 hover:bg-brand-primary transition-all transform active:scale-95 flex items-center gap-3">
                       المتابعة
                       <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                 ) : (
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-16 py-5 bg-white text-brand-primary rounded-[1.8rem] font-bold text-sm shadow-xl hover:bg-black transition-all flex items-center gap-4 disabled:opacity-50 active:scale-95">
                       {isSubmitting ? 'جاري التحليل المعمق...' : 'إرسال الاختبار للتقييم'}
                       {!isSubmitting && <span className="text-2xl">🚀</span>}
                    </button>
                 )}
              </div>
           </div>
        </div>
        
        <div className="mt-10 bg-slate-200/50 p-6 rounded-3xl border border-slate-200 text-center">
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">
             End-to-End Encryption • Gemini Pro AI Evaluation Engine • Legal Compliance
           </p>
        </div>
      </div>
    </div>
  );
};
