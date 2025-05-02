# IoT Locator Data

A web-based IoT device management system that tracks and monitors IoT devices using MQTT protocol and displays their location on a map.

## Features

- User Management System
  - Admin login
  - User registration
  - Role-based access control

- Device Management
  - Add new IoT devices
  - Configure MQTT settings
  - Multiple topic subscriptions with descriptions
  - Device location tracking

- Real-time Monitoring
  - Live sensor data display
  - Map-based device visualization
  - Interactive device information

## Project Structure

```
.
├── backend/           # Node.js backend server
├── js/               # Frontend JavaScript files
├── dashboard.html    # Main dashboard interface
├── index.html        # Login page
└── user-management.html # User management interface
```

## Update Log (May 2025)

- Fixed bug where device address (alamatLokasi) could appear as `[object Object]`.
- Backend now always stores `alamatLokasi` as a string, never as an object.
- Frontend now reliably sends the correct string value for device address.
- Device list UI: device address is now displayed with a location pin (📍) and normal font style (not italic).
- Improved reliability for device registration and editing flows.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MQTT Broker (e.g., Mosquitto)
- Web browser (Chrome recommended)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/duwiarsana/iot-locator-data.git
   cd iot-locator-data
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Start the backend server:
   ```bash
   node server.js
   ```

4. Open your web browser and navigate to:
   - Login page: `http://localhost:3000`
   - Dashboard: `http://localhost:3000/dashboard`
   - User Management: `http://localhost:3000/user-management`

## Usage

1. **Login**
   - Access the login page at `http://localhost:3000`
   - Use admin credentials to log in

2. **Device Registration**
   - Click "Add New Device" in the dashboard
   - Fill in device details:
     - Device ID
     - MQTT IP and Port
     - Location coordinates (latitude, longitude)
     - Add multiple MQTT topics with descriptions
   - Click "Register" to save the device

3. **Monitoring**
   - View devices on the map
   - Click on markers to see detailed information
   - Real-time sensor data updates
   - Device location tracking

## Configuration

### Backend Configuration

The backend server uses a SQLite database for user management and device settings. The configuration is handled in `backend/server.js`.

### MQTT Configuration

Devices connect to the MQTT broker using the configured IP and port. The backend server subscribes to the configured topics to receive sensor data.

## Security

- Passwords are hashed before storage
- Admin-only access to device registration and user management
- Secure session management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Leaflet.js for map visualization
- MQTT.js for MQTT protocol implementation
- Tailwind CSS for styling
