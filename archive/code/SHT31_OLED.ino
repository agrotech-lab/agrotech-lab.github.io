
#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>
#include "Adafruit_SHT31.h"

// create display object (change constructor if you use a different oled)
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

// create sht31 sensor object
Adafruit_SHT31 sht31 = Adafruit_SHT31();

void setup() {
  // start serial monitor (for debugging)
  Serial.begin(115200);

  // start oled display
  u8g2.begin();

  // try to start sht31 on i2c address 0x44
  if (!sht31.begin(0x44)) {
    // if sensor is not found, print error and stop
    Serial.println("couldn't find SHT31");

    u8g2.clearBuffer();
    u8g2.setFont(u8g2_font_6x10_tr);
    u8g2.drawStr(0, 15, "SHT31 not found!");
    u8g2.sendBuffer();

    while (1) {
      delay(10);  // stay here forever
    }
  }

  // small startup screen
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB08_tr);
  u8g2.drawStr(10, 20, "SHT31 + OLED");
  u8g2.drawStr(20, 40, "starting...");
  u8g2.sendBuffer();
  delay(1500);
}

void loop() {
  // read temperature and humidity from sht31
  float temperature = sht31.readTemperature();
  float humidity    = sht31.readHumidity();

  // build text strings for display
  String tempStr;
  String humStr;

  if (!isnan(temperature)) {
    tempStr = "Temp: " + String(temperature, 1) + " C";
  } else {
    tempStr = "Temp: --.- C";
  }

  if (!isnan(humidity)) {
    humStr = "RH:   " + String(humidity, 1) + " %";
  } else {
    humStr = "RH:   --.- %";
  }

  // show values on oled
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB08_tr);  // one simple readable font
  u8g2.drawStr(5, 20, tempStr.c_str());
  u8g2.drawStr(5, 40, humStr.c_str());
  u8g2.sendBuffer();

  // also print to serial monitor
  Serial.println(tempStr + "   " + humStr);

  // wait 1 second before next reading
  delay(1000);
}
