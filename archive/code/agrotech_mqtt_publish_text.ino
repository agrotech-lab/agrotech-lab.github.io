#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient); 

const char* ssid = "wifi_name";
const char* password = "wifi_password";

const char* mqttServer = "broker.hivemq.com";
int mqttPort = 1883;

long previous_time = 0;
const char* messageToSend = "This is my fuuny message"; // Message as a variable

void setupMQTT() {
  mqttClient.setServer(mqttServer, mqttPort);
}

void reconnect() {
  Serial.println("Connecting to MQTT Broker...");
  while (!mqttClient.connected()) {
    Serial.println("Reconnecting to MQTT Broker..");
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("Connected.");
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

  if (now - previous_time > 5000) {
    previous_time = now;
    mqttClient.publish("agrotech/mqtt_tutorial/message", messageToSend);
  }
}
