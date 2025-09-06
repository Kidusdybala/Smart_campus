import { FoodOrdering } from "../components/food/FoodOrdering";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
};

interface FoodOrderingPageProps {
  user: User;
}

export function FoodOrderingPage({ user }: FoodOrderingPageProps) {
  return <FoodOrdering onBack={() => window.history.back()} user={user} />;
}