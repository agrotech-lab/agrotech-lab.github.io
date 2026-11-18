#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include "Adafruit_SHT31.h"

// ── settings for students to change ───────────────────────────────
// wifi network name created by the esp32 (each student should use a different name)
const char* apSsid     = "esp32_sht31_logger_student_1";
// device name shown on the web page
const char* deviceName = "student_1";
// how many readings to keep in memory (one per second -> 3600 = 1 hour)
const int maxSamples = 3600;
// ──────────────────────────────────────────────────────────────────

// sht31 sensor object
Adafruit_SHT31 sht31 = Adafruit_SHT31();

// web server on port 80
WebServer server(80);

// buffer of readings, kept in the esp32's own memory (RAM, not a file)
unsigned long bufTime[maxSamples];        // seconds since boot
float         bufTemperature[maxSamples]; // degrees C
float         bufHumidity[maxSamples];    // % relative humidity
int sampleCount = 0;                      // how many samples stored so far

unsigned long lastSampleTime = 0;

// read the sensor once and append to the buffer
void takeSample() {
  if (sampleCount >= maxSamples) return; // buffer full, stop recording

  float temperature = sht31.readTemperature();
  float humidity    = sht31.readHumidity();

  if (isnan(temperature) || isnan(humidity)) return; // skip a bad reading

  bufTime[sampleCount]        = millis() / 1000;
  bufTemperature[sampleCount] = temperature;
  bufHumidity[sampleCount]    = humidity;
  sampleCount++;
}

// build and send main web page
void handleRoot() {
  String page;
  page += "<!DOCTYPE html><html><head><meta charset='utf-8'>";
  page += "<meta http-equiv='refresh' content='1'>"; // refresh every 1 second
  page += "<title>";
  page += deviceName;
  page += " - sht31 logger</title>";
  page += "<style>";
  page += "body{font-family:Arial,Helvetica,sans-serif;max-width:400px;margin:20px auto;}";
  page += "a.button{display:inline-block;font-size:16px;padding:8px 16px;margin-top:12px;";
  page += "background:#2c3e50;color:#fff;text-decoration:none;border-radius:4px;}";
  page += "</style></head><body>";

  page += "<h2>esp32 sensor logger: ";
  page += deviceName;
  page += "</h2>";

  if (sampleCount > 0) {
    page += "<p><b>last temperature:</b> ";
    page += String(bufTemperature[sampleCount - 1], 1);
    page += " &deg;C</p>";

    page += "<p><b>last humidity:</b> ";
    page += String(bufHumidity[sampleCount - 1], 1);
    page += " %</p>";
  }

  page += "<p><b>samples stored:</b> ";
  page += String(sampleCount);
  page += " / ";
  page += String(maxSamples);
  page += "</p>";

  if (sampleCount >= maxSamples) {
    page += "<p style='color:#b00020;'>buffer full, logging has stopped.</p>";
  }

  page += "<a class=\"button\" href=\"/data.csv\">download data.csv</a>";

  page += "</body></html>";

  server.send(200, "text/html", page);
}

// stream the stored readings as a csv file for download
void handleCsv() {
  server.sendHeader("Content-Disposition", "attachment; filename=\"sht31_data.csv\"");
  server.setContentLength(CONTENT_LENGTH_UNKNOWN);
  server.send(200, "text/csv", "");

  server.sendContent("time_s,temperature_c,humidity_pct\n");

  for (int i = 0; i < sampleCount; i++) {
    String line = String(bufTime[i]) + "," +
                  String(bufTemperature[i], 2) + "," +
                  String(bufHumidity[i], 2) + "\n";
    server.sendContent(line);
  }
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
  server.on("/data.csv", handleCsv);
  server.onNotFound(handleNotFound);

  // start web server
  server.begin();
  Serial.println("web server started");
}

void loop() {
  // handle incoming http requests
  server.handleClient();

  // take one sample per second, without blocking the web server
  if (millis() - lastSampleTime >= 1000) {
    lastSampleTime = millis();
    takeSample();
  }
}
