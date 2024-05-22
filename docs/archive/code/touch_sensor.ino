#include <Arduino.h>

// Define the touch sensor pin
#define TOUCH_PIN D12  // You can change this to another touch pin if needed

void setup() {
  // Initialize serial communication at 115200 baud
  Serial.begin(115200);
  
  // Wait for the serial monitor to connect
  while (!Serial) {
    ; // Wait for serial port to connect. Needed for native USB port only
  }
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
  }

  // Add a small delay to avoid spamming the serial monitor
  delay(100);
}
