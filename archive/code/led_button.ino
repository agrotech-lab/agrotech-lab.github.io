// Define the pin numbers
const int buttonPin = D4;
const int ledPin = A4;

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

  // If the button is not pressed (pin is pulled high)
  if (buttonState == HIGH) {
    // Turn on the LED
    digitalWrite(ledPin, LOW);

    // Print the button state to the Serial Monitor
    Serial.println("Button is not pressed.");
  } else {
    // Turn off the LED
    digitalWrite(ledPin, HIGH);

    // Print the button state to the Serial Monitor
    Serial.println("Button is pressed.");
  }

  // Delay for a short period to debounce the button
  delay(50);
}
