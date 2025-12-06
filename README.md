# HiChord Test Procedure v2.0

**Dual-mode production quality assurance protocol for HiChord synthesizer units.**

🔗 **Live Site:** https://hichord.github.io/hichord-test-procedure/

## Overview

Comprehensive, dual-mode test procedure combining traditional manual checklists with automated USB-C connected testing. Designed with a minimalist aesthetic (Teenage Engineering meets NASA) for efficient production testing.

## Dual Mode System

### 📋 Manual Mode
Traditional checklist-based testing requiring no USB connection:
- Step-by-step procedures with expected results
- Real OLED GUI mockups from firmware
- Next/Previous navigation (no autoscroll)
- Clean, focused interface
- Works offline

### 🔌 Automated Mode
Interactive USB-C connected testing with real-time validation:
- WebMIDI connection to HiChord
- Automated input detection (buttons, joystick, volume)
- Hardware batch auto-detection (ADC vs I2C button systems)
- Real-time test results
- Guided prompts for technicians
- Combines automated + manual verification

## Test Coverage (12 Tests)

1. **Charging Indicator** - USB-C LED (red charging, blue charged)
2. **Power On Sequence** - OLED boot screen "HICHORD REV 2.08"
3. **Volume Control** - Slider + OLED display
4. **Function Buttons** - F1 (gray), F2 (yellow), F3 (red)
5. **Joystick 8 Directions** - UP, DOWN, LEFT, RIGHT + diagonals
6. **Joystick Button Press** - Click detection
7. **Speaker Test** - Internal speaker audio
8. **Headphone Output** - 3.5mm stereo audio
9. **USB-C Audio Output** - Digital audio over USB
10. **MIDI Output** - MIDI over USB-C
11. **Microphone Input** - Recording/playback *(Batch 4+ only)*
12. **Battery Indicator** - OLED battery display *(Batch 2+ only)*

## Hardware Batch Detection

The automated mode automatically detects HiChord hardware revision:

- **Batch 1**: Basic features, ADC button system
- **Batch 2+**: Battery detection, ADC button system
- **Batch 4+**: Microphone input, I2C button system (TCA9555)

Tests automatically adapt based on detected hardware.

## Features

### Manual Mode
- ✓ Real OLED mockups showing expected display states
- ✓ Detailed procedures for each test
- ✓ Expected results clearly documented
- ✓ Batch-specific test filtering
- ✓ Keyboard navigation (← →  arrows)
- ✓ No USB connection required

### Automated Mode
- ✓ WebMIDI API for USB-C communication
- ✓ Real-time button press detection
- ✓ Joystick direction/click validation
- ✓ Volume control monitoring (CC7)
- ✓ MIDI note output verification
- ✓ Hardware batch identification
- ✓ Test progress logging
- ✓ Automated pass/fail determination

### Both Modes
- ✓ Clean next/back navigation
- ✓ Test progress tracking
- ✓ LocalStorage result persistence
- ✓ Print-optimized reports
- ✓ Summary with statistics
- ✓ Export capability

## Usage

### Manual Mode

1. Open https://hichord.github.io/hichord-test-procedure/
2. Select "MANUAL MODE"
3. Follow each test procedure step-by-step
4. Use NEXT/PREVIOUS buttons to navigate
5. Complete all applicable tests
6. Print or review summary

### Automated Mode

1. Connect HiChord to computer via USB-C
2. Open https://hichord.github.io/hichord-test-procedure/
3. Select "AUTOMATED MODE"
4. Click "CONNECT TO HICHORD"
5. Grant WebMIDI permissions when prompted
6. Follow on-screen instructions for each test
7. Automated tests run with RUN TEST button
8. Manual verification tests provide guided instructions
9. Review summary when complete

**Browser Requirements:** Chrome, Edge, or Opera (WebMIDI API support)

## Technical Stack

- **Pure Web Technologies**: HTML, CSS, JavaScript (zero dependencies)
- **WebMIDI API**: Real-time USB-C MIDI communication
- **LocalStorage**: Persistent test result tracking
- **Responsive Design**: Desktop and mobile support
- **Print Optimization**: Professional report generation

## Design Philosophy

**Teenage Engineering meets NASA**

- Minimalist interface with maximum clarity
- High contrast black/white with strategic accent colors
- Uppercase typography for technical credibility
- Grid-based layouts with precise spacing
- Systematic organization for efficiency
- Clean iconography and visual hierarchy

## File Structure

```
hichord-test-procedure/
├── index.html              # Main HTML structure
├── style.css               # Dual-mode styling
├── app.js                  # Main application logic
├── manual-tests.js         # Manual test definitions
├── automated-tests.js      # Automated test system + WebMIDI
└── README.md              # This file
```

## Development

### Local Testing

```bash
# Serve locally
python3 -m http.server 8000
# or
npx serve
```

Open http://localhost:8000

### Deployment

Deployed via GitHub Pages automatically on push to `main` branch.

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Manual Mode | ✓ | ✓ | ✓ | ✓ |
| Automated Mode | ✓ | ✓ | ✗ | ✗ |
| WebMIDI Support | ✓ | ✓ | ✗ | ✗ |

*Note: Automated mode requires WebMIDI API (Chrome/Edge/Opera only)*

## Keyboard Shortcuts

- **→** Right Arrow: Next test
- **←** Left Arrow: Previous test
- **Ctrl/Cmd + P**: Print report
- **Ctrl/Cmd + R**: Reset tests (with confirmation)

## Future Enhancements

- [ ] Enhanced hardware batch detection via SysEx
- [ ] More granular button input mapping for I2C vs ADC systems
- [ ] Audio level metering for speaker/headphone tests
- [ ] MIDI message logging and analysis
- [ ] Exportable test reports (JSON/CSV)
- [ ] Multi-language support
- [ ] Test result cloud sync

## License

MIT License - Copyright (c) 2025 HiChord

## Credits

Design and development assisted by [Claude Code](https://claude.com/claude-code)

---

**Version:** 2.0
**Last Updated:** 2025
**Repository:** https://github.com/HiChord/hichord-test-procedure
