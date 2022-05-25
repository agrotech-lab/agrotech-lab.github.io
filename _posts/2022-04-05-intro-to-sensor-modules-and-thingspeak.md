---
title: Intro to Sensor Modules and Thingspeak
author: agrotech
date: 2022-04-05
category: code
layout: post
---

![](/archive/figures/thingspeak-screenshot-graphs.png)


## Sensors

### DS18B20 Temperature Sensor

Pretty accurate temperature sensor.
Each sensor has its own unique address, enabling the connection of numerous sensors to only on pin on the Arduino/ESP32.

In [this tutorial](https://randomnerdtutorials.com/esp32-multiple-ds18b20-temperature-sensors/) you can find a lot more information.

Code for finding the sensor's address:

{% assign filename = "Agrotech_2022_find_DS18B20" %}
{% include insert-cpp-code-with-toggle.html %}

Code for reading temperature from multiple sensors:

{% assign filename = "Agrotech_2022_read_multiple_DS18B20" %}
{% include insert-cpp-code-with-toggle.html %}

### SHT31 Temperature & Humidity Sensor Using I2C communication

In [this tutorial](http://www.esp32learning.com/code/esp32-and-sht31-sensor-example.php) you can find a lot more information.


Code for reading the sensor:

{% assign filename = "Agrotech_2022_SHT31" %}
{% include insert-cpp-code-with-toggle.html %}

### VL53L0X Time-of-Flight Distance Sensor Using I2C communication

In [this tutorial](http://www.esp32learning.com/code/vl53l0x-time-of-flight-sensor-and-esp32.php) you can find a lot more information.

Code for reading the sensor:

{% assign filename = "Agrotech_2022_VL53L0X" %}
{% include insert-cpp-code-with-toggle.html %}

## Thingspeak

[Thingspeak webpage](https://thingspeak.com/).

### Basic Code for Uploading Data to Thingspeak

{% assign filename = "Agrotech_2022_Thingspeak" %}
{% include insert-cpp-code-with-toggle.html %}

### Example: Sending Data from Sensors Above to Thingspeak

{% assign filename = "Agrotech_2022_sensors_to_Thingspeak" %}
{% include insert-cpp-code-with-toggle.html %}


----

<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>

<script type="text/javascript">
function toggle_icon_show_content(Show_Hide_Id,Icon_Id) {
    $("#"+Icon_Id).toggleClass('fa-plus-square fa-minus-square')
    $("#"+Show_Hide_Id).slideToggle('slow');
}
</script>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
