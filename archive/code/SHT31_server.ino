#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include "Adafruit_SHT31.h"

// ── settings for students to change ───────────────────────────────
// wifi network name created by the esp32 (each student should use a different name)
const char* apSsid     = "esp32_sht31_student_1";
// device name shown on the web page
const char* deviceName = "student_1";
// ──────────────────────────────────────────────────────────────────

// sht31 sensor object
Adafruit_SHT31 sht31 = Adafruit_SHT31();

// web server on port 80
WebServer server(80);

// build and send web page
void handleRoot() {
  // read temperature and humidity
  float temperature = sht31.readTemperature();
  float humidity    = sht31.readHumidity();

  // prepare strings for display
  String tempStr = "n/a";
  String humStr  = "n/a";

  if (!isnan(temperature)) {
    tempStr = String(temperature, 1); // 1 decimal place
  }
  if (!isnan(humidity)) {
    humStr = String(humidity, 1);     // 1 decimal place
  }

  // simple html page
  String page;
  page += "<!DOCTYPE html><html><head><meta charset='utf-8'>";
  page += "<meta http-equiv='refresh' content='1'>";  // refresh every 1 second
  page += "<title>";
  page += deviceName;
  page += " - SHT31</title>";
  page += "<style>";
  page += "body{font-family:Arial,Helvetica,sans-serif;max-width:400px;margin:20px auto;}";
  page += "</style></head><body>";

  page += "<h2>esp32 sensor: ";
  page += deviceName;
  page += "</h2>";

  page += "<p><b>temperature:</b> ";
  page += tempStr;
  page += " &deg;C</p>";

  page += "<p><b>humidity:</b> ";
  page += humStr;
  page += " %</p>";

  page += "<p style='margin-top:20px;font-size:12px;color:#555;'>";
  page += "this page refreshes once per second.";
  page += "</p>";

  page += "</body></html>";

  server.send(200, "text/html", page);
}

// handle unknown paths
void handleNotFound() {
  server.send(404, "text/plain", "not found");
}

void setup() {
  // start serial for debug
  Serial.begin(115200);
  delay(500);

  // start sht31 on i2c address 0x44
  if (!sht31.begin(0x44)) {
    Serial.println("sht31 not found");
  }

  // set wifi to access point mode
  WiFi.mode(WIFI_AP);

  // create open access point (no password)
  WiFi.softAP(apSsid);

  // print access point info
  IPAddress ip = WiFi.softAPIP();
  Serial.print("access point ssid: ");
  Serial.println(apSsid);
  Serial.print("access point ip:   ");
  Serial.println(ip);

  // define http routes
  server.on("/", handleRoot);
  server.onNotFound(handleNotFound);

  // start web server
  server.begin();
  Serial.println("web server started");
}

void loop() {
  // handle incoming http requests
  server.handleClient();
}
