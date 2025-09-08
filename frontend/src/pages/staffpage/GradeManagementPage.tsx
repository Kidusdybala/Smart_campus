import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { GradeManagement } from "../../components/staff/GradeManagement";
import { api } from "../../api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin" | "cafeteria";
};

interface GradeManagementPageProps {
  user: User;
}

export function GradeManagementPage({ user }: GradeManagementPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Since user is passed as prop, we just need to verify they have staff role
    if (user && user.role === 'staff') {
      setLoading(false);
    } else {
      navigate('/');
    }
  }, [user, navigate]);

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
                onClick={() => navigate('/staff')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Grade Management</h1>
                  <p className="text-white/80 text-sm">Upload and manage student grades</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <GradeManagement user={user} />
      </div>
    </div>
  );
}