
import React, { useState, useEffect } from 'react';
import { FiltrationStage, ApplicantProfile, FinalResult, UserProfile, LevelData, LEVELS_CONFIG, ProjectEvaluationResult } from './types';
import { storageService } from './services/storageService';
import { Registration } from './components/Registration';
import { Login } from './components/Login';
import { PersonalityTest } from './components/Filtration/PersonalityTest';
import { AnalyticalTest } from './components/Filtration/AnalyticalTest';
import { ProjectEvaluation } from './components/Filtration/ProjectEvaluation';
import { AssessmentResult } from './components/Filtration/AssessmentResult';
import { FinalReport } from './components/Filtration/FinalReport';
import { DevelopmentPlan } from './components/Filtration/DevelopmentPlan';
import { ApplicationStatus } from './components/Filtration/ApplicationStatus';
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

function App() {
  const [stage, setStage] = useState<FiltrationStage>(FiltrationStage.LANDING);
  const [applicantProfile, setApplicantProfile] = useState<ApplicantProfile | null>(null);
  const [leadershipStyle, setLeadershipStyle] = useState<string>('');
  const [analyticalScore, setAnalyticalScore] = useState<number>(0);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [levels, setLevels] = useState<LevelData[]>(LEVELS_CONFIG);
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [activeLegal, setActiveLegal] = useState<LegalType>(null);

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
            hasCompletedAssessment: startup.status !== 'PENDING'
          });
        }
      }
    }
  }, []);

  const handleStartFiltration = () => setStage(FiltrationStage.WELCOME);
  const handleStartPathFinder = () => setStage(FiltrationStage.PATH_FINDER);
  const handleShowRoadmap = () => setStage(FiltrationStage.ROADMAP);
  const handleShowTools = () => setStage(FiltrationStage.TOOLS);
  const handleLoginNav = () => setStage(FiltrationStage.LOGIN);
  const handleStaffLogin = () => setStage(FiltrationStage.STAFF_PORTAL);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setStage(FiltrationStage.DASHBOARD);
  };

  const handleRegister = (profile: UserProfile) => {
    const { user, startup } = storageService.registerUser(profile);
    storageService.logAction(user.uid, 'LOGIN', 'User Registered');
    
    const updatedProfile = {
      ...profile,
      name: `${profile.firstName} ${profile.lastName}`,
      hasCompletedAssessment: false
    };

    setUserProfile(updatedProfile);
    setApplicantProfile({
      codeName: updatedProfile.name,
      projectStage: 'Idea',
      sector: profile.industry,
      goal: profile.startupDescription,
      techLevel: 'Medium'
    });

    setStage(FiltrationStage.DASHBOARD); // Now goes to Personal Page first
  };

  const handleStartAssessment = () => {
    setStage(FiltrationStage.PERSONALITY_TEST);
  };

  const handlePersonalityComplete = (style: string) => {
    setLeadershipStyle(style);
    setStage(FiltrationStage.ANALYTICAL_TEST);
  };

  const handleAnalyticalComplete = (score: number) => {
    setAnalyticalScore(score);
    setStage(FiltrationStage.PROJECT_EVALUATION);
  };

  const handleProjectEvaluationComplete = (evalResult: ProjectEvaluationResult) => {
    const result: FinalResult = {
      score: Math.round((analyticalScore + evalResult.totalScore) / 2),
      leadershipStyle,
      projectEval: evalResult,
      metrics: {
        readiness: evalResult.readiness * 5,
        analysis: analyticalScore,
        tech: evalResult.innovation * 5,
        personality: 80,
        strategy: evalResult.market * 5,
        ethics: 95
      },
      isQualified: evalResult.classification === 'Green',
      badges: [{ id: 'b1', name: 'رائد أعمال معتمد', icon: '🏆', color: 'blue' }],
      recommendation: evalResult.aiOpinion
    };
    setFinalResult(result);
    setStage(FiltrationStage.ASSESSMENT_RESULT);
  };

  const finalizeAssessment = () => {
    if (userProfile) {
       const updated = { ...userProfile, hasCompletedAssessment: true };
       setUserProfile(updated);
       // Update persistence if needed
       const session = storageService.getCurrentSession();
       if (session) storageService.updateStartupStatus(session.projectId, 'APPROVED');
    }
    setStage(FiltrationStage.DASHBOARD);
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
        <LandingPage onStart={handleStartFiltration} onPathFinder={handleStartPathFinder} onSmartFeatures={() => {}} onGovDashboard={() => {}} onRoadmap={handleShowRoadmap} onTools={handleShowTools} onLegalClick={(type) => setActiveLegal(type)} onLogin={handleLoginNav} />
      )}

      {stage === FiltrationStage.LOGIN && (
        <Login onLoginSuccess={handleLoginSuccess} onBack={() => setStage(FiltrationStage.LANDING)} />
      )}

      {stage === FiltrationStage.ROADMAP && <RoadmapPage onStart={handleStartFiltration} onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.TOOLS && <ToolsPage onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.PATH_FINDER && <PathFinder onApproved={handleStartFiltration} onBack={() => setStage(FiltrationStage.LANDING)} />}
      {stage === FiltrationStage.WELCOME && <Registration onRegister={handleRegister} onStaffLogin={handleStaffLogin} />}

      {stage === FiltrationStage.PERSONALITY_TEST && <PersonalityTest onComplete={handlePersonalityComplete} />}
      {stage === FiltrationStage.ANALYTICAL_TEST && applicantProfile && <AnalyticalTest profile={applicantProfile} onComplete={handleAnalyticalComplete} />}
      {stage === FiltrationStage.PROJECT_EVALUATION && applicantProfile && <ProjectEvaluation profile={applicantProfile} onComplete={handleProjectEvaluationComplete} />}
      {stage === FiltrationStage.ASSESSMENT_RESULT && finalResult && <AssessmentResult result={finalResult} onContinue={() => setStage(FiltrationStage.APPLICATION_STATUS)} />}
      {stage === FiltrationStage.APPLICATION_STATUS && applicantProfile && finalResult && <ApplicationStatus profile={applicantProfile} result={finalResult} onNext={() => setStage(FiltrationStage.FINAL_REPORT)} />}
      {stage === FiltrationStage.FINAL_REPORT && applicantProfile && finalResult && <FinalReport profile={applicantProfile} result={finalResult} onStartJourney={finalizeAssessment} />}
      {stage === FiltrationStage.DEVELOPMENT_PLAN && applicantProfile && finalResult && <DevelopmentPlan profile={applicantProfile} result={finalResult} onRestart={() => setStage(FiltrationStage.WELCOME)} />}

      {stage === FiltrationStage.STAFF_PORTAL && <StaffPortal onBack={() => setStage(FiltrationStage.LANDING)} />}
      
      {stage === FiltrationStage.DASHBOARD && userProfile && (
        <Dashboard 
          user={userProfile} 
          levels={levels} 
          onSelectLevel={(id) => { setActiveLevelId(id); setStage(FiltrationStage.LEVEL_VIEW); }} 
          onShowCertificate={() => setStage(FiltrationStage.CERTIFICATE)} 
          onLogout={() => { localStorage.removeItem('db_current_session'); setStage(FiltrationStage.LANDING); }} 
          onOpenProAnalytics={() => setStage(FiltrationStage.PROJECT_BUILDER)}
          onStartAssessment={handleStartAssessment}
        />
      )}

      {stage === FiltrationStage.LEVEL_VIEW && userProfile && activeLevelId && (
        <LevelView level={levels.find(l => l.id === activeLevelId)!} user={userProfile} onComplete={() => handleLevelComplete(activeLevelId)} onBack={() => setStage(FiltrationStage.DASHBOARD)} />
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
