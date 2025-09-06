import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, QrCode, CheckCircle, MapPin, Clock, Scan } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
};

interface QRScannerProps {
  onBack: () => void;
  user: User;
}

const scanLocations = [
  { id: "entrance-main", name: "Main Entrance", type: "entrance" },
  { id: "entrance-library", name: "Library Entrance", type: "entrance" },
  { id: "class-cs301", name: "CS-301 Classroom", type: "classroom" },
  { id: "class-cs205", name: "CS-205 Classroom", type: "classroom" },
  { id: "cafeteria", name: "Cafeteria", type: "facility" },
  { id: "gym", name: "Fitness Center", type: "facility" },
];

export function QRScanner({ onBack, user }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await api.getScanHistory();
        setScanHistory(history);
      } catch (error) {
        toast.error("Failed to load scan history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const simulateScan = async (locationId: string) => {
    const location = scanLocations.find(loc => loc.id === locationId);
    if (!location) return;

    setIsScanning(true);

    try {
      // Get user's QR code first
      const { qrCode } = await api.getMyQR();
      await api.scanQR(qrCode, location.name);

      const newScan = {
        id: Date.now().toString(),
        location: location.name,
        type: location.type,
        timestamp: new Date(),
        status: "success" as const
      };

      setScanHistory([newScan, ...scanHistory]);
      toast.success(`Successfully checked into ${location.name}`, {
        description: `Scanned at ${new Date().toLocaleTimeString()}`
      });
    } catch (error) {
      toast.error("Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "entrance": return "bg-primary";
      case "classroom": return "bg-success";
      case "facility": return "bg-accent";
      default: return "bg-secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entrance": return "🚪";
      case "classroom": return "📚";
      case "facility": return "🏢";
      default: return "📍";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">QR Scanner</h1>
                <p className="text-white/80 text-sm">Scan QR codes to check in</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Scanner Interface */}
        <Card className="shadow-card mb-8">
          <CardHeader className="text-center">
            <CardTitle>Campus Check-In</CardTitle>
            <CardDescription>
              Scan a QR code at any campus location to automatically check in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {/* Scanner Simulation */}
              <div className="relative w-64 h-64 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/50 flex items-center justify-center mb-6">
                {isScanning ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Scanning...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Scan className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Position QR code in frame</p>
                  </div>
                )}
              </div>

              {/* Demo Locations */}
              <div className="w-full">
                <h3 className="font-semibold mb-4 text-center">Test Locations</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {scanLocations.map((location) => (
                    <Button
                      key={location.id}
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => simulateScan(location.id)}
                      disabled={isScanning}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getTypeIcon(location.type)}</span>
                        <div className="text-left">
                          <div className="font-medium">{location.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{location.type}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan History */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
            <CardDescription>Your campus activity history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">Loading scan history...</div>
              ) : (
                scanHistory.map((scan) => (
                  <div
                    key={scan._id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white text-sm`}>
                        📍
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {scan.location || 'Unknown Location'}
                          <CheckCircle className="w-4 h-4 text-success" />
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(() => {
                            try {
                              if (!scan.scannedAt) return 'Date not available';
                              const date = new Date(scan.scannedAt);
                              if (isNaN(date.getTime())) return 'Invalid date';
                              return date.toLocaleString();
                            } catch (error) {
                              return 'Date error';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="capitalize"
                    >
                      Scanned
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}