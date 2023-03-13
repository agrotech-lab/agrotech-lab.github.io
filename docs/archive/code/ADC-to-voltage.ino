int analog_pin = 32; // Pin into which we connect the input voltage
int val ;  // variable to store the value read
float voltage;

void setup() {
  Serial.begin(9600); //
}

void loop() {
  val = analogRead(analog_pin);  // read the input pin
  voltage = (3.3/4095)*val;  // convert to voltage according to ADC
  Serial.print("Voltage: ");
  Serial.print(voltage);          // print value
  Serial.println(" V");
  delay(100);
}