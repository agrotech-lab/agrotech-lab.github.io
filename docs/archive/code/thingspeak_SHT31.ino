#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include "ThingSpeak.h"
#include "Adafruit_SHT31.h"

// ── thingspeak settings ───────────────────────────────────────────
unsigned long myChannelNumber = 1689148;          // your channel number
const char* myWriteAPIKey     = "A58V29JE8UIGWI16";  // your write api key
// ──────────────────────────────────────────────────────────────────

// ── wifi settings ─────────────────────────────────────────────────
const char* ssid     = "HUJI-guest";   // your wifi ssid
const char* password = "";             // wifi password (if any)
// ──────────────────────────────────────────────────────────────────

// sht31 sensor object
Adafruit_SHT31 sht31 = Adafruit_SHT31();

// wifi client for thingspeak
WiFiClient client;

// time between uploads (milliseconds)
int wait_between_uploads = 15000;  // 15 seconds (minimum for free account)

void setup() {
  // start serial communication
  Serial.begin(115200);

  // start i2c and sht31 sensor
  if (!sht31.begin(0x44)) {  // default i2c address
    Serial.println("error: sht31 not found");
  } else {
    Serial.println("sht31 sensor initialized");
  }

  // connect to wifi
  WiFi.disconnect(true);
  delay(100);

  Serial.print("connecting to wifi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("wifi connected, ip address: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // initialize thingspeak
  ThingSpeak.begin(client);
}

void loop() {
  // read temperature and humidity from sht31
  float temperature = sht31.readTemperature();
  float humidity    = sht31.readHumidity();

  // check for valid readings
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("error: failed to read from sht31");
  } else {
    Serial.print("temp_deg_C: ");
    Serial.print(temperature, 2);
    Serial.print("   rel_hum_%: ");
    Serial.println(humidity, 2);

    // set fields to send to thingspeak
    ThingSpeak.setField(1, temperature);  // field 1: temperature
    ThingSpeak.setField(2, humidity);     // field 2: humidity

    // write to thingspeak
    int httpCode = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);

    if (httpCode == 200) {
      Serial.println("uploaded to thingspeak.");
    } else {
      Serial.print("upload failed, http error code: ");
      Serial.println(httpCode);
    }
  }

  Serial.println("waiting to upload next reading...");
  Serial.println();

  // stop client connection (optional)
  client.stop();

  // wait before next upload
  delay(wait_between_uploads);
}
