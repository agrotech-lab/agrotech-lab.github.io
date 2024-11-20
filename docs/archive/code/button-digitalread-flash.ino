const int buttonPin = A4;        // Pin where the button is connected
const int ledPin = D9;   // Pin where the LED is connected

// Variable to store the button state
int buttonState = 0;

void setup() {
  // Initialize the LED pin as an output
  pinMode(ledPin, OUTPUT);

  // Initialize the button pin as an input
  pinMode(buttonPin, INPUT_PULLUP);  // Use the internal pull-up resistor
  
  // Start serial communication for debugging (optional)
  Serial.begin(115200);
}

void loop() {
  // Read the state of the button
  buttonState = digitalRead(buttonPin);
  
  // Check if the button is pressed
  if (buttonState == LOW) {  // Assuming the button connects to ground when pressed
    Serial.println("Button pressed! Blinking LED...");
    
    // Blink the LED rapidly for 2 seconds (20 times per second)
    unsigned long startMillis = millis();
    while (millis() - startMillis < 2000) { // Run for 2000ms (2 seconds)
      digitalWrite(ledPin, HIGH);   // Turn the LED on
      delay(50);                    // Wait for 50ms
      digitalWrite(ledPin, LOW);    // Turn the LED off
      delay(50);                    // Wait for 50ms
    }
    
    // Optional: You can add a small delay here to debounce the button
    delay(200);  // Debounce the button for 200ms
  }

  // Add a small delay to avoid excessive readings
  delay(50);
}
