---
layout: page
title: Content
permalink: /content/
---

## <span class="iconify" data-icon="uil:schedule"></span> 2022 Schedule

Wednesdays, from 17:00 to 20:00, in the lab next to the "Ground Water" seminar room, 1st floor. [<span class="iconify" data-icon="el:map-marker"></span> Map](https://goo.gl/maps/uFYttRLVckTKAB357).

{% capture schedule_table %}
| date | topic | details |
|------|---------|
| 2022-03-09 | arduino programming | [tutorial](/code/2022/03/07/intro.html) |
| 2022-03-16 | electronics + arduino | [basics](/code/2022/03/10/basic-electronics-concepts), [tutorial](/code/2022/03/15/electronics-class) |
| 2022-03-23 | electronics + arduino | [basics](/code/2022/03/10/basic-electronics-concepts), [tutorial](/code/2022/03/15/electronics-class) |
| 2022-03-30 | sensors and cloud | [tutorial](/code/2022/04/05/intro-to-sensor-modules-and-thingspeak) |
| 2022-04-06 | projects + field trip |
| 2022-04-13 | <span style="color:red">NO CLASS<br/>Passover break</span> |
| 2022-04-20 | <span style="color:red">NO CLASS<br/>Passover break</span> |
| 2022-04-27 | <span style="color:red">NO CLASS<br/>Holocaust Memorial Day</span> |
| 2022-05-04 | <span style="color:red">NO CLASS<br/>Yom Hazikaron</span> |
| 2022-05-11 | <span>data analysis<br/>system building</span> | [tutorial](/code/2022/05/09/python-matlab-basics) |
| 2022-05-18 | <span>data analysis<br/>system building</span> | <span>[basics1](/code/2022/05/18/water-and-energy-balances), [basics2](/code/2022/05/18/psychrometric-chart-and-evaporative-cooling)<br/>[tutorial](/code/2022/05/18/soldering-and-wires)</span>   |
| 2022-05-25 | <span>data analysis<br/>system building</span> |
| 2022-06-01 | <span>data analysis<br/>system building</span> |
| 2022-06-08 | <span>data collection + analysis<br/>report writing</span> |
| 2022-06-15 | <span style="color:red">NO CLASS<br/>Student Day</span> |
| 2022-06-22 | <span>data collection + analysis<br/>report writing</span> |
| TBD        | presentation of projects	|
{% endcapture %}

<a href="javascript:void(0);"
   onClick="toggle_icon_show_content('schedule_table',
                                     'schedule_table_icon')">
   Toggle Schedule <i class="fas fa-plus-square"
             id='schedule_table_icon'></i>
</a>&emsp;
<div id="schedule_table" style="display:none; font-family:monospace;">
{{ schedule_table | markdownify }}
</div>


## <span class="iconify" data-icon="fa6-solid:user-graduate"></span> Tutorials

1. [Arduino intro & useful links](/code/2022/03/09/arduino-intro-and-links)
1. [Intro to Arduino code](/code/2022/03/07/intro)
1. [Basic Electronics Concepts](/code/2022/03/10/basic-electronics-concepts)
1. [Electronics Class](/code/2022/03/15/electronics-class)
1. [Sensor Modules and Thingspeak](/code/2022/04/05/intro-to-sensor-modules-and-thingspeak)
1. [Basic Data Analysis with Python and Matlab](/code/2022/05/09/python-matlab-basics)
1. [Water and Energy Balances](/code/2022/05/18/water-and-energy-balances)
1. [Psychrometric Chart and Evaporative cooling](/code/2022/05/18/psychrometric-chart-and-evaporative-cooling)
1. [Soldering and Wires](/code/2022/05/18/soldering-and-wires)

## <span class="iconify" data-icon="fluent:brain-circuit-20-regular"></span> Resources

#### <span class="iconify" data-icon="mdi:led-on"></span> Equipment

Click for a [list of the main components](/content/equipment) used in this course.

#### <span class="iconify" data-icon="akar-icons:github-fill"></span> Github 

Make an account on [Github](https://github.com).
Create a repository called "agrotech" or whatever you else want to call it.
You can upload to this repository your code, data, diagrams, pictures, markdown, etc.
In the end of the semester you will upload your project report as a Jupyter Notebook file.

From now on, your main Github page can be your "geek face" on the internet. Make a clean and simple `readme.md`, telling the world who you are and what you do.

#### <span class="iconify" data-icon="simple-icons:jupyter"></span> Jupyter Notebook 

The easiest way to install Python (+ Jupyter Notebook, Spyder, PyCharm, JupyterLab, etc) on any OS is to download [Anaconda](https://www.anaconda.com/products/individual).
Jupyter Notebook is a versatile environment that allows you to write code and documentation in one single file, taking advantage of Markdown.
Click for a [short](https://devhints.io/markdown) and a [long](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) markdown cheat sheet.

#### <span class="iconify" data-icon="eos-icons:hardware-circuit"></span> Fritzing

[Fritzing](https://fritzing.org/download/) is a nice software that lets you easily draw your own circuits and diagrams.

![](http://troybaverstock.com/wp-content/uploads/2019/04/arduino-servo-button-red-green-RGB-LED-wiring-diagram.png)


### <span class="iconify" data-icon="akar-icons:link-chain"></span> Very useful links

* Oregon State's OPEnS Lab. [Github](https://github.com/OPEnSLab-OSU/OPEnS-Lab-Home/wiki)








<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>

<script type="text/javascript">
function toggle_icon_show_content(Show_Hide_Id,Icon_Id) {
    $("#"+Icon_Id).toggleClass('fa-plus-square fa-minus-square')
    $("#"+Show_Hide_Id).slideToggle('slow');
}
</script>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>