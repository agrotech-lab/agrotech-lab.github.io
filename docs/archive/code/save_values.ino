/*
Good tutorial
https://randomnerdtutorials.com/esp32-save-data-permanently-preferences/
*/
#include <Preferences.h> // Include the Preferences library

#define uS_TO_S_FACTOR 1000000ULL  /* Conversion factor for microseconds to seconds */
#define TIME_TO_SLEEP  10          /* Time ESP32 will go to sleep (in seconds) */

Preferences preferences;           // Create a Preferences object

void setup() {
  Serial.begin(115200);
  Serial.println("Good morning!");
  delay(100); // Take some time to open up the Serial Monitor

  // Turn on LED
  Serial.println("Turn on LED");
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(2000);

  // Open Preferences in RW mode
  preferences.begin("my-app", false); // "my-app" is the namespace, false = read/write mode

  // Retrieve stored values
  int storedInt = preferences.getInt("myInt", 0);      // Default value is 0 if not set
  float storedFloat = preferences.getFloat("myFloat", 0.0); // Default is 0.0
  String storedString = preferences.getString("myString", "Default");

  Serial.println("Retrieved values from flash:");
  Serial.println("Int: " + String(storedInt));
  Serial.println("Float: " + String(storedFloat));
  Serial.println("String: " + storedString);

  // Increment and store new values
  storedInt++;
  storedFloat += 1.5;
  storedString = "Wake #" + String(storedInt);

  preferences.putInt("myInt", storedInt);
  preferences.putFloat("myFloat", storedFloat);
  preferences.putString("myString", storedString);

  Serial.println("Stored updated values in flash:");
  Serial.println("Int: " + String(storedInt));
  Serial.println("Float: " + String(storedFloat));
  Serial.println("String: " + storedString);

  // Close Preferences
  preferences.end();

  // Configure the wake-up source
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
  Serial.println("Setup ESP32 to sleep for every " + String(TIME_TO_SLEEP) + " seconds");

  Serial.println("Going to sleep now");
  Serial.flush();
  esp_deep_sleep_start();

  Serial.println("This will never be printed");
}

void loop() {
  // This is not going to be called
}
