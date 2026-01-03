
import React, { useState } from 'react';
import { MentorProfile, UserProfile } from '../types';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../services/audioService';

interface MentorshipPageProps {
  user?: UserProfile;
  onBack: () => void;
}

const MOCK_MENTORS: MentorProfile[] = [
  {
    id: 'm1',
    name: 'د. خالد العمري',
    role: 'خبير نمو الشركات الناشئة',
    company: 'GrowthOps Global',
    specialty: 'Growth',
    bio: 'أكثر من ١٥ عاماً في مساعدة الشركات الناشئة على التوسع في الأسواق الخليجية.',
    experience: 15,
    avatar: '👨‍💼',
    rating: 4.9,
    tags: ['التوسع', 'التسويق الرقمي', 'SaaS']
  },
  {
    id: 'm2',
    name: 'م. سارة القحطاني',
    role: 'كبير مهندسي البرمجيات',
    company: 'TechFlow',
    specialty: 'Tech',
    bio: 'متخصصة في بناء البنية التحتية وتطوير المنتجات الأولية (MVP) بكفاءة عالية.',
    experience: 10,
    avatar: '👩‍💻',
    rating: 4.8,
    tags: ['هيكلة البرمجيات', 'Cloud', 'AI']
  },
  {
    id: 'm3',
    name: 'أ. فهد السديري',
    role: 'مستشار مالي واستثماري',
    company: 'Capital Bridges',
    specialty: 'Finance',
    bio: 'ساعدت أكثر من ٥٠ شركة ناشئة في إغلاق جولات تمويلية ناجحة.',
    experience: 12,
    avatar: '🏦',
    rating: 5.0,
    tags: ['تقييم الشركات', 'إغلاق الجولات', 'VC']
  }
];

export const MentorshipPage: React.FC<MentorshipPageProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'register'>('browse');
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [mentorFormData, setMentorFormData] = useState({
    name: '',
    role: '',
    specialty: 'Strategy',
    bio: '',
    linkedin: ''
  });

  const handleMentorRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      playCelebrationSound();
      alert('تم استلام طلبك للانضمام كمرشد بنجاح. سيقوم فريقنا بمراجعته والتواصل معك.');
      setIsSubmitting(false);
      setActiveTab('browse');
    }, 1500);
  };

  const handleMentorshipRequest = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      playPositiveSound();
      alert(`تم إرسال طلب الإرشاد لـ ${selectedMentor?.name}. سيتم الرد عليك عبر البريد الإلكتروني.`);
      setIsSubmitting(false);
      setShowRequestModal(false);
      setSelectedMentor(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      <style>{`
        .mentor-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .mentor-card:hover { transform: translateY(-8px); border-color: #3b82f6; }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-8 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-slate-100 group">
            <svg className="w-6 h-6 transform rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">منصة الإرشاد الذكي</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Smart Mentorship Hub</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button onClick={() => setActiveTab('browse')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'browse' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>تصفح المرشدين</button>
           <button onClick={() => setActiveTab('register')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>سجل كمرشد</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'browse' ? (
          <div className="space-y-12 animate-fade-in">
             <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-4xl font-black text-slate-900">ابحث عن موجهك القادم</h2>
                <p className="text-slate-500 font-medium">نخبة من الخبراء والمستشارين جاهزون لنقل مشروعك إلى آفاق جديدة من خلال جلسات إرشادية متخصصة.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {MOCK_MENTORS.map(mentor => (
                  <div key={mentor.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50 mentor-card flex flex-col justify-between">
                     <div>
                        <div className="flex justify-between items-start mb-6">
                           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-slate-50">
                              {mentor.avatar}
                           </div>
                           <div className="text-left">
                              <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                                 <span>★</span>
                                 <span>{mentor.rating}</span>
                              </div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Certified Mentor</p>
                           </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">{mentor.name}</h3>
                        <p className="text-sm font-bold text-blue-600 mb-4">{mentor.role} @ {mentor.company}</p>
                        <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-3">{mentor.bio}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-8">
                           {mentor.tags.map(tag => (
                             <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100">{tag}</span>
                           ))}
                        </div>
                     </div>

                     <button 
                      onClick={() => { setSelectedMentor(mentor); setShowRequestModal(true); playPositiveSound(); }}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 shadow-lg transition-all active:scale-95"
                     >
                        طلب جلسة إرشادية
                     </button>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-fade-in-up">
             <div className="bg-white rounded-[3.5rem] p-12 md:p-16 border border-slate-100 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full opacity-50 -z-0"></div>
                
                <div className="relative z-10 space-y-10">
                   <div className="space-y-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl text-3xl">🤝</div>
                      <h2 className="text-4xl font-black text-slate-900">انضم لمجتمع مرشدينا</h2>
                      <p className="text-slate-500 font-medium leading-relaxed">شارك خبراتك، ساهم في بناء الجيل القادم من الشركات الناشئة، وكن جزءاً من قصة نجاح المبتكرين.</p>
                   </div>

                   <form onSubmit={handleMentorRegistration} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الاسم الكامل</label>
                         <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" placeholder="د. محمد ..." value={mentorFormData.name} onChange={e => setMentorFormData({...mentorFormData, name: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">المسمى الوظيفي الحالي</label>
                         <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" placeholder="مثال: مدير تقني" value={mentorFormData.role} onChange={e => setMentorFormData({...mentorFormData, role: e.target.value})} required />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">التخصص الأساسي</label>
                         <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={mentorFormData.specialty} onChange={e => setMentorFormData({...mentorFormData, specialty: e.target.value as any})}>
                            <option value="Strategy">استراتيجية الأعمال</option>
                            <option value="Tech">التطوير التقني</option>
                            <option value="Finance">المالية والاستثمار</option>
                            <option value="Growth">النمو والتسويق</option>
                            <option value="Legal">القانون والتشريعات</option>
                         </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">نبذة مختصرة عن الخبرة</label>
                         <textarea className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium resize-none" placeholder="حدثنا عن أبرز إنجازاتك وكيف يمكنك مساعدة رواد الأعمال..." value={mentorFormData.bio} onChange={e => setMentorFormData({...mentorFormData, bio: e.target.value})} required />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">رابط LinkedIn</label>
                         <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" placeholder="https://linkedin.com/in/..." value={mentorFormData.linkedin} onChange={e => setMentorFormData({...mentorFormData, linkedin: e.target.value})} required />
                      </div>
                      
                      <div className="md:col-span-2 pt-6">
                         <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
                         >
                            {isSubmitting ? 'جاري إرسال الطلب...' : 'إرسال طلب الانضمام'}
                         </button>
                      </div>
                   </form>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Mentorship Request Modal */}
      {showRequestModal && selectedMentor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in text-right">
           <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl border border-slate-100 animate-fade-in-up overflow-hidden">
              <div className="p-8 md:p-12 space-y-8">
                 <div className="flex justify-between items-start">
                    <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">✕</button>
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <h3 className="text-xl font-black text-slate-900">طلب جلسة مع {selectedMentor.name}</h3>
                          <p className="text-xs font-bold text-blue-600">{selectedMentor.role}</p>
                       </div>
                       <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-slate-100">
                          {selectedMentor.avatar}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">عنوان التحدي / الجلسة</label>
                       <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" placeholder="مثال: تحسين نموذج الربح" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">اشرح ما تحتاجه بدقة</label>
                       <textarea className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium resize-none" placeholder="نواجه تحديات في ..." required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الوقت المفضل (تقريبي)</label>
                       <input type="datetime-local" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" />
                    </div>
                 </div>

                 <div className="pt-4 flex gap-4">
                    <button onClick={() => setShowRequestModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">إلغاء</button>
                    <button 
                      onClick={handleMentorshipRequest}
                      disabled={isSubmitting}
                      className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                       {isSubmitting ? 'جاري الإرسال...' : 'تأكيد طلب الجلسة'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <footer className="py-12 border-t border-slate-200 text-center bg-white/50">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Business Developers Mentorship Program • 2024</p>
      </footer>
    </div>
  );
};
