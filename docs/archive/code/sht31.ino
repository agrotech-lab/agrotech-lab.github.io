/*
 * This program is a modification of
 * http://www.esp32learning.com/code/esp32-and-sht31-sensor-example.php
 */
#include <Arduino.h>   // Include the Arduino library
#include <Wire.h>      // Include the Wire library for I2C communication
#include "Adafruit_SHT31.h" // Include the SHT31 library from Adafruit

Adafruit_SHT31 sht31 = Adafruit_SHT31(); // Create an instance of the SHT31 object

void setup() {
  Serial.begin(9600);        // Initialize the serial communication with a baud rate of 112500
  if (! sht31.begin(0x44)) {   // Check if SHT31 is connected and start it with address 0x44
    // Print an error message if SHT31 is not found
    Serial.println("Couldn't find SHT31");
    while (1) delay(1);  // Wait indefinitely
  }
}

void loop() {
  // Read temperature from SHT31 and assign it to "temperature"
  float temperature = sht31.readTemperature(); 
  // Read relative humidity from SHT31 and assign it to "humidity"
  float humidity = sht31.readHumidity();

  if (! isnan(temperature)) {     // Check if t is not NaN (not a number)
    Serial.print("temp_deg_C:");  // Print temperature label
    Serial.print(temperature);    // Print temperature value
    Serial.print("\t");           // Write a tab space
  } 
  else {
    // Print an error message if temperature reading fails
    Serial.println("Failed to read temperature");
  }

  if (! isnan(humidity)) {        // Check if h is not NaN (not a number)
    Serial.print("rel_hum_%:");   // Print humidity label
    Serial.print(humidity);       // Print humidity value
  } 
  else {
    // Print an error message if humidity reading fails
    Serial.println("Failed to read humidity");
  }

  Serial.println();    // Break line
  delay(1000);         // Wait 1 second
}
