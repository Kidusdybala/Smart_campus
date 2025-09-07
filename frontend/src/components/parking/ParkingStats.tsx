import { Card, CardContent } from "../ui/card";
import { ParkingCircle, CheckCircle, Clock, Navigation } from "lucide-react";

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

interface ParkingStatsProps {
  parkingSlots: ParkingSlot[];
}

export function ParkingStats({ parkingSlots }: ParkingStatsProps) {
  return (
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
  );
}