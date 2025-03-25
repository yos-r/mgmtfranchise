import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, getCurrentUser, onAuthStateChange } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          role: user.role,
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      if (!user) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}