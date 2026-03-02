# Smart Home IoT System - Quick Start Implementation Guide

## 🚀 Getting Started

This guide will help you build the Smart Home IoT System step-by-step. Follow these phases in order.

---

## Phase 1: Project Setup (Day 1-2)

### 1.1 Initialize Project Structure

```bash
# Create main directories
mkdir -p backend/src/{controllers,models,services,middleware,mqtt,websocket,utils}
mkdir -p backend/tests
mkdir -p frontend/src/{components,pages,hooks,services,store,utils}
mkdir -p simulation/devices
mkdir -p infrastructure
mkdir -p database/{migrations,seeds}
mkdir -p docs
```

### 1.2 Initialize Backend

```bash
cd backend
npm init -y

# Install dependencies
npm install express cors helmet dotenv
npm install jsonwebtoken bcryptjs
npm install pg pg-hstore sequelize
npm install ioredis
npm install mqtt
npm install socket.io
npm install joi express-validator
npm install winston
npm install uuid

# Install dev dependencies
npm install -D nodemon jest supertest
npm install -D eslint prettier
npm install -D @types/node typescript ts-node
```

Create `backend/package.json` scripts:
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "test": "jest --coverage",
    "lint": "eslint src/**/*.js"
  }
}
```

### 1.3 Initialize Frontend

```bash
cd frontend
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install react-router-dom
npm install @tanstack/react-query axios
npm install socket.io-client
npm install zustand  # or redux toolkit
npm install recharts
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install dayjs
npm install react-hook-form zod

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D vitest
```

### 1.4 Create Docker Compose

Create `infrastructure/docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: timescale/timescaledb:latest-pg14
    environment:
      POSTGRES_DB: smarthome
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mosquitto:
    image: eclipse-mosquitto:2
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data
      - ./mosquitto/log:/mosquitto/log

volumes:
  postgres_data:
  redis_data:
```

Create `infrastructure/mosquitto/config/mosquitto.conf`:
```
listener 1883
allow_anonymous true
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
```

Start services:
```bash
cd infrastructure
docker-compose up -d
```

---

## Phase 2: Backend Core (Day 3-5)

### 2.1 Create Backend Entry Point

Create `backend/src/index.js`:
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIO = require('socket.io');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initMQTT } = require('./mqtt/client');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// Initialize connections
async function startServer() {
  try {
    await connectDatabase();
    await connectRedis();
    await initMQTT(io);
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

### 2.2 Database Configuration

Create `backend/src/config/database.js`:
```javascript
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'smarthome',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully');
    
    // Sync models (in production, use migrations)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced');
    }
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

module.exports = { sequelize, connectDatabase };
```

### 2.3 Create User Model

Create `backend/src/models/User.js`:
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'guest'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

// Hash password before creating user
User.beforeCreate(async (user) => {
  if (user.passwordHash) {
    user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
  }
});

// Method to compare passwords
User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = User;
```

### 2.4 Create Auth Controller

Create `backend/src/controllers/authController.js`:
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User already exists' }
      });
    }
    
    // Create user
    const user = await User.create({
      email,
      passwordHash: password,
      firstName,
      lastName
    });
    
    // Generate tokens
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }
    
    // Update last login
    await user.update({ lastLogin: new Date() });
    
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### 2.5 Create Auth Middleware

Create `backend/src/middleware/auth.js`:
```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_TOKEN', message: 'Authentication token required' }
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
      });
  }
};
```

### 2.6 Create Routes

Create `backend/src/routes/index.js`:
```javascript
const express = require('express');
const authRoutes = require('./authRoutes');
const deviceRoutes = require('./deviceRoutes');
const roomRoutes = require('./roomRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/rooms', roomRoutes);

module.exports = router;
```

Create `backend/src/routes/authRoutes.js`:
```javascript
const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;
```

---

## Phase 3: MQTT & Device Simulation (Day 6-8)

### 3.1 Create MQTT Client

Create `backend/src/mqtt/client.js`:
```javascript
const mqtt = require('mqtt');
const logger = require('../utils/logger');

let mqttClient;

function initMQTT(io) {
  return new Promise((resolve, reject) => {
    mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://localhost:1883', {
      clientId: `backend_${Math.random().toString(16).slice(3)}`,
      clean: true
    });
    
    mqttClient.on('connect', () => {
      logger.info('MQTT connected');
      
      // Subscribe to all device topics
      mqttClient.subscribe('home/devices/+/telemetry');
      mqttClient.subscribe('home/devices/+/status');
      
      resolve(mqttClient);
    });
    
    mqttClient.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Extract device ID from topic
        const deviceId = topic.split('/')[2];
        
        if (topic.includes('/telemetry')) {
          // Handle sensor data
          await handleTelemetry(deviceId, data, io);
        } else if (topic.includes('/status')) {
          // Handle status updates
          await handleStatus(deviceId, data, io);
        }
      } catch (error) {
        logger.error('MQTT message error:', error);
      }
    });
    
    mqttClient.on('error', (error) => {
      logger.error('MQTT error:', error);
      reject(error);
    });
  });
}

async function handleTelemetry(deviceId, data, io) {
  // Store in database (implement later)
  // For now, just broadcast to connected clients
  io.emit('sensor:data', {
    deviceId,
    ...data,
    timestamp: new Date()
  });
}

async function handleStatus(deviceId, data, io) {
  io.emit('device:status', {
    deviceId,
    ...data,
    timestamp: new Date()
  });
}

function publishCommand(deviceId, command) {
  if (!mqttClient) {
    throw new Error('MQTT client not initialized');
  }
  
  const topic = `home/devices/${deviceId}/command`;
  mqttClient.publish(topic, JSON.stringify(command));
  logger.info(`Published command to ${topic}:`, command);
}

module.exports = { initMQTT, publishCommand, getMQTTClient: () => mqttClient };
```

### 3.2 Create Python Device Simulator

Create `simulation/requirements.txt`:
```
paho-mqtt==1.6.1
python-dotenv==1.0.0
schedule==1.2.0
```

Create `simulation/devices/temperature_sensor.py`:
```python
import paho.mqtt.client as mqtt
import json
import time
import random
import math
from datetime import datetime

class TemperatureSensor:
    def __init__(self, device_id, broker_address="localhost", broker_port=1883):
        self.device_id = device_id
        self.client = mqtt.Client(client_id=f"temp_sensor_{device_id}")
        self.broker_address = broker_address
        self.broker_port = broker_port
        self.base_temp = 22.0  # Base temperature in Celsius
        self.is_running = False
        
    def connect(self):
        self.client.connect(self.broker_address, self.broker_port)
        self.client.loop_start()
        self.publish_status("online")
        print(f"Temperature sensor {self.device_id} connected")
        
    def disconnect(self):
        self.publish_status("offline")
        self.client.loop_stop()
        self.client.disconnect()
        
    def publish_status(self, status):
        topic = f"home/devices/{self.device_id}/status"
        payload = {
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
        self.client.publish(topic, json.dumps(payload))
        
    def generate_temperature(self):
        # Simulate realistic temperature variations
        hour = datetime.now().hour
        
        # Daily cycle: cooler at night, warmer during day
        daily_variation = 3 * math.sin((hour - 6) * math.pi / 12)
        
        # Random fluctuation
        random_variation = random.uniform(-0.5, 0.5)
        
        temperature = self.base_temp + daily_variation + random_variation
        return round(temperature, 1)
    
    def generate_humidity(self):
        # Simulate humidity (inverse relationship with temperature typically)
        base_humidity = 50
        random_variation = random.uniform(-5, 5)
        humidity = base_humidity + random_variation
        return round(max(20, min(80, humidity)), 1)
        
    def publish_telemetry(self):
        topic = f"home/devices/{self.device_id}/telemetry"
        payload = {
            "temperature": self.generate_temperature(),
            "humidity": self.generate_humidity(),
            "unit": "°C",
            "timestamp": datetime.now().isoformat()
        }
        self.client.publish(topic, json.dumps(payload))
        print(f"Published: {payload}")
        
    def run(self, interval=5):
        self.is_running = True
        self.connect()
        
        try:
            while self.is_running:
                self.publish_telemetry()
                time.sleep(interval)
        except KeyboardInterrupt:
            print("\nStopping sensor...")
        finally:
            self.disconnect()

if __name__ == "__main__":
    sensor = TemperatureSensor("temp-sensor-001")
    sensor.run()
```

Create `simulation/device_manager.py`:
```python
from devices.temperature_sensor import TemperatureSensor
import threading
import time

class DeviceManager:
    def __init__(self):
        self.devices = []
        self.threads = []
        
    def add_temperature_sensor(self, device_id):
        sensor = TemperatureSensor(device_id)
        self.devices.append(sensor)
        
        thread = threading.Thread(target=sensor.run, args=(5,))
        thread.daemon = True
        self.threads.append(thread)
        thread.start()
        
    def start_all(self):
        print("Starting all devices...")
        # Devices are already started in threads
        
    def stop_all(self):
        print("Stopping all devices...")
        for device in self.devices:
            device.is_running = False
        for thread in self.threads:
            thread.join(timeout=2)

if __name__ == "__main__":
    manager = DeviceManager()
    
    # Add multiple sensors
    manager.add_temperature_sensor("living-room-sensor")
    manager.add_temperature_sensor("bedroom-sensor")
    manager.add_temperature_sensor("kitchen-sensor")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        manager.stop_all()
```

Run the simulation:
```bash
cd simulation
pip install -r requirements.txt
python device_manager.py
```

---

## Phase 4: Frontend Dashboard (Day 9-12)

### 4.1 Setup React Router

Create `frontend/src/main.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 4.2 Create API Service

Create `frontend/src/services/api.ts`:
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const deviceAPI = {
  getAll: () => api.get('/devices'),
  getById: (id: string) => api.get(`/devices/${id}`),
  control: (id: string, command: any) => api.post(`/devices/${id}/control`, command)
};

export default api;
```

### 4.3 Create WebSocket Hook

Create `frontend/src/hooks/useSocket.ts`:
```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    
    const newSocket = io(SOCKET_URL, {
      auth: { token }
    });
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);
  
  return { socket, isConnected };
}
```

### 4.4 Create Dashboard Component

Create `frontend/src/pages/Dashboard.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { deviceAPI } from '../services/api';

interface Device {
  id: string;
  name: string;
  type: string;
  isOnline: boolean;
  state: any;
}

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [sensorData, setSensorData] = useState<any>({});
  const { socket, isConnected } = useSocket();
  
  useEffect(() => {
    // Load devices
    deviceAPI.getAll().then((response) => {
      setDevices(response.data.data);
    });
  }, []);
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for sensor data
    socket.on('sensor:data', (data) => {
      setSensorData((prev: any) => ({
        ...prev,
        [data.deviceId]: data
      }));
    });
    
    // Listen for device status changes
    socket.on('device:status', (data) => {
      setDevices((prev) =>
        prev.map((device) =>
          device.id === data.deviceId
            ? { ...device, isOnline: data.status === 'online' }
            : device
        )
      );
    });
    
    return () => {
      socket.off('sensor:data');
      socket.off('device:status');
    };
  }, [socket]);
  
  const handleDeviceControl = async (deviceId: string, command: any) => {
    try {
      await deviceAPI.control(deviceId, command);
    } catch (error) {
      console.error('Control failed:', error);
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-4">
        <span className="text-sm">
          Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <div key={device.id} className="border rounded-lg p-4 shadow">
            <h3 className="font-semibold">{device.name}</h3>
            <p className="text-sm text-gray-600">{device.type}</p>
            <p className="text-sm">
              {device.isOnline ? '🟢 Online' : '🔴 Offline'}
            </p>
            
            {sensorData[device.id] && (
              <div className="mt-2">
                <p>Temp: {sensorData[device.id].temperature}°C</p>
                <p>Humidity: {sensorData[device.id].humidity}%</p>
              </div>
            )}
            
            {device.type === 'light' && (
              <button
                onClick={() =>
                  handleDeviceControl(device.id, {
                    action: 'setState',
                    params: { power: 'on' }
                  })
                }
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Turn On
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Phase 5: Testing & Documentation (Day 13-14)

### 5.1 Write Backend Tests

Create `backend/tests/auth.test.js`:
```javascript
const request = require('supertest');
const app = require('../src/index');

describe('Authentication', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
  });
});
```

### 5.2 Update README

Create comprehensive `README.md` with:
- Project overview
- Features list
- Technology stack
- Setup instructions
- API documentation link
- Screenshots/GIFs
- Contributing guidelines
- License

---

## 🎯 Next Steps

After completing these phases:

1. **Add more device types** (lights, locks, cameras)
2. **Implement room management**
3. **Add automation rules**
4. **Create analytics dashboard**
5. **Deploy to cloud** (Heroku, AWS, or DigitalOcean)
6. **Set up CI/CD** with GitHub Actions
7. **Write comprehensive tests**
8. **Add monitoring** (Prometheus/Grafana)

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MQTT Protocol](https://mqtt.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Socket.io Documentation](https://socket.io/)
- [TimescaleDB Documentation](https://docs.timescale.com/)

---

## 🤝 Need Help?

- Check the API documentation in `API_ENDPOINTS.md`
- Review the project specification in `PROJECT_SPECIFICATION.md`
- Look at example code in the repository
- Open an issue on GitHub

---

Good luck with your project! 🚀
