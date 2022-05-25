//------------------------------------------------------------------
//Thingspeak:
// #include <ESP8266WiFi.h>
#include <WiFi.h>

#include "ThingSpeak.h"
unsigned long myChannelNumber = 1689148;
const char * myWriteAPIKey = "A58V29JE8UIGWI16";

const char* ssid = "HUJI-guest"; // your wifi SSID name
const char* password = "" ;// wifi pasword
 
const char* server = "api.thingspeak.com";

WiFiClient client;

//------------------------------------------------------------------
//DS18B20:
#include <OneWire.h>
#include <DallasTemperature.h>

// Data wire is connected to GPIO4
#define ONE_WIRE_BUS 4
// Setup a oneWire instance to communicate with a OneWire device
OneWire oneWire(ONE_WIRE_BUS);
// Pass our oneWire reference to Dallas Temperature sensor 
DallasTemperature sensors(&oneWire);

//Insert the right address for your sensors
DeviceAddress sensor1 = { 0x28, 0xFF, 0x64, 0x02, 0xEF, 0x01, 0xA7, 0x31 };
DeviceAddress sensor2 = { 0x28, 0x35, 0xD3, 0x11, 0x00, 0x00, 0x00, 0xBF };

//------------------------------------------------------------------
//SHT31:
#include <Arduino.h>
#include <Wire.h>
#include "Adafruit_SHT31.h"

Adafruit_SHT31 sht31 = Adafruit_SHT31();
//------------------------------------------------------------------
//VL53LOX:

#include "Adafruit_VL53L0X.h"
Adafruit_VL53L0X lox = Adafruit_VL53L0X();


void setup() {
  Serial.begin(9600);
  //------------------------------------------------------------------
  //Thingspeak and wifi:
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
  //------------------------------------------------------------------
  //DS18B20:
  sensors.begin();

  //------------------------------------------------------------------
  //SHT31:
    if (! sht31.begin(0x44)) {
    Serial.println("Couldn't find SHT31");
    while (1) delay(1);
  }

  //------------------------------------------------------------------
  //VL53LOX:
  // wait until serial port opens for native USB devices
  while (! Serial) {
    delay(1);
  }
  
  Serial.println("Adafruit VL53L0X test");
  if (!lox.begin()) {
    Serial.println(F("Failed to boot VL53L0X"));
    while(1);
  }
  // power 
  Serial.println(F("VL53L0X API Simple Ranging example\n\n")); 
  
}
 
void loop() {
  //------------------------------------------------------------------
  //DS18B20:
  Serial.print("Requesting temperatures...");
  sensors.requestTemperatures(); // Send the command to get temperatures
  Serial.println("DONE");
  
  Serial.print("Sensor 1(*C): ");
  Serial.print(sensors.getTempC(sensor1)); 
  Serial.print(" Sensor 1(*F): ");
  Serial.println(sensors.getTempF(sensor1)); 
 
  Serial.print("Sensor 2(*C): ");
  Serial.print(sensors.getTempC(sensor2)); 
  Serial.print(" Sensor 2(*F): ");
  Serial.println(sensors.getTempF(sensor2)); 

  //------------------------------------------------------------------
  //SHT31:
  float t = sht31.readTemperature();
  float h = sht31.readHumidity();

  if (! isnan(t))  {
    Serial.print("Temp *C = "); Serial.println(t);
  }
  else  {
    Serial.println("Failed to read temperature");
  }
  
  if (! isnan(h))  {
  Serial.print("Hum. % = "); Serial.println(h);
  }
  else  {
  Serial.println("Failed to read humidity");
  }
  
  Serial.println();
  delay(1000);

  //------------------------------------------------------------------
  //VL53LOX:
   VL53L0X_RangingMeasurementData_t measure;
    
  Serial.print("Reading a measurement... ");
  lox.rangingTest(&measure, false); // pass in 'true' to get debug data printout!

  if (measure.RangeStatus != 4) {  // phase failures have incorrect data
    Serial.print("Distance (mm): "); Serial.println(measure.RangeMilliMeter);
  } else {
    Serial.println(" out of range ");
  }
    
  delay(100);

  //------------------------------------------------------------------
  //Thingspeak:
  ThingSpeak.setField(1,t); // SHT temp
  ThingSpeak.setField(2,h); // SHT humidity
  ThingSpeak.setField(3,sensors.getTempC(sensor1)); // DS18B20 in
  ThingSpeak.setField(4,sensors.getTempC(sensor2)); // DS18B20 out
  ThingSpeak.setField(5,measure.RangeMilliMeter); // distance
  ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);

  Serial.println("uploaded to Thingspeak server....");

  client.stop();
 
  Serial.println("Waiting to upload next reading...");
  Serial.println();
  
  // thingspeak free needs minimum 15 sec delay between updates 
  // payed can do 1sec

 
  
  delay(1000);
}