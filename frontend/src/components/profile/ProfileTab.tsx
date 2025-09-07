import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
  qrCode: string;
}

interface ProfileTabProps {
  profileData: ProfileData;
  onProfileDataChange: (data: ProfileData) => void;
  onUpdate: () => Promise<void>;
  loading: boolean;
}

export function ProfileTab({ profileData, onProfileDataChange, onUpdate, loading }: ProfileTabProps) {
  return (
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
              onChange={(e) => onProfileDataChange({ ...profileData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => onProfileDataChange({ ...profileData, email: e.target.value })}
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

        <Button onClick={onUpdate} disabled={loading} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Updating..." : "Update Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}