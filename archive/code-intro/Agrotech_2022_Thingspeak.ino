// #include <ESP8266WiFi.h>
#include <WiFi.h>

#include "ThingSpeak.h"
unsigned long myChannelNumber = 1358139;
const char * myWriteAPIKey = "4HZXSWG1JXQCVHM2";

const char* ssid = "HUJI-guest"; // your wifi SSID name
const char* password = "" ;// wifi pasword
 
const char* server = "api.thingspeak.com";

WiFiClient client;


 
void setup() {
  Serial.begin(9600);
  WiFi.disconnect();
  delay(10);
  WiFi.begin(ssid, password);

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

    ThingSpeak.begin(client);
 
  WiFi.begin(ssid, password);
  
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("NodeMcu connected to wifi...");
  Serial.println(ssid);
  Serial.println();
}
 
void loop() {

 
  ThingSpeak.setField(1,11);
  ThingSpeak.setField(2,22);
  ThingSpeak.setField(3,33);
  ThingSpeak.setField(4,44);
  ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);

  Serial.println("uploaded to Thingspeak server....");

  client.stop();
 
  Serial.println("Waiting to upload next reading...");
  Serial.println();
  // thingspeak needs minimum 15 sec delay between updates

 
  
  delay(20000);
}