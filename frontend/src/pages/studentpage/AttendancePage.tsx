import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ArrowLeft, TrendingUp, Calendar, Clock } from "lucide-react";
import { api } from "../../api";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin" | "cafeteria";
};

interface AttendancePageProps {
  user: User;
}

export function AttendancePage({ user }: AttendancePageProps) {
  const [attendanceData, setAttendanceData] = useState({ present: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await api.getAttendanceStats();
        setAttendanceData(data);
      } catch (error) {
        toast.error("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Smart Campus Logo"
                className="w-10 h-10 rounded-lg object-contain bg-white/20 p-1"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Attendance Overview</h1>
                <p className="text-white/80 text-sm">Track your academic attendance</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading attendance data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Attendance */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Semester Attendance
                </CardTitle>
                <CardDescription>Your attendance record for this semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-primary mb-2">{attendanceData.percentage}%</div>
                  <div className="text-lg text-muted-foreground">
                    {attendanceData.present} of {attendanceData.total} classes attended
                  </div>
                </div>
                <Progress value={attendanceData.percentage} className="h-3 mb-4" />
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Present: {attendanceData.present}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Absent: {attendanceData.total - attendanceData.present}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Status */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Attendance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-2xl font-bold text-green-700 mb-1">
                      {attendanceData.percentage >= 75 ? "✓" : "✗"}
                    </div>
                    <div className="text-sm text-green-600">Minimum Requirement (75%)</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700 mb-1">
                      {Math.round(attendanceData.percentage)}
                    </div>
                    <div className="text-sm text-blue-600">Current Percentage</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700 mb-1">
                      {attendanceData.total - attendanceData.present}
                    </div>
                    <div className="text-sm text-purple-600">Classes Missed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="shadow-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <TrendingUp className="w-5 h-5" />
                  Attendance Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">1</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-800">Arrive Early</div>
                      <div className="text-xs text-blue-600">Check in using QR scanner before class starts</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">2</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-800">Regular Check-ins</div>
                      <div className="text-xs text-blue-600">Maintain consistent attendance throughout the semester</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-800">Monitor Progress</div>
                      <div className="text-xs text-blue-600">Keep track of your attendance percentage regularly</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}