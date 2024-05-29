/*
 * This program is a modification of
 * http://www.esp32learning.com/code/esp32-and-sht31-sensor-example.php
 */
#include <Arduino.h>   // Include the Arduino library
#include <Wire.h>      // Include the Wire library for I2C communication
#include "Adafruit_SHT31.h" // Include the SHT31 library from Adafruit
char userInput;
int LED_pin = 13;
const int relay = D11;
float relayState = 0.0;

Adafruit_SHT31 sht31 = Adafruit_SHT31(); // Create an instance of the SHT31 object

void setup() {
  Serial.begin(9600);        // Initialize the serial communication with a baud rate of 112500
  if (! sht31.begin(0x44)) {   // Check if SHT31 is connected and start it with address 0x44
    // Print an error message if SHT31 is not found
    Serial.println("Couldn't find SHT31");
    while (1) delay(1);  // Wait indefinitely
  }
  // initialize digital pin LED_pin as an output.
  pinMode(LED_pin, OUTPUT);
  //  relay
  pinMode(relay, OUTPUT);
  digitalWrite(relay, HIGH); // this means off
}

void loop() {
  userInput = Serial.read();               // read user input
  if(userInput == 'g'){                  // if we get expected value
    float time = micros() / 1e6;
    // Read temperature from SHT31 and assign it to "temperature"
    float temperature = sht31.readTemperature(); 
    // Read relative humidity from SHT31 and assign it to "humidity"
    float humidity = sht31.readHumidity();

    if(humidity > 80.0) {
      digitalWrite(LED_pin, HIGH);  // turn LED on
      digitalWrite(relay, LOW);  // turn relay and fan on
      relayState = 1.0;
    }
    else {
      digitalWrite(LED_pin, LOW);
      digitalWrite(relay, HIGH);  // turn relay and fan off
      relayState = 0.0;
    }
    
    Serial.print(time);
    Serial.print(", ");
    if (! isnan(temperature)) {     // Check if t is not NaN (not a number)
      Serial.print(temperature);    // Print temperature value
    } 
    else {
      // Print an error message if temperature reading fails
      Serial.println("Failed to read temperature");
    }
    Serial.print(", ");
    if (! isnan(humidity)) {        // Check if h is not NaN (not a number)
    //    Serial.print("rel_hum_%:");   // Print humidity label
      Serial.print(humidity);       // Print humidity value
    } 
    else {
      // Print an error message if humidity reading fails
      Serial.println("Failed to read humidity");
    }
    Serial.print(", ");
    Serial.println(relayState);
  } // if  user input 'g'  
}
