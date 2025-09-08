import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Users, Calendar, BookOpen, Bell, User, LogOut, Clock, CheckCircle, FileText, Plus, Send } from "lucide-react";
import { api } from "../../api";
import { toast } from "sonner";
import { NotificationBell } from "../../components/ui/NotificationBell";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin" | "cafeteria";
};

interface StaffDashboardProps {
  user: User;
}

export function StaffDashboard({ user }: StaffDashboardProps) {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [officeHoursDialogOpen, setOfficeHoursDialogOpen] = useState(false);

  // Form states
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [officeDay, setOfficeDay] = useState("");
  const [officeStartTime, setOfficeStartTime] = useState("");
  const [officeEndTime, setOfficeEndTime] = useState("");

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

  // Handler functions for Quick Actions
  const handleCreateAssignment = () => {
    if (!assignmentTitle || !assignmentDescription || !assignmentDueDate) {
      toast.error("Please fill in all fields");
      return;
    }

    // In a real app, this would make an API call
    toast.success("Assignment created successfully!");
    setAssignmentTitle("");
    setAssignmentDescription("");
    setAssignmentDueDate("");
    setAssignmentDialogOpen(false);
  };

  const handleSendAnnouncement = () => {
    if (!announcementTitle || !announcementMessage) {
      toast.error("Please fill in all fields");
      return;
    }

    // In a real app, this would make an API call
    toast.success("Announcement sent successfully!");
    setAnnouncementTitle("");
    setAnnouncementMessage("");
    setAnnouncementDialogOpen(false);
  };

  const handleScheduleOfficeHours = () => {
    if (!officeDay || !officeStartTime || !officeEndTime) {
      toast.error("Please fill in all fields");
      return;
    }

    // In a real app, this would make an API call
    toast.success("Office hours scheduled successfully!");
    setOfficeDay("");
    setOfficeStartTime("");
    setOfficeEndTime("");
    setOfficeHoursDialogOpen(false);
  };

  const handleViewAttendance = () => {
    navigate('/staff/attendance');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Smart Campus Logo"
                className="w-10 h-10 rounded-lg object-contain bg-white/20 p-1"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Welcome back, {user.name}</h1>
                <p className="text-white/80 text-sm">Staff Dashboard</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-1">
              <NotificationBell userId={user.id} />
            </div>
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
                              {class_.time}
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
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/staff/assignments')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>

                <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-start" variant="outline">
                      <Bell className="w-4 h-4 mr-2" />
                      Send Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Announcement</DialogTitle>
                      <DialogDescription>
                        Send an announcement to your students
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="announcement-title">Title</Label>
                        <Input
                          id="announcement-title"
                          placeholder="Enter announcement title"
                          value={announcementTitle}
                          onChange={(e) => setAnnouncementTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="announcement-message">Message</Label>
                        <Textarea
                          id="announcement-message"
                          placeholder="Enter your announcement"
                          value={announcementMessage}
                          onChange={(e) => setAnnouncementMessage(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleSendAnnouncement} className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send Announcement
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={handleViewAttendance}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Attendance
                </Button>

                <Dialog open={officeHoursDialogOpen} onOpenChange={setOfficeHoursDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Office Hours
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule Office Hours</DialogTitle>
                      <DialogDescription>
                        Set your office hours for student consultations
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="office-day">Day of Week</Label>
                        <Select value={officeDay} onValueChange={setOfficeDay}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-time">Start Time</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={officeStartTime}
                            onChange={(e) => setOfficeStartTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-time">End Time</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={officeEndTime}
                            onChange={(e) => setOfficeEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button onClick={handleScheduleOfficeHours} className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Office Hours
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/staff/grades')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Grade Management
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