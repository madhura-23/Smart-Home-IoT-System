const { Room, Device } = require('../models');

exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.findAll({
      where: { userId: req.userId },
      include: [{ model: Device, as: 'devices', attributes: ['id', 'name', 'type', 'isOnline'] }]
    });

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Name is required' }
      });
    }

    const room = await Room.create({
      userId: req.userId,
      name,
      description
    });

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

exports.getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findOne({
      where: { id: req.params.roomId, userId: req.userId },
      include: [{ model: Device, as: 'devices' }]
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Room not found' }
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({
      where: { id: req.params.roomId, userId: req.userId }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Room not found' }
      });
    }

    await room.update(req.body);

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({
      where: { id: req.params.roomId, userId: req.userId }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Room not found' }
      });
    }

    await room.destroy();

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
