import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthProvider';
import { CurrencyProvider } from './hooks/useCurrency';
import { LoginPage } from '@/pages/Login';
import { Toaster } from '@/components/ui/toaster';

// import 'mapbox-gl/dist/mapbox-gl.css';

import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { SubmitTicketPage } from './pages/SubmitTicket';
import { TicketSubmittedPage } from './pages/TicketSubmitted';
import { LanguageWrapper } from './components/language-wrapper';
import { OverviewTab } from './components/overview/overview-tab';
import { FranchisesTab } from './components/franchises/franchises-tab';
import { SettingsPage } from './components/settings/settings-page';
import { RoyaltiesTab } from './components/royalties/royalties-tab';
// import { NAFTab } from './components/naf/naf-tab';
import { NAFTab } from './components/naf-tab';
import { TrainingTab } from './components/training/training-tab';

function App() {
  return (
    <LanguageWrapper>
      <Router>
        <AuthProvider>
          <CurrencyProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/submit-ticket" element={<SubmitTicketPage />} />
              <Route path="/ticket-submitted" element={<TicketSubmittedPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/overview" element={<OverviewTab />} />

                {/* Franchise routes */}
                <Route path="/franchises" element={<FranchisesTab />} />
                <Route path="/franchises/:franchiseId" element={<FranchisesTab />} />
                <Route path="/franchises/add" element={<FranchisesTab />} />

                {/* Royalties routes */}
                <Route path="/royalties" element={<RoyaltiesTab />} />

                {/* NAF routes */}
                <Route path="/naf" element={<NAFTab />} />
                <Route path="/naf/action/:actionId" element={<NAFTab />} />

                {/* settings routes */}
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/:section" element={<SettingsPage />} />
{/* Training routes */}
<Route path="/training" element={<TrainingTab />} />
                <Route path="/training/:eventId" element={<TrainingTab />} />
                {/* Add other section routes here */}
                <Route path="/support" element={<Dashboard />} />
                
                <Route path="/performance" element={<Dashboard />} />
                <Route path="/helpdesk" element={<Dashboard />} />
                <Route path="/dev" element={<Dashboard />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </CurrencyProvider>
        </AuthProvider>
      </Router>
    </LanguageWrapper>
  );
}

export default App;