# Smart Home IoT System - API Endpoints Documentation

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.yourdomain.com/api/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci...",
      "expiresIn": 3600
    }
  }
}
```

---

### Login
**POST** `/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci...",
      "expiresIn": 3600
    }
  }
}
```

---

### Refresh Token
**POST** `/auth/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "expiresIn": 3600
  }
}
```

---

### Get Current User
**GET** `/auth/me`

Get currently authenticated user details.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Logout
**POST** `/auth/logout`

Invalidate current refresh token.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## 🏠 Room Endpoints

### Get All Rooms
**GET** `/rooms`

Retrieve all rooms for the authenticated user.

**Headers:** 
- Authorization: Bearer token required

**Query Parameters:**
- `search` (optional): Search rooms by name
- `sortBy` (optional): Sort by field (name, createdAt)
- `order` (optional): asc or desc

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Living Room",
      "description": "Main living area",
      "deviceCount": 5,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Create Room
**POST** `/rooms`

Create a new room.

**Headers:** 
- Authorization: Bearer token required

**Request Body:**
```json
{
  "name": "Living Room",
  "description": "Main living area"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Living Room",
    "description": "Main living area",
    "deviceCount": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Get Room by ID
**GET** `/rooms/:roomId`

Get detailed information about a specific room.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Living Room",
    "description": "Main living area",
    "devices": [
      {
        "id": "device-uuid",
        "name": "Smart Light",
        "type": "light",
        "isOnline": true
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Update Room
**PUT** `/rooms/:roomId`

Update room details.

**Headers:** 
- Authorization: Bearer token required

**Request Body:**
```json
{
  "name": "Updated Living Room",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Living Room",
    "description": "Updated description",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Delete Room
**DELETE** `/rooms/:roomId`

Delete a room (devices will be unassigned).

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Room deleted successfully"
}
```

---

## 📱 Device Endpoints

### Get All Devices
**GET** `/devices`

Retrieve all devices for the authenticated user.

**Headers:** 
- Authorization: Bearer token required

**Query Parameters:**
- `roomId` (optional): Filter by room
- `type` (optional): Filter by device type (light, sensor, lock, etc.)
- `status` (optional): Filter by status (online, offline, all)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "uuid",
        "name": "Living Room Light",
        "type": "light",
        "roomId": "room-uuid",
        "roomName": "Living Room",
        "isOnline": true,
        "lastSeen": "2024-01-01T00:00:00Z",
        "state": {
          "power": "on",
          "brightness": 75
        },
        "metadata": {
          "manufacturer": "Philips",
          "model": "Hue A19"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

---

### Register Device
**POST** `/devices`

Register a new IoT device.

**Headers:** 
- Authorization: Bearer token required

**Request Body:**
```json
{
  "name": "Living Room Light",
  "type": "light",
  "roomId": "room-uuid",
  "description": "Main ceiling light",
  "metadata": {
    "manufacturer": "Philips",
    "model": "Hue A19",
    "macAddress": "00:11:22:33:44:55"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Living Room Light",
    "type": "light",
    "roomId": "room-uuid",
    "mqttTopic": "home/devices/uuid",
    "apiKey": "device_api_key_here",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Get Device by ID
**GET** `/devices/:deviceId`

Get detailed information about a specific device.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Living Room Light",
    "type": "light",
    "roomId": "room-uuid",
    "roomName": "Living Room",
    "isOnline": true,
    "lastSeen": "2024-01-01T00:00:00Z",
    "state": {
      "power": "on",
      "brightness": 75,
      "color": "#FFFFFF"
    },
    "metadata": {
      "manufacturer": "Philips",
      "model": "Hue A19"
    },
    "capabilities": ["power", "brightness", "color"],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Update Device
**PUT** `/devices/:deviceId`

Update device information.

**Headers:** 
- Authorization: Bearer token required

**Request Body:**
```json
{
  "name": "Updated Light Name",
  "roomId": "new-room-uuid",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Light Name",
    "roomId": "new-room-uuid",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Delete Device
**DELETE** `/devices/:deviceId`

Unregister and delete a device.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Device deleted successfully"
}
```

---

### Control Device
**POST** `/devices/:deviceId/control`

Send control commands to a device.

**Headers:** 
- Authorization: Bearer token required

**Request Body (Light):**
```json
{
  "action": "setState",
  "params": {
    "power": "on",
    "brightness": 80,
    "color": "#FF5733"
  }
}
```

**Request Body (Thermostat):**
```json
{
  "action": "setTemperature",
  "params": {
    "target": 22,
    "mode": "heat"
  }
}
```

**Request Body (Lock):**
```json
{
  "action": "lock",
  "params": {}
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "deviceId": "uuid",
    "action": "setState",
    "status": "executed",
    "newState": {
      "power": "on",
      "brightness": 80
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

### Get Device Telemetry
**GET** `/devices/:deviceId/telemetry`

Get current telemetry data from a device.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "deviceId": "uuid",
    "telemetry": [
      {
        "metric": "temperature",
        "value": 22.5,
        "unit": "°C",
        "timestamp": "2024-01-01T00:00:00Z"
      },
      {
        "metric": "humidity",
        "value": 45,
        "unit": "%",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 📊 Sensor Data Endpoints

### Get Sensor History
**GET** `/sensors/:deviceId/history`

Get historical sensor data.

**Headers:** 
- Authorization: Bearer token required

**Query Parameters:**
- `startTime` (required): ISO 8601 timestamp
- `endTime` (required): ISO 8601 timestamp
- `metric` (optional): Specific metric name
- `interval` (optional): Aggregation interval (1m, 5m, 1h, 1d)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "deviceId": "uuid",
    "metric": "temperature",
    "interval": "1h",
    "dataPoints": [
      {
        "timestamp": "2024-01-01T00:00:00Z",
        "value": 22.5,
        "unit": "°C"
      },
      {
        "timestamp": "2024-01-01T01:00:00Z",
        "value": 22.8,
        "unit": "°C"
      }
    ]
  }
}
```

---

### Get Sensor Statistics
**GET** `/sensors/:deviceId/stats`

Get statistical summary of sensor data.

**Headers:** 
- Authorization: Bearer token required

**Query Parameters:**
- `startTime` (required): ISO 8601 timestamp
- `endTime` (required): ISO 8601 timestamp
- `metric` (required): Metric name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "deviceId": "uuid",
    "metric": "temperature",
    "period": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-02T00:00:00Z"
    },
    "statistics": {
      "min": 18.5,
      "max": 24.3,
      "avg": 21.8,
      "median": 22.0,
      "stdDev": 1.2,
      "count": 288
    },
    "unit": "°C"
  }
}
```

---

### Get Latest Sensor Reading
**GET** `/sensors/:deviceId/latest`

Get the most recent sensor reading.

**Headers:** 
- Authorization: Bearer token required

**Query Parameters:**
- `metric` (optional): Specific metric name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "deviceId": "uuid",
    "readings": [
      {
        "metric": "temperature",
        "value": 22.5,
        "unit": "°C",
        "timestamp": "2024-01-01T00:00:00Z"
      },
      {
        "metric": "humidity",
        "value": 45,
        "unit": "%",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 🤖 Automation Endpoints

### Get All Automations
**GET** `/automations`

Retrieve all automation rules.

**Headers:** 
- Authorization: Bearer token required

**Query Parameters:**
- `active` (optional): Filter by active status (true/false)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Turn on lights at sunset",
      "description": "Automatically turn on living room lights",
      "isActive": true,
      "trigger": {
        "type": "time",
        "condition": "sunset"
      },
      "actions": [
        {
          "deviceId": "device-uuid",
          "action": "setState",
          "params": {
            "power": "on",
            "brightness": 60
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Create Automation
**POST** `/automations`

Create a new automation rule.

**Headers:** 
- Authorization: Bearer token required

**Request Body (Time-based):**
```json
{
  "name": "Morning routine",
  "description": "Turn on lights and adjust thermostat",
  "trigger": {
    "type": "time",
    "time": "07:00",
    "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
  },
  "actions": [
    {
      "deviceId": "light-uuid",
      "action": "setState",
      "params": {
        "power": "on",
        "brightness": 80
      }
    },
    {
      "deviceId": "thermostat-uuid",
      "action": "setTemperature",
      "params": {
        "target": 22
      }
    }
  ]
}
```

**Request Body (Sensor-based):**
```json
{
  "name": "Turn on AC when hot",
  "description": "Activate AC when temperature exceeds threshold",
  "trigger": {
    "type": "sensor",
    "deviceId": "sensor-uuid",
    "metric": "temperature",
    "operator": ">",
    "value": 28
  },
  "actions": [
    {
      "deviceId": "ac-uuid",
      "action": "setState",
      "params": {
        "power": "on",
        "mode": "cool",
        "target": 24
      }
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Morning routine",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Get Automation by ID
**GET** `/automations/:automationId`

Get detailed information about an automation.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Morning routine",
    "description": "Turn on lights and adjust thermostat",
    "isActive": true,
    "trigger": {
      "type": "time",
      "time": "07:00",
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    },
    "actions": [
      {
        "deviceId": "light-uuid",
        "deviceName": "Bedroom Light",
        "action": "setState",
        "params": {
          "power": "on",
          "brightness": 80
        }
      }
    ],
    "lastTriggered": "2024-01-01T07:00:00Z",
    "executionCount": 45,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Update Automation
**PUT** `/automations/:automationId`

Update an automation rule.

**Headers:** 
- Authorization: Bearer token required

**Request Body:**
```json
{
  "name": "Updated name",
  "isActive": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated name",
    "isActive": false,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Delete Automation
**DELETE** `/automations/:automationId`

Delete an automation rule.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Automation deleted successfully"
}
```

---

### Test Automation
**POST** `/automations/:automationId/test`

Manually trigger an automation for testing.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "automationId": "uuid",
    "executed": true,
    "results": [
      {
        "deviceId": "device-uuid",
        "action": "setState",
        "status": "success"
      }
    ],
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

## 🎬 Scene Endpoints

### Get All Scenes
**GET** `/scenes`

Retrieve all predefined scenes.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Movie Time",
      "icon": "🎬",
      "description": "Dim lights and close blinds",
      "actions": [
        {
          "deviceId": "light-uuid",
          "action": "setState",
          "params": {
            "power": "on",
            "brightness": 20
          }
        }
      ]
    }
  ]
}
```

---

### Create Scene
**POST** `/scenes`

Create a new scene.

**Headers:** 
- Authorization: Bearer token required

**Request Body:**
```json
{
  "name": "Movie Time",
  "icon": "🎬",
  "description": "Dim lights and close blinds",
  "actions": [
    {
      "deviceId": "light-uuid",
      "action": "setState",
      "params": {
        "power": "on",
        "brightness": 20
      }
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Movie Time",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Activate Scene
**POST** `/scenes/:sceneId/activate`

Activate a scene (execute all actions).

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sceneId": "uuid",
    "executed": true,
    "results": [
      {
        "deviceId": "device-uuid",
        "status": "success"
      }
    ],
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

## 📈 Analytics Endpoints

### Get Dashboard Statistics
**GET** `/analytics/dashboard`

Get overview statistics for dashboard.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalDevices": 15,
    "onlineDevices": 13,
    "offlineDevices": 2,
    "totalRooms": 5,
    "activeAutomations": 8,
    "todayAlerts": 3,
    "energyConsumption": {
      "today": 45.6,
      "thisMonth": 1234.5,
      "unit": "kWh"
    }
  }
}
```

---

### Get Energy Report
**GET** `/analytics/energy`

Get energy consumption report.

**Headers:** 
- Authorization: Bearer token required

**Query Parameters:**
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)
- `granularity` (optional): hour, day, month

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "totalConsumption": 1234.5,
    "estimatedCost": 185.18,
    "currency": "USD",
    "byDevice": [
      {
        "deviceId": "uuid",
        "deviceName": "Living Room AC",
        "consumption": 450.2,
        "percentage": 36.5
      }
    ],
    "byDay": [
      {
        "date": "2024-01-01",
        "consumption": 42.3
      }
    ]
  }
}
```

---

### Get Device Usage Report
**GET** `/analytics/usage`

Get device usage statistics.

**Headers:** 
- Authorization: Bearer token required

**Query Parameters:**
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "mostUsedDevices": [
      {
        "deviceId": "uuid",
        "deviceName": "Living Room Light",
        "usageHours": 245.5,
        "onOffCycles": 156
      }
    ],
    "leastUsedDevices": [
      {
        "deviceId": "uuid",
        "deviceName": "Guest Room Light",
        "usageHours": 12.3,
        "onOffCycles": 8
      }
    ]
  }
}
```

---

## 👤 User Management (Admin Only)

### Get All Users
**GET** `/users`

Get list of all users (Admin only).

**Headers:** 
- Authorization: Bearer token required (admin role)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `role` (optional): Filter by role

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "isActive": true,
        "lastLogin": "2024-01-01T00:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

## 🔔 Notification Endpoints

### Get Notifications
**GET** `/notifications`

Get user notifications.

**Headers:** 
- Authorization: Bearer token required

**Query Parameters:**
- `unreadOnly` (optional): Get only unread notifications
- `limit` (optional): Number of notifications

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "alert",
      "title": "Temperature Alert",
      "message": "Living room temperature exceeded 30°C",
      "deviceId": "device-uuid",
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Mark Notification as Read
**PUT** `/notifications/:notificationId/read`

Mark a notification as read.

**Headers:** 
- Authorization: Bearer token required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## ⚡ WebSocket Events

### Connect to WebSocket
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events to Listen

#### Device Status Change
```javascript
socket.on('device:status', (data) => {
  // data: { deviceId, isOnline, timestamp }
});
```

#### Device State Update
```javascript
socket.on('device:state', (data) => {
  // data: { deviceId, state, timestamp }
});
```

#### Sensor Data
```javascript
socket.on('sensor:data', (data) => {
  // data: { deviceId, metric, value, unit, timestamp }
});
```

#### Automation Triggered
```javascript
socket.on('automation:triggered', (data) => {
  // data: { automationId, name, timestamp, results }
});
```

#### Alert
```javascript
socket.on('alert', (data) => {
  // data: { type, title, message, deviceId, timestamp }
});
```

### Events to Emit

#### Subscribe to Device
```javascript
socket.emit('device:subscribe', { deviceId: 'uuid' });
```

#### Unsubscribe from Device
```javascript
socket.emit('device:unsubscribe', { deviceId: 'uuid' });
```

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Validation Error
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Example Error Responses

**Validation Error (422):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token"
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Device not found"
  }
}
```

---

## 🔒 Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Standard endpoints**: 100 requests per minute
- **Real-time data endpoints**: 500 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are version 4
- All numeric values use appropriate precision (e.g., temperature to 1 decimal place)
- Binary states use strings ("on"/"off", "locked"/"unlocked") for clarity
- Device capabilities are discoverable through the device object

---

## 🧪 Example Usage with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Get Devices
```bash
curl -X GET http://localhost:3000/api/v1/devices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Control Device
```bash
curl -X POST http://localhost:3000/api/v1/devices/DEVICE_ID/control \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "setState",
    "params": {
      "power": "on",
      "brightness": 80
    }
  }'
```
