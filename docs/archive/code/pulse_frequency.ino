int sensorPin = A4;
volatile long pulse_count;
unsigned long last_print_time;
long total_pulse_count = 0;
float volume;

void setup() {
  pinMode(sensorPin, INPUT);
  Serial.begin(115200);
  attachInterrupt(digitalPinToInterrupt(sensorPin), increase, RISING);
  last_print_time = millis();
}

void loop() {
  unsigned long current_time = millis();
  if (current_time - last_print_time >= 1000) { // print every second
    float frequency = (float)pulse_count / ((current_time - last_print_time) / 1000.0);
    total_pulse_count += pulse_count; // update total pulse count
    Serial.print(total_pulse_count);
    Serial.print(" total counts, ");
    Serial.print(frequency);
    Serial.println(" counts per second");
    pulse_count = 0; // reset pulse count
    last_print_time = current_time;
  }
}

ICACHE_RAM_ATTR void increase() {
  pulse_count++;
}
