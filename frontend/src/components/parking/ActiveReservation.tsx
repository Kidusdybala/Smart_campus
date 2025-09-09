import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CheckCircle, Car } from "lucide-react";
import { toast } from "sonner";

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

interface ActiveReservationProps {
  userReservation: ParkingSlot | null;
  onEndParking: () => Promise<void>;
}

export function ActiveReservation({ userReservation, onEndParking }: ActiveReservationProps) {
  if (!userReservation) return null;

  return (
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
            <Badge className="bg-green-500 hover:bg-green-600 text-white hover:text-white capitalize">
              {userReservation.status}
            </Badge>
          </div>
          <div className="text-sm text-green-700 mb-3">
            Reserved at: {userReservation.reservedAt ? new Date(userReservation.reservedAt).toLocaleString() : 'Date not available'}
          </div>
          <div className="text-sm text-green-700 mb-3">
            Duration: {userReservation.reservedAt ? (() => {
              const duration = Date.now() - new Date(userReservation.reservedAt).getTime();
              const hours = Math.floor(duration / (1000 * 60 * 60));
              const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
              return `${hours}h ${minutes}m`;
            })() : 'N/A'}
          </div>
          <div className="text-sm text-green-700 mb-3">
            Estimated cost: {userReservation.reservedAt ? (() => {
              const duration = Date.now() - new Date(userReservation.reservedAt).getTime();
              const hours = duration / (1000 * 60 * 60);
              const cost = Math.max(10, Math.ceil(hours * 10));
              return `${cost} ETB`;
            })() : 'N/A'}
          </div>
          {userReservation.vehicleDetails && (
            <div className="text-sm text-green-700 mb-3">
              <div><strong>Plate:</strong> {userReservation.vehicleDetails.plateNumber}</div>
              <div><strong>Vehicle:</strong> {userReservation.vehicleDetails.carType} {userReservation.vehicleDetails.carModel}</div>
              {userReservation.vehicleDetails.color && <div><strong>Color:</strong> {userReservation.vehicleDetails.color}</div>}
            </div>
          )}
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
              onClick={onEndParking}
            >
              End Parking
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}