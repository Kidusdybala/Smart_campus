import { ParkingView } from "../../components/parking/ParkingView";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin" | "cafeteria";
};

interface ParkingPageProps {
  user: User;
}

export function ParkingPage({ user }: ParkingPageProps) {
  return <ParkingView onBack={() => window.history.back()} user={user} />;
}