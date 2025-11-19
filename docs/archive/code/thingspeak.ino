#include <WiFi.h>

// Include the ThingSpeak library
#include "ThingSpeak.h"

// Set the ThingSpeak channel and API key information
unsigned long myChannelNumber = 1689148;
const char* myWriteAPIKey = "A58V29JE8UIGWI16";

// Set the WiFi network credentials
const char* ssid = "HUJI-guest"; // your wifi SSID name
const char* password = ""; // wifi password

// Set the ThingSpeak server address
const char* server = "api.thingspeak.com";

// Create a WiFiClient object to connect to the WiFi network
WiFiClient client;

// Set the time to wait between uploading data to ThingSpeak (in milliseconds)
int wait_between_uploads = 15000; // 15 seconds

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
  // Set the values to be sent to ThingSpeak
  ThingSpeak.setField(1, 11);
  ThingSpeak.setField(2, 22);
  ThingSpeak.setField(3, 33);
  ThingSpeak.setField(4, 44);

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