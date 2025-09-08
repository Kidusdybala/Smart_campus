const express = require('express');
const { auth } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Python ML service configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5002';

// Simple in-memory cache for recommendations
const recommendationsCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Check if cache is valid
function isCacheValid(cacheEntry) {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
}

// Get cached recommendations
function getCachedRecommendations(userId) {
  const cacheKey = `rec_${userId}`;
  const cached = recommendationsCache.get(cacheKey);

  if (isCacheValid(cached)) {
    return cached.data;
  }

  return null;
}

// Set cached recommendations
function setCachedRecommendations(userId, recommendations) {
  const cacheKey = `rec_${userId}`;
  recommendationsCache.set(cacheKey, {
    data: recommendations,
    timestamp: Date.now()
  });
}

// Clear cache for user (useful when user makes new orders/reservations)
function clearUserCache(userId) {
  const cacheKey = `rec_${userId}`;
  recommendationsCache.delete(cacheKey);
}

// Call Python ML service
async function getMLRecommendations(userId) {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/recommendations/${userId}`, {
      timeout: 10000 // 10 second timeout
    });
    return response.data;
  } catch (error) {
    console.error('Error calling Python ML service:', error.message);
    // Fallback to basic recommendations if ML service is down
    return await getFallbackRecommendations(userId);
  }
}

// Fallback recommendations when Python service is unavailable
async function getFallbackRecommendations(userId) {
  try {
    const { Order } = require('../models/Food');
    const Parking = require('../models/Parking');

    // Get user's recent orders
    const orders = await Order.find({ user: userId })
      .populate('items.food')
      .sort({ orderedAt: -1 })
      .limit(10);

    // Simple frequency-based recommendations
    const foodFrequency = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const foodId = item.food._id.toString();
        if (foodFrequency[foodId]) {
          foodFrequency[foodId].count += item.quantity;
        } else {
          foodFrequency[foodId] = {
            id: foodId,
            name: item.food.name,
            price: item.food.price,
            count: item.quantity
          };
        }
      });
    });

    const topFoods = Object.values(foodFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Get parking recommendations
    const parkingReservations = await Parking.find({
      user: userId,
      status: { $in: ['reserved', 'occupied'] }
    }).sort({ reservedAt: -1 }).limit(10);

    const parkingFrequency = {};
    parkingReservations.forEach(reservation => {
      const slot = reservation.slot;
      if (parkingFrequency[slot]) {
        parkingFrequency[slot].count += 1;
      } else {
        parkingFrequency[slot] = {
          slot: slot,
          count: 1
        };
      }
    });

    let topParking = Object.values(parkingFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // If no parking data, try to get user's actual parking history
    if (topParking.length === 0) {
      try {
        const userParkingHistory = await Parking.find({
          user: userId,
          status: { $in: ['reserved', 'occupied'] }
        }).sort({ reservedAt: -1 }).limit(10);

        if (userParkingHistory.length > 0) {
          // Use user's actual parking history
          const parkingFreq = {};
          userParkingHistory.forEach(reservation => {
            const slot = reservation.slot;
            if (slot) {
              parkingFreq[slot] = (parkingFreq[slot] || 0) + 1;
            }
          });

          console.log(`User ${userId} parking history:`, parkingFreq);

          const sortedUserParking = Object.entries(parkingFreq)
            .sort(([,a], [,b]) => b - a)
            .map(([slot, count]) => ({
              slot: slot,
              count: count,
              reason: 'Based on your reservation history'
            }));

          console.log(`Top parking recommendations for user ${userId}:`, sortedUserParking.slice(0, 3));

          topParking = sortedUserParking.slice(0, 3);
        } else {
          // Fallback to popular spots
          topParking = [
            {
              slot: 'A-02',
              count: 1,
              reason: 'Popular campus spot'
            }
          ];
        }
      } catch (parkingError) {
        console.error('Error fetching user parking history:', parkingError);
        topParking = [
          {
            slot: 'A-02',
            count: 1,
            reason: 'Popular campus spot'
          }
        ];
      }
    }

    // Add reasons to recommendations
    const foodsWithReasons = topFoods.map(food => ({
      ...food,
      reason: food.count > 1 ? `Ordered ${food.count} times` : 'Your recent order'
    }));

    const parkingWithReasons = topParking.map(spot => ({
      ...spot,
      reason: 'Your preferred spot'
    }));

    return {
      foods: foodsWithReasons,
      parking: parkingWithReasons,
      lastUpdated: new Date(),
      algorithm: 'fallback_basic',
      service_status: 'python_ml_unavailable'
    };
  } catch (error) {
    console.error('Fallback recommendations error:', error);
    return {
      foods: [],
      parking: [],
      error: 'Unable to generate recommendations'
    };
  }
}

// Adaptive learning: Analyze trends in user behavior
async function analyzeUserTrends(userId, orders, parkingReservations) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Analyze recent vs older orders
    const recentOrders = orders.filter(order => new Date(order.orderedAt) > sevenDaysAgo);
    const olderOrders = orders.filter(order => new Date(order.orderedAt) <= sevenDaysAgo && new Date(order.orderedAt) > thirtyDaysAgo);

    // Detect food preference changes
    const recentFoodPrefs = {};
    const olderFoodPrefs = {};

    recentOrders.forEach(order => {
      order.items.forEach(item => {
        const foodId = item.food._id.toString();
        recentFoodPrefs[foodId] = (recentFoodPrefs[foodId] || 0) + item.quantity;
      });
    });

    olderOrders.forEach(order => {
      order.items.forEach(item => {
        const foodId = item.food._id.toString();
        olderFoodPrefs[foodId] = (olderFoodPrefs[foodId] || 0) + item.quantity;
      });
    });

    // Calculate trend scores (positive = increasing preference, negative = decreasing)
    const foodTrends = {};
    Object.keys(recentFoodPrefs).forEach(foodId => {
      const recentCount = recentFoodPrefs[foodId];
      const olderCount = olderFoodPrefs[foodId] || 0;
      const trend = olderCount > 0 ? (recentCount - olderCount) / olderCount : recentCount > 0 ? 1 : 0;
      foodTrends[foodId] = trend;
    });

    // Analyze parking trends
    const recentParking = parkingReservations.filter(res => new Date(res.reservedAt || res.occupiedAt) > sevenDaysAgo);
    const olderParking = parkingReservations.filter(res =>
      new Date(res.reservedAt || res.occupiedAt) <= sevenDaysAgo &&
      new Date(res.reservedAt || res.occupiedAt) > thirtyDaysAgo
    );

    const recentParkingPrefs = {};
    const olderParkingPrefs = {};

    recentParking.forEach(res => {
      recentParkingPrefs[res.slot] = (recentParkingPrefs[res.slot] || 0) + 1;
    });

    olderParking.forEach(res => {
      olderParkingPrefs[res.slot] = (olderParkingPrefs[res.slot] || 0) + 1;
    });

    const parkingTrends = {};
    Object.keys(recentParkingPrefs).forEach(slot => {
      const recentCount = recentParkingPrefs[slot];
      const olderCount = olderParkingPrefs[slot] || 0;
      const trend = olderCount > 0 ? (recentCount - olderCount) / olderCount : recentCount > 0 ? 1 : 0;
      parkingTrends[slot] = trend;
    });

    return {
      foodTrends,
      parkingTrends,
      hasRecentActivity: recentOrders.length > 0 || recentParking.length > 0,
      trendPeriod: '7_days'
    };
  } catch (err) {
    console.error('Error analyzing user trends:', err);
    return { foodTrends: {}, parkingTrends: {}, hasRecentActivity: false };
  }
}

// Apply adaptive learning to recommendations
function applyAdaptiveLearning(baseRecommendations, trends) {
  const adapted = { ...baseRecommendations };

  // Boost recommendations for trending items
  adapted.foods = adapted.foods.map(food => {
    const trend = trends.foodTrends[food.id] || 0;
    if (trend > 0.5) { // Significant increase in preference
      return {
        ...food,
        weightedCount: (food.weightedCount || food.score) * (1 + trend * 0.3),
        reason: 'Trending up in your recent orders'
      };
    } else if (trend < -0.5) { // Significant decrease
      return {
        ...food,
        weightedCount: (food.weightedCount || food.score) * 0.7, // Reduce weight
        reason: 'Less frequent in recent orders'
      };
    }
    return food;
  });

  adapted.parking = adapted.parking.map(spot => {
    const trend = trends.parkingTrends[spot.slot] || 0;
    if (trend > 0.5) {
      return {
        ...spot,
        weightedCount: (spot.weightedCount || spot.score) * (1 + trend * 0.3),
        reason: 'Trending up in your recent reservations'
      };
    } else if (trend < -0.5) {
      return {
        ...spot,
        weightedCount: (spot.weightedCount || spot.score) * 0.7,
        reason: 'Less frequent in recent reservations'
      };
    }
    return spot;
  });

  // Re-sort after applying trends
  adapted.foods.sort((a, b) => (b.weightedCount || b.score) - (a.weightedCount || a.score));
  adapted.parking.sort((a, b) => (b.weightedCount || b.score) - (a.weightedCount || a.score));

  return adapted;
}

// Time-weighted scoring function
function calculateTimeWeight(orderDate) {
  const now = new Date();
  const orderTime = new Date(orderDate);
  const daysDiff = (now - orderTime) / (1000 * 60 * 60 * 24);

  // Exponential decay: recent orders have higher weight
  // Weight = e^(-daysDiff/30) - gives half weight after 30 days
  return Math.exp(-daysDiff / 30);
}

// Find similar users based on order patterns
async function findSimilarUsers(userId, limit = 5) {
  try {
    // Get current user's order history
    const userOrders = await Order.find({ user: userId }).populate('items.food');
    const userFoodPreferences = new Set();

    userOrders.forEach(order => {
      order.items.forEach(item => {
        userFoodPreferences.add(item.food._id.toString());
      });
    });

    // Find other users with similar order patterns
    const allUsers = await Order.distinct('user', { user: { $ne: userId } });
    const userSimilarities = [];

    for (const otherUserId of allUsers) {
      const otherUserOrders = await Order.find({ user: otherUserId }).populate('items.food');
      const otherUserFoods = new Set();

      otherUserOrders.forEach(order => {
        order.items.forEach(item => {
          otherUserFoods.add(item.food._id.toString());
        });
      });

      // Calculate Jaccard similarity
      const intersection = new Set([...userFoodPreferences].filter(x => otherUserFoods.has(x)));
      const union = new Set([...userFoodPreferences, ...otherUserFoods]);
      const similarity = intersection.size / union.size;

      if (similarity > 0.1) { // Only consider users with some similarity
        userSimilarities.push({
          userId: otherUserId,
          similarity: similarity,
          commonFoods: intersection.size
        });
      }
    }

    // Return top similar users
    return userSimilarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (err) {
    console.error('Error finding similar users:', err);
    return [];
  }
}

// Get collaborative recommendations
async function getCollaborativeRecommendations(userId, userOrderedFoods) {
  try {
    const similarUsers = await findSimilarUsers(userId);
    const recommendedFoods = {};
    const recommendedParking = {};

    for (const similarUser of similarUsers) {
      // Get foods ordered by similar users but not by current user
      const similarUserOrders = await Order.find({ user: similarUser.userId })
        .populate('items.food')
        .sort({ orderedAt: -1 })
        .limit(10);

      similarUserOrders.forEach(order => {
        order.items.forEach(item => {
          const foodId = item.food._id.toString();
          if (!userOrderedFoods.has(foodId)) {
            const weight = similarUser.similarity * calculateTimeWeight(order.orderedAt);

            if (recommendedFoods[foodId]) {
              recommendedFoods[foodId].score += weight * item.quantity;
            } else {
              recommendedFoods[foodId] = {
                id: foodId,
                name: item.food.name,
                price: item.food.price,
                image: item.food.image,
                score: weight * item.quantity,
                reason: 'Popular among similar users'
              };
            }
          }
        });
      });

      // Get parking spots used by similar users
      const similarUserParking = await Parking.find({
        user: similarUser.userId,
        status: { $in: ['reserved', 'occupied'] }
      }).sort({ reservedAt: -1 }).limit(10);

      similarUserParking.forEach(reservation => {
        const slot = reservation.slot;
        const weight = similarUser.similarity * calculateTimeWeight(reservation.reservedAt);

        if (recommendedParking[slot]) {
          recommendedParking[slot].score += weight;
        } else {
          recommendedParking[slot] = {
            slot: slot,
            score: weight,
            reason: 'Popular among similar users'
          };
        }
      });
    }

    // Add reasons to collaborative recommendations
    const collaborativeFoods = Object.values(recommendedFoods)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(food => ({
        ...food,
        reason: 'Popular among similar students'
      }));

    const collaborativeParking = Object.values(recommendedParking)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(spot => ({
        ...spot,
        reason: 'Popular among similar students'
      }));

    // Add reasons to collaborative parking recommendations
    const collaborativeParkingWithReasons = collaborativeParking.map(spot => ({
      ...spot,
      reason: 'Your preferred spot'
    }));

    return {
      foods: collaborativeFoods,
      parking: collaborativeParkingWithReasons
    };
  } catch (err) {
    console.error('Error getting collaborative recommendations:', err);
    return { foods: [], parking: [] };
  }
}

// Get recommendations for user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check cache first
    const cachedRecommendations = getCachedRecommendations(userId);
    if (cachedRecommendations) {
      return res.json({
        ...cachedRecommendations,
        cached: true,
        cacheAge: Date.now() - new Date(cachedRecommendations.lastUpdated).getTime()
      });
    }

    // Get recommendations from Python ML service
    const recommendations = await getMLRecommendations(userId);

    // Cache the recommendations
    setCachedRecommendations(userId, recommendations);

    res.json(recommendations);
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.clearUserCache = clearUserCache;