import React, { useState, useEffect, useRef } from 'react';
import { Search, Map as MapIcon, Activity, Network, Globe, Heart, Sparkles, Filter, X, ZoomIn, ZoomOut, Maximize, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from '../services/storageService';
import { generateDigitalTwinReport } from '../services/geminiService';
import { StartupRecord } from '../types';

interface CommunityPageProps {
  onBack: () => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onBack }) => {
  const [startups, setStartups] = useState<StartupRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'standard' | 'heatmap' | 'traffic' | 'networking' | 'globe'>('standard');

  // Map panning & zooming state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Digital Twin Report State
  const [selectedStartup, setSelectedStartup] = useState<StartupRecord | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [twinReport, setTwinReport] = useState<{ pulse: string, tech: string, synergy: string, roadmap: string } | null>(null);

  useEffect(() => {
    setStartups(storageService.getAllStartups());
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    // Prevent default scroll behavior safely
    const target = e.target as HTMLElement;
    if (target.closest('.overflow-y-auto')) return; // Allow scrolling inside sidebars

    const delta = -e.deltaY * 0.002;
    const newScale = Math.min(Math.max(0.2, scale + delta), 4);
    
    // Zoom toward the cursor
    if (containerRef.current && newScale !== scale) {
      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left - rect.width / 2;
      const cursorY = e.clientY - rect.top - rect.height / 2;
      
      const scaleRatio = newScale / scale;
      
      // Calculate how much the map will expand/shrink around the mouse
      const newPanX = pan.x - (cursorX - pan.x) * (scaleRatio - 1);
      const newPanY = pan.y - (cursorY - pan.y) * (scaleRatio - 1);
      
      setPan({ x: newPanX, y: newPanY });
      setScale(newScale);
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX - pan.x, y: clientY - pan.y };
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPan({
      x: clientX - dragStartRef.current.x,
      y: clientY - dragStartRef.current.y
    });
  };

  const handleDragEnd = () => setIsDragging(false);

  const handleResetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleTargetStartup = async (startup: StartupRecord) => {
    setSelectedStartup(startup);
    setTwinReport(null);
    setIsScanning(true);
    
    // Auto-center target
    setScale(1.5);
    // Find index for basic positioning focus
    const idx = startups.findIndex(s => s.id === startup.id);
    const gridSize = 160;
    const px = (idx % 5) * gridSize + 120;
    const py = Math.floor(idx / 5) * gridSize + 120;
    
    // Exact centering: Plane is 1000x1000 (center is 500x500). Block size is 128x128.
    const blockCenterX = px + 64;
    const blockCenterY = py + 64;
    
    setPan({ 
       x: 500 - blockCenterX, 
       y: 500 - blockCenterY 
    });

    try {
      const report = await generateDigitalTwinReport(startup.name, startup.industry, startup.stage, startup.description);
      setTwinReport(report);
    } catch (e) {
      console.error(e);
      setTwinReport({
        pulse: "لم نتمكن من تحليل البيانات الحالية، يرجى المحاولة لاحقاً.",
        tech: "الأنظمة الداخلية غير متاحة.",
        synergy: "غير محدد حالياً بناءً على بيانات السوق.",
        roadmap: "مسار التطور غير واضح في هذه اللحظة."
      });
    } finally {
      setIsScanning(false);
    }
  };

  const filteredStartups = startups.filter(s => {
    if (searchQuery && !s.name.includes(searchQuery) && !s.industry.includes(searchQuery)) return false;
    if (category !== 'all' && s.industry !== category) return false;
    if (status !== 'all' && s.stage !== status) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-brand-bg font-sans flex text-brand-primary" dir="rtl">
      {/* Sidebar Controls */}
      <aside className="w-80 bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col relative shrink-0">
         <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-brand-primary">خريطة الأعمال</h2>
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
               <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
         </div>

         <div className="p-6 space-y-6 flex-1 overflow-y-auto hide-scrollbar">
            {/* Search */}
            <div className="relative">
               <input 
                  type="text" 
                  placeholder="ابحث عن شركة، تصنيف، أو اسأل الذكاء الاصطناعي..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-brand-primary focus:bg-white transition-all shadow-sm"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
               />
               <Search className="w-4 h-4 absolute left-3 top-3.5 text-brand-primary" />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-3">
               <select 
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs text-slate-600 outline-none focus:border-brand-primary"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
               >
                 <option value="all">كل التصنيفات</option>
                 <option value="تقنية">التقنية</option>
                 <option value="صحة">الصحة</option>
                 <option value="تعليم">التعليم</option>
                 <option value="مالية">المالية</option>
               </select>

               <select 
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs text-slate-600 outline-none focus:border-brand-primary"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
               >
                 <option value="all">كل الحالات</option>
                 <option value="IDEA">فكرة</option>
                 <option value="MVP">نموذج أولي</option>
                 <option value="GROWTH">نمو</option>
               </select>
            </div>

            {/* Featured Companies Toggle */}
            <button className="w-full py-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-sm text-brand-primary transition-all flex items-center justify-center gap-2">
               <Heart className="w-4 h-4 text-brand-gray" />
               شركات مميزة
            </button>

            {/* AI Trends Action */}
            <button className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95">
               <Sparkles className="w-4 h-4" />
               تحليل الاتجاهات (AI)
            </button>

            <hr className="border-slate-100" />

            {/* View Modes */}
            <div className="space-y-2">
               <button 
                  onClick={() => setViewMode('standard')}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${viewMode === 'standard' ? 'bg-brand-hover text-white shadow-lg shadow-brand-primary/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'}`}
               >
                  الوضع القياسي
               </button>
               <button 
                  onClick={() => setViewMode('heatmap')}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${viewMode === 'heatmap' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'}`}
               >
                  الخريطة الحرارية
               </button>
               <button 
                  onClick={() => setViewMode('traffic')}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${viewMode === 'traffic' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'}`}
               >
                  حركة المرور
               </button>
               <button 
                  onClick={() => setViewMode('networking')}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wide ${viewMode === 'networking' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'}`}
               >
                  Networking Mode
               </button>
               <button 
                  onClick={() => setViewMode('globe')}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wide ${viewMode === 'globe' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'}`}
               >
                  Globe 🌍
               </button>
            </div>
         </div>
      </aside>

      {/* Main 3D Map Area */}
      <main 
         className="flex-1 relative overflow-hidden bg-slate-50/50 flex items-center justify-center pointer-events-auto touch-none"
         onWheel={handleWheel}
         onMouseDown={handleDragStart}
         onMouseMove={handleDragMove}
         onMouseUp={handleDragEnd}
         onMouseLeave={handleDragEnd}
         onTouchStart={handleDragStart}
         onTouchMove={handleDragMove}
         onTouchEnd={handleDragEnd}
         ref={containerRef}
      >
         {/* Background gradient/pattern */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 via-slate-50/20 to-slate-100 opacity-60 pointer-events-none" />
         
         {/* Top Right Zoom Controls */}
         <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200">
            <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-3 hover:bg-slate-100 rounded-xl transition-all text-slate-600 hover:text-brand-primary">
               <ZoomIn className="w-5 h-5" />
            </button>
            <div className="h-px w-8 mx-auto bg-slate-200" />
            <button onClick={() => setScale(s => Math.max(0.2, s - 0.2))} className="p-3 hover:bg-slate-100 rounded-xl transition-all text-slate-600 hover:text-brand-primary">
               <ZoomOut className="w-5 h-5" />
            </button>
            <div className="h-px w-8 mx-auto bg-slate-200" />
            <button onClick={handleResetView} className="p-3 hover:bg-slate-100 rounded-xl transition-all text-slate-600 hover:text-brand-primary">
               <Maximize className="w-5 h-5" />
            </button>
            <div className="text-[10px] font-bold text-center mt-1 text-brand-gray">
               {Math.round(scale * 100)}%
            </div>
         </div>

         {/* Isometric Plane Container */}
         <div className="relative w-full h-[1200px] max-w-[1200px] flex items-center justify-center transition-transform" style={{ perspective: '1500px' }}>
            <motion.div 
               initial={{ opacity: 0, scale: 0.8, rotateX: 60, rotateZ: 45 }}
               animate={{ 
                  opacity: 1, 
                  scale,
                  x: pan.x,
                  y: pan.y,
                  rotateX: 60,
                  rotateZ: 45
               }}
               transition={isDragging ? { type: 'tween', duration: 0 } : { type: 'spring', damping: 25, stiffness: 200, mass: 0.5 }}
               className={`relative w-[1000px] h-[1000px] bg-white rounded-3xl shadow-2xl ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
               style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '40px 40px 80px rgba(0,0,0,0.06)'
               }}
            >
               {/* Grid Pattern on Plane */}
               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                  backgroundSize: '100px 100px'
               }} />

               {/* Render Dummy "Nodes" for aesthetics if list is small */}
               {Array.from({length: 16}).map((_, i) => (
                   <div key={`dummy-${i}`} className="absolute w-2 h-2 bg-slate-200 rounded-full" 
                        style={{
                           left: `${(i % 4) * 200 + 150}px`,
                           top: `${Math.floor(i / 4) * 200 + 150}px`,
                           transform: 'translateZ(1px)'
                        }} />
               ))}

               {filteredStartups.length > 0 ? filteredStartups.map((startup, idx) => {
                  const gridSize = 160;
                  const x = (idx % 5) * gridSize + 120;
                  const y = Math.floor(idx / 5) * gridSize + 120;
                  const isSelected = selectedStartup?.id === startup.id;
                  
                  return (
                     <div 
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); handleTargetStartup(startup); }}
                        className={`absolute w-32 h-32 rounded-xl shadow-xl flex items-center justify-center group cursor-pointer ${isSelected ? 'bg-indigo-600' : 'bg-white hover:bg-brand-primary'}`}
                        style={{
                           left: `${x}px`,
                           top: `${y}px`,
                           transform: `translateZ(${viewMode === 'heatmap' ? Math.random() * 50 + 10 : (isSelected ? 50 : 20)}px)`,
                           transformStyle: 'preserve-3d',
                           transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s'
                        }}
                     >
                        {/* Shadow element (fake ambient occlusion) */}
                        <div className="absolute -bottom-4 right-0 w-full h-full bg-black/10 blur-md rounded-xl" style={{ transform: `translateZ(-${isSelected ? 49 : 19}px)` }} />

                        {/* Top Face / Content projected back to camera */}
                        <div 
                           className={`absolute -top-16 left-1/2 w-48 text-center text-brand-primary transition-transform origin-bottom ${isSelected ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}
                           style={{ 
                              transform: 'translateX(-50%) rotateZ(-45deg) rotateX(-60deg)',
                           }}
                        >
                           <div className={`p-4 rounded-2xl shadow-xl border text-center flex flex-col items-center ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl mb-2 ${isSelected ? 'bg-indigo-200 text-indigo-700' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                 {startup.name.substring(0,1)}
                              </div>
                              <h4 className="font-bold text-sm text-brand-primary mb-1">{startup.name}</h4>
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${isSelected ? 'text-indigo-600 bg-indigo-100' : 'text-brand-hover bg-brand-primary/5'}`}>{startup.industry}</span>
                              <p className="text-[10px] text-slate-500 mt-2 font-medium line-clamp-2">{startup.description}</p>
                           </div>
                        </div>

                        {/* The Box content itself (just initials as logo) */}
                        <div className={`text-3xl font-bold ${isSelected ? 'text-brand-primary/40' : 'text-brand-primary/50 group-hover:text-brand-primary/20'}`} style={{ transform: 'translateZ(1px)' }}>
                           {startup.name.substring(0, 1)}
                        </div>
                     </div>
                  )
               }) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotateZ(-45deg) rotateX(-60deg) translateZ(40px)' }}>
                      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl text-center shadow-xl border border-slate-100">
                          <Globe className="w-16 h-16 text-brand-primary mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-brand-primary">لم تنضم أي شركات بعد</h3>
                      </div>
                  </div>
               )}
            </motion.div>
         </div>

         {/* Digital Twin Report Overlay */}
         <AnimatePresence>
            {selectedStartup && (
               <motion.div 
                  initial={{ x: -400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -400, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute bottom-0 left-0 top-0 w-[400px] bg-white border-r border-brand-primary/20 shadow-2xl z-30 flex flex-col pointer-events-auto"
               >
                  <div className="p-6 border-b border-brand-primary/20 flex items-start justify-between absolute w-full top-0 bg-white/80 backdrop-blur-md z-10">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-2xl font-bold text-brand-primary">{selectedStartup.name}</h3>
                           <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Target Locked</span>
                        </div>
                        <p className="text-xs text-brand-gray font-medium">{selectedStartup.industry} • {selectedStartup.stage === 'IDEA' ? 'مرحلة الفكرة' : selectedStartup.stage === 'MVP' ? 'نموذج أولي' : 'مرحلة النمو'}</p>
                     </div>
                     <button onClick={() => setSelectedStartup(null)} className="p-2 bg-brand-primary/5 hover:bg-brand-primary/10 rounded-full transition-colors text-brand-gray hover:text-white">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto mt-[100px] p-6 hide-scrollbar space-y-8">
                     {/* Data Diagnostics Loading */}
                     {isScanning ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center space-y-6">
                           <div className="relative">
                              <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse" />
                              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin relative z-10" />
                           </div>
                           <div className="space-y-2">
                              <h4 className="text-indigo-400 font-bold tracking-widest uppercase text-sm">Initiating Deep Scan</h4>
                              <p className="text-slate-500 text-xs font-medium">جاري استخراج وتحليل بيانات التوأم الرقمي عبر نموذج Gemini Flash...</p>
                           </div>
                        </div>
                     ) : twinReport ? (
                        <div className="space-y-8 text-right">
                           <div className="flex items-center gap-3 border-b border-brand-primary/10 pb-4">
                              <Activity className="w-5 h-5 text-indigo-400" />
                              <h4 className="text-lg font-bold text-brand-primary">Status Pulse<span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1">نبض الحالة</span></h4>
                           </div>
                           <p className="text-slate-600 text-sm leading-relaxed font-medium bg-brand-primary/5 p-5 rounded-2xl border border-brand-primary/10">{twinReport.pulse}</p>

                           <div className="flex items-center gap-3 border-b border-brand-primary/10 pb-4">
                              <Network className="w-5 h-5 text-indigo-400" />
                              <h4 className="text-lg font-bold text-brand-primary">Technological Edge<span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1">الميزة التقنية</span></h4>
                           </div>
                           <p className="text-slate-600 text-sm leading-relaxed font-medium bg-brand-primary/5 p-5 rounded-2xl border border-brand-primary/10">{twinReport.tech}</p>

                           <div className="flex items-center gap-3 border-b border-brand-primary/10 pb-4">
                              <Globe className="w-5 h-5 text-indigo-400" />
                              <h4 className="text-lg font-bold text-brand-primary">Ecosystem Synergy<span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1">توافق النظام البيئي</span></h4>
                           </div>
                           <p className="text-slate-600 text-sm leading-relaxed font-medium bg-brand-primary/5 p-5 rounded-2xl border border-brand-primary/10">{twinReport.synergy}</p>

                           <div className="flex items-center gap-3 border-b border-brand-primary/10 pb-4">
                              <Sparkles className="w-5 h-5 text-indigo-400" />
                              <h4 className="text-lg font-bold text-brand-primary">Six-Month Roadmap<span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1">رؤية الستة أشهر</span></h4>
                           </div>
                           <p className="text-slate-600 text-sm leading-relaxed font-medium bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">{twinReport.roadmap}</p>
                        </div>
                     ) : null}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </main>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
