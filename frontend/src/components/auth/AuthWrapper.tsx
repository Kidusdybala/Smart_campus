import { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin" | "cafeteria";
};

interface AuthWrapperProps {
  children: (user: User) => ReactNode;
  fallback?: ReactNode;
}

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          navigate('/');
          return;
        }

        const parsedUser = JSON.parse(userData);
        if (!parsedUser.id || !parsedUser.name || !parsedUser.email || !parsedUser.role) {
          navigate('/');
          return;
        }

        setUser(parsedUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || null;
  }

  return <>{children(user)}</>;
}