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
    
    # Your actual device IDs
    manager.add_temperature_sensor("79a6ffaf-f454-476d-8000-e081dfd0bb29")  # Living Room
    manager.add_temperature_sensor("b5d88bdf-0b31-43db-9866-3fdd64c5417e")  # Bedroom
    manager.add_temperature_sensor("244b6ded-7da7-48bd-b6d2-3ea1530d61a7")  # Kitchen
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        manager.stop_all()
        print("\n✅ All devices stopped")