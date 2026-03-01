const { Device, Room } = require('../models');
const { getMQTTClient } = require('../mqtt/client');

// Get all devices for user
exports.getAllDevices = async (req, res, next) => {
  try {
    const devices = await Device.findAll({
      where: { userId: req.userId },
      include: [{ model: Room, as: 'room', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    next(error);
  }
};

// Get device by ID
exports.getDeviceById = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.deviceId, userId: req.userId },
      include: [{ model: Room, as: 'room' }]
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' }
      });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    next(error);
  }
};

// Create device
exports.createDevice = async (req, res, next) => {
  try {
    const { name, type, roomId, description, metadata } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Name and type are required' }
      });
    }

    const device = await Device.create({
      userId: req.userId,
      name,
      type,
      roomId,
      description,
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      data: device
    });
  } catch (error) {
    next(error);
  }
};

// Update device
exports.updateDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.deviceId, userId: req.userId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' }
      });
    }

    await device.update(req.body);

    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    next(error);
  }
};

// Delete device
exports.deleteDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.deviceId, userId: req.userId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' }
      });
    }

    await device.destroy();

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Control device
exports.controlDevice = async (req, res, next) => {
  try {
    const { action, params } = req.body;

    const device = await Device.findOne({
      where: { id: req.params.deviceId, userId: req.userId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' }
      });
    }

    // Publish command to MQTT
    const mqttClient = getMQTTClient();
    if (mqttClient) {
      const topic = 'home/devices/' + device.id + '/command';
      const message = JSON.stringify({ action, params });
      mqttClient.publish(topic, message);
    }

    res.json({
      success: true,
      data: {
        deviceId: device.id,
        action,
        status: 'sent'
      }
    });
  } catch (error) {
    next(error);
  }
};
