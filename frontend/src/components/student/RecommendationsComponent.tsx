import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Lightbulb, TrendingUp, Coffee, Car, Heart } from "lucide-react";
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

interface BackendFoodRecommendation {
  id?: string;
  name: string;
  price?: number;
  count?: number;
  score?: number;
  reason?: string;
}

interface BackendParkingRecommendation {
  slot?: string;
  name?: string;
  count?: number;
  score?: number;
  reason?: string;
}

interface BackendRecommendationsResponse {
  foods?: BackendFoodRecommendation[];
  parking?: BackendParkingRecommendation[];
  lastUpdated?: string;
  algorithm?: string;
  service_status?: string;
}

export function RecommendationsComponent() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataKey, setDataKey] = useState(0); // Force re-render key

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await api.getRecommendations();

        console.log('Processing recommendations data:', data);

        // Handle the backend response structure
        if (data && (data.foods || data.parking)) {
          const combinedRecommendations: Recommendation[] = [];

          // Process food recommendations
          if (data.foods && Array.isArray(data.foods)) {
            console.log('Processing food recommendations:', data.foods);
            data.foods.forEach((food: BackendFoodRecommendation) => {
              combinedRecommendations.push({
                id: food.id || `food_${food.name}`,
                name: food.name,
                price: food.price,
                score: food.count || food.score || 1,
                reason: food.reason || 'Based on your order history',
                type: 'food'
              });
            });
          }

          // Process parking recommendations
          if (data.parking && Array.isArray(data.parking)) {
            console.log('Processing parking recommendations:', data.parking);
            data.parking.forEach((spot: BackendParkingRecommendation) => {
              combinedRecommendations.push({
                id: spot.slot || `parking_${spot.slot}`,
                name: spot.slot || spot.name || 'Unknown Spot',
                score: spot.count || spot.score || 1,
                reason: spot.reason || 'Based on your parking history',
                type: 'parking'
              });
            });
          }

          console.log('Final combined recommendations:', combinedRecommendations);
          setRecommendations(combinedRecommendations);
          setDataKey(prev => prev + 1); // Force re-render

          // Force re-render by updating state
          setLoading(false);
        } else {
          console.log('No recommendations data found');
          setRecommendations([]);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations([]);
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
      return <Car className="w-5 h-5 text-blue-600" />;
    } else if (name.includes("coffee") || name.includes("food") || name.includes("drink") || type.includes("food")) {
      return <Coffee className="w-5 h-5 text-orange-500" />;
    } else {
      return <Heart className="w-5 h-5 text-red-500" />;
    }
  };

  // Helper function to get image path
  const getRecommendationImage = (rec: Recommendation) => {
    if (rec.type === 'parking') {
      return '/parking.svg';
    }

    // For food items, try to match with available images
    const imageMap: { [key: string]: string } = {
      'coca cola': '/coca cola.jpg',
      'coca-cola': '/coca cola.jpg',
      'shiro': '/shiro.jpg',
      'doro': '/doro.jpg',
      'kitfo': '/kitfo.jpg',
      'agelgil': '/agelgil.jpg',
      'atakilt': '/atakilt.jpg',
      'aynet': '/aynet.jpg',
      'nigus': '/nigus.jpg',
      'sofi malta': '/sofi malta.jpg',
      'sprite': '/sprite.jpg',
      'fanta': '/fanta',
      'mirinda': '/mirinda'
    };

    const name = rec.name.toLowerCase().replace(/\s+/g, ' ');
    return imageMap[name] || '/placeholder.svg';
  };

  return (
    <div key={dataKey} className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          For You
        </h2>
        <p className="text-muted-foreground">Personalized recommendations based on your activity</p>
      </div>

      {(() => {
        console.log('Current loading state:', loading, 'Recommendations count:', recommendations.length);
        return null;
      })()}
      {loading ? (
        // Modern loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            console.log('Rendering recommendations:', recommendations.map(r => ({ name: r.name, type: r.type, score: r.score })));
            return null;
          })()}
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
            >
              {/* Image Section */}
              <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={getRecommendationImage(rec)}
                  alt={rec.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
                    {getRecommendationIcon(rec)}
                  </div>
                </div>
                {rec.type === 'food' && (
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      🍽️ Food
                    </div>
                  </div>
                )}
                {rec.type === 'parking' && (
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      🅿️ Parking
                    </div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                    {rec.name}
                  </h3>
                  {rec.price && (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm font-medium">
                      {rec.price} ETB
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                  {rec.reason}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {rec.score} • Recommended
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {rec.type === 'food' ? '🍴 Order now' : '🚗 Reserve'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover Your Favorites</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Start ordering food and reserving parking spots to get personalized recommendations tailored just for you!
          </p>
        </div>
      )}
    </div>
  );
}