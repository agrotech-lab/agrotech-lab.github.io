//addapted from:
//https://microcontrollerslab.com/esp32-mqtt-client-publish-subscribe-bme280-readings-hivemq/

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient); 

const char* ssid = "wifi_name";
const char* password = "wifi_password";

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
        mqttClient.subscribe("agrotech/mqtt_tutorial/LED");
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
