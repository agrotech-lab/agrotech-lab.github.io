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
  
  // Print instructions
  Serial.println("Enter the number of times you want the LED to blink:");
}

void loop() {
  // Check if data is available to read
  if (Serial.available() > 0) {
    // Read the integer from the serial monitor
    int blinkCount = Serial.parseInt();
    
    // Check if the parsed integer is greater than 0
    if (blinkCount > 0) {
      // Print the received number
      Serial.print("Blinking LED ");
      Serial.print(blinkCount);
      Serial.println(" times");
      
      // Blink the LED the specified number of times
      for (int i = 0; i < blinkCount; i++) {
        digitalWrite(LED_PIN, HIGH);  // Turn on the LED
        delay(500);                   // Wait for 500 milliseconds
        digitalWrite(LED_PIN, LOW);   // Turn off the LED
        delay(500);                   // Wait for 500 milliseconds
      }
      
      // Print done message
      Serial.println("Done blinking");
    }
  }
}
