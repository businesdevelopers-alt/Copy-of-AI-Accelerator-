
import React, { useState } from 'react';
import { NominationData, NominationResult } from '../../types';
import { evaluateNominationForm } from '../../services/geminiService';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../../services/audioService';

interface NominationTestProps {
  onComplete: (result: NominationResult) => void;
  onReject: (reason: string) => void;
}

export const NominationTest: React.FC<NominationTestProps> = ({ onComplete, onReject }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    return Math.min(score, 80); // 80 points from form, 20 from AI text analysis
  };

  const handleNext = () => {
    if (step === 1 && !formData.isCommitted10Hours) {
      onReject("عدم التفرغ الكافي للمشروع (أقل من 10 ساعات أسبوعياً)");
      return;
    }
    setStep(prev => prev + 1);
    playPositiveSound();
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. AI Analysis
      const aiResult = await evaluateNominationForm(formData as NominationData);
      
      // 2. Logic Scoring
      const baseScore = calculateScores();
      const finalScore = baseScore + aiResult.aiScore;

      // 3. Final Category Decision
      let finalCategory: NominationResult['category'] = 'REJECTION';
      if (finalScore >= 80) finalCategory = 'DIRECT_ADMISSION';
      else if (finalScore >= 70) finalCategory = 'INTERVIEW';
      else if (finalScore >= 50) finalCategory = 'PRE_INCUBATION';

      // Red Flags Check (Manual logic addition)
      const manualRedFlags: string[] = [];
      if (formData.weeklyHours === 'LESS_5') manualRedFlags.push("التزام زمني منخفض جداً");
      if (formData.revenueModel === 'NOT_SET') manualRedFlags.push("نموذج الربح غير محدد");
      
      onComplete({
        totalScore: finalScore,
        category: finalCategory,
        redFlags: [...aiResult.redFlags, ...manualRedFlags],
        aiAnalysis: aiResult.aiAnalysis
      });
      playCelebrationSound();
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4" dir="rtl">
      <div className="max-w-3xl w-full">
        {/* Progress Stepper */}
        <div className="flex justify-between mb-12 relative px-4">
           <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0"></div>
           {[1, 2, 3, 4, 5].map(s => (
             <div key={s} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                  {s}
                </div>
                <span className={`text-[10px] font-bold mt-2 ${step >= s ? 'text-blue-600' : 'text-slate-400'}`}>
                  {['أساسيات', 'السوق', 'المنتج', 'الجذب', 'الالتزام'][s-1]}
                </span>
             </div>
           ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
           <div className="p-8 md:p-12">
              {step === 1 && (
                <div className="space-y-8">
                   <h2 className="text-2xl font-black text-slate-900">القسم A: بيانات أساسية</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase">اسم الشركة / المشروع</label>
                        <input className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase">اسم المؤسس</label>
                        <input className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500" value={formData.founderName} onChange={e => setFormData({...formData, founderName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase">المدينة / الدولة</label>
                        <input className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase">رابط العرض التوضيحي (Pitch Deck)</label>
                        <input className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500" placeholder="PDF or Link" value={formData.pitchDeckUrl} onChange={e => setFormData({...formData, pitchDeckUrl: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                         <span className="font-bold text-sm">هل لديك سجل تجاري أو كيان قانوني؟</span>
                         <select className="bg-white p-2 rounded-xl border font-bold text-xs" value={formData.hasCommercialRegister} onChange={e => setFormData({...formData, hasCommercialRegister: e.target.value as any})}>
                            <option value="YES">نعم</option>
                            <option value="NO">لا</option>
                            <option value="IN_PROGRESS">قيد الإجراء</option>
                         </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                         <span className="font-bold text-sm">هل لديك شريك تقني أو قدرة تطوير داخلية؟</span>
                         <button onClick={() => setFormData({...formData, hasTechnicalPartner: !formData.hasTechnicalPartner})} className={`w-12 h-6 rounded-full relative transition-colors ${formData.hasTechnicalPartner ? 'bg-blue-600' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.hasTechnicalPartner ? 'left-1' : 'left-7'}`}></div>
                         </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                         <span className="font-black text-sm text-blue-900">هل أنت متفرغ للمشروع 10 ساعات أسبوعياً؟</span>
                         <button onClick={() => setFormData({...formData, isCommitted10Hours: !formData.isCommitted10Hours})} className={`w-12 h-6 rounded-full relative transition-colors ${formData.isCommitted10Hours ? 'bg-blue-600' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isCommitted10Hours ? 'left-1' : 'left-7'}`}></div>
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                   <h2 className="text-2xl font-black text-slate-900">القسم B: وضوح المشكلة والسوق</h2>
                   <div className="space-y-4">
                      <label className="text-sm font-black text-slate-700">اشرح المشكلة التي تحلها بدقة (سطرين)</label>
                      <textarea className="w-full h-32 p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500 font-medium" placeholder="ما هو الألم الحقيقي الذي يعاني منه العميل؟" value={formData.problemStatement} onChange={e => setFormData({...formData, problemStatement: e.target.value})} />
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-black text-slate-700">من هو العميل المستهدف؟</label>
                      <div className="flex flex-wrap gap-2">
                        {['أفراد', 'شركات صغيرة', 'شركات متوسطة', 'جهات حكومية'].map(c => (
                          <button key={c} onClick={() => toggleList('targetCustomerType', c)} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${formData.targetCustomerType?.includes(c) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{c}</button>
                        ))}
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-black text-slate-400">حجم السوق التقريبي</label>
                         <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={formData.marketSize} onChange={e => setFormData({...formData, marketSize: e.target.value as any})}>
                            <option value="SMALL">صغير (أقل من 10M SAR)</option>
                            <option value="MEDIUM">متوسط (10-100M SAR)</option>
                            <option value="LARGE">كبير (أكثر من 100M SAR)</option>
                            <option value="UNKNOWN">لا أعرف</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-slate-400">لماذا الآن؟</label>
                         <input className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" placeholder="عامل الضرورة اليوم" value={formData.whyNow} onChange={e => setFormData({...formData, whyNow: e.target.value})} />
                      </div>
                   </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                   <h2 className="text-2xl font-black text-slate-900">القسم C: المنتج والتنفيذ</h2>
                   <div className="space-y-4">
                      <label className="text-sm font-black text-slate-700">ما هي مرحلة المنتج الحالية؟</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                         {[
                           {id: 'IDEA', label: 'فكرة'},
                           {id: 'PROTOTYPE', label: 'نموذج أولي'},
                           {id: 'MVP', label: 'MVP بسيط'},
                           {id: 'TRACTION', label: 'منتج + عملاء'}
                         ].map(s => (
                           <button key={s.id} onClick={() => setFormData({...formData, productStage: s.id as any})} className={`p-4 rounded-2xl text-xs font-black border-2 transition-all ${formData.productStage === s.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-50 text-slate-400'}`}>{s.label}</button>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-black text-slate-700">أهم 3 ميزات ستبنيها خلال 8 أسابيع</label>
                      <textarea className="w-full h-24 p-4 bg-slate-50 border rounded-2xl outline-none" placeholder="1. ... 2. ... 3. ..." value={formData.topFeatures} onChange={e => setFormData({...formData, topFeatures: e.target.value})} />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <span className="font-bold text-sm">ما الخطة الأسبوعية للتنفيذ؟</span>
                      <select className="bg-white p-2 rounded-xl border font-bold text-xs" value={formData.executionPlan} onChange={e => setFormData({...formData, executionPlan: e.target.value as any})}>
                         <option value="NONE">لا توجد</option>
                         <option value="GENERAL">خطة عامة</option>
                         <option value="WEEKLY">خطة أسبوعية واضحة</option>
                      </select>
                   </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                   <h2 className="text-2xl font-black text-slate-900">القسم D: الجذب والإيرادات</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className="text-sm font-black text-slate-700">عدد المستخدمين / العملاء</label>
                         <div className="grid grid-cols-2 gap-2">
                            {['0', '1-10', '11-50', '50+'].map(v => (
                              <button key={v} onClick={() => setFormData({...formData, userCount: v as any})} className={`p-3 rounded-xl text-xs font-black border-2 ${formData.userCount === v ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>{v}</button>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-4">
                         <label className="text-sm font-black text-slate-700">نموذج الإيرادات</label>
                         <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={formData.revenueModel} onChange={e => setFormData({...formData, revenueModel: e.target.value as any})}>
                            <option value="NOT_SET">غير محدد</option>
                            <option value="SUBSCRIPTION">اشتراك شهري</option>
                            <option value="COMMISSION">عمولة</option>
                            <option value="ANNUAL">ترخيص سنوي</option>
                            <option value="PAY_PER_USE">دفع لكل استخدام</option>
                         </select>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-black text-slate-700">كيف ستصل لأول 20 عميل؟</label>
                      <input className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" placeholder="قنوات البيع المباشرة" value={formData.customerAcquisitionPath} onChange={e => setFormData({...formData, customerAcquisitionPath: e.target.value})} />
                   </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8">
                   <h2 className="text-2xl font-black text-slate-900">القسم E: الملاءمة والالتزام</h2>
                   <div className="space-y-4">
                      <label className="text-sm font-black text-slate-700">لماذا تريد الاحتضان في مسرعتنا؟</label>
                      <textarea className="w-full h-24 p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.incubationReason} onChange={e => setFormData({...formData, incubationReason: e.target.value})} />
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-black text-slate-700">كم ساعة أسبوعياً ستلتزم للبرنامج؟</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          {id: 'LESS_5', label: '< 5'},
                          {id: '5-10', label: '5-10'},
                          {id: '10-20', label: '10-20'},
                          {id: '20+', label: '20+'}
                        ].map(h => (
                          <button key={h.id} onClick={() => setFormData({...formData, weeklyHours: h.id as any})} className={`p-3 rounded-xl text-[10px] font-black border-2 ${formData.weeklyHours === h.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>{h.label}</button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center gap-3">
                         <input type="checkbox" checked={formData.agreesToWeeklySession} onChange={e => setFormData({...formData, agreesToWeeklySession: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                         <span className="text-xs font-bold text-slate-700 text-right">أوافق على حضور الجلسة الأسبوعية وتسليم المهام.</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="checkbox" checked={formData.agreesToKPIs} onChange={e => setFormData({...formData, agreesToKPIs: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                         <span className="text-xs font-bold text-slate-700 text-right">أوافق على مشاركة البيانات التشغيلية (KPIs).</span>
                      </div>
                   </div>
                </div>
              )}

              <div className="mt-12 pt-8 border-t flex justify-between gap-4">
                 {step > 1 && (
                    <button onClick={() => setStep(step - 1)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">السابق</button>
                 )}
                 <div className="flex-1"></div>
                 {step < 5 ? (
                    <button onClick={handleNext} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all">المتابعة</button>
                 ) : (
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50">
                       {isSubmitting ? 'جاري التحليل الشامل...' : 'إرسال طلب الترشيح'}
                       {!isSubmitting && <span className="text-xl">🚀</span>}
                    </button>
                 )}
              </div>
           </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">جميع البيانات مشفرة وتتم معالجتها عبر Gemini 3 AI</p>
      </div>
    </div>
  );
};
