int num1 = 0, num2 = 0;

void setup() {
  // initialize serial communication with computer:
  Serial.begin(9600);
}

void loop() {
  // random(min, max)
  num1 = num1 + random(-5, 5);
  num2 = num2 + random(-10, 10);
  // print num1, then tab, then num2, then break line
  Serial.print(num1);
  Serial.print("\t");
  Serial.println(num2);
  delay(100);        // 1000 ms delay
}

/*
 * 1. See the random numbers on the Serial Monitor
 * 2. Open the Serial Plotter
 * 3. Reset ESP32 while looking at the graph
 */
