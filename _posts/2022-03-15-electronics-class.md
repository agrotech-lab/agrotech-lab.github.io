---
title: Electronics Class
author: agrotech
date: 2022-03-15
category: code
layout: post
---

![](https://cdn.sparkfun.com/assets/6/e/8/3/c/51f93d85757b7f2049270817.png)

### Presentation

[Download .pptx <span class="iconify" data-icon="el:download-alt"></span>](../../../../archive/teaching-material/electronics-class.pptx)

<object data="../../../../archive/teaching-material/electronics-class.pdf" width="800" height="500" type='application/pdf'></object>

[Pin information for ESP32](https://randomnerdtutorials.com/esp32-pinout-reference-gpios/)

----

### Digital Write

Use the following code to activate LED pin.

{% assign filename = "digital-write" %}
{% include insert-cpp-code-with-toggle.html %}

### PWM with ESP32

Use the following code to activate LED pin with PWM.

{% assign filename = "PWM-basic" %}
{% include insert-cpp-code-with-toggle.html %}

### Reading an Analog Pin

Use the following code to read an analog pin.

{% assign filename = "analog-read" %}
{% include insert-cpp-code-with-toggle.html %}

### ADC to voltage

Use the following code to convert ADC reading to voltage.

{% assign filename = "ADC-to-voltage" %}
{% include insert-cpp-code-with-toggle.html %}

### Potentiometer and PWM

Use the following code to control PWM with potentiometer and dim the LED.

{% assign filename = "potentiometer-PWM" %}
{% include insert-cpp-code-with-toggle.html %}

### Thermistor

[Download Data Sheet](../../../../archive/teaching-material/thermistor-datasheet-NTCM-10K-B4150.pdf)

{% assign filename = "thermistor_b_val" %}
{% include insert-cpp-code-with-toggle.html %}

![](/archive/figures/thermistor-agrotech-schematic.png)

![](/archive/figures/thermistor-agrotech-breadboard.png)

----

<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>

<script type="text/javascript">
function toggle_icon_show_content(Show_Hide_Id,Icon_Id) {
    $("#"+Icon_Id).toggleClass('fa-plus-square fa-minus-square')
    $("#"+Show_Hide_Id).slideToggle('slow');
}
</script>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
