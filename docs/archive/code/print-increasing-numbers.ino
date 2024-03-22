// This is a one-line comment

/*
This
comment
spans
many
rows
*/

int num = 0;              // integer 

void setup() {
  /* initialize serial communication with computer
   * baud rate 9600 = 9600 bits per second
   */ 
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

/*
 * 1. To see the numbers go to
 * Tools > Serial Plotter
 * 2. After you see the numbers,
 * press the ESP32 reset button and see what happens
 * 3. In the Serial Plotter window,
 * change baud rate to another number, see what happens 
 */
