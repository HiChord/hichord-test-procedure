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

            // Show ADC monitor for ADC-based systems
            if (this.buttonSystem === 'ADC') {
                this.setupADCMonitor();
            }
        }

        // Test response (0x12)
        if (command === this.SYSEX_TEST_RESPONSE && data.length >= 3) {
            const testType = data[2];
            const testData = data.slice(3);
            this.handleTestResponse(testType, testData);
        }
    }

    setupADCMonitor() {
        const monitor = document.getElementById('adcMonitor');
        monitor.style.display = 'block';

        const grid = document.getElementById('adcGrid');
        grid.innerHTML = '';

        // Create ADC value displays for all inputs
        const labels = ['Btn 1', 'Btn 2', 'Btn 3', 'Btn 4', 'Btn 5', 'Btn 6', 'Btn 7',
                       'F1', 'F2', 'F3', 'Joy X', 'Joy Y', 'Volume'];

        labels.forEach((label, idx) => {
            const item = document.createElement('div');
            item.className = 'adc-item';
            item.innerHTML = `
                <div class="adc-label">${label}</div>
                <div class="adc-value" id="adc${idx}">0</div>
            `;
            grid.appendChild(item);
        });

        // Start periodic ADC monitoring
        this.startADCMonitoring();
    }

    startADCMonitoring() {
        if (this.adcMonitorInterval) return;

        this.adcMonitorInterval = setInterval(() => {
            // Request ADC values via SysEx
            const sysex = [0xF0, this.SYSEX_MANUFACTURER_ID, 0x15, 0xF7]; // 0x15 = Request ADC values
            if (this.midiOutput) {
                this.midiOutput.send(sysex);
            }
        }, 100); // Update every 100ms
    }

    stopADCMonitoring() {
        if (this.adcMonitorInterval) {
            clearInterval(this.adcMonitorInterval);
            this.adcMonitorInterval = null;
        }
    }

    // Test definitions
    defineTests() {
        return [
            {
                name: 'Chord Button 1',
                instruction: 'Press CHORD BUTTON 1',
                type: 'button',
                expectedInput: 'button1',
                timeout: 10000
            },
            {
                name: 'Chord Button 2',
                instruction: 'Press CHORD BUTTON 2',
                type: 'button',
                expectedInput: 'button2',
                timeout: 10000
            },
            {
                name: 'Chord Button 3',
                instruction: 'Press CHORD BUTTON 3',
                type: 'button',
                expectedInput: 'button3',
                timeout: 10000
            },
            {
                name: 'Chord Button 4',
                instruction: 'Press CHORD BUTTON 4',
                type: 'button',
                expectedInput: 'button4',
                timeout: 10000
            },
            {
                name: 'Chord Button 5',
                instruction: 'Press CHORD BUTTON 5',
                type: 'button',
                expectedInput: 'button5',
                timeout: 10000
            },
            {
                name: 'Chord Button 6',
                instruction: 'Press CHORD BUTTON 6',
                type: 'button',
                expectedInput: 'button6',
                timeout: 10000
            },
            {
                name: 'Chord Button 7',
                instruction: 'Press CHORD BUTTON 7',
                type: 'button',
                expectedInput: 'button7',
                timeout: 10000
            },
            {
                name: 'Function Button F1',
                instruction: 'Press FUNCTION BUTTON F1 (Settings)',
                type: 'button',
                expectedInput: 'f1',
                timeout: 10000
            },
            {
                name: 'Function Button F2',
                instruction: 'Press FUNCTION BUTTON F2 (Effects)',
                type: 'button',
                expectedInput: 'f2',
                timeout: 10000
            },
            {
                name: 'Function Button F3',
                instruction: 'Press FUNCTION BUTTON F3 (BPM/Mode)',
                type: 'button',
                expectedInput: 'f3',
                timeout: 10000
            },
            {
                name: 'Joystick UP',
                instruction: 'Hold Button 1 and move Joystick UP',
                type: 'joystick',
                expectedInput: 'joy_up',
                timeout: 10000
            },
            {
                name: 'Joystick UP-RIGHT',
                instruction: 'Hold Button 1 and move Joystick UP-RIGHT',
                type: 'joystick',
                expectedInput: 'joy_upright',
                timeout: 10000
            },
            {
                name: 'Joystick RIGHT',
                instruction: 'Hold Button 1 and move Joystick RIGHT',
                type: 'joystick',
                expectedInput: 'joy_right',
                timeout: 10000
            },
            {
                name: 'Joystick DOWN-RIGHT',
                instruction: 'Hold Button 1 and move Joystick DOWN-RIGHT',
                type: 'joystick',
                expectedInput: 'joy_downright',
                timeout: 10000
            },
            {
                name: 'Joystick DOWN',
                instruction: 'Hold Button 1 and move Joystick DOWN',
                type: 'joystick',
                expectedInput: 'joy_down',
                timeout: 10000
            },
            {
                name: 'Joystick DOWN-LEFT',
                instruction: 'Hold Button 1 and move Joystick DOWN-LEFT',
                type: 'joystick',
                expectedInput: 'joy_downleft',
                timeout: 10000
            },
            {
                name: 'Joystick LEFT',
                instruction: 'Hold Button 1 and move Joystick LEFT',
                type: 'joystick',
                expectedInput: 'joy_left',
                timeout: 10000
            },
            {
                name: 'Joystick UP-LEFT',
                instruction: 'Hold Button 1 and move Joystick UP-LEFT',
                type: 'joystick',
                expectedInput: 'joy_upleft',
                timeout: 10000
            },
            {
                name: 'Joystick Click',
                instruction: 'Click the Joystick (press down)',
                type: 'joystick',
                expectedInput: 'joy_click',
                timeout: 10000
            },
            {
                name: 'Volume Wheel',
                instruction: 'Rotate the Volume Wheel from MIN to MAX',
                type: 'volume',
                expectedInput: 'volume',
                timeout: 15000
            }
        ];
    }

    async startTestSequence() {
        this.testDefinitions = this.defineTests();
        this.currentTestIndex = 0;
        this.testResults = [];

        document.getElementById('startTestBtn').style.display = 'none';
        document.getElementById('testProgressContainer').style.display = 'block';
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
        this.waitingForInput = true;

        document.getElementById('currentTestTitle').textContent = test.name;
        document.getElementById('currentTestInstruction').textContent = test.instruction;
        document.getElementById('testDisplay').innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
                <div>Waiting for input...</div>
            </div>
        `;
        document.getElementById('testStatus').className = 'test-status waiting';
        document.getElementById('testStatus').textContent = 'Test in progress...';

        // Update progress
        const progress = ((this.currentTestIndex / this.testDefinitions.length) * 100).toFixed(0);
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent =
            `${this.currentTestIndex} / ${this.testDefinitions.length} tests completed`;

        // Set timeout for test
        this.testTimeout = setTimeout(() => {
            this.failCurrentTest('Timeout - no input received');
        }, test.timeout);
    }

    handleTestInput(inputType, inputData) {
        if (!this.waitingForInput) return;

        const test = this.testDefinitions[this.currentTestIndex];
        // Test validation logic will be handled by firmware test mode
        // Firmware will send back SysEx response indicating pass/fail
    }

    handleTestResponse(testType, testData) {
        if (!this.waitingForInput) return;

        clearTimeout(this.testTimeout);
        this.waitingForInput = false;

        const test = this.testDefinitions[this.currentTestIndex];
        const passed = testData[0] === 1; // 1 = pass, 0 = fail

        if (passed) {
            this.passCurrentTest();
        } else {
            const reason = testData.length > 1 ?
                `Failed: ${testData.slice(1).map(b => String.fromCharCode(b)).join('')}` :
                'Failed validation';
            this.failCurrentTest(reason);
        }
    }

    async passCurrentTest() {
        const test = this.testDefinitions[this.currentTestIndex];
        this.testResults.push({ name: test.name, passed: true });

        document.getElementById('testDisplay').innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 64px; color: #44FF44;">✓</div>
                <div style="font-size: 24px; color: #44FF44;">PASSED</div>
            </div>
        `;
        document.getElementById('testStatus').className = 'test-status passed';
        document.getElementById('testStatus').textContent = '✓ Test passed!';

        this.log(`✓ ${test.name} PASSED`, 'success');

        await this.wait(1000);
        this.currentTestIndex++;
        await this.runNextTest();
    }

    async failCurrentTest(reason) {
        const test = this.testDefinitions[this.currentTestIndex];
        this.testResults.push({ name: test.name, passed: false, reason });

        document.getElementById('testDisplay').innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 64px; color: #FF4444;">✗</div>
                <div style="font-size: 24px; color: #FF4444;">FAILED</div>
                <div style="font-size: 14px; margin-top: 10px;">${reason}</div>
            </div>
        `;
        document.getElementById('testStatus').className = 'test-status failed';
        document.getElementById('testStatus').textContent = `✗ Test failed: ${reason}`;

        this.log(`✗ ${test.name} FAILED: ${reason}`, 'error');

        await this.wait(2000);
        this.currentTestIndex++;
        await this.runNextTest();
    }

    async finishTests() {
        this.waitingForInput = false;
        await this.exitTestMode();

        document.getElementById('testProgressContainer').style.display = 'none';
        document.getElementById('currentTest').style.display = 'none';
        document.getElementById('testResults').style.display = 'block';

        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => !r.passed).length;

        document.getElementById('passedCount').textContent = passed;
        document.getElementById('failedCount').textContent = failed;
        document.getElementById('totalCount').textContent = this.testResults.length;

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
    window.testApp = new HiChordTestApp();
});
