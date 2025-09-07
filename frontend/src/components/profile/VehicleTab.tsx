import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Car } from "lucide-react";

interface VehicleData {
  plateNumber: string;
  carType: string;
  carModel: string;
  color: string;
}

interface VehicleTabProps {
  vehicleData: VehicleData;
  onVehicleDataChange: (data: VehicleData) => void;
  onUpdate: () => Promise<void>;
  loading: boolean;
}

export function VehicleTab({ vehicleData, onVehicleDataChange, onUpdate, loading }: VehicleTabProps) {
  return (
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
              onChange={(e) => onVehicleDataChange({ ...vehicleData, plateNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carType">Car Type *</Label>
            <Select value={vehicleData.carType} onValueChange={(value) => onVehicleDataChange({ ...vehicleData, carType: value })}>
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
              onChange={(e) => onVehicleDataChange({ ...vehicleData, carModel: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              placeholder="White"
              value={vehicleData.color}
              onChange={(e) => onVehicleDataChange({ ...vehicleData, color: e.target.value })}
            />
          </div>
        </div>

        <Button onClick={onUpdate} disabled={loading} className="w-full">
          <Car className="w-4 h-4 mr-2" />
          {loading ? "Updating..." : "Update Vehicle Info"}
        </Button>
      </CardContent>
    </Card>
  );
}