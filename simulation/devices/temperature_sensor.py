import paho.mqtt.client as mqtt
import json
import time
import random
import math
from datetime import datetime

class TemperatureSensor:
    def __init__(self, device_id, broker_address="localhost", broker_port=1883):
        self.device_id = device_id
        self.client = mqtt.Client(client_id=f"temp_sensor_{device_id}")
        self.broker_address = broker_address
        self.broker_port = broker_port
        self.base_temp = 22.0
        self.is_running = False
        
    def connect(self):
        self.client.connect(self.broker_address, self.broker_port)
        self.client.loop_start()
        self.publish_status("online")
        print(f"✅ Temperature sensor {self.device_id} connected")
        
    def disconnect(self):
        self.publish_status("offline")
        self.client.loop_stop()
        self.client.disconnect()
        
    def publish_status(self, status):
        topic = f"home/devices/{self.device_id}/status"
        payload = {
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
        self.client.publish(topic, json.dumps(payload))
        
    def generate_temperature(self):
        hour = datetime.now().hour
        daily_variation = 3 * math.sin((hour - 6) * math.pi / 12)
        random_variation = random.uniform(-0.5, 0.5)
        temperature = self.base_temp + daily_variation + random_variation
        return round(temperature, 1)
    
    def generate_humidity(self):
        base_humidity = 50
        random_variation = random.uniform(-5, 5)
        humidity = base_humidity + random_variation
        return round(max(20, min(80, humidity)), 1)
        
    def publish_telemetry(self):
        topic = f"home/devices/{self.device_id}/telemetry"
        payload = {
            "temperature": self.generate_temperature(),
            "humidity": self.generate_humidity(),
            "unit": "°C",
            "timestamp": datetime.now().isoformat()
        }
        self.client.publish(topic, json.dumps(payload))
        print(f"📤 {self.device_id}: Temp={payload['temperature']}°C, Humidity={payload['humidity']}%")
        
    def run(self, interval=5):
        self.is_running = True
        self.connect()
        
        try:
            while self.is_running:
                self.publish_telemetry()
                time.sleep(interval)
        except KeyboardInterrupt:
            print("\nStopping sensor...")
        finally:
            self.disconnect()

if __name__ == "__main__":
    sensor = TemperatureSensor("temp-sensor-001")
    sensor.run()
