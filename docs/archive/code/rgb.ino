// Include the library for controlling WS2812 LEDs using ESP32
// https://github.com/Freenove/Freenove_WS2812_Lib_for_ESP32
#include "Freenove_WS2812_Lib_for_ESP32.h" 

// Define the number of LEDs and the pin they are connected to
#define LEDS_COUNT 1
#define LEDS_PIN D8
#define CHANNEL 0

// Create an instance of the WS2812 LED strip with the specified number of LEDs, pin number, and color type
Freenove_ESP32_WS2812 strip = Freenove_ESP32_WS2812(LEDS_COUNT, LEDS_PIN, CHANNEL, TYPE_GRB);

// Define an array of colors to cycle through
// u8 = unsigned 8-bit integer (a byte), capable of holding numbers from 0 t0 255
//                  R    G    B
u8 m_color[][3] = {{255, 0,   0  },        // red
                   {0,   255, 0  },        // green
                   {0,   0,   255},        // blue
                   {255, 255, 255},        // white
                   {255, 255, 0  },        // yellow
                   {255, 0  , 255},        // magenta
                   {0,   255, 255},        // cyan
                   {0,   0,   0}           // black
                  };
// number of colors = total bytes in m_color divided by bytes in m_color[0
int N_colors = sizeof(m_color) / sizeof(m_color[0]);
// Setup function - runs once when the microcontroller starts up
void setup() {
  // Initialize the LED strip
  strip.begin();
  // Set the brightness of the LEDs to 50%
  strip.setBrightness(50);
}

// Loop function - runs repeatedly while the microcontroller is powered on
void loop() {
  // 1.
  // Cycle through the array of colors defined before
  for (int j = 0; j < N_colors; j++) {
    // Set LED to the current color and display the result
    for (int i = 0; i < LEDS_COUNT; i++) {
      strip.setLedColorData(i, m_color[j][0],
                               m_color[j][1],
                               m_color[j][2]
                           );
      strip.show();
      delay(500); // milliseconds
    }
  }
  delay(1000);  // milliseconds
  // 2.
  // Cycle through a range of colors using the Wheel function
  for (int j = 0; j < 255; j++) {
    strip.setLedColorData(0, strip.Wheel(j));
    strip.show();
    delay(10);
  }
  // 3.
  // make LED black and wait 1 second before starting all over
  for (int j = 0; j < 255; j++) {
    strip.setLedColorData(0, 0, 0, 0);
    strip.show();
  }
  delay(1000);  // milliseconds
}
