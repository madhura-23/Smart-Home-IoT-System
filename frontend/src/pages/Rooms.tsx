import React, { useEffect, useState } from 'react';
import { roomAPI } from '../services/api';

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await roomAPI.getAll();
      setRooms(response.data.data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          + Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{room.description || 'No description'}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {room.devices?.length || 0} device(s)
              </span>
              <div>
                <button className="text-blue-500 hover:underline mr-3 text-sm">Edit</button>
                <button className="text-red-500 hover:underline text-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
