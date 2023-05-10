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
