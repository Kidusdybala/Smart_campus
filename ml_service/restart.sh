#!/bin/bash

echo "🔄 Restarting ML Service with MongoDB connection..."

# Kill any existing ML service processes
pkill -f "python.*app.py" || true
pkill -f "flask.*app.py" || true

# Wait a moment
sleep 2

# Start the ML service
echo "🚀 Starting ML Service..."
cd /path/to/ml_service
python app.py &

echo "✅ ML Service restarted!"
echo "🔍 Check http://localhost:5002/health for connection status"