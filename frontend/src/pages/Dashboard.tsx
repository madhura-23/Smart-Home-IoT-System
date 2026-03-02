import React, { useEffect, useState } from 'react';
import { deviceAPI, roomAPI } from '../services/api';
import DeviceCard from '../components/DeviceCard';
import { useSocket } from '../hooks/useSocket';

export default function Dashboard() {
  const [devices, setDevices] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    rooms: 0
  });

  const { isConnected, sensorData, deviceStatuses } = useSocket();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setDevices(prevDevices => 
      prevDevices.map(device => {
        const updatedDevice = { ...device };
        if (deviceStatuses[device.id] !== undefined) {
          updatedDevice.isOnline = deviceStatuses[device.id];
        }
        if (sensorData[device.id]) {
          updatedDevice.state = {
            temperature: sensorData[device.id].temperature,
            humidity: sensorData[device.id].humidity
          };
        }
        return updatedDevice;
      })
    );
  }, [sensorData, deviceStatuses]);

  useEffect(() => {
    setStats({
      total: devices.length,
      online: devices.filter(d => d.isOnline).length,
      offline: devices.filter(d => !d.isOnline).length,
      rooms: rooms.length
    });
  }, [devices, rooms]);

  const loadData = async () => {
    try {
      const [devicesRes, roomsRes] = await Promise.all([
        deviceAPI.getAll(),
        roomAPI.getAll()
      ]);
      setDevices(devicesRes.data.data);
      setRooms(roomsRes.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading your smart home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor and control your smart home devices</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className={`h-3 w-3 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm font-medium text-gray-700">
              {isConnected ? '🟢 Live Updates' : '🔴 Disconnected'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Devices</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                <span className="text-3xl">📱</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Online</p>
                <p className="text-4xl font-bold">{stats.online}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-100 text-sm font-medium mb-1">Offline</p>
                <p className="text-4xl font-bold">{stats.offline}</p>
              </div>
              <div className="bg-gray-400 bg-opacity-30 p-3 rounded-lg">
                <span className="text-3xl">⚫</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Rooms</p>
                <p className="text-4xl font-bold">{stats.rooms}</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                <span className="text-3xl">🏠</span>
              </div>
            </div>
          </div>
        </div>

        {/* Devices Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Devices</h2>
        </div>

        {devices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No devices found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first smart device</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium shadow-lg transition">
              + Add Your First Device
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
