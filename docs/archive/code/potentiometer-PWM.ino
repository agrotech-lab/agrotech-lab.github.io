const int ledPin = D9; // the number of the LED pin
int analog_pin = A4; // Pin into which we connect the middle leg of the potentiometer
int val ;  // variable to store the value read

// setting PWM properties
const int freq = 5000;        // 5000 Hz
const int ledChannel = 0;
const int resolution = 12;    // 12-bit resolution = between 0 and 4095
 
void setup(){
  Serial.begin(115200);
    
  // configure LED PWM functionalitites
  ledcSetup(ledChannel, freq, resolution);
  
  // attach the channel to the GPIO to be controlled
  ledcAttachPin(ledPin, ledChannel);
}
 
void loop(){
    val = analogRead(analog_pin);  // read the input pin
    Serial.println(val);          // print value
    ledcWrite(ledChannel, val);
    delay(15);  // update duty cycle parameters every 15 ms
  }