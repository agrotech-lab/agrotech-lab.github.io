import paho.mqtt.client as mqtt
import pandas as pd
from datetime import datetime

# MQTT broker details
broker_address = "broker.hivemq.com"
broker_port = 1883

# Create a DataFrame to store the messages
df = pd.DataFrame(columns=["topic", "value"])

# Callback function when a connection is established with the MQTT broker
def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker with result code: " + str(rc))
    # Subscribe to all subtopics within agrotech/mqtt_tutorial/
    client.subscribe("agrotech/mqtt_tutorial/#")

# Callback function when a message is received
def on_message(client, userdata, msg):
    global df
    # Decode the message payload
    value = msg.payload.decode()
    # Extract the subtopic
    subtopic = msg.topic.split("agrotech/mqtt_tutorial/")[1]
    # Get the current time
    timestamp = datetime.now()
    # Create a new DataFrame with the new message
    new_row = pd.DataFrame({"topic": [subtopic], "value": [value]}, index=[timestamp])
    # Append the new row to the DataFrame using concat
    df = pd.concat([df, new_row])
    print(f"Received message on {msg.topic}: {value}")

# Create an MQTT client instance
client = mqtt.Client()

# Assign callback functions
client.on_connect = on_connect
client.on_message = on_message

# Connect to the MQTT broker
client.connect(broker_address, broker_port, 60)

# Loop to maintain the connection and process network traffic
try:
    client.loop_forever()
except KeyboardInterrupt:
    # Save the DataFrame to a CSV file when the script is interrupted
    df.to_csv("mqtt_messages.csv")
    print("Data saved to mqtt_messages.csv")
