# HiChord Test Procedure

Production quality assurance protocol for HiChord synthesizer units.

## Overview

This web-based test procedure provides a comprehensive, interactive testing workflow for HiChord production units. Designed with a minimalist aesthetic inspired by Teenage Engineering and NASA, it ensures thorough quality assurance across all hardware and software features.

## Features

- **12 comprehensive tests** covering all HiChord functionality
- **Interactive tracking** with pass/fail/skip states
- **OLED display mockups** showing expected screen states
- **Persistent results** saved in browser localStorage
- **Printable reports** for documentation
- **Batch-specific tests** for different hardware revisions
- **Progress tracking** with visual indicators

## Tests Covered

1. Charging Indicator (USB-C)
2. Power On Sequence (OLED boot screen)
3. Volume Control (slider + display)
4. Function Buttons (F1, F2, F3)
5. Joystick 8-Direction Input
6. Joystick Button Press
7. Built-in Speaker
8. Headphone Output (3.5mm)
9. USB-C Audio Output
10. MIDI Over USB-C
11. Battery Level Indicator (Batch 2+)
12. Microphone Input (Batch 4+)

## Usage

1. Open `index.html` in a web browser
2. Follow each test procedure in sequence
3. Mark tests as PASS, FAIL, or SKIP
4. Review summary at bottom
5. Print or export results for records

## Deployment

This page is designed to be deployed as a static GitHub Pages site:

```bash
# Create GitHub repository
gh repo create hichord-test-procedure --public --source=. --description "Production test procedure for HiChord synthesizer" --push

# Enable GitHub Pages
gh repo edit --enable-pages --pages-branch main --pages-path /
```

## Technologies

- Pure HTML/CSS/JavaScript (no dependencies)
- LocalStorage for persistent test results
- Print-optimized styling
- Responsive design for desktop and mobile

## Design Philosophy

**Teenage Engineering meets NASA**

- Minimalist, clean interface
- High contrast black and white with strategic color accents
- Clear typography with uppercase headings
- Precision and clarity in every element
- Technical credibility through systematic organization

## License

MIT License - Copyright (c) 2025 HiChord

---

Generated with [Claude Code](https://claude.com/claude-code)
