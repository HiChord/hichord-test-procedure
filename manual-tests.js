// Manual Test Definitions
// Traditional checklist mode with expected results

const manualTests = [
    {
        id: 1,
        name: "Charging Indicator",
        procedure: [
            "Locate USB-C port on side of HiChord™",
            "Connect USB-C cable to HiChord",
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
            "Display shows \"HiChord\" title with animated ghost",
            "Version \"REV 1.99\" appears below title",
            "Boot sequence completes within 3 seconds",
            "No screen artifacts or glitches"
        ],
        oled: {
            type: "boot_pixelperfect"
        }
    },
    {
        id: 3,
        name: "Volume Control",
        image: "images/Top View.png",
        secondaryImage: "images/BUtton numbers only.jpg",
        procedure: [
            "Locate volume wheel on top edge",
            "Press any chord buttons 1-7 <span class=\"chord-btn-icon\"></span> to generate sound",
            "Turn wheel from minimum to maximum position",
            "Observe OLED volume indicator"
        ],
        expected: [
            "Volume bar appears on OLED when wheel turned",
            "Audio level changes smoothly with wheel",
            "Volume percentage displays (0-100%)",
            "No crackling or distortion at any level"
        ],
        oled: {
            type: "volume_pixelperfect"
        }
    },
    {
        id: 4,
        name: "Button Test (Automated Detection)",
        isAutomatedTest: true,
        procedure: [
            "Connect device to computer via USB",
            "Click \"Connect Device\" button below",
            "Follow on-screen instructions from device OLED",
            "Press each button/control as instructed by device",
            "Device will automatically detect and verify all 20 inputs",
            "Review pass/fail results when complete"
        ],
        expected: [
            "All 20 buttons/controls detected correctly",
            "Device OLED shows current test (e.g. \"Test 5/19: Chord 5\")",
            "Web interface displays real-time progress",
            "Final report shows PASS for all tests"
        ],
        note: "This automated test verifies: 7 chord buttons, 3 menu buttons (F1/F2/F3), 8 joystick directions, and joystick click (19 tests total). Device will automatically restart when complete."
    },
    {
        id: 5,
        name: "Function Buttons (F1, F2, F3)",
        hidden: true,
        image: "images/BUtton numbers 3.png",
        procedure: [
            "Press each function button <span class=\"inline-code f1\">F1</span> <span class=\"inline-code f2\">F2</span> <span class=\"inline-code f3\">F3</span> ONCE after startup",
            "Move joystick <span class=\"joy-up\"></span> <span class=\"joy-down\"></span> <span class=\"joy-left\"></span> <span class=\"joy-right\"></span> to see different menu values",
            "Verify OLED shows correct displays"
        ],
        expected: [
            "Each button press registers immediately",
            "<span class=\"inline-code f1\">F1</span>: Shows KEY or OCTAVE when joystick moved",
            "<span class=\"inline-code f2\">F2</span>: Shows Press Up to enter Sound menu, left/right to change effect",
            "<span class=\"inline-code f3\">F3</span>: Shows Press up to enter Mode menu, left/right to change BPM"
        ],
        oled: {
            type: "function3_pixelperfect",
            buttons: [
                {
                    button: "F1",
                    name: "Settings",
                    color: "#808080",
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="14" r="3.5"/><line x1="9.5" y1="11.5" x2="18" y2="3"/><line x1="16" y1="5" x2="16" y2="3"/></svg>',
                    display: "key_octave_dual",
                    topLine: { text: "KEY < >", inverted: true },
                    bottomLine: { text: "OCTAVE ^ v", inverted: false },
                    hasBorder: true
                },
                {
                    button: "F2",
                    name: "Effects",
                    color: "#FFB800",
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,17 3,9 7,9 7,17 11,17 11,9 15,9 15,17 19,17 19,9 21,9"/></svg>',
                    display: "sound_effect_onoff",
                    topLine: { text: "SOUND ^", inverted: true },
                    middleLine: { text: "< VERB >", inverted: false },
                    bottomLine: { text: "ON / OFF v", inverted: true },
                    hasBorder: true
                },
                {
                    button: "F3",
                    name: "BPM/Mode",
                    color: "#ef4444",
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="12" x2="12" y2="6"/><line x1="12" y1="12" x2="17" y2="12"/></svg>',
                    display: "bpm_mode",
                    topText: "MODE ^",
                    bpmNumber: "120",
                    bpmLabel: "BPM",
                    arrows: "< >",
                    hasInvertedBox: true,
                    hasBorder: true
                }
            ]
        }
    },
    {
        id: 5,
        name: "Chord Buttons (1-7) in C Major",
        hidden: true,
        image: "images/BUtton numbers 2.png",
        procedure: [
            "Press each chord buttons 1-7 <span class=\"chord-btn-icon\"></span> individually",
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
                { button: 1, chord: "Cmaj" },
                { button: 2, chord: "Dmin" },
                { button: 3, chord: "Emin" },
                { button: 4, chord: "Fmaj" },
                { button: 5, chord: "Gmaj" },
                { button: 6, chord: "Amin" },
                { button: 7, chord: "Bdim" }
            ]
        }
    },
    {
        id: 6,
        name: "Joystick Chord Modification (Hold Button 1)",
        hidden: true,
        image: "images/Top View.png",
        procedure: [
            "Hold <span class=\"chord-btn-icon\" data-num=\"1\"></span> CHORD BUTTON 1",
            "Move joystick <span class=\"joy-up\"></span> <span class=\"joy-down\"></span> <span class=\"joy-left\"></span> <span class=\"joy-right\"></span> in each of 8 directions + center",
            "Verify chord modification displays on OLED",
            "Listen for clear audio (no distortion)"
        ],
        expected: [
            "Joystick responds smoothly in all directions",
            "OLED shows: chord number (1, circled) + key (C) + modified chord name",
            "Clear audio with no distortion",
            "Center position returns to default chord (Cmaj)"
        ],
        oled: {
            type: "joystick8_button1",
            key: "C",
            buttonNumber: 1,
            directions: [
                { dir: "CENTER", chord: "C" },
                { dir: "UP", chord: "Cmin" },
                { dir: "UP-RIGHT", chord: "C7" },
                { dir: "RIGHT", chord: "Cmaj7" },
                { dir: "DOWN-RIGHT", chord: "Cmaj9" },
                { dir: "DOWN", chord: "Csus4" },
                { dir: "DOWN-LEFT", chord: "Cmaj6" },
                { dir: "LEFT", chord: "Cdim" },
                { dir: "UP-LEFT", chord: "Caug" }
            ]
        }
    },
    {
        id: 7,
        name: "Joystick Click (Bar Select Menu)",
        hidden: true,
        image: "images/Top View.png",
        procedure: [
            "From default startup, <span class=\"joy-click\"></span> click joystick button (press down)",
            "OLED shows \"WAITING\" screen with bar selection"
        ],
        expected: [
            "<span class=\"joy-click\"></span> Joystick click opens bar select menu immediately",
            "OLED displays: \"WAITING\" header with line separator, Shows bar count (FREE or number) with \"BARS <>\" label"
        ],
        oled: {
            type: "bar_select",
            content: ["WAITING", "___", "4  BARS <>"]
        }
    },
    {
        id: 8,
        name: "Headphone Output",
        image: "images/Top View.png",
        procedure: [
            "Connect headphones to 3.5mm jack on top side (see image)",
            "Set volume to 50%",
            "Press chord buttons 1-7 <span class=\"chord-btn-icon\"></span>",
            "Listen for stereo audio in headphones"
        ],
        expected: [
            "Clear stereo audio in both L and R channels",
            "No ground noise or interference",
            "Volume control functions properly",
            "Clean audio output at all volume levels"
        ],
        oled: null
    },
    {
        id: 9,
        name: "MIDI over USB-C",
        image: "images/Side View.png",
        procedure: [
            "Connect HiChord to computer via USB-C",
            "Click 'CONNECT & TEST MIDI' button below",
            "Wait for connection status indicator",
            "Press any button on HiChord"
        ],
        expected: [
            "HiChord detected as USB MIDI device",
            "Connection successful with green status indicator",
            "App automatically enables MIDI output on HiChord",
            "Success message appears when button pressed"
        ],
        oled: null,
        midiTest: true
    },
    {
        id: 10,
        name: "Microphone Input",
        batch: "4+",
        skipBatch: ["1", "2", "3"],
        procedure: [
            "Press <span class=\"inline-code f3\">F3</span> button once",
            "Move joystick <span class=\"joy-up\"></span> UP to enter mode selection menu",
            "Move joystick <span class=\"joy-left\"></span> LEFT or <span class=\"joy-right\"></span> RIGHT to navigate to \"MIC SAMPLE\" mode",
            "Move joystick <span class=\"joy-down\"></span> DOWN to select and enter MIC SAMPLE mode",
            "OLED displays: \"MIC SAMPLE\" title with \"Hold Btn 1\" / \"to Record\"",
            "Press and HOLD <span class=\"chord-btn-icon\" data-num=\"1\"></span> chord button 1 to start recording",
            "Speak or sing a note into the microphone (located on front panel)",
            "Release <span class=\"chord-btn-icon\" data-num=\"1\"></span> to stop recording (max 3.0 seconds)",
            "Device shows \"RECORDING\" (with progress bars), then \"Saving...\", then \"Tuning...\"",
            "Returns to MIC SAMPLE mode - sample is now ready to play"
        ],
        expected: [
            "Microphone captures audio clearly",
            "Recording shows progress bar and RMS meter on OLED",
            "Sample plays back correctly, mapped chromatically across buttons 1-7",
            "No excessive noise or clipping"
        ],
        oled: {
            type: "mic_recording",
            title: "RECORDING",
            timeText: "0.5 sec",
            progressBar: { x: 4, y: 22, width: 56, height: 4, filled: 28 },
            rmsMeter: { x: 4, y: 28, width: 56, height: 4, filled: 40 }
        },
        note: "BATCH 4+ ONLY - Skip for Batch 1-3 (no microphone). Workflow: Record → Saving → Tuning → Ready (stays in MIC SAMPLE mode)"
    },
    {
        id: 11,
        name: "Battery Indicator",
        batch: "2+",
        skipBatch: ["1"],
        procedure: [
            "Press and hold <span class=\"inline-code f1\">F1</span> + <span class=\"inline-code f2\">F2</span> buttons together",
            "Observe battery voltage and percentage on OLED",
            "Release buttons to return to normal operation"
        ],
        expected: [
            "Shows voltage (3.0-4.2V) and percentage",
            "Shows 100% when plugged into USB power",
            "Battery bar displays with fill level",
            "Returns to normal display after release"
        ],
        oled: {
            type: "battery_accurate",
            text: "Bat: 3.8V 65%",
            batteryBar: {
                x: 12,
                y: 20,
                width: 40,
                height: 12,
                tipWidth: 2,
                tipHeight: 8,
                fillPercentage: 65,
                hasDividers: true
            }
        },
        note: "BATCH 2+ ONLY - F1+F2 combo always shows battery info (even 0V for debugging early PCBs)"
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
                            ${btn.topLabel ? `<div class="oled-effect-top">${btn.topLabel}</div>` : ''}
                            <div class="oled-effect-name">${btn.effectName}</div>
                            ${btn.hint ? `<div class="oled-hint">${btn.hint}</div>` : ''}
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
            // Show looper GUI states - authentic OLED selection menu
            const states = data.states;
            let html = '<div class="single-test-list">';

            states.forEach((state, idx) => {
                // Create an authentic OLED selection menu showing all 3 options
                // with the current one highlighted (inverted/selected)
                html += `
                    <div class="single-test-row">
                        <div class="button-icon-display">
                            <div class="joy-arrow-icon">⏺</div>
                            <div class="button-label">Click ${idx + 1}</div>
                        </div>

                        <div class="arrow-single">→</div>

                        <div class="oled-screen-full">
                            <div class="oled-menu-list">
                                <div class="oled-menu-item ${state.state === 'REC' ? 'selected' : ''}">
                                    <span class="menu-icon">⏺</span>
                                    <span class="menu-text">rec loop</span>
                                </div>
                                <div class="oled-menu-item ${state.state === 'PLAY' ? 'selected' : ''}">
                                    <span class="menu-icon">⏵</span>
                                    <span class="menu-text">play loop</span>
                                </div>
                                <div class="oled-menu-item ${state.state === 'STOP' ? 'selected' : ''}">
                                    <span class="menu-icon">⏹</span>
                                    <span class="menu-text">stop loop</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            return html;
        },
        bar_select: (data) => {
            // Show looper bar select menu - WAITING screen
            // Extract bar count from "4  BARS <>" format
            const barInfo = data.content[2];
            const barNumber = barInfo.split(' ')[0]; // Get "4" from "4  BARS <>"

            return `
                <div class="oled-screen-full">
                    <div class="oled-bar-select-accurate">
                        <div class="bar-select-waiting">WAITING</div>
                        <div class="bar-select-separator"></div>
                        <div class="bar-select-number">${barNumber}</div>
                        <div class="bar-select-label">BARS</div>
                        <div class="bar-select-arrows">&lt;&gt;</div>
                    </div>
                </div>
            `;
        },
        function3_pixelperfect: (data) => {
            // Show 3 function buttons with PIXEL-PERFECT OLED displays (exactly as they appear on button press)
            const buttons = data.buttons;
            let html = '<div class="single-test-list">';

            buttons.forEach(btn => {
                let oledContent = '';

                if (btn.display === 'key_octave_dual') {
                    // F1: Dual-line display with KEY (inverted) and OCTAVE (normal)
                    oledContent = `
                        <div class="oled-f1-dual">
                            ${btn.hasBorder ? '<div class="oled-border-frame"></div>' : ''}
                            <div class="f1-top-inverted">${btn.topLine.text}</div>
                            <div class="f1-bottom-normal">${btn.bottomLine.text}</div>
                        </div>
                    `;
                } else if (btn.display === 'sound_effect_onoff') {
                    // F2: Triple-line display with SOUND (inverted), effect name, ON/OFF (inverted)
                    oledContent = `
                        <div class="oled-f2-triple">
                            ${btn.hasBorder ? '<div class="oled-border-frame"></div>' : ''}
                            <div class="f2-top-inverted">${btn.topLine.text}</div>
                            <div class="f2-middle-normal">${btn.middleLine.text}</div>
                            <div class="f2-bottom-inverted">${btn.bottomLine.text}</div>
                        </div>
                    `;
                } else if (btn.display === 'bpm_mode') {
                    // F3: BPM display with MODE ^, line, and inverted BPM box
                    oledContent = `
                        <div class="oled-f3-bpm">
                            ${btn.hasBorder ? '<div class="oled-border-frame"></div>' : ''}
                            <div class="f3-mode-text">${btn.topText}</div>
                            <div class="f3-divider-line"></div>
                            <div class="f3-bpm-inverted-box">
                                <div class="f3-bpm-label">${btn.bpmLabel}</div>
                                <div class="f3-bpm-arrows">${btn.arrows}</div>
                                <div class="f3-bpm-number">${btn.bpmNumber}</div>
                            </div>
                        </div>
                    `;
                }

                html += `
                    <div class="single-test-row">
                        <div class="button-icon-display">
                            <div class="button-icon-square function-button-icon" style="background: linear-gradient(135deg, ${btn.color}dd 0%, ${btn.color} 50%, ${btn.color}aa 100%);">
                                ${btn.iconSvg || btn.icon}
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
        mic_recording: (data) => {
            // Show MIC SAMPLE recording display with "RECORDING" title, time, progress bar, and RMS meter
            // Matches main.cpp lines 7913-7943
            const progressFillWidth = (data.progressBar.filled / data.progressBar.width) * 100;
            const rmsFillWidth = (data.rmsMeter.filled / data.rmsMeter.width) * 100;

            return `
                <div class="oled-screen-full">
                    <div class="oled-mic-recording">
                        <div class="mic-title">${data.title}</div>
                        <div class="mic-time-text">${data.timeText}</div>
                        <div class="mic-progress-bar" style="width: ${data.progressBar.width * 3}px; height: ${data.progressBar.height * 3}px; margin: 4px auto;">
                            <div class="mic-progress-fill" style="width: ${progressFillWidth}%; height: 100%;"></div>
                        </div>
                        <div class="mic-rms-meter" style="width: ${data.rmsMeter.width * 3}px; height: ${data.rmsMeter.height * 3}px; margin: 2px auto;">
                            <div class="mic-rms-fill" style="width: ${rmsFillWidth}%; height: 100%;"></div>
                        </div>
                    </div>
                </div>
            `;
        },
        battery_accurate: (data) => {
            // Pixel-perfect battery display matching main.cpp:19308-19342
            // OLED: 64x32, Font: u8g2_font_6x12_tf, Bar: (12,20,40x12), Tip: 2x8
            const bar = data.batteryBar;
            const fillWidth = (bar.fillPercentage / 100) * (bar.width - 2);

            return `
                <div class="oled-screen-full">
                    <div class="oled-battery-accurate">
                        <svg class="battery-display" viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
                            <!-- Text "Bat: 3.8V 65%" at y=16 (baseline), centered -->
                            <text x="10" y="16" font-family="monospace" font-size="6" fill="white">${data.text}</text>

                            <!-- Battery bar frame at (12, 20), 40x12 pixels -->
                            <rect x="${bar.x}" y="${bar.y}" width="${bar.width}" height="${bar.height}" fill="none" stroke="white" stroke-width="1"/>

                            <!-- Battery fill (65% = ~24.7px of 38px max) -->
                            <rect x="${bar.x + 1}" y="${bar.y + 1}" width="${fillWidth}" height="${bar.height - 2}" fill="white"/>

                            <!-- Dividers at 25%, 50%, 75% (cut through fill) -->
                            <line x1="${bar.x + 1 + (bar.width - 2) * 0.25}" y1="${bar.y + 1}"
                                  x2="${bar.x + 1 + (bar.width - 2) * 0.25}" y2="${bar.y + bar.height - 1}"
                                  stroke="black" stroke-width="1"/>
                            <line x1="${bar.x + 1 + (bar.width - 2) * 0.50}" y1="${bar.y + 1}"
                                  x2="${bar.x + 1 + (bar.width - 2) * 0.50}" y2="${bar.y + bar.height - 1}"
                                  stroke="black" stroke-width="1"/>
                            <line x1="${bar.x + 1 + (bar.width - 2) * 0.75}" y1="${bar.y + 1}"
                                  x2="${bar.x + 1 + (bar.width - 2) * 0.75}" y2="${bar.y + bar.height - 1}"
                                  stroke="black" stroke-width="1"/>

                            <!-- Battery tip (2x8 pixels) on right side, vertically centered -->
                            <rect x="${bar.x + bar.width}" y="${bar.y + (bar.height - bar.tipHeight) / 2}"
                                  width="${bar.tipWidth}" height="${bar.tipHeight}" fill="white"/>
                        </svg>
                    </div>
                </div>
            `;
        },
        boot_pixelperfect: () => `
            <div class="oled-screen-full">
                <div class="oled-boot-accurate">
                    <svg class="boot-ghost" viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
                        <!-- Ghost body at x=12, y=16 -->
                        <circle cx="12" cy="16" r="5" fill="white"/>
                        <rect x="7" y="16" width="11" height="6" fill="white"/>
                        <!-- Wavy bottom (3 small circles for waves) -->
                        <circle cx="9" cy="22" r="1" fill="white"/>
                        <circle cx="12" cy="23" r="1" fill="white"/>
                        <circle cx="15" cy="22" r="1" fill="white"/>
                        <!-- Eyes (black pixels) -->
                        <rect x="10" y="15" width="1" height="1" fill="black"/>
                        <rect x="14" y="15" width="1" height="1" fill="black"/>
                        <!-- Tiny smile -->
                        <rect x="12" y="18" width="1" height="1" fill="black"/>

                        <!-- Vertical divider line from (20, 8) to (20, 24) -->
                        <line x1="20" y1="8" x2="20" y2="24" stroke="white" stroke-width="1"/>

                        <!-- "HiChord" text at x=22, y=14 -->
                        <text x="22" y="14" font-family="monospace" font-size="6" fill="white">HiChord</text>

                        <!-- "REV 1.99" text at x=22, y=24 -->
                        <text x="22" y="24" font-family="monospace" font-size="5" fill="white">REV 1.99</text>
                    </svg>
                </div>
            </div>
        `,
        volume_pixelperfect: () => `
            <div class="oled-screen-full">
                <div class="oled-volume-accurate">
                    <svg class="volume-display-svg" viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
                        <!-- Inverted header box (0, 0, 64, 12) -->
                        <rect x="0" y="0" width="64" height="12" fill="white"/>

                        <!-- "VOLUME" text in header (u8g2_font_helvB08_tr, baseline y=10) -->
                        <text x="32" y="9" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="7" font-weight="bold" fill="black">VOLUME</text>

                        <!-- "75%" text (u8g2_font_helvB14_tr, baseline y=28) -->
                        <text x="32" y="26" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="bold" fill="white">75%</text>
                    </svg>
                </div>
            </div>
        `
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

    if (oledData.type === 'bar_select') {
        return `
            <div class="oled-mockup bar-select-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (Joystick Click)</div>
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

    if (oledData.type === 'function3_pixelperfect') {
        return `
            <div class="oled-mockup function-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (Press Each Button ONCE)</div>
            </div>
        `;
    }

    if (oledData.type === 'mic_recording') {
        return `
            <div class="oled-mockup mic-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (Recording in Progress)</div>
            </div>
        `;
    }

    if (oledData.type === 'battery_accurate') {
        return `
            <div class="oled-mockup battery-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (F1 + F2 Held)</div>
            </div>
        `;
    }

    if (oledData.type === 'boot_pixelperfect') {
        return `
            <div class="oled-mockup boot-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (Final Boot Screen)</div>
            </div>
        `;
    }

    if (oledData.type === 'volume_pixelperfect') {
        return `
            <div class="oled-mockup volume-mockup">
                ${renderer(oledData)}
                <div class="mockup-label">Expected OLED Display (Volume Slider Moved)</div>
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

    const secondaryImageHTML = test.secondaryImage ? `
        <div class="procedure-secondary-image">
            <img src="${test.secondaryImage}" alt="${test.name} - Controls" />
        </div>
    ` : '';

    const midiTestHTML = test.midiTest ? `
        <div class="midi-test-app">
            <div class="midi-connection-status" id="midiConnectionStatus">
                <div class="status-dot disconnected"></div>
                <span class="status-text">Not Connected</span>
            </div>

            <button class="btn-midi-test" id="btnMidiTest" onclick="startMidiTest()">
                CONNECT & TEST MIDI
            </button>

            <div class="midi-instruction" id="midiInstruction" style="display: none;">
                <div class="instruction-icon">🎹</div>
                <div class="instruction-text">Press any button on HiChord</div>
            </div>

            <div class="midi-result" id="midiResult" style="display: none;">
            </div>
        </div>
    ` : '';

    const automatedTestHTML = test.isAutomatedTest ? `
        <div class="automated-test-embed" id="automatedTestEmbed">
            <!-- Connection Panel -->
            <div class="connection-panel">
                <div class="connection-status" id="connectionStatus">
                    <div class="status-indicator disconnected" id="statusIndicator"></div>
                    <div class="status-text">
                        <div id="statusTitle">Not Connected</div>
                        <div id="statusSubtitle">Connect HiChord™ via USB-C</div>
                    </div>
                </div>
                <button class="btn-connect" id="connectBtn">Connect to HiChord</button>
            </div>

            <!-- Hardware Info -->
            <div class="hardware-info" id="hardwareInfo" style="display: none;">
                <h3>Detected Hardware</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Firmware:</span>
                        <span class="info-value" id="detectedFirmware">—</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">PCB Batch:</span>
                        <span class="info-value" id="detectedBatch">—</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Button System:</span>
                        <span class="info-value" id="detectedButtonSystem">—</span>
                    </div>
                </div>
            </div>

            <!-- Test Controls -->
            <div class="test-controls" id="testControls" style="display: none;">
                <button class="btn-start-test" id="startTestBtn">START TEST</button>
                <div class="test-quick-stats">
                    <div class="quick-stat-item">
                        <div class="stat-number">19</div>
                        <div class="stat-label">Total Tests</div>
                    </div>
                    <div class="quick-stat-item">
                        <div class="stat-number">~2</div>
                        <div class="stat-label">Minutes</div>
                    </div>
                </div>
                <div class="test-coverage-note">
                    <h4>What This Test Covers:</h4>
                    <ul>
                        <li><strong>✓ All Buttons:</strong> 7 chord buttons + 3 menu buttons</li>
                        <li><strong>✓ Joystick:</strong> 8 directions + click detection</li>
                    </ul>
                    <p style="margin-top: 12px; font-size: 13px; color: var(--black); font-weight: 600;">
                        <strong>⚠️ IMPORTANT:</strong> Follow the HiChord OLED screen during the test.
                        The device will guide you through each step.
                    </p>
                </div>
            </div>

            <!-- Current Test Display -->
            <div class="current-test-card" id="currentTest" style="display: none;">
                <div class="test-progress-bar-slim">
                    <div class="progress-fill-slim" id="progressFill"></div>
                </div>
                <div class="progress-count" id="progressText">0 / 19</div>

                <div class="test-instruction-large" id="currentTestInstruction">Follow the instructions on the HiChord OLED display</div>

                <div class="test-visual-display" id="testDisplay">
                    <!-- Dynamic test content -->
                </div>

                <div class="test-status-indicator" id="testStatus">
                    <div class="status-icon" id="statusIcon"></div>
                    <div class="status-text" id="statusText">Testing in progress - refer to device</div>
                </div>
            </div>

            <!-- Test Results Summary -->
            <div class="test-results-card" id="testResults" style="display: none;">
                <div class="results-verdict" id="resultsVerdict">
                    <div class="verdict-icon" id="verdictIcon">✓</div>
                    <div class="verdict-text" id="verdictText">ALL TESTS PASSED</div>
                </div>

                <div class="results-stats-grid">
                    <div class="stat-box stat-pass">
                        <div class="stat-big-number" id="passedCount">0</div>
                        <div class="stat-small-label">PASSED</div>
                    </div>
                    <div class="stat-box stat-fail">
                        <div class="stat-big-number" id="failedCount">0</div>
                        <div class="stat-small-label">FAILED</div>
                    </div>
                    <div class="stat-box stat-total">
                        <div class="stat-big-number" id="totalCount">0</div>
                        <div class="stat-small-label">TOTAL</div>
                    </div>
                </div>

                <div class="results-actions-row">
                    <button class="btn-action-secondary" onclick="printAutoResults()">PRINT</button>
                    <button class="btn-action-primary" onclick="resetAutoTests()">TEST AGAIN</button>
                </div>

                <details class="results-detail-section">
                    <summary>View Detailed Results</summary>
                    <div class="results-detail-list" id="resultsDetail">
                        <!-- Detailed results will be added here -->
                    </div>
                </details>
            </div>
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

                <div class="procedure-with-image">
                    <div class="procedure-section">
                        <h3>Test Procedure</h3>
                        <ol>${procedureHTML}</ol>
                    </div>
                    ${secondaryImageHTML}
                </div>

                ${midiTestHTML}
                ${automatedTestHTML}

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
