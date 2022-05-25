// This is a one-line comment

/*
This
comment
spans
many
rows
*/

int num = 0;              // number 

void setup() {
  // initialize serial communication with computer:
  Serial.begin(9600);
}

void loop() {
  // print num and break line
  Serial.println(num);
  // print num, don't break line
  // Serial.print(num);
  delay(1000);        // 1000 ms delay
  num = num + 1;      // increase num by 1
}