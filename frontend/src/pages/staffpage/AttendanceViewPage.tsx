import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { api } from "../../api";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
};

interface AttendanceViewPageProps {
  user: User;
}

export function AttendanceViewPage({ user }: AttendanceViewPageProps) {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // In a real app, this would fetch actual attendance data from the backend
        // For now, we'll check if there's any saved attendance data
        const savedAttendance = localStorage.getItem('staff_attendance');
        if (savedAttendance) {
          setAttendanceData(JSON.parse(savedAttendance));
        } else {
          // Show empty state if no data exists
          setAttendanceData([]);
        }
      } catch (error) {
        toast.error("Failed to load attendance data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-500";
      case "absent": return "bg-red-500";
      case "late": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle className="w-4 h-4" />;
      case "absent": return <XCircle className="w-4 h-4" />;
      case "late": return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

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
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Attendance View</h1>
                  <p className="text-white/80 text-sm">Monitor student attendance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-3xl font-bold text-primary">{attendanceData.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Present Today</p>
                    <p className="text-3xl font-bold text-success">
                      {attendanceData.filter(a => a.status === 'present').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-success/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Absent Today</p>
                    <p className="text-3xl font-bold text-destructive">
                      {attendanceData.filter(a => a.status === 'absent').length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-destructive/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    <p className="text-3xl font-bold text-accent">
                      {attendanceData.length > 0
                        ? Math.round((attendanceData.filter(a => a.status === 'present').length / attendanceData.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Attendance</CardTitle>
                  <CardDescription>Student attendance records for today</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading attendance data...</div>
              ) : attendanceData.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No attendance records yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Attendance data will appear here once students start checking in to your classes
                  </p>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    View Class Schedule
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendanceData.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-medium">{record.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{record.studentEmail}</p>
                          <p className="text-sm text-muted-foreground">{record.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(record.status)} text-white mb-2`}>
                          {getStatusIcon(record.status)}
                          <span className="ml-1 capitalize">{record.status}</span>
                        </Badge>
                        <p className="text-sm text-muted-foreground">{record.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}