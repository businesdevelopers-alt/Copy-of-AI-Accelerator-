
import React from 'react';

export type LegalType = 'PRIVACY' | 'TERMS' | 'CONTACT' | null;

interface LegalPortalProps {
  type: LegalType;
  onClose: () => void;
}

export const LegalPortal: React.FC<LegalPortalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const content = {
    PRIVACY: {
      title: 'سياسة الخصوصية',
      icon: '🛡️',
      body: `نحن في "بيزنس ديفلوبرز" نلتزم بحماية بياناتك الريادية. 
      - يتم تشفير كافة البيانات المرفوعة لمشروعك.
      - لا يتم مشاركة خطط العمل مع أطراف خارجية دون إذنك.
      - نستخدم تقنيات Gemini AI لتحليل البيانات بشكل مغلق لضمان السرية التامة.`
    },
    TERMS: {
      title: 'الشروط والأحكام',
      icon: '⚖️',
      body: `بانضمامك للمسرعة، أنت توافق على:
      - دقة المعلومات المقدمة في مرحلة الترشيح.
      - استخدام المخرجات الذكية كأدوات استشارية وليست ضمانات مالية.
      - احترام حقوق الملكية الفكرية للمواد التدريبية المقدمة داخل المنصة.`
    },
    CONTACT: {
      title: 'تواصل معنا',
      icon: '📧',
      body: `فريق الدعم الفني والتقني في خدمتك على مدار الساعة.
      البريد الإلكتروني: support@bizdev-accelerator.ai
      الموقع الرئيسي: الرياض، المملكة العربية السعودية.
      أو يمكنك التحدث مباشرة مع "المستشار الذكي" في الصفحة الرئيسية.`
    }
  }[type];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-white/80 backdrop-blur-xl animate-fade-in">
      <div className="bg-white rounded-[3.5rem] max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up">
        <div className="p-10 md:p-14">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-5">
              <span className="text-3xl">{content.icon}</span>
              <div>
                <h3 className="text-3xl font-bold text-brand-primary">{content.title}</h3>
                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-1">Legal & Support Portal</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
              <svg className="w-8 h-8 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="prose prose-slate max-w-none">
             <div className="bg-brand-bg p-8 rounded-[2.5rem] border border-slate-100 mb-8">
                <p className="text-lg text-brand-primary leading-relaxed font-medium whitespace-pre-wrap">
                  {content.body}
                </p>
             </div>
             
             {type === 'CONTACT' && (
               <div className="space-y-4">
                  <input type="text" placeholder="الاسم" className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10" />
                  <textarea placeholder="رسالتك" className="w-full h-32 p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 resize-none"></textarea>
                  <button className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg">إرسال الرسالة</button>
               </div>
             )}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
            <button 
              onClick={onClose}
              className="px-10 py-4 bg-white text-brand-primary rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-xl"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
