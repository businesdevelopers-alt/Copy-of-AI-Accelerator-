
import React, { useState, useEffect } from 'react';
import { FiltrationStage, ApplicantProfile, FinalResult, UserProfile, LevelData, LEVELS_CONFIG, NominationResult, ProjectEvaluationResult } from './types';
import { storageService } from './services/storageService';
import { suggestIconsForLevels } from './services/geminiService';
import { Registration } from './components/Registration';
import { Login } from './components/Login';
import { NominationTest } from './components/Filtration/NominationTest';
import { ProjectEvaluation } from './components/Filtration/ProjectEvaluation';
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
import { IncubationProgram } from './components/IncubationProgram';

function App() {
  const [stage, setStage] = useState<FiltrationStage>(FiltrationStage.LANDING);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [levels, setLevels] = useState<LevelData[]>(LEVELS_CONFIG);
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [activeLegal, setActiveLegal] = useState<LegalType>(null);
  const [nominationOutcome, setNominationOutcome] = useState<NominationResult | null>(null);
  const [projectEvaluation, setProjectEvaluation] = useState<ProjectEvaluationResult | null>(null);

  useEffect(() => {
    const session = storageService.getCurrentSession();
    if (session) {
      const users = storageService.getAllUsers();
      const currentUser = users.find(u => u.uid === session.uid);
      const startups = storageService.getAllStartups();
      const startup = startups.find(s => s.ownerId === session.uid);

      if (currentUser && startup) {
        setUserProfile({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          phone: currentUser.phone,
          startupName: startup.name,
          startupDescription: startup.description,
          industry: startup.industry,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          hasCompletedAssessment: startup.status === 'APPROVED',
          logo: localStorage.getItem(`logo_${currentUser.uid}`) || undefined
        });

        const userProgress = storageService.getUserProgress(currentUser.uid);
        const updatedLevels = LEVELS_CONFIG.map((lvl, index) => {
          const progress = userProgress.find(p => p.levelId === lvl.id);
          const isCompleted = progress?.status === 'COMPLETED';
          
          let isLocked = true;
          if (startup.status === 'APPROVED') {
            if (index === 0) isLocked = false;
            else {
              const prevLvl = userProgress.find(p => p.levelId === LEVELS_CONFIG[index-1].id);
              if (prevLvl?.status === 'COMPLETED') isLocked = false;
            }
          }
          return { ...lvl, isCompleted, isLocked };
        });
        setLevels(updatedLevels);
        setStage(FiltrationStage.DASHBOARD);
      }
    }
  }, []);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setStage(FiltrationStage.DASHBOARD);
    window.location.reload(); 
  };

  const handleRegister = (profile: UserProfile) => {
    storageService.registerUser(profile);
    setUserProfile({ ...profile, name: `${profile.firstName} ${profile.lastName}`, hasCompletedAssessment: false });
    setStage(FiltrationStage.PROJECT_EVALUATION);
  };

  const handleLevelComplete = (id: number) => {
    const session = storageService.getCurrentSession();
    if (session) {
      storageService.updateProgress(session.uid, id, { status: 'COMPLETED', score: 100, completedAt: new Date().toISOString() });
    }
    
    setLevels(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, isCompleted: true } : l);
      return updated.map((l, idx) => {
        if (idx > 0 && updated[idx-1].isCompleted) return { ...l, isLocked: false };
        return l;
      });
    });
    setStage(FiltrationStage.DASHBOARD);
  };

  return (
    <div className="font-sans antialiased text-slate-900">
      {stage === FiltrationStage.LANDING && (
        <LandingPage 
          onStart={() => setStage(FiltrationStage.WELCOME)} 
          onPathFinder={() => setStage(FiltrationStage.PATH_FINDER)} 
          onSmartFeatures={() => {}} 
          onGovDashboard={() => {}} 
          onRoadmap={() => setStage(FiltrationStage.ROADMAP)} 
          onTools={() => setStage(FiltrationStage.TOOLS)} 
          onLegalClick={(type) => setActiveLegal(type)} 
          onLogin={() => setStage(FiltrationStage.LOGIN)}
          onAchievements={() => setStage(FiltrationStage.ACHIEVEMENTS)}
          onMentorship={() => setStage(FiltrationStage.MENTORSHIP)}
          onIncubation={() => setStage(FiltrationStage.INCUBATION_PROGRAM)}
        />
      )}

      {stage === FiltrationStage.INCUBATION_PROGRAM && (
        <IncubationProgram onBack={() => setStage(FiltrationStage.LANDING)} onApply={() => setStage(FiltrationStage.WELCOME)} />
      )}

      {stage === FiltrationStage.LOGIN && <Login onLoginSuccess={handleLoginSuccess} onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.ROADMAP && <RoadmapPage onStart={() => setStage(FiltrationStage.WELCOME)} onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.TOOLS && <ToolsPage onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.ACHIEVEMENTS && <AchievementsPage onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.MENTORSHIP && <MentorshipPage user={userProfile || undefined} onBack={() => setStage(FiltrationStage.DASHBOARD)} />}
      {stage === FiltrationStage.PATH_FINDER && <PathFinder onApproved={() => setStage(FiltrationStage.WELCOME)} onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.WELCOME && <Registration onRegister={handleRegister} onStaffLogin={() => setStage(FiltrationStage.STAFF_PORTAL)} />}

      {stage === FiltrationStage.PROJECT_EVALUATION && userProfile && (
        <ProjectEvaluation 
          profile={{ codeName: userProfile.startupName, projectStage: 'Idea', sector: userProfile.industry, goal: 'Validation', techLevel: 'Medium' }} 
          initialText={userProfile.startupDescription}
          onComplete={(res) => { setProjectEvaluation(res); setStage(FiltrationStage.NOMINATION_TEST); }}
        />
      )}

      {stage === FiltrationStage.NOMINATION_TEST && (
        <NominationTest 
          onComplete={(res) => {
            setNominationOutcome(res);
            const result: FinalResult = {
              score: res.totalScore,
              leadershipStyle: res.category === 'DIRECT_ADMISSION' ? "رائد أعمال متمكن" : "ريادي قيد التطوير",
              metrics: { readiness: res.totalScore * 0.8, analysis: res.totalScore * 0.9, tech: res.totalScore * 0.7, personality: 85, strategy: res.totalScore * 0.75, ethics: 95 },
              projectEval: projectEvaluation || undefined,
              isQualified: res.category === 'DIRECT_ADMISSION' || res.category === 'INTERVIEW',
              badges: [],
              recommendation: res.aiAnalysis
            };
            setFinalResult(result);
            setStage(FiltrationStage.ASSESSMENT_RESULT);
          }} 
          onReject={(reason) => { alert(`تم رفض الطلب: ${reason}`); setStage(FiltrationStage.LANDING); }}
        />
      )}
      
      {stage === FiltrationStage.ASSESSMENT_RESULT && finalResult && (
        <AssessmentResult result={finalResult} onContinue={() => {
          const session = storageService.getCurrentSession();
          if (session) storageService.updateStartupStatus(session.projectId, 'APPROVED');
          window.location.reload();
        }} />
      )}
      
      {stage === FiltrationStage.STAFF_PORTAL && <StaffPortal onBack={() => setStage(FiltrationStage.LANDING)} />}
      
      {stage === FiltrationStage.DASHBOARD && userProfile && (
        <Dashboard 
          user={userProfile} 
          levels={levels} 
          onSelectLevel={(id) => {
            const lvl = levels.find(l => l.id === id);
            if (lvl?.isLocked) return alert('هذه المحطة مغلقة.');
            setActiveLevelId(id); 
            setStage(FiltrationStage.LEVEL_VIEW); 
          }} 
          onShowCertificate={() => setStage(FiltrationStage.CERTIFICATE)} 
          onLogout={() => { localStorage.removeItem('db_current_session'); setStage(FiltrationStage.LANDING); }} 
          onOpenProAnalytics={() => setStage(FiltrationStage.PROJECT_BUILDER)}
        />
      )}

      {stage === FiltrationStage.LEVEL_VIEW && userProfile && activeLevelId && (
        <LevelView 
          level={levels.find(l => l.id === activeLevelId)!} 
          user={userProfile} 
          onComplete={() => handleLevelComplete(activeLevelId)} 
          onBack={() => setStage(FiltrationStage.DASHBOARD)}
        />
      )}

      {stage === FiltrationStage.CERTIFICATE && userProfile && <Certificate user={userProfile} onClose={() => setStage(FiltrationStage.DASHBOARD)} />}

      <LegalPortal type={activeLegal} onClose={() => setActiveLegal(null)} />
    </div>
  );
}

export default App;
