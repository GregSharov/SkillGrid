# WebRTC LAN Multi-Device Testing Troubleshooting Guide

## 🚀 Quick Setup

1. **Run the setup script:**
   ```bash
   ./setup-lan.sh
   ```

2. **Start the servers:**
   ```bash
   # Terminal 1 - WebRTC Signaling Server
   cd /workspace/webrtc
   npm start
   
   # Terminal 2 - React Client
   cd /workspace/client
   npm start
   ```

3. **Access from other devices:**
   - Open browser on any device on your LAN
   - Navigate to: `http://YOUR_LAN_IP:3000`
   - Example: `http://192.168.1.100:3000`

## 🔧 Configuration Files

### WebRTC Server (`/workspace/webrtc/.env`)
```env
NODE_ENV=development
HOST=0.0.0.0
SIGNALING_PORT=4000
FRONTEND_URL=https://YOUR_LAN_IP:3000
FRONT_LOCAL_URL=http://YOUR_LAN_IP:3000
```

### React Client (`/workspace/client/.env`)
```env
REACT_APP_WEBRTC_URL=http://YOUR_LAN_IP:4000
```

## 🐛 Common Issues & Solutions

### 1. "Connection Failed" Error
**Symptoms:** Client can't connect to signaling server
**Solutions:**
- ✅ Verify LAN IP is correct in both `.env` files
- ✅ Check if WebRTC server is running on port 4000
- ✅ Ensure firewall allows port 4000
- ✅ Try accessing `http://YOUR_LAN_IP:4000` directly

### 2. "CORS Error" in Browser Console
**Symptoms:** Browser blocks requests due to CORS policy
**Solutions:**
- ✅ Server CORS is configured for LAN IPs automatically
- ✅ Clear browser cache and reload
- ✅ Try incognito/private browsing mode

### 3. "No Video Stream" Between Devices
**Symptoms:** Connection established but no video/audio
**Solutions:**
- ✅ Check browser console for WebRTC errors
- ✅ Verify camera/microphone permissions
- ✅ Try refreshing both devices
- ✅ Check if devices are on same network segment

### 4. "ICE Connection Failed"
**Symptoms:** WebRTC peer connection fails
**Solutions:**
- ✅ Check firewall settings (allow UDP traffic)
- ✅ Try different STUN servers
- ✅ Verify network allows peer-to-peer connections
- ✅ Check router NAT settings

## 🔍 Debugging Steps

### 1. Check Network Connectivity
```bash
# From device 1, ping device 2
ping DEVICE_2_IP

# Check if ports are accessible
telnet YOUR_LAN_IP 4000
telnet YOUR_LAN_IP 3000
```

### 2. Browser Console Debugging
Open browser DevTools (F12) and check:
- **Console tab:** Look for WebRTC errors
- **Network tab:** Verify signaling server requests
- **Application tab:** Check if camera/mic permissions are granted

### 3. WebRTC Debugging
The app now includes enhanced logging:
- 🔗 ICE Candidate information
- 🧊 ICE Gathering states
- 📡 Connection state changes
- 🎥 Media track information

### 4. Server Logs
Check WebRTC server console for:
- Client connection/disconnection events
- Room join/leave events
- SDP offer/answer relay
- ICE candidate exchange

## 🌐 Network Requirements

### Ports to Open
- **3000:** React development server
- **4000:** WebRTC signaling server
- **UDP (various):** WebRTC media streams (dynamically assigned)

### Firewall Configuration
```bash
# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw allow 4000
sudo ufw allow 3478/udp  # STUN server

# macOS
sudo pfctl -f /etc/pf.conf
```

### Router Configuration
- Ensure devices are on same subnet
- Disable AP isolation if enabled
- Allow peer-to-peer connections

## 📱 Device-Specific Notes

### Mobile Devices
- Use Chrome or Safari (best WebRTC support)
- Grant camera/microphone permissions
- Ensure device is on same WiFi network

### Different Browsers
- **Chrome:** Best WebRTC support
- **Firefox:** Good support, may need different STUN servers
- **Safari:** Good support on iOS/macOS
- **Edge:** Good support on Windows

## 🆘 Still Having Issues?

1. **Check the setup script output** for correct IP detection
2. **Verify environment files** have the right IP addresses
3. **Test with localhost first** to ensure basic functionality
4. **Try different devices** to isolate the problem
5. **Check browser compatibility** and permissions

## 📞 Advanced Debugging

Enable verbose WebRTC logging in Chrome:
1. Go to `chrome://flags/#enable-webrtc-stun-origin`
2. Enable the flag
3. Restart Chrome
4. Check `chrome://webrtc-internals/` for detailed connection info