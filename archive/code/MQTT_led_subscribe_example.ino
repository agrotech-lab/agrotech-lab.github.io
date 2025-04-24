#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_NeoPixel.h>

#define LED_PIN    5  // built-in WS2812 RGB on FireBeetle 2 = GPIO5 (D8)
#define NUM_LEDS   1
#define BRIGHTNESS 50

const char* ssid = "erez";         // <-- change this
const char* password = "arduino1"; // <-- change this
const char* mqttServer = "broker.emqx.io";  // <== NEW BROKER
int mqttPort = 1883;
const char* mqttTopic = "agrotech/mqtt_tutorial/LED";

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

String msgString;

void setColor(uint8_t r, uint8_t g, uint8_t b) {
  strip.setPixelColor(0, strip.Color(r, g, b));
  strip.show();
}

void parseColor(String color) {
  color.trim();
  color.toLowerCase();

  // named or shorthand colors
  if (color == "r" || color == "red") setColor(255, 0, 0);
  else if (color == "g" || color == "green") setColor(0, 255, 0);
  else if (color == "b" || color == "blue") setColor(0, 0, 255);
  else if (color == "w" || color == "white") setColor(255, 255, 255);
  else if (color == "y" || color == "yellow") setColor(255, 255, 0);
  else if (color == "m" || color == "magenta") setColor(255, 0, 255);
  else if (color == "c" || color == "cyan") setColor(0, 255, 255);
  else if (color == "off" || color == "black") setColor(0, 0, 0);
  else if (color.indexOf(',') != -1) {
    // RGB triplet: "100,200,30"
    int r = color.substring(0, color.indexOf(',')).toInt();
    int g = color.substring(color.indexOf(',') + 1, color.lastIndexOf(',')).toInt();
    int b = color.substring(color.lastIndexOf(',') + 1).toInt();
    setColor(r, g, b);
  }
  else {
    Serial.println("Unknown color command");
  }
}

void callback(char* topic, byte* message, unsigned int length) {
  msgString = String((char*)message, length);
  Serial.print("MQTT message received: ");
  Serial.println(msgString);
  parseColor(msgString);
}

void setupMQTT() {
  mqttClient.setServer(mqttServer, mqttPort);
  mqttClient.setCallback(callback);
}

void reconnect() {
  Serial.println("Connecting to MQTT Broker...");
  while (!mqttClient.connected()) {
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("Connected to MQTT.");
      mqttClient.subscribe(mqttTopic);
    } else {
      Serial.print(".");
      delay(1000);
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
  Serial.println("\nConnected to WiFi.");

  strip.begin();
  strip.setBrightness(BRIGHTNESS);
  strip.show(); // off

  setupMQTT();
}

void loop() {
  if (!mqttClient.connected()) reconnect();
  mqttClient.loop();
}
