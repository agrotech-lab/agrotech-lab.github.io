// the number of the LED pin
const int ledPin = 13;  // 13 corresponds to GPIO13

int analog_pin = 32; // Pin into which we connect the input voltage
int val ;  // variable to store the value read

// setting PWM properties
const int freq = 5000;
const int ledChannel = 0;
const int resolution = 12;
 
void setup(){
  Serial.begin(9600);
    
  // configure LED PWM functionalitites
  ledcSetup(ledChannel, freq, resolution);
  
  // attach the channel to the GPIO to be controlled
  ledcAttachPin(ledPin, ledChannel);
}
 
void loop(){
    val = analogRead(analog_pin);  // read the input pin
    Serial.println(val);          // print value
    ledcWrite(ledChannel, val);
    delay(15);
  }