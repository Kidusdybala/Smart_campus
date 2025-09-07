import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/dashboardpage/Index";
import { StudentDashboard } from "./pages/studentpage/StudentDashboard";
import { StaffDashboard } from "./pages/staffpage/StaffDashboard";
import { AdminDashboard } from "./pages/adminpage/AdminDashboard";
import { CafeteriaDashboard } from "./pages/cafeteriapage/CafeteriaDashboard";
import { QRScannerPage } from "./pages/studentpage/QRScannerPage";
import { FoodOrderingPage } from "./pages/cafeteriapage/FoodOrderingPage";
import { ParkingPage } from "./pages/studentpage/ParkingPage";
import { AttendancePage } from "./pages/studentpage/AttendancePage";
import { ProfilePage } from "./pages/studentpage/ProfilePage";
import { StudentGradesPage } from "./pages/studentpage/StudentGradesPage";
import { GradeManagementPage } from "./pages/staffpage/GradeManagementPage";
import { AttendanceViewPage } from "./pages/staffpage/AttendanceViewPage";
import { AssignmentManagementPage } from "./pages/staffpage/AssignmentManagementPage";
import { AdminGradeApprovalPage } from "./pages/adminpage/AdminGradeApprovalPage";
import { UserManagementPage } from "./pages/adminpage/UserManagementPage";
import { CampusSettingsPage } from "./pages/adminpage/CampusSettingsPage";
import { AnalyticsPage } from "./pages/adminpage/AnalyticsPage";
import { SystemHealthPage } from "./pages/adminpage/SystemHealthPage";
import NotFound from "./pages/dashboardpage/NotFound";
import { AuthWrapper } from "./components/auth/AuthWrapper";
import { api } from "./api";

const queryClient = new QueryClient();

// Global link handler component
const LinkHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This prevents the browser from treating internal URLs as external links
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

  return null;
};

const AppContent = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.clearToken();
    navigate("/");
  };

  return (
    <>
      <LinkHandler />
      <Routes>
        <Route path="/" element={<Index />} />

        {/* Student Routes */}
        <Route path="/student" element={
          <AuthWrapper>
            {(user) => user.role === 'student' && <StudentDashboard user={user} />}
          </AuthWrapper>
        } />
        <Route path="/student/qr" element={
          <AuthWrapper>
            {(user) => user.role === 'student' && <QRScannerPage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/student/food" element={
          <AuthWrapper>
            {(user) => user.role === 'student' && <FoodOrderingPage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/student/parking" element={
          <AuthWrapper>
            {(user) => user.role === 'student' && <ParkingPage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/student/attendance" element={
          <AuthWrapper>
            {(user) => user.role === 'student' && <AttendancePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/student/grades" element={
          <AuthWrapper>
            {(user) => user.role === 'student' && <StudentGradesPage user={user} />}
          </AuthWrapper>
        } />

        {/* Profile Routes */}
        <Route path="/profile" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/profile/vehicle" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/profile/wallet" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/profile/security" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/student/profile" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/student/profile/vehicle" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/student/profile/wallet" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/student/profile/security" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/staff/profile" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/staff/profile/vehicle" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/staff/profile/wallet" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/staff/profile/security" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/admin/profile" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/admin/profile/vehicle" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/admin/profile/wallet" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/admin/profile/security" element={
          <AuthWrapper>
            {(user) => <ProfilePage user={user} />}
          </AuthWrapper>
        } />

        {/* Staff Routes */}
        <Route path="/staff" element={
          <AuthWrapper>
            {(user) => user.role === 'staff' && <StaffDashboard user={user} />}
          </AuthWrapper>
        } />
        <Route path="/staff/grades" element={
          <AuthWrapper>
            {(user) => user.role === 'staff' && <GradeManagementPage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/staff/attendance" element={
          <AuthWrapper>
            {(user) => user.role === 'staff' && <AttendanceViewPage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/staff/assignments" element={
          <AuthWrapper>
            {(user) => user.role === 'staff' && <AssignmentManagementPage user={user} />}
          </AuthWrapper>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AuthWrapper>
            {(user) => user.role === 'admin' && <AdminDashboard user={user} />}
          </AuthWrapper>
        } />
        <Route path="/admin/grades" element={
          <AuthWrapper>
            {(user) => user.role === 'admin' && <AdminGradeApprovalPage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/admin/users" element={
          <AuthWrapper>
            {(user) => user.role === 'admin' && <UserManagementPage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/admin/settings" element={
          <AuthWrapper>
            {(user) => user.role === 'admin' && <CampusSettingsPage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/admin/analytics" element={
          <AuthWrapper>
            {(user) => user.role === 'admin' && <AnalyticsPage user={user} />}
          </AuthWrapper>
        } />
        <Route path="/admin/health" element={
          <AuthWrapper>
            {(user) => user.role === 'admin' && <SystemHealthPage user={user} />}
          </AuthWrapper>
        } />

        {/* Cafeteria Routes */}
        <Route path="/cafeteria" element={
          <AuthWrapper>
            {(user) => user.role === 'cafeteria' && <CafeteriaDashboard user={user} onLogout={handleLogout} />}
          </AuthWrapper>
        } />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
