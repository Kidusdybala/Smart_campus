import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { StudentGrades } from "../../components/student/StudentGrades";
import { api } from "../../api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin" | "cafeteria";
};

interface StudentGradesPageProps {
  user: User;
}

export function StudentGradesPage({ user }: StudentGradesPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get user from localStorage or API
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        // For now, we'll assume the user is authenticated
        // In a real app, you'd validate the token
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData.id) {
          navigate('/');
          return;
        }
      } catch (error) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);
  
  // Prevent redirection to localhost
  useEffect(() => {
    // This prevents the browser from treating the URL as an external link
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.getAttribute('href')?.startsWith('/')) {
        e.preventDefault();
        navigate(link.getAttribute('href') || '/');
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => navigate('/student')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Academic Grades</h1>
                  <p className="text-white/80 text-sm">View your academic performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <StudentGrades user={user} />
      </div>
    </div>
  );
}