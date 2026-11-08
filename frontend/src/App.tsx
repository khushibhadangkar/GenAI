import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewDashboard } from './views/OverviewDashboard';
import { TranslatorWorkspace } from './views/TranslatorWorkspace';
import { ImageTranslatorStudio } from './views/ImageTranslatorStudio';
import { ModelComparisonView } from './views/ModelComparisonView';
import { VoiceStudioView } from './views/VoiceStudioView';
import { BiasAnalysisView } from './views/BiasAnalysisView';
import { EvaluationLabView } from './views/EvaluationLabView';
import { AboutProjectView } from './views/AboutProjectView';
import { fetchModelStatus } from './api/client';
import { ModelStatusResponse } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavItem>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);

  useEffect(() => {
    fetchModelStatus()
      .then(setModelStatus)
      .catch((err) => console.warn('Backend status check:', err.message));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        device={modelStatus?.device || 'cpu'}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          status={modelStatus}
          onOpenMobile={() => setIsMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewDashboard
              status={modelStatus}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'translator' && <TranslatorWorkspace />}

          {currentTab === 'image-translator' && <ImageTranslatorStudio />}

          {currentTab === 'model-comparison' && <ModelComparisonView />}

          {currentTab === 'voice-studio' && <VoiceStudioView />}

          {currentTab === 'bias-analysis' && <BiasAnalysisView />}

          {currentTab === 'evaluation-lab' && <EvaluationLabView />}

          {currentTab === 'about' && <AboutProjectView />}
        </main>
      </div>
    </div>
  );
};

export default App;

