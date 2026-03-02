import React, { useEffect, useState } from 'react';
import { deviceAPI, roomAPI } from '../services/api';
import DeviceCard from '../components/DeviceCard';

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [devicesRes, roomsRes] = await Promise.all([
        deviceAPI.getAll(),
        roomAPI.getAll()
      ]);

      const devicesData = devicesRes.data.data;
      const roomsData = roomsRes.data.data;

      setDevices(devicesData);
      setRooms(roomsData);

      setStats({
        total: devicesData.length,
        online: devicesData.filter((d: any) => d.isOnline).length,
        offline: devicesData.filter((d: any) => !d.isOnline).length,
        rooms: roomsData.length
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceControl = async (deviceId: string) => {
    try {
      await deviceAPI.control(deviceId, {
        action: 'toggle',
        params: {}
      });
      alert('Command sent to device!');
    } catch (error) {
      console.error('Control failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-500 text-white rounded-lg p-6 shadow-md">
          <p className="text-sm opacity-80">Total Devices</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-500 text-white rounded-lg p-6 shadow-md">
          <p className="text-sm opacity-80">Online</p>
          <p className="text-3xl font-bold">{stats.online}</p>
        </div>
        <div className="bg-gray-500 text-white rounded-lg p-6 shadow-md">
          <p className="text-sm opacity-80">Offline</p>
          <p className="text-3xl font-bold">{stats.offline}</p>
        </div>
        <div className="bg-purple-500 text-white rounded-lg p-6 shadow-md">
          <p className="text-sm opacity-80">Rooms</p>
          <p className="text-3xl font-bold">{stats.rooms}</p>
        </div>
      </div>

      {/* Devices Grid */}
      <h2 className="text-2xl font-semibold mb-4">Your Devices</h2>
      {devices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">No devices found</p>
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Add Your First Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onControl={handleDeviceControl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
