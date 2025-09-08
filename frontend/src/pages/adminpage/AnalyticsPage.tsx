import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ArrowLeft, TrendingUp, Users, Car, UtensilsCrossed, FileText, Calendar, Download } from "lucide-react";
import { toast } from "sonner";

interface AnalyticsPageProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "student" | "staff" | "admin" | "cafeteria";
  };
}

export function AnalyticsPage({ user }: AnalyticsPageProps) {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(false);

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalUsers: 1247,
      activeUsers: 892,
      totalSessions: 3456,
      avgSessionDuration: "24m 32s"
    },
    usage: {
      dailyCheckins: 1247,
      foodOrders: 234,
      parkingReservations: 89,
      gradesSubmitted: 156,
      qrScans: 2156
    },
    trends: {
      userGrowth: 12.5,
      activityIncrease: 8.3,
      satisfactionScore: 4.7
    },
    topFeatures: [
      { name: "QR Check-in", usage: 2156, percentage: 45 },
      { name: "Food Ordering", usage: 234, percentage: 28 },
      { name: "Parking", usage: 89, percentage: 15 },
      { name: "Grade Viewing", usage: 156, percentage: 12 }
    ],
    peakHours: [
      { hour: "8:00", users: 245 },
      { hour: "9:00", users: 312 },
      { hour: "10:00", users: 198 },
      { hour: "11:00", users: 156 },
      { hour: "12:00", users: 289 },
      { hour: "13:00", users: 167 },
      { hour: "14:00", users: 234 }
    ]
  };

  const handleExport = () => {
    toast.success("Analytics report exported successfully");
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
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
                  <p className="text-white/80 text-sm">System usage statistics and insights</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-primary">{analyticsData.overview.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+{analyticsData.trends.userGrowth}% from last month</p>
                </div>
                <Users className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-success">{analyticsData.overview.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">{Math.round((analyticsData.overview.activeUsers / analyticsData.overview.totalUsers) * 100)}% of total</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-3xl font-bold text-accent">{analyticsData.overview.totalSessions.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">Avg: {analyticsData.overview.avgSessionDuration}</p>
                </div>
                <Calendar className="w-8 h-8 text-accent/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                  <p className="text-3xl font-bold text-warning">{analyticsData.trends.satisfactionScore}/5.0</p>
                  <p className="text-xs text-green-600 mt-1">+{analyticsData.trends.activityIncrease}% activity</p>
                </div>
                <TrendingUp className="w-8 h-8 text-warning/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Usage Statistics */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>
                  Most popular system features this {timeRange === "24h" ? "day" : timeRange === "7d" ? "week" : timeRange === "30d" ? "month" : "quarter"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analyticsData.topFeatures.map((feature, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          {feature.name === "QR Check-in" && <Users className="w-4 h-4 text-primary" />}
                          {feature.name === "Food Ordering" && <UtensilsCrossed className="w-4 h-4 text-accent" />}
                          {feature.name === "Parking" && <Car className="w-4 h-4 text-warning" />}
                          {feature.name === "Grade Viewing" && <FileText className="w-4 h-4 text-success" />}
                          <span className="font-medium">{feature.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{feature.usage.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{feature.percentage}%</div>
                        </div>
                      </div>
                      <Progress value={feature.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Peak Usage Hours</CardTitle>
                <CardDescription>
                  User activity throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.peakHours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 text-sm font-medium">{hour.hour}</div>
                        <div className="flex-1">
                          <Progress value={(hour.users / 312) * 100} className="h-2" />
                        </div>
                      </div>
                      <div className="text-sm font-medium w-16 text-right">{hour.users}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Daily Check-ins</span>
                    <Badge className="bg-primary">{analyticsData.usage.dailyCheckins.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Food Orders</span>
                    <Badge className="bg-accent">{analyticsData.usage.foodOrders.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Parking Uses</span>
                    <Badge className="bg-warning">{analyticsData.usage.parkingReservations.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Grades Submitted</span>
                    <Badge className="bg-success">{analyticsData.usage.gradesSubmitted.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">QR Scans</span>
                    <Badge className="bg-secondary">{analyticsData.usage.qrScans.toLocaleString()}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Trends</CardTitle>
                <CardDescription>
                  Month-over-month changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Growth</span>
                    <Badge className="bg-green-500">+{analyticsData.trends.userGrowth}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Activity Increase</span>
                    <Badge className="bg-blue-500">+{analyticsData.trends.activityIncrease}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Satisfaction Score</span>
                    <Badge className="bg-yellow-500">{analyticsData.trends.satisfactionScore}/5.0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>
                  Download analytics data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.success("User activity report exported")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  User Activity Report
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.success("Feature usage report exported")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Feature Usage Report
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.success("Performance metrics exported")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Performance Metrics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}