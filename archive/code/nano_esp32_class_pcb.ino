// Agrotech class PCB connected to an Arduino Nano ESP32 with jumper wires.
// Wiring: https://agrotech-lab.github.io/tutorials/soldering-and-wires.html#nano-esp32
// Use the Nano ESP32 board definition, not a classic Nano or FireBeetle.
#include <Arduino.h>
#include <Wire.h>

const int THERMISTOR_PIN = A2;
const int LIGHT_PIN = A3;
const int BUTTON_PIN = D7;
const int LED_PINS[] = {D6, D3, D2};  // PCB LEDs D1, D2, D3

void scanI2C() {
  Serial.println("I2C devices responding:");
  int found = 0;
  for (uint8_t address = 8; address < 120; ++address) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.print("  0x");
      if (address < 16) Serial.print('0');
      Serial.println(address, HEX);
      ++found;
    }
  }
  if (!found) Serial.println("  None. Check 3V3, GND, SDA and SCL.");
}

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Pressing SW2 connects D7 to GND.
  for (int pin : LED_PINS) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
  }
  analogReadResolution(12);          // Raw readings: 0 to 4095.
  Wire.begin();                      // Nano ESP32: SDA = A4, SCL = A5.
  Wire.setClock(100000);
  Wire.setTimeOut(20);
}

void loop() {
  const bool pressed = digitalRead(BUTTON_PIN) == LOW;
  for (int pin : LED_PINS) digitalWrite(pin, pressed ? HIGH : LOW);

  static unsigned long lastReading = 0;
  static unsigned long lastScan = 0;
  const unsigned long now = millis();
  if (now - lastReading >= 250) {
    lastReading = now;
    Serial.print("Button: ");
    Serial.print(pressed ? "pressed" : "released");
    Serial.print(" | Thermistor A2 (raw): ");
    Serial.print(analogRead(THERMISTOR_PIN));
    Serial.print(" | Light A3 (raw): ");
    Serial.println(analogRead(LIGHT_PIN));
  }
  // Repeat so students can open the Serial Monitor after the board starts.
  if (now - lastScan >= 5000) {
    lastScan = now;
    scanI2C();
  }
}
