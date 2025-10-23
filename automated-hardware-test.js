// HiChord Automated Hardware Test - REBUILT FROM SCRATCH
// Works with existing HTML structure

class HiChordTest {
    constructor() {
        this.midiAccess = null;
        this.midiInput = null;
        this.midiOutput = null;
        this.connected = false;
        this.testRunning = false;

        // Test sequence: 19 buttons only
        this.tests = [
            {id: 1, name: 'Press CHORD BUTTON 1'},
            {id: 2, name: 'Press CHORD BUTTON 2'},
            {id: 3, name: 'Press CHORD BUTTON 3'},
            {id: 4, name: 'Press CHORD BUTTON 4'},
            {id: 5, name: 'Press CHORD BUTTON 5'},
            {id: 6, name: 'Press CHORD BUTTON 6'},
            {id: 7, name: 'Press CHORD BUTTON 7'},
            {id: 8, name: 'Press FUNCTION 1 (Settings)'},
            {id: 9, name: 'Press FUNCTION 2 (Effects)'},
            {id: 10, name: 'Press FUNCTION 3 (BPM)'},
            {id: 11, name: 'Move JOYSTICK UP'},
            {id: 12, name: 'Move JOYSTICK DOWN'},
            {id: 13, name: 'Move JOYSTICK LEFT'},
            {id: 14, name: 'Move JOYSTICK RIGHT'},
            {id: 15, name: 'Move JOYSTICK UP-LEFT'},
            {id: 16, name: 'Move JOYSTICK UP-RIGHT'},
            {id: 17, name: 'Move JOYSTICK DOWN-LEFT'},
            {id: 18, name: 'Move JOYSTICK DOWN-RIGHT'},
            {id: 19, name: 'Press JOYSTICK CLICK'}
        ];

        this.currentTestIndex = 0;
        this.results = [];
        this.hardwareInfo = null;
    }

    async connect() {
        try {
            this.log('Requesting MIDI access...');
            this.midiAccess = await navigator.requestMIDIAccess({sysex: true});

            // Find HiChord
            for (const input of this.midiAccess.inputs.values()) {
                if (input.name && input.name.toLowerCase().includes('hichord')) {
                    this.midiInput = input;
                    this.midiInput.onmidimessage = (e) => this.handleMIDI(e);
                    break;
                }
            }
            for (const output of this.midiAccess.outputs.values()) {
                if (output.name && output.name.toLowerCase().includes('hichord')) {
                    this.midiOutput = output;
                    break;
                }
            }

            if (!this.midiInput || !this.midiOutput) {
                throw new Error('HiChord not found. Please connect HiChord via USB.');
            }

            this.connected = true;
            this.log('✓ Connected to HiChord');

            // Update UI
            document.getElementById('statusIndicator').className = 'status-indicator connected';
            document.getElementById('statusTitle').textContent = 'Connected';
            document.getElementById('statusSubtitle').textContent = 'HiChord™ Ready';
            document.getElementById('connectBtn').textContent = 'Connected';
            document.getElementById('connectBtn').disabled = true;

            // Request hardware info
            await this.delay(200);
            this.sendSysEx([0xF0, 0x7D, 0x13, 0xF7]);

            // Enter test mode
            await this.delay(500);
            this.sendSysEx([0xF0, 0x7D, 0x10, 0xF7]);

            // Show hardware info and test controls
            document.getElementById('hardwareInfo').style.display = 'block';
            document.getElementById('testControls').style.display = 'block';

            return true;
        } catch (err) {
            this.log(`✗ Connection error: ${err.message}`);
            alert(`Connection failed: ${err.message}\n\nMake sure:\n1. HiChord is connected via USB\n2. You've allowed MIDI access in your browser`);
            return false;
        }
    }

    handleMIDI(event) {
        const data = Array.from(event.data);

        // SysEx message
        if (data[0] === 0xF0 && data[1] === 0x7D) {
            const cmd = data[2];

            // Hardware info response (0x14)
            if (cmd === 0x14 && data.length >= 8) {
                this.hardwareInfo = {
                    version: `${data[3]}.${data[4]}`,
                    batch: data[5],
                    buttonSystem: data[6] === 1 ? 'I2C' : 'ADC'
                };
                this.log(`Hardware: v${this.hardwareInfo.version}, Batch ${this.hardwareInfo.batch}, ${this.hardwareInfo.buttonSystem}`);

                document.getElementById('detectedFirmware').textContent = `v${this.hardwareInfo.version}`;
                document.getElementById('detectedBatch').textContent = `Batch ${this.hardwareInfo.batch}`;
                document.getElementById('detectedButtonSystem').textContent = this.hardwareInfo.buttonSystem;
            }

            // Test response (0x12)
            if (cmd === 0x12 && data.length >= 5 && this.testRunning) {
                const buttonId = data[3];
                this.handleButtonDetected(buttonId);
            }
        }
    }

    startTest() {
        this.testRunning = true;
        this.currentTestIndex = 0;
        this.results = [];

        // Hide test controls, show test display
        document.getElementById('testControls').style.display = 'none';
        document.getElementById('currentTest').style.display = 'block';

        this.showCurrentTest();
    }

    showCurrentTest() {
        if (this.currentTestIndex >= this.tests.length) {
            this.finishTests();
            return;
        }

        const test = this.tests[this.currentTestIndex];
        const progress = this.currentTestIndex + 1;
        const total = this.tests.length;

        document.getElementById('progressText').textContent = `${progress} / ${total}`;
        document.getElementById('progressFill').style.width = `${(this.currentTestIndex / total) * 100}%`;
        document.getElementById('currentTestInstruction').textContent = test.name;
        document.getElementById('statusIcon').textContent = '⏳';
        document.getElementById('statusText').textContent = 'Waiting for input...';
        document.getElementById('testStatus').className = 'test-status-indicator waiting';

        this.log(`Test ${progress}/${total}: ${test.name}`);
    }

    handleButtonDetected(buttonId) {
        const test = this.tests[this.currentTestIndex];

        this.log(`Button ${buttonId} detected (expected ${test.id})`);

        if (buttonId === test.id) {
            // PASS
            this.results.push({test: test.name, pass: true});
            document.getElementById('statusIcon').textContent = '✓';
            document.getElementById('statusText').textContent = 'PASS';
            document.getElementById('testStatus').className = 'test-status-indicator pass';

            setTimeout(() => {
                this.currentTestIndex++;
                this.showCurrentTest();
            }, 600);
        } else {
            // FAIL
            this.results.push({test: test.name, pass: false, reason: `Wrong button: got ${buttonId}`});
            document.getElementById('statusIcon').textContent = '✗';
            document.getElementById('statusText').textContent = `FAIL: Got button ${buttonId}`;
            document.getElementById('testStatus').className = 'test-status-indicator fail';

            setTimeout(() => {
                if (confirm(`Test failed: Expected button ${test.id}, got ${buttonId}.\n\nRetry this test?`)) {
                    this.showCurrentTest();
                } else {
                    this.currentTestIndex++;
                    this.showCurrentTest();
                }
            }, 1500);
        }
    }

    finishTests() {
        // Exit test mode
        this.sendSysEx([0xF0, 0x7D, 0x11, 0xF7]);
        this.testRunning = false;

        // Calculate results
        const passed = this.results.filter(r => r.pass).length;
        const failed = this.results.filter(r => !r.pass).length;

        // Hide test display, show results
        document.getElementById('currentTest').style.display = 'none';
        document.getElementById('testResults').style.display = 'block';

        const verdict = failed === 0 ? 'ALL TESTS PASSED' : `${failed} TEST(S) FAILED`;
        document.getElementById('verdictText').textContent = verdict;
        document.getElementById('verdictIcon').textContent = failed === 0 ? '✓' : '✗';
        document.getElementById('passedCount').textContent = passed;
        document.getElementById('failedCount').textContent = failed;

        // Show detailed results
        const resultsList = document.getElementById('detailedResultsList');
        resultsList.innerHTML = '';
        this.results.forEach((r, i) => {
            const div = document.createElement('div');
            div.className = `result-row ${r.pass ? 'pass' : 'fail'}`;
            div.innerHTML = `
                <span class="result-number">${i + 1}</span>
                <span class="result-name">${r.test}</span>
                <span class="result-status">${r.pass ? '✓ PASS' : '✗ FAIL'}</span>
            `;
            resultsList.appendChild(div);
        });

        this.log(`Test complete: ${passed} passed, ${failed} failed`);

        // Setup restart button
        document.getElementById('restartTestBtn').onclick = () => {
            location.reload();
        };
    }

    sendSysEx(data) {
        if (this.midiOutput) {
            this.midiOutput.send(data);
            this.log(`→ TX: ${data.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);
        }
    }

    log(msg) {
        console.log(`[HiChord Test] ${msg}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global instance
let testApp;

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    testApp = new HiChordTest();

    document.getElementById('connectBtn').addEventListener('click', async () => {
        document.getElementById('connectBtn').disabled = true;
        document.getElementById('connectBtn').textContent = 'Connecting...';
        await testApp.connect();
    });

    // Start test button
    const startBtn = document.getElementById('startTestBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => testApp.startTest());
    }
});
