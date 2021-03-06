---
title: Arduino Nano
author: agrotech
date: 2022-04-12
category: code
layout: post
---

![](https://www.arduino.cc/en/uploads/Main/Nano.jpg)

For those of you that took home an arduino nano to play with, we have a few pointers.

### 5V vs 3.3V

While ESP32 works on 3.3V, Arduino nano works on 5V.
That means that the [digitalWrite()](https://www.arduino.cc/reference/en/language/functions/digital-io/digitalwrite/) function will send 5V to a pin and that the ADC can read voltaged in the 0-5V range (using the function [analogRead()](https://www.arduino.cc/en/Reference/AnalogRead)).  
**IMPORTANT** - don't forget that ESP32 is 3.3V when going back to it from the Arduino.
It is important to note that the arduino nano has a 3.3V pin that can be used. Most of the sesnsors we use are compatible with 3.3V so if you use that pin there is less chance of making mistakes later on.

### ADC
Arduino has a 10bit ADC.

### Settings in the Arduino IDE

No need to hold a button on the board when uploading code (Yay!).
You will need to change the settings in the Arduino IDE:  
`Tools -> Board -> "Arduino Nano"`  
`Tools -> Processor: "ATmega328P (Olad Bootloader)"`  
As you can see in this image:

![](../../../../archive/figures/arduino_nano_IDE.jpg)

