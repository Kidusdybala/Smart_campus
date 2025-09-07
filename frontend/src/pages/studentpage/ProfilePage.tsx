import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ArrowLeft, User, Car, Lock, Wallet } from "lucide-react";
import { api } from "../../api";
import { toast } from "sonner";
import { ProfileTab } from "../../components/profile/ProfileTab";
import { VehicleTab } from "../../components/profile/VehicleTab";
import { SecurityTab } from "../../components/profile/SecurityTab";
import { WalletTab } from "../../components/profile/WalletTab";

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
            <ProfileTab
              profileData={profileData}
              onProfileDataChange={setProfileData}
              onUpdate={handleProfileUpdate}
              loading={loading}
            />
          </TabsContent>

          {/* Vehicle Tab */}
          <TabsContent value="vehicle" className="space-y-6">
            <VehicleTab
              vehicleData={vehicleData}
              onVehicleDataChange={setVehicleData}
              onUpdate={handleVehicleUpdate}
              loading={loading}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecurityTab
              passwordData={passwordData}
              onPasswordDataChange={setPasswordData}
              onPasswordChange={handlePasswordChange}
              loading={loading}
            />
          </TabsContent>

          {/* Wallet Tab - Only for students and staff */}
          {user.role !== 'admin' && (
            <TabsContent value="wallet" className="space-y-6">
              <WalletTab
                walletData={walletData}
                onWalletDataChange={setWalletData}
                onTopup={handleWalletTopup}
                loading={loading}
                paymentHistory={paymentHistory}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}