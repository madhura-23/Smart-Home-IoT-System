import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

interface SensorData {
  deviceId: string;
  temperature: number;
  humidity: number;
  unit: string;
  timestamp: string;
}

interface DeviceStatus {
  deviceId: string;
  isOnline: boolean;
  timestamp: Date;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<Record<string, SensorData>>({});
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('sensor:data', (data: SensorData) => {
      console.log('📊 Sensor data:', data);
      setSensorData(prev => ({
        ...prev,
        [data.deviceId]: data
      }));
    });

    newSocket.on('device:status', (data: DeviceStatus) => {
      console.log('📡 Device status:', data);
      setDeviceStatuses(prev => ({
        ...prev,
        [data.deviceId]: data.isOnline
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, isConnected, sensorData, deviceStatuses };
}
