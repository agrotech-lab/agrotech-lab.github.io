int LED_pin = A4;

// the setup function runs once when you press reset or power the board
void setup() {
  // initialize digital pin LED_pin as an output.
  pinMode(LED_pin, OUTPUT);
}

// the loop function runs over and over again forever
void loop() {
  digitalWrite(LED_pin, HIGH);   // turn the LED on (HIGH is the voltage level)
  delay(3000);                       // wait for a second
  digitalWrite(LED_pin, LOW);    // turn the LED off by making the voltage LOW
  delay(1000);                       // wait for a second
}