import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthProvider';
import { LoginPage } from '@/pages/Login';
import { Toaster } from '@/components/ui/toaster';

import 'mapbox-gl/dist/mapbox-gl.css';

import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;