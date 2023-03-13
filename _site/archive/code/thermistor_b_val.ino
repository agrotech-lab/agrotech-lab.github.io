// Thermistor 
// reading the temperature via the ESP32's ADC

int analog_pin = 32; // Pin into which we connect the input voltage
int val ;  // variable to store the value read
float v2; // variable to store the voltage of v2
int r1 = 10000; // R1 value (in the voltage divider)
float v1 = 3.3; // V1 value
int b_val = 4150; // B value of the resistor (from the data sheet)
float r2; // variable to store the resistance of r2 (thermistor resistance)
float t; // variable to store the temperature
int adc_steps = 4095; // the number of increments our ADC has (ESP32 = 12bit)
float r_25 = 10000; // the thermistor resistance at 25C (from the data sheet)

// function to convert resistance to temperature according to the b value
// equation in this link:
// https://www.thinksrs.com/downloads/programs/therm%20calc/ntccalibrator/ntccalculator.html
float resistance_to_temperature(int b, float r, float r_25) {
  return b/(log(r/r_25)+(b/298.15))-273.15;
}

void setup() {
  Serial.begin(9600); //
}

void loop() {
  val = analogRead(analog_pin);  // read the input pin (reading v2)
  v2 = (v1/adc_steps)*val;  // convert to voltage of v2 according to ADC
  r2 = (v2*r1)/(v1-v2);
  t = resistance_to_temperature(b_val, r2, r_25);
  Serial.print("Temperature: ");
  Serial.print(t);          // print temperature
  Serial.println(" C");
  delay(100);
}