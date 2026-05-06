
import React, { useState, useEffect, useRef } from 'react';
import { MentorProfile, UserProfile, MOCK_MENTORS } from '../types';
import { playPositiveSound, playErrorSound } from '../services/audioService';
import { createAIMentorChat } from '../services/geminiService';

interface MentorshipPageProps {
  user?: UserProfile;
  onBack: () => void;
}

export const MentorshipPage: React.FC<MentorshipPageProps> = ({ user, onBack }) => {
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleStartChat = async (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setShowChatModal(true);
    setMessages([]);
    setIsTyping(true);
    playPositiveSound();

    try {
      const prompt = `أهلاً، أنا رائد أعمال واسم مشروعي هو ${user?.startupName || 'مشروع جديد'}. هل يمكنك مساعدتي؟`;
      const systemPrompt = mentor.systemPrompt || 'أنت مرشد أعمال.';
      const chat = createAIMentorChat(systemPrompt);
      setChatSession(chat);
      setMessages([{ role: 'user', text: prompt }]);
      
      const result = await chat.sendMessage({ message: prompt });
      setMessages([
        { role: 'user', text: prompt },
        { role: 'model', text: result.text }
      ]);
    } catch (error) {
      console.error(error);
      setMessages([{ role: 'user', text: 'مرحباً' }, { role: 'model', text: 'عذراً، حدث خطأ في الاتصال بالمرشد الذكي.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !chatSession || isTyping) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const result = await chatSession.sendMessage({ message: userText });
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (error) {
       console.error("Chat Error", error);
       playErrorSound();
       setMessages(prev => [...prev, { role: 'model', text: 'عذراً، حدث خطأ، هل يمكنك المحاولة مرة أخرى؟' }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="min-h-screen bg-brand-bg font-sans" dir="rtl">
      <style>{`
        .mentor-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .mentor-card:hover { transform: translateY(-8px); border-color: #3b82f6; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-8 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-brand-gray hover:text-brand-primary transition-all border border-slate-100 group shrink-0">
            <svg className="w-6 h-6 transform rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">مستشارو الذكاء الاصطناعي</h1>
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-1">AI Mentorship Hub</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-12 animate-fade-in">
           <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 bg-brand-primary/5 text-brand-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-primary">
                AI Expert Network
              </div>
              <h2 className="text-3xl font-bold text-slate-900 leading-tight">تحدث فوراً مع خبراء الذكاء الاصطناعي</h2>
              <p className="text-slate-500 font-medium">اختر المرشد المتخصص لمناقشة تحديات مشروعك، تطوير نماذج العمل، أو الإعداد لجولات تمويلية ناجحة.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_MENTORS.map(mentor => (
                <div key={mentor.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50 mentor-card flex flex-col justify-between relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div>
                      <div className="flex justify-between items-start mb-6">
                         <div className="relative">
                           <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-50">
                              {mentor.avatar}
                           </div>
                           <div className="absolute -bottom-2 -right-2 bg-brand-hover text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm" title="AI Agent">
                              <span className="text-[10px] font-bold px-1">AI</span>
                           </div>
                         </div>
                         <div className="text-left">
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                               <span className="text-lg">★</span>
                               <span>{mentor.rating.toFixed(1)}</span>
                            </div>
                            <p className="text-[9px] text-brand-gray font-bold uppercase tracking-widest mt-1">AI Rating</p>
                         </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-brand-primary transition-colors">{mentor.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                         <p className="text-sm font-bold text-slate-600">{mentor.role}</p>
                      </div>
                      
                      <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-3 font-medium">{mentor.bio}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-8">
                         {mentor.tags.map(tag => (
                           <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100">{tag}</span>
                         ))}
                      </div>
                   </div>

                   <button 
                    onClick={() => handleStartChat(mentor)}
                    className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-brand-hover shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                   >
                      <span>بدء المحادثة الاستشارية</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                   </button>
                </div>
              ))}
           </div>
        </div>
      </main>

      {/* AI Chat Modal */}
      {showChatModal && selectedMentor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-white/60 backdrop-blur-md animate-fade-in rtl">
           <div className="bg-white rounded-[2rem] w-full max-w-4xl h-full md:h-[85vh] shadow-2xl border border-slate-100 animate-fade-in-up overflow-hidden flex flex-col">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-slate-100">
                       {selectedMentor.avatar}
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          {selectedMentor.name}
                          <span className="bg-brand-primary/10 text-brand-primary text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest leading-none mt-1">AI</span>
                       </h3>
                       <p className="text-xs font-bold text-slate-500 mt-1">{selectedMentor.role}</p>
                    </div>
                 </div>
                 <button onClick={() => { setShowChatModal(false); setChatSession(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-brand-gray">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 space-y-6 flex flex-col">
                 {messages.map((msg, idx) => (
                    <div key={idx} className={`flex max-w-[85%] ${msg.role === 'user' ? 'self-end bg-brand-primary text-white rounded-tr-none' : 'self-start bg-white text-brand-primary rounded-tl-none border border-slate-200'} p-5 rounded-3xl shadow-sm filter drop-shadow-sm`}>
                       <p className="whitespace-pre-wrap leading-relaxed font-medium text-sm">{msg.text}</p>
                    </div>
                 ))}
                 {isTyping && (
                    <div className="self-start bg-white border border-slate-200 rounded-3xl rounded-tl-none p-5 shadow-sm inline-flex items-center gap-1.5 w-auto">
                       <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                       <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                       <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                 )}
                 <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                 <form onSubmit={handleSendMessage} className="relative flex items-center gap-3 max-w-full">
                    <input 
                       type="text" 
                       value={inputMessage}
                       onChange={e => setInputMessage(e.target.value)}
                       placeholder="اكتب استشارتك هنا..."
                       className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-full outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-brand-primary transition-all font-bold text-sm"
                       disabled={isTyping}
                    />
                    <button 
                       type="submit" 
                       disabled={!inputMessage.trim() || isTyping}
                       className="absolute left-2 w-12 h-12 bg-brand-primary hover:bg-brand-primary disabled:bg-slate-300 text-white flex items-center justify-center rounded-full transition-all"
                    >
                       <svg className="w-5 h-5 transform -rotate-90 origin-center mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                       </svg>
                    </button>
                 </form>
              </div>
              
           </div>
        </div>
      )}
    </div>
  );
};
