
import React, { useState, useEffect } from 'react';
import { FiltrationStage, ApplicantProfile, FinalResult, UserProfile, LevelData, LEVELS_CONFIG, NominationResult } from './types';
import { storageService } from './services/storageService';
import { suggestIconsForLevels } from './services/geminiService';
import { Registration } from './components/Registration';
import { Login } from './components/Login';
import { NominationTest } from './components/Filtration/NominationTest';
import { AssessmentResult } from './components/Filtration/AssessmentResult';
import { DevelopmentPlan } from './components/Filtration/DevelopmentPlan';
import { LandingPage } from './components/LandingPage';
import { RoadmapPage } from './components/RoadmapPage';
import { PathFinder } from './components/PathFinder';
import { Dashboard } from './components/Dashboard';
import { LevelView } from './components/LevelView';
import { Certificate } from './components/Certificate';
import { AdminDashboard } from './components/Filtration/AdminDashboard';
import { ToolsPage } from './components/ToolsPage';
import { LegalPortal, LegalType } from './components/LegalPortal';
import { StaffPortal } from './components/StaffPortal';
import { AchievementsPage } from './components/AchievementsPage';
import { MentorshipPage } from './components/MentorshipPage';

function App() {
  const [stage, setStage] = useState<FiltrationStage>(FiltrationStage.LANDING);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [levels, setLevels] = useState<LevelData[]>(LEVELS_CONFIG);
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [activeLegal, setActiveLegal] = useState<LegalType>(null);
  const [nominationOutcome, setNominationOutcome] = useState<NominationResult | null>(null);

  useEffect(() => {
    const session = storageService.getCurrentSession();
    if (session) {
      const users = storageService.getAllUsers();
      const currentUser = users.find(u => u.uid === session.uid);
      if (currentUser) {
        const startups = storageService.getAllStartups();
        const startup = startups.find(s => s.ownerId === currentUser.uid);
        if (startup) {
          setUserProfile({
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            phone: currentUser.phone,
            startupName: startup.name,
            startupDescription: startup.description,
            industry: startup.industry,
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            hasCompletedAssessment: startup.status === 'APPROVED'
          });
          setStage(FiltrationStage.DASHBOARD);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (stage === FiltrationStage.DASHBOARD && userProfile?.hasCompletedAssessment) {
      const savedIcons = localStorage.getItem('dashboard_level_icons');
      const hasAIIcons = localStorage.getItem('dashboard_ai_icons_synced');
      
      if (!savedIcons && !hasAIIcons) {
        suggestIconsForLevels(levels).then(iconMap => {
          if (Object.keys(iconMap).length > 0) {
            localStorage.setItem('dashboard_level_icons', JSON.stringify(iconMap));
            localStorage.setItem('dashboard_ai_icons_synced', 'true');
            window.dispatchEvent(new Event('storage'));
          }
        });
      }
    }
  }, [stage, userProfile, levels]);

  const handleStartFiltration = () => setStage(FiltrationStage.WELCOME);
  const handleStartPathFinder = () => setStage(FiltrationStage.PATH_FINDER);
  const handleShowRoadmap = () => setStage(FiltrationStage.ROADMAP);
  const handleShowTools = () => setStage(FiltrationStage.TOOLS);
  const handleLoginNav = () => setStage(FiltrationStage.LOGIN);
  const handleStaffLogin = () => setStage(FiltrationStage.STAFF_PORTAL);
  const handleShowAchievements = () => setStage(FiltrationStage.ACHIEVEMENTS);
  const handleShowMentorship = () => setStage(FiltrationStage.MENTORSHIP);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setStage(FiltrationStage.DASHBOARD);
  };

  const handleRegister = (profile: UserProfile) => {
    const { user, startup } = storageService.registerUser(profile);
    storageService.logAction(user.uid, 'LOGIN', 'User Registered');
    
    setUserProfile({
      ...profile,
      name: `${profile.firstName} ${profile.lastName}`,
      hasCompletedAssessment: false
    });

    setStage(FiltrationStage.NOMINATION_TEST);
  };

  const handleNominationComplete = (res: NominationResult) => {
    setNominationOutcome(res);
    
    const result: FinalResult = {
      score: res.totalScore,
      leadershipStyle: res.category === 'DIRECT_ADMISSION' ? "رائد أعمال متمكن" : "ريادي قيد التطوير",
      metrics: {
        readiness: res.totalScore * 0.8,
        analysis: res.totalScore * 0.9,
        tech: res.totalScore * 0.7,
        personality: 85,
        strategy: res.totalScore * 0.75,
        ethics: 95
      },
      isQualified: res.category === 'DIRECT_ADMISSION' || res.category === 'INTERVIEW',
      badges: res.category === 'DIRECT_ADMISSION' ? [{ id: 'b1', name: 'نخبة الرواد', icon: '💎', color: 'blue' }] : [],
      recommendation: res.aiAnalysis
    };
    
    setFinalResult(result);
    setStage(FiltrationStage.ASSESSMENT_RESULT);
  };

  const finalizeAssessment = () => {
    if (userProfile && finalResult?.isQualified) {
       const updated = { ...userProfile, hasCompletedAssessment: true };
       setUserProfile(updated);
       const session = storageService.getCurrentSession();
       if (session) storageService.updateStartupStatus(session.projectId, 'APPROVED');
       setStage(FiltrationStage.DASHBOARD);
    } else {
       setStage(FiltrationStage.DEVELOPMENT_PLAN);
    }
  };

  const handleLevelComplete = (id: number) => {
    const session = storageService.getCurrentSession();
    if (session) {
      storageService.updateProgress(session.uid, id, { status: 'COMPLETED', score: 100, completedAt: new Date().toISOString() });
      storageService.logAction(session.uid, 'TEST_SUBMIT', `Completed Level ${id}`);
    }
    setLevels(prev => prev.map(l => l.id === id ? { ...l, isCompleted: true } : l.id === id + 1 ? { ...l, isLocked: false } : l));
    setStage(FiltrationStage.DASHBOARD);
  };

  return (
    <div className="font-sans antialiased text-slate-900">
      {stage === FiltrationStage.LANDING && (
        <LandingPage 
          onStart={handleStartFiltration} 
          onPathFinder={handleStartPathFinder} 
          onSmartFeatures={() => {}} 
          onGovDashboard={() => {}} 
          onRoadmap={handleShowRoadmap} 
          onTools={handleShowTools} 
          onLegalClick={(type) => setActiveLegal(type)} 
          onLogin={handleLoginNav}
          onAchievements={handleShowAchievements}
          onMentorship={handleShowMentorship}
        />
      )}

      {stage === FiltrationStage.LOGIN && (
        <Login onLoginSuccess={handleLoginSuccess} onBack={() => setStage(FiltrationStage.LANDING)} />
      )}

      {stage === FiltrationStage.ROADMAP && <RoadmapPage onStart={handleStartFiltration} onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.TOOLS && <ToolsPage onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.ACHIEVEMENTS && <AchievementsPage onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.MENTORSHIP && <MentorshipPage user={userProfile || undefined} onBack={() => setStage(FiltrationStage.DASHBOARD)} />}
      {stage === FiltrationStage.PATH_FINDER && <PathFinder onApproved={handleStartFiltration} onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.WELCOME && <Registration onRegister={handleRegister} onStaffLogin={handleStaffLogin} />}

      {stage === FiltrationStage.NOMINATION_TEST && (
        <NominationTest 
          onComplete={handleNominationComplete} 
          onReject={(reason) => {
            alert(`نأسف، تم رفض الطلب بسبب: ${reason}`);
            setStage(FiltrationStage.LANDING);
          }}
        />
      )}
      
      {stage === FiltrationStage.ASSESSMENT_RESULT && finalResult && (
        <AssessmentResult result={finalResult} onContinue={finalizeAssessment} />
      )}
      
      {stage === FiltrationStage.DEVELOPMENT_PLAN && finalResult && (
        <DevelopmentPlan result={finalResult} onRestart={() => setStage(FiltrationStage.NOMINATION_TEST)} />
      )}

      {stage === FiltrationStage.STAFF_PORTAL && <StaffPortal onBack={() => setStage(FiltrationStage.LANDING)} />}
      
      {stage === FiltrationStage.DASHBOARD && userProfile && (
        <Dashboard 
          user={userProfile} 
          levels={levels} 
          onSelectLevel={(id) => { setActiveLevelId(id); setStage(FiltrationStage.LEVEL_VIEW); }} 
          onShowCertificate={() => setStage(FiltrationStage.CERTIFICATE)} 
          onLogout={() => { localStorage.removeItem('db_current_session'); setStage(FiltrationStage.LANDING); }} 
          onOpenProAnalytics={() => setStage(FiltrationStage.PROJECT_BUILDER)}
          onStartAssessment={() => setStage(FiltrationStage.NOMINATION_TEST)}
        />
      )}

      {stage === FiltrationStage.LEVEL_VIEW && userProfile && activeLevelId && (
        <LevelView 
          level={levels.find(l => l.id === activeLevelId)!} 
          user={userProfile} 
          onComplete={() => handleLevelComplete(activeLevelId)} 
          onBack={() => setStage(FiltrationStage.DASHBOARD)}
          onRequestMentorship={() => setStage(FiltrationStage.MENTORSHIP)}
        />
      )}

      {stage === FiltrationStage.CERTIFICATE && userProfile && <Certificate user={userProfile} onClose={() => setStage(FiltrationStage.DASHBOARD)} />}

      {stage === FiltrationStage.PROJECT_BUILDER && (
         <AdminDashboard user={userProfile || undefined} levels={levels} metrics={finalResult?.metrics} onBack={() => setStage(FiltrationStage.DASHBOARD)} />
      )}

      <LegalPortal type={activeLegal} onClose={() => setActiveLegal(null)} />
    </div>
  );
}

export default App;
