import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

// Elegant, real estate inspired loading spinner component
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Outer circle */}
          <div className="absolute inset-0 border-4 border-neutral-100 rounded-full"></div>
          {/* Spinning part */}
          <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
          {/* Building icon in center - absolute positioning with transform */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center w-full h-full">
              <img 
                src="https://images.seeklogo.com/logo-png/32/2/century-21-logo-png_seeklogo-328619.png" 
                className="w-16 h-16 object-contain -ml-2"
                alt="Century 21 logo"
                style={{ transform: 'translateY(0px)' }} // Fine-tune position if needed
              /> 
            </div>
          </div>
        </div>
        <p className="mt-4 text-neutral-500 font-light text-sm">Loading</p>
      </div>
    </div>
  );
};

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render children or Outlet if authenticated
  return children ? <>{children}</> : <Outlet />;
};