
import { UserRecord, StartupRecord, ProgressRecord, ActivityLogRecord, UserProfile, TaskRecord, TASKS_CONFIG, ServiceRequest } from '../types';

const DB_KEYS = {
  USERS: 'db_users',
  STARTUPS: 'db_startups',
  PROGRESS: 'db_progress',
  TASKS: 'db_tasks',
  SERVICES: 'db_service_requests',
  LOGS: 'db_logs',
  SESSION: 'db_current_session',
  TEMP_LEVEL_STATE: 'db_temp_level_',
  LEVEL_CUSTOMIZATIONS: 'db_level_customs',
  AI_ANALYSIS: 'db_ai_analysis'
};

export const storageService = {
  // ... existing methods ...
  
  saveAIAnalysis: (uid: string, type: 'swot' | 'growth' | 'opportunity', data: any) => {
    const analysis = JSON.parse(localStorage.getItem(DB_KEYS.AI_ANALYSIS) || '{}');
    if (!analysis[uid]) analysis[uid] = {};
    analysis[uid][type] = data;
    localStorage.setItem(DB_KEYS.AI_ANALYSIS, JSON.stringify(analysis));
  },

  getAIAnalysis: (uid: string, type: 'swot' | 'growth' | 'opportunity'): any | null => {
    const analysis = JSON.parse(localStorage.getItem(DB_KEYS.AI_ANALYSIS) || '{}');
    return analysis[uid]?.[type] || null;
  },
  registerUser: (profile: UserProfile): { user: UserRecord; startup: StartupRecord } => {
    const uid = `u_${Date.now()}`;
    const newUser: UserRecord = {
      uid,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      age: profile.age || 0,
      birthDate: profile.birthDate || '',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      settings: { theme: 'blue', notifications: true }
    };

    const newStartup: StartupRecord = {
      projectId: `p_${Date.now()}`,
      ownerId: uid,
      name: profile.startupName,
      description: profile.startupDescription,
      industry: profile.industry,
      foundationYear: profile.foundationYear || new Date().getFullYear(),
      foundersCount: profile.foundersCount || 1,
      technologies: profile.technologies || '',
      stage: 'Idea',
      metrics: { readiness: 40, analysis: 40, tech: 40, personality: 50, strategy: 40, ethics: 90 },
      aiClassification: 'Yellow',
      aiOpinion: 'تحت التقييم',
      status: 'PENDING'
    };

    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const startups = JSON.parse(localStorage.getItem(DB_KEYS.STARTUPS) || '[]');
    
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify([...users, newUser]));
    localStorage.setItem(DB_KEYS.STARTUPS, JSON.stringify([...startups, newStartup]));
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify({ uid, projectId: newStartup.projectId }));

    const tasks = TASKS_CONFIG.map(t => ({ ...t, uid, status: t.levelId === 1 ? 'ASSIGNED' : 'LOCKED' }));
    const allTasks = JSON.parse(localStorage.getItem(DB_KEYS.TASKS) || '[]');
    localStorage.setItem(DB_KEYS.TASKS, JSON.stringify([...allTasks, ...tasks]));

    return { user: newUser, startup: newStartup };
  },

  loginUser: (email: string): { user: UserRecord; startup: StartupRecord } | null => {
    const users: UserRecord[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const startups: StartupRecord[] = JSON.parse(localStorage.getItem(DB_KEYS.STARTUPS) || '[]');
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;

    const startup = startups.find(s => s.ownerId === user.uid);
    if (!startup) return null;

    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify({ uid: user.uid, projectId: startup.projectId }));
    
    user.lastLogin = new Date().toISOString();
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

    const allTasks = JSON.parse(localStorage.getItem(DB_KEYS.TASKS) || '[]');
    const userHasTasks = allTasks.some((t: any) => t.uid === user.uid);
    if (!userHasTasks) {
      const newTasks = TASKS_CONFIG.map(t => ({ ...t, uid: user.uid, status: t.levelId === 1 ? 'ASSIGNED' : 'LOCKED' }));
      localStorage.setItem(DB_KEYS.TASKS, JSON.stringify([...allTasks, ...newTasks]));
    }

    return { user, startup };
  },

  seedDemoAccount: (): string => {
    const demoEmail = 'demo@bizdev.ai';
    const users: UserRecord[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    if (users.some(u => u.email === demoEmail)) return demoEmail;

    const uid = 'u_demo_123';
    const newUser: UserRecord = {
      uid,
      firstName: 'رائد',
      lastName: 'تجريبي',
      email: demoEmail,
      phone: '0500000000',
      age: 30,
      birthDate: '1994-01-01',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      settings: { theme: 'indigo', notifications: true }
    };

    const newStartup: StartupRecord = {
      projectId: 'p_demo_123',
      ownerId: uid,
      name: 'منصة زراعة ذكية',
      description: 'مشروع تجريبي لتحليل بيانات التربة.',
      industry: 'AgriTech',
      foundationYear: 2024,
      foundersCount: 2,
      technologies: 'React, Node.js',
      stage: 'Prototype',
      metrics: { readiness: 85, analysis: 78, tech: 92, personality: 88, strategy: 70, ethics: 95 },
      aiClassification: 'Green',
      aiOpinion: 'مشروع متميز.',
      status: 'APPROVED'
    };

    const startups = JSON.parse(localStorage.getItem(DB_KEYS.STARTUPS) || '[]');
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify([...users, newUser]));
    localStorage.setItem(DB_KEYS.STARTUPS, JSON.stringify([...startups, newStartup]));

    const tasks = TASKS_CONFIG.map(t => ({ ...t, uid, status: t.levelId === 1 ? 'ASSIGNED' : 'LOCKED' }));
    const allTasks = JSON.parse(localStorage.getItem(DB_KEYS.TASKS) || '[]');
    localStorage.setItem(DB_KEYS.TASKS, JSON.stringify([...allTasks, ...tasks]));

    return demoEmail;
  },

  getCurrentSession: () => {
    const session = localStorage.getItem(DB_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  // --- Level Customization Operations ---
  saveLevelCustomization: (uid: string, levelId: number, customization: { icon?: string, customColor?: string }) => {
    const customs = JSON.parse(localStorage.getItem(DB_KEYS.LEVEL_CUSTOMIZATIONS) || '{}');
    if (!customs[uid]) customs[uid] = {};
    customs[uid][levelId] = { ...customs[uid][levelId], ...customization };
    localStorage.setItem(DB_KEYS.LEVEL_CUSTOMIZATIONS, JSON.stringify(customs));
  },

  getLevelCustomizations: (uid: string): Record<number, { icon: string, customColor: string }> => {
    const customs = JSON.parse(localStorage.getItem(DB_KEYS.LEVEL_CUSTOMIZATIONS) || '{}');
    return customs[uid] || {};
  },

  // --- Service Request Operations ---
  requestService: (uid: string, serviceId: string, packageId: string, details: string) => {
    const requests = JSON.parse(localStorage.getItem(DB_KEYS.SERVICES) || '[]');
    const newRequest: ServiceRequest = {
      id: `req_${Date.now()}`,
      uid,
      serviceId,
      packageId,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      details
    };
    localStorage.setItem(DB_KEYS.SERVICES, JSON.stringify([...requests, newRequest]));
    return newRequest;
  },

  getUserServiceRequests: (uid: string): ServiceRequest[] => {
    const requests = JSON.parse(localStorage.getItem(DB_KEYS.SERVICES) || '[]');
    return requests.filter((r: any) => r.uid === uid);
  },

  // --- Task Operations ---
  getUserTasks: (uid: string): TaskRecord[] => {
    const tasks = JSON.parse(localStorage.getItem(DB_KEYS.TASKS) || '[]');
    return tasks.filter((t: any) => t.uid === uid);
  },

  submitTask: (uid: string, taskId: string, content: string) => {
    const tasks = JSON.parse(localStorage.getItem(DB_KEYS.TASKS) || '[]');
    const index = tasks.findIndex((t: any) => t.uid === uid && t.id === taskId);
    if (index > -1) {
      tasks[index].status = 'SUBMITTED';
      tasks[index].submission = { content, submittedAt: new Date().toISOString() };
      localStorage.setItem(DB_KEYS.TASKS, JSON.stringify(tasks));
    }
  },

  unlockTaskForLevel: (uid: string, levelId: number) => {
    const tasks = JSON.parse(localStorage.getItem(DB_KEYS.TASKS) || '[]');
    const index = tasks.findIndex((t: any) => t.uid === uid && t.levelId === levelId);
    if (index > -1 && tasks[index].status === 'LOCKED') {
      tasks[index].status = 'ASSIGNED';
      localStorage.setItem(DB_KEYS.TASKS, JSON.stringify(tasks));
    }
  },

  updateStartupStatus: (projectId: string, status: StartupRecord['status']) => {
    const startups: StartupRecord[] = JSON.parse(localStorage.getItem(DB_KEYS.STARTUPS) || '[]');
    const index = startups.findIndex(s => s.projectId === projectId);
    if (index > -1) {
      startups[index].status = status;
      localStorage.setItem(DB_KEYS.STARTUPS, JSON.stringify(startups));
    }
  },

  updateProgress: (uid: string, levelId: number, data: Partial<ProgressRecord>) => {
    const progressList: ProgressRecord[] = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');
    const index = progressList.findIndex(p => p.uid === uid && p.levelId === levelId);
    
    if (index > -1) {
      progressList[index] = { ...progressList[index], ...data };
    } else {
      progressList.push({
        id: `prog_${Date.now()}`,
        uid,
        levelId,
        status: 'AVAILABLE',
        score: 0,
        ...data
      } as ProgressRecord);
    }
    
    localStorage.setItem(DB_KEYS.PROGRESS, JSON.stringify(progressList));
    if (data.status === 'COMPLETED') {
      storageService.unlockTaskForLevel(uid, levelId);
    }
  },

  getUserProgress: (uid: string): ProgressRecord[] => {
    const progressList = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');
    return progressList.filter((p: any) => p.uid === uid);
  },

  getAllStartups: (): StartupRecord[] => JSON.parse(localStorage.getItem(DB_KEYS.STARTUPS) || '[]'),
  getAllUsers: (): UserRecord[] => JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]'),
  logAction: (uid: string, type: ActivityLogRecord['actionType'], metadata: string) => {
    const logs = JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
    const newLog = { logId: `log_${Date.now()}`, uid, actionType: type, metadata, timestamp: new Date().toISOString() };
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify([newLog, ...logs].slice(0, 100)));
  },
  getAllLogs: (): ActivityLogRecord[] => JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]')
};
