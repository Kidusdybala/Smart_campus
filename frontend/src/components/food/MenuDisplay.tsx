import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Star, Clock, Plus, Minus } from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
}

interface MenuDisplayProps {
  menuItems: MenuItem[];
  loading: boolean;
  cart: {[key: string]: number};
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
}

export function MenuDisplay({ menuItems, loading, cart, addToCart, removeFromCart }: MenuDisplayProps) {
  const [activeCategory, setActiveCategory] = React.useState("mains");

  const menuCategories = [
    {
      id: "mains",
      name: "Main Courses",
      items: []
    },
    {
      id: "drinks",
      name: "Soft Drinks",
      items: []
    }
  ];

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8">Loading menu...</div>
      ) : (
        <>
          {/* Category Tabs */}
          <div className="flex gap-2 mb-6">
            {menuCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {menuCategories
            .filter(cat => cat.id === activeCategory)
            .map((category) => (
              <div key={category.id}>
                <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                <div className="grid gap-4">
                  {menuItems
                    .filter(item => item.category === category.id || !item.category)
                    .map((item) => (
                      <Card key={item._id} className="shadow-card hover:shadow-hover transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div>
                                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                                <p className="text-muted-foreground mb-2">{item.description}</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-warning text-warning" />
                                    <span>4.5</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>15-20 min</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-primary mb-3">
                                {item.price} ETB
                              </div>
                              {cart[item._id] ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeFromCart(item._id)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-8 text-center">{cart[item._id]}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addToCart(item._id)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item._id)}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}