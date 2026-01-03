
import { UserRecord, StartupRecord, ProgressRecord, ActivityLogRecord, UserProfile } from '../types';

/**
 * خدمة إدارة قاعدة البيانات المحلية (LocalStorage Wrapper)
 */
const DB_KEYS = {
  USERS: 'db_users',
  STARTUPS: 'db_startups',
  PROGRESS: 'db_progress',
  LOGS: 'db_logs',
  SESSION: 'db_current_session'
};

export const storageService = {
  // --- Auth & User Operations ---
  registerUser: (profile: UserProfile): { user: UserRecord; startup: StartupRecord } => {
    const uid = `u_${Date.now()}`;
    const newUser: UserRecord = {
      uid,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
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
      stage: 'Idea',
      metrics: { 
        readiness: Math.floor(Math.random() * 40) + 30, 
        analysis: Math.floor(Math.random() * 40) + 30, 
        tech: 50, 
        personality: 60, 
        strategy: 40, 
        ethics: 90 
      },
      aiClassification: 'Yellow',
      aiOpinion: 'الفكرة واعدة ولكن تحتاج تفصيل في نموذج الربح.',
      status: 'PENDING'
    };

    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const startups = JSON.parse(localStorage.getItem(DB_KEYS.STARTUPS) || '[]');
    
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify([...users, newUser]));
    localStorage.setItem(DB_KEYS.STARTUPS, JSON.stringify([...startups, newStartup]));
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify({ uid, projectId: newStartup.projectId }));

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
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

    return { user, startup };
  },

  getCurrentSession: () => {
    const session = localStorage.getItem(DB_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  // --- Admin Operations ---
  getAllStartups: (): StartupRecord[] => {
    return JSON.parse(localStorage.getItem(DB_KEYS.STARTUPS) || '[]');
  },

  getAllUsers: (): UserRecord[] => {
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
  },

  updateStartupStatus: (projectId: string, status: StartupRecord['status']) => {
    const startups: StartupRecord[] = JSON.parse(localStorage.getItem(DB_KEYS.STARTUPS) || '[]');
    const index = startups.findIndex(s => s.projectId === projectId);
    if (index > -1) {
      startups[index].status = status;
      localStorage.setItem(DB_KEYS.STARTUPS, JSON.stringify(startups));
    }
  },

  // --- Progress Operations ---
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
  },

  getUserProgress: (uid: string): ProgressRecord[] => {
    const progressList: ProgressRecord[] = JSON.parse(localStorage.getItem(DB_KEYS.PROGRESS) || '[]');
    return progressList.filter(p => p.uid === uid);
  },

  // --- Activity Log ---
  logAction: (uid: string, type: ActivityLogRecord['actionType'], metadata: string) => {
    const logs: ActivityLogRecord[] = JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
    const newLog: ActivityLogRecord = {
      logId: `log_${Date.now()}`,
      uid,
      actionType: type,
      metadata,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify([newLog, ...logs].slice(0, 100)));
  },

  getAllLogs: (): ActivityLogRecord[] => {
    return JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
  }
};
