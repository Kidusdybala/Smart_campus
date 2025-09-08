import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { api } from "../../api";
import { Heart, ShoppingCart, Car, MapPin, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Recommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState({ foods: [], parking: [] });
  const [loading, setLoading] = useState(true);
  const [likedItems, setLikedItems] = useState(new Set());

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await api.getRecommendations();
        console.log('Recommendations data:', data);
        setRecommendations(data);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        // Fallback data for demo
        setRecommendations({
          foods: [
            { id: '1', name: 'Doro Wat', price: 250, image: '/doro.jpg', reason: 'Your favorite spicy dish' },
            { id: '2', name: 'Coca Cola', price: 25, image: '/coca cola.jpg', reason: 'Popular with similar students' }
          ],
          parking: [
            { slot: '11', reason: 'Reserved 5 times' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleLike = (itemId: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleOrder = (food: { id: string; name: string; price: number }) => {
    // Navigate to food ordering page with pre-selected item
    navigate('/student/food', { state: { selectedFood: food } });
  };

  const handleReserve = (spot: { slot: string; reason?: string }) => {
    // Navigate to parking page with pre-selected spot
    navigate('/student/parking', { state: { selectedSpot: spot } });
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">✨ Recommended for You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-3"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get top recommendations (1 food, 1 drink, 1 parking)
  const topFood = recommendations.foods && recommendations.foods.length > 0 ? recommendations.foods[0] : null;
  const topDrink = recommendations.foods && recommendations.foods.length > 0 ? recommendations.foods.find(f =>
    f && f.name && (
      f.name.toLowerCase().includes('cola') ||
      f.name.toLowerCase().includes('fanta') ||
      f.name.toLowerCase().includes('sprite') ||
      f.name.toLowerCase().includes('mirinda') ||
      f.name.toLowerCase().includes('sofi') ||
      f.name.toLowerCase().includes('coca') ||
      f.name.toLowerCase().includes('pepsi')
    )
  ) || (recommendations.foods.length > 1 ? recommendations.foods[1] : null) : null;

  // Ensure we have a parking recommendation
  const topParking = recommendations.parking && recommendations.parking.length > 0
    ? recommendations.parking[0]
    : {
        slot: '11',
        score: 5,
        reason: 'Reserved 5 times'
      };

  // Debug logging
  console.log('Top recommendations:', { topFood, topDrink, topParking });

  // Smart image selection based on food names
  const getFoodImage = (food: { name: string; image?: string }) => {
    const name = food.name.toLowerCase();
    if (name.includes('doro')) return '/doro.jpg';
    if (name.includes('shiro')) return '/shiro.jpg';
    if (name.includes('kitfo')) return '/kitfo.jpg';
    if (name.includes('tibs')) return '/tibs.jpg';
    if (name.includes('cola')) return '/coca cola.jpg';
    if (name.includes('fanta')) return '/fanta';
    if (name.includes('sprite')) return '/sprite.jpg';
    if (name.includes('mirinda')) return '/mirinda';
    if (name.includes('sofi')) return '/sofi malta.jpg';
    if (name.includes('agelgil')) return '/agelgil.jpg';
    if (name.includes('atakilt')) return '/atakilt.jpg';
    if (name.includes('aynet')) return '/aynet.jpg';
    if (name.includes('nigus')) return '/nigus.jpg';
    return food.image || '/doro.jpg'; // Default fallback
  };

  return (
    <Card className="shadow-card border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500 animate-pulse" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Show message if no recommendations */}
          {!topFood && !topDrink && !topParking && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No recommendations available at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Try ordering some food or reserving parking to get personalized recommendations!</p>
            </div>
          )}

          {/* Food Recommendation */}
          {topFood && (
            <div className="group relative">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-100 to-red-100 p-6 hover:shadow-lg transition-all duration-300">
                {/* Food Image */}
                <div className="w-full h-32 bg-gradient-to-br from-orange-200 to-red-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={getFoodImage(topFood)}
                    alt={topFood.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      const target = e.currentTarget as HTMLImageElement;
                      const container = target.parentElement;
                      if (container) {
                        target.style.display = 'none';
                        // Create and show emoji fallback
                        const emoji = document.createElement('span');
                        emoji.textContent = '🍛';
                        emoji.className = 'text-4xl';
                        container.appendChild(emoji);
                      }
                    }}
                  />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{topFood.name}</h3>
                    <p className="text-sm text-gray-600">{topFood.price} ETB</p>
                  </div>

                  {/* Reason Badge */}
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {topFood.reason || 'Recommended for you'}
                  </Badge>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleOrder(topFood)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Order
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLike(topFood.id)}
                      className={likedItems.has(topFood.id) ? 'text-red-500 border-red-500' : ''}
                    >
                      <Heart className={`w-4 h-4 ${likedItems.has(topFood.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl"></div>
              </div>
            </div>
          )}

          {/* Drink Recommendation */}
          {topDrink && (
            <div className="group relative">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 p-6 hover:shadow-lg transition-all duration-300">
                {/* Drink Image */}
                <div className="w-full h-32 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={getFoodImage(topDrink)}
                    alt={topDrink.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      const target = e.currentTarget as HTMLImageElement;
                      const container = target.parentElement;
                      if (container) {
                        target.style.display = 'none';
                        // Create and show emoji fallback
                        const emoji = document.createElement('span');
                        emoji.textContent = '🥤';
                        emoji.className = 'text-4xl';
                        container.appendChild(emoji);
                      }
                    }}
                  />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{topDrink.name}</h3>
                    <p className="text-sm text-gray-600">{topDrink.price} ETB</p>
                  </div>

                  {/* Reason Badge */}
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {topDrink.reason || 'Popular choice'}
                  </Badge>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleOrder(topDrink)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Order
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLike(topDrink.id)}
                      className={likedItems.has(topDrink.id) ? 'text-red-500 border-red-500' : ''}
                    >
                      <Heart className={`w-4 h-4 ${likedItems.has(topDrink.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl"></div>
              </div>
            </div>
          )}

          {/* Parking Recommendation */}
          {topParking && (
            <div className="group relative">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-6 hover:shadow-lg transition-all duration-300">
                {/* Parking Image */}
                <div className="w-full h-32 bg-gradient-to-br from-green-200 to-emerald-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                  <img
                    src="/parking.svg"
                    alt="Parking Spot"
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      const target = e.currentTarget as HTMLImageElement;
                      const container = target.parentElement;
                      if (container) {
                        target.style.display = 'none';
                        // Create and show emoji fallback
                        const emoji = document.createElement('span');
                        emoji.textContent = '🅿️';
                        emoji.className = 'text-4xl';
                        container.appendChild(emoji);
                      }
                    }}
                  />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Spot {topParking.slot}</h3>
                    <p className="text-sm text-gray-600">Prime location</p>
                  </div>

                  {/* Reason Badge */}
                  <Badge variant="secondary" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {topParking.reason || 'Your preferred spot'}
                  </Badge>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleReserve(topParking)}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      <Car className="w-4 h-4 mr-1" />
                      Reserve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLike(topParking.slot)}
                      className={likedItems.has(topParking.slot) ? 'text-red-500 border-red-500' : ''}
                    >
                      <Heart className={`w-4 h-4 ${likedItems.has(topParking.slot) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl"></div>
              </div>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-6">
          <Button variant="outline" onClick={() => navigate('/student/recommendations')}>
            View All Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}