// HiChord Hardware Test App
// Automated diagnostics and hardware verification

class HiChordTestApp {
    constructor() {
        this.midiAccess = null;
        this.midiInput = null;
        this.midiOutput = null;
        this.isConnected = false;
        this.inTestMode = false;

        // Hardware detection
        this.firmwareVersion = null;
        this.pcbBatch = null;
        this.buttonSystem = null; // 'ADC' or 'I2C'

        // MIDI CC numbers (matching firmware)
        this.CC_HANDSHAKE = 127;
        this.CC_VOLUME = 7;

        // SysEx commands
        this.SYSEX_MANUFACTURER_ID = 0x7D;
        this.SYSEX_ENTER_TEST_MODE = 0x10;
        this.SYSEX_EXIT_TEST_MODE = 0x11;
        this.SYSEX_TEST_RESPONSE = 0x12;
        this.SYSEX_REQUEST_HARDWARE_INFO = 0x13;
        this.SYSEX_HARDWARE_INFO_RESPONSE = 0x14;

        // Test state
        this.currentTestIndex = 0;
        this.testResults = [];
        this.testDefinitions = [];
        this.waitingForInput = false;
        this.testTimeout = null;

        // Audio/MIDI testing
        this.audioContext = null;
        this.audioAnalyzer = null;
        this.receivedNotes = new Set();

        // ADC monitoring
        this.adcValues = {};
        this.adcMonitorInterval = null;

        this.init();
    }

    init() {
        // Setup event listeners
        document.getElementById('connectBtn').addEventListener('click', () => this.connect());
        document.getElementById('startTestBtn').addEventListener('click', () => this.startTestSequence());
        document.getElementById('audioTestBtn').addEventListener('click', () => this.testAudioOutput());
        document.getElementById('midiTestBtn').addEventListener('click', () => this.testMIDIOutput());

        this.log('System ready. Connect HiChord via USB-C to begin.', 'info');
    }

    async connect() {
        try {
            const connectBtn = document.getElementById('connectBtn');
            connectBtn.disabled = true;
            connectBtn.textContent = 'Connecting...';

            this.log('Requesting MIDI access...', 'info');

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
                    this.log(`Found HiChord input: ${input.name}`, 'success');
                    break;
                }
            }

            for (const output of this.midiAccess.outputs.values()) {
                if (output.name.toLowerCase().includes('hichord')) {
                    foundOutput = output;
                    this.log(`Found HiChord output: ${output.name}`, 'success');
                    break;
                }
            }

            if (!foundInput || !foundOutput) {
                throw new Error('HiChord not found. Please connect HiChord via USB-C and try again.');
            }

            this.midiInput = foundInput;
            this.midiOutput = foundOutput;
            this.midiInput.onmidimessage = (e) => this.handleMIDIMessage(e);

            this.isConnected = true;
            this.updateConnectionStatus(true);

            // Send handshake
            this.sendHandshake();
            this.log('Handshake sent', 'send');

            // Request hardware info
            await this.wait(200);
            this.requestHardwareInfo();

            // Wait for hardware info, then enter test mode
            await this.wait(500);
            await this.enterTestMode();

            // Show test controls
            document.getElementById('testControls').style.display = 'block';
            document.getElementById('hardwareInfo').style.display = 'block';

            connectBtn.textContent = 'Connected';
            this.log('Ready for testing', 'success');

        } catch (error) {
            this.log(`Connection error: ${error.message}`, 'error');
            this.updateConnectionStatus(false);
            document.getElementById('connectBtn').disabled = false;
            document.getElementById('connectBtn').textContent = 'Retry Connection';
        }
    }

    updateConnectionStatus(connected) {
        const indicator = document.getElementById('statusIndicator');
        const title = document.getElementById('statusTitle');
        const subtitle = document.getElementById('statusSubtitle');

        if (connected) {
            indicator.classList.remove('disconnected');
            indicator.classList.add('connected');
            title.textContent = 'Connected';
            subtitle.textContent = 'HiChord™ connected via USB-C';
        } else {
            indicator.classList.remove('connected');
            indicator.classList.add('disconnected');
            title.textContent = 'Not Connected';
            subtitle.textContent = 'Connect HiChord™ via USB-C';
        }
    }

    sendHandshake() {
        if (!this.midiOutput) return;
        this.midiOutput.send([0xB0, this.CC_HANDSHAKE, 1]);
    }

    requestHardwareInfo() {
        if (!this.midiOutput) return;
        const sysex = [0xF0, this.SYSEX_MANUFACTURER_ID, this.SYSEX_REQUEST_HARDWARE_INFO, 0xF7];
        this.midiOutput.send(sysex);
        this.log('→ TX Request hardware info', 'send');
    }

    async enterTestMode() {
        if (!this.midiOutput) return;
        const sysex = [0xF0, this.SYSEX_MANUFACTURER_ID, this.SYSEX_ENTER_TEST_MODE, 0xF7];
        this.midiOutput.send(sysex);
        this.log('→ TX Enter test mode', 'send');
        this.inTestMode = true;
        await this.wait(200);
    }

    async exitTestMode() {
        if (!this.midiOutput) return;
        const sysex = [0xF0, this.SYSEX_MANUFACTURER_ID, this.SYSEX_EXIT_TEST_MODE, 0xF7];
        this.midiOutput.send(sysex);
        this.log('→ TX Exit test mode', 'send');
        this.inTestMode = false;
        await this.wait(200);
    }

    handleMIDIMessage(event) {
        const [status, data1, data2] = event.data;

        // SysEx message
        if (status === 0xF0) {
            this.handleSysExMessage(Array.from(event.data).slice(1, -1));
            return;
        }

        // Note On
        if ((status & 0xF0) === 0x90 && data2 > 0) {
            this.receivedNotes.add(data1);
            this.log(`← RX Note On: ${data1} (vel ${data2})`, 'receive');
            if (this.waitingForInput) {
                this.handleTestInput('note', data1);
            }
        }

        // CC message
        if ((status & 0xF0) === 0xB0) {
            this.log(`← RX CC${data1}: ${data2}`, 'receive');
            if (this.waitingForInput) {
                this.handleTestInput('cc', { cc: data1, value: data2 });
            }
        }
    }

    handleSysExMessage(data) {
        if (data.length < 2 || data[0] !== this.SYSEX_MANUFACTURER_ID) return;

        const command = data[1];

        // Hardware info response (0x14)
        if (command === this.SYSEX_HARDWARE_INFO_RESPONSE && data.length >= 5) {
            this.firmwareVersion = `${data[2]}.${data[3]}`;
            this.pcbBatch = data[4];
            this.buttonSystem = data[5] === 1 ? 'I2C' : 'ADC';

            this.log(`← RX Hardware: Firmware ${this.firmwareVersion}, Batch ${this.pcbBatch}, ${this.buttonSystem}`, 'receive');

            document.getElementById('detectedFirmware').textContent = `v${this.firmwareVersion}`;
            document.getElementById('detectedBatch').textContent = `Batch ${this.pcbBatch}`;
            document.getElementById('detectedButtonSystem').textContent = this.buttonSystem;
        }

        // Test response (0x12)
        if (command === this.SYSEX_TEST_RESPONSE && data.length >= 4) {
            const buttonId = data[2];
            const successFlag = data[3];
            this.handleTestResponse(buttonId, successFlag);
        }
    }

    // Test definitions
    defineTests() {
        return [
            {
                name: 'Chord Button 1',
                instruction: 'Press CHORD BUTTON 1',
                type: 'button',
                expectedButtonId: 1,
                timeout: 20000
            },
            {
                name: 'Chord Button 2',
                instruction: 'Press CHORD BUTTON 2',
                type: 'button',
                expectedButtonId: 2,
                timeout: 20000
            },
            {
                name: 'Chord Button 3',
                instruction: 'Press CHORD BUTTON 3',
                type: 'button',
                expectedButtonId: 3,
                timeout: 20000
            },
            {
                name: 'Chord Button 4',
                instruction: 'Press CHORD BUTTON 4',
                type: 'button',
                expectedButtonId: 4,
                timeout: 20000
            },
            {
                name: 'Chord Button 5',
                instruction: 'Press CHORD BUTTON 5',
                type: 'button',
                expectedButtonId: 5,
                timeout: 20000
            },
            {
                name: 'Chord Button 6',
                instruction: 'Press CHORD BUTTON 6',
                type: 'button',
                expectedButtonId: 6,
                timeout: 20000
            },
            {
                name: 'Chord Button 7',
                instruction: 'Press CHORD BUTTON 7',
                type: 'button',
                expectedButtonId: 7,
                timeout: 20000
            },
            {
                name: 'Function Button F1',
                instruction: 'Press FUNCTION BUTTON F1 (Settings)',
                type: 'button',
                expectedButtonId: 8,
                timeout: 20000
            },
            {
                name: 'Function Button F2',
                instruction: 'Press FUNCTION BUTTON F2 (Effects)',
                type: 'button',
                expectedButtonId: 9,
                timeout: 20000
            },
            {
                name: 'Function Button F3',
                instruction: 'Press FUNCTION BUTTON F3 (BPM/Mode)',
                type: 'button',
                expectedButtonId: 10,
                timeout: 20000
            },
            {
                name: 'Joystick UP',
                instruction: 'Move Joystick UP',
                type: 'joystick',
                expectedButtonId: 11,
                timeout: 20000
            },
            {
                name: 'Joystick UP-RIGHT',
                instruction: 'Move Joystick UP-RIGHT (diagonal)',
                type: 'joystick',
                expectedButtonId: 16,
                timeout: 20000
            },
            {
                name: 'Joystick RIGHT',
                instruction: 'Move Joystick RIGHT',
                type: 'joystick',
                expectedButtonId: 14,
                timeout: 20000
            },
            {
                name: 'Joystick DOWN-RIGHT',
                instruction: 'Move Joystick DOWN-RIGHT (diagonal)',
                type: 'joystick',
                expectedButtonId: 18,
                timeout: 20000
            },
            {
                name: 'Joystick DOWN',
                instruction: 'Move Joystick DOWN',
                type: 'joystick',
                expectedButtonId: 12,
                timeout: 20000
            },
            {
                name: 'Joystick DOWN-LEFT',
                instruction: 'Move Joystick DOWN-LEFT (diagonal)',
                type: 'joystick',
                expectedButtonId: 17,
                timeout: 20000
            },
            {
                name: 'Joystick LEFT',
                instruction: 'Move Joystick LEFT',
                type: 'joystick',
                expectedButtonId: 13,
                timeout: 20000
            },
            {
                name: 'Joystick UP-LEFT',
                instruction: 'Move Joystick UP-LEFT (diagonal)',
                type: 'joystick',
                expectedButtonId: 15,
                timeout: 20000
            },
            {
                name: 'Joystick Click',
                instruction: 'Click the Joystick (press down)',
                type: 'button',
                expectedButtonId: 19,
                timeout: 20000
            },
            {
                name: 'Volume Wheel',
                instruction: 'Rotate the Volume Wheel significantly',
                type: 'volume',
                expectedButtonId: 20,
                timeout: 25000
            },
            {
                name: 'MIDI Output',
                instruction: 'ENSURE DEVICE IS IN MIDI MODE - Press any chord button',
                type: 'midi',
                expectedInput: 'midi_note',
                timeout: 30000,
                verify: 'Device must be in MIDI mode (not USB Audio). Press chord button to send MIDI note.',
                note: 'If device is in USB Audio mode, this test will fail. Check USB mode on device.'
            },
            {
                name: 'USB Audio Output',
                instruction: 'ENSURE DEVICE IS IN USB AUDIO MODE - Press chord button and listen',
                type: 'audio',
                expectedInput: 'manual_verify',
                timeout: 30000,
                verify: 'Device must be in USB Audio mode. Press chord button - you should hear audio through computer speakers/headphones.',
                note: 'If no audio, check: 1) Device is in USB Audio mode, 2) Computer audio output is set to HiChord, 3) Volume is up'
            }
        ];
    }

    async startTestSequence() {
        this.testDefinitions = this.defineTests();
        this.currentTestIndex = 0;
        this.testResults = [];

        document.getElementById('testControls').style.display = 'none';
        document.getElementById('currentTest').style.display = 'block';

        this.log('Starting automated test sequence', 'info');
        await this.runNextTest();
    }

    async runNextTest() {
        if (this.currentTestIndex >= this.testDefinitions.length) {
            await this.finishTests();
            return;
        }

        const test = this.testDefinitions[this.currentTestIndex];

        // Exit test mode before MIDI/audio tests (they need normal operation)
        if ((test.type === 'midi' || test.type === 'audio') && this.inTestMode) {
            await this.exitTestMode();
            this.log('Exited test mode for MIDI/audio testing', 'info');
            await this.wait(500);
        }

        this.waitingForInput = true;

        document.getElementById('currentTestInstruction').textContent = test.instruction;

        // Show note if present (for MIDI/audio tests)
        let noteHTML = '';
        if (test.note) {
            noteHTML = `<div style="background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 13px; color: #92400E;">
                <strong>⚠ Note:</strong> ${test.note}
            </div>`;
        }

        // For manual verification tests (audio), show pass/fail buttons
        if (test.type === 'audio') {
            document.getElementById('testDisplay').innerHTML = noteHTML + `
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="autoTestApp.audioTestPassed()"
                        style="padding: 20px 40px; font-size: 16px; font-weight: 700; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">
                        ✓ AUDIO OK
                    </button>
                    <button onclick="autoTestApp.audioTestFailed()"
                        style="padding: 20px 40px; font-size: 16px; font-weight: 700; background: #EF4444; color: white; border: none; border-radius: 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">
                        ✗ NO AUDIO
                    </button>
                </div>
            `;
        } else if (test.note) {
            document.getElementById('testDisplay').innerHTML = noteHTML;
        } else {
            document.getElementById('testDisplay').innerHTML = '';
        }

        const statusIndicator = document.getElementById('testStatus');
        statusIndicator.className = 'test-status-indicator waiting';
        document.getElementById('statusIcon').textContent = '⏳';
        document.getElementById('statusText').textContent = 'WAITING FOR INPUT...';

        // Update progress
        const progress = ((this.currentTestIndex / this.testDefinitions.length) * 100).toFixed(0);
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent =
            `${this.currentTestIndex} / ${this.testDefinitions.length}`;

        // Set timeout for test
        this.testTimeout = setTimeout(() => {
            this.handleTestTimeout();
        }, test.timeout);
    }

    handleTestInput(inputType, inputData) {
        if (!this.waitingForInput) return;

        const test = this.testDefinitions[this.currentTestIndex];

        // MIDI output test - pass when any MIDI note is detected
        if (test.type === 'midi' && inputType === 'note') {
            this.log(`MIDI Note detected: ${inputData}`, 'success');
            clearTimeout(this.testTimeout);
            this.waitingForInput = false;
            this.passCurrentTest();
            return;
        }

        // Other test validation logic handled by firmware test mode SysEx responses
    }

    audioTestPassed() {
        if (!this.waitingForInput) return;
        clearTimeout(this.testTimeout);
        this.waitingForInput = false;
        this.passCurrentTest();
    }

    audioTestFailed() {
        if (!this.waitingForInput) return;
        clearTimeout(this.testTimeout);
        this.waitingForInput = false;
        this.failCurrentTest('No audio detected');
    }

    handleTestResponse(buttonId, successFlag) {
        if (!this.waitingForInput) return;

        const test = this.testDefinitions[this.currentTestIndex];
        const passed = successFlag === 1;

        this.log(`← RX Button ${buttonId} (expected ${test.expectedButtonId})`, 'receive');

        // Validate button ID matches expected
        if (test.expectedButtonId && buttonId !== test.expectedButtonId) {
            this.log(`✗ Wrong button: got ${buttonId}, expected ${test.expectedButtonId}`, 'error');
            this.failCurrentTest(`Wrong button: got ${buttonId}, expected ${test.expectedButtonId}`);
            return;
        }

        clearTimeout(this.testTimeout);
        this.waitingForInput = false;

        if (passed) {
            this.passCurrentTest();
        } else {
            this.failCurrentTest('Test failed');
        }
    }

    async passCurrentTest() {
        const test = this.testDefinitions[this.currentTestIndex];
        this.testResults.push({ name: test.name, passed: true });

        document.getElementById('testDisplay').innerHTML = '';

        const statusIndicator = document.getElementById('testStatus');
        statusIndicator.className = 'test-status-indicator passed';
        document.getElementById('statusIcon').textContent = '✓';
        document.getElementById('statusText').textContent = 'PASSED';

        this.log(`✓ ${test.name} PASSED`, 'success');

        await this.wait(800);
        this.currentTestIndex++;
        await this.runNextTest();
    }

    handleTestTimeout() {
        if (!this.waitingForInput) return;

        const test = this.testDefinitions[this.currentTestIndex];
        this.waitingForInput = false;

        this.log(`⏱ ${test.name} TIMEOUT`, 'warning');

        // Show retry/skip options
        this.showRetrySkipOptions('Timeout - no input received within ' + (test.timeout / 1000) + ' seconds');
    }

    showRetrySkipOptions(reason) {
        const test = this.testDefinitions[this.currentTestIndex];

        document.getElementById('testDisplay').innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 16px; color: #DC2626; font-weight: 700; margin-bottom: 12px;">TEST FAILED</div>
                <div style="font-size: 13px; color: #6B6B6B; margin-bottom: 20px;">${reason}</div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="autoTestApp.retryCurrentTest()"
                    style="padding: 16px 32px; font-size: 14px; font-weight: 700; background: #FF6B35; color: white; border: none; border-radius: 6px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">
                    ↻ RETRY
                </button>
                <button onclick="autoTestApp.skipCurrentTest()"
                    style="padding: 16px 32px; font-size: 14px; font-weight: 700; background: #6B6B6B; color: white; border: none; border-radius: 6px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">
                    → SKIP
                </button>
                <button onclick="autoTestApp.abortTests()"
                    style="padding: 16px 32px; font-size: 14px; font-weight: 700; background: #EF4444; color: white; border: none; border-radius: 6px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">
                    ✕ ABORT
                </button>
            </div>
        `;

        const statusIndicator = document.getElementById('testStatus');
        statusIndicator.className = 'test-status-indicator failed';
        document.getElementById('statusIcon').textContent = '✗';
        document.getElementById('statusText').textContent = 'AWAITING ACTION';
    }

    async retryCurrentTest() {
        this.log('Retrying test...', 'info');

        // Clear any existing timeout
        if (this.testTimeout) {
            clearTimeout(this.testTimeout);
            this.testTimeout = null;
        }

        // Reset state and re-run the same test
        this.waitingForInput = false;
        await this.runNextTest();
    }

    async skipCurrentTest() {
        const test = this.testDefinitions[this.currentTestIndex];
        this.testResults.push({ name: test.name, passed: false, reason: 'Skipped by user' });
        this.log(`⊘ ${test.name} SKIPPED`, 'warning');

        this.currentTestIndex++;
        await this.runNextTest();
    }

    async abortTests() {
        this.log('Test sequence aborted by user', 'error');
        this.waitingForInput = false;
        await this.finishTests();
    }

    async failCurrentTest(reason) {
        const test = this.testDefinitions[this.currentTestIndex];

        this.log(`✗ ${test.name} FAILED: ${reason}`, 'error');

        // Clear timeout if it exists
        if (this.testTimeout) {
            clearTimeout(this.testTimeout);
            this.testTimeout = null;
        }

        this.waitingForInput = false;

        // Show retry/skip options instead of auto-continuing
        this.showRetrySkipOptions(reason);
    }

    async finishTests() {
        this.waitingForInput = false;

        // Exit test mode if still active
        if (this.inTestMode) {
            await this.exitTestMode();
        }

        document.getElementById('currentTest').style.display = 'none';
        document.getElementById('testResults').style.display = 'block';

        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => !r.passed).length;

        // Update verdict
        const verdictSection = document.getElementById('resultsVerdict');
        const verdictIcon = document.getElementById('verdictIcon');
        const verdictText = document.getElementById('verdictText');

        if (failed === 0) {
            verdictSection.classList.remove('fail');
            verdictIcon.textContent = '✓';
            verdictText.textContent = 'ALL TESTS PASSED';
        } else {
            verdictSection.classList.add('fail');
            verdictIcon.textContent = '✗';
            verdictText.textContent = `${failed} TEST${failed > 1 ? 'S' : ''} FAILED`;
        }

        // Update stats
        document.getElementById('passedCount').textContent = passed;
        document.getElementById('failedCount').textContent = failed;
        document.getElementById('totalCount').textContent = this.testResults.length;

        // Update detailed results
        const detailContainer = document.getElementById('resultsDetail');
        detailContainer.innerHTML = '';

        this.testResults.forEach(result => {
            const item = document.createElement('div');
            item.className = `result-detail-item ${result.passed ? 'passed' : 'failed'}`;
            item.innerHTML = `
                <span class="result-detail-name">${result.name}</span>
                <span class="result-detail-status">${result.passed ? '✓ PASS' : '✗ FAIL'}</span>
            `;
            detailContainer.appendChild(item);
        });

        this.log(`Test sequence complete: ${passed} passed, ${failed} failed`, 'info');
    }

    async testAudioOutput() {
        this.log('Starting USB audio output test...', 'info');
        // Would implement Web Audio API test here
        document.getElementById('audioStatus').textContent = 'Testing...';
        await this.wait(1000);
        document.getElementById('audioStatus').textContent = 'Manual Verification Required';
        this.log('Audio test requires manual verification', 'warning');
    }

    async testMIDIOutput() {
        this.log('Starting MIDI output test...', 'info');
        this.receivedNotes.clear();
        document.getElementById('midiStatus').textContent = 'Testing...';

        this.log('Press any chord button to test MIDI output...', 'info');

        // Wait for note
        await this.wait(5000);

        if (this.receivedNotes.size > 0) {
            document.getElementById('midiStatus').textContent = `✓ OK (${this.receivedNotes.size} notes)`;
            this.log(`MIDI test PASSED: Received ${this.receivedNotes.size} note(s)`, 'success');
        } else {
            document.getElementById('midiStatus').textContent = '✗ No MIDI received';
            this.log('MIDI test FAILED: No notes received', 'error');
        }
    }

    log(message, type = 'info') {
        const logOutput = document.getElementById('logOutput');
        const item = document.createElement('div');
        item.className = `log-item ${type}`;
        const timestamp = new Date().toLocaleTimeString();
        item.textContent = `[${timestamp}] ${message}`;
        logOutput.appendChild(item);
        logOutput.scrollTop = logOutput.scrollHeight;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions
function clearLog() {
    document.getElementById('logOutput').innerHTML = '';
}

function printResults() {
    window.print();
}

function resetTests() {
    location.reload();
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.autoTestApp = new HiChordTestApp();
});

// Global functions for automated test mode
function printAutoResults() {
    window.print();
}

function resetAutoTests() {
    if (window.autoTestApp) {
        location.reload();
    }
}
