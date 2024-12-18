#include <WiFi.h>
#include <PubSubClient.h>

// WiFi credentials
const char* ssid = "agrotech";          // Replace with your WiFi SSID
const char* password = "1Afuna2gezer";  // Replace with your WiFi Password

// MQTT broker details
const char* mqtt_server = "192.168.0.102";    // IP address of Home Assistant
const int mqtt_port = 1883;                   // Default MQTT port
const char* mqtt_user = "mqtt-user";          // MQTT username
const char* mqtt_password = "1234";           // MQTT password
const char* mqtt_topic = "/greenhouse/outside/irrigation/solenoid5"; // MQTT topic

// Touch pin configuration
#define TOUCH_PIN A4  // Use GPIO 4 as touch pin (T0 on ESP32)

// MQTT client and WiFi client
WiFiClient espClient;
PubSubClient client(espClient);

// State variable to track touch pin state
bool send_message = false;

void setup_wifi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Attempt to reconnect to the MQTT broker
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32Client", mqtt_user, mqtt_password)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  // Initialize WiFi
  setup_wifi();

  // Set up MQTT
  client.setServer(mqtt_server, mqtt_port);

  // Ensure the ESP32 starts connected to the MQTT broker
  reconnect();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Read the state of the touch pin
  bool is_touched = touchRead(TOUCH_PIN) < 40;  // If the value is less than 40, the pin is being touched

  // Send "1" if the pin is being touched
  if (is_touched) {
    if (!send_message) {
      client.publish(mqtt_topic, "1");
      Serial.println("Sent: 1");
      send_message = true;  // Set flag to avoid sending multiple times while touching
    }
  } 
  // Send "0" if the pin is not being touched
  else {
    if (send_message) {
      client.publish(mqtt_topic, "0");
      Serial.println("Sent: 0");
      send_message = false;  // Reset the flag when pin is no longer touched
    }
  }

  // Optional: Small delay to avoid flooding the MQTT server with messages
  delay(100);  // Adjust the delay if necessary
}
