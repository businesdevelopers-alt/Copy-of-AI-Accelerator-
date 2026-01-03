
import React, { useState } from 'react';
import { AVAILABLE_AGENTS, ProjectBuildData, AIAgent, AgentCategory } from '../../types';
import { runProjectAgents, generatePitchDeck } from '../../services/geminiService';
import { playPositiveSound, playCelebrationSound } from '../../services/audioService';

interface ProjectBuilderProps {
  onComplete: (data: ProjectBuildData) => void;
  onBack: () => void;
}

export const ProjectBuilderMain: React.FC<ProjectBuilderProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProjectBuildData>({
    projectName: '',
    description: '',
    quality: 'Balanced',
    selectedAgents: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const toggleAgent = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAgents: prev.selectedAgents.includes(id) 
        ? prev.selectedAgents.filter(a => a !== id)
        : [...prev.selectedAgents, id]
    }));
  };

  const getAgentsByCategory = (category: AgentCategory) => {
    return AVAILABLE_AGENTS.filter(a => a.category === category);
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!formData.projectName || !formData.description || formData.selectedAgents.length === 0) return;
      setIsGenerating(true);
      try {
        const results = await runProjectAgents(formData.projectName, formData.description, formData.selectedAgents);
        setFormData(prev => ({
          ...prev,
          results: {
            ...prev.results,
            vision: results.vision,
            marketAnalysis: results.market,
            userPersonas: results.users,
            hypotheses: results.hypotheses,
          }
        }));
        playPositiveSound();
        setStep(2);
      } catch (e) {
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
    } else if (step === 2) {
      setIsGenerating(true);
      try {
        const deck = await generatePitchDeck(formData.projectName, formData.description, formData.results);
        setFormData(prev => ({
          ...prev,
          results: {
            ...prev.results,
            pitchDeck: deck
          }
        }));
        playCelebrationSound();
        setStep(3);
      } catch (e) {
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
    } else if (step === 3) {
      setStep(4);
    }
  };

  const qualityOptions = [
    { id: 'Quick', label: 'سريع', tokens: '500T', color: 'bg-green-500' },
    { id: 'Balanced', label: 'متوازن', tokens: '750T', color: 'bg-blue-500' },
    { id: 'Enhanced', label: 'محسّن', tokens: '1250T', color: 'bg-purple-500' },
    { id: 'Professional', label: 'احترافي', tokens: '2000T', color: 'bg-indigo-600' },
    { id: 'Max', label: 'أقصى حد', tokens: '2500T', color: 'bg-slate-900' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white border-l border-slate-200 p-6 flex flex-col gap-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h2 className="font-black text-slate-800">سير عمل بناء المشروع</h2>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 1, label: 'بناء مشروع', sub: 'أنشئ مشروعك باستخدام وكلاء الذكاء الاصطناعي', icon: '🏗️' },
            { id: 2, label: 'توليد الفرضيات', sub: 'توليد الفرضيات المدعوم بالذكاء الاصطناعي', icon: '🔬' },
            { id: 3, label: 'إنشاء العرض التقديمي', sub: 'إنشاء عرض تقديمي ديناميكي (Pitch Deck)', icon: '📽️' },
            { id: 4, label: 'الاكتمال', sub: 'حفظ المشروع ومشاركته', icon: '✅' }
          ].map((item) => (
            <div key={item.id} className={`p-4 rounded-2xl transition-all border-2 ${step === item.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-transparent opacity-60'}`}>
               <div className="flex items-center gap-3 mb-1">
                 <span className="text-xl">{item.icon}</span>
                 <p className="font-bold text-sm text-slate-800">{item.label}</p>
               </div>
               <p className="text-[10px] text-slate-500 mr-8">{item.sub}</p>
            </div>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-100">
           <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2">
             <span>الخطوة {step} من 4</span>
             <span>{Math.round((step / 4) * 100)}%</span>
           </div>
           <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
             <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {step === 1 && (
            <div className="space-y-10 animate-fade-in-up">
              <div className="flex justify-between items-center">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 mb-2">الخطوة 1: بناء مشروعك</h1>
                   <p className="text-slate-500">الإحصاءات • مشروع جديد</p>
                </div>
                <button onClick={onBack} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  إلغاء التأسيس
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Fields */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-3">اسم المشروع</label>
                    <input 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="أدخل اسم مشروعك..."
                      value={formData.projectName}
                      onChange={e => setFormData({...formData, projectName: e.target.value})}
                    />
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-3">وصف المشروع</label>
                    <textarea 
                      className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                      placeholder="صف فكرة مشروعك وتحدياتها..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-4">جودة التوليد</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {qualityOptions.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setFormData({...formData, quality: opt.id as any})}
                          className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${formData.quality === opt.id ? 'border-blue-600 bg-blue-50' : 'border-slate-50 hover:bg-slate-50'}`}
                        >
                          <span className="text-[10px] font-bold text-slate-800">{opt.label}</span>
                          <span className="text-[8px] text-slate-400">{opt.tokens}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-3 text-left italic">قياسي (حد أقصى 500 رمز)</p>
                  </div>

                  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-blue-400 mb-1">مزود خدمة الذكاء الاصطناعي</p>
                      <h4 className="font-bold">Google Gemini API</h4>
                      <p className="text-[10px] text-slate-500">متصل وجاهز</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black">G</div>
                  </div>
                </div>

                {/* Agents Selection */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
                    <h3 className="font-bold text-slate-800 mb-6 flex justify-between items-center">
                      اختر وكلاء الذكاء الاصطناعي 
                      <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-500">9 متاحين</span>
                    </h3>

                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                       {(['Vision', 'Market', 'User', 'Opportunity'] as AgentCategory[]).map(cat => (
                         <div key={cat} className="space-y-3">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                             {cat === 'Vision' ? 'الرؤية' : cat === 'Market' ? 'السوق' : cat === 'User' ? 'المستخدم' : 'الفرصة'}
                             <span>({getAgentsByCategory(cat).length})</span>
                           </p>
                           <div className="space-y-2">
                              {getAgentsByCategory(cat).map(agent => (
                                <button
                                  key={agent.id}
                                  onClick={() => toggleAgent(agent.id)}
                                  className={`w-full text-right p-3 rounded-2xl border-2 transition-all group flex items-start gap-3
                                    ${formData.selectedAgents.includes(agent.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-50 hover:border-slate-200'}
                                  `}
                                >
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                     ${formData.selectedAgents.includes(agent.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}
                                   `}>
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                   </div>
                                   <div className="flex-1">
                                      <div className="flex justify-between items-center">
                                        <p className="font-bold text-xs text-slate-800">{agent.name}</p>
                                        <span className="text-[8px] text-blue-500 font-bold">GPT-4o Equivalent</span>
                                      </div>
                                      <p className="text-[9px] text-slate-500 leading-relaxed">{agent.description}</p>
                                   </div>
                                </button>
                              ))}
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-right">
                   <p className="text-xs text-slate-400">الوكلاء المختارون لبناء مشروعك:</p>
                   <p className="text-xl font-black text-slate-800">
                     {formData.selectedAgents.length === 0 ? '(لم يتم اختيار أي وكيل)' : `${formData.selectedAgents.length} وكلاء مفعلين`}
                   </p>
                </div>
                <button 
                  onClick={handleNextStep}
                  disabled={isGenerating || formData.selectedAgents.length === 0 || !formData.projectName}
                  className="w-full md:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>إنشاء المشروع والمتابعة</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Steps 2-4 Logic (Placeholder content as Step 1 was the primary focus of the request) */}
          {step === 2 && (
            <div className="animate-fade-in-up space-y-8">
               <h1 className="text-3xl font-black text-slate-900 mb-6">الخطوة 2: توليد الفرضيات</h1>
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="space-y-6">
                    {formData.results?.hypotheses?.map((h, i) => (
                      <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold shrink-0">{i+1}</span>
                        <p className="text-slate-700 leading-relaxed font-medium">{h}</p>
                      </div>
                    ))}
                  </div>
               </div>
               <button onClick={handleNextStep} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl">إنشاء العرض التقديمي</button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in-up space-y-8">
               <h1 className="text-3xl font-black text-slate-900 mb-6">الخطوة 3: العرض التقديمي</h1>
               <div className="bg-slate-900 aspect-video rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center p-12 text-center text-white relative">
                  <div className="max-w-xl">
                    <h2 className="text-5xl font-black mb-8">{formData.results?.pitchDeck?.[currentSlideIndex].title}</h2>
                    <p className="text-xl text-slate-300 leading-relaxed">{formData.results?.pitchDeck?.[currentSlideIndex].content}</p>
                  </div>
                  <div className="absolute bottom-8 right-1/2 translate-x-1/2 flex gap-4">
                     <button disabled={currentSlideIndex === 0} onClick={() => setCurrentSlideIndex(prev => prev - 1)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-20"><svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={2} /></svg></button>
                     <button disabled={currentSlideIndex === (formData.results?.pitchDeck?.length || 1) - 1} onClick={() => setCurrentSlideIndex(prev => prev + 1)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-20"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={2} /></svg></button>
                  </div>
               </div>
               <button onClick={handleNextStep} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl">حفظ المشروع وإكمال المسار</button>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in-up text-center space-y-8 py-12">
               <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
               <h1 className="text-4xl font-black text-slate-900">لقد تم بناء مشروعك بنجاح!</h1>
               <p className="text-slate-500 max-w-md mx-auto">مشروع "{formData.projectName}" جاهز الآن. تم توليد الفرضيات وبناء عرض تقديمي احترافي لمشاركته مع المستثمرين.</p>
               <button onClick={() => onComplete(formData)} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl transition-transform hover:scale-105">العودة للوحة التحكم</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
