from devices.temperature_sensor import TemperatureSensor
import threading
import time

class DeviceManager:
    def __init__(self):
        self.devices = []
        self.threads = []
        
    def add_temperature_sensor(self, device_id):
        sensor = TemperatureSensor(device_id)
        self.devices.append(sensor)
        
        thread = threading.Thread(target=sensor.run, args=(5,))
        thread.daemon = True
        self.threads.append(thread)
        thread.start()
        
    def stop_all(self):
        print("\nStopping all devices...")
        for device in self.devices:
            device.is_running = False
        for thread in self.threads:
            thread.join(timeout=2)

if __name__ == "__main__":
    print("🚀 Starting IoT Device Simulators...")
    print("Press Ctrl+C to stop\n")
    
    manager = DeviceManager()
    
    manager.add_temperature_sensor("living-room-sensor")
    manager.add_temperature_sensor("bedroom-sensor")
    manager.add_temperature_sensor("kitchen-sensor")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        manager.stop_all()
        print("\n✅ All devices stopped")
