#!/usr/bin/env python3
"""
ML Service Connection Checker
Verifies MongoDB connection and real-time update capability
"""

import requests
import json
import sys

def check_ml_service():
    """Check if ML service is running and connected to MongoDB"""
    try:
        # Check health endpoint
        health_response = requests.get('http://localhost:5002/health', timeout=5)
        health_data = health_response.json()

        print("🔍 ML Service Health Check:")
        print(f"   Status: {health_data.get('status', 'unknown')}")
        print(f"   MongoDB: {health_data.get('mongodb', 'unknown')}")
        print(f"   Real-time Updates: {health_data.get('real_time_updates', False)}")

        if health_data.get('mongodb') == 'connected':
            print("✅ SUCCESS: ML Service is connected to MongoDB!")
            print("🎯 Real-time learning is ENABLED")
            return True
        else:
            print("❌ WARNING: ML Service is using mock data")
            print("🔄 Real-time learning is DISABLED")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ ERROR: Cannot connect to ML Service: {e}")
        print("💡 Make sure ML Service is running on port 5002")
        return False

def test_recommendations():
    """Test if recommendations are working with real data"""
    try:
        # Test with a sample user ID
        test_user_id = "507f1f77bcf86cd799439011"  # Sample MongoDB ObjectId
        response = requests.get(f'http://localhost:5002/recommendations/{test_user_id}', timeout=10)

        if response.status_code == 200:
            data = response.json()
            print("\n📊 Recommendation Test Results:")
            print(f"   Foods: {len(data.get('foods', []))} recommendations")
            print(f"   Parking: {len(data.get('parking', []))} recommendations")
            print(f"   Algorithm: {data.get('algorithm', 'unknown')}")

            if data.get('algorithm') != 'fallback_basic':
                print("✅ SUCCESS: Using real ML algorithms!")
                return True
            else:
                print("⚠️  INFO: Using fallback algorithm (limited functionality)")
                return False
        else:
            print(f"❌ ERROR: Recommendation API returned {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ ERROR: Cannot test recommendations: {e}")
        return False

if __name__ == "__main__":
    print("🚀 ML Service Connection Checker")
    print("=" * 50)

    # Check service health
    connected = check_ml_service()

    if connected:
        # Test recommendations
        test_recommendations()

    print("\n" + "=" * 50)
    if connected:
        print("🎉 ML Service is READY for real-time learning!")
        print("📈 Recommendations will update automatically based on user behavior")
    else:
        print("⚠️  ML Service needs MongoDB connection for real-time learning")
        print("🔧 Update MONGO_URI in ml_service/.env and restart the service")

    sys.exit(0 if connected else 1)