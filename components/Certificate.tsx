
import React, { useState } from 'react';
import { UserProfile, DIGITAL_SHIELDS } from '../types';

interface CertificateProps {
  user: UserProfile;
  onClose: () => void;
}

const TEMPLATES = {
  classic: {
    id: 'classic',
    name: 'كلاسيكي ذهبي',
    previewColor: 'bg-[#F9F6F0]',
    styles: {
      containerBg: 'bg-[#F9F6F0]',
      outerBorder: 'border-[#8C7355]',
      innerBorder: 'border-[#C5A059]/40',
      textTitle: 'text-[#4A3F35]',
      textBody: 'text-[#6B5E51]',
      textName: 'text-[#2D241E]',
      accent: 'text-[#967B4F]',
      sealBorder: 'border-[#C5A059]',
      sealBg: 'bg-gradient-to-br from-[#FDFBF7] to-[#F1E9DB]',
      sealIcon: 'text-[#B8860B]',
      logoBg: 'bg-[#4A3F35]',
      logoIcon: 'text-[#F1E9DB]',
      patternFill: '#C5A059',
      watermarkClass: 'text-[#8C7355]'
    }
  },
  modern: {
    id: 'modern',
    name: 'فضي عصري',
    previewColor: 'bg-slate-50',
    styles: {
      containerBg: 'bg-slate-50',
      outerBorder: 'border-slate-400',
      innerBorder: 'border-slate-300/40',
      textTitle: 'text-slate-800',
      textBody: 'text-slate-600',
      textName: 'text-slate-900',
      accent: 'text-slate-500',
      sealBorder: 'border-slate-400',
      sealBg: 'bg-gradient-to-br from-white to-slate-100',
      sealIcon: 'text-slate-500',
      logoBg: 'bg-slate-800',
      logoIcon: 'text-white',
      patternFill: '#94a3b8',
      watermarkClass: 'text-slate-400'
    }
  }
};

export const Certificate: React.FC<CertificateProps> = ({ user, onClose }) => {
  const [activeTemplate, setActiveTemplate] = useState<keyof typeof TEMPLATES>('classic');
  const theme = TEMPLATES[activeTemplate].styles;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
      <div className="relative max-w-5xl w-full rounded-xl shadow-2xl flex flex-col bg-white max-h-[95vh]">
        <button onClick={onClose} className="absolute top-4 right-4 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors z-30 no-print shadow-sm">✕</button>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div id="certificate-container" className={`relative p-2 md:p-4 transition-colors duration-500 ${theme.containerBg}`}>
            <div className={`relative border-[16px] border-double p-8 md:p-12 text-center min-h-[900px] flex flex-col justify-between shadow-2xl transition-colors duration-500 ${theme.outerBorder} ${theme.containerBg}`}>
              
              <div className={`absolute inset-2 border pointer-events-none z-10 transition-colors duration-500 ${theme.innerBorder}`}></div>
              
              <div className="relative z-10 pt-10">
                 <div className={`relative mx-auto w-24 h-24 mb-6 rounded-full flex items-center justify-center border-4 shadow-2xl ${theme.logoBg} border-[#C5A059]`}>
                    <svg className={`h-12 w-12 ${theme.logoIcon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                 </div>
                 <h1 className={`text-6xl font-serif font-bold mb-3 ${theme.textTitle}`}>شهادة تخرج</h1>
                 <p className={`font-bold tracking-[0.3em] text-xs uppercase ${theme.accent}`}>مسرعة الأعمال الذكية AI Accelerator</p>
              </div>

              <div className="my-10 space-y-6 relative z-10">
                <p className={`text-2xl font-serif italic ${theme.textBody}`}>يشهد هذا المستند بأن رائد الأعمال</p>
                <h2 className={`text-6xl font-bold font-serif px-12 pb-4 ${theme.textName}`}>{user.name}</h2>
                <p className={`text-xl font-serif italic ${theme.textBody}`}>قد أتم بنجاح كافة متطلبات البرنامج التدريبي لبناء مشروع</p>
                <h3 className={`text-4xl font-bold py-2 px-10 inline-block border-b-2 ${theme.textTitle}`}>"{user.startupName}"</h3>
              </div>

              {/* Badges Inclusion in Certificate */}
              <div className="relative z-10 py-10 bg-black/5 rounded-[3rem] border-2 border-dashed border-black/10 mx-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">الأوسمة والدروع المكتسبة (Shields Earned)</p>
                  <div className="flex justify-center gap-6">
                      {DIGITAL_SHIELDS.map(s => (
                          <div key={s.id} className="flex flex-col items-center gap-1">
                              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-3xl shadow-lg border-2 border-white`}>
                                  {s.icon}
                              </div>
                              <span className="text-[8px] font-black text-slate-500 uppercase">{s.name.split(' ')[1]}</span>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="flex justify-between items-end mt-16 px-12 relative z-10">
                <div className="text-right">
                  <p className={`text-[10px] mb-2 uppercase tracking-widest font-bold opacity-50 ${theme.accent}`}>التاريخ</p>
                  <div className={`w-40 border-b-2 pb-2 text-lg font-serif ${theme.textTitle}`}>{new Date().toLocaleDateString('ar-EG')}</div>
                </div>
                
                <div className={`w-28 h-28 border-4 rounded-full flex flex-col items-center justify-center shadow-xl ${theme.sealBg} ${theme.sealBorder}`}>
                   <span className="text-2xl">★</span>
                   <span className="text-[10px] font-black uppercase">Verified</span>
                </div>

                <div className="text-right">
                   <p className={`text-[10px] mb-2 uppercase tracking-widest font-bold opacity-50 ${theme.accent}`}>المدير التنفيذي</p>
                   <div className={`w-40 border-b-2 pb-2 h-10 flex items-end justify-center ${theme.textTitle}`}>
                      <span className="font-serif italic text-xl opacity-50">Admin Sign</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t flex justify-center gap-4 no-print">
            <button onClick={() => window.print()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-105">تحميل نسخة PDF</button>
            <button onClick={onClose} className="px-10 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm">العودة للوحة التحكم</button>
        </div>
      </div>
    </div>
  );
};
