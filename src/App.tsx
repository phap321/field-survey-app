import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { DashboardPage } from './pages/DashboardPage';
import { SurveyFormPage } from './pages/SurveyFormPage';
import { MapViewPage } from './pages/MapViewPage';
import { SurveyListPage } from './pages/SurveyListPage';
import { SurveyDetailPage } from './pages/SurveyDetailPage';
import { seedSampleSurveysIfEmpty } from './db/surveyDatabase';
import { SurveyRecord } from './types/survey';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyRecord | null>(null);

  useEffect(() => {
    // Seed initial mock data if database is empty
    seedSampleSurveysIfEmpty();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-gray-200">
      {/* Header */}
      <Header />

      {/* Main Page Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardPage
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectSurvey={(survey) => setSelectedSurvey(survey)}
          />
        )}

        {activeTab === 'new-survey' && (
          <SurveyFormPage
            onSuccess={() => setActiveTab('survey-list')}
          />
        )}

        {activeTab === 'map-view' && (
          <MapViewPage
            onSelectSurvey={(survey) => setSelectedSurvey(survey)}
          />
        )}

        {activeTab === 'survey-list' && (
          <SurveyListPage
            onSelectSurvey={(survey) => setSelectedSurvey(survey)}
          />
        )}
      </main>

      {/* Survey Detail Modal */}
      {selectedSurvey && (
        <SurveyDetailPage
          survey={selectedSurvey}
          onClose={() => setSelectedSurvey(null)}
        />
      )}

      {/* Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

export default App;
