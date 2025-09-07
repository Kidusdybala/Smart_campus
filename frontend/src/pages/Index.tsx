import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { QrCode, UtensilsCrossed, Car, Calendar, LogIn } from "lucide-react";
import heroImage from "../assets/hero-campus.jpg";
import { AuthDialog } from "../components/auth/AuthDialog";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin" | "cafeteria";
};

const Index = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const handleAuthSuccess = (userData: User) => {
    setShowAuth(false);
    // Navigate to the appropriate dashboard route
    switch (userData?.role) {
      case "student":
        navigate("/student");
        break;
      case "staff":
        navigate("/staff");
        break;
      case "admin":
        navigate("/admin");
        break;
      case "cafeteria":
        navigate("/cafeteria");
        break;
      default:
        break;
    }
  };

  const features = [
    {
      icon: QrCode,
      title: "Smart QR Entrance",
      description: "Seamless campus access with QR code scanning and attendance tracking"
    },
    {
      icon: UtensilsCrossed,
      title: "Food Ordering",
      description: "Pre-order meals with real-time pickup updates and smart recommendations"
    },
    {
      icon: Car,
      title: "Parking Management",
      description: "Real-time parking availability and reservation system"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automated attendance and dynamic schedule management"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Login Button */}
      <header className="absolute top-0 right-0 z-20 p-6">
        <Button
          onClick={() => setShowAuth(true)}
          className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Smart Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
       

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up">
            Your Campus,
            <span className="block bg-gradient-to-r from-primary-glow to-accent bg-clip-text text-transparent">
              Smarter
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed animate-slide-up">
            Experience the future of campus management with QR-based access,
            smart food ordering, real-time parking, and seamless scheduling.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Smart Campus Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline campus life with intelligent technology that adapts to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card border rounded-lg p-6 shadow-card hover:shadow-hover transition-all duration-300 group animate-slide-up text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AuthDialog
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;