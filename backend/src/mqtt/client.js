const mqtt = require('mqtt');

let mqttClient = null;
let io = null;

function initMQTT(socketIO) {
  io = socketIO;
  
  return new Promise((resolve, reject) => {
    const brokerUrl = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
    
    mqttClient = mqtt.connect(brokerUrl, {
      clientId: 'backend_' + Math.random().toString(16).slice(3),
      clean: true,
      reconnectPeriod: 1000
    });
    
    mqttClient.on('connect', () => {
      console.log('✅ MQTT connected');
      
      mqttClient.subscribe('home/devices/+/telemetry', (err) => {
        if (!err) console.log('📡 Subscribed to telemetry');
      });
      
      mqttClient.subscribe('home/devices/+/status', (err) => {
        if (!err) console.log('📡 Subscribed to status');
      });
      
      resolve(mqttClient);
    });
    
    mqttClient.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        const parts = topic.split('/');
        const deviceId = parts[2];
        const messageType = parts[3];
        
        console.log('📥 MQTT:', messageType, 'from', deviceId);
        
        if (messageType === 'telemetry') {
          console.log('  Temperature:', data.temperature);
          console.log('  Humidity:', data.humidity);
          
          // Emit to WebSocket clients
          if (io) {
            io.emit('sensor:data', {
              deviceId,
              temperature: data.temperature,
              humidity: data.humidity,
              unit: data.unit,
              timestamp: data.timestamp
            });
          }
        } else if (messageType === 'status') {
          const { Device } = require('../models');
          await Device.update(
            { isOnline: data.status === 'online', lastSeen: new Date() },
            { where: { id: deviceId } }
          );
          
          // Emit to WebSocket clients
          if (io) {
            io.emit('device:status', {
              deviceId,
              isOnline: data.status === 'online',
              timestamp: new Date()
            });
          }
        }
      } catch (error) {
        console.error('MQTT message error:', error.message);
      }
    });
    
    mqttClient.on('error', (error) => {
      console.error('❌ MQTT error:', error.message);
      reject(error);
    });
  });
}

function getMQTTClient() {
  return mqttClient;
}

function publishCommand(deviceId, command) {
  if (!mqttClient) {
    throw new Error('MQTT client not initialized');
  }
  
  const topic = 'home/devices/' + deviceId + '/command';
  mqttClient.publish(topic, JSON.stringify(command));
  console.log('📤 Published command to', deviceId);
}

module.exports = { initMQTT, getMQTTClient, publishCommand };
