
import React, { useState } from 'react';
import { UserProfile } from '../types';

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
      innerBorder2: 'border-[#C5A059]/20',
      textTitle: 'text-[#4A3F35]',
      textBody: 'text-[#6B5E51]',
      textName: 'text-[#2D241E]',
      accent: 'text-[#967B4F]',
      sealBorder: 'border-[#C5A059]',
      sealBg: 'bg-gradient-to-br from-[#FDFBF7] to-[#F1E9DB]',
      sealIcon: 'text-[#B8860B]',
      sealText: 'text-[#4A3F35]',
      sealSubText: 'text-[#967B4F]',
      logoBg: 'bg-[#4A3F35]',
      logoBorder: 'border-[#C5A059]',
      logoIcon: 'text-[#F1E9DB]',
      cornerBorder: 'border-[#8C7355]',
      cornerInner: 'border-[#C5A059]/50',
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
      innerBorder2: 'border-slate-300/20',
      textTitle: 'text-slate-800',
      textBody: 'text-slate-600',
      textName: 'text-slate-900',
      accent: 'text-slate-500',
      sealBorder: 'border-slate-400',
      sealBg: 'bg-gradient-to-br from-white to-slate-100',
      sealIcon: 'text-slate-500',
      sealText: 'text-slate-800',
      sealSubText: 'text-slate-500',
      logoBg: 'bg-slate-800',
      logoBorder: 'border-slate-400',
      logoIcon: 'text-white',
      cornerBorder: 'border-slate-400',
      cornerInner: 'border-slate-300',
      patternFill: '#94a3b8',
      watermarkClass: 'text-slate-400'
    }
  },
  elegant: {
    id: 'elegant',
    name: 'بيج ملكي',
    previewColor: 'bg-[#F2EFE9]',
    styles: {
      containerBg: 'bg-[#F2EFE9]',
      outerBorder: 'border-[#5D574F]',
      innerBorder: 'border-[#A39B8F]',
      innerBorder2: 'border-[#D1CDC5]',
      textTitle: 'text-[#3D3832]',
      textBody: 'text-[#5D574F]',
      textName: 'text-[#2D2A26]',
      accent: 'text-[#8C8375]',
      sealBorder: 'border-[#8C8375]',
      sealBg: 'bg-[#EAE5DC]',
      sealIcon: 'text-[#5D574F]',
      sealText: 'text-[#3D3832]',
      sealSubText: 'text-[#5D574F]',
      logoBg: 'bg-[#3D3832]',
      logoBorder: 'border-[#8C8375]',
      logoIcon: 'text-[#F2EFE9]',
      cornerBorder: 'border-[#5D574F]',
      cornerInner: 'border-[#A39B8F]',
      patternFill: '#A39B8F',
      watermarkClass: 'text-[#3D3832]'
    }
  },
  creative: {
    id: 'creative',
    name: 'إبداعي هادئ',
    previewColor: 'bg-[#F8F5F2]',
    styles: {
      containerBg: 'bg-[#F8F5F2]',
      outerBorder: 'border-[#4A4A4A]',
      innerBorder: 'border-[#D4AF37]/40',
      innerBorder2: 'border-[#D4AF37]/20',
      textTitle: 'text-[#2C2C2C]',
      textBody: 'text-[#555555]',
      textName: 'text-transparent bg-clip-text bg-gradient-to-r from-[#8C7355] to-[#C5A059]',
      accent: 'text-[#C5A059]',
      sealBorder: 'border-[#C5A059]',
      sealBg: 'bg-white',
      sealIcon: 'text-[#C5A059]',
      sealText: 'text-[#2C2C2C]',
      sealSubText: 'text-[#C5A059]',
      logoBg: 'bg-gradient-to-r from-[#4A4A4A] to-[#2C2C2C]',
      logoBorder: 'border-[#C5A059]',
      logoIcon: 'text-white',
      cornerBorder: 'border-[#4A4A4A]',
      cornerInner: 'border-[#C5A059]',
      patternFill: '#C5A059',
      watermarkClass: 'text-[#2C2C2C]'
    }
  }
};

type TemplateKey = keyof typeof TEMPLATES;

export const Certificate: React.FC<CertificateProps> = ({ user, onClose }) => {
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('classic');
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const theme = TEMPLATES[activeTemplate].styles;

  const shareText = `لقد تخرجت للتو من مسرعة الأعمال الذكية AI Accelerator! 🚀 مشروع: ${user.startupName}`;
  const shareUrl = window.location.href;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'شهادة تخرج AI Accelerator',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setIsShareMenuOpen(!isShareMenuOpen);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const shareViaTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent('شهادة تخرج من مسرعة الأعمال الذكية')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
      <style>{`
        @keyframes cert-pop {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-cert-pop {
          animation: cert-pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.2), 0 0 10px rgba(59, 130, 246, 0.1) inset;
            filter: brightness(1) drop-shadow(0 0 2px rgba(59, 130, 246, 0.3));
          }
          50% { 
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.2) inset;
            filter: brightness(1.2) drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
          }
        }
        .animate-logo-glow {
          animation: glow-pulse 4s infinite ease-in-out;
        }
        @keyframes shimmer-slide {
          0% { transform: translateX(-150%) skewX(-15deg); }
          50% { transform: translateX(150%) skewX(-15deg); }
          100% { transform: translateX(150%) skewX(-15deg); }
        }
        .animate-shimmer-slide {
          animation: shimmer-slide 8s infinite ease-in-out;
        }
        @keyframes neural-pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .animate-neural-pulse {
          animation: neural-pulse 6s infinite ease-in-out;
        }
        @keyframes circuit-flow {
          0% { stroke-dashoffset: 1000; opacity: 0.1; }
          50% { opacity: 0.3; }
          100% { stroke-dashoffset: 0; opacity: 0.1; }
        }
        .animate-circuit-flow {
          stroke-dasharray: 40, 60;
          animation: circuit-flow 25s linear infinite;
        }
        @keyframes corner-circuit-dash {
          to { stroke-dashoffset: 0; }
        }
        .animate-corner-circuit {
          stroke-dasharray: 100;
          stroke-dashoffset: 200;
          animation: corner-circuit-dash 10s linear infinite;
        }
        @keyframes corner-node-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 1; }
        }
        .animate-corner-node {
          animation: corner-node-pulse 4s ease-in-out infinite;
        }
        @keyframes background-drift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        .dynamic-ai-bg {
          animation: background-drift 120s linear infinite alternate;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-container, #certificate-container * {
            visibility: visible;
          }
          #certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border: none;
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative max-w-5xl w-full rounded-xl shadow-2xl animate-cert-pop flex flex-col bg-white max-h-[95vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors z-30 no-print shadow-sm"
        >
          <svg className="w-6 h-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto p-2 md:p-8 bg-slate-50/30">
          <div id="certificate-container" className={`relative p-2 md:p-4 transition-colors duration-500 ${theme.containerBg}`}>
            <div className={`relative border-[16px] border-double p-8 md:p-12 text-center overflow-hidden min-h-[750px] flex flex-col justify-between shadow-2xl transition-colors duration-500 ${theme.outerBorder} ${theme.containerBg}`}>
              
              <div className={`absolute inset-2 border pointer-events-none z-10 transition-colors duration-500 ${theme.innerBorder}`}></div>
              <div className={`absolute inset-3 border pointer-events-none z-10 transition-colors duration-500 ${theme.innerBorder2}`}></div>

              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden no-print">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-slide"></div>
              </div>
              
              {/* Dynamic AI-Themed Abstract Background Pattern */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden dynamic-ai-bg">
                 <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
                   <defs>
                     <pattern id="cert-pattern-dynamic" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
                       {/* Connection Nodes */}
                       <g className="animate-neural-pulse">
                         <circle cx="50" cy="50" r="3" fill={theme.patternFill} />
                         <circle cx="250" cy="80" r="2" fill={theme.patternFill} />
                         <circle cx="150" cy="150" r="4" fill={theme.patternFill} />
                         <circle cx="40" cy="240" r="2.5" fill={theme.patternFill} />
                         <circle cx="220" cy="260" r="3.5" fill={theme.patternFill} />
                       </g>
                       
                       {/* Animated Circuit Connections */}
                       <path d="M50 50 L 150 150 L 250 80" stroke={theme.patternFill} strokeWidth="0.6" fill="none" className="animate-circuit-flow" />
                       <path d="M40 240 L 150 150 L 220 260" stroke={theme.patternFill} strokeWidth="0.6" fill="none" className="animate-circuit-flow" style={{ animationDelay: '2s' }} />
                       <path d="M0 150 H 300" stroke={theme.patternFill} strokeWidth="0.2" opacity="0.4" />
                       <path d="M150 0 V 300" stroke={theme.patternFill} strokeWidth="0.2" opacity="0.4" />
                       
                       {/* Subtle Tech Symbols */}
                       <rect x="145" y="145" width="10" height="10" fill="none" stroke={theme.patternFill} strokeWidth="0.5" className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '20s' }} />
                     </pattern>
                   </defs>
                   <rect width="100%" height="100%" fill="url(#cert-pattern-dynamic)" />
                 </svg>
              </div>
              
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03] ${theme.watermarkClass}`}>
                 <svg viewBox="0 0 24 24" className="w-[600px] h-[600px] animate-neural-pulse" fill="currentColor">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
              </div>

              {/* Corner AI Decorations */}
              <div className={`absolute top-0 left-0 w-40 h-40 border-t-[8px] border-l-[8px] z-20 transition-colors duration-500 ${theme.cornerBorder}`}>
                  <div className={`absolute top-2 left-2 w-full h-full border-t-[1px] border-l-[1px] ${theme.cornerInner}`}></div>
                  <svg className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 160 160">
                    <path d="M0 50 L 50 50 L 50 0" fill="none" stroke="currentColor" strokeWidth="0.8" className={`animate-corner-circuit ${theme.accent}`} />
                    <circle cx="50" cy="50" r="3" fill="currentColor" className={`animate-corner-node ${theme.accent}`} />
                    <path d="M0 100 L 30 100 L 30 70 L 60 70" fill="none" stroke="currentColor" strokeWidth="0.8" className={`animate-corner-circuit ${theme.accent}`} style={{ animationDelay: '-3s' }} />
                  </svg>
              </div>
              <div className={`absolute top-0 right-0 w-40 h-40 border-t-[8px] border-r-[8px] z-20 transition-colors duration-500 ${theme.cornerBorder}`}>
                  <div className={`absolute top-2 right-2 w-full h-full border-t-[1px] border-r-[1px] ${theme.cornerInner}`}></div>
                  <svg className="absolute top-0 right-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 160 160">
                    <path d="M160 50 L 110 50 L 110 0" fill="none" stroke="currentColor" strokeWidth="0.8" className={`animate-corner-circuit ${theme.accent}`} />
                    <circle cx="110" cy="50" r="3" fill="currentColor" className={`animate-corner-node ${theme.accent}`} />
                  </svg>
              </div>
              <div className={`absolute bottom-0 left-0 w-40 h-40 border-b-[8px] border-l-[8px] z-20 transition-colors duration-500 ${theme.cornerBorder}`}>
                   <div className={`absolute bottom-2 left-2 w-full h-full border-t-[1px] border-l-[1px] ${theme.cornerInner}`}></div>
                   <svg className="absolute bottom-0 left-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 160 160">
                    <path d="M0 110 L 50 110 L 50 160" fill="none" stroke="currentColor" strokeWidth="0.8" className={`animate-corner-circuit ${theme.accent}`} />
                    <circle cx="50" cy="110" r="3" fill="currentColor" className={`animate-corner-node ${theme.accent}`} />
                  </svg>
              </div>
              <div className={`absolute bottom-0 right-0 w-40 h-40 border-b-[8px] border-r-[8px] z-20 transition-colors duration-500 ${theme.cornerBorder}`}>
                   <div className={`absolute bottom-2 right-2 w-full h-full border-t-[1px] border-r-[1px] ${theme.cornerInner}`}></div>
                   <svg className="absolute bottom-0 right-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 160 160">
                    <path d="M160 110 L 110 110 L 110 160" fill="none" stroke="currentColor" strokeWidth="0.8" className={`animate-corner-circuit ${theme.accent}`} />
                    <circle cx="110" cy="110" r="3" fill="currentColor" className={`animate-corner-node ${theme.accent}`} />
                  </svg>
              </div>

              <div className="relative z-10 pt-10">
                 <div className="relative mx-auto w-32 h-32 mb-6">
                   {/* Animated Logo Glow */}
                   <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-3xl animate-logo-glow"></div>
                   <div className={`relative w-full h-full rounded-full flex items-center justify-center border-4 z-20 shadow-2xl transition-all duration-500 animate-logo-glow ${theme.logoBg} ${theme.logoBorder}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 transition-colors duration-500 ${theme.logoIcon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                   </div>
                 </div>
                 
                 <h1 className={`text-6xl md:text-7xl font-serif font-bold mb-3 tracking-wide transition-colors duration-500 ${theme.textTitle}`}>
                   شهادة تخرج
                 </h1>
                 <div className={`h-1 w-64 mx-auto mb-4 bg-gradient-to-r from-transparent via-current to-transparent opacity-40 ${theme.accent}`}></div>
                 <p className={`font-bold tracking-[0.3em] text-xs uppercase transition-colors duration-500 ${theme.accent}`}>مسرعة الأعمال الذكية AI Accelerator</p>
              </div>

              <div className="my-10 space-y-8 relative z-10 flex-grow flex flex-col justify-center">
                <p className={`text-2xl font-serif italic transition-colors duration-500 ${theme.textBody}`}>يشهد هذا المستند بأن</p>
                
                <div className="relative inline-block py-4">
                  <h2 className={`text-6xl md:text-7xl font-bold font-serif px-12 pb-6 relative z-10 transition-colors duration-500 ${theme.textName}`}>
                    {user.name}
                  </h2>
                  <div className={`h-[2px] w-3/4 mx-auto relative mt-2 opacity-50 ${theme.accent.replace('text-', 'bg-')}`}>
                      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rotate-45 border-2 ${theme.containerBg} ${theme.accent.replace('text-', 'bg-')}`}></div>
                  </div>
                </div>

                <p className={`text-xl font-serif italic max-w-3xl mx-auto leading-relaxed transition-colors duration-500 ${theme.textBody}`}>
                  قد أتم بنجاح البرنامج التدريبي المتكامل لتأسيس وريادة الأعمال، وتمكن من بناء وتطوير مشروع
                </p>
                
                <div className="relative mt-4">
                   <h3 className={`relative text-4xl md:text-5xl font-bold py-3 px-12 inline-block mx-auto border-b-2 transition-colors duration-500 ${theme.textTitle} ${theme.innerBorder2}`}>
                      "{user.startupName}"
                   </h3>
                </div>
                
                <p className={`max-w-4xl mx-auto mt-8 text-sm md:text-base leading-relaxed font-serif transition-colors duration-500 ${theme.textBody}`}>
                  تم منح هذه الشهادة بعد اجتياز <span className={`font-bold ${theme.textTitle}`}>6 مستويات تفاعلية مكثفة</span> تشمل التحقق من الفكرة، نموذج العمل التجاري، تحليل السوق، بناء المنتج الأولي، التخطيط المالي، ومهارات العرض والتمويل.
                </p>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-end mt-16 px-12 md:px-20 relative z-10 pb-8">
                <div className="text-center mb-10 md:mb-0">
                  <p className={`text-[11px] mb-3 uppercase tracking-widest font-bold opacity-50 ${theme.accent}`}>التاريخ Date</p>
                  <div className={`w-56 border-b-2 mb-3 pb-3 text-xl font-medium font-serif ${theme.innerBorder} ${theme.textTitle}`}>
                    {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                
                <div className="w-36 h-36 -mb-6 flex-shrink-0 mx-auto md:mx-0 order-last md:order-none relative">
                   <div className="w-full h-full relative flex items-center justify-center">
                     <div className={`w-full h-full border-[3px] rounded-full flex items-center justify-center relative shadow-xl transition-colors duration-500 ${theme.sealBorder} ${theme.sealBg} animate-logo-glow`}>
                       <div className={`absolute inset-2 border border-dashed rounded-full opacity-30 ${theme.sealBorder}`}></div>
                       <div className="text-center z-10">
                         <svg className={`w-7 h-7 mx-auto mb-1 transition-colors duration-500 ${theme.sealIcon}`} fill="currentColor" viewBox="0 0 20 20">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                         </svg>
                         <span className={`block font-serif font-bold text-2xl leading-none transition-colors duration-500 ${theme.sealText}`}>AI</span>
                         <span className={`block font-bold text-[8px] uppercase tracking-wider mt-1 transition-colors duration-500 ${theme.sealSubText}`}>Accelerator</span>
                       </div>
                     </div>
                   </div>
                </div>

                <div className="text-center mt-10 md:mt-0">
                   <p className={`text-[11px] mb-3 uppercase tracking-widest font-bold opacity-50 ${theme.accent}`}>المدير التنفيذي Director</p>
                   <div className={`w-56 border-b-2 mb-3 pb-3 relative h-14 flex items-end justify-center ${theme.innerBorder}`}>
                      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiPjxwYXRoIGQ9Ik0xMCw1MCBDNDAsMTAgNjAsNTAgOTAsMjAgQzEyMCwwIDE1MCw0MCAxOTAsMTAiIHN0cm9rZT0iIzRBM0YzNSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIC8+PC9zdmc+" alt="Signature" className="h-14 w-auto opacity-70 grayscale contrast-125" />
                   </div>
                </div>
              </div>
              
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-[9px] font-mono tracking-widest opacity-25">
                  VERIFIED AUTHENTICITY ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}-{Date.now().toString(36).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border-t border-slate-200 no-print rounded-b-xl z-40">
           <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 w-full overflow-hidden">
                 <p className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest">اختر مظهر الشهادة</p>
                 <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {Object.entries(TEMPLATES).map(([key, tpl]) => (
                      <button
                        key={key}
                        onClick={() => setActiveTemplate(key as TemplateKey)}
                        className={`flex flex-col items-center gap-3 group min-w-[120px] transition-all`}
                      >
                        <div className={`w-28 h-20 rounded-2xl border-2 transition-all ${tpl.previewColor} ${activeTemplate === key ? 'border-blue-500 ring-4 ring-blue-500/10 scale-110 shadow-lg' : 'border-slate-100 group-hover:border-slate-200'}`}>
                           <div className="w-full h-full flex items-center justify-center opacity-30">
                              <div className="w-12 h-1 bg-slate-400 rounded-full"></div>
                           </div>
                        </div>
                        <span className={`text-[11px] font-bold ${activeTemplate === key ? 'text-blue-600' : 'text-slate-400'}`}>
                          {tpl.name}
                        </span>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex-shrink-0 w-full lg:w-auto flex flex-col md:flex-row gap-5 items-center relative">
                {isShareMenuOpen && (
                  <div className="absolute bottom-full mb-5 right-0 w-72 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 flex flex-col gap-2 animate-cert-pop origin-bottom-right">
                    <button onClick={shareViaWhatsApp} className="flex items-center gap-4 p-4 hover:bg-green-50 text-slate-700 rounded-2xl text-sm font-bold transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </div>
                      واتساب
                    </button>
                    <button onClick={shareViaLinkedIn} className="flex items-center gap-4 p-4 hover:bg-blue-50 text-slate-700 rounded-2xl text-sm font-bold transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </div>
                      لينكد إن
                    </button>
                    <div className="h-px bg-slate-100 my-2 mx-2"></div>
                    <button onClick={copyToClipboard} className="flex items-center gap-4 p-4 hover:bg-slate-50 text-slate-700 rounded-2xl text-sm font-bold transition-all group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${copySuccess ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-800 group-hover:text-white'}`}>
                        {copySuccess ? (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        )}
                      </div>
                      {copySuccess ? 'تم النسخ!' : 'نسخ الرابط'}
                    </button>
                  </div>
                )}

                <button 
                  onClick={handleShare}
                  className="w-full md:w-auto bg-[#8C7355] hover:bg-[#735F46] text-white px-10 py-5 rounded-2xl shadow-xl flex items-center justify-center gap-4 font-black transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  مشاركة الإنجاز
                </button>

                <button 
                  onClick={() => window.print()} 
                  className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-2xl shadow-xl flex items-center justify-center gap-4 font-black transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  تحميل PDF
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
