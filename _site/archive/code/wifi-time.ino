//-----------------------------------------------------------------------------------
//  WIFI setup:

#include <WiFi.h>

const char* ssid = "HUJI-guest"; // your wifi SSID name
const char* password = "" ;// wifi pasword
String formattedTime;
float r = 0, m = 0;

WiFiClient client;

//-------------------------------------------------------------------------------------
// Set time
#include <NTPClient.h>
#include <WiFiUdp.h>

const long utcOffsetInSeconds = 3600 * 2; // For UTC +2.00 : 2 * 60 * 60

char daysOfTheWeek[7][12] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};

// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);

int time_s ; // variable for the second


void setup() {
  Serial.begin(9600);
  //---------------------------------------------------------------------------
  //wifi conection:
  WiFi.disconnect();
  delay(10);
  WiFi.begin(ssid, password);

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("NodeMcu connected to wifi...");
  Serial.println(ssid);
  Serial.println();
  //-----------------------------------------------------------------------
  // stings for time:
  timeClient.begin();

}

void loop() {
  timeClient.update();
  time_s = timeClient.getSeconds();
  if (time_s == 0) {
    formattedTime = timeClient.getFormattedTime();
    Serial.print("A new minute has started!\nFull time = ");
    Serial.println(formattedTime);
  }
  
  Serial.print("s = ");
  Serial.print(time_s);
  r = random(10, 20);
  m += r;
  Serial.print("\trand = ");
  Serial.print(r);
  Serial.print("\trunning sum = ");
  Serial.println(m);
  if (time_s%10==9) {
    Serial.print("Average  = ");
    Serial.println(m / 10);
    m = 0;
  }
  
  delay(1000);
}