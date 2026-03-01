const express = require('express');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', roomController.getAllRooms);
router.post('/', roomController.createRoom);
router.get('/:roomId', roomController.getRoomById);
router.put('/:roomId', roomController.updateRoom);
router.delete('/:roomId', roomController.deleteRoom);

module.exports = router;
