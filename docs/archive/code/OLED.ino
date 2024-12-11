#include <Wire.h>
#include <U8g2lib.h>

// Initialize the display (change constructor according to your OLED model)
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

void setup() {
  // initialize the display
  u8g2.begin();
  
  // display a startup message
  u8g2.clearBuffer();                // clear the internal memory

    // Small text
  u8g2.setFont(u8g2_font_6x10_tr);
  u8g2.drawStr(3, 10, "S-Hello");

  // Medium text
  u8g2.setFont(u8g2_font_ncenB08_tr);
  u8g2.drawStr(3, 30, "M-Hello");

  // Large text
  u8g2.setFont(u8g2_font_fur20_tr);
  u8g2.drawStr(3, 60, "L-Hello");

  // transfer buffer to the display
  u8g2.sendBuffer();      
  
  delay(5000); // wait 
}

void loop() {
  static int counter = 0;
  
  // update the screen
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB08_tr); // choose a suitable font
  u8g2.drawStr(3, 16, "Counter:");
  u8g2.drawStr(73, 16, String(counter).c_str());
  u8g2.sendBuffer();
  
  // increment the counter
  counter++;
  
  // wait for 1 second
  delay(1000);
}
