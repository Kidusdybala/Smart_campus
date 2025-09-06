import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Users, Calendar, BookOpen, Bell, User, LogOut, Clock, CheckCircle } from "lucide-react";
import { api } from "../api";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
};

interface StaffDashboardProps {
  user: User;
}

export function StaffDashboard({ user }: StaffDashboardProps) {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await api.getStaffDashboard();
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
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Welcome back, {user.name}</h1>
                <p className="text-white/80 text-sm">Staff Dashboard</p>
              </div>
            </div>
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
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
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
                      <p className="text-sm text-muted-foreground">Today's Classes</p>
                      <p className="text-3xl font-bold text-primary">{dashboardData.todayClasses}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-3xl font-bold text-success">{dashboardData.totalStudents}</p>
                    </div>
                    <Users className="w-8 h-8 text-success/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Attendance</p>
                      <p className="text-3xl font-bold text-accent">{dashboardData.avgAttendance}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-accent/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Tasks</p>
                      <p className="text-3xl font-bold text-warning">7</p>
                    </div>
                    <Bell className="w-8 h-8 text-warning/60" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Today's Classes</CardTitle>
                <CardDescription>Monday, March 6, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.classes?.length > 0 ? (
                    dashboardData.classes.map((class_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-16">
                            <div className="text-sm font-medium">
                              {new Date(class_.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium">{class_.subject}</h4>
                            <p className="text-sm text-muted-foreground">
                              {class_.classroom} • {class_.students?.length || 0} students enrolled
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Scheduled
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No classes scheduled for today
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="w-4 h-4 mr-2" />
                  Send Announcement
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  View Attendance
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Office Hours
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.recentActivity?.length > 0 ? (
                    dashboardData.recentActivity.map((activity, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{activity.message}</div>
                        <div className="text-muted-foreground">{activity.time}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Grade Midterm Exams</span>
                  <Badge variant="destructive">2 days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Submit Course Syllabus</span>
                  <Badge className="bg-warning">5 days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Faculty Meeting</span>
                  <Badge variant="secondary">1 week</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}