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