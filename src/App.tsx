import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { EventsPage } from './pages/EventsPage';
import { CopilotPage } from './pages/CopilotPage';
import { BudgetPage } from './pages/BudgetPage';
import { TasksPage } from './pages/TasksPage';
import { GuestsPage } from './pages/GuestsPage';
import { VendorsPage } from './pages/VendorsPage';
import { IdeasPage } from './pages/IdeasPage';
import { RunbookPage } from './pages/RunbookPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing & Onboarding */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard Workspace */}
        <Route path="/app" element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="copilot" element={<CopilotPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="ideas" element={<IdeasPage />} />
          <Route path="runbook" element={<RunbookPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
