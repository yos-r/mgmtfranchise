import App from '@/App';
import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';
// import App from './App';

export function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <App/>;

  // return <App />;
}