# HiChord Firmware Test Mode Integration Guide

This document explains how to add the hardware test mode to the HiChord firmware. The test mode allows the test app to automatically verify all hardware functionality without affecting normal end-user operation.

## Overview

- **Test App**: Web-based application using WebMIDI to communicate with HiChord
- **Communication**: SysEx messages (manufacturer ID 0x7D)
- **Test Mode**: Special firmware mode activated ONLY when connected to test app
- **Safety**: Test mode never accessible to end users, auto-exits on disconnect

## New SysEx Commands

Add these command IDs to your firmware (in main.cpp or midi.cpp):

```cpp
// SysEx Commands (add to existing commands)
#define SYSEX_ENTER_TEST_MODE          0x10
#define SYSEX_EXIT_TEST_MODE           0x11
#define SYSEX_TEST_RESPONSE            0x12
#define SYSEX_REQUEST_HARDWARE_INFO    0x13
#define SYSEX_HARDWARE_INFO_RESPONSE   0x14
#define SYSEX_REQUEST_ADC_VALUES       0x15
#define SYSEX_ADC_VALUES_RESPONSE      0x16
```

## Step 1: Add Global Variables

Add these volatile flags to `midi.cpp` (near existing flags):

```cpp
// Test Mode flags
volatile bool g_testModeActive = false;
volatile bool g_enterTestModeRequested = false;
volatile bool g_exitTestModeRequested = false;
volatile bool g_hardwareInfoRequested = false;
volatile bool g_adcValuesRequested = false;

// Test mode state
volatile uint8_t g_testCurrentButton = 0;  // Which button we're waiting for
volatile bool g_testButtonReceived = false;
volatile uint8_t g_testReceivedButton = 0;
```

Don't forget to add `extern` declarations in `main.cpp`:

```cpp
// Test mode (add near other extern declarations around line 75)
extern volatile bool g_testModeActive;
extern volatile bool g_enterTestModeRequested;
extern volatile bool g_exitTestModeRequested;
extern volatile bool g_hardwareInfoRequested;
extern volatile bool g_adcValuesRequested;
extern volatile uint8_t g_testCurrentButton;
extern volatile bool g_testButtonReceived;
extern volatile uint8_t g_testReceivedButton;
```

## Step 2: Handle SysEx Reception

Find where SysEx messages are received (likely in `usbd_midi_if.c` or similar USB MIDI handler). Add handling for new commands:

```c
// In your SysEx receive handler (where command 0x01, 0x02, etc. are handled)
void HandleSysExCommand(uint8_t* data, uint16_t length) {
    if (length < 2 || data[0] != 0x7D) return;  // Check manufacturer ID

    uint8_t command = data[1];

    switch (command) {
        // ... existing cases (0x01, 0x02, 0x03, etc.) ...

        case 0x10:  // ENTER_TEST_MODE
            g_enterTestModeRequested = true;
            break;

        case 0x11:  // EXIT_TEST_MODE
            g_exitTestModeRequested = true;
            break;

        case 0x13:  // REQUEST_HARDWARE_INFO
            g_hardwareInfoRequested = true;
            break;

        case 0x15:  // REQUEST_ADC_VALUES
            if (g_testModeActive) {  // Only respond in test mode
                g_adcValuesRequested = true;
            }
            break;
    }
}
```

## Step 3: Add Test Mode Logic to loop()

Add this to `loop()` in `main.cpp` (after existing SysEx handlers around line 16800):

```cpp
    // Handle Test Mode Entry
    if (g_enterTestModeRequested) {
        g_testModeActive = true;
        g_enterTestModeRequested = false;

        // Show test mode indicator on OLED
        u8g2.clearBuffer();
        u8g2.setFont(u8g2_font_7x14B_tf);
        u8g2.drawStr(10, 16, "TEST MODE");
        u8g2.setFont(u8g2_font_6x10_tf);
        u8g2.drawStr(5, 32, "QA Testing Active");
        u8g2.sendBuffer();
    }

    // Handle Test Mode Exit
    if (g_exitTestModeRequested) {
        g_testModeActive = false;
        g_exitTestModeRequested = false;
        g_testCurrentButton = 0;
        g_testButtonReceived = false;

        // Clear OLED and return to normal operation
        u8g2.clearBuffer();
        u8g2.sendBuffer();
    }

    // Handle Hardware Info Request
    if (g_hardwareInfoRequested) {
        g_hardwareInfoRequested = false;

        // Send hardware info via SysEx
        // Format: F0 7D 14 [version_major] [version_minor] [pcb_batch] [button_system] F7
        uint8_t sysex[8];
        sysex[0] = 0xF0;
        sysex[1] = 0x7D;
        sysex[2] = 0x14;  // HARDWARE_INFO_RESPONSE
        sysex[3] = 1;     // Firmware version major (e.g., 1.95 → 1)
        sysex[4] = 95;    // Firmware version minor

        // Detect PCB batch and button system
        #ifdef BATCH_4_OR_LATER
            sysex[5] = 4;  // PCB Batch 4+
            sysex[6] = 1;  // 1 = I2C button system
        #elif defined(BATCH_2) || defined(BATCH_3)
            sysex[5] = 2;  // PCB Batch 2 or 3
            sysex[6] = 0;  // 0 = ADC button system
        #else
            sysex[5] = 1;  // PCB Batch 1
            sysex[6] = 0;  // 0 = ADC button system
        #endif

        sysex[7] = 0xF7;

        #ifdef USBD_USE_MIDI
        MIDI_sendSysEx(sysex, 8);
        #endif
    }

    // Handle ADC Values Request (for ADC-based PCBs only)
    if (g_adcValuesRequested && g_testModeActive) {
        g_adcValuesRequested = false;

        #ifndef BATCH_4_OR_LATER  // Only for ADC systems
        // Send ADC values via SysEx
        // Format: F0 7D 16 [adc0_h] [adc0_l] [adc1_h] [adc1_l] ... F7
        uint8_t sysex[30];
        sysex[0] = 0xF0;
        sysex[1] = 0x7D;
        sysex[2] = 0x16;  // ADC_VALUES_RESPONSE

        // Encode 13 ADC values (7 chord buttons + 3 function buttons + joy X + joy Y + volume)
        // Each ADC value is 12-bit, split into high 7 bits and low 5 bits
        int idx = 3;
        for (int i = 0; i < 13; i++) {
            uint16_t adcVal = 0;

            // Read actual ADC values here
            // Example: adcVal = readADC(i);
            // For now, using placeholder - replace with actual ADC reading code

            sysex[idx++] = (adcVal >> 5) & 0x7F;  // High 7 bits
            sysex[idx++] = adcVal & 0x1F;         // Low 5 bits
        }

        sysex[idx++] = 0xF7;

        #ifdef USBD_USE_MIDI
        MIDI_sendSysEx(sysex, idx);
        #endif
        #endif
    }
```

## Step 4: Add Button Detection in Test Mode

Modify your button handling code to detect button presses in test mode and send responses:

```cpp
// Add to your button press handler (wherever chord/function buttons are processed)
void handleButtonPress(uint8_t buttonID) {
    // ... existing button handling code ...

    // Test mode: Report button press to test app
    if (g_testModeActive) {
        // Send test response
        // Format: F0 7D 12 [test_type] [result] F7
        uint8_t sysex[6];
        sysex[0] = 0xF0;
        sysex[1] = 0x7D;
        sysex[2] = 0x12;  // TEST_RESPONSE
        sysex[3] = 0x01;  // Test type: 0x01 = button press
        sysex[4] = 0x01;  // Result: 0x01 = pass
        sysex[5] = 0xF7;

        #ifdef USBD_USE_MIDI
        MIDI_sendSysEx(sysex, 6);
        #endif

        // Show button press on OLED
        u8g2.clearBuffer();
        u8g2.setFont(u8g2_font_7x14B_tf);
        u8g2.drawStr(10, 16, "BUTTON");
        char buf[16];
        snprintf(buf, sizeof(buf), "#%d PRESSED", buttonID);
        u8g2.drawStr(15, 32, buf);
        u8g2.sendBuffer();
    }
}
```

## Step 5: Add Joystick Detection in Test Mode

Similar to button detection, add joystick direction reporting:

```cpp
// Add to your joystick direction handler
void handleJoystickDirection(uint8_t direction) {
    // ... existing joystick handling ...

    // Test mode: Report joystick direction
    if (g_testModeActive) {
        uint8_t sysex[6];
        sysex[0] = 0xF0;
        sysex[1] = 0x7D;
        sysex[2] = 0x12;  // TEST_RESPONSE
        sysex[3] = 0x02;  // Test type: 0x02 = joystick
        sysex[4] = 0x01;  // Result: 0x01 = pass
        sysex[5] = 0xF7;

        #ifdef USBD_USE_MIDI
        MIDI_sendSysEx(sysex, 6);
        #endif

        // Show joystick direction on OLED
        const char* dirNames[] = {"CENTER", "UP", "UP-RIGHT", "RIGHT",
                                  "DOWN-RIGHT", "DOWN", "DOWN-LEFT", "LEFT", "UP-LEFT"};
        u8g2.clearBuffer();
        u8g2.setFont(u8g2_font_7x14B_tf);
        u8g2.drawStr(10, 16, "JOYSTICK");
        u8g2.drawStr(5, 32, dirNames[direction]);
        u8g2.sendBuffer();
    }
}
```

## Step 6: Safety - Auto-Exit on Disconnect

Add USB disconnect detection to automatically exit test mode:

```cpp
// In your USB disconnect handler or connection monitor
void checkUSBConnection() {
    static bool wasConnected = false;
    bool isConnected = USB_IsConnected();  // Your USB connection check function

    if (wasConnected && !isConnected) {
        // USB disconnected - exit test mode immediately
        if (g_testModeActive) {
            g_testModeActive = false;
            g_testCurrentButton = 0;
            g_testButtonReceived = false;
        }
    }

    wasConnected = isConnected;
}
```

## PCB Batch Detection

To properly detect the PCB batch and button system, you may need to add preprocessor defines to your build configuration:

```cpp
// In your platformio.ini or build configuration:
// For Batch 1-3 (ADC buttons):
// -D BATCH_ADC_BUTTONS

// For Batch 4+ (I2C buttons):
// -D BATCH_4_OR_LATER
// -D BATCH_I2C_BUTTONS

// Then in code:
#if defined(BATCH_I2C_BUTTONS)
    #define IS_I2C_BUTTON_SYSTEM 1
#else
    #define IS_I2C_BUTTON_SYSTEM 0
#endif
```

## Testing the Integration

1. **Flash firmware** with test mode code
2. **Open test-app.html** in Chrome/Edge/Opera
3. **Connect HiChord** via USB-C
4. **Click "Connect to HiChord"** - should enter test mode automatically
5. **Run automated tests** - firmware should respond to each button press
6. **Disconnect** - firmware should exit test mode automatically

## Important Notes

- **Test mode is INVISIBLE to end users** - it only activates via SysEx command 0x10
- **No UI changes** in normal operation - test mode only shows on OLED when active
- **Auto-disconnect safety** - test mode automatically exits when USB disconnects
- **No calibration changes** - ADC values are read-only for diagnostics
- **Production ready** - test mode doesn't affect normal synthesizer operation

## File Locations

- Test App: `/Users/ao/Documents/HiChord/hichord-test-procedure/test-app.html`
- Test App JS: `/Users/ao/Documents/HiChord/hichord-test-procedure/test-app.js`
- Firmware: `/Users/ao/Documents/HiChord/HiChord Git June 20/HiChord/src/main.cpp`
- MIDI Handler: `/Users/ao/Documents/HiChord/HiChord Git June 20/HiChord/src/midi.cpp`

## Button ID Mapping

For test response messages:

```
Chord Buttons:  1-7
Function Buttons:
  F1 (Settings) = 10
  F2 (Effects) = 11
  F3 (BPM/Mode) = 12
Joystick Directions: 0-8 (0=center, 1=up, 2=up-right, etc.)
Joystick Click: 20
```
