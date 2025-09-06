import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ArrowLeft, Car, MapPin, Clock, AlertCircle, CheckCircle, ParkingCircle, Navigation, Zap, Shield } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api";

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

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const slots = await api.getParkingSlots();
        setParkingSlots(slots);

        // Check if user already has a reservation
        const userReservedSlot = slots.find(slot =>
          slot.user === user.id && (slot.status === 'reserved' || slot.status === 'occupied')
        );
        setUserReservation(userReservedSlot || null);
      } catch (error) {
        toast.error("Failed to load parking slots");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [user.id]);

  const openReservationDialog = (slotId: string) => {
    // Check if user already has a reservation
    if (userReservation) {
      toast.error("You already have an active reservation", {
        description: `You have reserved spot ${userReservation.slot}. Please cancel it first before reserving a new spot.`
      });
      return;
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
        slot.user === user.id && (slot.status === 'reserved' || slot.status === 'occupied')
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
        {/* Hero Stats */}
        <div className="mb-8">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <ParkingCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-700">
                      {parkingSlots.filter(s => s.status === 'available').length}
                    </div>
                    <div className="text-sm font-medium text-blue-600">Available Spots</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-700">
                      {parkingSlots.filter(s => s.status === 'occupied').length}
                    </div>
                    <div className="text-sm font-medium text-green-600">Occupied</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-700">
                      {parkingSlots.filter(s => s.status === 'reserved').length}
                    </div>
                    <div className="text-sm font-medium text-orange-600">Reserved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-700">
                      {Math.round((parkingSlots.filter(s => s.status === 'available').length / parkingSlots.length) * 100)}%
                    </div>
                    <div className="text-sm font-medium text-purple-600">Availability</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Interactive Parking Map */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Campus Parking Map
              </h2>
              <p className="text-lg text-muted-foreground font-medium">Click on any green available spot to reserve it instantly</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Available spots</span>
                <div className="w-3 h-3 bg-orange-500 rounded-full ml-4"></div>
                <span>Reserved spots</span>
                <div className="w-3 h-3 bg-red-500 rounded-full ml-4"></div>
                <span>Occupied spots</span>
              </div>
            </div>

            {/* Parking Area Visualization */}
            <Card className="shadow-card mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Main Campus Parking Area
                </CardTitle>
                <CardDescription>Real-time parking availability - Click on available spots to reserve</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Parking Lot Background */}
                  <div className="w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-4 border-gray-200 relative overflow-hidden shadow-inner">
                    {/* Road markings */}
                    <div className="absolute inset-x-0 top-1/2 h-1 bg-yellow-400 transform -translate-y-1/2 shadow-sm"></div>
                    <div className="absolute inset-x-0 top-1/2 h-1 bg-yellow-400 transform -translate-y-1/2 shadow-sm" style={{top: 'calc(50% + 8px)'}}></div>

                    {/* Parking spots grid */}
                    <div className="grid grid-cols-6 gap-3 p-6 h-full">
                      {loading ? (
                        <div className="col-span-6 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-lg text-muted-foreground font-medium">Loading parking map...</p>
                          </div>
                        </div>
                      ) : (
                        parkingSlots.slice(0, 24).map((slot, index) => (
                          <div
                            key={slot._id}
                            className={`
                              relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10
                              ${slot.status === 'available'
                                ? (userReservation ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-green-300/50')
                                : slot.status === 'reserved'
                                ? (slot.user === user.id ? 'ring-4 ring-blue-400 shadow-lg' : 'hover:shadow-xl hover:shadow-orange-300/50')
                                : 'hover:shadow-xl hover:shadow-red-300/50'
                              }
                            `}
                            onClick={() => slot.status === 'available' && !userReservation && openReservationDialog(slot.slot)}
                          >
                            {/* Parking spot visualization */}
                            <div className={`
                              w-full h-16 rounded-lg border-3 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden
                              ${slot.status === 'available'
                                ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 hover:from-green-500 hover:to-green-600 shadow-md'
                                : slot.status === 'reserved'
                                ? 'bg-gradient-to-br from-orange-400 to-orange-500 border-orange-600 shadow-md'
                                : 'bg-gradient-to-br from-red-400 to-red-500 border-red-600 shadow-md'
                              }
                            `}>
                              {/* Status indicators */}
                              <div className="absolute top-1 right-1">
                                {slot.status === 'occupied' && (
                                  <Car className="w-4 h-4 text-white drop-shadow-sm" />
                                )}
                                {slot.status === 'reserved' && (
                                  <Clock className="w-4 h-4 text-white drop-shadow-sm" />
                                )}
                                {slot.status === 'available' && (
                                  <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Spot number - prominently displayed */}
                              <div className="text-white font-bold text-sm drop-shadow-lg">
                                {slot.slot}
                              </div>

                              {/* Status text */}
                              <div className="text-white/90 text-xs font-medium drop-shadow-sm capitalize">
                                {slot.status}
                              </div>
                            </div>

                            {/* Enhanced hover tooltip */}
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20 shadow-lg border border-gray-700">
                              <div className="font-medium">
                                {slot.status === 'available'
                                  ? (userReservation ? '⚠️ Cancel current reservation first' : '✅ Click to reserve this spot')
                                  : slot.user === user.id
                                  ? '🔵 Your reservation'
                                  : `🚫 ${slot.status}`
                                }
                              </div>
                              {slot.vehicleDetails && (
                                <div className="text-xs text-gray-300 mt-1">
                                  {slot.vehicleDetails.plateNumber} • {slot.vehicleDetails.carType}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Enhanced Legend */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 border border-green-600 rounded"></div>
                          <span className="font-medium">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-500 border border-orange-600 rounded"></div>
                          <span className="font-medium">Reserved</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-500 border border-red-600 rounded"></div>
                          <span className="font-medium">Occupied</span>
                        </div>
                        {userReservation && (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-400 bg-blue-100 rounded"></div>
                            <span className="font-medium text-blue-600">Your Spot</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group border-2 border-green-200 bg-green-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors shadow-md">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-green-800">Reserve Spot</h3>
                      <p className="text-sm text-green-600">Click on any green spot above</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Navigation className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Find Nearest Spot</h3>
                      <p className="text-sm text-muted-foreground">Get directions to available parking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Vehicle Security</h3>
                      <p className="text-sm text-muted-foreground">Your vehicle details are secured</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Interactive Sidebar */}
          <div className="space-y-6">
            {/* My Active Reservation */}
            {userReservation && (
              <Card className="shadow-card border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Active Reservation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-green-800">Spot {userReservation.slot}</div>
                          <div className="text-sm text-green-600">Main Campus Parking</div>
                        </div>
                      </div>
                      <Badge className="bg-green-500 hover:bg-green-600 capitalize">
                        {userReservation.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-green-700 mb-3">
                      Reserved at: {userReservation.reservedAt ? new Date(userReservation.reservedAt).toLocaleString() : 'Date not available'}
                    </div>
                    {userReservation.vehicleDetails && (
                      <div className="text-sm text-green-700 mb-3">
                        <div><strong>Plate:</strong> {userReservation.vehicleDetails.plateNumber}</div>
                        <div><strong>Vehicle:</strong> {userReservation.vehicleDetails.carType} {userReservation.vehicleDetails.carModel}</div>
                        {userReservation.vehicleDetails.color && <div><strong>Color:</strong> {userReservation.vehicleDetails.color}</div>}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-50">
                        Extend Time
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                        onClick={async () => {
                          try {
                            // Cancel reservation by setting status back to available
                            const response = await fetch(`http://localhost:5001/api/parking/cancel/${userReservation.slot}`, {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json'
                              }
                            });

                            if (response.ok) {
                              toast.success("Reservation cancelled");
                              // Refresh data
                              const slots = await api.getParkingSlots();
                              setParkingSlots(slots);
                              setUserReservation(null);
                            } else {
                              toast.error("Failed to cancel reservation");
                            }
                          } catch (error) {
                            toast.error("Failed to cancel reservation");
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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

      {/* Reservation Dialog */}
      <Dialog open={reservationDialog.open} onOpenChange={(open) => setReservationDialog({ open, slotId: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reserve Parking Spot {reservationDialog.slotId}</DialogTitle>
            <DialogDescription>
              Please provide your vehicle details for security and verification purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Plate Number *</Label>
                <Input
                  id="plateNumber"
                  placeholder="ABC-123"
                  value={vehicleDetails.plateNumber}
                  onChange={(e) => setVehicleDetails(prev => ({ ...prev, plateNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carType">Car Type *</Label>
                <Select value={vehicleDetails.carType} onValueChange={(value) => setVehicleDetails(prev => ({ ...prev, carType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
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
                  value={vehicleDetails.carModel}
                  onChange={(e) => setVehicleDetails(prev => ({ ...prev, carModel: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  placeholder="White"
                  value={vehicleDetails.color}
                  onChange={(e) => setVehicleDetails(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setReservationDialog({ open: false, slotId: null });
                  setVehicleDetails({ plateNumber: '', carType: '', carModel: '', color: '' });
                }}
              >
                Cancel
              </Button>
              <Button onClick={reserveSpot} disabled={!vehicleDetails.plateNumber || !vehicleDetails.carType}>
                Reserve Spot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}