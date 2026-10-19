#include <Arduino.h>

const unsigned long BLINK_TIME_MS = 500;

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("LED ON");
  delay(BLINK_TIME_MS);

  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED OFF");
  delay(BLINK_TIME_MS);
}
