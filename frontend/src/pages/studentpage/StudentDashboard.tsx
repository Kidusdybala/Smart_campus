import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  QrCode,
  UtensilsCrossed,
  Car,
  Calendar,
  Clock,
  MapPin,
  User,
  LogOut,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Wallet,
  GraduationCap
} from "lucide-react";
import { api } from "../../api";
import { toast } from "sonner";
import { NotificationBell } from "../../components/ui/NotificationBell";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin" | "cafeteria";
};

interface StudentDashboardProps {
  user: User;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState({ present: 0, total: 0, percentage: 0 });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [campusStatus, setCampusStatus] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Function to refresh wallet balance
  const refreshWalletBalance = async () => {
    if (user.role !== 'admin') {
      try {
        const walletResult = await api.getWalletBalance();
        setWalletBalance(walletResult.balance || 0);
      } catch (err) {
        console.error('Wallet balance refresh error:', err);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make sure user object is valid before proceeding
        if (!user || !user.id) {
          console.error('Invalid user object:', user);
          toast.error("User information is missing");
          setLoading(false);
          return;
        }

        // Use Promise.allSettled to handle partial failures
        const promiseResults = await Promise.allSettled([
          api.getAttendanceStats().catch(err => {
            console.error('Attendance stats error:', err);
            return { present: 0, total: 0, percentage: 0 };
          }),
          api.getTodaySchedule().catch(err => {
            console.error('Schedule error:', err);
            return [];
          }),
          api.getOrders().catch(err => {
            console.error('Orders error:', err);
            return [];
          }),
          api.getCampusStatus().catch(err => {
            console.error('Campus status error:', err);
            return null;
          })
        ]);

        // Handle wallet balance separately for non-admin users
        let walletResult = null;
        if (user.role !== 'admin') {
          try {
            walletResult = await api.getWalletBalance();
          } catch (err) {
            console.error('Wallet balance error:', err);
          }
        }

        // Extract results from Promise.allSettled
        const [attendanceResult, scheduleResult, ordersResult, statusResult] = promiseResults;

        // Update state with successful results
        if (attendanceResult.status === 'fulfilled') {
          setAttendanceData(attendanceResult.value);
        }

        if (scheduleResult.status === 'fulfilled') {
          setTodaySchedule(scheduleResult.value);
        }

        if (ordersResult.status === 'fulfilled') {
          setRecentOrders(ordersResult.value.slice(0, 2)); // Get recent 2 orders
        }

        if (statusResult.status === 'fulfilled') {
          setCampusStatus(statusResult.value);
        }

        // Set wallet balance only for non-admin users
        if (user.role !== 'admin' && walletResult) {
          setWalletBalance(walletResult.balance || 0);
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
        console.error('Dashboard data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh wallet balance every 30 seconds for non-admin users
    let walletRefreshInterval;
    if (user.role !== 'admin') {
      walletRefreshInterval = setInterval(refreshWalletBalance, 30000);
    }

    // Refresh wallet balance when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden && user.role !== 'admin') {
        refreshWalletBalance();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (walletRefreshInterval) {
        clearInterval(walletRefreshInterval);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user.role]);
  


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Welcome back, {user.name}</h1>
                <p className="text-white/80 text-sm">Student Portal</p>
              </div>
            </div>
            <NotificationBell userId={user.id} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be redirected to the login page and will need to sign in again to access your dashboard.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      api.clearToken();
                      navigate("/");
                    }}
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-6 gap-6 mb-8">
          <Card
            className="shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group"
            onClick={() => navigate("/student/qr")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">QR Scanner</h3>
              <p className="text-sm text-muted-foreground">Check into campus & classes</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group"
            onClick={() => navigate("/student/food")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                <UtensilsCrossed className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-1">Food Ordering</h3>
              <p className="text-sm text-muted-foreground">Order meals & track pickup</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group"
            onClick={() => navigate("/student/parking")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-warning/20 transition-colors">
                <Car className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-1">Parking</h3>
              <p className="text-sm text-muted-foreground">Find & reserve parking spots</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group"
            onClick={() => navigate("/student/attendance")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-success/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-1">Attendance</h3>
              <p className="text-sm text-muted-foreground">{attendanceData.percentage}% this semester</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group"
            onClick={() => navigate("/student/grades")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue/20 transition-colors">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Grades</h3>
              <p className="text-sm text-muted-foreground">View your academic results</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group"
            onClick={() => navigate("/student/profile")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple/20 transition-colors">
                <User className="w-6 h-6 text-purple" />
              </div>
              <h3 className="font-semibold mb-1">Profile</h3>
              <p className="text-sm text-muted-foreground">Manage your account</p>
            </CardContent>
          </Card>

          {/* Only show wallet for students and staff */}
          {user.role !== 'admin' && (
            <Card
              className="shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group"
              onClick={() => navigate("/student/profile")}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green/20 transition-colors">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Wallet</h3>
                <p className="text-sm text-muted-foreground">{walletBalance.toFixed(2)} ETB</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Monday, March 6, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaySchedule.map((class_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-16">
                          <div className="text-sm font-medium">{class_.time}</div>
                        </div>
                        <div>
                          <h4 className="font-medium">{class_.subject}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {class_.classroom}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Upcoming
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attendance Overview */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary">{attendanceData.percentage}%</div>
                  <div className="text-sm text-muted-foreground">
                    {attendanceData.present} of {attendanceData.total} classes
                  </div>
                </div>
                <Progress value={attendanceData.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Present: {attendanceData.present}</span>
                  <span>Absent: {attendanceData.total - attendanceData.present}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Food Orders */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium">
                          {order.items.map(item => item.quantity + 'x ' + item.food.name).join(', ')}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(order.orderedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge
                        variant={order.status === "ready" ? "default" : "secondary"}
                        className={order.status === "ready" ? "bg-success animate-pulse-glow" : "bg-warning"}
                      >
                        {order.status === "ready" ? "Ready!" : order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Campus Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {campusStatus ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Library Occupancy</span>
                      <Badge variant="secondary">{campusStatus.libraryOccupancy}% Full</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cafeteria Queue</span>
                      <Badge className="bg-success">{campusStatus.cafeteriaQueue} min wait</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Parking Available</span>
                      <Badge className="bg-warning">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {campusStatus.parkingAvailable} spots
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground text-sm">
                    Loading campus status...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}