#!/bin/bash

# LAN Setup Script for WebRTC Multi-Device Testing
# This script helps configure the application for LAN testing

echo "🌐 WebRTC LAN Setup Script"
echo "=========================="

# Get the current machine's LAN IP address
LAN_IP=$(ip route get 1.1.1.1 | awk '{print $7; exit}' 2>/dev/null || hostname -I | awk '{print $1}' 2>/dev/null || echo "192.168.1.100")

echo "📡 Detected LAN IP: $LAN_IP"
echo ""

# Update WebRTC server .env file
echo "🔧 Updating WebRTC server configuration..."
sed -i "s/192\.168\.1\.100/$LAN_IP/g" /workspace/webrtc/.env
echo "✅ Updated webrtc/.env with IP: $LAN_IP"

# Update React client .env file  
echo "🔧 Updating React client configuration..."
sed -i "s/192\.168\.1\.100/$LAN_IP/g" /workspace/client/.env
echo "✅ Updated client/.env with IP: $LAN_IP"

echo ""
echo "🚀 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the WebRTC signaling server:"
echo "   cd /workspace/webrtc && npm start"
echo ""
echo "2. Start the React client:"
echo "   cd /workspace/client && npm start"
echo ""
echo "3. Access from other devices on your LAN:"
echo "   http://$LAN_IP:3000"
echo ""
echo "4. Make sure your firewall allows:"
echo "   - Port 3000 (React app)"
echo "   - Port 4000 (WebRTC signaling)"
echo ""
echo "🔍 Troubleshooting:"
echo "- Check browser console for connection errors"
echo "- Verify both devices are on the same network"
echo "- Try disabling firewall temporarily for testing"