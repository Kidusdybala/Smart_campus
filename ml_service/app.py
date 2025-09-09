from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import pymongo
from dotenv import load_dotenv
import json
import random
from collections import Counter, defaultdict

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection with retry logic
def get_mongo_client():
    try:
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/smartcampus')
        print(f"🔌 Connecting to MongoDB: {mongo_uri.replace('mongodb+srv://', 'mongodb+srv://[HIDDEN]@')}")

        client = pymongo.MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=10000,  # Increased timeout
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            maxPoolSize=10,
            retryWrites=True,
            retryReads=True
        )

        # Test the connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful - Real-time updates enabled!")
        return client
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("🔄 Falling back to mock data mode - No real-time updates")
        return None

mongo_client = get_mongo_client()
db = mongo_client['smartcampus'] if mongo_client is not None else None

class RecommendationEngine:
    def __init__(self):
        self.food_popularity = Counter()
        self.user_preferences = defaultdict(Counter)
        self.parking_usage = defaultdict(Counter)

    def load_data(self):
        """Load and preprocess data from MongoDB with fallback"""
        if mongo_client is None or db is None:
            print("🔄 Using mock data (MongoDB not available)")
            return self.get_mock_data()

        try:
            # Load orders data
            orders = list(db.orders.find({}))
            users = list(db.users.find({}))
            foods = list(db.foods.find({}))
            parking_reservations = list(db.parking.find({}))

            return {
                'orders': orders,
                'users': users,
                'foods': foods,
                'parking': parking_reservations
            }
        except Exception as e:
            print(f"❌ Error loading data from MongoDB: {e}")
            print("🔄 Falling back to mock data")
            return self.get_mock_data()

    def get_mock_data(self):
        """Provide mock data when MongoDB is not available"""
        return {
            'orders': [
                {
                    '_id': 'mock_order_1',
                    'user': '68bd8f2c29d488d84d5e10da',
                    'items': [
                        {'food': 'mock_food_1', 'quantity': 2},
                        {'food': 'mock_food_2', 'quantity': 1}
                    ],
                    'orderedAt': datetime.now().isoformat(),
                    'status': 'ready'
                }
            ],
            'users': [
                {
                    '_id': '68bd8f2c29d488d84d5e10da',
                    'name': 'Test Student',
                    'email': 'student@university.edu',
                    'role': 'student'
                }
            ],
            'foods': [
                {
                    '_id': 'mock_food_1',
                    'name': 'Doro Wat',
                    'price': 250,
                    'category': 'Main Course',
                    'available': True
                },
                {
                    '_id': 'mock_food_2',
                    'name': 'Shiro',
                    'price': 150,
                    'category': 'Main Course',
                    'available': True
                },
                {
                    '_id': 'mock_food_3',
                    'name': 'Coca Cola',
                    'price': 25,
                    'category': 'Beverage',
                    'available': True
                }
            ],
            'parking': [
                {
                    '_id': 'mock_parking_1',
                    'slot': '11',  # User's most frequently used spot (5 reservations)
                    'user': '68bd8f2c29d488d84d5e10da',
                    'status': 'reserved',
                    'reservedAt': (datetime.now() - timedelta(hours=2)).isoformat()
                },
                {
                    '_id': 'mock_parking_2',
                    'slot': '11',  # Another reservation for spot 11
                    'user': '68bd8f2c29d488d84d5e10da',
                    'status': 'occupied',
                    'occupiedAt': (datetime.now() - timedelta(hours=24)).isoformat()
                },
                {
                    '_id': 'mock_parking_3',
                    'slot': '11',  # Third reservation for spot 11
                    'user': '68bd8f2c29d488d84d5e10da',
                    'status': 'reserved',
                    'reservedAt': (datetime.now() - timedelta(hours=48)).isoformat()
                },
                {
                    '_id': 'mock_parking_4',
                    'slot': '11',  # Fourth reservation for spot 11
                    'user': '68bd8f2c29d488d84d5e10da',
                    'status': 'occupied',
                    'occupiedAt': (datetime.now() - timedelta(hours=72)).isoformat()
                },
                {
                    '_id': 'mock_parking_5',
                    'slot': '11',  # Fifth reservation for spot 11
                    'user': '68bd8f2c29d488d84d5e10da',
                    'status': 'reserved',
                    'reservedAt': (datetime.now() - timedelta(hours=96)).isoformat()
                },
                {
                    '_id': 'mock_parking_6',
                    'slot': '3',  # Less frequently used (2 reservations)
                    'user': '68bd8f2c29d488d84d5e10da',
                    'status': 'occupied',
                    'occupiedAt': (datetime.now() - timedelta(hours=12)).isoformat()
                },
                {
                    '_id': 'mock_parking_7',
                    'slot': '3',  # Second reservation for spot 3
                    'user': '68bd8f2c29d488d84d5e10da',
                    'status': 'reserved',
                    'reservedAt': (datetime.now() - timedelta(hours=120)).isoformat()
                },
                {
                    '_id': 'mock_parking_8',
                    'slot': 'A-02',  # Least frequently used (1 reservation)
                    'user': '68bd8f2c29d488d84d5e10da',
                    'status': 'occupied',
                    'occupiedAt': (datetime.now() - timedelta(hours=168)).isoformat()
                }
            ]
        }


    def analyze_data(self, orders, parking_data):
        """Analyze order and parking data for recommendations"""
        # Reset counters
        self.food_popularity.clear()
        self.user_preferences.clear()
        self.parking_usage.clear()

        # Analyze food popularity and user preferences
        for order in orders:
            user_id = str(order.get('user', ''))
            if user_id:
                for item in order.get('items', []):
                    food_id = str(item.get('food', ''))
                    quantity = item.get('quantity', 1)

                    self.food_popularity[food_id] += quantity
                    self.user_preferences[user_id][food_id] += quantity

        # Analyze parking usage
        for reservation in parking_data:
            user_id = str(reservation.get('user', ''))
            slot = reservation.get('slot', '')
            if user_id and slot:
                self.parking_usage[user_id][slot] += 1

        return True

    def get_popular_recommendations(self, user_id, foods_data, top_n=3):
        """Get recommendations based on popularity and user preferences"""
        user_id = str(user_id)
        user_ordered_foods = set(self.user_preferences.get(user_id, {}).keys())

        # Get most popular foods that user hasn't ordered
        recommendations = []
        for food_id, popularity in self.food_popularity.most_common():
            if food_id not in user_ordered_foods:
                food_doc = next((f for f in foods_data if str(f.get('_id')) == food_id), None)
                if food_doc:
                    recommendations.append({
                        'id': food_id,
                        'name': food_doc.get('name', 'Unknown'),
                        'price': food_doc.get('price', 0),
                        'score': popularity,
                        'reason': 'Popular among students'
                    })
                    if len(recommendations) >= top_n:
                        break

        return recommendations

    def calculate_time_weights(self, orders):
        """Calculate time-weighted scores for orders"""
        now = datetime.now()

        for order in orders:
            order_date = order.get('orderedAt', now)
            if isinstance(order_date, str):
                order_date = datetime.fromisoformat(order_date.replace('Z', '+00:00'))

            days_diff = (now - order_date).days
            # Exponential decay: recent orders have higher weight
            time_weight = np.exp(-days_diff / 30)  # Half weight after 30 days

            order['time_weight'] = time_weight

        return orders

    def analyze_trends(self, user_id, orders):
        """Analyze user behavior trends"""
        if not orders:
            return {'food_trends': {}, 'parking_trends': {}, 'has_recent_activity': False}

        now = datetime.now()
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)

        # Helper function to parse datetime
        def parse_datetime(date_value):
            if isinstance(date_value, str):
                try:
                    return datetime.fromisoformat(date_value.replace('Z', '+00:00'))
                except:
                    return now
            elif isinstance(date_value, datetime):
                return date_value
            else:
                return now

        # Separate orders by time periods
        recent_orders = [o for o in orders if parse_datetime(o.get('orderedAt', now)) > seven_days_ago]
        older_orders = [o for o in orders if seven_days_ago >= parse_datetime(o.get('orderedAt', now)) > thirty_days_ago]

        # Analyze food trends
        food_trends = {}
        recent_food_counts = {}
        older_food_counts = {}

        # Count foods in recent orders
        for order in recent_orders:
            for item in order.get('items', []):
                food_id = str(item['food'])
                recent_food_counts[food_id] = recent_food_counts.get(food_id, 0) + item.get('quantity', 1)

        # Count foods in older orders
        for order in older_orders:
            for item in order.get('items', []):
                food_id = str(item['food'])
                older_food_counts[food_id] = older_food_counts.get(food_id, 0) + item.get('quantity', 1)

        # Calculate trends
        for food_id in set(list(recent_food_counts.keys()) + list(older_food_counts.keys())):
            recent_count = recent_food_counts.get(food_id, 0)
            older_count = older_food_counts.get(food_id, 0)

            if older_count > 0:
                trend = (recent_count - older_count) / older_count
            else:
                trend = 1.0 if recent_count > 0 else 0.0

            food_trends[food_id] = trend

        return {
            'food_trends': food_trends,
            'has_recent_activity': len(recent_orders) > 0,
            'trend_period': '7_days'
        }

    def get_personal_recommendations(self, user_id, orders, trends, foods_data, top_n=3):
        """Get personalized recommendations based on user's history and trends"""
        if not orders:
            return []

        # Calculate frequency and apply time weights
        food_scores = {}

        for order in orders:
            time_weight = order.get('time_weight', 1.0)
            for item in order.get('items', []):
                food_id = str(item['food'])
                quantity = item.get('quantity', 1)

                if food_id not in food_scores:
                    # Find food details from foods data instead of database query
                    food_doc = next((f for f in foods_data if str(f.get('_id')) == food_id), None)
                    if food_doc:
                        food_scores[food_id] = {
                            'id': food_id,
                            'name': food_doc.get('name', 'Unknown'),
                            'price': food_doc.get('price', 0),
                            'weighted_score': 0,
                            'total_orders': 0,
                            'reason': 'Based on your order history'
                        }

                if food_id in food_scores:
                    food_scores[food_id]['weighted_score'] += quantity * time_weight
                    food_scores[food_id]['total_orders'] += 1

        # Apply trend adjustments
        for food_id, food_data in food_scores.items():
            trend = trends['food_trends'].get(food_id, 0)

            if trend > 0.5:  # Significant increase
                food_data['weighted_score'] *= (1 + trend * 0.3)
                food_data['reason'] = 'Trending up in your recent orders'
            elif trend < -0.5:  # Significant decrease
                food_data['weighted_score'] *= 0.7
                food_data['reason'] = 'Less frequent in recent orders'

        # Sort and return top recommendations
        sorted_foods = sorted(food_scores.values(), key=lambda x: x['weighted_score'], reverse=True)
        return sorted_foods[:top_n]

# Initialize recommendation engine
engine = RecommendationEngine()

@app.route('/health', methods=['GET'])
def health_check():
    mongo_status = "connected" if mongo_client is not None and db is not None else "disconnected"
    return jsonify({
        'status': 'healthy',
        'service': 'ml_recommendation_engine',
        'mongodb': mongo_status,
        'real_time_updates': mongo_status == "connected"
    })

@app.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    try:
        # Load fresh data
        data = engine.load_data()
        if not data:
            return jsonify({'error': 'Could not load data'}), 500

        # Analyze the data
        engine.analyze_data(data['orders'], data['parking'])

        # Get user's orders and calculate time weights
        user_orders = [o for o in data['orders'] if str(o.get('user')) == user_id]
        user_orders = engine.calculate_time_weights(user_orders)

        # Analyze trends
        trends = engine.analyze_trends(user_id, user_orders)

        # Get personal recommendations
        personal_recs = engine.get_personal_recommendations(user_id, user_orders, trends, data['foods'])

        # Get popular recommendations
        collaborative_recs = engine.get_popular_recommendations(user_id, data['foods'])
        
        # Combine recommendations
        all_food_recs = personal_recs + collaborative_recs

        # Remove duplicates and sort
        food_recommendations = {}
        for rec in all_food_recs:
            food_id = rec['id']
            if food_id not in food_recommendations:
                food_recommendations[food_id] = rec
            else:
                # If collaborative score exists, boost the recommendation
                if 'Popular among similar users' in rec.get('reason', ''):
                    food_recommendations[food_id]['weighted_score'] = (
                        food_recommendations[food_id].get('weighted_score', 0) +
                        rec.get('score', 0) * 0.5
                    )
                    food_recommendations[food_id]['reason'] = 'Your favorite + popular among similar users'

        # Sort final recommendations and add reasons
        final_food_recs = []
        for rec in sorted(food_recommendations.values(),
                         key=lambda x: x.get('weighted_score', x.get('score', 0)),
                         reverse=True)[:3]:
            rec_copy = rec.copy()
            if 'Popular among similar users' in rec.get('reason', ''):
                rec_copy['reason'] = 'Popular among similar students'
            elif rec.get('total_orders', 0) > 1:
                rec_copy['reason'] = f'Ordered {rec["total_orders"]} times'
            else:
                rec_copy['reason'] = 'Based on your order history'
            final_food_recs.append(rec_copy)

        # Get parking recommendations based on frequency
        parking_recs = []
        user_parking = [p for p in data['parking'] if str(p.get('user')) == user_id and p.get('status') in ['reserved', 'occupied']]

        if user_parking:
            parking_freq = {}
            for reservation in user_parking:
                slot = reservation.get('slot')
                if slot:
                    parking_freq[slot] = parking_freq.get(slot, 0) + 1

            sorted_parking = sorted(parking_freq.items(), key=lambda x: x[1], reverse=True)
            for slot, count in sorted_parking[:3]:
                parking_recs.append({
                    'slot': slot,
                    'score': count,
                    'reason': f'Reserved {count} times' if count > 1 else 'Your preferred spot'
                })
        else:
            # Fallback parking recommendations from mock data
            parking_recs = [
                {
                    'slot': 'A-02',
                    'score': 2,
                    'reason': 'Your preferred spot'
                }
            ]

        return jsonify({
            'foods': final_food_recs,
            'parking': parking_recs,
            'lastUpdated': datetime.now().isoformat(),
            'algorithm': 'python_rule_based',
            'trends': trends
        })

    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/train', methods=['POST'])
def train_models():
    """Endpoint to retrain ML models"""
    try:
        data = engine.load_data()
        if not data:
            return jsonify({'error': 'Could not load data'}), 500

        success = engine.analyze_data(data['orders'], data['parking'])

        return jsonify({
            'status': 'success',
            'message': 'Data analyzed successfully',
            'orders_count': len(data['orders']),
            'foods_count': len(data['foods'])
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)