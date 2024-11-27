// Constants for the pins where sensors are plugged into.
const int sensorPin = A4;
const int ledPin = D9;

// Set up some global variables for the light level an initial value.
int lightInit;  // initial value
int lightVal;   // light reading

void setup()
{
  // We'll set up the LED pin to be an output.
  pinMode(ledPin, OUTPUT);
  // We will take a single reading from the light sensor and store it in the lightInit variable.
  // This will give us a prelinary value to compare against in the loop
  lightInit = analogRead(sensorPin);
}

void loop()
{

  lightVal = analogRead(sensorPin); // read the current light levels

  //if lightVal is less than our initial reading withing a threshold then it is dark outside.
  if(lightVal - lightInit <  50)
  {
    digitalWrite(ledPin, HIGH); // turn on light
  }
  //otherwise, it is bright outside
  else
  {
    digitalWrite(ledPin, LOW); // turn off light
  }

}