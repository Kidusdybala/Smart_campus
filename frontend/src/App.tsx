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
import NotFound from "./pages/dashboardpage/NotFound";
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
      <Route path="/student" element={<StudentDashboard user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
      <Route path="/student/qr" element={<QRScannerPage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
      <Route path="/student/food" element={<FoodOrderingPage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
      <Route path="/student/parking" element={<ParkingPage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
      <Route path="/student/attendance" element={<AttendancePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
      <Route path="/student/grades" element={<StudentGradesPage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
      <Route path="/profile" element={<ProfilePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
      <Route path="/profile/vehicle" element={<ProfilePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
      <Route path="/profile/wallet" element={<ProfilePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
      <Route path="/profile/security" element={<ProfilePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
      <Route path="/student/profile" element={<ProfilePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
      <Route path="/staff/profile" element={<ProfilePage user={{ id: "2", name: "Staff", email: "staff@university.edu", role: "staff" }} />} />
      <Route path="/admin/profile" element={<ProfilePage user={{ id: "3", name: "Admin", email: "admin@university.edu", role: "admin" }} />} />
      <Route path="/staff" element={<StaffDashboard user={{ id: "1", name: "Staff", email: "staff@university.edu", role: "staff" }} />} />
      <Route path="/staff/grades" element={<GradeManagementPage user={{ id: "1", name: "Staff", email: "staff@university.edu", role: "staff" }} />} />
      <Route path="/staff/attendance" element={<AttendanceViewPage user={{ id: "1", name: "Staff", email: "staff@university.edu", role: "staff" }} />} />
      <Route path="/staff/assignments" element={<AssignmentManagementPage user={{ id: "1", name: "Staff", email: "staff@university.edu", role: "staff" }} />} />
      <Route path="/admin" element={<AdminDashboard user={{ id: "1", name: "Admin", email: "admin@university.edu", role: "admin" }} />} />
      <Route path="/admin/grades" element={<AdminGradeApprovalPage user={{ id: "1", name: "Admin", email: "admin@university.edu", role: "admin" }} />} />
      <Route path="/admin/users" element={<UserManagementPage user={{ id: "1", name: "Admin", email: "admin@university.edu", role: "admin" }} />} />
      <Route path="/admin/settings" element={<CampusSettingsPage user={{ id: "1", name: "Admin", email: "admin@university.edu", role: "admin" }} />} />
      <Route path="/admin/analytics" element={<AnalyticsPage user={{ id: "1", name: "Admin", email: "admin@university.edu", role: "admin" }} />} />
      <Route path="/admin/health" element={<SystemHealthPage user={{ id: "1", name: "Admin", email: "admin@university.edu", role: "admin" }} />} />
      <Route path="/cafeteria" element={<CafeteriaDashboard user={{ id: "1", name: "Cafeteria Manager", email: "cafeteria@university.edu", role: "cafeteria" }} onLogout={handleLogout} />} />
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
