## Firmware Modification Plan for Enhanced Test Procedure Support

**HiChord™ Test Procedure Integration**

### Current State

The test procedure currently implements:
- WebMIDI connection via USB-C
- CC#127 handshake for MIDI-out enable (matching companion app)
- Volume detection via CC#7
- MIDI note detection for chord button testing
- SysEx request for hardware batch detection

### Proposed Firmware Enhancements

To fully automate the test procedure, the following firmware modifications are recommended:

---

## 1. Enhanced SysEx State Response

**Purpose**: Allow test procedure to auto-detect hardware batch and features

**Implementation** (`src/midi_handler.c`):

```cpp
// SysEx command: F0 7D 00 00 F7 (State Request)
// Response: F0 7D 00 01 [batch] [button_mode] [features] F7

void handleSysExStateRequest() {
    uint8_t sysexResponse[7] = {
        0xF0,  // SysEx start
        0x7D,  // HiChord manufacturer ID
        0x00,  // Command type: State
        0x01,  // Subcommand: Hardware Info
        0x00,  // Batch number (1, 2, or 4)
        0x00,  // Button mode (0=ADC, 1=I2C)
        0xF7   // SysEx end
    };

    // Determine batch based on features
    if (buttonMode == BUTTON_MODE_I2C && hasMicInput) {
        sysexResponse[4] = 4;  // Batch 4+
    } else if (hasBatteryDetection) {
        sysexResponse[4] = 2;  // Batch 2+
    } else {
        sysexResponse[4] = 1;  // Batch 1
    }

    // Button mode
    sysexResponse[5] = (buttonMode == BUTTON_MODE_I2C) ? 1 : 0;

    MIDI_sendSysEx(sysexResponse, 7);
}
```

**Test Procedure Benefit**: Automatically adapt test list based on detected hardware

---

## 2. Test Mode Activation

**Purpose**: Enter a special "test mode" that enables enhanced diagnostics

**Implementation** (`src/main.cpp`):

```cpp
// Hold F1 + F2 + F3 on boot for 3 seconds to enter test mode
bool testModeActive = false;

void checkTestMode() {
    if (fn1Pressed && fn2Pressed && fn3Pressed) {
        unsigned long holdStart = millis();
        while (millis() - holdStart < 3000) {
            if (!fn1Pressed || !fn2Pressed || !fn3Pressed) return;
            delay(10);
        }
        testModeActive = true;
        printToGui("TEST", "MODE");
        delay(1000);
    }
}
```

**Test Procedure Benefit**: Clear visual indication device is in test mode

---

## 3. Button/Joystick Input Reporting

**Purpose**: Send MIDI CC messages for button presses and joystick movements

**Implementation** (`src/main.cpp`):

```cpp
// Test Mode CC Assignments
#define CC_TEST_F1      50
#define CC_TEST_F2      51
#define CC_TEST_F3      52
#define CC_TEST_JOY_X   53
#define CC_TEST_JOY_Y   54
#define CC_TEST_JOY_BTN 55

void reportButtonState() {
    if (!testModeActive || !midioutOn) return;

    // Function buttons
    if (functionOnePressed && !functionOneWasPressed) {
        midi.controlChange(CC_TEST_F1, 127);
        functionOneWasPressed = true;
    } else if (!functionOnePressed && functionOneWasPressed) {
        midi.controlChange(CC_TEST_F1, 0);
        functionOneWasPressed = false;
    }

    // Repeat for F2, F3...

    // Joystick position (send on change)
    static int lastJoyX = 512, lastJoyY = 512;
    if (abs(joyLeftRightValue - lastJoyX) > 50) {
        midi.controlChange(CC_TEST_JOY_X, map(joyLeftRightValue, 0, 1023, 0, 127));
        lastJoyX = joyLeftRightValue;
    }
    if (abs(joyUpDownValue - lastJoyY) > 50) {
        midi.controlChange(CC_TEST_JOY_Y, map(joyUpDownValue, 0, 1023, 0, 127));
        lastJoyY = joyUpDownValue;
    }

    // Joystick button
    if (joyClickState && !joyClickWasPressed) {
        midi.controlChange(CC_TEST_JOY_BTN, 127);
        joyClickWasPressed = true;
    } else if (!joyClickState && joyClickWasPressed) {
        midi.controlChange(CC_TEST_JOY_BTN, 0);
        joyClickWasPressed = false;
    }
}
```

**Test Procedure Benefit**: Fully automated function button and joystick testing

---

## 4. Battery Level Reporting

**Purpose**: Expose battery percentage via MIDI CC

**Implementation** (`src/main.cpp`):

```cpp
#define CC_BATTERY_LEVEL 56

void reportBatteryLevel() {
    if (!testModeActive || !midioutOn) return;

    static unsigned long lastBatteryReport = 0;
    static int lastBatteryPercent = -1;

    if (millis() - lastBatteryReport > 1000) {  // Report every 1 second
        int batteryPercent = (int)batteryPercentage;
        if (batteryPercent != lastBatteryPercent) {
            midi.controlChange(CC_BATTERY_LEVEL, map(batteryPercent, 0, 100, 0, 127));
            lastBatteryPercent = batteryPercent;
        }
        lastBatteryReport = millis();
    }
}
```

**Test Procedure Benefit**: Automated battery indicator verification

---

## 5. USB Mode Detection

**Purpose**: Report current USB mode (Audio vs MIDI)

**Implementation** (`src/usb/usbd_if.c`):

```cpp
#define CC_USB_MODE 57

void reportUSBMode() {
    #ifdef USBD_USE_AUDIO_ONLY
        midi.controlChange(CC_USB_MODE, 1);  // Audio mode
    #elif defined(USBD_USE_MIDI)
        midi.controlChange(CC_USB_MODE, 2);  // MIDI mode
    #else
        midi.controlChange(CC_USB_MODE, 3);  // Unified mode
    #endif
}
```

**Test Procedure Benefit**: Verify correct USB configuration

---

## 6. Charging State Reporting

**Purpose**: Report LED state via MIDI for automated verification

**Implementation** (`src/main.cpp`):

```cpp
#define CC_CHARGING_STATE 58

void reportChargingState() {
    if (!testModeActive || !midioutOn) return;

    static int lastChargingState = -1;
    int currentState = 0;  // 0=not charging, 1=charging (red), 2=charged (blue)

    // Detect charging state from battery voltage and USB connection
    bool usbConnected = (batteryVoltage > 4.0f);  // Simplified detection
    if (usbConnected) {
        currentState = (batteryPercentage >= 99.0f) ? 2 : 1;
    }

    if (currentState != lastChargingState) {
        midi.controlChange(CC_CHARGING_STATE, currentState * 60);
        lastChargingState = currentState;
    }
}
```

**Test Procedure Benefit**: Automated charging LED verification (partial)

---

## 7. OLED Content Reporting (Advanced)

**Purpose**: Report current OLED content for verification

**Implementation** (`src/main.cpp`):

```cpp
// SysEx: F0 7D 01 00 [screen_id] F7 (OLED Content Request)
// Response: F0 7D 01 01 [screen_id] [title] [value] F7

void handleOLEDContentRequest(uint8_t screenId) {
    uint8_t response[32] = {0xF0, 0x7D, 0x01, 0x01, screenId};
    int idx = 5;

    // Example: Volume screen
    if (displayVolumeGUI) {
        response[idx++] = 'V';  // 'VOLUME'
        response[idx++] = 'O';
        response[idx++] = 'L';
        // ... encode current volume value
    }

    response[idx] = 0xF7;
    MIDI_sendSysEx(response, idx + 1);
}
```

**Test Procedure Benefit**: Verify OLED displays correct information

---

## Implementation Priority

**Phase 1 (High Priority):**
1. Enhanced SysEx state response (hardware detection)
2. Test mode activation
3. Button/joystick input reporting

**Phase 2 (Medium Priority):**
4. Battery level reporting
5. USB mode detection
6. Charging state reporting

**Phase 3 (Low Priority):**
7. OLED content reporting (complex, optional)

---

## MIDI CC Allocation Summary

| CC# | Purpose | Values |
|-----|---------|--------|
| 7   | Volume (existing) | 0-127 |
| 20  | BPM (existing) | 0-127 |
| 21  | Key (existing) | 0-11 |
| 22  | Octave (existing) | 0-3 |
| 23  | Joystick Mode (existing) | 0-1 |
| 50  | Test: F1 Button | 0/127 |
| 51  | Test: F2 Button | 0/127 |
| 52  | Test: F3 Button | 0/127 |
| 53  | Test: Joystick X | 0-127 |
| 54  | Test: Joystick Y | 0-127 |
| 55  | Test: Joystick Button | 0/127 |
| 56  | Test: Battery Level | 0-127 (%) |
| 57  | Test: USB Mode | 1=Audio, 2=MIDI, 3=Unified |
| 58  | Test: Charging State | 0=None, 60=Charging, 120=Charged |
| 127 | Handshake (existing) | 0/1 |

---

## SysEx Commands Summary

| Command | Request | Response |
|---------|---------|----------|
| Hardware Info | `F0 7D 00 00 F7` | `F0 7D 00 01 [batch] [btn_mode] F7` |
| OLED Content | `F0 7D 01 00 [screen] F7` | `F0 7D 01 01 [screen] [data...] F7` |

---

## Testing Workflow

1. **Boot Test Mode**: Hold F1+F2+F3 on startup
2. **Connect USB-C**: Test procedure connects via WebMIDI
3. **Handshake**: Send CC#127=1
4. **Request Hardware Info**: Send SysEx `F0 7D 00 00 F7`
5. **Run Automated Tests**:
   - Volume: Monitor CC#7
   - Buttons: Monitor CC#50-52, 55
   - Joystick: Monitor CC#53-54
   - MIDI Notes: Monitor note-on messages
   - Battery: Monitor CC#56
6. **Manual Verification**: Technician validates audio, display, etc.

---

## Backward Compatibility

All test mode features are:
- **Optional**: Only active when test mode is enabled
- **Non-intrusive**: No impact on normal operation
- **Safe**: No persistent state changes

Existing firmware behavior remains unchanged when test mode is not activated.

---

## Future Enhancements

- **Calibration Data Export**: Export joystick/button calibration via SysEx
- **Factory Reset Command**: SysEx command to reset to factory defaults
- **Serial Number Reporting**: Include serial number in hardware info
- **Production Logging**: Timestamp and record all test results on device

---

**Document Version**: 1.0
**Last Updated**: 2025-10-21
**Status**: Planning Phase
