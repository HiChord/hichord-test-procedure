// Manual Test Definitions
// Traditional checklist mode with expected results

const manualTests = [
    {
        id: 1,
        name: "Charging Indicator",
        procedure: [
            "Locate USB-C port on side of HiChord™",
            "Connect USB-C cable to HiChord and power source",
            "Observe LED indicator on side panel"
        ],
        expected: [
            { text: "LED shows RED when charging", color: "red" },
            { text: "LED shows BLUE when fully charged", color: "blue" },
            { text: "LED is visible and bright", color: null }
        ],
        oled: null,
        image: "images/Side View.png"
    },
    {
        id: 2,
        name: "Power On Sequence",
        procedure: [
            "Slide power switch to ON position",
            "Observe OLED display boot animation",
            "Verify firmware version appears"
        ],
        expected: [
            "Display shows \"HICHORD\" title with animation",
            "Version \"REV 1.95\" appears below title",
            "Boot sequence completes within 3 seconds",
            "No screen artifacts or glitches"
        ],
        oled: {
            type: "boot",
            content: ["HICHORD", "REV 1.95"]
        }
    },
    {
        id: 3,
        name: "Comprehensive Button Test",
        image: "images/Front View.png",
        procedure: [
            "This test verifies ALL buttons are working correctly",
            "",
            "CHORD BUTTONS (7 buttons):",
            "  Press each chord button 1-7 in sequence",
            "  Each should produce sound and show chord on OLED",
            "",
            "FUNCTION BUTTONS (3 buttons):",
            "  Press F1 (Settings) - should show KEY/OCTAVE menu",
            "  Press F2 (Effects) - should show effect selection",
            "  Press F3 (BPM/Mode) - should show BPM menu",
            "",
            "JOYSTICK:",
            "  Hold button 1, move joystick in all 8 directions",
            "  Each direction should modify chord display",
            "  Click joystick - should show looper GUI",
            "",
            "VOLUME WHEEL:",
            "  Press button 1, rotate volume wheel fully",
            "  OLED should show volume indicator",
            "  Audio level should change smoothly"
        ],
        expected: [
            "All 7 chord buttons respond immediately",
            "All 3 function buttons open correct menus",
            "Joystick registers all 8 directions + click",
            "Volume wheel changes audio level smoothly",
            "OLED updates correctly for each input",
            "No stuck, missed, or double-registered buttons"
        ],
        oled: null,
        note: "ADC vs I2C: Batch 1-3 use ADC buttons (analog), Batch 4+ use I2C buttons (digital). Both should respond instantly with no difference in behavior."
    },
    {
        id: 4,
        name: "Volume Control",
        image: "images/Top View.png",
        procedure: [
            "Locate volume slider on top edge",
            "Press any chord button (1-7) to generate sound",
            "Move slider from minimum to maximum position",
            "Observe OLED volume indicator"
        ],
        expected: [
            "Volume bar appears on OLED when slider moved",
            "Audio level changes smoothly with slider",
            "Volume percentage displays (0-100%)",
            "No crackling or distortion at any level"
        ],
        oled: {
            type: "volume",
            content: ["VOLUME", "75%"]
        }
    },
    {
        id: 5,
        name: "Function Buttons (F1, F2, F3)",
        image: "images/BUtton numbers 2.png",
        procedure: [
            "Press each function button ONCE after startup",
            "Verify expected menu appears on OLED",
            "Check button registers and displays correct default menu"
        ],
        expected: [
            "Each button press registers immediately",
            "Correct menu appears with default startup values",
            "OLED displays clearly with inverted header bar"
        ],
        oled: {
            type: "function3_startup",
            buttons: [
                {
                    button: "F1",
                    name: "Settings",
                    color: "#666666",
                    icon: "⚙",
                    display: "dual",
                    line1: { label: "KEY", value: "C", arrows: "←→" },
                    line2: { label: "OCTAVE", value: "+1", arrows: "↑↓" }
                },
                {
                    button: "F2",
                    name: "Effects",
                    color: "#FFD700",
                    icon: "〜",
                    display: "effect",
                    effectName: "< VERB >",
                    hint: "↑ change sound"
                },
                {
                    button: "F3",
                    name: "BPM/Mode",
                    color: "#FF4500",
                    icon: "⏱",
                    display: "bpm",
                    bpm: "120",
                    topHint: "MODE ^",
                    bottomHint: "BPM < >"
                }
            ]
        }
    },
    {
        id: 6,
        name: "Chord Buttons (1-7) in C Major",
        image: "images/BUtton numbers 2.png",
        procedure: [
            "Press each chord button 1-7 individually",
            "Verify chord name and number display on OLED",
            "Listen for clear audio (no distortion)"
        ],
        expected: [
            "Each button triggers immediately",
            "OLED shows: chord number (circled, top left) + key letter (top right) + chord name (center)",
            "Clear audio with no distortion",
            "No stuck notes or audio glitches"
        ],
        oled: {
            type: "chord7_cmajor",
            key: "C",
            chords: [
                { button: 1, chord: "C" },
                { button: 2, chord: "Dm" },
                { button: 3, chord: "Em" },
                { button: 4, chord: "F" },
                { button: 5, chord: "G" },
                { button: 6, chord: "Am" },
                { button: 7, chord: "Bdim" }
            ]
        }
    },
    {
        id: 7,
        name: "Joystick Chord Modification (Hold Button 1)",
        image: "images/Top View.png",
        procedure: [
            "Hold CHORD BUTTON 1",
            "Move joystick in each of 8 directions + center",
            "Verify chord modification displays on OLED",
            "Listen for clear audio (no distortion)"
        ],
        expected: [
            "Joystick responds smoothly in all directions",
            "OLED shows: chord number (1, circled) + key (C) + modified chord name",
            "Clear audio with no distortion",
            "Center position returns to default chord (C)"
        ],
        oled: {
            type: "joystick8_button1",
            key: "C",
            buttonNumber: 1,
            directions: [
                { dir: "CENTER", chord: "C" },
                { dir: "UP", chord: "Cm" },
                { dir: "UP-RIGHT", chord: "C7" },
                { dir: "RIGHT", chord: "CM7" },
                { dir: "DOWN-RIGHT", chord: "CM9" },
                { dir: "DOWN", chord: "Csus4" },
                { dir: "DOWN-LEFT", chord: "C6" },
                { dir: "LEFT", chord: "Cdim" },
                { dir: "UP-LEFT", chord: "C+" }
            ]
        }
    },
    {
        id: 8,
        name: "Joystick Click (Looper)",
        image: "images/Top View.png",
        procedure: [
            "Click joystick button (press down)",
            "Verify looper GUI appears on OLED",
            "Click again to cycle through: REC → PLAY → STOP"
        ],
        expected: [
            "Joystick click registers immediately",
            "Looper GUI displays with \"rec loop\" icon",
            "Second click shows \"play loop\" icon",
            "Third click clears loop"
        ],
        oled: {
            type: "looper",
            states: [
                { state: "REC", icon: "⏺", text: "rec loop" },
                { state: "PLAY", icon: "⏵", text: "play loop" }
            ]
        }
    },
    {
        id: 9,
        name: "Headphone Output",
        image: "images/Side View.png",
        procedure: [
            "Connect headphones to 3.5mm jack on right side",
            "Verify internal speaker mutes automatically",
            "Set volume to 50%",
            "Press chord buttons 1-7",
            "Listen for stereo audio in headphones"
        ],
        expected: [
            "Speaker mutes when headphones connected",
            "Clear stereo audio in both L and R channels",
            "No ground noise or interference",
            "Volume control functions properly",
            "Clean audio output at all volume levels"
        ],
        oled: null
    },
    {
        id: 10,
        name: "USB-C Audio Output",
        image: "images/Side View.png",
        procedure: [
            "Connect HiChord to computer via USB-C",
            "  Note: HiChord uses unified USB mode (Audio + MIDI simultaneously)",
            "Computer should recognize \"HiChord\" audio device automatically",
            "Set computer audio output to \"HiChord\"",
            "Press chord buttons 1-7 and verify audio on computer speakers",
            "Test at different volume levels (adjust HiChord volume wheel)",
            "Verify low latency and clean digital audio"
        ],
        expected: [
            "HiChord appears as USB audio device",
            "Class-compliant (no driver needed)",
            "Clean digital audio output",
            "Low latency (<20ms)",
            "No dropouts or glitches",
            "USB connection stable"
        ],
        oled: null
    },
    {
        id: 11,
        name: "MIDI Output",
        image: "images/Side View.png",
        procedure: [
            "Connect HiChord to computer via USB-C",
            "Open DAW or MIDI monitor software",
            "Select \"HiChord\" as MIDI input device",
            "Press chord buttons 1-7",
            "Verify MIDI note messages in monitor"
        ],
        expected: [
            "HiChord appears as USB MIDI device",
            "MIDI note-on/note-off messages sent",
            "Each chord sends correct note data",
            "MIDI timing is accurate",
            "CC messages sent for controls",
            "No stuck notes or errors"
        ],
        oled: null
    },
    {
        id: 12,
        name: "Microphone Input",
        batch: "4+",
        skipBatch: ["1", "2", "3"],
        procedure: [
            "Press F3 button to open mode selection menu",
            "Move joystick RIGHT repeatedly to cycle modes until \"MIC SAMPLE\" appears",
            "  (Mode order: ONESHOT → STRUM → REPEAT → SEQUENCER → CHORDHIRO → EARTRAINER → TUNER → MIC SAMPLE)",
            "OLED should display: \"MIC SAMPLE\" / \"Hold Chord Btn 1 to Record\"",
            "Press and HOLD chord button 1 to start recording",
            "Speak or sing a note into the microphone (located on front panel)",
            "Release chord button 1 to stop recording (max 5.0 seconds)",
            "OLED shows sample length and detected pitch",
            "Press chord buttons 1-7 to play back sample chromatically",
            "Verify pitch shifts correctly across all buttons"
        ],
        expected: [
            "Microphone captures audio clearly",
            "Recording indicator shows on OLED",
            "Recorded sample plays back correctly",
            "Sample mapped chromatically across buttons",
            "No excessive noise or clipping",
            "Pitch detection works accurately"
        ],
        oled: {
            type: "recording",
            content: ["● REC", "███░░░░░"]
        },
        note: "BATCH 4+ ONLY - Skip for Batch 1-3 (no microphone)"
    },
    {
        id: 13,
        name: "Battery Indicator",
        batch: "2+",
        skipBatch: ["1"],
        procedure: [
            "Disconnect USB-C cable (run on battery)",
            "Observe top-right corner of OLED",
            "Battery percentage should be visible",
            "Connect USB-C and verify charging icon"
        ],
        expected: [
            "Battery percentage displays in top-right",
            "Level updates accurately",
            "Low battery warning below 20%",
            "Charging icon when USB connected",
            "Battery icon renders correctly"
        ],
        oled: {
            type: "battery",
            content: ["85%", "▮▮▮▯"]
        },
        note: "BATCH 2+ ONLY - Skip for Batch 1 (no battery detection)"
    }
];

// OLED Renderer for Manual Mode
function renderOLED(oledData) {
    if (!oledData) return '';

    const oledTypes = {
        boot: (data) => `
            <div class="oled-screen">
                <div class="oled-content centered">
                    <div class="oled-text-title">${data[0]}</div>
                    <div class="oled-text-version">${data[1]}</div>
                </div>
            </div>
        `,
        volume: (data) => `
            <div class="oled-screen">
                <div class="oled-content">
                    <div class="oled-header-bar">
                        <div class="oled-text">${data[0]}</div>
                    </div>
                    <div class="oled-body centered">
                        <div class="oled-text-large">${data[1]}</div>
                    </div>
                </div>
            </div>
        `,
        menu: (data) => `
            <div class="oled-screen">
                <div class="oled-content">
                    <div class="oled-header-bar">
                        <div class="oled-text">${data[0]}</div>
                    </div>
                    <div class="oled-body centered">
                        <div class="oled-text-large">${data[1]}</div>
                    </div>
                </div>
            </div>
        `,
        recording: (data) => `
            <div class="oled-screen">
                <div class="oled-content centered">
                    <div class="oled-text-medium">${data[0]}</div>
                    <div class="oled-progress-bar">
                        <div class="oled-progress-fill">${data[1]}</div>
                    </div>
                </div>
            </div>
        `,
        battery: (data) => `
            <div class="oled-screen">
                <div class="oled-content">
                    <div class="oled-battery-display">
                        <div class="battery-icon-large">
                            <div class="battery-level">${data[1]}</div>
                        </div>
                        <div class="battery-percentage">${data[0]}</div>
                    </div>
                </div>
            </div>
        `,
        joystick8: (data) => {
            // Show ONE direction → ONE fully simulated OLED screen per row
            const directions = data.directions;
            let html = '<div class="single-test-list">';

            // Center position first (highlighted)
            const center = directions[0];
            html += `
                <div class="single-test-row center-highlight">
                    <div class="button-icon-display">
                        <div class="joy-arrow-icon">●</div>
                        <div class="button-label">CENTER</div>
                    </div>

                    <div class="arrow-single">→</div>

                    <div class="oled-screen-full">
                        <div class="oled-chord-display">${center.chord}</div>
                    </div>
                </div>
            `;

            // All 8 directions
            const directionOrder = [
                { idx: 1, arrow: '↑', label: 'UP' },
                { idx: 2, arrow: '↗', label: 'UP-RIGHT' },
                { idx: 3, arrow: '→', label: 'RIGHT' },
                { idx: 4, arrow: '↘', label: 'DOWN-RIGHT' },
                { idx: 5, arrow: '↓', label: 'DOWN' },
                { idx: 6, arrow: '↙', label: 'DOWN-LEFT' },
                { idx: 7, arrow: '←', label: 'LEFT' },
                { idx: 8, arrow: '↖', label: 'UP-LEFT' }
            ];

            directionOrder.forEach(({idx, arrow, label}) => {
                const dir = directions[idx];
                html += `
                    <div class="single-test-row">
                        <div class="button-icon-display">
                            <div class="joy-arrow-icon">${arrow}</div>
                            <div class="button-label">${label}</div>
                        </div>

                        <div class="arrow-single">→</div>

                        <div class="oled-screen-full">
                            <div class="oled-chord-display">${dir.chord}</div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            return html;
        },
        chord7: (data) => {
            // Show ONE chord button → ONE fully simulated OLED screen per row
            const chords = data.chords;
            let html = '<div class="single-test-list">';

            chords.forEach(chord => {
                html += `
                    <div class="single-test-row">
                        <div class="button-icon-display">
                            <div class="chord-button-number">${chord.button}</div>
                            <div class="button-label">Button ${chord.button}</div>
                        </div>

                        <div class="arrow-single">→</div>

                        <div class="oled-screen-full">
                            <div class="oled-chord-display">${chord.chord}</div>
                        </div>

                        <div class="chord-name-label">${chord.name}</div>
                    </div>
                `;
            });

            html += '</div>';
            return html;
        },
        function3: (data) => {
            // Show ONE button → ONE OLED screen per menu item
            const menus = data.menus;
            let html = '<div class="single-test-list">';

            menus.forEach(menu => {
                menu.items.forEach(item => {
                    html += `
                        <div class="single-test-row">
                            <div class="button-icon-display">
                                <div class="button-icon-square" style="background-color: ${menu.color}; color: ${menu.color === '#FFD700' ? '#000' : '#FFF'};">
                                    ${menu.icon}
                                </div>
                                <div class="button-label">${menu.button}</div>
                            </div>

                            <div class="arrow-single">→</div>

                            <div class="oled-screen-full">
                                <div class="oled-header-inverted">${item.header || menu.name}</div>
                                <div class="oled-body-centered">${item.value || item.single}</div>
                            </div>
                        </div>
                    `;
                });
            });

            html += '</div>';
            return html;
        },
        function3_startup: (data) => {
            // Show 3 function buttons - press ONCE after startup with ACTUAL firmware OLED displays
            const buttons = data.buttons;
            let html = '<div class="single-test-list">';

            buttons.forEach(btn => {
                let oledContent = '';

                if (btn.display === 'dual') {
                    // F1: KEY + OCTAVE dual line display
                    oledContent = `
                        <div class="oled-dual-line">
                            <div class="oled-dual-row">
                                <span class="oled-label">${btn.line1.label}</span>
                                <span class="oled-arrows">${btn.line1.arrows}</span>
                                <span class="oled-value">${btn.line1.value}</span>
                            </div>
                            <div class="oled-divider"></div>
                            <div class="oled-dual-row">
                                <span class="oled-label">${btn.line2.label}</span>
                                <span class="oled-arrows">${btn.line2.arrows}</span>
                                <span class="oled-value">${btn.line2.value}</span>
                            </div>
                        </div>
                    `;
                } else if (btn.display === 'effect') {
                    // F2: Effect selection display
                    oledContent = `
                        <div class="oled-effect-display">
                            <div class="oled-effect-name">${btn.effectName}</div>
                            <div class="oled-hint">${btn.hint}</div>
                        </div>
                    `;
                } else if (btn.display === 'bpm') {
                    // F3: BPM display
                    oledContent = `
                        <div class="oled-bpm-display">
                            <div class="oled-bpm-top">${btn.topHint}</div>
                            <div class="oled-bpm-number">${btn.bpm}</div>
                            <div class="oled-bpm-bottom">${btn.bottomHint}</div>
                        </div>
                    `;
                }

                html += `
                    <div class="single-test-row">
                        <div class="button-icon-display">
                            <div class="button-icon-square" style="background-color: ${btn.color}; color: ${btn.color === '#FFD700' ? '#000' : '#FFF'};">
                                ${btn.icon}
                            </div>
                            <div class="button-label">${btn.button}</div>
                        </div>

                        <div class="arrow-single">→</div>

                        <div class="oled-screen-full">
                            ${oledContent}
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            return html;
        },
        chord7_cmajor: (data) => {
            // Show 7 chord buttons with pixel-perfect OLED display
            // Display shows: chord number (circled, top left) + key letter (top right) + chord name (center)
            const chords = data.chords;
            const key = data.key;
            let html = '<div class="single-test-list">';

            chords.forEach(chord => {
                html += `
                    <div class="single-test-row">
                        <div class="button-icon-display">
                            <div class="chord-button-number">${chord.button}</div>
                            <div class="button-label">Button ${chord.button}</div>
                        </div>

                        <div class="arrow-single">→</div>

                        <div class="oled-screen-full">
                            <div class="oled-chord-accurate">
                                <div class="oled-chord-number-circle">${chord.button}</div>
                                <div class="oled-chord-key-letter">${key}</div>
                                <div class="oled-chord-name-center">${chord.chord}</div>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            return html;
        },
        joystick8_button1: (data) => {
            // Show joystick modification with pixel-perfect OLED (chord number + key + modified chord name)
            const directions = data.directions;
            const key = data.key;
            const buttonNumber = data.buttonNumber;
            let html = '<div class="single-test-list">';

            // CENTER position first (highlighted)
            const center = directions[0];
            html += `
                <div class="single-test-row center-highlight">
                    <div class="button-icon-display">
                        <div class="joy-arrow-icon">●</div>
                        <div class="button-label">CENTER</div>
                    </div>

                    <div class="arrow-single">→</div>

                    <div class="oled-screen-full">
                        <div class="oled-chord-accurate">
                            <div class="oled-chord-number-circle">${buttonNumber}</div>
                            <div class="oled-chord-key-letter">${key}</div>
                            <div class="oled-chord-name-center">${center.chord}</div>
                        </div>
                    </div>
                </div>
            `;

            // All 8 directions
            const directionOrder = [
                { idx: 1, arrow: '↑', label: 'UP' },
                { idx: 2, arrow: '↗', label: 'UP-RIGHT' },
                { idx: 3, arrow: '→', label: 'RIGHT' },
                { idx: 4, arrow: '↘', label: 'DOWN-RIGHT' },
                { idx: 5, arrow: '↓', label: 'DOWN' },
                { idx: 6, arrow: '↙', label: 'DOWN-LEFT' },
                { idx: 7, arrow: '←', label: 'LEFT' },
                { idx: 8, arrow: '↖', label: 'UP-LEFT' }
            ];

            directionOrder.forEach(({idx, arrow, label}) => {
                const dir = directions[idx];
                html += `
                    <div class="single-test-row">
                        <div class="button-icon-display">
                            <div class="joy-arrow-icon">${arrow}</div>
                            <div class="button-label">${label}</div>
                        </div>

                        <div class="arrow-single">→</div>

                        <div class="oled-screen-full">
                            <div class="oled-chord-accurate">
                                <div class="oled-chord-number-circle">${buttonNumber}</div>
                                <div class="oled-chord-key-letter">${key}</div>
                                <div class="oled-chord-name-center">${dir.chord}</div>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            return html;
        },
        looper: (data) => {
            // Show looper GUI states
            const states = data.states;
            let html = '<div class="single-test-list">';

            states.forEach((state, idx) => {
                html += `
                    <div class="single-test-row">
                        <div class="button-icon-display">
                            <div class="joy-arrow-icon">⏺</div>
                            <div class="button-label">Click ${idx + 1}</div>
                        </div>

                        <div class="arrow-single">→</div>

                        <div class="oled-screen-full">
                            <div class="oled-looper-display">
                                <div class="looper-icon">${state.icon}</div>
                                <div class="looper-text">${state.text}</div>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            return html;
        }
    };

    const renderer = oledTypes[oledData.type];
    if (!renderer) return '';

    // Special handling for custom types - pass full data object
    if (oledData.type === 'function3_startup') {
        return `
            <div class="oled-mockup function-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (Press Each Button ONCE)</div>
            </div>
        `;
    }

    if (oledData.type === 'chord7_cmajor') {
        return `
            <div class="oled-mockup chord-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display + Sound (C Major Key)</div>
            </div>
        `;
    }

    if (oledData.type === 'joystick8_button1') {
        return `
            <div class="oled-mockup joystick-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (Hold Button 1 + Move Joystick)</div>
            </div>
        `;
    }

    if (oledData.type === 'looper') {
        return `
            <div class="oled-mockup looper-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (Joystick Click)</div>
            </div>
        `;
    }

    if (oledData.type === 'joystick8') {
        return `
            <div class="oled-mockup joystick-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (All 8 Directions + Center)</div>
            </div>
        `;
    }

    if (oledData.type === 'chord7') {
        return `
            <div class="oled-mockup chord-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (All 7 Chord Buttons)</div>
            </div>
        `;
    }

    if (oledData.type === 'function3') {
        return `
            <div class="oled-mockup function-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (Menu Examples)</div>
            </div>
        `;
    }

    return `
        <div class="oled-mockup">
            ${renderer(oledData.content)}
            <div class="mockup-label">Expected OLED Display</div>
        </div>
    `;
}

// Build HTML for manual test
function buildManualTestHTML(test) {
    const batchNote = test.note ? `
        <div class="batch-note">
            <strong>NOTE:</strong> ${test.note}
        </div>
    ` : '';

    const procedureHTML = test.procedure.map(step =>
        `<li>${step}</li>`
    ).join('');

    const expectedHTML = test.expected.map(item => {
        const itemText = typeof item === 'string' ? item : item.text;
        const itemColor = typeof item === 'object' ? item.color : null;
        const colorStyle = itemColor ? ` style="color: ${itemColor}; font-weight: 700;"` : '';
        return `<li${colorStyle}>${itemText}</li>`;
    }).join('');

    const oledHTML = renderOLED(test.oled);

    const imageHTML = test.image ? `
        <div class="device-image">
            <img src="${test.image}" alt="${test.name}" />
        </div>
    ` : '';

    return `
        <div class="manual-test" data-test-id="${test.id}">
            <div class="test-header">
                <div class="test-number">${String(test.id).padStart(2, '0')}</div>
                <h2>${test.name}</h2>
                ${test.batch ? `<span class="batch-tag">Batch ${test.batch}</span>` : ''}
            </div>

            <div class="test-body">
                ${imageHTML}

                <div class="procedure-section">
                    <h3>Test Procedure</h3>
                    <ol>${procedureHTML}</ol>
                </div>

                ${oledHTML}

                <div class="expected-section">
                    <h3>Expected Results</h3>
                    <ul>${expectedHTML}</ul>
                </div>

                ${batchNote}
            </div>
        </div>
    `;
}
