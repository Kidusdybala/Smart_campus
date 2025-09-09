import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Lightbulb, TrendingUp, Coffee, Car, Heart, Star, ThumbsUp } from "lucide-react";
import { api } from "../../api";
import { Skeleton } from "../ui/skeleton";

interface Recommendation {
  id: string;
  name: string;
  price?: number;
  score: number;
  reason: string;
  type?: string;
  category?: string;
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

export function RecommendationsComponent({ refreshTrigger }: { refreshTrigger?: number }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataKey, setDataKey] = useState(0); // Force re-render key
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Function to fetch and process recommendations
  const fetchRecommendations = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) setLoading(true);
      const data = await api.getRecommendations();

      console.log('Processing recommendations data:', data, 'Force refresh:', forceRefresh);

      // Handle the backend response structure
      if (data && (data.foods || data.parking)) {
        const combinedRecommendations: Recommendation[] = [];

        // Process food recommendations - group by category and find most popular
        if (data.foods && Array.isArray(data.foods)) {
          console.log('Processing food recommendations:', data.foods);

          // Group foods by category (soft drinks vs regular food)
          const softDrinks: BackendFoodRecommendation[] = [];
          const regularFoods: BackendFoodRecommendation[] = [];

          data.foods.forEach((food: BackendFoodRecommendation) => {
            const name = food.name.toLowerCase();
            if (name.includes('cola') || name.includes('fanta') || name.includes('sprite') || name.includes('mirinda') || name.includes('malt')) {
              softDrinks.push(food);
            } else {
              regularFoods.push(food);
            }
          });

          // Find most popular soft drink
          if (softDrinks.length > 0) {
            const mostPopularSoftDrink = softDrinks.reduce((prev, current) =>
              (current.count || current.score || 1) > (prev.count || prev.score || 1) ? current : prev
            );
            combinedRecommendations.push({
              id: mostPopularSoftDrink.id || `softdrink_${mostPopularSoftDrink.name}`,
              name: mostPopularSoftDrink.name,
              price: mostPopularSoftDrink.price,
              score: mostPopularSoftDrink.count || mostPopularSoftDrink.score || 1,
              reason: 'Most popular soft drink in your orders',
              type: 'food',
              category: 'softdrink'
            });
          }

          // Find most popular regular food
          if (regularFoods.length > 0) {
            const mostPopularFood = regularFoods.reduce((prev, current) =>
              (current.count || current.score || 1) > (prev.count || prev.score || 1) ? current : prev
            );
            combinedRecommendations.push({
              id: mostPopularFood.id || `food_${mostPopularFood.name}`,
              name: mostPopularFood.name,
              price: mostPopularFood.price,
              score: mostPopularFood.count || mostPopularFood.score || 1,
              reason: 'Most popular food in your orders',
              type: 'food',
              category: 'food'
            });
          }
        }

        // Process parking recommendations - find most popular parking spot
        if (data.parking && Array.isArray(data.parking)) {
          console.log('Processing parking recommendations:', data.parking);

          if (data.parking.length > 0) {
            const mostPopularSpot = data.parking.reduce((prev, current) =>
              (current.count || current.score || 1) > (prev.count || prev.score || 1) ? current : prev
            );

            console.log('Most popular parking spot:', mostPopularSpot);

            const parkingRec = {
              id: mostPopularSpot.slot || `parking_${mostPopularSpot.slot}`,
              name: mostPopularSpot.slot || mostPopularSpot.name || 'Unknown Spot',
              price: 10, // Standard parking fee
              score: mostPopularSpot.count || mostPopularSpot.score || 1,
              reason: 'Your most frequently used parking spot',
              type: 'parking'
            };

            console.log('Adding parking recommendation:', parkingRec);
            combinedRecommendations.push(parkingRec);
          } else {
            console.log('No parking data available');
          }
        } else {
          console.log('No parking recommendations in data');
        }

        console.log('Final filtered recommendations:', combinedRecommendations);
        setRecommendations(combinedRecommendations);
        setLastRefresh(Date.now());
        setDataKey(prev => prev + 1); // Force re-render

        // Force re-render by updating state
        if (!forceRefresh) setLoading(false);
      } else {
        console.log('No recommendations data found');
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    } finally {
      if (!forceRefresh) setLoading(false);
    }
  };

  // Manual refresh function
  const refreshRecommendations = () => {
    console.log('Manually refreshing recommendations...');
    fetchRecommendations(true);
  };

  // Expose refresh function globally for external calls
  useEffect(() => {
    (window as typeof window & { refreshRecommendations?: () => void }).refreshRecommendations = refreshRecommendations;
    return () => {
      delete (window as typeof window & { refreshRecommendations?: () => void }).refreshRecommendations;
    };
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Watch for external refresh triggers
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > lastRefresh) {
      console.log('External refresh trigger detected, refreshing recommendations...');
      fetchRecommendations(true);
    }
  }, [refreshTrigger, lastRefresh]);

  // Mobile interactivity handlers
  const toggleFavorite = (recId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(recId)) {
        newFavorites.delete(recId);
      } else {
        newFavorites.add(recId);
        // Simulate haptic feedback on mobile
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
      return newFavorites;
    });
  };

  const toggleLike = (recId: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(recId)) {
        newLiked.delete(recId);
      } else {
        newLiked.add(recId);
        // Simulate haptic feedback on mobile
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
      return newLiked;
    });
  };

  const handleCardClick = (rec: Recommendation) => {
    console.log('Card clicked:', rec);
    // Navigate to appropriate page based on recommendation type
    if (rec.type === 'food' || rec.category === 'softdrink' || rec.category === 'food') {
      console.log('Navigating to food page');
      window.location.href = '/student/food';
    } else if (rec.type === 'parking') {
      console.log('Navigating to parking page');
      window.location.href = '/student/parking';
    } else {
      console.log('Unknown recommendation type:', rec.type, rec.category);
    }
  };

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
      // Soft drinks
      'coca cola': '/coca cola.jpg',
      'coca-cola': '/coca cola.jpg',
      'fanta': '/fanta',
      'sprite': '/sprite.jpg',
      'mirinda': '/mirinda',
      'sofi malta': '/sofi malta.jpg',
      // Foods
      'shiro': '/shiro.jpg',
      'doro': '/doro.jpg',
      'kitfo': '/kitfo.jpg',
      'agelgil': '/agelgil.jpg',
      'atakilt': '/atakilt.jpg',
      'atekilt': '/atakilt.jpg', // Alternative spelling
      'atekilt wat': '/atakilt.jpg', // With common suffix
      'aynet': '/aynet.jpg',
      'nigus': '/nigus.jpg',
      // Additional common variations
      'special atakilt': '/atakilt.jpg',
      'large atakilt': '/atakilt.jpg',
      'small atakilt': '/atakilt.jpg'
    };

    // Normalize the name for better matching
    const normalizedName = rec.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9\s]/g, ''); // Remove special characters

    console.log('Image lookup for:', rec.name, '-> normalized:', normalizedName);

    // Try exact match first
    if (imageMap[normalizedName]) {
      console.log('Found exact match:', imageMap[normalizedName]);
      return imageMap[normalizedName];
    }

    // Try partial matching for better fallback
    for (const [key, value] of Object.entries(imageMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        console.log('Found partial match:', key, '->', value);
        return value;
      }
    }

    // Try word-by-word matching for complex names
    const words = normalizedName.split(' ');
    for (const word of words) {
      if (word.length > 2 && imageMap[word]) { // Only check words longer than 2 chars
        console.log('Found word match:', word, '->', imageMap[word]);
        return imageMap[word];
      }
    }

    // Try removing common prefixes/suffixes
    const cleanedName = normalizedName
      .replace(/^(the|a|an)\s+/i, '') // Remove articles
      .replace(/\s+(special|large|small|medium)$/i, ''); // Remove size modifiers

    if (imageMap[cleanedName]) {
      console.log('Found cleaned match:', cleanedName, '->', imageMap[cleanedName]);
      return imageMap[cleanedName];
    }

    console.log('No image found, using placeholder for:', rec.name);
    return '/placeholder.svg';
  };

  return (
    <div key={dataKey} className="w-full">
      <div className="mb-4 md:mb-6">
        <div className="mb-2">
          <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            For You
          </h2>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">Personalized recommendations based on your activity</p>
        {/* Mobile interaction hint */}
        <div className="md:hidden mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>💡</span>
          <span>Tap cards to explore • Use ⭐ and 👍 for favorites</span>
        </div>
      </div>

      {(() => {
        console.log('Current loading state:', loading, 'Recommendations count:', recommendations.length);
        return null;
      })()}
      {loading ? (
        // Mobile-optimized loading skeleton
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                <div className="h-4 md:h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 md:h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-3 md:h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {(() => {
            console.log('Rendering recommendations:', recommendations.map(r => ({ name: r.name, type: r.type, score: r.score })));
            return null;
          })()}
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01] md:hover:scale-[1.02] cursor-pointer group active:scale-95 touch-manipulation"
              onClick={() => {
                console.log('Recommendation card clicked:', rec);
                handleCardClick(rec);
              }}
            >
              {/* Image Section */}
              <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={getRecommendationImage(rec)}
                  alt={rec.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.log('Image failed to load for:', rec.name, 'src was:', (e.target as HTMLImageElement).src);
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully for:', rec.name);
                  }}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
                    {getRecommendationIcon(rec)}
                  </div>
                  {/* Mobile interactivity buttons */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(rec.id);
                    }}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-yellow-100 transition-colors touch-manipulation md:hidden"
                  >
                    <Star
                      className={`w-4 h-4 ${favorites.has(rec.id) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(rec.id);
                    }}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-red-100 transition-colors touch-manipulation md:hidden"
                  >
                    <ThumbsUp
                      className={`w-4 h-4 ${likedItems.has(rec.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
                    />
                  </button>
                </div>
                {rec.category === 'softdrink' && (
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-orange-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      🥤 Soft Drink
                    </div>
                  </div>
                )}
                {rec.category === 'food' && (
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-green-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
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
              <div className="p-3 md:p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-base md:text-lg text-gray-900 leading-tight line-clamp-2">
                    {rec.name}
                  </h3>
                  {rec.price ? (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs md:text-sm font-medium flex-shrink-0 ml-2">
                      {rec.price} ETB
                    </div>
                  ) : (
                    rec.type === 'parking' && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs md:text-sm font-medium flex-shrink-0 ml-2">
                        Free
                      </div>
                    )
                  )}
                </div>

                <p className="text-gray-600 text-xs md:text-sm mb-3 leading-relaxed line-clamp-2">
                  {rec.category === 'softdrink' ? 'Your most ordered beverage choice' :
                   rec.category === 'food' ? 'Your favorite meal from our menu' :
                   rec.type === 'parking' ? (() => {
                     console.log('Parking spot description:', rec.reason);
                     return 'Based on your parking preferences';
                   })() :
                   rec.reason}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs md:text-sm font-medium text-gray-700">
                        {rec.category === 'softdrink' ? 'Most popular soft drink' :
                         rec.category === 'food' ? 'Most popular food' :
                         rec.type === 'parking' ? 'Your favorite spot' : 'Recommended'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                    {rec.type === 'food' ? '🍴 Order now' : '🚗 Reserve'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 md:py-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl md:rounded-2xl border-2 border-dashed border-gray-200 mx-4 md:mx-0">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <Lightbulb className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 px-4">Discover Your Favorites</h3>
          <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto px-4 mb-6">
            Start ordering food and reserving parking spots to get personalized recommendations tailored just for you!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/70 px-3 py-2 rounded-lg">
              <span className="text-orange-500">🍽️</span>
              <span>Order Food</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/70 px-3 py-2 rounded-lg">
              <span className="text-blue-500">🚗</span>
              <span>Reserve Parking</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}