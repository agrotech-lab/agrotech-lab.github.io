import paho.mqtt.client as mqtt
import random
import time

# MQTT broker details
broker_address = "broker.hivemq.com"
broker_port = 1883

# Create a MQTT client instance
client = mqtt.Client()

# Connect to the MQTT broker
client.connect(broker_address, broker_port, 60)

# Loop to publish random temperature readings
while True:
    temperature = random.uniform(20.0, 30.0)  # Generate a random temperature value between 20.0 and 30.0
    client.publish("agrotech/mqtt_tutorial/temperature", str(temperature))  # Publish the temperature value to the topic
    print("Published temperature: " + str(temperature))
    time.sleep(1)  # Wait for 5 seconds before publishing the next temperature reading

# Disconnect from the MQTT broker (not reached in this example)
client.disconnect()