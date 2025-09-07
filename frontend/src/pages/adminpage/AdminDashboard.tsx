import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  Shield,
  Users,
  Building,
  Car,
  UtensilsCrossed,
  TrendingUp,
  AlertTriangle,
  User,
  LogOut,
  Activity,
  BarChart3,
  FileText
} from "lucide-react";
import { api } from "../../api";
import { toast } from "sonner";
import { NotificationBell } from "../../components/ui/NotificationBell";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
};

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await api.getAdminDashboard();
        setDashboardData(data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Welcome back, {user.name}</h1>
                <p className="text-white/80 text-sm">Admin Console</p>
              </div>
            </div>
            <NotificationBell userId={user.id} />
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => {
                api.clearToken();
                navigate("/");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* System Overview */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          {loading ? (
            <>
              {[1, 2, 3, 4, 5].map(i => (
                <Card key={i} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : dashboardData ? (
            <>
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold text-primary">{dashboardData.totalUsers.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Now</p>
                      <p className="text-2xl font-bold text-success">{dashboardData.activeUsers.toLocaleString()}</p>
                    </div>
                    <Activity className="w-8 h-8 text-success/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Parking Full</p>
                      <p className="text-2xl font-bold text-warning">{dashboardData.parkingOccupancy}%</p>
                    </div>
                    <Car className="w-8 h-8 text-warning/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Food Orders</p>
                      <p className="text-2xl font-bold text-accent">{dashboardData.cafeteriaOrders}</p>
                    </div>
                    <UtensilsCrossed className="w-8 h-8 text-accent/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">System Uptime</p>
                      <p className="text-2xl font-bold text-success">{dashboardData.systemUptime}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success/60" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Building Occupancy */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Building Occupancy
                </CardTitle>
                <CardDescription>Real-time occupancy across campus buildings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {dashboardData?.buildingOccupancy?.length > 0 ? (
                    dashboardData.buildingOccupancy.map((building, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{building.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {building.current}/{building.capacity}
                          </span>
                        </div>
                        <Progress value={building.percentage} className="h-3" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{building.percentage}% occupied</span>
                          <span>{building.capacity - building.current} available</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Loading building occupancy data...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Admin Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/admin/users')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/admin/grades')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Grade Approval
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/admin/settings')}
                >
                  <Building className="w-4 h-4 mr-2" />
                  Campus Settings
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to clear ALL parking reservations? This action cannot be undone.')) {
                      try {
                        const result = await api.clearAllReservations();
                        toast.success(`Cleared ${result.modifiedCount} reservations`);
                        // Refresh dashboard data
                        const data = await api.getAdminDashboard();
                        setDashboardData(data);
                      } catch (error) {
                        toast.error('Failed to clear reservations');
                      }
                    }
                  }}
                >
                  <Car className="w-4 h-4 mr-2" />
                  Clear All Parking Reservations
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/admin/analytics')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/admin/health')}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  System Health
                </Button>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Recent system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.recentAlerts?.length > 0 ? (
                    dashboardData.recentAlerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          alert.type === 'error' ? 'bg-destructive/10' :
                          alert.type === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
                        }`}
                      >
                        <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                          alert.type === 'error' ? 'text-destructive' :
                          alert.type === 'warning' ? 'text-warning' : 'text-primary'
                        }`} />
                        <div className="text-sm">
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-muted-foreground">{alert.time}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No recent alerts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Today's Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Check-ins</span>
                  <Badge className="bg-success">1,247</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Food Orders</span>
                  <Badge className="bg-accent">234</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Parking Reservations</span>
                  <Badge className="bg-warning">89</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">System Incidents</span>
                  <Badge variant="secondary">2</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}