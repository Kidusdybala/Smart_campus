import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { ArrowLeft, Building, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface CampusSettingsPageProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "student" | "staff" | "admin" | "cafeteria";
  };
}

export function CampusSettingsPage({ user }: CampusSettingsPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    campusName: "Smart Campus University",
    address: "123 University Avenue, Academic City",
    phone: "+1 (555) 123-4567",
    email: "admin@university.edu",
    timezone: "africa/nairobi",
    language: "en",
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    maxFileSize: "10",
    sessionTimeout: "60",
    backupFrequency: "daily",
    systemMessage: "",
    termsAndConditions: "",
    privacyPolicy: ""
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      setSettings({
        campusName: "Smart Campus University",
        address: "123 University Avenue, Academic City",
        phone: "+1 (555) 123-4567",
        email: "admin@university.edu",
        timezone: "africa/nairobi",
        language: "en",
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true,
        smsNotifications: false,
        maxFileSize: "10",
        sessionTimeout: "60",
        backupFrequency: "daily",
        systemMessage: "",
        termsAndConditions: "",
        privacyPolicy: ""
      });
      toast.success("Settings reset to default");
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
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Campus Settings</h1>
                  <p className="text-white/80 text-sm">Configure system-wide settings</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleReset}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                className="bg-white/10 hover:bg-white/20"
                onClick={handleSave}
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* General Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Basic campus information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campus-name">Campus Name</Label>
                    <Input
                      id="campus-name"
                      value={settings.campusName}
                      onChange={(e) => setSettings(prev => ({ ...prev, campusName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  Configure system behavior and limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="africa/nairobi">Africa/Nairobi (UTC+3)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="america/new_york">America/New York (UTC-5)</SelectItem>
                        <SelectItem value="europe/london">Europe/London (UTC+0)</SelectItem>
                        <SelectItem value="asia/tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                    <Input
                      id="max-file-size"
                      type="number"
                      value={settings.maxFileSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, backupFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Manage system messages and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="system-message">System Message</Label>
                  <Textarea
                    id="system-message"
                    placeholder="Enter system-wide message (optional)"
                    value={settings.systemMessage}
                    onChange={(e) => setSettings(prev => ({ ...prev, systemMessage: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms and Conditions</Label>
                  <Textarea
                    id="terms"
                    placeholder="Enter terms and conditions"
                    value={settings.termsAndConditions}
                    onChange={(e) => setSettings(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="privacy">Privacy Policy</Label>
                  <Textarea
                    id="privacy"
                    placeholder="Enter privacy policy"
                    value={settings.privacyPolicy}
                    onChange={(e) => setSettings(prev => ({ ...prev, privacyPolicy: e.target.value }))}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>System Controls</CardTitle>
                <CardDescription>
                  Enable or disable system features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable user access
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new user registrations
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowRegistration: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send SMS notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.info("Cache cleared successfully")}
                >
                  Clear System Cache
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.info("Logs exported successfully")}
                >
                  Export System Logs
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.info("Database backup initiated")}
                >
                  Create Database Backup
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.info("System restart initiated")}
                >
                  Restart Services
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Current system health indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">File Storage</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Email Service</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Services</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}