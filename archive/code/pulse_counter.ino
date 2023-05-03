int sensorPin = A4;
volatile long pulse_count;

float volume;

void setup() {
  pinMode(sensorPin, INPUT);
  Serial.begin(115200);
  attachInterrupt(digitalPinToInterrupt(sensorPin), increase, RISING);
}

void loop() {
  Serial.print(pulse_count);
  Serial.println(" counts");
  delay(50);
}

ICACHE_RAM_ATTR void increase() {
  pulse_count++;
}
