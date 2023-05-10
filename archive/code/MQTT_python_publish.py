import paho.mqtt.client as mqtt

# MQTT broker details
broker_address = "broker.hivemq.com"
broker_port = 1883

# Callback function when a connection is established with the MQTT broker
def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker with result code: " + str(rc))
    # Subscribe to the topic upon successful connection
    client.subscribe("agrotech/2023/temperature")

# Callback function when a message is received
def on_message(client, userdata, msg):
    print("Received temperature: " + str(msg.payload.decode()))

# Create a MQTT client instance
client = mqtt.Client()

# Assign callback functions
client.on_connect = on_connect
client.on_message = on_message

# Connect to the MQTT broker
client.connect(broker_address, broker_port, 60)

# Loop to maintain the connection and process network traffic
client.loop_forever()