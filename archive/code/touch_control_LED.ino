#include <Arduino.h>

// Define the touch sensor pin
#define TOUCH_PIN T0  // You can change this to another touch pin if needed

// Define the built-in LED pin
#define LED_PIN LED_BUILTIN  // Most ESP32 boards use GPIO 2 for the built-in LED

void setup() {
  // Initialize serial communication at 115200 baud
  Serial.begin(115200);
  
  // Wait for the serial monitor to connect
  while (!Serial) {
    ; // Wait for serial port to connect. Needed for native USB port only
  }

  // Set the LED pin as an output
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // Read the value from the touch sensor
  int touchValue = touchRead(TOUCH_PIN);

  // Print the touch sensor value
  Serial.print("Touch value: ");
  Serial.println(touchValue);
  
  // Check if the touch sensor is activated (value will be lower when touched)
  if (touchValue < 30) {  // You might need to adjust this threshold value
    Serial.println("Touch detected!");
    digitalWrite(LED_PIN, HIGH);  // Turn on the LED
  } else {
    digitalWrite(LED_PIN, LOW);  // Turn off the LED
  }

  // Add a small delay to avoid spamming the serial monitor
  delay(100);
}
