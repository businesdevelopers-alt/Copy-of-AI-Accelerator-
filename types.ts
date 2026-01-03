
export enum FiltrationStage {
  LANDING = 'LANDING',
  PATH_FINDER = 'PATH_FINDER',
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  NOMINATION_TEST = 'NOMINATION_TEST',
  ASSESSMENT_RESULT = 'ASSESSMENT_RESULT',
  APPLICATION_STATUS = 'APPLICATION_STATUS',
  FINAL_REPORT = 'FINAL_REPORT',
  DEVELOPMENT_PLAN = 'DEVELOPMENT_PLAN',
  DASHBOARD = 'DASHBOARD',
  LEVEL_VIEW = 'LEVEL_VIEW',
  CERTIFICATE = 'CERTIFICATE',
  PROJECT_BUILDER = 'PROJECT_BUILDER',
  ROADMAP = 'ROADMAP',
  TOOLS = 'TOOLS',
  STAFF_PORTAL = 'STAFF_PORTAL',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  MENTORSHIP = 'MENTORSHIP'
}

export interface MentorProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  specialty: 'Tech' | 'Finance' | 'Growth' | 'Legal' | 'Strategy';
  bio: string;
  experience: number;
  avatar: string;
  rating: number;
  tags: string[];
}

export interface MentorshipRequest {
  mentorId: string;
  userId: string;
  topic: string;
  description: string;
  preferredTime: string;
}

export interface UserRecord {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  birthDate: string;
  createdAt: string;
  lastLogin: string;
  settings: {
    theme: string;
    notifications: boolean;
  };
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  startupName: string;
  startupDescription: string;
  industry: string;
  phone: string;
  email: string;
  age?: number;
  birthDate?: string;
  foundationYear?: number;
  foundersCount?: number;
  technologies?: string;
  name?: string; 
  hasCompletedAssessment?: boolean;
  agreedToTerms?: boolean;
  agreedToContract?: boolean; // حقل جديد للموافقة على عقد الاحتضان
  signedContractName?: string;
  contractSignedAt?: string;
}

export interface LevelData {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
  icon: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface RadarMetrics {
  readiness: number;
  analysis: number;
  tech: number;
  personality: number;
  strategy: number;
  ethics: number;
}

export interface ProjectEvaluationResult {
  clarity: number;
  value: number;
  innovation: number;
  market: number;
  readiness: number;
  totalScore: number;
  aiOpinion: string;
  classification: 'Green' | 'Yellow' | 'Red';
}

export interface FinalResult {
  score: number;
  leadershipStyle: string;
  metrics: RadarMetrics;
  projectEval?: ProjectEvaluationResult;
  isQualified: boolean;
  badges: { id: string, name: string, icon: string, color: string }[];
  recommendation: string;
}

export type ProjectStageType = 'Idea' | 'Prototype' | 'Product';
export type TechLevelType = 'Low' | 'Medium' | 'High';

export interface ApplicantProfile {
  codeName: string;
  projectStage: ProjectStageType;
  sector: string;
  goal: string;
  techLevel: TechLevelType;
}

export interface PersonalityOption {
  text: string;
  style: 'Visionary' | 'Operational' | 'Balanced';
}

export interface PersonalityQuestion {
  id: number;
  situation: string;
  options: PersonalityOption[];
}

export interface AnalyticalQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export type AgentCategory = 'Vision' | 'Market' | 'User' | 'Opportunity';

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
}

export interface ProjectBuildData {
  projectName: string;
  description: string;
  quality: 'Quick' | 'Balanced' | 'Enhanced' | 'Professional' | 'Max';
  selectedAgents: string[];
  results?: {
    vision?: string;
    marketAnalysis?: string;
    userPersonas?: string;
    hypotheses?: string[];
    pitchDeck?: { title: string; content: string }[];
  };
}

export const AVAILABLE_AGENTS: AIAgent[] = [
  { id: 'a1', name: 'محلل الرؤية الاستراتيجي', description: 'يحلل أهداف المشروع بعيدة المدى.', category: 'Vision' },
  { id: 'a2', name: 'خبير أبحاث السوق', description: 'يحلل المنافسين واتجاهات السوق.', category: 'Market' },
  { id: 'a3', name: 'أخصائي تجربة المستخدم', description: 'يصمم ملفات تعريف المستخدمين.', category: 'User' },
  { id: 'a4', name: 'مستكشف الفرص', description: 'يحدد ثغرات النمو المحتملة.', category: 'Opportunity' },
  { id: 'a5', name: 'مصمم القيمة المضافة', description: 'يصمم عرض القيمة للمستخدمين.', category: 'Vision' },
  { id: 'a6', name: 'محلل الجدوى المالية', description: 'يحلل تدفقات الإيرادات والتكاليف.', category: 'Opportunity' },
  { id: 'a7', name: 'خبير التوسع الجغرافي', description: 'يخطط لدخول أسواق جديدة.', category: 'Market' },
  { id: 'a8', name: 'مدير خارطة الطريق', description: 'يصمم خطة تنفيذ تقنية وزمنية.', category: 'Vision' },
  { id: 'a9', name: 'أخصائي جذب العملاء', description: 'يصمم استراتيجيات النمو الأولي.', category: 'User' },
];

export interface FailureSimulation {
  brutalTruth: string;
  probability: number;
  financialLoss: string;
  operationalImpact: string;
  missingQuestions: string[];
  recoveryPlan: string[];
}

export interface GovStats {
  riskyMarkets: { name: string; failRate: number }[];
  readySectors: { name: string; score: number }[];
  commonFailReasons: { reason: string; percentage: number }[];
  regulatoryGaps: string[];
}

export interface StartupRecord {
  projectId: string;
  ownerId: string;
  name: string;
  description: string;
  industry: string;
  foundationYear: number;
  foundersCount: number;
  technologies: string;
  stage: ProjectStageType;
  metrics: RadarMetrics;
  aiClassification: 'Green' | 'Yellow' | 'Red';
  aiOpinion: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ProgressRecord {
  id: string;
  uid: string;
  levelId: number;
  status: 'AVAILABLE' | 'COMPLETED' | 'LOCKED';
  score: number;
  completedAt?: string;
}

export interface ActivityLogRecord {
  logId: string;
  uid: string;
  actionType: 'LOGIN' | 'TEST_SUBMIT' | 'LOGOUT';
  metadata: string;
  timestamp: string;
}

export interface NominationData {
  companyName: string;
  founderName: string;
  location: string;
  problemStatement: string;
  whyNow: string;
  executionPlan: 'NONE' | 'GENERAL' | 'WEEKLY';
  potentialObstacles: string;
  pitchDeckUrl?: string;
  hasCommercialRegister: 'YES' | 'NO' | 'IN_PROGRESS';
  hasTechnicalPartner: boolean;
  isCommitted10Hours: boolean;
  marketSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'UNKNOWN';
  productStage: 'IDEA' | 'PROTOTYPE' | 'MVP' | 'TRACTION';
  userCount: string;
  revenueModel: string;
  weeklyHours: string;
  agreesToWeeklySession: boolean;
  agreesToKPIs: boolean;
  incubationReason: string;
  targetCustomerType: string[];
  currentResources: string[];
  tractionEvidence: string[];
  demoUrl?: string;
  topFeatures?: string;
  customerAcquisitionPath: string;
}

export interface NominationAIResponse {
  aiScore: number;
  redFlags: string[];
  aiAnalysis: string;
  categorySuggestion: 'DIRECT_ADMISSION' | 'INTERVIEW' | 'PRE_INCUBATION' | 'REJECTION';
}

export interface NominationResult {
  totalScore: number;
  category: 'DIRECT_ADMISSION' | 'INTERVIEW' | 'PRE_INCUBATION' | 'REJECTION';
  redFlags: string[];
  aiAnalysis: string;
}

export const SECTORS = [
  { value: 'Tech', label: 'تقنية وتكنولوجيا' },
  { value: 'Health', label: 'صحة وطب' },
  { value: 'Fintech', label: 'تقنية مالية' },
  { value: 'Edu', label: 'تعليم' },
  { value: 'Agri', label: 'زراعة' },
  { value: 'Retail', label: 'تجزئة' },
  { value: 'Energy', label: 'طاقة' },
];

export const LEVELS_CONFIG: LevelData[] = [
  { id: 1, title: 'التحقق من الفكرة', description: 'تأكد من أن فكرتك تحل مشكلة حقيقية وتستحق الاستثمار والجهد.', isCompleted: false, isLocked: false, icon: '💡' },
  { id: 2, title: 'نموذج العمل التجاري', description: 'ابنِ خطة عمل واضحة تحدد مصادر الدخل، العملاء، وقنوات التوزيع.', isCompleted: false, isLocked: true, icon: '📊' },
  { id: 3, title: 'تحليل السوق والمنافسين', description: 'افهم حجم السوق ومن هم منافسوك وكيف ستتفوق عليهم بميزتك التنافسية.', isCompleted: false, isLocked: true, icon: '🔎' },
  { id: 4, title: 'المنتج الأولي (MVP)', description: 'حدد الميزات الأساسية لمنتجك لإطلاقه بأقل التكاليف والحصول على تعليقات العملاء.', isCompleted: false, isLocked: true, icon: '🛠️' },
  { id: 5, title: 'الخطة المالية والتمويل', description: 'توقع التكاليف، الإيرادات، التدفقات النقدية، وااحتياجات التمويل المستقبلي.', isCompleted: false, isLocked: true, icon: '💰' },
  { id: 6, title: 'عرض الاستثمار النهائي', description: 'جهز عرضاً تقديمياً احترافياً (Pitch Deck) لجذب المستثمرين.', isCompleted: false, isLocked: true, icon: '🚀' },
];
