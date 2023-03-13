float t = 0, x1 = 0, x2 = 0, x3 = 0;

void setup() {
  // initialize serial communication with computer:
  Serial.begin(9600);
}

float my_sine(float time) {
  return sin(time);
}

float my_cosine(float time) {
  float double_time;              // you can define internal variables,
  double_time = 2.0 * time;       // write as many commands as you want
  return 2.0 * cos(double_time);  // in the end, return float
}

void loop() {
  x1 = my_sine(t);
  x2 = my_cosine(t);
  if (x1 > 0) {
    x3 = -1.0;
  } else {
    x3 = 1.0;
  }
  Serial.print("sin:"); Serial.print(x1); Serial.print("\t");
  Serial.print("cos:"); Serial.print(x2); Serial.print("\t");
  Serial.print("square:"); Serial.print(x3);
  Serial.println();
  delay(50);        // 1000 ms delay
  t += 0.05;
}