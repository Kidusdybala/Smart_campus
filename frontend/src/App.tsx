import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { StudentDashboard } from "./pages/StudentDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { QRScannerPage } from "./pages/QRScannerPage";
import { FoodOrderingPage } from "./pages/FoodOrderingPage";
import { ParkingPage } from "./pages/ParkingPage";
import { AttendancePage } from "./pages/AttendancePage";
import { ProfilePage } from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/student" element={<StudentDashboard user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
          <Route path="/student/qr" element={<QRScannerPage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
          <Route path="/student/food" element={<FoodOrderingPage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
          <Route path="/student/parking" element={<ParkingPage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
          <Route path="/student/attendance" element={<AttendancePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
          <Route path="/profile" element={<ProfilePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
          <Route path="/profile/vehicle" element={<ProfilePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
          <Route path="/profile/wallet" element={<ProfilePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
          <Route path="/profile/security" element={<ProfilePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
          <Route path="/student/profile" element={<ProfilePage user={{ id: "1", name: "Student", email: "student@university.edu", role: "student" }} />} />
          <Route path="/staff/profile" element={<ProfilePage user={{ id: "2", name: "Staff", email: "staff@university.edu", role: "staff" }} />} />
          <Route path="/admin/profile" element={<ProfilePage user={{ id: "3", name: "Admin", email: "admin@university.edu", role: "admin" }} />} />
          <Route path="/staff" element={<StaffDashboard user={{ id: "1", name: "Staff", email: "staff@university.edu", role: "staff" }} />} />
          <Route path="/admin" element={<AdminDashboard user={{ id: "1", name: "Admin", email: "admin@university.edu", role: "admin" }} />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
