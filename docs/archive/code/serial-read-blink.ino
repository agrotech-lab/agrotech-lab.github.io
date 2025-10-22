// serial-read-blink.ino
String inputString = "";

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("Type a number and press Enter:");
}

void loop() {
  // check if data is available in the Serial Monitor
  if (Serial.available()) {
    inputString = Serial.readStringUntil('\n');
    int n = inputString.toInt();  // convert text to integer

    Serial.print("Blinking ");
    Serial.print(n);
    Serial.println(" times");

    for (int i = 0; i < n; i++) {
      digitalWrite(LED_BUILTIN, HIGH);
      delay(200);
      digitalWrite(LED_BUILTIN, LOW);
      delay(200);
    }

    Serial.println("Done. Type another number:");
  }
}
