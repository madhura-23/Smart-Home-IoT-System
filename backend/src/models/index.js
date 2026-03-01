const User = require('./User');
const Room = require('./Room');
const Device = require('./Device');

// Define relationships
User.hasMany(Room, { foreignKey: 'userId', as: 'rooms' });
Room.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Device, { foreignKey: 'userId', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Room.hasMany(Device, { foreignKey: 'roomId', as: 'devices' });
Device.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

module.exports = {
  User,
  Room,
  Device
};
