#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>

// ── settings for students to change ───────────────────────────────
// wifi network name created by the esp32 (each student should use a different name)
const char* apSsid = "esp32_led_student_1";
// ──────────────────────────────────────────────────────────────────

// web server on port 80
WebServer server(80);

// remember led state
bool ledState = false;

// build and send web page
void handleRoot() {
  String page;
  page += "<!DOCTYPE html><html><head><meta charset='utf-8'>";
  page += "<title>esp32 led control</title>";
  page += "<style>";
  page += "body{font-family:Arial,Helvetica,sans-serif;max-width:400px;margin:20px auto;}";
  page += "button{font-size:16px;padding:8px 16px;}";
  page += "</style></head><body>";

  page += "<h2>esp32 led control</h2>";

  page += "<p><b>led state:</b> ";
  page += (ledState ? "ON" : "OFF");
  page += "</p>";

  page += "<form action=\"/toggle\" method=\"GET\">";
  page += "<button type=\"submit\">toggle led</button>";
  page += "</form>";

  page += "</body></html>";

  server.send(200, "text/html", page);
}

// toggle led and show main page
void handleToggle() {
  ledState = !ledState;
  digitalWrite(LED_BUILTIN, ledState ? HIGH : LOW);
  handleRoot();
}

// handle unknown paths
void handleNotFound() {
  server.send(404, "text/plain", "not found");
}

void setup() {
  // start serial for debug
  Serial.begin(115200);
  delay(500);

  // set built-in led pin
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

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
  server.on("/toggle", handleToggle);
  server.onNotFound(handleNotFound);

  // start web server
  server.begin();
  Serial.println("web server started");
}

void loop() {
  // handle incoming http requests
  server.handleClient();
}
