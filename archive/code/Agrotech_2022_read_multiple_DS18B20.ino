/*
 * Rui Santos 
 * Complete Project Details https://randomnerdtutorials.com
 */

// Include the libraries we need
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


void setup(void){
  Serial.begin(115200);
  sensors.begin();
}

void loop(void){ 
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
//  
//  Serial.print("Sensor 3(*C): ");
//  Serial.print(sensors.getTempC(sensor3)); 
//  Serial.print(" Sensor 3(*F): ");
//  Serial.println(sensors.getTempF(sensor3)); 
  
  delay(2000);
}