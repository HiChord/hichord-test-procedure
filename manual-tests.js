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
        id: 4,
        name: "Function Buttons",
        image: "images/BUtton numbers 2.png",
        procedure: [
            "Press F1 (gray button) - should open Settings menu",
            "  • Use joystick to navigate: KEY, OCTAVE, PRESET",
            "  • Current selection shows on OLED (e.g., \"KEY\" / \"C\")",
            "Press F1 again to close menu",
            "Press F2 (yellow button) - should open Effects menu",
            "  • Use joystick to navigate: GLIDE, REVERB, CHORUS, DELAY, etc.",
            "  • Current selection shows on OLED (e.g., \"GLIDE\" / \"OFF\")",
            "Press F2 again to close menu",
            "Press F3 (red button) - should open Modes menu",
            "  • Use joystick to navigate mode options",
            "  • Current mode shows on OLED",
            "Press F3 again to close menu"
        ],
        expected: [
            "Each button press registers immediately",
            "Correct menu appears for each button",
            "Menus display clearly on OLED with inverted header bar",
            "No stuck buttons or double-triggers",
            "Buttons return to neutral position"
        ],
        oled: {
            type: "function3",
            menus: [
                { button: "F1", name: "Settings", items: ["KEY → C", "OCTAVE → +1", "PRESET → 1"] },
                { button: "F2", name: "Effects", items: ["GLIDE → OFF", "REVERB → OFF", "CHORUS → OFF"] },
                { button: "F3", name: "Modes", items: ["NORMAL", "STRUM", "REPEAT"] }
            ]
        }
    },
    {
        id: 5,
        name: "Joystick (8 Directions)",
        image: "images/Front View.png",
        procedure: [
            "Press and HOLD chord button 1",
            "While holding button 1, move joystick in each direction:",
            "  ↑ UP: OLED shows \"Cm\"",
            "  ↗ UP-RIGHT: OLED shows \"C7\"",
            "  → RIGHT: OLED shows \"CM7\"",
            "  ↘ DOWN-RIGHT: OLED shows \"CM9\"",
            "  ↓ DOWN: OLED shows \"Csus4\"",
            "  ↙ DOWN-LEFT: OLED shows \"C6\"",
            "  ← LEFT: OLED shows \"Cdim\"",
            "  ↖ UP-LEFT: OLED shows \"C+\"",
            "  ● CENTER (release): OLED shows \"C\"",
            "Release chord button when test complete"
        ],
        expected: [
            "All 8 directions register correctly",
            "Chord name changes instantly with joystick",
            "Audio changes to match displayed chord",
            "Joystick returns to center when released",
            "No drift or phantom inputs"
        ],
        oled: {
            type: "joystick8",
            // Index mapping: 0=CENTER, 1=UP, 2=UP-RIGHT, 3=RIGHT, 4=DOWN-RIGHT, 5=DOWN, 6=DOWN-LEFT, 7=LEFT, 8=UP-LEFT
            directions: [
                { dir: "CENTER", chord: "C" },         // 0
                { dir: "UP", chord: "Cm" },            // 1
                { dir: "UP-RIGHT", chord: "C7" },      // 2
                { dir: "RIGHT", chord: "CM7" },        // 3
                { dir: "DOWN-RIGHT", chord: "CM9" },   // 4
                { dir: "DOWN", chord: "Csus4" },       // 5
                { dir: "DOWN-LEFT", chord: "C6" },     // 6
                { dir: "LEFT", chord: "Cdim" },        // 7
                { dir: "UP-LEFT", chord: "C+" }        // 8
            ]
        }
    },
    {
        id: 6,
        name: "Joystick Button Press",
        image: "images/Front View.png",
        procedure: [
            "Press F2 to enter Effects menu",
            "Use joystick directions to navigate",
            "Press down on joystick (click) to select",
            "Verify selection is confirmed on OLED"
        ],
        expected: [
            "Joystick click registers as button press",
            "Selection confirmed with visual feedback",
            "Tactile click feel when pressed",
            "No accidental triggers from movement"
        ],
        oled: null
    },
    {
        id: 7,
        name: "Built-in Speaker",
        image: "images/Front View.png",
        procedure: [
            "Ensure no headphones or USB cable connected",
            "Set volume to 50%",
            "Press each chord button 1-7 sequentially:",
            "  • Button 1: Should show \"C\" and play C major chord",
            "  • Button 2: Should show \"Dm\" and play D minor chord",
            "  • Button 3: Should show \"Em\" and play E minor chord",
            "  • Button 4: Should show \"F\" and play F major chord",
            "  • Button 5: Should show \"G\" and play G major chord",
            "  • Button 6: Should show \"Am\" and play A minor chord",
            "  • Button 7: Should show \"Bdim\" and play B diminished chord",
            "Listen for audio from internal speaker"
        ],
        expected: [
            "Clear audio from speaker",
            "All 7 chord buttons produce sound",
            "OLED displays correct chord name for each button",
            "No distortion, crackling, or buzzing",
            "Adequate volume and clarity"
        ],
        oled: {
            type: "chord7",
            chords: [
                { button: "1", chord: "C", name: "C major" },
                { button: "2", chord: "Dm", name: "D minor" },
                { button: "3", chord: "Em", name: "E minor" },
                { button: "4", chord: "F", name: "F major" },
                { button: "5", chord: "G", name: "G major" },
                { button: "6", chord: "Am", name: "A minor" },
                { button: "7", chord: "Bdim", name: "B dim" }
            ]
        }
    },
    {
        id: 8,
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
        id: 9,
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
        id: 10,
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
        id: 11,
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
        id: 12,
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
            // Show each joystick direction with its OLED display side-by-side
            // Much clearer than a 3x3 grid!
            const directions = data.directions;

            let html = '<div class="joystick-test-list">';

            // Center position first (highlighted)
            const center = directions[0];
            html += `
                <div class="joy-test-item center-item">
                    <div class="joy-direction-icon">
                        <div class="joy-arrow-big">●</div>
                        <div class="joy-direction-label">CENTER (Release joystick)</div>
                    </div>
                    <div class="arrow-connector">→</div>
                    <div class="oled-screen-mini">
                        <div class="oled-chord-text">${center.chord}</div>
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
                    <div class="joy-test-item">
                        <div class="joy-direction-icon">
                            <div class="joy-arrow-big">${arrow}</div>
                            <div class="joy-direction-label">${label}</div>
                        </div>
                        <div class="arrow-connector">→</div>
                        <div class="oled-screen-mini">
                            <div class="oled-chord-text">${dir.chord}</div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            return html;
        },
        chord7: (data) => {
            // Create a grid showing all 7 chord button displays
            const chords = data.chords;
            let gridHTML = '<div class="chord-grid">';
            chords.forEach(chord => {
                gridHTML += `
                    <div class="chord-cell">
                        <div class="oled-screen-mini">
                            <div class="oled-chord-text">${chord.chord}</div>
                        </div>
                        <div class="chord-label">Button ${chord.button}: ${chord.name}</div>
                    </div>
                `;
            });
            gridHTML += '</div>';
            return gridHTML;
        },
        function3: (data) => {
            // Show button icon → what appears on OLED
            const menus = data.menus;

            // Button colors and icons from manual
            const buttonInfo = {
                'F1': { color: '#2C2C2C', icon: '⚙', label: 'Settings (Gray)' },
                'F2': { color: '#FFD700', icon: '〜', label: 'Effects (Yellow)' },
                'F3': { color: '#FF4500', icon: '⏱', label: 'Modes (Red)' }
            };

            let html = '<div class="function-test-list">';

            menus.forEach(menu => {
                const btn = buttonInfo[menu.button];
                html += `
                    <div class="function-test-item">
                        <div class="function-button-display">
                            <div class="function-button-icon" style="background-color: ${btn.color}; color: ${btn.color === '#FFD700' ? '#000' : '#FFF'};">
                                ${btn.icon}
                            </div>
                            <div class="function-button-label">${menu.button} - ${btn.label}</div>
                        </div>

                        <div class="arrow-connector-big">→</div>

                        <div class="function-oled-examples">
                            <div class="function-menu-title">${menu.name} Menu</div>
                            <div class="oled-examples-row">
                `;

                menu.items.forEach(item => {
                    const parts = item.split(' → ');
                    if (parts.length === 2) {
                        // Item with value (e.g., "KEY → C")
                        html += `
                            <div class="oled-screen-mini">
                                <div class="oled-menu-header">${parts[0]}</div>
                                <div class="oled-menu-value">${parts[1]}</div>
                            </div>
                        `;
                    } else {
                        // Item without value (e.g., "NORMAL")
                        html += `
                            <div class="oled-screen-mini">
                                <div class="oled-menu-single">${item}</div>
                            </div>
                        `;
                    }
                });

                html += `
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
