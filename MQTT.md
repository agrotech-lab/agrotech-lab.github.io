# MQTT

![](https://mqtt.org/assets/downloads/mqtt-logo.png)

## Intro
In today's session, we will be diving into the fascinating world of MQTT and its relevance in the field of agriculture. MQTT, which stands for Message Queuing Telemetry Transport, is a lightweight and efficient messaging protocol designed for constrained devices and low-bandwidth networks.

In the realm of AgroTech, where the Internet of Things (IoT) plays a crucial role, MQTT offers a powerful solution for connecting sensors, actuators, and other devices in agricultural systems. It provides a reliable and scalable means of communication, enabling seamless data exchange between devices, networks, and applications.

One of the primary advantages of MQTT is its lightweight nature, making it ideal for resource-constrained devices such as the ESP32 microcontroller. With its small code footprint and minimal network overhead, MQTT facilitates efficient data transmission even in remote or challenging agricultural environments.

Through the use of MQTT, farmers and agriculturalists can gather real-time information about various aspects of their operations, including temperature, humidity, soil moisture, and crop health. This data can then be transmitted to centralized servers or cloud platforms, allowing for intelligent analysis, decision-making, and automation in the agricultural domain.

Furthermore, MQTT follows a publish-subscribe messaging pattern, enabling a scalable and flexible communication model. Devices can publish data to specific topics, and other devices or applications can subscribe to these topics to receive relevant information. This decoupled architecture ensures that data is delivered only to those who need it, minimizing network congestion and optimizing system performance.

In this AgroTech class, we will explore the implementation of MQTT on the ESP32 microcontroller, enabling you to build innovative and efficient solutions for the agricultural sector. So, let's dive in and discover how MQTT can revolutionize the way we approach farming, enhance productivity, and contribute to sustainable agriculture practices.

## Fundamental Concepts

1. **MQTT Broker:** At the core of MQTT is the broker, which acts as a central hub for message exchange. The broker receives messages published by clients and distributes them to the interested subscribers. It is responsible for routing messages based on topics and maintaining the overall communication flow.
**For our calss today we will use the [Hivemq free public broker](https://www.hivemq.com/public-mqtt-broker/)**

1. **MQTT Client:** Clients are devices or applications that connect to the MQTT broker. They can be sensors, actuators, microcontrollers, or any device capable of sending or receiving messages. MQTT clients can function as both publishers and subscribers, allowing them to send data and receive updates from the broker. **For our class we can utilize the [Hivemq online client](https://www.hivemq.com/demos/websocket-client/) for testing**

1. **Topic:** Topics are hierarchical strings that act as labels for messages. They serve as a way to categorize and organize information. When publishing a message, clients assign it to a specific topic. Subscribers can then choose to receive messages from specific topics of interest. For example, in agriculture, topics could represent sensor data such as "temperature," "humidity," or "soil moisture."

1. **Publish:** Publishing refers to the action of sending a message from an MQTT client to the broker. When a client publishes a message, it specifies the topic to which the message belongs. The broker then distributes the message to all the interested subscribers that have subscribed to that particular topic.

1. **Subscribe:** Subscribing allows clients to express their interest in receiving messages from specific topics. By subscribing to a topic, a client informs the broker that it wants to receive messages published to that topic. Subscriptions can be specific to a particular topic (e.g., "temperature") or can use wildcard characters to subscribe to multiple topics (e.g., "agriculture/+/moisture" to subscribe to all moisture data in different areas of agriculture).

## A bit more about topics
Topics in MQTT are written as hierarchical strings, consisting of one or more levels separated by forward slashes ("/"). Each level within a topic provides a level of categorization and organization for the messages.

For example, consider the topic structure in agriculture:

* `agriculture/temperature`: This topic represents the temperature data in the agricultural context. It consists of a single level, `agriculture` followed by another level, `temperature`.

* `agriculture/field1/humidity`: This topic represents the humidity data in a specific field. It consists of three levels: `agriculture`, `field1`, and `humidity`.

* `agriculture/+/soil moisture`: This topic uses a wildcard character, `+`, which can match any single level. Subscribing to this topic would allow receiving messages related to soil moisture from various areas within agriculture.

* `agriculture/#`: This topic uses the wildcard character `#`, which can match multiple levels or no level at all. Subscribing to this topic would enable receiving messages from any sub-topic under `agriculture`.

The use of forward slashes and levels in topic design allows for a structured approach to organizing data in MQTT. It enables subscribers to select specific levels or use wildcard characters to filter and receive messages of interest.

When publishing a message, the client specifies the topic to which the message belongs, ensuring that it is appropriately categorized and can be received by subscribers who are interested in that specific topic.

Understanding how topics are written and structured is crucial for effective message routing and data organization within MQTT-based AgroTech applications.

### LED subscribe
```cpp
//addapted from:
//https://microcontrollerslab.com/esp32-mqtt-client-publish-subscribe-bme280-readings-hivemq/

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient); 

const char* ssid = "TP-Link_905D";
const char* password = "33072036";

char *mqttServer = "broker.hivemq.com";
int mqttPort = 1883;

int LED_pin = A4;
String msgString; // Declare msgString variable in the global scope

void setupMQTT() {
  mqttClient.setServer(mqttServer, mqttPort);
  mqttClient.setCallback(callback);
}

void reconnect() {
  Serial.println("Connecting to MQTT Broker...");
  while (!mqttClient.connected()) {
      Serial.println("Reconnecting to MQTT Broker..");
      String clientId = "ESP32Client-";
      clientId += String(random(0xffff), HEX);
      
      if (mqttClient.connect(clientId.c_str())) {
        Serial.println("Connected.");
        // subscribe to topic
        mqttClient.subscribe("agrotech/2023/LED");
      }      
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    } 
    Serial.println("");
     Serial.println("Connected to Wi-Fi");

  setupMQTT();

  pinMode(LED_pin, OUTPUT);
  digitalWrite(LED_pin, LOW); 
  
}


void loop() {
  if (!mqttClient.connected()) {
      reconnect();
  }
    
  mqttClient.loop();
  long now = millis();
}



void callback(char* topic, byte* message, unsigned int length) {
  // Convert byte array to string
  msgString = String((char*)message, length);

  // Convert string to integer
  int ledState = msgString.toInt();

  Serial.print("Message: ");
  Serial.println(msgString);
  Serial.print("LED State: ");
  Serial.println(ledState);

  if (ledState == 1) {
    digitalWrite(LED_pin, HIGH);  // Set pin A4 high
  } else if (ledState == 0) {
    digitalWrite(LED_pin, LOW);   // Set pin A4 low
  }
}
```

### Sensor subscribe
```cpp
//addapted from:
//https://microcontrollerslab.com/esp32-mqtt-client-publish-subscribe-bme280-readings-hivemq/

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient); 

const char* ssid = "TP-Link_905D";
const char* password = "33072036";

char *mqttServer = "broker.hivemq.com";
int mqttPort = 1883;

float value = 0;
String msgString; // Declare msgString variable in the global scope

void setupMQTT() {
  mqttClient.setServer(mqttServer, mqttPort);
  mqttClient.setCallback(callback);
}

void reconnect() {
  Serial.println("Connecting to MQTT Broker...");
  while (!mqttClient.connected()) {
      Serial.println("Reconnecting to MQTT Broker..");
      String clientId = "ESP32Client-";
      clientId += String(random(0xffff), HEX);
      
      if (mqttClient.connect(clientId.c_str())) {
        Serial.println("Connected.");
        // subscribe to topic
        mqttClient.subscribe("agrotech/2023/sensor");
      }      
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    } 
    Serial.println("");
     Serial.println("Connected to Wi-Fi");

  setupMQTT();

}


void loop() {
  if (!mqttClient.connected()) {
      reconnect();
  }
    
  mqttClient.loop();
  long now = millis();
}



void callback(char* topic, byte* message, unsigned int length) {
  // Convert byte array to string
  msgString = String((char*)message, length);

  // Convert string to float
  value = msgString.toFloat();

  Serial.println(value);

}
```

### Publish and subscribe
```cpp
//addapted from:
//https://microcontrollerslab.com/esp32-mqtt-client-publish-subscribe-bme280-readings-hivemq/

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient); 

const char* ssid = "TP-Link_905D";
const char* password = "33072036";

char *mqttServer = "broker.hivemq.com";
int mqttPort = 1883;

long previous_time = 0;
String msgString; // Declare msgString variable in the global scope

void setupMQTT() {
  mqttClient.setServer(mqttServer, mqttPort);
  mqttClient.setCallback(callback);
}

void reconnect() {
  Serial.println("Connecting to MQTT Broker...");
  while (!mqttClient.connected()) {
      Serial.println("Reconnecting to MQTT Broker..");
      String clientId = "ESP32Client-";
      clientId += String(random(0xffff), HEX);
      
      if (mqttClient.connect(clientId.c_str())) {
        Serial.println("Connected.");
        // subscribe to topic
        mqttClient.subscribe("agrotech/2023/message");
      }      
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    } 
    Serial.println("");
     Serial.println("Connected to Wi-Fi");

  setupMQTT();
}


void loop() {
  if (!mqttClient.connected())
    reconnect();
  mqttClient.loop();
  long now = millis();

  if (now - previous_time > 1000) {
    previous_time = now;

    float temperature = random(1, 101);
    char tempString[8];
    dtostrf(temperature, 1, 2, tempString);
    Serial.print("Temperature: ");
    Serial.println(tempString);
    mqttClient.publish("agrotech/2023/temperature", tempString);

    mqttClient.publish("agrotech/2023/string", "Hi :)");

//    Serial.print("Subscribed Message: ");
//    Serial.println(msgString);
  }
}


void callback(char* topic, byte* message, unsigned int length) {
  // Convert byte array to string
 //  String msgString((char*)message, length);

  msgString = String((char*)message, length);
  
  // Convert string to float
  float msgFloat = msgString.toFloat();

  // Convert string to integer
  int msgInt = msgString.toInt();
  
  Serial.print("Message: ");
  Serial.println(msgString);
  Serial.print("Float: ");
  Serial.println(msgFloat);
  Serial.print("Integer: ");
  Serial.println(msgInt);
}
```

## Python + MQTT

## Publish

```python
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
    client.publish("agrotech/2023/temperature", str(temperature))  # Publish the temperature value to the topic
    print("Published temperature: " + str(temperature))
    time.sleep(1)  # Wait for 5 seconds before publishing the next temperature reading

# Disconnect from the MQTT broker (not reached in this example)
client.disconnect()
```

## Subscribe

```python
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
```