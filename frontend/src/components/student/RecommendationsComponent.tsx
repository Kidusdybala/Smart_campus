import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Lightbulb, TrendingUp, Coffee, Car } from "lucide-react";
import { api } from "../../api";
import { Skeleton } from "../ui/skeleton";

interface Recommendation {
  id: string;
  name: string;
  price?: number;
  score: number;
  reason: string;
  type?: string;
}

export function RecommendationsComponent() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await api.getRecommendations();
        setRecommendations(data || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Helper function to get icon based on recommendation type
  const getRecommendationIcon = (rec: Recommendation) => {
    // Check name or type for classification
    const name = rec.name.toLowerCase();
    const type = rec.type?.toLowerCase() || "";
    
    if (name.includes("parking") || type.includes("parking") || name.includes("spot")) {
      return <Car className="w-4 h-4 text-warning" />;
    } else if (name.includes("coffee") || name.includes("food") || name.includes("drink") || type.includes("food")) {
      return <Coffee className="w-4 h-4 text-accent" />;
    } else {
      return <Lightbulb className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Personalized Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-[60px]" />
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {getRecommendationIcon(rec)}
                    {rec.name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {rec.reason}
                  </div>
                </div>
                {rec.price && (
                  <Badge variant="outline" className="ml-2">
                    {rec.price} ETB
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recommendations available yet.</p>
            <p className="text-xs">Check back later for personalized suggestions!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}