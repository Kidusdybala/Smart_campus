import { QRScanner } from "../../components/qr/QRScanner";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
};

interface QRScannerPageProps {
  user: User;
}

export function QRScannerPage({ user }: QRScannerPageProps) {
  return <QRScanner onBack={() => window.history.back()} user={user} />;
}