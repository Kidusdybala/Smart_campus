import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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
import { PaymentCallbackPage } from "./pages/paymentpage/PaymentCallbackPage";
import NotFound from "./pages/dashboardpage/NotFound";
import { AuthWrapper } from "./components/auth/AuthWrapper";
import { api } from "./api";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.clearToken();
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/student" element={
        <AuthWrapper>
          {(user) => <StudentDashboard user={user} />}
        </AuthWrapper>
      } />
      <Route path="/student/qr" element={
        <AuthWrapper>
          {(user) => <QRScannerPage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/student/food" element={
        <AuthWrapper>
          {(user) => <FoodOrderingPage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/student/parking" element={
        <AuthWrapper>
          {(user) => <ParkingPage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/student/attendance" element={
        <AuthWrapper>
          {(user) => <AttendancePage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/student/grades" element={
        <AuthWrapper>
          {(user) => <StudentGradesPage user={user} />}
        </AuthWrapper>
      } />
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
      <Route path="/student/profile/wallet" element={
        <AuthWrapper>
          {(user) => <ProfilePage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/student/profile/vehicle" element={
        <AuthWrapper>
          {(user) => <ProfilePage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/student/profile/security" element={
        <AuthWrapper>
          {(user) => <ProfilePage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/staff/profile" element={<ProfilePage user={{ id: "2", name: "Staff", email: "staff@university.edu", role: "staff" }} />} />
      <Route path="/admin/profile" element={<ProfilePage user={{ id: "3", name: "Admin", email: "admin@university.edu", role: "admin" }} />} />
      <Route path="/staff" element={
        <AuthWrapper>
          {(user) => <StaffDashboard user={user} />}
        </AuthWrapper>
      } />
      <Route path="/staff/grades" element={
        <AuthWrapper>
          {(user) => <GradeManagementPage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/staff/attendance" element={
        <AuthWrapper>
          {(user) => <AttendanceViewPage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/staff/assignments" element={
        <AuthWrapper>
          {(user) => <AssignmentManagementPage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/admin" element={
        <AuthWrapper>
          {(user) => <AdminDashboard user={user} />}
        </AuthWrapper>
      } />
      <Route path="/admin/grades" element={
        <AuthWrapper>
          {(user) => <AdminGradeApprovalPage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/admin/users" element={
        <AuthWrapper>
          {(user) => <UserManagementPage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/admin/settings" element={
        <AuthWrapper>
          {(user) => <CampusSettingsPage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/admin/analytics" element={
        <AuthWrapper>
          {(user) => <AnalyticsPage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/admin/health" element={
        <AuthWrapper>
          {(user) => <SystemHealthPage user={user} />}
        </AuthWrapper>
      } />
      <Route path="/cafeteria" element={
        <AuthWrapper>
          {(user) => <CafeteriaDashboard user={user} onLogout={handleLogout} />}
        </AuthWrapper>
      } />
      <Route path="/payment/callback" element={<PaymentCallbackPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
