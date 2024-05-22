#include <WiFi.h>

// Include the ThingSpeak library
#include "ThingSpeak.h"

// Set the ThingSpeak channel and API key information
unsigned long myChannelNumber = channel_number_here;
const char* myWriteAPIKey = "API_key_here";

// Set the WiFi network credentials
const char* ssid = "wifi_name"; // your wifi SSID name
const char* password = "wifi_password"; // wifi password

// Set the ThingSpeak server address
const char* server = "api.thingspeak.com";

// Create a WiFiClient object to connect to the WiFi network
WiFiClient client;

// Set the time to wait between uploading data to ThingSpeak (in milliseconds)
int wait_between_uploads = 10000; // 10 seconds

// Thermistor setup------------------------------------------------------------------
const int analog_pin = A4; // Pin into which we connect the input voltage
int val ;  // variable to store the value read
float v2; // variable to store the voltage of v2
int r1 = 10000; // R1 value (in the voltage divider)
float v1 = 3.3; // V1 value
int b_val = 4150; // B value of the resistor (from the data sheet)
float r2; // variable to store the resistance of r2 (thermistor resistance)
float t; // variable to store the temperature
int adc_steps = 4095; // the number of increments our ADC has (ESP32 = 12bit)
float r_25 = 10000; // the thermistor resistance at 25C (from the data sheet)

// function to convert resistance to temperature according to the b value
// equation in this link:
// https://www.thinksrs.com/downloads/programs/therm%20calc/ntccalibrator/ntccalculator.html
float resistance_to_temperature(int b, float r, float r_25) {
  return b/(log(r/r_25)+(b/298.15))-273.15;
}


void setup() {
  // Start the serial communication at 112500 baud
  Serial.begin(112500);

  // Disconnect any previous WiFi connection
  WiFi.disconnect();
  delay(10);

  // Connect to the WiFi network
  WiFi.begin(ssid, password);
  Serial.print("Connecting to ");
  Serial.println(ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("ESP32 connected to WiFi: ");
  Serial.println(ssid);
  Serial.println();

  // Initialize the ThingSpeak library with the WiFi client
  ThingSpeak.begin(client);
}

void loop() {

  val = analogRead(analog_pin);  // read the input pin (reading v2)
  v2 = (v1/adc_steps)*val;  // convert to voltage of v2 according to ADC
  r2 = (v2*r1)/(v1-v2);
  t = resistance_to_temperature(b_val, r2, r_25);
  Serial.print("Temperature: ");
  Serial.print(t);          // print temperature
  Serial.println(" C");

  // Set the values to be sent to ThingSpeak
  ThingSpeak.setField(1, t);

  // Send the data to ThingSpeak
  ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);

  // Print a message to the serial monitor indicating that the data has been uploaded
  Serial.println("Uploaded to ThingSpeak server.");

  // Disconnect the WiFi client
  client.stop();

  // Wait for the specified amount of time before uploading the next set of data
  // thingspeak needs minimum 15 sec delay between updates on a free acount,
  // a paid acount can update every 1 sec
  Serial.println("Waiting to upload next reading...");
  Serial.println();
  
  delay(wait_between_uploads);
}