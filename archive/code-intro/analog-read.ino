int analog_pin = 32; // Pin into which we connect the input voltage
int val ;  // variable to store the value read


void setup() {
  Serial.begin(9600); //
}

void loop() {
  val = analogRead(analog_pin);  // read the input pin
  Serial.println(val);          // print value
  delay(100);
}