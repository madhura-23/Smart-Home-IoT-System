const express = require('express');
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', deviceController.getAllDevices);
router.post('/', deviceController.createDevice);
router.get('/:deviceId', deviceController.getDeviceById);
router.put('/:deviceId', deviceController.updateDevice);
router.delete('/:deviceId', deviceController.deleteDevice);
router.post('/:deviceId/control', deviceController.controlDevice);

module.exports = router;
