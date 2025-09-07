import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AlertCircle, User } from "lucide-react";

interface VehicleDetails {
  plateNumber: string;
  carType: string;
  carModel: string;
  color: string;
}

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slotId: string | null;
  vehicleDetails: VehicleDetails;
  onVehicleDetailsChange: (details: VehicleDetails) => void;
  onReserve: () => void;
  userVehicleInfo: VehicleDetails | null;
}

export function ReservationDialog({
  open,
  onOpenChange,
  slotId,
  vehicleDetails,
  onVehicleDetailsChange,
  onReserve,
  userVehicleInfo
}: ReservationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reserve Parking Spot {slotId}</DialogTitle>
          <DialogDescription>
            {userVehicleInfo
              ? "Your vehicle details are pre-filled from your profile for convenience."
              : "Please provide your vehicle details for security and verification purposes."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!userVehicleInfo && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">Vehicle Information Required</h4>
                  <p className="text-sm text-amber-700 mb-3">
                    You need to add your vehicle details to your profile before reserving a parking spot.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => {
                      onOpenChange(false);
                      window.location.href = '/student/profile/vehicle';
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Go to Profile
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className={`p-4 rounded-lg border ${userVehicleInfo ? 'bg-gray-50' : 'bg-red-50 border-red-200'}`}>
            <h4 className="font-medium mb-3 text-gray-800 flex items-center gap-2">
              Vehicle Details Confirmation
              {userVehicleInfo && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">From Profile</span>}
              {!userVehicleInfo && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Missing Info</span>}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Plate Number</Label>
                <p className={`text-lg font-semibold ${vehicleDetails.plateNumber ? 'text-gray-800' : 'text-red-600'}`}>
                  {vehicleDetails.plateNumber || 'Not provided'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Car Type</Label>
                <p className={`text-lg font-semibold capitalize ${vehicleDetails.carType ? 'text-gray-800' : 'text-red-600'}`}>
                  {vehicleDetails.carType || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Car Model</Label>
                <p className={`text-lg font-semibold ${vehicleDetails.carModel ? 'text-gray-800' : 'text-gray-500'}`}>
                  {vehicleDetails.carModel || 'Not provided'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Color</Label>
                <p className={`text-lg font-semibold ${vehicleDetails.color ? 'text-gray-800' : 'text-gray-500'}`}>
                  {vehicleDetails.color || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onVehicleDetailsChange({ plateNumber: '', carType: '', carModel: '', color: '' });
              }}
            >
              Cancel
            </Button>
            {!userVehicleInfo ? (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  window.location.href = '/student/profile/vehicle';
                }}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <User className="w-4 h-4 mr-2" />
                Add Vehicle Info
              </Button>
            ) : (
              <Button onClick={onReserve} disabled={!vehicleDetails.plateNumber || !vehicleDetails.carType}>
                Reserve Spot
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}