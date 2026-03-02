import React from 'react';

interface Device {
  id: string;
  name: string;
  type: string;
  isOnline: boolean;
  state?: any;
  room?: { name: string };
}

interface DeviceCardProps {
  device: Device;
  onControl?: (deviceId: string) => void;
}

export default function DeviceCard({ device, onControl }: DeviceCardProps) {
  const getDeviceIcon = (type: string) => {
    const icons: any = {
      temperature_sensor: '🌡️',
      light: '💡',
      lock: '🔒',
      camera: '📷',
      thermostat: '🌡️',
      plug: '🔌'
    };
    return icons[type] || '📱';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{getDeviceIcon(device.type)}</span>
          <div>
            <h3 className="font-semibold text-lg">{device.name}</h3>
            <p className="text-sm text-gray-500">{device.type.replace('_', ' ')}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          device.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {device.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {device.room && (
        <p className="text-sm text-gray-600 mb-2">📍 {device.room.name}</p>
      )}

      {device.state && Object.keys(device.state).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm font-semibold mb-2">Current State:</p>
          {Object.entries(device.state).map(([key, value]) => (
            <p key={key} className="text-sm text-gray-700">
              {key}: {JSON.stringify(value)}
            </p>
          ))}
        </div>
      )}

      {device.type === 'light' && (
        <button
          onClick={() => onControl?.(device.id)}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Toggle
        </button>
      )}
    </div>
  );
}
