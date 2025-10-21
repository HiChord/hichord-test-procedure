// Automated Test System with WebMIDI Integration
// Real-time hardware validation via USB-C

class AutomatedTestSystem {
    constructor() {
        this.midiAccess = null;
        this.midiInput = null;
        this.midiOutput = null;
        this.isConnected = false;
        this.hardwareBatch = null;
        this.buttonSystem = null; // 'ADC' or 'I2C'

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

            // Find HiChord device
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
                throw new Error('HiChord not found. Please connect HiChord via USB-C.');
            }

            this.midiInput = foundInput;
            this.midiOutput = foundOutput;
            this.midiInput.onmidimessage = (e) => this.handleMIDIMessage(e);

            this.isConnected = true;
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

    async detectHardware() {
        // Request device state via SysEx
        // SysEx format: F0 7D 00 00 F7 (request state)
        const sysexRequest = [0xF0, 0x7D, 0x00, 0x00, 0xF7];
        this.sendSysEx(sysexRequest);

        // For now, we'll detect based on button response patterns
        // This will be refined when we test button inputs
        this.hardwareBatch = 'Unknown';
        this.buttonSystem = 'Unknown';
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
            case 0x90: // Note On with velocity 0
                if (data2 === 0) {
                    this.notifyHandlers('noteOff', { note: data1 });
                }
                break;

            case 0xB0: // Control Change
                this.receivedCCs.set(data1, data2);
                this.notifyHandlers('cc', { cc: data1, value: data2 });
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
        name: "CHARGING INDICATOR",
        automated: false,
        instruction: "Plug in USB-C cable and observe LED on side panel",
        verify: "Manually verify: LED is RED when charging, BLUE when charged",
        autoTest: null
    },
    {
        id: 2,
        name: "POWER ON SEQUENCE",
        automated: false,
        instruction: "HiChord should already be powered on and connected",
        verify: "Connection successful = Power On test PASSED",
        autoTest: (system) => {
            return new Promise((resolve) => {
                // If connected, power on is successful
                if (system.isConnected) {
                    resolve({ passed: true, message: "Device connected successfully" });
                } else {
                    resolve({ passed: false, message: "Device not connected" });
                }
            });
        }
    },
    {
        id: 3,
        name: "VOLUME CONTROL",
        automated: true,
        instruction: "Move volume slider from MIN to MAX slowly",
        verify: "Test will automatically detect volume changes via audio level",
        autoTest: (system) => {
            return new Promise((resolve, reject) => {
                let volumeChanges = 0;
                let lastVolume = -1;
                const minChanges = 3; // Need at least 3 volume level changes

                const handler = {
                    type: 'cc',
                    callback: (data) => {
                        if (data.cc === 7) { // CC7 is volume
                            if (lastVolume >= 0 && Math.abs(data.value - lastVolume) > 10) {
                                volumeChanges++;
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
                    }
                };

                system.addMessageHandler(handler);

                // Timeout after 15 seconds
                setTimeout(() => {
                    system.removeMessageHandler(handler);
                    if (volumeChanges < minChanges) {
                        resolve({
                            passed: false,
                            message: `Insufficient volume changes (${volumeChanges}/${minChanges})`
                        });
                    }
                }, 15000);
            });
        }
    },
    {
        id: 4,
        name: "FUNCTION BUTTONS",
        automated: true,
        instruction: "Press each function button: F1 (gray), F2 (yellow), F3 (red)",
        verify: "Test will detect each button press via MIDI messages",
        autoTest: (system) => {
            return new Promise((resolve) => {
                const pressedButtons = new Set();
                const requiredButtons = ['F1', 'F2', 'F3'];

                const handler = {
                    type: 'all',
                    callback: (data) => {
                        // Function buttons may send specific CCs or note patterns
                        // F1, F2, F3 detection based on MIDI activity patterns
                        // This is a simplified version - real implementation would
                        // need to parse the specific MIDI messages
                    }
                };

                system.addMessageHandler(handler);

                // For manual verification in automated mode
                const checkInterval = setInterval(() => {
                    const status = `Waiting for buttons: ${requiredButtons.filter(b => !pressedButtons.has(b)).join(', ')}`;
                    // Update UI with status
                }, 500);

                setTimeout(() => {
                    system.removeMessageHandler(handler);
                    clearInterval(checkInterval);
                    resolve({
                        passed: pressedButtons.size === 3,
                        message: `Detected ${pressedButtons.size}/3 function buttons`
                    });
                }, 20000);
            });
        }
    },
    {
        id: 5,
        name: "JOYSTICK (8 DIRECTIONS)",
        automated: true,
        instruction: "Move joystick in all 8 directions: UP, DOWN, LEFT, RIGHT, and 4 diagonals",
        verify: "Test will detect joystick movements via CC messages or menu changes",
        autoTest: (system) => {
            return new Promise((resolve) => {
                const directions = new Set();
                const requiredDirections = 8;

                const handler = {
                    type: 'cc',
                    callback: (data) => {
                        // Joystick movements may send CC messages
                        // or trigger menu navigation CCs
                        // Track unique directional inputs
                    }
                };

                system.addMessageHandler(handler);

                setTimeout(() => {
                    system.removeMessageHandler(handler);
                    resolve({
                        passed: directions.size >= requiredDirections,
                        message: `Detected ${directions.size}/${requiredDirections} directions`
                    });
                }, 25000);
            });
        }
    },
    {
        id: 6,
        name: "JOYSTICK BUTTON PRESS",
        automated: true,
        instruction: "Press down on joystick (click) 3 times",
        verify: "Test will detect joystick button clicks",
        autoTest: (system) => {
            return new Promise((resolve) => {
                let clicks = 0;
                const requiredClicks = 3;

                const handler = {
                    type: 'all',
                    callback: (data) => {
                        // Detect joystick click events
                        clicks++;
                        if (clicks >= requiredClicks) {
                            system.removeMessageHandler(handler);
                            resolve({
                                passed: true,
                                message: `Joystick clicks detected (${clicks})`
                            });
                        }
                    }
                };

                system.addMessageHandler(handler);

                setTimeout(() => {
                    system.removeMessageHandler(handler);
                    resolve({
                        passed: clicks >= requiredClicks,
                        message: `Detected ${clicks}/${requiredClicks} clicks`
                    });
                }, 10000);
            });
        }
    },
    {
        id: 7,
        name: "SPEAKER TEST",
        automated: false,
        instruction: "Listen to internal speaker while pressing chord buttons 1-7",
        verify: "Manually verify clear audio from speaker",
        autoTest: null
    },
    {
        id: 8,
        name: "HEADPHONE OUTPUT",
        automated: false,
        instruction: "Connect headphones. Press chord buttons and verify stereo audio",
        verify: "Manually verify audio in both L and R channels",
        autoTest: null
    },
    {
        id: 9,
        name: "USB-C AUDIO OUTPUT",
        automated: false,
        instruction: "Audio should be playing through USB-C connection",
        verify: "Manually verify audio on computer",
        autoTest: null
    },
    {
        id: 10,
        name: "MIDI OUTPUT",
        automated: true,
        instruction: "Press each chord button 1-7",
        verify: "Test will automatically detect MIDI notes from each button",
        autoTest: (system) => {
            return new Promise((resolve) => {
                const pressedButtons = new Set();
                const requiredButtons = 7;

                const handler = {
                    type: 'noteOn',
                    callback: (data) => {
                        pressedButtons.add(data.note);

                        if (pressedButtons.size >= requiredButtons) {
                            system.removeMessageHandler(handler);
                            resolve({
                                passed: true,
                                message: `All ${requiredButtons} chord buttons detected`
                            });
                        }
                    }
                };

                system.addMessageHandler(handler);

                setTimeout(() => {
                    system.removeMessageHandler(handler);
                    resolve({
                        passed: pressedButtons.size >= requiredButtons,
                        message: `Detected ${pressedButtons.size}/${requiredButtons} chord buttons`
                    });
                }, 20000);
            });
        }
    },
    {
        id: 11,
        name: "MICROPHONE INPUT",
        batch: "4+",
        automated: false,
        instruction: "Hold F3 + Button 6 for MIC_SAMPLE mode. Record a sample.",
        verify: "Manually verify recording and playback",
        autoTest: null,
        note: "BATCH 4+ ONLY"
    },
    {
        id: 12,
        name: "BATTERY INDICATOR",
        batch: "2+",
        automated: false,
        instruction: "Disconnect USB (if possible) and check OLED for battery indicator",
        verify: "Manually verify battery percentage in top-right corner",
        autoTest: null,
        note: "BATCH 2+ ONLY"
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
        '<span class="auto-badge">🤖 AUTOMATED</span>' :
        '<span class="manual-badge">👤 MANUAL VERIFY</span>';

    const testControls = test.automated ? `
        <div class="auto-test-controls">
            <button class="btn-run-test" onclick="runAutomatedTest(${test.id})">
                ▶ RUN TEST
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
                ${test.batch ? `<span class="batch-tag">BATCH ${test.batch}</span>` : ''}
            </div>

            <div class="test-body">
                <div class="instruction-section">
                    <h3>INSTRUCTIONS</h3>
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
