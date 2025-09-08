#!/usr/bin/env python3
"""
Startup script for the Python ML Recommendation Service
"""

import os
import sys
from app import app

if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5002))
    print(f"🚀 Starting Python ML Recommendation Service on port {port}")
    print("📊 ML Models: Collaborative Filtering + Time-weighted + Adaptive Learning")
    print("🔗 API Endpoint: http://localhost:{}/recommendations/<user_id>".format(port))

    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.getenv('FLASK_ENV') == 'development'
    )