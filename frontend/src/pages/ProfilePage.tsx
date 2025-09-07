import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ArrowLeft, User, Car, Lock, Edit, Save, Eye, EyeOff, Wallet, CreditCard, History, Plus } from "lucide-react";
import { api } from "../api";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
  qrCode?: string;
};

interface ProfilePageProps {
  user: User;
}

export function ProfilePage({ user }: ProfilePageProps) {
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    qrCode: user.qrCode || ''
  });

  const [vehicleData, setVehicleData] = useState({
    plateNumber: '',
    carType: '',
    carModel: '',
    color: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [walletData, setWalletData] = useState({
    balance: 0,
    topupAmount: ''
  });

  const [paymentHistory, setPaymentHistory] = useState([]);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    // Check URL path for tab selection
    const path = window.location.pathname;
    if (path.includes('/profile/vehicle')) {
      setActiveTab('vehicle');
    } else if (path.includes('/profile/wallet')) {
      setActiveTab('wallet');
    } else if (path.includes('/profile/security')) {
      setActiveTab('security');
    } else {
      setActiveTab('profile');
    }

    // Check URL parameters for tab selection (fallback)
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const paymentId = urlParams.get('paymentId');
    if (tabParam === 'wallet') {
      setActiveTab('wallet');
    }
    if (paymentId) {
      // Complete the payment
      api.completePayment(paymentId).then(() => {
        // Reload data
        loadUserData();
      }).catch((error) => {
        console.error('Failed to complete payment:', error);
      });
    }
    // Clean up URL
    window.history.replaceState({}, '', window.location.pathname);

    // Load user's vehicle data and wallet information
    const loadUserData = async () => {
      try {
        // Load wallet balance
        const walletResponse = await api.getWalletBalance();
        setWalletData(prev => ({ ...prev, balance: walletResponse.balance }));

        // Load payment history
        const historyResponse = await api.getPaymentHistory();
        setPaymentHistory(historyResponse);

        // Load profile data including vehicle
        const profileResponse = await api.getProfile();
        if (profileResponse.user.vehicle) {
          setVehicleData(profileResponse.user.vehicle);
        } else {
          setVehicleData({
            plateNumber: '',
            carType: '',
            carModel: '',
            color: ''
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Initialize with empty vehicle data on error
        setVehicleData({
          plateNumber: '',
          carType: '',
          carModel: '',
          color: ''
        });
      }
    };

    loadUserData();
  }, [user.id]);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      // Add API call to update profile
      await api.updateProfile(profileData);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleUpdate = async () => {
    if (!vehicleData.plateNumber || !vehicleData.carType) {
      toast.error("Plate number and car type are required");
      return;
    }

    setLoading(true);
    try {
      // Add API call to update vehicle information
      await api.updateVehicle(vehicleData);
      toast.success("Vehicle information updated successfully");
    } catch (error) {
      toast.error("Failed to update vehicle information");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletTopup = async () => {
    const amount = parseFloat(walletData.topupAmount);
    if (!amount || amount < 10) {
      toast.error("Minimum top-up amount is 10 ETB");
      return;
    }

    setLoading(true);
    try {
      const response = await api.topupWallet(amount);

      if (response.checkoutUrl) {
        // Redirect to Chapa checkout page
        toast.success("Redirecting to Chapa payment...");
        window.location.replace(response.checkoutUrl);
      } else {
        // Fallback for testing - complete payment immediately
        toast.success("Redirecting to payment...");
        await api.completePayment(response.paymentId);
        toast.success("Wallet topped up successfully!");
        setWalletData(prev => ({ ...prev, balance: prev.balance + amount, topupAmount: '' }));

        // Refresh payment history
        const historyResponse = await api.getPaymentHistory();
        setPaymentHistory(historyResponse);
      }
    } catch (error) {
      toast.error("Failed to top up wallet");
    } finally {
      setLoading(false);
    }
  };

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
              onClick={() => window.location.href = '/student'}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Profile Management</h1>
                <p className="text-white/80 text-sm">Manage your account and vehicle information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${user.role !== 'admin' ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Vehicle
            </TabsTrigger>
            {user.role !== 'admin' && (
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Wallet
              </TabsTrigger>
            )}
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>


                {profileData.qrCode && (
                  <div className="space-y-2">
                    <Label>QR Code</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <span className="font-mono text-sm">{profileData.qrCode}</span>
                    </div>
                  </div>
                )}

                <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicle Tab */}
          <TabsContent value="vehicle" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>Manage your vehicle details for parking reservations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plateNumber">License Plate Number *</Label>
                    <Input
                      id="plateNumber"
                      placeholder="ABC-123"
                      value={vehicleData.plateNumber}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, plateNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carType">Car Type *</Label>
                    <Select value={vehicleData.carType} onValueChange={(value) => setVehicleData(prev => ({ ...prev, carType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select car type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="hatchback">Hatchback</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carModel">Car Model</Label>
                    <Input
                      id="carModel"
                      placeholder="Toyota Camry"
                      value={vehicleData.carModel}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, carModel: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      placeholder="White"
                      value={vehicleData.color}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={handleVehicleUpdate} disabled={loading} className="w-full">
                  <Car className="w-4 h-4 mr-2" />
                  {loading ? "Updating..." : "Update Vehicle Info"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button onClick={handlePasswordChange} disabled={loading} className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  {loading ? "Changing..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab - Only for students and staff */}
          {user.role !== 'admin' && (
            <TabsContent value="wallet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Balance</CardTitle>
                <CardDescription>Manage your campus wallet and view transaction history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Balance */}
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {walletData.balance.toFixed(2)} ETB
                  </div>
                  <div className="text-lg text-green-700 font-medium">Current Balance</div>
                </div>

                {/* Top-up Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Top Up Wallet
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="topupAmount">Amount (ETB)</Label>
                      <Input
                        id="topupAmount"
                        type="number"
                        placeholder="Enter amount"
                        value={walletData.topupAmount}
                        onChange={(e) => setWalletData(prev => ({ ...prev, topupAmount: e.target.value }))}
                        min="10"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleWalletTopup} disabled={loading} className="w-full">
                        <CreditCard className="w-4 h-4 mr-2" />
                        {loading ? "Processing..." : "Top Up"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Minimum top-up amount: 10 ETB</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>Your recent wallet transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentHistory.length > 0 ? (
                    paymentHistory.map((payment) => (
                      <div key={payment._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{payment.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${payment.type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
                            {payment.type === 'topup' ? '+' : '-'}{payment.amount} ETB
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">{payment.status}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No transactions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}