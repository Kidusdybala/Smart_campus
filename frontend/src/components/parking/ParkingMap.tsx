import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MapPin, Car, Clock, CheckCircle } from "lucide-react";

interface ParkingSlot {
  _id: string;
  slot: string;
  status: 'available' | 'reserved' | 'occupied';
  user?: string;
  vehicleDetails?: {
    plateNumber: string;
    carType: string;
    carModel: string;
    color: string;
  };
  reservedAt?: string;
}

interface ParkingMapProps {
  parkingSlots: ParkingSlot[];
  loading: boolean;
  userReservation: ParkingSlot | null;
  onReservationClick: (slotId: string) => void;
}

export function ParkingMap({ parkingSlots, loading, userReservation, onReservationClick }: ParkingMapProps) {
  return (
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

      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Main Campus Parking Area
          </CardTitle>
          <CardDescription className="mb-4">
            Real-time parking availability - Click on available spots to reserve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="w-full h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-4 border-gray-200 relative overflow-hidden shadow-inner">
              <div className="grid grid-cols-4 gap-3 p-6 h-full overflow-hidden">
                {loading ? (
                  <div className="col-span-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-xl text-muted-foreground font-medium">Loading parking map...</p>
                    </div>
                  </div>
                ) : (
                  parkingSlots.slice(0, 16).map((slot) => (
                    <div
                      key={slot._id}
                      className={`
                        relative group cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10
                        ${slot.status === 'available'
                          ? (userReservation ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-2xl hover:shadow-green-400/60')
                          : slot.status === 'reserved'
                          ? (slot.user === userReservation?.user || slot.vehicleDetails ? 'ring-4 ring-blue-400 shadow-xl' : 'hover:shadow-2xl hover:shadow-orange-400/60')
                          : 'hover:shadow-2xl hover:shadow-red-400/60'
                        }
                      `}
                      onClick={() => slot.status === 'available' && !userReservation && onReservationClick(slot.slot)}
                    >
                      <div className={`
                        w-full h-20 rounded-xl border-4 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden
                        ${slot.status === 'available'
                          ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 border-emerald-700 hover:from-emerald-500 hover:via-green-600 hover:to-emerald-700 shadow-lg'
                          : slot.status === 'reserved'
                          ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 border-amber-700 shadow-lg'
                          : 'bg-gradient-to-br from-red-400 via-rose-500 to-red-600 border-red-700 shadow-lg'
                        }
                      `}>
                        <div className="absolute top-2 right-2">
                          {slot.status === 'occupied' && (
                            <div className="w-6 h-6 bg-black/20 rounded-full flex items-center justify-center">
                              <Car className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          )}
                          {slot.status === 'reserved' && (
                            <div className="w-6 h-6 bg-black/20 rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          )}
                          {slot.status === 'available' && (
                            <div className="w-6 h-6 bg-white/40 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          )}
                        </div>

                        <div className="text-white font-bold text-lg drop-shadow-xl mb-1">
                          {slot.slot}
                        </div>

                        <div className="text-white/95 text-sm font-semibold drop-shadow-xl capitalize">
                          {slot.status}
                        </div>

                        {slot.vehicleDetails && (
                          <div className="text-white/80 text-xs font-medium drop-shadow-lg mt-1">
                            {slot.vehicleDetails.plateNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}