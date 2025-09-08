import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { ArrowLeft, Activity, Server, Database, Wifi, Cpu, HardDrive, Zap, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface SystemHealthPageProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "student" | "staff" | "admin" | "cafeteria";
  };
}

export function SystemHealthPage({ user }: SystemHealthPageProps) {
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock system health data
  const systemHealth = {
    overall: {
      status: "healthy",
      uptime: "99.8%",
      responseTime: "45ms",
      lastIncident: "2025-01-15 14:30"
    },
    services: [
      {
        name: "Web Server",
        status: "healthy",
        uptime: "99.9%",
        responseTime: "23ms",
        cpu: 15,
        memory: 45,
        icon: Server
      },
      {
        name: "Database",
        status: "healthy",
        uptime: "99.7%",
        responseTime: "12ms",
        cpu: 8,
        memory: 62,
        icon: Database
      },
      {
        name: "API Gateway",
        status: "healthy",
        uptime: "99.5%",
        responseTime: "34ms",
        cpu: 22,
        memory: 38,
        icon: Wifi
      },
      {
        name: "File Storage",
        status: "warning",
        uptime: "98.2%",
        responseTime: "67ms",
        cpu: 5,
        memory: 28,
        icon: HardDrive
      },
      {
        name: "Email Service",
        status: "healthy",
        uptime: "99.1%",
        responseTime: "89ms",
        cpu: 3,
        memory: 15,
        icon: Zap
      }
    ],
    resources: {
      cpu: { used: 23, total: 100, unit: "%" },
      memory: { used: 4.2, total: 8, unit: "GB" },
      disk: { used: 156, total: 500, unit: "GB" },
      network: { upload: 2.4, download: 15.7, unit: "Mbps" }
    },
    alerts: [
      {
        id: 1,
        type: "warning",
        title: "High Memory Usage",
        message: "File Storage service memory usage above 25%",
        time: "2 hours ago",
        severity: "medium"
      },
      {
        id: 2,
        type: "info",
        title: "Scheduled Maintenance",
        message: "Database optimization completed successfully",
        time: "1 day ago",
        severity: "low"
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return CheckCircle;
      case "warning": return AlertTriangle;
      case "error": return XCircle;
      default: return Activity;
    }
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    toast.success("System health data refreshed");
  };

  const handleRunDiagnostics = () => {
    toast.info("Running system diagnostics...");
    setTimeout(() => {
      toast.success("System diagnostics completed - all services healthy");
    }, 2000);
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
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">System Health</h1>
                  <p className="text-white/80 text-sm">Monitor system performance and services</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleRefresh}
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                size="sm"
                className="bg-white/10 hover:bg-white/20"
                onClick={handleRunDiagnostics}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Run Diagnostics
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* System Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Status</p>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                  <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                  <p className="text-2xl font-bold text-primary">{systemHealth.overall.uptime}</p>
                  <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                </div>
                <Activity className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold text-success">{systemHealth.overall.responseTime}</p>
                  <p className="text-xs text-muted-foreground mt-1">Across all services</p>
                </div>
                <Server className="w-8 h-8 text-success/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-warning">{systemHealth.alerts.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Require attention</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-warning/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Services Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
                <CardDescription>
                  Real-time status of all system services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemHealth.services.map((service, index) => {
                    const StatusIcon = getStatusIcon(service.status);
                    const ServiceIcon = service.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <ServiceIcon className="w-8 h-8 text-primary" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{service.name}</h3>
                              <Badge className={getStatusColor(service.status)}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {service.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Uptime: {service.uptime} | Response: {service.responseTime}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <div>CPU: {service.cpu}%</div>
                            <div>Memory: {service.memory}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>
                  Current resource utilization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-muted-foreground">
                      {systemHealth.resources.cpu.used}{systemHealth.resources.cpu.unit}
                    </span>
                  </div>
                  <Progress value={systemHealth.resources.cpu.used} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-muted-foreground">
                      {systemHealth.resources.memory.used}/{systemHealth.resources.memory.total} {systemHealth.resources.memory.unit}
                    </span>
                  </div>
                  <Progress value={(systemHealth.resources.memory.used / systemHealth.resources.memory.total) * 100} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className="text-sm text-muted-foreground">
                      {systemHealth.resources.disk.used}/{systemHealth.resources.disk.total} {systemHealth.resources.disk.unit}
                    </span>
                  </div>
                  <Progress value={(systemHealth.resources.disk.used / systemHealth.resources.disk.total) * 100} className="h-3" />
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Network I/O</div>
                      <div className="text-muted-foreground">
                        ↑ {systemHealth.resources.network.upload} {systemHealth.resources.network.unit}
                      </div>
                      <div className="text-muted-foreground">
                        ↓ {systemHealth.resources.network.download} {systemHealth.resources.network.unit}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Last Updated</div>
                      <div className="text-muted-foreground">
                        {lastUpdated.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>
                  System notifications and warnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemHealth.alerts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p>No active alerts</p>
                      <p className="text-sm">All systems running smoothly</p>
                    </div>
                  ) : (
                    systemHealth.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border ${
                          alert.type === 'error' ? 'bg-red-50 border-red-200' :
                          alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {alert.type === 'error' && <XCircle className="w-4 h-4 text-red-500 mt-0.5" />}
                          {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                          {alert.type === 'info' && <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />}
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{alert.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
                <CardDescription>
                  System maintenance tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.success("System cache cleared successfully")}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.success("System logs exported")}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.success("Database backup created")}
                >
                  <HardDrive className="w-4 h-4 mr-2" />
                  Backup Database
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.info("System restart initiated")}
                >
                  <Server className="w-4 h-4 mr-2" />
                  Restart Services
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Error Rate</span>
                  <Badge variant="secondary">0.02%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Throughput</span>
                  <Badge variant="secondary">1,247 req/min</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Availability</span>
                  <Badge className="bg-green-500">99.98%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Incident</span>
                  <Badge variant="secondary">{systemHealth.overall.lastIncident}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}