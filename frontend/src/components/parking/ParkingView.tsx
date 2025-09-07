import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ArrowLeft, Car, MapPin, Clock, AlertCircle, CheckCircle, ParkingCircle, Navigation, Zap, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api';
import { ParkingStats } from "./ParkingStats";
import { ParkingMap } from "./ParkingMap";
import { ActiveReservation } from "./ActiveReservation";
import { ReservationDialog } from "./ReservationDialog";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
};

interface ParkingViewProps {
  onBack: () => void;
  user: User;
}

// Static for now - will be replaced with API
const parkingAreas = [];


export function ParkingView({ onBack, user }: ParkingViewProps) {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReservation, setUserReservation] = useState(null);
  const [reservationDialog, setReservationDialog] = useState({ open: false, slotId: null });
  const [vehicleDetails, setVehicleDetails] = useState({
    plateNumber: '',
    carType: '',
    carModel: '',
    color: ''
  });

  const [userVehicleInfo, setUserVehicleInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slots = await api.getParkingSlots();
        setParkingSlots(slots);

        // Check if user already has a reservation
        const userReservedSlot = slots.find(slot =>
          (slot.user === user.id || slot.vehicleDetails) && (slot.status === 'reserved' || slot.status === 'occupied')
        );
        setUserReservation(userReservedSlot || null);

        // Load user's vehicle data
        const profileResponse = await api.getProfile();
        if (profileResponse.user && profileResponse.user.vehicle) {
          setUserVehicleInfo(profileResponse.user.vehicle);
          setVehicleDetails(profileResponse.user.vehicle);
        }
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const openReservationDialog = (slotId: string) => {
    // Check if user already has a reservation
    if (userReservation) {
      toast.error("You already have an active reservation", {
        description: `You have reserved spot ${userReservation.slot}. Please cancel it first before reserving a new spot.`
      });
      return;
    }

    // Check if user has vehicle information
    if (!userVehicleInfo) {
      toast.error("Vehicle information required", {
        description: "Please add your vehicle details to your profile before reserving a parking spot.",
        action: {
          label: "Go to Profile",
          onClick: () => window.location.href = '/student/profile/vehicle'
        }
      });
      return;
    }

    // Ensure vehicle details are loaded from profile
    if (userVehicleInfo) {
      setVehicleDetails(userVehicleInfo);
    }

    setReservationDialog({ open: true, slotId });
  };

  const reserveSpot = async () => {
    const { slotId } = reservationDialog;

    // Validate vehicle details
    if (!vehicleDetails.plateNumber || !vehicleDetails.carType) {
      toast.error("Missing vehicle information", {
        description: "Please fill in all required fields."
      });
      return;
    }

    try {
      await api.reserveSlot(slotId, vehicleDetails);
      toast.success("Spot reserved successfully", {
        description: "Your vehicle details have been recorded for security."
      });

      // Reset form and close dialog
      setVehicleDetails({ plateNumber: '', carType: '', carModel: '', color: '' });
      setReservationDialog({ open: false, slotId: null });

      // Refresh slots and user reservation
      const slots = await api.getParkingSlots();
      setParkingSlots(slots);

      const newUserReservation = slots.find(slot =>
        (slot.user === user.id || slot.vehicleDetails?.plateNumber === vehicleDetails.plateNumber) &&
        (slot.status === 'reserved' || slot.status === 'occupied')
      );
      setUserReservation(newUserReservation || null);
    } catch (error) {
      if (error.message && error.message.includes('already have an active parking reservation')) {
        toast.error("Active reservation exists", {
          description: "Please cancel your current reservation before reserving a new spot."
        });
        // Refresh to get updated reservation status
        const slots = await api.getParkingSlots();
        setParkingSlots(slots);
        const existingReservation = slots.find(slot =>
          slot.user === user.id && (slot.status === 'reserved' || slot.status === 'occupied')
        );
        setUserReservation(existingReservation || null);
      } else {
        toast.error(error.message || "Failed to reserve spot");
      }
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Parking Management</h1>
                <p className="text-white/80 text-sm">Find and reserve parking spots</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Vehicle Info Notice */}
        {!userVehicleInfo && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-amber-800 mb-1">Complete Your Vehicle Information</h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Add your vehicle details to your profile to reserve parking spots and ensure security.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => window.location.href = '/student/profile/vehicle'}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Update Vehicle Info
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <ParkingStats parkingSlots={parkingSlots} />

        <div className="grid lg:grid-cols-3 gap-8">
          <ParkingMap
            parkingSlots={parkingSlots}
            loading={loading}
            userReservation={userReservation}
            onReservationClick={openReservationDialog}
          />

          <div className="space-y-6">
            <ActiveReservation
              userReservation={userReservation}
              onEndParking={async () => {
                try {
                  const response = await fetch(`${API_BASE}/parking/end/${userReservation.slot}`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json'
                    }
                  });

                  const data = await response.json();

                  if (response.ok) {
                    toast.success(`Parking ended. Cost: ${data.cost} ETB`);
                    const slots = await api.getParkingSlots();
                    setParkingSlots(slots);
                    setUserReservation(null);
                  } else {
                    toast.error(data.error || "Failed to end parking");
                  }
                } catch (error) {
                  toast.error("Failed to end parking");
                }
              }}
            />

            {/* Real-time Activity Feed */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Live Activity
                </CardTitle>
                <CardDescription>Real-time parking updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-blue-800">Spot A-12 Reserved</div>
                      <div className="text-xs text-blue-600">2 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-800">Spot B-05 Vacated</div>
                      <div className="text-xs text-green-600">5 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-orange-800">Peak Hours Alert</div>
                      <div className="text-xs text-orange-600">High demand expected</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parking Tips */}
            <Card className="shadow-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Shield className="w-5 h-5" />
                  Parking Tips
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
                      <div className="text-xs text-blue-600">Best spots fill up between 8-9 AM</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">2</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-800">Use Mobile App</div>
                      <div className="text-xs text-blue-600">Reserve spots from your phone</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-800">Check Live Map</div>
                      <div className="text-xs text-blue-600">See real-time availability</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats with Progress Bars */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Today's Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Occupancy Rate</span>
                    <span className="font-medium">
                      {parkingSlots.length > 0 ?
                        Math.round((parkingSlots.filter(s => s.status !== 'available').length / parkingSlots.length) * 100) : 0
                      }%
                    </span>
                  </div>
                  <Progress
                    value={parkingSlots.length > 0 ?
                      (parkingSlots.filter(s => s.status !== 'available').length / parkingSlots.length) * 100 : 0
                    }
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Peak Hours</span>
                    <span className="font-medium">8AM - 11AM</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Current time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {parkingSlots.filter(s => s.status === 'available').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Spots Available Now</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ReservationDialog
        open={reservationDialog.open}
        onOpenChange={(open) => setReservationDialog({ open, slotId: null })}
        slotId={reservationDialog.slotId}
        vehicleDetails={vehicleDetails}
        onVehicleDetailsChange={setVehicleDetails}
        onReserve={reserveSpot}
        userVehicleInfo={userVehicleInfo}
      />
    </div>
  );
}