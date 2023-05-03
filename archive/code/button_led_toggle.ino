// Define the pin numbers
const int buttonPin = D4;
const int ledPin = A4;

// Initialize the LED state to off
bool ledState = false;

void setup() {
  // Set the pin modes
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);

  // Initialize Serial communication
  Serial.begin(115200);
}

void loop() {
  // Read the state of the button
  int buttonState = digitalRead(buttonPin);

  // If the button is pressed
  if (buttonState == LOW) {
    // Toggle the LED state
    ledState = !ledState;
    digitalWrite(ledPin, ledState);

    // Print the LED state to the Serial Monitor
    if (ledState) {
      Serial.println("LED is on.");
    } else {
      Serial.println("LED is off.");
    }

    // Wait a short period to debounce the button
    delay(500);
  }
}
