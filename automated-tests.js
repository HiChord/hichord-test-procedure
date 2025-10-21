// Automated Test System with WebMIDI Integration
// Real-time hardware validation via USB-C
// Based on HiChord Companion App implementation

class AutomatedTestSystem {
    constructor() {
        this.midiAccess = null;
        this.midiInput = null;
        this.midiOutput = null;
        this.isConnected = false;
        this.hardwareBatch = null;
        this.buttonSystem = null; // 'ADC' or 'I2C'

        // MIDI CC numbers (from companion app)
        this.CC_BPM = 20;
        this.CC_KEY = 21;
        this.CC_OCTAVE = 22;
        this.CC_JOYSTICK = 23;
        this.CC_PRESET = 24;
        this.CC_HANDSHAKE = 127;
        this.CC_VOLUME = 7;

        // Test state tracking
        this.currentTest = null;
        this.testResults = {};
        this.receivedNotes = new Set();
        this.receivedCCs = new Map();
        this.buttonPressLog = [];
        this.joystickLog = [];

        // Timeouts
        this.testTimeout = null;
        this.messageHandlers = [];
    }

    async connect() {
        try {
            if (!navigator.requestMIDIAccess) {
                throw new Error('Web MIDI API not supported. Use Chrome, Edge, or Opera.');
            }

            this.midiAccess = await navigator.requestMIDIAccess({ sysex: true });

            // Find HiChord device (matching companion app logic)
            let foundInput = null;
            let foundOutput = null;

            for (const input of this.midiAccess.inputs.values()) {
                if (input.name.toLowerCase().includes('hichord')) {
                    foundInput = input;
                    break;
                }
            }

            for (const output of this.midiAccess.outputs.values()) {
                if (output.name.toLowerCase().includes('hichord')) {
                    foundOutput = output;
                    break;
                }
            }

            if (!foundInput || !foundOutput) {
                throw new Error('HiChord™ not found. Please connect HiChord via USB-C and ensure it is powered on.');
            }

            this.midiInput = foundInput;
            this.midiOutput = foundOutput;
            this.midiInput.onmidimessage = (e) => this.handleMIDIMessage(e);

            this.isConnected = true;

            // Send handshake (matching companion app)
            this.sendHandshake();

            // Detect hardware batch
            await this.detectHardware();

            return true;
        } catch (error) {
            console.error('Connection error:', error);
            throw error;
        }
    }

    disconnect() {
        if (this.midiInput) {
            this.midiInput.onmidimessage = null;
        }
        this.isConnected = false;
        this.midiInput = null;
        this.midiOutput = null;
    }

    sendHandshake() {
        // Send CC#127 with value 1 (matching companion app)
        if (this.midiOutput) {
            this.midiOutput.send([0xB0, this.CC_HANDSHAKE, 1]);
        }
    }

    async detectHardware() {
        // Request device state via SysEx (matching companion app)
        const sysexRequest = [0xF0, 0x7D, 0x00, 0x00, 0xF7];
        this.sendSysEx(sysexRequest);

        // For now, assume I2C for Batch 4+ (most recent hardware)
        // This can be refined based on SysEx responses
        this.hardwareBatch = '4+';
        this.buttonSystem = 'I2C';
    }

    handleMIDIMessage(event) {
        const [status, data1, data2] = event.data;

        // SysEx message
        if (status === 0xF0) {
            this.handleSysExMessage(Array.from(event.data));
            return;
        }

        const messageType = status & 0xF0;
        const channel = status & 0x0F;

        switch (messageType) {
            case 0x90: // Note On
                if (data2 > 0) {
                    this.receivedNotes.add(data1);
                    this.notifyHandlers('noteOn', { note: data1, velocity: data2 });
                }
                break;

            case 0x80: // Note Off
                this.notifyHandlers('noteOff', { note: data1 });
                break;

            case 0xB0: // Control Change
                this.receivedCCs.set(data1, data2);
                this.notifyHandlers('cc', { cc: data1, value: data2 });

                // Log specific CCs for debugging
                if (data1 === this.CC_VOLUME) {
                    this.notifyHandlers('volume', { value: data2 });
                }
                break;
        }
    }

    handleSysExMessage(data) {
        // Remove F0 start and F7 end
        const sysexData = data.slice(1, -1);

        if (sysexData[0] === 0x7D) { // HiChord manufacturer ID
            // Parse hardware info from SysEx response
            this.notifyHandlers('sysex', sysexData);
        }
    }

    sendSysEx(data) {
        if (this.midiOutput) {
            this.midiOutput.send(data);
        }
    }

    sendCC(cc, value) {
        if (this.midiOutput) {
            this.midiOutput.send([0xB0, cc, value]);
        }
    }

    addMessageHandler(handler) {
        this.messageHandlers.push(handler);
        return handler;
    }

    removeMessageHandler(handler) {
        const index = this.messageHandlers.indexOf(handler);
        if (index > -1) {
            this.messageHandlers.splice(index, 1);
        }
    }

    notifyHandlers(type, data) {
        this.messageHandlers.forEach(handler => {
            if (handler.type === type || handler.type === 'all') {
                handler.callback(data);
            }
        });
    }

    clearTestState() {
        this.receivedNotes.clear();
        this.receivedCCs.clear();
        this.buttonPressLog = [];
        this.joystickLog = [];
        this.messageHandlers = [];
        if (this.testTimeout) {
            clearTimeout(this.testTimeout);
            this.testTimeout = null;
        }
    }
}

// Automated Test Definitions
const automatedTests = [
    {
        id: 1,
        name: "Charging Indicator",
        automated: false,
        instruction: "Plug in USB-C cable and observe LED on side panel",
        verify: "Manually verify: LED is RED when charging, BLUE when fully charged",
        image: "images/Side View.png",
        autoTest: null
    },
    {
        id: 2,
        name: "Power On Sequence",
        automated: true,
        instruction: "HiChord™ should already be powered on and connected via USB-C",
        verify: "Connection successful = Power On test PASSED",
        autoTest: (system) => {
            return new Promise((resolve) => {
                // If connected, power on is successful
                if (system.isConnected) {
                    resolve({ passed: true, message: "Device connected successfully - HiChord™ is powered on" });
                } else {
                    resolve({ passed: false, message: "Device not connected" });
                }
            });
        }
    },
    {
        id: 3,
        name: "Volume Control",
        automated: true,
        instruction: "Move volume slider from MIN to MAX slowly (at least 3 times)",
        verify: "Test will automatically detect volume changes via CC#7 (Volume)",
        image: "images/Top View.png",
        autoTest: (system) => {
            return new Promise((resolve) => {
                let volumeChanges = 0;
                let lastVolume = -1;
                const minChanges = 5; // Need at least 5 volume level changes
                const changeThreshold = 10; // Significant change threshold

                const handler = {
                    type: 'volume',
                    callback: (data) => {
                        if (lastVolume >= 0 && Math.abs(data.value - lastVolume) > changeThreshold) {
                            volumeChanges++;
                            testApp.log(`Volume change ${volumeChanges}: ${lastVolume} → ${data.value}`, 3);
                        }
                        lastVolume = data.value;

                        if (volumeChanges >= minChanges) {
                            system.removeMessageHandler(handler);
                            resolve({
                                passed: true,
                                message: `Volume control working (${volumeChanges} changes detected)`
                            });
                        }
                    }
                };

                system.addMessageHandler(handler);

                // Timeout after 20 seconds
                setTimeout(() => {
                    system.removeMessageHandler(handler);
                    if (volumeChanges < minChanges) {
                        resolve({
                            passed: false,
                            message: `Insufficient volume changes (${volumeChanges}/${minChanges})`
                        });
                    }
                }, 20000);
            });
        }
    },
    {
        id: 4,
        name: "Function Buttons",
        automated: false,
        instruction: "Press each function button: F1 (gray), F2 (yellow), F3 (red)",
        verify: "Manually verify each button opens its respective menu on the OLED",
        image: "images/BUtton numbers 2.png",
        autoTest: null
    },
    {
        id: 5,
        name: "Joystick (8 Directions)",
        automated: false,
        instruction: "Move joystick in all 8 directions: UP, DOWN, LEFT, RIGHT, and 4 diagonals",
        verify: "Manually verify menu navigation responds to each direction",
        image: "images/Front View.png",
        autoTest: null
    },
    {
        id: 6,
        name: "Joystick Button Press",
        automated: false,
        instruction: "Press down on joystick (click) 3 times",
        verify: "Manually verify tactile click and menu selection",
        image: "images/Front View.png",
        autoTest: null
    },
    {
        id: 7,
        name: "Speaker Test",
        automated: false,
        instruction: "Listen to internal speaker while pressing chord buttons 1-7",
        verify: "Manually verify clear audio from speaker with no distortion",
        image: "images/Back View.png",
        autoTest: null
    },
    {
        id: 8,
        name: "Headphone Output",
        automated: false,
        instruction: "Connect headphones to 3.5mm jack. Press chord buttons and verify stereo audio",
        verify: "Manually verify audio in both L and R channels, speaker mutes automatically",
        image: "images/Side View.png",
        autoTest: null
    },
    {
        id: 9,
        name: "USB-C Audio Output",
        automated: false,
        instruction: "Set computer audio output to 'HiChord'. Play audio and verify output",
        verify: "Manually verify digital audio plays through computer speakers/headphones",
        image: "images/Side View.png",
        autoTest: null
    },
    {
        id: 10,
        name: "MIDI Output",
        automated: true,
        instruction: "Press each chord button 1-7 (hold each for 1 second)",
        verify: "Test will automatically detect MIDI notes from each button",
        image: "images/BUtton numbers 2.png",
        autoTest: (system) => {
            return new Promise((resolve) => {
                const pressedNotes = new Set();
                const requiredButtons = 7;
                let lastNoteTime = Date.now();

                const handler = {
                    type: 'noteOn',
                    callback: (data) => {
                        pressedNotes.add(data.note);
                        lastNoteTime = Date.now();
                        testApp.log(`Chord button detected: Note ${data.note}`, 10);

                        if (pressedNotes.size >= requiredButtons) {
                            system.removeMessageHandler(handler);
                            resolve({
                                passed: true,
                                message: `All ${requiredButtons} chord buttons detected via MIDI`
                            });
                        }
                    }
                };

                system.addMessageHandler(handler);

                // Timeout after 30 seconds
                setTimeout(() => {
                    system.removeMessageHandler(handler);
                    resolve({
                        passed: pressedNotes.size >= requiredButtons,
                        message: `Detected ${pressedNotes.size}/${requiredButtons} chord buttons`
                    });
                }, 30000);
            });
        }
    },
    {
        id: 11,
        name: "Microphone Input",
        batch: "4+",
        automated: false,
        instruction: "Hold F3 + Button 6 for MIC_SAMPLE mode. Record and play back a sample.",
        verify: "Manually verify recording and playback quality",
        autoTest: null,
        note: "Batch 4+ only - Skip for Batch 1-3"
    },
    {
        id: 12,
        name: "Battery Indicator",
        batch: "2+",
        automated: false,
        instruction: "Observe OLED display top-right corner for battery percentage",
        verify: "Manually verify battery percentage is visible and updates",
        autoTest: null,
        note: "Batch 2+ only - Skip for Batch 1"
    }
];

// Build HTML for automated test
function buildAutomatedTestHTML(test, system) {
    const batchNote = test.note ? `
        <div class="batch-note">
            <strong>NOTE:</strong> ${test.note}
        </div>
    ` : '';

    const automatedBadge = test.automated ?
        '<span class="auto-badge">🤖 Automated</span>' :
        '<span class="manual-badge">Manual Verify</span>';

    const imageHTML = test.image ? `
        <div class="device-image">
            <img src="${test.image}" alt="${test.name}" />
        </div>
    ` : '';

    const testControls = test.automated ? `
        <div class="auto-test-controls">
            <button class="btn-run-test" onclick="runAutomatedTest(${test.id})">
                ▶ Run Test
            </button>
            <div class="test-status" id="autoTestStatus${test.id}">
                <span class="status-text">Ready to test</span>
            </div>
        </div>
    ` : `
        <div class="manual-verify-controls">
            <p class="verify-instruction">${test.verify}</p>
        </div>
    `;

    return `
        <div class="automated-test" data-test-id="${test.id}">
            <div class="test-header">
                <div class="test-number">${String(test.id).padStart(2, '0')}</div>
                <h2>${test.name}</h2>
                ${automatedBadge}
                ${test.batch ? `<span class="batch-tag">Batch ${test.batch}</span>` : ''}
            </div>

            <div class="test-body">
                ${imageHTML}

                <div class="instruction-section">
                    <h3>Instructions</h3>
                    <p>${test.instruction}</p>
                </div>

                ${testControls}

                <div class="test-progress-log" id="testLog${test.id}" style="display:none;">
                    <h4>Test Progress</h4>
                    <div class="log-content" id="logContent${test.id}"></div>
                </div>

                ${batchNote}
            </div>
        </div>
    `;
}
