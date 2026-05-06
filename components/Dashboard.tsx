
import React, { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Calendar, 
  Briefcase, 
  BookOpen, 
  CheckSquare, 
  Compass, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  Users,
  Star,
  ChevronLeft,
  Search,
  Zap,
  Award,
  BarChart,
  Layout,
  ArrowRight,
  Rocket,
  Bell,
  Menu,
  Layers,
  FileText,
  Lock
} from 'lucide-react';
import { LevelData, UserProfile, DIGITAL_SHIELDS, SECTORS, TaskRecord, SERVICES_CATALOG, ServiceItem, ServicePackage, ServiceRequest, OpportunityAnalysis, MOCK_MENTORS, ProjectBuildData, UserRecord, StartupRecord } from '../types';
import { storageService } from '../services/storageService';
import { discoverOpportunities, generateSWOTAnalysis, generateGrowthProjection, runProjectAgents, generateMarketingPlan, generateSalesPlan, generateOperationalPlan, createAIMentorChat } from '../services/geminiService';
import { playPositiveSound, playCelebrationSound, playErrorSound } from '../services/audioService';
import Markdown from 'react-markdown';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';

interface DashboardProps {
  user: UserProfile;
  levels: LevelData[];
  onSelectLevel: (id: number) => void;
  onShowCertificate: () => void;
  onLogout?: () => void;
  onOpenProAnalytics?: () => void;
  onUpdateLevelUI?: (id: number, icon: string, color: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
  { id: 'mentorship', label: 'الإرشاد والموجّهين', icon: <Calendar className="w-5 h-5" /> },
  { id: 'growth', label: 'تحليل النمو', icon: <BarChart className="w-5 h-5" /> },
  { id: 'swot', label: 'تحليل SWOT', icon: <Layout className="w-5 h-5" /> },
  { id: 'bootcamp', label: 'المنهج التدريبي', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'tasks', label: 'المهام', icon: <CheckSquare className="w-5 h-5" /> },
  { id: 'opportunity_lab', label: 'مختبر الفرص', icon: <Compass className="w-5 h-5" /> },
  { id: 'project_builder', label: 'بناء المشروع (AI)', icon: <Layers className="w-5 h-5" /> },
  { id: 'plans', label: 'صانع الخطط الاستراتيجية', icon: <FileText className="w-5 h-5" /> },
  { id: 'services', label: 'الخدمات', icon: <Settings className="w-5 h-5" /> }, 
  { id: 'startup_profile', label: 'ملف الشركة', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'admin_panel', label: 'لوحة الإدارة', icon: <Settings className="w-5 h-5" />, adminOnly: true },
];

const PRESET_COLORS = [
  { name: 'أزرق', class: 'bg-brand-primary' },
  { name: 'أخضر', class: 'bg-emerald-600' },
  { name: 'أحمر', class: 'bg-rose-600' },
  { name: 'بنفسجي', class: 'bg-indigo-600' },
  { name: 'برتقالي', class: 'bg-orange-500' },
  { name: 'ذهبي', class: 'bg-amber-500' },
  { name: 'وردي', class: 'bg-pink-600' },
  { name: 'سحابي', class: 'bg-brand-bg0' },
];

export const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, levels, onSelectLevel, onShowCertificate, onLogout, onOpenProAnalytics, onUpdateLevelUI }) => {
  const [notifications, setNotifications] = useState<{id: string, text: string, type: 'success' | 'info'}[]>([]);

  const addNotification = (text: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'ليلة سعيدة';
  };

  const [activeNav, setActiveNav] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('dashboard_theme_mode') as any) || 'light');
  
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUser);
  const [userTasks, setUserTasks] = useState<TaskRecord[]>([]);
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [requestDetails, setRequestDetails] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Customization States
  const [editingLevel, setEditingLevel] = useState<LevelData | null>(null);
  const [customIcon, setCustomIcon] = useState('');
  const [customColor, setCustomColor] = useState('');

  // Opportunity Lab States
  const [oppResult, setOppResult] = useState<OpportunityAnalysis | null>(null);
  const [projectBuild, setProjectBuild] = useState<ProjectBuildData | null>(null);
  const [isBuildingProject, setIsBuildingProject] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['a1', 'a2']);
  const [isAnalyzingOpp, setIsAnalyzingOpp] = useState(false);
  
  // Strategy Plans States
  const [activePlanType, setActivePlanType] = useState<'marketing' | 'sales' | 'ops' | null>(null);
  const [planResult, setPlanResult] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planInput, setPlanInput] = useState('');

  // SWOT States
  const [swotResult, setSwotResult] = useState<{ strengths: string[], weaknesses: string[], opportunities: string[], threats: string[] } | null>(null);
  const [isAnalyzingSWOT, setIsAnalyzingSWOT] = useState(false);

  // Admin States
  const [adminRequests, setAdminRequests] = useState<ServiceRequest[]>([]);
  const [adminUsers, setAdminUsers] = useState<{ user: UserRecord; startup: StartupRecord | undefined }[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [selectedAdminRequestId, setSelectedAdminRequestId] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<'requests' | 'users' | 'content'>('requests');
  // Content Editing States
  const [contentCategory, setContentCategory] = useState<'none' | 'services' | 'levels' | 'mentors'>('none');
  const [siteServices, setSiteServices] = useState<ServiceItem[]>([]);
  const [siteLevels, setSiteLevels] = useState<LevelData[]>([]);
  const [siteMentors, setSiteMentors] = useState<any[]>([]);

  // Chat States
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatMentor, setSelectedChatMentor] = useState<any>(null);
  const [chatSession, setChatSession] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatTyping]);

  const handleStartChat = async (mentor: any) => {
    setSelectedChatMentor(mentor);
    setShowChatModal(true);
    setChatMessages([]);
    setIsChatTyping(true);
    playPositiveSound();

    try {
      const prompt = `أهلاً، أنا رائد أعمال واسم مشروعي هو ${userProfile.startupName || 'مشروع جديد'}. هل يمكنك مساعدتي؟`;
      const systemPrompt = mentor.systemPrompt || 'أنت مرشد أعمال.';
      const chat = createAIMentorChat(systemPrompt);
      setChatSession(chat);
      setChatMessages([{ role: 'user', text: prompt }]);
      
      const result = await chat.sendMessage({ message: prompt });
      setChatMessages([
        { role: 'user', text: prompt },
        { role: 'model', text: result.text }
      ]);
    } catch (error) {
      console.error(error);
      setChatMessages([{ role: 'user', text: 'مرحباً' }, { role: 'model', text: 'عذراً، حدث خطأ في الاتصال بالمرشد الذكي.' }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatSession || isChatTyping) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsChatTyping(true);

    try {
      const result = await chatSession.sendMessage({ message: userText });
      setChatMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (error) {
       console.error("Chat Error", error);
       playErrorSound();
       setChatMessages(prev => [...prev, { role: 'model', text: 'عذراً، حدث خطأ، هل يمكنك المحاولة مرة أخرى؟' }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Editing Content states
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editingMentor, setEditingMentor] = useState<any | null>(null);
  const [editingSiteLevel, setEditingSiteLevel] = useState<LevelData | null>(null);

  // Growth States
  const [growthData, setGrowthData] = useState<{ month: string, users: number, revenue: number }[]>([]);
  const [isSimulatingGrowth, setIsSimulatingGrowth] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedCount = siteLevels.filter(l => l.isCompleted).length;
  const progress = (siteLevels.length > 0 ? (completedCount / siteLevels.length) : 0) * 100;
  const isDark = themeMode === 'dark';

  useEffect(() => {
    const session = storageService.getCurrentSession();
    if (session) {
      const tasks = storageService.getUserTasks(session.uid);
      setUserTasks(tasks);
      const requests = storageService.getUserServiceRequests(session.uid);
      setUserRequests(requests);

      const startups = storageService.getAllStartups();
      const currentStartup = startups.find(s => s.projectId === session.projectId);
      if (currentStartup) {
        setUserProfile(prev => ({
          ...prev,
          startupName: currentStartup.name,
          startupDescription: currentStartup.description,
          industry: currentStartup.industry,
          logo: localStorage.getItem(`logo_${session.uid}`) || undefined
        }));
      }

      // Load AI Analysis Results
      const savedSwot = storageService.getAIAnalysis(session.uid, 'swot');
      if (savedSwot) setSwotResult(savedSwot);
      
      const savedGrowth = storageService.getAIAnalysis(session.uid, 'growth');
      if (savedGrowth) setGrowthData(savedGrowth);

      const savedOpp = storageService.getAIAnalysis(session.uid, 'opportunity');
      if (savedOpp) setOppResult(savedOpp);

      const savedProjectBuild = storageService.getAIAnalysis(session.uid, 'project_build' as any);
      if (savedProjectBuild) setProjectBuild({
        projectName: currentStartup?.name || '',
        description: currentStartup?.description || '',
        quality: 'Professional',
        selectedAgents: [],
        results: savedProjectBuild
      });

      const savedMarketingPlan = storageService.getAIAnalysis(session.uid, 'marketing_plan' as any);
      const savedSalesPlan = storageService.getAIAnalysis(session.uid, 'sales_plan' as any);
      const savedOpsPlan = storageService.getAIAnalysis(session.uid, 'ops_plan' as any);
      if (activeNav === 'plans') {
        if (activePlanType === 'marketing' && savedMarketingPlan) setPlanResult(savedMarketingPlan);
        if (activePlanType === 'sales' && savedSalesPlan) setPlanResult(savedSalesPlan);
        if (activePlanType === 'ops' && savedOpsPlan) setPlanResult(savedOpsPlan);
      }

      if (activeNav === 'admin_panel' && userProfile.isAdmin) {
        setAdminRequests(storageService.getAllServiceRequests());
        setAdminUsers(storageService.getAllUsersWithStartups());
      }
    }
    
    // Always load content
    setSiteServices(storageService.getSiteServices(SERVICES_CATALOG));
    setSiteLevels(storageService.getSiteLevels(levels));
    setSiteMentors(storageService.getSiteMentors(MOCK_MENTORS));
  }, [activeNav, activePlanType, levels, userProfile.isAdmin]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUserProfile(prev => ({ ...prev, logo: base64 }));
        const session = storageService.getCurrentSession();
        if (session) localStorage.setItem(`logo_${session.uid}`, base64);
        playPositiveSound();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    const session = storageService.getCurrentSession();
    if (session) {
      const startups = storageService.getAllStartups();
      const index = startups.findIndex(s => s.projectId === session.projectId);
      if (index > -1) {
        startups[index].name = userProfile.startupName;
        startups[index].description = userProfile.startupDescription;
        startups[index].industry = userProfile.industry;
        localStorage.setItem('db_startups', JSON.stringify(startups));
      }
    }
    setTimeout(() => {
      setIsSaving(false);
      playCelebrationSound();
      addNotification('تم تحديث بيانات الشركة بنجاح!', 'success');
    }, 800);
  };

  const handleTaskSubmit = () => {
    if (!selectedTask || !submissionText.trim()) return;
    const session = storageService.getCurrentSession();
    storageService.submitTask(session.uid, selectedTask.id, submissionText);
    setUserTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: 'SUBMITTED' } : t));
    setSelectedTask(null);
    setSubmissionText('');
    playPositiveSound();
  };

  const handleServiceRequest = () => {
    if (!selectedService || !selectedPackage) return;
    setIsRequesting(true);
    const session = storageService.getCurrentSession();
    
    setTimeout(() => {
      const newReq = storageService.requestService(session.uid, userProfile.startupName, selectedService.id, selectedPackage.id, requestDetails);
      setUserRequests(prev => [...prev, newReq]);
      setIsRequesting(false);
      setSelectedService(null);
      setSelectedPackage(null);
      setRequestDetails('');
      playCelebrationSound();
      addNotification('تم إرسال طلب الخدمة بنجاح، فريقنا سيتواصل معك.', 'success');
    }, 1200);
  };

  const handleRunProjectBuilder = async () => {
    if (selectedAgents.length === 0) return addNotification('يرجى اختيار عميل ذكي واحد على الأقل.', 'info');
    setIsBuildingProject(true);
    playPositiveSound();
    try {
      const result = await runProjectAgents(userProfile.startupName, userProfile.startupDescription, selectedAgents);
      setProjectBuild({
        projectName: userProfile.startupName,
        description: userProfile.startupDescription,
        quality: 'Professional',
        selectedAgents,
        results: result
      });
      const session = storageService.getCurrentSession();
      if (session) storageService.saveAIAnalysis(session.uid, 'project_build' as any, result);
      playCelebrationSound();
      addNotification('تم بناء استراتيجية المشروع بنجاح!', 'success');
    } catch (e) {
      addNotification('فشل بناء استراتيجية المشروع.', 'info');
    } finally {
      setIsBuildingProject(false);
    }
  };

  const handleUpdateRequestStatus = (_userId: string, requestId: string, status: ServiceRequest['status']) => {
    storageService.updateRequestStatus(requestId, status);
    setAdminRequests(storageService.getAllServiceRequests());
    addNotification(`تم تحديث حالة الطلب إلى: ${status}`, 'success');
  };

  const handleSaveAdminResponse = (requestId: string) => {
    if (!adminResponseText.trim()) return;
    storageService.saveAdminResponse(requestId, adminResponseText);
    setAdminRequests(storageService.getAllServiceRequests());
    setSelectedAdminRequestId(null);
    setAdminResponseText('');
    addNotification('تم إرسال الرد للعميل بنجاح', 'success');
  };

  // Content Management Helpers
  const handleSaveSiteService = (service: ServiceItem) => {
    const updated = siteServices.map(s => s.id === service.id ? service : s);
    setSiteServices(updated);
    storageService.saveSiteServices(updated);
    setEditingService(null);
    addNotification('تم تحديث الخدمة بنجاح!', 'success');
    playPositiveSound();
  };

  const handleSaveSiteLevel = (level: LevelData) => {
    const updated = siteLevels.map(l => l.id === level.id ? level : l);
    setSiteLevels(updated);
    storageService.saveSiteLevels(updated);
    setEditingSiteLevel(null);
    addNotification('تم تحديث المستوى بنجاح!', 'success');
    playPositiveSound();
  };

  const handleSaveSiteMentor = (mentor: any) => {
    const updated = siteMentors.map(m => m.id === mentor.id ? mentor : m);
    setSiteMentors(updated);
    storageService.saveSiteMentors(updated);
    setEditingMentor(null);
    addNotification('تم تحديث بيانات المرشد بنجاح!', 'success');
    playPositiveSound();
  };

  const filteredNavItems = NAV_ITEMS.filter(item => {
    const matchesSearch = item.label.includes(searchQuery) || item.id.includes(searchQuery);
    if (!matchesSearch) return false;
    if (item.adminOnly && !userProfile.isAdmin) return false;
    return true;
  });

  const filteredLevels = siteLevels.filter(level => 
    level.title.includes(searchQuery) || level.description.includes(searchQuery)
  );

  const handleRunOppAnalysis = async () => {
    setIsAnalyzingOpp(true);
    playPositiveSound();
    try {
      const result = await discoverOpportunities(userProfile.startupName, userProfile.startupDescription, userProfile.industry);
      setOppResult(result);
      const session = storageService.getCurrentSession();
      if (session) storageService.saveAIAnalysis(session.uid, 'opportunity', result);
      playCelebrationSound();
      addNotification('تم العثور على فرص نمو واعدة لمشروعك!', 'success');
    } catch (e) {
      addNotification("فشل التحليل الاستراتيجي للفرص.", 'info');
    } finally {
      setIsAnalyzingOpp(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!activePlanType) return;
    setIsGeneratingPlan(true);
    playPositiveSound();
    try {
      let result = '';
      if (activePlanType === 'marketing') {
        result = await generateMarketingPlan(userProfile.startupName, userProfile.startupDescription, planInput || 'الجمهور المستهدف العام المهتم بالتقنية');
      } else if (activePlanType === 'sales') {
        result = await generateSalesPlan(userProfile.startupName, userProfile.startupDescription, planInput || 'نموذج الاشتراك الشهري (SaaS)');
      } else {
        result = await generateOperationalPlan(userProfile.startupName, userProfile.startupDescription, planInput || 'التوسع الرقمي وإدارة الفريق التقني');
      }
      setPlanResult(result);
      const session = storageService.getCurrentSession();
      if (session) storageService.saveAIAnalysis(session.uid, `${activePlanType}_plan` as any, result);
      playCelebrationSound();
      addNotification('تم إنشاء الخطة بنجاح!', 'success');
    } catch (e) {
      addNotification('فشل إنشاء الخطة، يرجى المحاولة لاحقاً', 'info');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleRunSWOT = async () => {
    setIsAnalyzingSWOT(true);
    playPositiveSound();
    try {
      const result = await generateSWOTAnalysis(userProfile.startupName, userProfile.startupDescription, userProfile.industry);
      setSwotResult(result);
      const session = storageService.getCurrentSession();
      if (session) storageService.saveAIAnalysis(session.uid, 'swot', result);
      playCelebrationSound();
      addNotification('تم الانتهاء من تحليل SWOT بنجاح!', 'success');
    } catch (e) {
      addNotification('حدث خطأ أثناء إجراء التحليل.', 'info');
    } finally {
      setIsAnalyzingSWOT(false);
    }
  };

  const handleSimulateGrowth = async () => {
    setIsSimulatingGrowth(true);
    playPositiveSound();
    try {
      const result = await generateGrowthProjection(userProfile.startupName, userProfile.startupDescription, userProfile.industry);
      setGrowthData(result.months);
      const session = storageService.getCurrentSession();
      if (session) storageService.saveAIAnalysis(session.uid, 'growth', result.months);
      playCelebrationSound();
      addNotification('تم إنشاء محاكاة النمو بنجاح!', 'success');
    } catch (e) {
      addNotification('فشل محاكاة النمو، حاول مرة أخرى.', 'info');
    } finally {
      setIsSimulatingGrowth(false);
    }
  };

  const AVAILABLE_AGENTS_DASHBOARD = [
    { id: 'a1', name: 'محلل الرؤية', icon: '🔭', desc: 'تحديد وضوح الهدف وقابلية التوسع.' },
    { id: 'a2', name: 'خبير السوق', icon: '🏢', desc: 'تحليل المنافسين والطلب الحالي.' },
    { id: 'a3', name: 'مصمم المستخدمين', icon: '👥', desc: 'بناء ملفات تعريف دقيقة للعملاء.' },
    { id: 'a4', name: 'محلل الفرص', icon: '💰', desc: 'تقييم الجاهزية الاستثمارية للنمو.' },
  ];

  const handleSaveCustomization = () => {
    if (editingLevel && onUpdateLevelUI) {
      onUpdateLevelUI(editingLevel.id, customIcon, customColor);
      setEditingLevel(null);
      playPositiveSound();
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-brand-bg text-brand-primary dark' : 'bg-slate-50 text-brand-primary'} font-sans`} dir="rtl">
      <div className="fixed inset-0 -z-10 bg-mesh opacity-30" />

      {/* Notifications Portal */}
      <div className="fixed top-6 right-6 z-[100] pointer-events-none space-y-4">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 bg-white/90 shadow-sm border-b border-brand-primary/10 min-w-[300px] pointer-events-auto ${n.type === 'success' ? 'border-emerald-500/20' : 'border-brand-primary/20'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${n.type === 'success' ? 'bg-emerald-500 text-brand-primary' : 'bg-brand-hover text-white'}`}>
                {n.type === 'success' ? '✓' : 'ℹ'}
              </div>
              <p className="text-sm font-bold">{n.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 lg:static transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} ${isDark ? 'bg-brand-primary/50 border-slate-900/5 dark:border-brand-primary/10' : 'bg-white border-slate-200'} border-l backdrop-blur-xl flex flex-col shadow-2xl`}>
        <div className="p-8 text-center border-b border-slate-900/5 dark:border-brand-primary/10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="w-20 h-20 mx-auto mb-4 bg-brand-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-primary/20 overflow-hidden border-4 border-slate-900/10 dark:border-brand-primary/20"
          >
            {userProfile.logo ? (
              <img src={userProfile.logo} className="w-full h-full object-cover" />
            ) : (
              <Zap className="w-10 h-10 text-brand-primary fill-brand-primary" />
            )}
          </motion.div>
          <h2 className="font-bold text-sm truncate uppercase tracking-tighter">{userProfile.startupName}</h2>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-white rounded-full text-[10px] font-bold border border-brand-primary/20">
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
            <span>نشط الآن</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => { setActiveNav(item.id); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all group ${activeNav === item.id ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'text-slate-500 hover:bg-brand-primary/5 dark:bg-brand-primary/5 hover:text-slate-200'}`}
            >
              <div className="flex items-center gap-4">
                <span className={`transition-transform duration-300 ${activeNav === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </div>
              {activeNav === item.id && (
                <motion.div layoutId="activeNav" className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-900/5 dark:border-brand-primary/10 space-y-3">
          <button 
            onClick={() => { const n = isDark ? 'light' : 'dark'; setThemeMode(n); localStorage.setItem('dashboard_theme_mode', n); }} 
            className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl border border-slate-900/5 dark:border-brand-primary/10 text-xs font-bold hover:bg-brand-primary/5 dark:bg-brand-primary/5 transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{isDark ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
          </button>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 p-3.5 text-rose-500 font-bold text-xs hover:bg-rose-500/10 rounded-2xl transition-all">
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 border-b border-slate-900/5 dark:border-brand-primary/10 flex items-center justify-between px-8 bg-white/90 shadow-sm border-b border-brand-primary/10 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-white shadow-sm border border-brand-primary/10 rounded-xl">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col text-right">
              <h2 className="text-sm font-bold text-brand-primary dark:text-brand-primary leading-none mb-1">{getGreeting()}، {userProfile.name} 👋</h2>
              <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest leading-none">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-brand-primary/10 rounded-xl border-slate-900/5 dark:border-brand-primary/10 group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Search className="w-4 h-4 text-brand-gray group-focus-within:text-brand-hover transition-colors" />
                <input 
                  type="text" 
                  placeholder="ابحث عن أداة أو ملف..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-bold w-48 text-right focus:ring-0"
                />
             </div>
             
             <button 
               className="p-2.5 bg-white shadow-sm border border-brand-primary/10 rounded-xl hover:bg-brand-primary/10 transition-all relative group/notify"
               onClick={() => addNotification('لا توجد تنبيهات جديدة حالياً', 'info')}
             >
                <div className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2 border-2 border-slate-900 shadow-sm" />
                <Bell className="w-4 h-4 text-slate-500 group-hover/notify:text-brand-primary" />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <AnimatePresence mode="wait">
             <motion.div 
               key={activeNav}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="min-h-full"
             >
                {activeNav === 'mentorship' && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-20">
                    <div className="text-right space-y-4">
                      <h3 className="text-3xl font-bold">شبكة الموجّهين والخبراء</h3>
                      <p className="text-slate-500 max-w-2xl font-medium leading-relaxed">
                        تواصل مع رواد أعمال ومستثمرين وخبراء تقنيين لمساعدتك في تخطي عوائق النمو وتسريع نجاح مشروعك.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {siteMentors.map((mentor, idx) => (
                        <motion.div 
                          key={mentor.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white shadow-sm border border-brand-primary/10 p-10 rounded-[3.5rem] border-slate-900/5 dark:border-brand-primary/10 relative overflow-hidden group text-right flex flex-col justify-between"
                        >
                           <div className="relative z-10">
                              <div className="flex justify-between items-start mb-8">
                                 <div className="relative">
                                    <div className="w-24 h-24 bg-brand-primary rounded-[2.5rem] flex items-center justify-center text-3xl shadow-2xl shadow-brand-primary/20 group-hover:scale-110 transition-transform duration-500">
                                       {mentor.avatar}
                                    </div>
                                    <div className="absolute -bottom-2 -left-2 bg-brand-primary text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm" title="AI Agent">
                                       <span className="text-[10px] font-bold px-1">AI</span>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full mb-2">⭐ {mentor.rating}</span>
                                    <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">مستشار افتراضي</span>
                                 </div>
                              </div>
                              
                              <h4 className="text-2xl font-bold mb-1">{mentor.name}</h4>
                              <p className="text-xs font-bold text-brand-primary mb-4 uppercase tracking-tighter">{mentor.role}</p>
                              
                              <div className="flex flex-wrap gap-2 justify-end mb-6">
                                 {mentor.tags.map((tag: any) => (
                                   <span key={tag} className="text-[9px] font-bold bg-brand-primary/5 dark:bg-brand-primary/5 px-2.5 py-1 rounded-lg text-slate-500">#{tag}</span>
                                 ))}
                              </div>

                              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 h-24 overflow-hidden text-right">
                                 {mentor.bio}
                              </p>
                           </div>

                           <button 
                             onClick={() => handleStartChat(mentor)}
                             className="w-full py-5 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl font-bold text-sm transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
                           >
                              <Calendar className="w-4 h-4" />
                              <span>ابدأ المحادثة الاستشارية</span>
                           </button>

                           <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-colors" />
                        </motion.div>
                      ))}
                    </div>

                    <div className="p-12 bg-white shadow-sm border border-brand-primary/10 rounded-[4rem] border-slate-900/5 dark:border-brand-primary/10 bg-gradient-to-br from-indigo-600/5 to-blue-600/5 text-center space-y-6">
                       <h4 className="text-2xl font-bold italic">"لا أحد ينجح بمفرده في ريادة الأعمال."</h4>
                       <p className="text-slate-500 font-medium">نحن نوفر لك جلسة إرشادية واحدة مجانية شهرياً كجزء من البرنامج التدريبي.</p>
                       <button className="px-10 py-4 border-2 border-brand-primary/20 text-brand-hover hover:bg-brand-primary hover:text-white rounded-full font-bold transition-all">طلب جلسة طارئة (Fast Track)</button>
                    </div>
                  </div>
                )}
                {activeNav === 'growth' && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-20">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-right">
                        <h3 className="text-3xl font-bold mb-2">توقعات النمو المتقدمة</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">محاكاة ذكية لنمو المستخدمين والإيرادات بناءً على قطاع {userProfile.industry}.</p>
                      </div>
                      <button 
                        onClick={handleSimulateGrowth}
                        disabled={isSimulatingGrowth}
                        className="px-10 py-4 bg-brand-primary hover:bg-brand-hover text-white rounded-[2rem] font-bold shadow-2xl shadow-brand-primary/20 transition-all flex items-center gap-3 disabled:opacity-50"
                      >
                        {isSimulatingGrowth ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <>
                            <Rocket className="w-5 h-5" />
                            <span>توليد محاكاة النمو</span>
                          </>
                        )}
                      </button>
                    </div>

                      {!growthData.length && !isSimulatingGrowth && (
                        <div className="flex flex-col items-center justify-center py-32 bg-white shadow-sm border border-brand-primary/10 rounded-[4rem] border-slate-900/5 dark:border-brand-primary/10">
                           <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-8">
                             <BarChart className="w-12 h-12 text-brand-primary" />
                           </div>
                           <h4 className="text-2xl font-bold mb-4">لا توجد محاكاة حالياً</h4>
                           <p className="text-slate-500 max-w-sm text-center font-medium leading-relaxed mb-10">
                             قم ببدء محاكاة النمو لرؤية المسار المتوقع لمشروعك خلال الـ 12 شهراً القادمة.
                           </p>
                           <button 
                             onClick={handleSimulateGrowth}
                             className="px-12 py-5 bg-brand-primary text-white rounded-[2rem] font-bold shadow-2xl hover:bg-brand-primary transition-all flex items-center gap-3"
                           >
                             <Rocket className="w-5 h-5" />
                             <span>بدء المحاكاة الآن</span>
                           </button>
                        </div>
                      )}

                    {growthData.length > 0 && (
                      <div className="grid grid-cols-1 gap-10">
                        <div className="bg-white shadow-sm border border-brand-primary/10 p-10 rounded-[3.5rem] border-slate-900/5 dark:border-brand-primary/10 shadow-xl h-[500px]">
                          <h4 className="text-xl font-bold mb-10 text-right">توقعات الإيرادات الشهرية ($)</h4>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                              <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontVariant="black" axisLine={false} tickLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={10} fontVariant="black" axisLine={false} tickLine={false} />
                              <RechartsTooltip 
                                contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                                labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                              />
                              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="bg-white shadow-sm border border-brand-primary/10 p-10 rounded-[3.5rem] border-slate-900/5 dark:border-brand-primary/10 shadow-xl h-[400px]">
                              <h4 className="text-xl font-bold mb-10 text-right">توقعات نمو المستخدمين</h4>
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData}>
                                  <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <XAxis dataKey="month" hide />
                                  <Area type="stepAfter" dataKey="users" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                  <RechartsTooltip 
                                    contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '1rem', border: 'none' }}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                           </div>
                           
                           <div className="flex flex-col justify-center space-y-6">
                              <div className="p-8 bg-brand-primary/10 rounded-[2.5rem] border border-brand-primary/20">
                                 <h5 className="font-bold text-brand-hover mb-2">إجمالي الإيرادات المتوقعة (عام)</h5>
                                 <p className="text-3xl font-bold text-slate-900 dark:text-brand-primary">
                                    ${growthData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
                                 </p>
                              </div>
                              <div className="p-8 bg-emerald-600/10 rounded-[2.5rem] border border-emerald-600/20">
                                 <h5 className="font-bold text-emerald-500 mb-2">قاعدة المستخدمين المستهدفة</h5>
                                 <p className="text-3xl font-bold text-slate-900 dark:text-brand-primary">
                                    {growthData[growthData.length - 1]?.users.toLocaleString()} مستخدم
                                 </p>
                              </div>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeNav === 'swot' && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-20">
                    <div className="text-center space-y-4">
                      <h3 className="text-3xl font-bold">التحليل الرباعي الذكي (SWOT)</h3>
                      <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        اكتشف نقاط القوة والضعف الداخلية، واقتنص الفرص وواجه التهديدات الخارجية بمساعدة الذكاء الاصطناعي.
                      </p>
                      {!swotResult && !isAnalyzingSWOT && (
                        <button 
                          onClick={handleRunSWOT}
                          className="mt-6 px-12 py-5 bg-white text-brand-primary rounded-[2.5rem] font-bold shadow-2xl hover:bg-indigo-600 transition-all transform active:scale-95"
                        >
                          بدء التحليل الاستراتيجي
                        </button>
                      )}
                    </div>

                    {isAnalyzingSWOT && (
                      <div className="flex flex-col items-center py-20 animate-pulse">
                         <Layout className="w-20 h-20 text-brand-primary mb-6" />
                         <p className="text-xl font-bold text-brand-gray uppercase tracking-widest">Constructing Strategic Matrix...</p>
                      </div>
                    )}

                    {!swotResult && !isAnalyzingSWOT && (
                      <div className="flex flex-col items-center justify-center py-32 bg-white shadow-sm border border-brand-primary/10 rounded-[4rem] border-slate-900/5 dark:border-brand-primary/10 bg-gradient-to-tr from-indigo-500/5 to-transparent">
                         <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center mb-8">
                           <Layout className="w-12 h-12 text-indigo-600" />
                         </div>
                         <h4 className="text-2xl font-bold mb-4">حلل ميزتك التنافسية</h4>
                         <p className="text-slate-500 max-w-sm text-center font-medium leading-relaxed mb-10">
                           استخدم تحليل SWOT لفهم نقاط القوة والضعف الداخلية لمشروعك، وتحديد الفرص والتهديدات في السوق.
                         </p>
                         <button 
                           onClick={handleRunSWOT}
                           className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-indigo-500 transition-all flex items-center gap-3"
                         >
                           <Zap className="w-5 h-5" />
                           <span>تشغيل المحلل الاستراتيجي</span>
                         </button>
                      </div>
                    )}

                    {swotResult && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
                        {/* Strengths */}
                        <div className="p-10 bg-emerald-50 rounded-[3.5rem] border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 group">
                          <h4 className="text-2xl font-bold text-emerald-600 mb-6 flex items-center gap-4">
                            <span className="w-10 h-10 bg-emerald-600 text-brand-primary rounded-2xl flex items-center justify-center text-lg">S</span>
                            نقاط القوة
                          </h4>
                          <ul className="space-y-4">
                            {swotResult.strengths.map((item, i) => (
                              <li key={i} className="flex items-start gap-4 text-brand-primary dark:text-slate-600 font-medium">
                                <span className="text-emerald-500 mt-1">✦</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="p-10 bg-rose-50 rounded-[3.5rem] border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 group">
                          <h4 className="text-2xl font-bold text-rose-600 mb-6 flex items-center gap-4">
                            <span className="w-10 h-10 bg-rose-600 text-brand-primary rounded-2xl flex items-center justify-center text-lg">W</span>
                            نقاط الضعف
                          </h4>
                          <ul className="space-y-4">
                            {swotResult.weaknesses.map((item, i) => (
                              <li key={i} className="flex items-start gap-4 text-brand-primary dark:text-slate-600 font-medium">
                                <span className="text-rose-500 mt-1">✦</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Opportunities */}
                        <div className="p-10 bg-brand-primary/5 rounded-[3.5rem] border border-brand-primary dark:bg-blue-950/20 dark:border-brand-primary/20 group">
                          <h4 className="text-2xl font-bold text-brand-primary mb-6 flex items-center gap-4">
                            <span className="w-10 h-10 bg-brand-primary text-white rounded-2xl flex items-center justify-center text-lg">O</span>
                            الفرص
                          </h4>
                          <ul className="space-y-4">
                            {swotResult.opportunities.map((item, i) => (
                              <li key={i} className="flex items-start gap-4 text-brand-primary dark:text-slate-600 font-medium">
                                <span className="text-brand-hover mt-1">✦</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Threats */}
                        <div className="p-10 bg-amber-50 rounded-[3.5rem] border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 group">
                          <h4 className="text-2xl font-bold text-amber-600 mb-6 flex items-center gap-4">
                            <span className="w-10 h-10 bg-amber-600 text-brand-primary rounded-2xl flex items-center justify-center text-lg">T</span>
                            التهديدات
                          </h4>
                          <ul className="space-y-4">
                            {swotResult.threats.map((item, i) => (
                              <li key={i} className="flex items-start gap-4 text-brand-primary dark:text-slate-600 font-medium">
                                <span className="text-amber-500 mt-1">✦</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeNav === 'home' && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-12">
                    {/* Daily Mission Banner */}
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-[3.5rem] shadow-2xl"
                    >
                      <div className="p-10 bg-white text-brand-primary rounded-[3.2rem] relative overflow-hidden group">
                         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-right">
                               <div className="flex items-center gap-3 mb-4">
                                  <span className="px-3 py-1 bg-brand-primary rounded-full text-[10px] font-bold uppercase tracking-widest">مهمة اليوم</span>
                                  <div className="h-px bg-white/20 w-12" />
                               </div>
                               <h3 className="text-3xl font-bold mb-2">أكمل ملفك التعريفي الذكي 🚀</h3>
                               <p className="text-brand-gray font-medium leading-relaxed max-w-lg">
                                  ملفك التعريفي هو الوقود الذي يغذي أدوات الذكاء الاصطناعي لدينا. أكمله بنسبة 100% للحصول على أدق التحليلات.
                               </p>
                            </div>
                            <button 
                              onClick={() => { setActiveNav('startup_profile'); addNotification('سننتقل الآن لإكمال الملف التعريفي', 'info'); }}
                              className="px-12 py-5 bg-white text-slate-900 rounded-[2rem] font-bold text-sm hover:bg-brand-primary hover:text-white transition-all shadow-3xl active:scale-95 shrink-0"
                            >
                              اذهب إلى الملف الشخصي
                            </button>
                         </div>
                         <Zap className="absolute -bottom-10 -left-10 w-64 h-64 text-brand-primary/5 -rotate-12 transition-transform group-hover:rotate-0 duration-700 pointer-events-none" />
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.1 }}
                         className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] text-brand-primary shadow-2xl relative overflow-hidden"
                       >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 dark:bg-brand-primary/10 rounded-full blur-[40px]" />
                          <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                              <p className="text-[11px] font-bold uppercase opacity-60 tracking-[0.2em]">نسبة الإنجاز المحققة</p>
                              <h3 className="text-3xl font-bold mt-2">{Math.round(progress)}%</h3>
                            </div>
                            <div className="mt-8 space-y-2">
                               <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full bg-white shadow-[0_0_10px_white]"
                                  />
                               </div>
                               <p className="text-[10px] font-bold opacity-60">أحسنت! أنت تتقدم بشكل رائع</p>
                            </div>
                          </div>
                       </motion.div>

                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.2 }}
                         className="p-8 bg-white shadow-sm border border-brand-primary/10 rounded-[3rem] border-slate-900/5 dark:border-brand-primary/10 relative overflow-hidden group"
                       >
                          <Award className="absolute -bottom-4 -right-4 w-32 h-32 text-brand-primary/5 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">الأوسمة الرقمية</p>
                          <h3 className="text-3xl font-bold mt-2 flex items-center gap-1.5 flex-row-reverse justify-end">
                            <span className="text-xl text-slate-600">/ 6</span>
                            <span className="text-brand-hover">{completedCount}</span>
                          </h3>
                          <div className="mt-6 flex gap-2">
                             {Array.from({length: 6}).map((_, i) => (
                               <div key={i} className={`w-2 h-2 rounded-full ${i < completedCount ? 'bg-brand-primary' : 'bg-brand-primary/10 dark:bg-brand-primary/10'}`} />
                             ))}
                          </div>
                       </motion.div>

                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.3 }}
                         className="p-8 bg-white shadow-sm border border-brand-primary/10 rounded-[3rem] border-slate-900/5 dark:border-brand-primary/10 relative overflow-hidden group"
                       >
                          <Zap className="absolute -bottom-4 -right-4 w-32 h-32 text-brand-primary/5 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">الخدمات النشطة</p>
                          <h3 className="text-3xl font-bold mt-2 text-indigo-500">{userRequests.length}</h3>
                          <p className="mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">فريق التنفيذ جاهز لمساعدتك</p>
                       </motion.div>
                    </div>

                    {/* Startup Maturity Timeline */}
                    <div className="space-y-6">
                       <h3 className="text-xl font-bold flex items-center gap-3">
                          <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                          خريطة نضج المشروع
                       </h3>
                       <div className={`p-8 md:p-10 rounded-[2.5rem] border ${isDark ? 'bg-white border-slate-200 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'} relative overflow-hidden`}>
                          <div className="relative">
                             {/* Horizontal Line Background */}
                             <div className={`timeline-line ${isDark ? 'bg-slate-100' : 'bg-slate-100'}`}></div>
                             <div className="timeline-line-fill" style={{ width: `${Math.max(0, (completedCount - 0.5) / 5.5) * 100}%` }}></div>

                             {/* Steps */}
                             <div className="flex justify-between relative">
                                {siteLevels.map((level, idx) => (
                                  <div key={level.id} className="step-node flex flex-col items-center gap-4">
                                     <div 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border-4 transition-all duration-700
                                          ${level.isCompleted 
                                            ? (level.customColor || 'bg-brand-primary') + ' border-white text-white shadow-lg' 
                                            : (level.isLocked ? 'bg-slate-100 border-white text-slate-600' : 'bg-white border-brand-primary text-brand-primary animate-pulse')
                                          }
                                        `}
                                     >
                                        {level.isCompleted ? '✓' : idx + 1}
                                     </div>
                                     <div className="text-center max-w-[80px]">
                                        <p className={`text-[10px] font-bold leading-tight uppercase ${level.isLocked ? 'text-brand-gray' : 'text-slate-900 dark:text-brand-primary'}`}>
                                           {level.title.split(' ')[0]}
                                        </p>
                                        {!level.isLocked && !level.isCompleted && (
                                           <span className="text-[8px] font-bold text-brand-hover animate-pulse">المحطة الحالية</span>
                                        )}
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>


                  </div>
                )}
                {activeNav === 'bootcamp' && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-20">
                     <div className="text-right space-y-4 mb-10">
                        <h3 className="text-3xl font-bold italic">أكاديمية بيزنس ديفلوبرز</h3>
                        <p className="text-slate-500 max-w-2xl font-medium leading-relaxed">
                           رحلة متكاملة من ٦ محطات رئيسية تأخذك من فكرة مشروعك إلى الجاهزية المطلقة للعرض على المستثمرين.
                        </p>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-6">
                        {siteLevels.map((level) => (
                          <motion.div 
                            whileHover={{ x: -10 }}
                            key={level.id} 
                            onClick={() => !level.isLocked && onSelectLevel(level.id)} 
                            className={`p-10 bg-white shadow-sm border border-brand-primary/10 rounded-[3.5rem] border-slate-900/5 dark:border-brand-primary/10 flex flex-col md:flex-row items-center justify-between transition-all ${level.isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:border-brand-primary/20'} group relative overflow-hidden`}
                          >
                             <div className="flex items-center gap-8 flex-1 min-w-0 text-right w-full md:w-auto flex-row-reverse">
                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl shrink-0 shadow-2xl ${level.isCompleted ? (level.customColor || 'bg-emerald-500') + ' text-white' : 'bg-brand-primary/5 dark:bg-brand-primary/5 text-brand-gray'}`}>
                                   {level.isCompleted ? '✓' : level.icon}
                                </div>
                                <div className="truncate flex-1">
                                  <h4 className="font-bold text-2xl text-brand-primary dark:text-brand-primary group-hover:text-brand-primary transition-colors">
                                    {level.title}
                                    <span className="text-brand-hover/30 text-xs font-bold mr-4 uppercase tracking-[0.3em]">Module 0{level.id}</span>
                                  </h4>
                                  <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">{level.description}</p>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-6 shrink-0 mt-6 md:mt-0">
                                {!level.isLocked && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setEditingLevel(level); setCustomIcon(level.icon); setCustomColor(level.customColor || ''); playPositiveSound(); }}
                                    className="p-4 rounded-2xl bg-brand-primary/5 dark:bg-brand-primary/5 text-brand-gray hover:text-brand-primary transition-all text-xl"
                                    title="تخصيص المظهر"
                                  >
                                    🎨
                                  </button>
                                )}
                                {level.isLocked ? (
                                   <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-100 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                                      <Lock className="w-4 h-4 text-brand-gray" />
                                      <span className="text-xs font-bold text-brand-gray uppercase tracking-widest">مغلق</span>
                                   </div>
                                ) : (
                                   <button className={`flex items-center gap-3 px-8 py-4 rounded-2xl border font-bold text-sm transition-all shadow-xl ${level.isCompleted ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20' : 'bg-brand-primary border-brand-primary text-white shadow-brand-primary/20'}`}>
                                      <span>{level.isCompleted ? 'مراجعة المحتوى' : 'بدء المحطة'}</span>
                                      <ArrowRight className="w-4 h-4 rotate-180" />
                                   </button>
                                )}
                             </div>
                             <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-colors" />
                          </motion.div>
                        ))}
                     </div>
                  </div>
                )}

                {activeNav === 'opportunity_lab' && (
                  <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                     <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 bg-brand-primary/5 text-brand-primary px-4 py-1.5 rounded-full text-[10px] font-bold border border-brand-primary uppercase tracking-widest">
                           AI Opportunity Agent
                        </div>
                        <h3 className="text-3xl font-bold">مختبر الفرص والنمو</h3>
                        <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                           استخدم وكيل الذكاء الاصطناعي لاكتشاف أسواق جغرافية جديدة أو شرائح عملاء غير مخدومة لمشروعك.
                        </p>
                     </div>

                     {!oppResult && !isAnalyzingOpp && (
                       <div className="flex flex-col items-center py-20 space-y-10">
                          <div className="relative w-40 h-40">
                             <div className="absolute inset-0 border-4 border-slate-200 rounded-full border-dashed"></div>
                             <div className="absolute inset-0 flex items-center justify-center text-3xl">🧭</div>
                          </div>
                          <button 
                            onClick={handleRunOppAnalysis}
                            className="px-12 py-5 bg-white text-white rounded-[2rem] font-bold text-lg shadow-2xl hover:bg-brand-primary transition-all transform active:scale-95 flex items-center gap-4"
                          >
                             <span>تفعيل مسح الفرص الاستراتيجي</span>
                             <svg className="w-6 h-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          </button>
                       </div>
                     )}

                     {isAnalyzingOpp && (
                        <div className="flex flex-col items-center py-20 space-y-8">
                           <div className="relative w-48 h-48">
                              <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                              <div className="absolute inset-0 border-8 border-brand-primary rounded-full border-t-transparent animate-spin"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-32 h-32 bg-brand-primary/10 rounded-full flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute w-1 h-full bg-brand-primary/30 radar-scan"></div>
                                    <span className="text-3xl animate-pulse">🔎</span>
                                 </div>
                              </div>
                           </div>
                           <div className="text-center space-y-2">
                             <h4 className="text-2xl font-bold text-brand-primary animate-pulse">جاري تحليل بيانات السوق العالمي...</h4>
                             <p className="text-brand-gray font-bold text-sm uppercase tracking-widest">Scanning Untapped Ecosystems via Gemini 3 Pro</p>
                           </div>
                        </div>
                     )}

                     {oppResult && (
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
                         <div className="lg:col-span-2 space-y-8">
                            <h4 className="text-xl font-bold flex items-center gap-3">
                               <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                               الأسواق الجغرافية المقترحة
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {oppResult.newMarkets.map((m, i) => (
                                 <div key={i} className={`p-8 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative group ${isDark ? 'bg-white border-slate-200' : ''}`}>
                                    <div className="flex justify-between items-start mb-6">
                                       <h5 className="text-xl font-bold text-brand-primary">{m.region}</h5>
                                       <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase ${m.entryBarrier === 'Low' ? 'bg-green-100 text-green-600' : m.entryBarrier === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>عائق: {m.entryBarrier}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">{m.reasoning}</p>
                                    <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                       <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">العائد المتوقع:</span>
                                       <span className="text-xs font-bold text-emerald-600">{m.potentialROI}</span>
                                    </div>
                                 </div>
                               ))}
                            </div>

                            <h4 className="text-xl font-bold flex items-center gap-3 pt-8">
                               <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                               شرائح العملاء غير المخدومة
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {oppResult.untappedSegments.map((s, i) => (
                                 <div key={i} className={`p-8 bg-slate-50 rounded-[3rem] border border-slate-100 ${isDark ? 'bg-slate-100 border-slate-700' : ''}`}>
                                    <h5 className="text-lg font-bold text-brand-primary mb-4">{s.segmentName}</h5>
                                    <p className="text-xs text-slate-500 font-bold mb-4">الاحتياج المفقود: {s.needs}</p>
                                    <div className="p-4 bg-white/60 rounded-2xl border border-white">
                                       <p className="text-xs font-bold text-brand-primary mb-1">استراتيجية الوصول:</p>
                                       <p className="text-[11px] text-brand-primary font-medium">{s.strategy}</p>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-8">
                            <div className={`p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-brand-primary rounded-[3.5rem] shadow-2xl relative overflow-hidden group`}>
                               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 dark:bg-brand-primary/10 rounded-full blur-[40px]"></div>
                               <h4 className="text-lg font-bold mb-6 flex items-center gap-3">
                                  <span className="text-2xl">🌊</span>
                                  استراتيجية المحيط الأزرق
                               </h4>
                               <p className="text-base font-medium leading-loose italic opacity-95">
                                  "{oppResult.blueOceanIdea}"
                                </p>
                            </div>

                            <div className="p-10 bg-white text-brand-primary rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                               <h4 className="text-lg font-bold mb-6 flex items-center gap-3">
                                  <span className="text-2xl">⚡</span>
                                  فوز سريع (Quick Win)
                               </h4>
                               <p className="text-base font-medium leading-relaxed mb-8">
                                  {oppResult.quickWinAction}
                               </p>
                               <button 
                                 onClick={() => addNotification(`طلب تنفيذ: ${oppResult.quickWinAction} قيد المراجعة.`, 'success')}
                                 className="w-full py-4 bg-brand-primary/5 dark:bg-brand-primary/5 border border-slate-900/10 dark:border-brand-primary/20 hover:border-brand-primary/20 rounded-2xl font-bold text-xs transition-all active:scale-95"
                               >
                                   ابدأ التنفيذ الآن
                                </button>
                             </div>
                          </div>
                       </div>
                     )}
                  </div>
                )}

                {activeNav === 'project_builder' && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-20">
                    <div className="text-right space-y-4">
                      <h3 className="text-3xl font-bold">بناء الاستراتيجية بالذكاء الاصطناعي</h3>
                      <p className="text-slate-500 max-w-2xl font-medium leading-relaxed">
                        اختر "الوكلاء الأذكياء" الذين تود إشراكهم في تحليل وبناء مشروعك الاستراتيجي. يساعدك هذا النظام على توليد رؤية تقنية وتجارية متكاملة.
                      </p>
                    </div>

                    {!projectBuild ? (
                      <div className="bg-white shadow-sm border border-brand-primary/10 p-12 rounded-[4rem] text-center space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {AVAILABLE_AGENTS_DASHBOARD.map(agent => (
                            <button
                              key={agent.id}
                              onClick={() => {
                                setSelectedAgents(prev => 
                                  prev.includes(agent.id) ? prev.filter(id => id !== agent.id) : [...prev, agent.id]
                                );
                              }}
                              className={`p-8 rounded-[3rem] border transition-all text-right flex flex-col items-end gap-4 ${
                                selectedAgents.includes(agent.id) 
                                  ? 'bg-brand-primary border-brand-primary text-white shadow-2xl shadow-brand-primary/20 ring-4 ring-blue-500/10' 
                                  : 'bg-brand-primary/50 dark:bg-brand-primary/5 border-slate-200 dark:border-brand-primary/20 hover:border-brand-primary/20'
                              }`}
                            >
                              <span className="text-3xl">{agent.icon}</span>
                              <div>
                                <h4 className="font-bold text-lg mb-1">{agent.name}</h4>
                                <p className={`text-[10px] font-bold leading-relaxed ${selectedAgents.includes(agent.id) ? 'text-white/80' : 'text-slate-500'}`}>
                                  {agent.desc}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handleRunProjectBuilder}
                          disabled={isBuildingProject}
                          className={`px-12 py-6 bg-white dark:bg-brand-primary text-white rounded-[2rem] font-bold hover:scale-105 transition-all shadow-2xl flex items-center gap-4 mx-auto ${isBuildingProject ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isBuildingProject ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>جاري التحليل الاستراتيجي...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-6 h-6 fill-brand-primary" />
                              <span>ابدأ بناء المشروع الآن</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                         <div className="space-y-8">
                            <div className="bg-white shadow-sm border border-brand-primary/10 p-10 rounded-[3.5rem] border-slate-900/5 dark:border-brand-primary/10 text-right">
                               <h4 className="text-xl font-bold mb-6 text-brand-hover border-b border-brand-primary/20 pb-4">الرؤية الاستراتيجية</h4>
                               <p className="text-sm font-medium leading-relaxed text-brand-primary dark:text-slate-600 italic">
                                  {projectBuild.results.vision}
                               </p>
                            </div>
                            <div className="bg-white shadow-sm border border-brand-primary/10 p-10 rounded-[3.5rem] border-slate-900/5 dark:border-brand-primary/10 text-right">
                               <h4 className="text-xl font-bold mb-6 text-emerald-500 border-b border-emerald-500/10 pb-4">تحليل السوق</h4>
                               <p className="text-sm font-medium leading-relaxed text-brand-primary dark:text-slate-600">
                                  {projectBuild.results.marketAnalysis}
                               </p>
                            </div>
                         </div>
                         <div className="space-y-8">
                            <div className="bg-white shadow-sm border border-brand-primary/10 p-10 rounded-[3.5rem] border-slate-900/5 dark:border-brand-primary/10 text-right">
                               <h4 className="text-xl font-bold mb-6 text-purple-500 border-b border-purple-500/10 pb-4">فرضيات النمو المقترحة</h4>
                               <div className="space-y-4 text-right">
                                  {projectBuild.results.hypotheses.map((h: string, i: number) => (
                                    <div key={i} className="flex items-start gap-4 flex-row-reverse">
                                       <div className="w-6 h-6 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">{i+1}</div>
                                       <p className="text-xs font-bold leading-relaxed text-slate-600 dark:text-brand-gray">{h}</p>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <button 
                               onClick={() => { setProjectBuild(null); playPositiveSound(); }}
                               className="w-full py-6 bg-white dark:bg-brand-primary/10 text-white rounded-2xl font-bold text-xs hover:bg-brand-primary transition-all active:scale-95"
                            >
                               إعادة تعيين وبناء جديد
                            </button>
                         </div>
                      </div>
                    )}
                  </div>
                )}

                {activeNav === 'plans' && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-20">
                    <div className="text-right space-y-4">
                      <h3 className="text-3xl font-bold">صانع الخطط الاستراتيجية</h3>
                      <p className="text-slate-500 max-w-2xl font-medium leading-relaxed">
                        قم بتوليد خطط عمل احترافية لمشروعك باستخدام الذكاء الاصطناعي. اختر نوع الخطة وأدخل بعض التفاصيل للبدء.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-end">
                      <button 
                        onClick={() => { setActivePlanType('marketing'); setPlanResult(null); setPlanInput(''); }}
                        className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all ${activePlanType === 'marketing' ? 'bg-brand-primary text-white' : 'bg-white shadow-sm border border-brand-primary/10 border-slate-900/5 dark:border-brand-primary/10 text-slate-500'}`}
                      >
                        خطة التسويق
                      </button>
                      <button 
                        onClick={() => { setActivePlanType('sales'); setPlanResult(null); setPlanInput(''); }}
                        className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all ${activePlanType === 'sales' ? 'bg-brand-primary text-white' : 'bg-white shadow-sm border border-brand-primary/10 border-slate-900/5 dark:border-brand-primary/10 text-slate-500'}`}
                      >
                        خطة المبيعات
                      </button>
                      <button 
                        onClick={() => { setActivePlanType('ops'); setPlanResult(null); setPlanInput(''); }}
                        className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all ${activePlanType === 'ops' ? 'bg-brand-primary text-white' : 'bg-white shadow-sm border border-brand-primary/10 border-slate-900/5 dark:border-brand-primary/10 text-slate-500'}`}
                      >
                        الخطة التشغيلية
                      </button>
                    </div>

                    {!activePlanType && (
                      <div className="flex flex-col items-center justify-center py-32 bg-white shadow-sm border border-brand-primary/10 rounded-[4rem] border-slate-900/5 dark:border-brand-primary/10">
                        <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-8">
                          <FileText className="w-12 h-12 text-brand-primary" />
                        </div>
                        <h4 className="text-2xl font-bold mb-4">اختر نوع الخطة للبدء</h4>
                        <p className="text-slate-500 max-w-sm text-center font-medium leading-relaxed">
                          ابدأ ببناء خارطة طريق واضحة لنمو مشروعك وزيادة مبيعاتك.
                        </p>
                      </div>
                    )}

                    {activePlanType && !planResult && (
                      <div className="bg-white shadow-sm border border-brand-primary/10 p-12 rounded-[4rem] border-slate-900/5 dark:border-brand-primary/10 space-y-8 animate-slide-up">
                        <div className="text-right space-y-2">
                           <h4 className="text-xl font-bold">
                             {activePlanType === 'marketing' ? 'تفاصيل الجمهور المستهدف' : activePlanType === 'sales' ? 'تفاصيل نموذج المبيعات' : 'تفاصيل التشغيل والأنشطة'}
                           </h4>
                           <p className="text-sm text-slate-500 font-medium font-sans">
                             {activePlanType === 'marketing' 
                               ? 'من هم عملاؤك المثاليون؟ (مثال: أصحاب المشاريع الصغيرة في السعودية)' 
                               : activePlanType === 'sales' 
                                 ? 'كيف تبيع منتجك؟ (مثال: اشتراك شهري، عمولة، بيع مباشر)' 
                                 : 'ما هي الأنشطة اليومية الرئيسية؟ (مثال: الشحن، التوصيل، التخزين، تطوير المحتوى)'}
                           </p>
                        </div>
                        <textarea 
                           className="w-full p-6 bg-brand-primary/5 dark:bg-brand-primary/5 border border-slate-900/10 dark:border-brand-primary/20 rounded-3xl min-h-[150px] outline-none focus:ring-2 focus:ring-blue-500/20 text-right font-medium text-sm transition-all"
                           placeholder="اكتب هنا..."
                           value={planInput}
                           onChange={(e) => setPlanInput(e.target.value)}
                        />
                        <button 
                          onClick={handleGeneratePlan}
                          disabled={isGeneratingPlan}
                          className={`w-full py-6 bg-brand-primary text-white rounded-[2rem] font-bold text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-brand-primary/20 ${isGeneratingPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isGeneratingPlan ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>جاري التوليد...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 fill-brand-primary" />
                              <span>توليد الخطة بالذكاء الاصطناعي</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {planResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white shadow-sm border border-brand-primary/10 p-12 rounded-[4rem] border-slate-900/5 dark:border-brand-primary/10 relative overflow-hidden"
                      >
                         <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-900/5 dark:border-brand-primary/10">
                            <button 
                              onClick={() => { setPlanResult(null); setPlanInput(''); }}
                              className="text-xs font-bold text-brand-gray hover:text-brand-hover transition-colors"
                            >
                              إعادة توليد خُطَّة جديدة
                            </button>
                            <h4 className="text-2xl font-bold">
                               {activePlanType === 'marketing' ? 'خطة التسويق الذكية' : activePlanType === 'sales' ? 'خطة المبيعات الاستراتيجية' : 'الخطة التشغيلية المتكاملة'}
                            </h4>
                         </div>
                         <div className="markdown-body text-right prose prose-slate dark:prose-invert max-w-none prose-sm font-medium leading-loose">
                           <Markdown>{planResult}</Markdown>
                         </div>
                         <div className="mt-12 flex justify-center">
                            <button 
                               onClick={() => { window.print(); }}
                               className="px-10 py-4 bg-white text-white rounded-2xl font-bold text-xs hover:bg-brand-primary transition-all flex items-center gap-3"
                            >
                               <FileText className="w-4 h-4" />
                               طباعة الخطة أو حفظها بصيغة PDF
                            </button>
                         </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {activeNav === 'admin_panel' && userProfile.isAdmin && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-20">
                    <div className="text-right space-y-4">
                      <h3 className="text-3xl font-bold">لوحة الإدارة المركزية</h3>
                      <div className="flex justify-end gap-2 mt-6">
                        <button 
                          onClick={() => setAdminTab('content')}
                          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${adminTab === 'content' ? 'bg-brand-primary text-white' : 'bg-white shadow-sm border border-brand-primary/10 hover:bg-brand-primary/10'}`}
                        >إدارة المحتوى</button>
                        <button 
                          onClick={() => setAdminTab('users')}
                          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${adminTab === 'users' ? 'bg-brand-primary text-white' : 'bg-white shadow-sm border border-brand-primary/10 hover:bg-brand-primary/10'}`}
                        >المستخدمين</button>
                        <button 
                          onClick={() => setAdminTab('requests')}
                          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${adminTab === 'requests' ? 'bg-brand-primary text-white' : 'bg-white shadow-sm border border-brand-primary/10 hover:bg-brand-primary/10'}`}
                        >الطلبات</button>
                      </div>
                    </div>

                    {adminTab === 'requests' && (
                      <>
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                           <div className="bg-white shadow-sm border border-brand-primary/10 p-8 rounded-[2.5rem] border-slate-900/5 dark:border-brand-primary/10 text-right">
                              <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest block mb-2">إجمالي الطلبات</span>
                              <h4 className="text-3xl font-bold text-brand-primary">{adminRequests.length}</h4>
                           </div>
                           <div className="bg-white shadow-sm border border-brand-primary/10 p-8 rounded-[2.5rem] border-slate-900/5 dark:border-brand-primary/10 text-right">
                              <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest block mb-2">المستخدمين المسجلين</span>
                              <h4 className="text-3xl font-bold text-emerald-600">{adminUsers.length}</h4>
                           </div>
                           <div className="bg-white shadow-sm border border-brand-primary/10 p-8 rounded-[2.5rem] border-slate-900/5 dark:border-brand-primary/10 text-right">
                              <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest block mb-2">طلبات معلقة</span>
                              <h4 className="text-3xl font-bold text-amber-500">{adminRequests.filter(r => r.status === 'PENDING').length}</h4>
                           </div>
                           <div className="bg-white shadow-sm border border-brand-primary/10 p-8 rounded-[2.5rem] border-slate-900/5 dark:border-brand-primary/10 text-right">
                              <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest block mb-2">طلبات مكتملة</span>
                              <h4 className="text-3xl font-bold text-brand-hover">{adminRequests.filter(r => r.status === 'COMPLETED').length}</h4>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 gap-10">
                           <div className="bg-white shadow-sm border border-brand-primary/10 p-10 rounded-[3.5rem] border-slate-900/5 dark:border-brand-primary/10">
                              <div className="flex justify-between items-center mb-10 border-b border-slate-900/5 dark:border-brand-primary/10 pb-6">
                                 <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-white shadow-sm border border-brand-primary/10 rounded-xl text-[10px] font-bold">فلترة</button>
                                 </div>
                                 <h4 className="text-xl font-bold">إدارة طلبات الخدمات</h4>
                              </div>

                              <div className="overflow-x-auto">
                                 <table className="w-full text-right" dir="rtl">
                                    <thead>
                                       <tr className="text-brand-gray text-[10px] font-bold uppercase tracking-widest border-b border-slate-900/5 dark:border-brand-primary/10">
                                          <th className="pb-4 pr-4">الشركة</th>
                                          <th className="pb-4">الخدمة</th>
                                          <th className="pb-4">التاريخ</th>
                                          <th className="pb-4">الحالة</th>
                                          <th className="pb-4 pl-4 text-center">الإجراءات</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
                                       {adminRequests.map((req) => (
                                          <Fragment key={req.id}>
                                            <tr className="group hover:bg-slate-50/5 transition-colors">
                                               <td className="py-6 pr-4">
                                                  <div className="font-bold text-xs">{req.startupName}</div>
                                                  <div className="text-[10px] text-brand-gray mt-0.5">UID: {req.uid}</div>
                                               </td>
                                               <td className="py-6">
                                                  <div className="font-bold text-xs">{siteServices.find(s => s.id === req.serviceId)?.title}</div>
                                                  <div className="text-[10px] text-brand-hover font-bold mt-0.5">{req.packageId === 'p1' || req.id.includes('p1') ? 'باقة أساسية' : 'باقة متقدمة'}</div>
                                               </td>
                                               <td className="py-6">
                                                  <div className="text-[10px] font-medium text-slate-500">{new Date(req.timestamp).toLocaleDateString('ar-EG')}</div>
                                               </td>
                                               <td className="py-6">
                                                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                                                     req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                                     req.status === 'IN_PROGRESS' ? 'bg-brand-primary/10 text-brand-hover' :
                                                     req.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                                                     'bg-rose-500/10 text-rose-500'
                                                  }`}>
                                                     {req.status === 'PENDING' ? 'في الانتظار' : req.status === 'IN_PROGRESS' ? 'جاري العمل' : req.status === 'COMPLETED' ? 'مكتمل' : 'ملغي'}
                                                  </span>
                                               </td>
                                               <td className="py-6 pl-4">
                                                  <div className="flex items-center justify-center gap-2">
                                                     <button 
                                                       onClick={() => setSelectedAdminRequestId(selectedAdminRequestId === req.id ? null : req.id)}
                                                       className={`p-2 bg-white shadow-sm border border-brand-primary/10 rounded-lg hover:text-brand-hover text-[10px] transition-all ${selectedAdminRequestId === req.id ? 'bg-brand-primary text-white' : ''}`}
                                                       title="الرد على الطلب"
                                                     >💬</button>
                                                     <button 
                                                       onClick={() => handleUpdateRequestStatus(req.uid, req.id, 'IN_PROGRESS')}
                                                       className="p-2 bg-white shadow-sm border border-brand-primary/10 rounded-lg hover:text-brand-hover text-[10px] transition-all"
                                                       title="تفعيل الطلب"
                                                     >⚙️</button>
                                                     <button 
                                                       onClick={() => handleUpdateRequestStatus(req.uid, req.id, 'COMPLETED')}
                                                       className="p-2 bg-white shadow-sm border border-brand-primary/10 rounded-lg hover:text-emerald-500 text-[10px] transition-all"
                                                       title="إكمال الطلب"
                                                     >✅</button>
                                                     <button 
                                                       onClick={() => handleUpdateRequestStatus(req.uid, req.id, 'CANCELLED')}
                                                       className="p-2 bg-white shadow-sm border border-brand-primary/10 rounded-lg hover:text-rose-500 text-[10px] transition-all"
                                                       title="إلغاء الطلب"
                                                     >❌</button>
                                                  </div>
                                               </td>
                                            </tr>
                                            {selectedAdminRequestId === req.id && (
                                              <tr className="bg-brand-primary/5">
                                                <td colSpan={5} className="p-6">
                                                  <div className="flex flex-col gap-4">
                                                    <div className="text-right">
                                                      <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">تفاصيل الطلب من العميل:</span>
                                                      <p className="text-xs bg-brand-primary/5 p-4 rounded-xl mt-2 italic text-slate-500 leading-relaxed border border-brand-primary/10">{req.details || 'لا توجد تفاصيل إضافية'}</p>
                                                    </div>
                                                    <div className="space-y-4">
                                                      <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest block text-right">اكتب ردك هنا:</label>
                                                      <textarea 
                                                        className="w-full h-32 bg-white shadow-sm border border-brand-primary/10 rounded-2xl p-5 text-sm outline-none border border-brand-primary/20 focus:border-brand-primary transition-all text-right"
                                                        placeholder="كيف يمكننا مساعدتك؟ أو ما هو التحديث الحالي للطلب؟"
                                                        value={adminResponseText}
                                                        onChange={(e) => setAdminResponseText(e.target.value)}
                                                      />
                                                      <div className="flex justify-start">
                                                        <button 
                                                          onClick={() => handleSaveAdminResponse(req.id)}
                                                          className="px-8 py-3 bg-brand-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-all"
                                                        >إرسال الرد</button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </td>
                                              </tr>
                                            )}
                                            {req.adminResponse && selectedAdminRequestId !== req.id && (
                                              <tr className="bg-emerald-500/5">
                                                <td colSpan={5} className="px-10 py-3 text-right">
                                                  <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter mb-1">الرد الحالي:</div>
                                                  <p className="text-[11px] text-slate-500 italic">{req.adminResponse}</p>
                                                </td>
                                              </tr>
                                            )}
                                          </Fragment>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                              {adminRequests.length === 0 && (
                                 <div className="py-20 text-center text-brand-gray font-medium italic">لاتوجد طلبات لعرضها حالياً</div>
                              )}
                           </div>
                        </div>
                      </>
                    )}

                    {adminTab === 'users' && (
                      <div className="bg-white shadow-sm border border-brand-primary/10 p-10 rounded-[3.5rem] border-slate-900/5 dark:border-brand-primary/10">
                        <h4 className="text-xl font-bold mb-10 text-right">إدارة المستخدمين</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {adminUsers.map((item) => (
                              <div key={item.user.uid} className="p-6 bg-white/90 shadow-sm border-b border-brand-primary/10 rounded-3xl border border-slate-900/5 dark:border-brand-primary/10 flex flex-col items-end gap-3 text-right">
                                 <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-xl">👤</div>
                                 <div className="w-full">
                                    <div className="font-bold text-sm">{item.user.firstName} {item.user.lastName}</div>
                                    <div className="text-[10px] font-bold text-brand-hover mt-1">{item.startup?.name || 'بدون شركة'}</div>
                                    <div className="text-[9px] text-slate-500 mt-2 font-sans truncate">{item.user.email}</div>
                                 </div>
                                 <div className="mt-4 pt-4 border-t border-brand-primary/10 w-full flex justify-between items-center">
                                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${item.user.isAdmin ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-brand-gray'}`}>
                                       {item.user.isAdmin ? 'مدير' : 'مستخدم'}
                                    </span>
                                    <div className="text-[9px] font-medium text-slate-500">منذ {new Date(item.user.createdAt).toLocaleDateString('ar-EG')}</div>
                                 </div>
                              </div>
                           ))}
                        </div>
                      </div>
                    )}

                    {adminTab === 'content' && (
                      <div className="bg-white shadow-sm border border-brand-primary/10 p-10 rounded-[3.5rem] border-slate-900/5 dark:border-brand-primary/10">
                        <div className="text-right space-y-6">
                          <div className="flex justify-between items-center mb-10">
                            {contentCategory !== 'none' && (
                              <button 
                                onClick={() => setContentCategory('none')}
                                className="px-6 py-2 bg-white shadow-sm border border-brand-primary/10 rounded-xl text-xs font-bold flex items-center gap-2"
                              >
                                <span>العودة</span>
                                <ChevronLeft className="w-4 h-4 rotate-180" />
                              </button>
                            )}
                            <h4 className="text-xl font-bold">التحكم بكامل الموقع</h4>
                          </div>

                          {contentCategory === 'none' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="p-8 bg-white shadow-sm border border-brand-primary/10 rounded-[2.5rem] border border-brand-primary/10 hover:border-brand-primary/20 transition-all text-right group">
                                <Layers className="w-8 h-8 text-brand-hover mb-6" />
                                <h5 className="text-lg font-bold mb-2">إدارة المستويات</h5>
                                <p className="text-xs text-slate-500 leading-relaxed mb-6">تعديل المسميات، الألوان، والأيقونات الخاصة بالمستويات الستة للمسرعة.</p>
                                <button 
                                  onClick={() => setContentCategory('levels')} 
                                  className="px-6 py-3 bg-brand-primary/10 text-brand-hover hover:bg-brand-primary hover:text-white rounded-xl text-[10px] font-bold transition-all"
                                >فتح المحرر</button>
                              </div>
                              
                              <div className="p-8 bg-white shadow-sm border border-brand-primary/10 rounded-[2.5rem] border border-brand-primary/10 hover:border-emerald-500/20 transition-all text-right group">
                                <Zap className="w-8 h-8 text-emerald-500 mb-6" />
                                <h5 className="text-lg font-bold mb-2">كتالوج الخدمات</h5>
                                <p className="text-xs text-slate-500 leading-relaxed mb-6">عرض وتعديل قائمة الخدمات التقنية والاستشارية المتاحة لرواد الأعمال.</p>
                                <button 
                                  onClick={() => setContentCategory('services')} 
                                  className="px-6 py-3 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-brand-primary rounded-xl text-[10px] font-bold transition-all"
                                >إدارة الخدمات</button>
                              </div>

                              <div className="p-8 bg-white shadow-sm border border-brand-primary/10 rounded-[2.5rem] border border-brand-primary/10 hover:border-amber-500/20 transition-all text-right group">
                                <Users className="w-8 h-8 text-amber-500 mb-6" />
                                <h5 className="text-lg font-bold mb-2">قائمة الموجهين</h5>
                                <p className="text-xs text-slate-500 leading-relaxed mb-6">إضافة أو تعديل بيانات الخبراء والمستشارين الظاهرين في المنصة.</p>
                                <button 
                                  onClick={() => setContentCategory('mentors')} 
                                  className="px-6 py-3 bg-amber-600/10 text-amber-500 hover:bg-amber-600 hover:text-brand-primary rounded-xl text-[10px] font-bold transition-all"
                                >تعديل الموجهين</button>
                              </div>

                              <div className="p-8 bg-white shadow-sm border border-brand-primary/10 rounded-[2.5rem] border border-brand-primary/10 hover:border-purple-500/20 transition-all text-right group">
                                <Star className="w-8 h-8 text-purple-500 mb-6" />
                                <h5 className="text-lg font-bold mb-2">الإنجازات والدروع</h5>
                                <p className="text-xs text-slate-500 leading-relaxed mb-6">تخصيص الدروع الرقمية التي يحصل عليها الطلاب عند إتمام المهام.</p>
                                <button 
                                  onClick={() => setActiveNav('academy')} 
                                  className="px-6 py-3 bg-purple-600/10 text-purple-500 hover:bg-purple-600 hover:text-brand-primary rounded-xl text-[10px] font-bold transition-all"
                                >إدارة الأوسمة</button>
                              </div>
                            </div>
                          )}

                          {contentCategory === 'services' && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 gap-4">
                                {siteServices.map(service => (
                                  <div key={service.id} className="p-6 bg-white/90 shadow-sm border-b border-brand-primary/10 rounded-3xl border border-brand-primary/10 flex justify-between items-center flex-row-reverse">
                                    <div className="flex items-center gap-4 flex-row-reverse">
                                      <div className="text-3xl">{service.icon}</div>
                                      <div className="text-right">
                                        <div className="font-bold text-sm">{service.title}</div>
                                        <div className="text-[10px] text-slate-500">{service.category}</div>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => setEditingService(service)}
                                      className="px-4 py-2 bg-brand-primary text-white rounded-lg text-[10px] font-bold"
                                    >تعديل</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {contentCategory === 'levels' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {siteLevels.map(level => (
                                <div key={level.id} className="p-6 bg-white/90 shadow-sm border-b border-brand-primary/10 rounded-3xl border border-brand-primary/10 flex flex-col items-end gap-3 text-right">
                                  <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-xl">{level.icon}</div>
                                  <div className="font-bold text-sm">{level.title}</div>
                                  <p className="text-[10px] text-slate-500 line-clamp-2">{level.description}</p>
                                  <button 
                                    onClick={() => setEditingSiteLevel(level)}
                                    className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg text-[10px] font-bold w-full"
                                  >تعديل المستوى</button>
                                </div>
                              ))}
                            </div>
                          )}

                          {contentCategory === 'mentors' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {siteMentors.map(mentor => (
                                <div key={mentor.id} className="p-6 bg-white/90 shadow-sm border-b border-brand-primary/10 rounded-3xl border border-brand-primary/10 flex flex-col items-end gap-3 text-right">
                                  <div className="text-3xl">{mentor.avatar}</div>
                                  <div className="font-bold text-sm">{mentor.name}</div>
                                  <div className="text-[10px] text-brand-hover font-bold">{mentor.role} @ {mentor.company}</div>
                                  <button 
                                    onClick={() => setEditingMentor(mentor)}
                                    className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg text-[10px] font-bold w-full"
                                  >تعديل البيانات</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeNav === 'services' && (
                  <div className="max-w-6xl mx-auto space-y-12 pb-20">
                     <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-900/5 dark:border-brand-primary/10 pb-10">
                        <div className="space-y-2 text-right">
                           <h3 className="text-3xl font-bold tracking-tight">خدمات التنفيذ الاحترافية</h3>
                           <p className="text-slate-500 max-w-2xl font-medium leading-relaxed">
                             البرنامج مجاني بالكامل، ولكننا نوفر لك وصولاً حصرياً لخبراء تنفيذيين لمساعدتك في بناء مخرجاتك بجودة استثمارية.
                           </p>
                        </div>
                        {userRequests.length > 0 && (
                          <div className="px-6 py-3 bg-white shadow-sm border border-brand-primary/10 rounded-2xl flex items-center gap-4">
                             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                             <span className="text-xs font-bold text-brand-primary">لديك {userRequests.length} طلبات نشطة</span>
                          </div>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {siteServices.map((service, idx) => (
                          <motion.div 
                            key={service.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group p-10 bg-white shadow-sm border border-brand-primary/10 rounded-[3rem] border-slate-900/5 dark:border-brand-primary/10 flex flex-col justify-between hover:border-brand-primary/20 transition-all text-right"
                          >
                             <div>
                                <div className="flex justify-between items-start mb-8">
                                   <div className="w-16 h-16 bg-brand-primary/5 dark:bg-brand-primary/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                      {service.icon}
                                   </div>
                                   <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${service.category === 'Design' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : service.category === 'Tech' ? 'bg-brand-primary/10 text-white border border-brand-primary/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                      {service.category}
                                   </span>
                                </div>
                                <h4 className="text-2xl font-bold mb-4 leading-tight group-hover:text-brand-primary transition-colors">{service.title}</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 h-20 overflow-hidden line-clamp-3">{service.description}</p>
                                
                                <div className="space-y-4 mb-10">
                                   <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">خيارات الأداء:</p>
                                   {service.packages.map(pkg => (
                                     <div key={pkg.id} className="flex justify-between items-center py-2 border-b border-slate-900/5 dark:border-brand-primary/10 group/pkg flex-row-reverse">
                                        <span className="text-xs font-bold text-brand-gray">{pkg.name}</span>
                                        <span className="text-[10px] font-bold text-white bg-brand-primary/10 px-2 py-0.5 rounded-lg group-hover/pkg:bg-brand-primary group-hover/pkg:text-white transition-all">{pkg.price}</span>
                                     </div>
                                   ))}
                                </div>
                             </div>
                             <button 
                               onClick={() => { setSelectedService(service); playPositiveSound(); }}
                               className="w-full py-5 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-brand-primary/20 active:scale-95 flex items-center justify-center gap-3"
                             >
                                <span>ابدأ التنفيذ</span>
                                <Zap className="w-4 h-4 fill-brand-primary" />
                             </button>
                          </motion.div>
                        ))}
                     </div>

                     {userRequests.length > 0 && (
                       <div className="mt-20 space-y-8">
                         <h4 className="text-xl font-bold flex items-center gap-3 justify-end">
                            سجل الطلبات
                            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                         </h4>
                         <div className="bg-white shadow-sm border border-brand-primary/10 rounded-[2.5rem] border-slate-900/5 dark:border-brand-primary/10 overflow-hidden">
                            <table className="w-full text-right">
                               <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900/5 dark:border-brand-primary/10">
                                  <tr>
                                     <th className="px-8 py-5">المشروع / الخدمة</th>
                                     <th className="px-8 py-5">الخطة</th>
                                     <th className="px-8 py-5">تاريخ الطلب</th>
                                     <th className="px-8 py-5 text-center">الحالة</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-white/5">
                                  {userRequests.map(req => {
                                    const svc = siteServices.find(s => s.id === req.serviceId);
                                    const pkg = svc?.packages.find(p => p.id === req.packageId);
                                    return (
                                      <Fragment key={req.id}>
                                        <tr className="hover:bg-brand-primary/5 dark:bg-brand-primary/5 transition-colors group">
                                           <td className="px-8 py-6 font-bold text-sm">{svc?.title}</td>
                                           <td className="px-8 py-6 text-xs font-bold text-slate-500">{pkg?.name}</td>
                                           <td className="px-8 py-6 text-xs text-slate-500 font-mono">{new Date(req.timestamp).toLocaleDateString('ar-EG')}</td>
                                           <td className="px-8 py-6 flex flex-col items-center justify-center gap-2">
                                              <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                                 {req.status === 'PENDING' ? 'قيد المراجعة' : req.status}
                                              </span>
                                              {req.adminResponse && (
                                                <span className="text-[10px] font-bold text-brand-hover bg-brand-primary/5 px-2 py-1 rounded italic">وصلك رد</span>
                                              )}
                                           </td>
                                        </tr>
                                        {req.adminResponse && (
                                          <tr key={`${req.id}-response`} className="bg-brand-primary/5">
                                            <td colSpan={4} className="px-8 py-4 text-right">
                                              <div className="text-[10px] font-bold text-brand-primary mb-1 uppercase tracking-widest">رد الإدارة:</div>
                                              <p className="text-xs font-medium text-slate-600 dark:text-slate-600 italic">{req.adminResponse}</p>
                                            </td>
                                          </tr>
                                        )}
                                      </Fragment>
                                    );
                                  })}
                               </tbody>
                            </table>
                         </div>
                       </div>
                     )}
                  </div>
                )}

                {activeNav === 'startup_profile' && (
                  <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                     <div className="bg-white shadow-sm border border-brand-primary/10 p-12 rounded-[4rem] border-slate-900/5 dark:border-brand-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-primary/5 blur-[100px] -z-10" />
                        
                        <div className="flex flex-col md:flex-row gap-16">
                           <div className="flex flex-col items-center gap-6">
                              <motion.div 
                                whileHover={{ scale: 1.02 }}
                                onClick={() => fileInputRef.current?.click()} 
                                className="w-48 h-48 rounded-[3.5rem] bg-brand-primary/5 dark:bg-brand-primary/5 border-4 border-dashed border-slate-900/10 dark:border-brand-primary/20 flex items-center justify-center cursor-pointer hover:border-brand-primary/20 transition-all overflow-hidden relative group"
                              >
                                 {userProfile.logo ? (
                                   <img src={userProfile.logo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" title="Logo" />
                                 ) : (
                                    <div className="flex flex-col items-center gap-3">
                                       <Zap className="w-12 h-12 text-slate-600" />
                                       <span className="text-[10px] font-bold text-slate-500">اختر شعاراً</span>
                                    </div>
                                 )}
                              </motion.div>
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Business Identity</p>
                           </div>
                           
                           <div className="flex-1 space-y-8 text-right">
                              <div className="space-y-4">
                                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">عنوان التجربة الريادية</label>
                                 <input className="w-full bg-brand-primary/5 dark:bg-brand-primary/5 border border-slate-900/10 dark:border-brand-primary/20 p-5 rounded-2xl outline-none focus:border-brand-primary font-bold text-xl transition-all" value={userProfile.startupName} onChange={e => setUserProfile({...userProfile, startupName: e.target.value})} dir="rtl" />
                              </div>
                              
                              <div className="space-y-4">
                                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">القطاع السوقي المستهدف</label>
                                 <select className="w-full bg-brand-primary/5 dark:bg-brand-primary/5 border border-slate-900/10 dark:border-brand-primary/20 p-5 rounded-2xl font-bold outline-none appearance-none focus:border-brand-primary transition-all cursor-pointer" value={userProfile.industry} onChange={e => setUserProfile({...userProfile, industry: e.target.value})} dir="rtl">
                                    {SECTORS.map(s => <option key={s.value} value={s.value} className="bg-white">{s.label}</option>)}
                                 </select>
                              </div>
                              
                              <div className="space-y-4">
                                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">رؤية المشروع (Project Vision)</label>
                                 <textarea className="w-full h-40 bg-brand-primary/5 dark:bg-brand-primary/5 border border-slate-900/10 dark:border-brand-primary/20 p-6 rounded-[2rem] outline-none focus:border-brand-primary resize-none font-medium leading-relaxed" value={userProfile.startupDescription} onChange={e => setUserProfile({...userProfile, startupDescription: e.target.value})} dir="rtl" />
                              </div>
                              
                              <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSaveProfile} 
                                disabled={isSaving} 
                                className="w-full py-5 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl font-bold shadow-2xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-3"
                              >
                                {isSaving ? (
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                ) : (
                                  <span>حفظ المجلد الشخصي</span>
                                )}
                              </motion.button>
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {activeNav === 'tasks' && (
                  <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {userTasks.map((task, idx) => (
                          <motion.div 
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: idx * 0.05 }}
                             key={task.id} 
                             className={`p-10 bg-white shadow-sm border border-brand-primary/10 rounded-[3rem] border-slate-900/5 dark:border-brand-primary/10 flex flex-col justify-between text-right relative overflow-hidden group ${task.status === 'LOCKED' ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                          >
                             <div className="relative z-10">
                                <div className="flex justify-between items-center mb-8">
                                   <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${task.status === 'ASSIGNED' ? 'bg-brand-primary/10 text-white border border-brand-primary/20' : task.status === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                      {task.status}
                                   </span>
                                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">PHASE 0{task.levelId}</span>
                                </div>
                                <h4 className="font-bold text-2xl mb-4 group-hover:text-brand-primary transition-colors">{task.title}</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">{task.description}</p>
                             </div>
                             
                             {task.status === 'ASSIGNED' && (
                               <motion.button 
                                 whileHover={{ x: -10 }}
                                 onClick={() => { setSelectedTask(task); playPositiveSound(); }} 
                                 className="w-full py-4 bg-white shadow-sm border border-brand-primary/10 border-slate-900/10 dark:border-brand-primary/20 hover:border-brand-primary/20 text-slate-900 dark:text-brand-primary rounded-2xl font-bold text-xs flex items-center justify-center gap-2 group/btn transition-all"
                               >
                                 <span>تسليم المخرج</span>
                                 <ArrowRight className="w-4 h-4 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                               </motion.button>
                             )}
                             
                             {task.status === 'SUBMITTED' && (
                                <div className="text-center text-[10px] font-bold text-slate-500 py-4 border border-dashed border-slate-900/10 dark:border-brand-primary/20 rounded-2xl uppercase tracking-widest">
                                  In Review Process
                                </div>
                             )}

                             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-primary/5 dark:bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors" />
                          </motion.div>
                        ))}
                     </div>
                  </div>
                )}
             </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {/* Level Customization Modal */}
        {editingLevel && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-white/60 backdrop-blur-xl text-right">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="max-w-md w-full p-10 rounded-[3.5rem] bg-white/90 shadow-sm border-b border-brand-primary/10 border-slate-900/10 dark:border-brand-primary/20 shadow-2xl"
             >
                <h3 className="text-2xl font-bold mb-8 tracking-tighter uppercase">تخصيص المسار</h3>
                
                <div className="space-y-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">الرمز التعبيري المحطة</label>
                      <input 
                         className="w-full bg-brand-primary/5 dark:bg-brand-primary/5 border border-slate-900/10 dark:border-brand-primary/20 p-6 text-3xl text-center rounded-[2.5rem] outline-none focus:border-brand-primary transition-all font-sans"
                         value={customIcon}
                         onChange={e => setCustomIcon(e.target.value.substring(0, 4))}
                      />
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">سمة اللون البصري</label>
                      <div className="grid grid-cols-4 gap-4">
                         {PRESET_COLORS.map(color => (
                            <button 
                               key={color.name}
                               onClick={() => setCustomColor(color.class)}
                               className={`w-12 h-12 rounded-2xl transition-all border-4 ${color.class} ${customColor === color.class ? 'border-white ring-4 ring-blue-500/50 scale-110' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
                               title={color.name}
                            />
                         ))}
                      </div>
                   </div>

                   <div className="pt-6 flex gap-4">
                      <button onClick={() => setEditingLevel(null)} className="flex-1 py-5 font-bold text-slate-500 hover:text-slate-900 dark:hover:text-brand-primary transition-colors">إلغاء</button>
                      <button onClick={handleSaveCustomization} className="flex-[2] py-5 bg-brand-primary hover:bg-brand-hover text-white rounded-[2rem] font-bold shadow-2xl shadow-brand-primary/20 transition-all active:scale-95">حفظ التغييرات</button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}

        {/* Service Request Modal */}
        {selectedService && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-white/60 backdrop-blur-xl text-right">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 30 }}
               className="max-w-4xl w-full p-12 rounded-[4rem] bg-white/90 shadow-sm border-b border-brand-primary/10 border-slate-900/10 dark:border-brand-primary/20 shadow-3xl"
             >
                <div className="flex justify-between items-start mb-10">
                   <button onClick={() => { setSelectedService(null); setSelectedPackage(null); }} className="w-10 h-10 bg-white shadow-sm border border-brand-primary/10 rounded-full flex items-center justify-center text-brand-gray hover:text-slate-900 dark:hover:text-brand-primary transition-all transform hover:rotate-90">✕</button>
                   <div>
                      <h3 className="text-3xl font-bold mb-2 tracking-tight">{selectedService.title}</h3>
                      <p className="text-brand-hover text-[10px] font-bold uppercase tracking-[0.3em]">Excellence Configuration</p>
                   </div>
                </div>

                <div className="space-y-10">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {selectedService.packages.map(pkg => (
                        <button 
                          key={pkg.id} 
                          onClick={() => { setSelectedPackage(pkg); playPositiveSound(); }} 
                          className={`p-8 rounded-[3.5rem] border-2 text-right transition-all flex flex-col gap-4 relative overflow-hidden group
                            ${selectedPackage?.id === pkg.id ? 'border-brand-primary bg-brand-primary/10 shadow-2xl' : 'border-slate-900/5 dark:border-brand-primary/10 bg-brand-primary/5 dark:bg-brand-primary/5 hover:border-brand-primary/30'}
                          `}
                        >
                           {selectedPackage?.id === pkg.id && (
                             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-6 left-6 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">✓</motion.div>
                           )}
                           <h5 className="font-bold text-2xl tracking-tight">{pkg.name}</h5>
                           <p className="text-base text-brand-primary font-bold tracking-widest">{pkg.price}</p>
                           <ul className="mt-4 space-y-3">
                              {pkg.features.map((f, i) => (
                                <li key={i} className="text-xs font-bold text-slate-500 flex items-center gap-2 justify-end">
                                  <span>{f}</span>
                                  <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                                </li>
                              ))}
                           </ul>
                        </button>
                      ))}
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ملاحظات إضافية للتنفيذ</label>
                      <textarea 
                         className="w-full h-32 bg-brand-primary/5 dark:bg-brand-primary/5 border border-slate-900/10 dark:border-brand-primary/20 p-6 rounded-[2.5rem] outline-none focus:border-brand-primary transition-all resize-none font-medium text-lg font-sans"
                         placeholder="مثال: تفضيلات الألوان، رابط شعار حالي، أو أي ملاحظات تقنية تساعد فريقنا..."
                         value={requestDetails}
                         onChange={e => setRequestDetails(e.target.value)}
                      />
                   </div>

                   <button 
                     disabled={!selectedPackage || isRequesting}
                     onClick={handleServiceRequest}
                     className="w-full py-7 bg-brand-primary hover:bg-brand-primary disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-[2.5rem] font-bold text-xl transition-all shadow-3xl shadow-brand-primary/20 flex items-center justify-center gap-4 active:scale-[0.98]"
                   >
                     {isRequesting ? (
                       <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                       <>
                         <span>تأكيد طلب التميز</span>
                         <Rocket className="w-7 h-7" />
                       </>
                     )}
                   </button>
                </div>
             </motion.div>
          </div>
        )}

        {/* Content Editor Modal: Services */}
        {editingService && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-white/80 backdrop-blur-2xl text-right font-sans">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full p-10 rounded-[3rem] bg-white/90 shadow-sm border-b border-brand-primary/10 border border-brand-primary/20 shadow-3xl">
                <h3 className="text-2xl font-bold mb-6">تعديل الخدمة</h3>
                <div className="space-y-4">
                  <div dir="rtl">
                    <label className="text-[10px] font-bold text-slate-500 block mb-2">اسم الخدمة</label>
                    <input 
                      type="text" 
                      value={editingService.title} 
                      onChange={e => setEditingService({...editingService, title: e.target.value})}
                      className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary text-right"
                    />
                  </div>
                  <div dir="rtl">
                    <label className="text-[10px] font-bold text-slate-500 block mb-2">الوصف</label>
                    <textarea 
                      value={editingService.description} 
                      onChange={e => setEditingService({...editingService, description: e.target.value})}
                      className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary h-24 text-right"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div dir="rtl">
                      <label className="text-[10px] font-bold text-slate-500 block mb-2">الأيقونة (Emoji)</label>
                      <input 
                        type="text" 
                        value={editingService.icon} 
                        onChange={e => setEditingService({...editingService, icon: e.target.value})}
                        className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary text-center text-2xl"
                      />
                    </div>
                    <div dir="rtl">
                      <label className="text-[10px] font-bold text-slate-500 block mb-2">التصنيف</label>
                      <select 
                        value={editingService.category} 
                        onChange={e => setEditingService({...editingService, category: e.target.value as any})}
                        className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary appearance-none text-right"
                      >
                        <option value="Design">Design</option>
                        <option value="Tech">Tech</option>
                        <option value="Finance">Finance</option>
                        <option value="Legal">Legal</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setEditingService(null)} className="flex-1 py-4 font-bold text-slate-500">إلغاء</button>
                  <button onClick={() => handleSaveSiteService(editingService)} className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-bold">حفظ التعديلات</button>
                </div>
             </motion.div>
          </div>
        )}

        {/* Content Editor Modal: Levels */}
        {editingSiteLevel && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-white/80 backdrop-blur-2xl text-right font-sans">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full p-10 rounded-[3rem] bg-white/90 shadow-sm border-b border-brand-primary/10 border border-brand-primary/20 shadow-3xl">
                <h3 className="text-2xl font-bold mb-6">تعديل المستوى الدراسي</h3>
                <div className="space-y-4">
                  <div dir="rtl">
                    <label className="text-[10px] font-bold text-slate-500 block mb-2">اسم المستوى</label>
                    <input 
                      type="text" 
                      value={editingSiteLevel.title} 
                      onChange={e => setEditingSiteLevel({...editingSiteLevel, title: e.target.value})}
                      className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary text-right"
                    />
                  </div>
                  <div dir="rtl">
                    <label className="text-[10px] font-bold text-slate-500 block mb-2">الوصف التفصيلي</label>
                    <textarea 
                      value={editingSiteLevel.description} 
                      onChange={e => setEditingSiteLevel({...editingSiteLevel, description: e.target.value})}
                      className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary h-32 text-right"
                    />
                  </div>
                  <div dir="rtl">
                    <label className="text-[10px] font-bold text-slate-500 block mb-2">الأيقونة (Emoji)</label>
                    <input 
                      type="text" 
                      value={editingSiteLevel.icon} 
                      onChange={e => setEditingSiteLevel({...editingSiteLevel, icon: e.target.value})}
                      className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary text-center text-2xl"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setEditingSiteLevel(null)} className="flex-1 py-4 font-bold text-slate-500">إلغاء</button>
                  <button onClick={() => handleSaveSiteLevel(editingSiteLevel)} className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-bold">حفظ التغييرات</button>
                </div>
             </motion.div>
          </div>
        )}

        {/* Mentors Editor Modal */}
        {editingMentor && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-white/80 backdrop-blur-2xl text-right font-sans">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full p-10 rounded-[3rem] bg-white/90 shadow-sm border-b border-brand-primary/10 border border-brand-primary/20 shadow-3xl">
                <h3 className="text-2xl font-bold mb-6">تعديل بيانات القالب</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-right">
                    <div dir="rtl">
                      <label className="text-[10px] font-bold text-slate-500 block mb-2">الاسم</label>
                      <input 
                        type="text" 
                        value={editingMentor.name} 
                        onChange={e => setEditingMentor({...editingMentor, name: e.target.value})}
                        className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary text-right"
                      />
                    </div>
                    <div dir="rtl">
                      <label className="text-[10px] font-bold text-slate-500 block mb-2">النظام (System Prompt)</label>
                      <input 
                        type="text" 
                        value={editingMentor.systemPrompt || ''} 
                        onChange={e => setEditingMentor({...editingMentor, systemPrompt: e.target.value})}
                        className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-right">
                    <div dir="rtl">
                      <label className="text-[10px] font-bold text-slate-500 block mb-2">الدور / المنصب</label>
                      <input 
                        type="text" 
                        value={editingMentor.role} 
                        onChange={e => setEditingMentor({...editingMentor, role: e.target.value})}
                        className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary text-right"
                      />
                    </div>
                    <div dir="rtl">
                      <label className="text-[10px] font-bold text-slate-500 block mb-2">التخصص</label>
                      <input 
                        type="text" 
                        value={editingMentor.specialty} 
                        onChange={e => setEditingMentor({...editingMentor, specialty: e.target.value})}
                        className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary text-right"
                      />
                    </div>
                  </div>
                  <div dir="rtl">
                    <label className="text-[10px] font-bold text-slate-500 block mb-2">الأيقونة (Emoji)</label>
                    <input 
                      type="text" 
                      value={editingMentor.avatar} 
                      onChange={e => setEditingMentor({...editingMentor, avatar: e.target.value})}
                      className="w-full bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-2xl font-medium outline-none focus:border-brand-primary text-center text-3xl"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setEditingMentor(null)} className="flex-1 py-4 font-bold text-slate-500">إلغاء</button>
                  <button onClick={() => handleSaveSiteMentor(editingMentor)} className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-bold">حفظ البيانات</button>
                </div>
             </motion.div>
          </div>
        )}

        {/* Task Submission Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-white/60 backdrop-blur-xl text-right font-sans">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="max-w-2xl w-full p-12 rounded-[4.5rem] bg-white/90 shadow-sm border-b border-brand-primary/10 border-slate-900/10 dark:border-brand-primary/20 shadow-3xl"
            >
               <div className="flex justify-between items-start mb-8">
                  <button onClick={() => setSelectedTask(null)} className="w-10 h-10 bg-white shadow-sm border border-brand-primary/10 rounded-full flex items-center justify-center text-brand-gray hover:text-slate-900 dark:hover:text-brand-primary transition-all">✕</button>
                   <div>
                      <h3 className="text-3xl font-bold mb-1 tracking-tighter">{selectedTask.title}</h3>
                      <p className="text-brand-hover text-[10px] font-bold uppercase tracking-[0.4em]">Deliverable Submission</p>
                   </div>
                </div>

                <div className="space-y-10" dir="rtl">
                   <textarea 
                      className="w-full h-56 bg-brand-primary/5 border border-brand-primary/20 p-8 rounded-[2.5rem] outline-none focus:border-brand-primary transition-all resize-none font-medium text-lg leading-relaxed text-right"
                      placeholder="الصق رابط المخرج (Google Drive, Figma, GitHub) أو صف مخرجاتك هنا بالتفصيل..."
                      value={submissionText}
                      onChange={e => setSubmissionText(e.target.value)}
                   />
                   
                   <div className="flex gap-6">
                      <button onClick={() => setSelectedTask(null)} className="flex-1 py-6 font-bold text-slate-500 hover:text-slate-900 transition-colors text-lg">إلغاء</button>
                      <button 
                        onClick={() => handleTaskSubmit()} 
                        disabled={!submissionText.trim()}
                        className="flex-[2] py-6 bg-brand-primary hover:bg-brand-primary disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-[2rem] font-bold shadow-2xl transition-all active:scale-95 text-lg"
                      >
                         إرسال للمراجعة النهائية
                      </button>
                   </div>
                </div>
             </motion.div>
           </div>
         )}

         {/* AI Chat Modal */}
         {showChatModal && selectedChatMentor && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 bg-white/60 backdrop-blur-md animate-fade-in rtl" dir="rtl">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white dark:bg-white rounded-[2rem] w-full max-w-4xl h-full md:h-[85vh] shadow-2xl border border-slate-100 dark:border-brand-primary/20 overflow-hidden flex flex-col"
               >
                  <div className="p-6 border-b border-slate-100 dark:border-brand-primary/20 flex justify-between items-center bg-white dark:bg-white shrink-0">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-100 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-slate-100 dark:border-brand-primary/10">
                           {selectedChatMentor.avatar}
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-slate-900 dark:text-brand-primary flex items-center gap-2">
                              {selectedChatMentor.name}
                              <span className="bg-brand-primary/10 text-brand-primary text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest leading-none mt-1">AI</span>
                           </h3>
                           <p className="text-xs font-bold text-slate-500 mt-1">{selectedChatMentor.role}</p>
                        </div>
                     </div>
                     <button onClick={() => { setShowChatModal(false); setChatSession(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-100 rounded-xl transition-colors text-brand-gray">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-brand-bg space-y-6 flex flex-col">
                     {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex max-w-[85%] ${msg.role === 'user' ? 'self-end bg-brand-primary text-white rounded-tr-none' : 'self-start bg-white dark:bg-slate-100 dark:text-slate-200 text-brand-primary rounded-tl-none border border-slate-200 dark:border-brand-primary/10'} p-5 rounded-3xl shadow-sm filter drop-shadow-sm`}>
                           <div className="whitespace-pre-wrap leading-relaxed font-medium text-sm">
                             <Markdown>{msg.text}</Markdown>
                           </div>
                        </div>
                     ))}
                     {isChatTyping && (
                        <div className="self-start bg-white dark:bg-slate-100 border border-slate-200 dark:border-brand-primary/10 rounded-3xl rounded-tl-none p-5 shadow-sm inline-flex items-center gap-1.5 w-auto">
                           <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                           <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                           <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                     )}
                     <div ref={chatMessagesEndRef} />
                  </div>

                  <div className="p-4 bg-white dark:bg-white border-t border-slate-100 dark:border-brand-primary/20 shrink-0">
                     <form onSubmit={handleSendChatMessage} className="relative flex items-center gap-3 max-w-full">
                        <input 
                           type="text" 
                           value={chatInput}
                           onChange={e => setChatInput(e.target.value)}
                           placeholder="اكتب استفسارك هنا للفريق الاستشاري الذكي..."
                           className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-100 border border-slate-200 dark:border-brand-primary/20 rounded-full outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white dark:focus:bg-white focus:border-brand-primary dark:text-brand-primary transition-all font-bold text-sm"
                           disabled={isChatTyping}
                        />
                        <button 
                           type="submit" 
                           disabled={!chatInput.trim() || isChatTyping}
                           className="absolute left-2 w-12 h-12 bg-brand-primary hover:bg-brand-primary disabled:bg-slate-300 dark:disabled:bg-slate-100 text-white flex items-center justify-center rounded-full transition-all"
                        >
                           <svg className="w-5 h-5 transform -rotate-90 origin-center mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                           </svg>
                        </button>
                     </form>
                  </div>
               </motion.div>
            </div>
         )}
       </AnimatePresence>
    </div>
  );
};

export default Dashboard;