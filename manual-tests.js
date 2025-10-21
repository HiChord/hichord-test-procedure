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
            "Press and hold power button for 1 second",
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
            "Press F1 again to close menu",
            "Press F2 (yellow button) - should open Effects menu",
            "Press F2 again to close menu",
            "Press F3 (red button) - should open Modes menu",
            "Press F3 again to close menu"
        ],
        expected: [
            "Each button press registers immediately",
            "Correct menu appears for each button",
            "Menus display clearly on OLED",
            "No stuck buttons or double-triggers",
            "Buttons return to neutral position"
        ],
        oled: {
            type: "menu",
            content: ["KEY", "C"]
        }
    },
    {
        id: 5,
        name: "Joystick (8 Directions)",
        image: "images/Front View.png",
        procedure: [
            "Press F1 to enter Settings menu",
            "Move joystick UP - should change octave",
            "Move joystick DOWN - should change octave",
            "Move joystick LEFT - should change key",
            "Move joystick RIGHT - should change key",
            "Test diagonal directions:",
            "  • UP-LEFT",
            "  • UP-RIGHT",
            "  • DOWN-LEFT",
            "  • DOWN-RIGHT"
        ],
        expected: [
            "All 8 directions register correctly",
            "Menu navigation responds to each direction",
            "Joystick returns to center when released",
            "No drift or phantom inputs",
            "Smooth analog feel"
        ],
        oled: {
            type: "menu",
            content: ["OCTAVE", "+1"]
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
        image: "images/Back View.png",
        procedure: [
            "Ensure no headphones or USB cable connected",
            "Set volume to 50%",
            "Press each chord button 1-7 sequentially",
            "Listen for audio from internal speaker"
        ],
        expected: [
            "Clear audio from speaker",
            "All 7 chord buttons produce sound",
            "No distortion, crackling, or buzzing",
            "Adequate volume and clarity",
            "Proper frequency response"
        ],
        oled: null
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
            "Computer should recognize \"HiChord\" audio device",
            "Set computer audio output to HiChord",
            "Press chord buttons and verify audio on computer",
            "Test at different volume levels"
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
            "Hold F3 + press Chord Button 6 to enter MIC_SAMPLE mode",
            "Display should show recording instructions",
            "Speak or play a note into microphone",
            "Press joystick to stop recording",
            "Press chord button to play back sample",
            "Verify sample plays chromatically"
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
        `
    };

    const renderer = oledTypes[oledData.type];
    if (!renderer) return '';

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
