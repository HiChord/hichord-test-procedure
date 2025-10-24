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
            "Version \"REV 1.97\" appears below title",
            "Boot sequence completes within 3 seconds",
            "No screen artifacts or glitches"
        ],
        oled: {
            type: "boot",
            content: ["HiChord", "REV 1.97"]
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
        name: "Function Buttons (F1, F2, F3)",
        image: "images/BUtton numbers 3.png",
        procedure: [
            "Press each function button ONCE after startup",
            "Move joystick to see different menu values",
            "Verify OLED shows correct displays"
        ],
        expected: [
            "Each button press registers immediately",
            "F1: Shows KEY or OCTAVE (one at a time) when joystick moved",
            "F2: Shows Press Up to enter Sound menu, left and right to change effect",
            "F3: Shows Press up to enter Mode menu, and left and right to change BPM, shows current BPM"
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
        id: 6,
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
        id: 7,
        name: "Joystick Click (Bar Select Menu)",
        image: "images/Top View.png",
        procedure: [
            "From default startup, click joystick button (press down)",
            "OLED shows \"WAITING\" screen with bar selection",
            "Use joystick LEFT/RIGHT to adjust bar count",
            "Verify bar count changes (FREE, 1, 2, 4, 8, etc.)"
        ],
        expected: [
            "Joystick click opens bar select menu immediately",
            "OLED displays: \"WAITING\" header with line separator",
            "Shows bar count (FREE or number) with \"BARS <>\" label",
            "Joystick LEFT/RIGHT adjusts bar count",
            "Display updates when bar count changes"
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
            "Press chord buttons 1-7",
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
            "Press chord buttons 1-7 on HiChord"
        ],
        expected: [
            "HiChord detected as USB MIDI device",
            "Connection successful with green status indicator",
            "MIDI messages appear in log when buttons pressed",
            "Each chord sends correct note-on/note-off data",
            "MIDI timing is accurate with no delay",
            "CC messages sent for volume/controls",
            "No stuck notes or missing messages"
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
            type: "mic_recording",
            title: "MIC SAMPLE",
            recText: "REC 0.5s",
            progressBar: { x: 4, y: 18, width: 56, height: 6, filled: 28 },
            rmsMeter: { x: 4, y: 26, width: 56, height: 4, filled: 40 }
        },
        note: "BATCH 4+ ONLY - Skip for Batch 1-3 (no microphone)"
    },
    {
        id: 11,
        name: "Battery Indicator",
        batch: "2+",
        skipBatch: ["1"],
        procedure: [
            "Press and hold F1 + F2 buttons together",
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
            // Show MIC SAMPLE recording display with title, progress bar, and RMS meter
            const progressFillWidth = (data.progressBar.filled / data.progressBar.width) * 100;
            const rmsFillWidth = (data.rmsMeter.filled / data.rmsMeter.width) * 100;

            return `
                <div class="oled-screen-full">
                    <div class="oled-mic-recording">
                        <div class="mic-title">${data.title}</div>
                        <div class="mic-rec-text">${data.recText}</div>
                        <div class="mic-progress-bar" style="width: ${data.progressBar.width}px; height: ${data.progressBar.height}px;">
                            <div class="mic-progress-fill" style="width: ${progressFillWidth}%; height: 100%;"></div>
                        </div>
                        <div class="mic-rms-meter" style="width: ${data.rmsMeter.width}px; height: ${data.rmsMeter.height}px; margin-top: 2px;">
                            <div class="mic-rms-fill" style="width: ${rmsFillWidth}%; height: 100%;"></div>
                        </div>
                    </div>
                </div>
            `;
        },
        battery_accurate: (data) => {
            // Show battery display with centered text and battery bar with dividers
            const bar = data.batteryBar;
            const fillWidth = (bar.fillPercentage / 100) * (bar.width - 2);

            return `
                <div class="oled-screen-full">
                    <div class="oled-battery-accurate">
                        <div class="battery-text-centered">${data.text}</div>
                        <div class="battery-bar-container" style="margin-left: ${bar.x}px; margin-top: ${bar.y}px;">
                            <div class="battery-bar-frame" style="width: ${bar.width}px; height: ${bar.height}px;">
                                <div class="battery-fill" style="width: ${fillWidth}px; height: ${bar.height - 2}px;"></div>
                                ${bar.hasDividers ? `
                                    <div class="battery-divider" style="left: ${(bar.width - 2) * 0.25 + 1}px;"></div>
                                    <div class="battery-divider" style="left: ${(bar.width - 2) * 0.50 + 1}px;"></div>
                                    <div class="battery-divider" style="left: ${(bar.width - 2) * 0.75 + 1}px;"></div>
                                ` : ''}
                            </div>
                            <div class="battery-tip" style="left: ${bar.width}px; top: ${(bar.height - bar.tipHeight) / 2}px; width: ${bar.tipWidth}px; height: ${bar.tipHeight}px;"></div>
                        </div>
                    </div>
                </div>
            `;
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

    const midiTestHTML = test.midiTest ? `
        <div class="midi-test-app">
            <div class="midi-connection-status" id="midiConnectionStatus">
                <div class="status-dot disconnected"></div>
                <span class="status-text">Not Connected</span>
            </div>

            <button class="btn-midi-test" id="btnMidiTest" onclick="startMidiTest()">
                CONNECT & TEST MIDI
            </button>

            <div class="midi-log-container" id="midiLogContainer" style="display: none;">
                <div class="midi-log-header">
                    <span>📊 Live MIDI Monitor</span>
                    <button class="btn-clear-log" onclick="clearMidiLog()">Clear</button>
                </div>
                <div class="midi-log" id="midiLog">
                    <div class="midi-log-empty">Waiting for MIDI messages...<br><span style="font-size: 12px; opacity: 0.7;">Press any chord button on HiChord</span></div>
                </div>
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

                <div class="procedure-section">
                    <h3>Test Procedure</h3>
                    <ol>${procedureHTML}</ol>
                </div>

                ${midiTestHTML}

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

// ========================================
// MIDI Test Functionality
// ========================================

let midiInput = null;
let midiOutput = null;
let midiTestActive = false;

async function startMidiTest() {
    const btn = document.getElementById('btnMidiTest');
    const statusEl = document.getElementById('midiConnectionStatus');
    const logContainer = document.getElementById('midiLogContainer');

    try {
        btn.disabled = true;
        btn.textContent = 'Connecting...';

        // Request MIDI access
        const midiAccess = await navigator.requestMIDIAccess({ sysex: true });

        // Find HiChord device
        let hichordInput = null;
        let hichordOutput = null;

        for (const input of midiAccess.inputs.values()) {
            if (input.name && input.name.toLowerCase().includes('hichord')) {
                hichordInput = input;
                break;
            }
        }

        for (const output of midiAccess.outputs.values()) {
            if (output.name && output.name.toLowerCase().includes('hichord')) {
                hichordOutput = output;
                break;
            }
        }

        if (!hichordInput || !hichordOutput) {
            throw new Error('HiChord not found. Please connect HiChord via USB-C and refresh the page.');
        }

        midiInput = hichordInput;
        midiOutput = hichordOutput;

        // Update status
        statusEl.innerHTML = '<div class="status-dot connected"></div><span class="status-text">✓ Connected: ' + hichordInput.name + '</span>';

        // Enable MIDI output on HiChord (SysEx: F0 7D 00 01 F7)
        const enableMidiSysEx = [0xF0, 0x7D, 0x00, 0x01, 0xF7];
        midiOutput.send(enableMidiSysEx);

        logMidiMessage('✓ System', 'HiChord MIDI output enabled successfully', 'info');
        logMidiMessage('System', 'Listening for MIDI messages... Press any chord button on HiChord', 'info');

        // Show log container
        logContainer.style.display = 'block';

        // Start listening for MIDI messages
        midiInput.onmidimessage = handleMidiMessage;

        btn.textContent = '✓ CONNECTED & READY';
        btn.style.backgroundColor = '#28a745';
        btn.style.color = 'white';
        midiTestActive = true;

    } catch (error) {
        console.error('MIDI connection error:', error);
        statusEl.innerHTML = '<div class="status-dot disconnected"></div><span class="status-text">✗ Error: ' + error.message + '</span>';
        btn.disabled = false;
        btn.textContent = 'CONNECT & TEST MIDI';
        btn.style.backgroundColor = '';
        btn.style.color = '';
        logMidiMessage('✗ Error', error.message, 'error');
        logContainer.style.display = 'block';
    }
}

function handleMidiMessage(message) {
    const [status, data1, data2] = message.data;
    const channel = (status & 0x0F) + 1;
    const command = status & 0xF0;

    let msgType = '';
    let msgData = '';
    let msgClass = 'note';

    switch (command) {
        case 0x90: // Note On
            if (data2 > 0) {
                msgType = 'Note On';
                msgData = `Note: ${getMidiNoteName(data1)}, Velocity: ${data2}`;
                msgClass = 'note-on';
            } else {
                msgType = 'Note Off';
                msgData = `Note: ${getMidiNoteName(data1)}`;
                msgClass = 'note-off';
            }
            break;

        case 0x80: // Note Off
            msgType = 'Note Off';
            msgData = `Note: ${getMidiNoteName(data1)}`;
            msgClass = 'note-off';
            break;

        case 0xB0: // Control Change
            msgType = 'Control Change';
            msgData = `CC ${data1}: ${data2}`;
            msgClass = 'cc';
            break;

        case 0xC0: // Program Change
            msgType = 'Program Change';
            msgData = `Program: ${data1}`;
            msgClass = 'pc';
            break;

        default:
            msgType = 'Other';
            msgData = `Status: 0x${status.toString(16)}, Data: ${data1}, ${data2}`;
            msgClass = 'other';
    }

    logMidiMessage(msgType, msgData, msgClass);
}

function getMidiNoteName(note) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(note / 12) - 1;
    const noteName = noteNames[note % 12];
    return `${noteName}${octave} (${note})`;
}

function logMidiMessage(type, data, cssClass = '') {
    const logEl = document.getElementById('midiLog');

    // Remove empty message if present
    const emptyMsg = logEl.querySelector('.midi-log-empty');
    if (emptyMsg) {
        emptyMsg.remove();
    }

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });

    const msgEl = document.createElement('div');
    msgEl.className = `midi-message ${cssClass}`;
    msgEl.innerHTML = `
        <span class="midi-time">${timestamp}</span>
        <span class="midi-type">${type}</span>
        <span class="midi-data">${data}</span>
    `;

    logEl.insertBefore(msgEl, logEl.firstChild);

    // Keep only last 50 messages
    while (logEl.children.length > 50) {
        logEl.removeChild(logEl.lastChild);
    }
}

function clearMidiLog() {
    const logEl = document.getElementById('midiLog');
    logEl.innerHTML = '<div class="midi-log-empty">Waiting for MIDI messages...</div>';
}
