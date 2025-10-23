// HiChord Automated Hardware Test - REBUILT FROM SCRATCH
// Clean, simple, reliable button testing for production QA

class HiChordTest {
    constructor() {
        this.midi = null;
        this.midiInput = null;
        this.midiOutput = null;
        this.connected = false;
        this.testMode = false;

        // Test sequence: ONLY BUTTONS (19 total)
        // 7 chord buttons + 3 function buttons + 8 joystick directions + 1 joystick click
        this.tests = [
            {id: 1, name: 'Chord 1', type: 'button'},
            {id: 2, name: 'Chord 2', type: 'button'},
            {id: 3, name: 'Chord 3', type: 'button'},
            {id: 4, name: 'Chord 4', type: 'button'},
            {id: 5, name: 'Chord 5', type: 'button'},
            {id: 6, name: 'Chord 6', type: 'button'},
            {id: 7, name: 'Chord 7', type: 'button'},
            {id: 8, name: 'Function 1 (Settings)', type: 'button'},
            {id: 9, name: 'Function 2 (Effects)', type: 'button'},
            {id: 10, name: 'Function 3 (BPM)', type: 'button'},
            {id: 11, name: 'Joystick UP', type: 'joystick'},
            {id: 12, name: 'Joystick DOWN', type: 'joystick'},
            {id: 13, name: 'Joystick LEFT', type: 'joystick'},
            {id: 14, name: 'Joystick RIGHT', type: 'joystick'},
            {id: 15, name: 'Joystick UP-LEFT', type: 'joystick'},
            {id: 16, name: 'Joystick UP-RIGHT', type: 'joystick'},
            {id: 17, name: 'Joystick DOWN-LEFT', type: 'joystick'},
            {id: 18, name: 'Joystick DOWN-RIGHT', type: 'joystick'},
            {id: 19, name: 'Joystick CLICK', type: 'button'}
        ];

        this.currentTest = 0;
        this.results = [];
        this.hardwareInfo = null;
    }

    async connect() {
        try {
            this.log('Requesting MIDI access...', 'info');
            this.midi = await navigator.requestMIDIAccess({sysex: true});

            // Find HiChord
            for (const input of this.midi.inputs.values()) {
                if (input.name.toLowerCase().includes('hichord')) {
                    this.midiInput = input;
                    this.midiInput.onmidimessage = (e) => this.handleMIDI(e);
                    break;
                }
            }
            for (const output of this.midi.outputs.values()) {
                if (output.name.toLowerCase().includes('hichord')) {
                    this.midiOutput = output;
                    break;
                }
            }

            if (!this.midiInput || !this.midiOutput) {
                throw new Error('HiChord not found');
            }

            this.connected = true;
            this.log('✓ Connected to HiChord', 'success');

            // Request hardware info
            await this.delay(200);
            this.sendSysEx([0xF0, 0x7D, 0x13, 0xF7]); // Request HW info

            // Enter test mode
            await this.delay(500);
            this.sendSysEx([0xF0, 0x7D, 0x10, 0xF7]); // Enter test mode
            this.testMode = true;

            this.updateUI('connected');
            return true;
        } catch (err) {
            this.log(`✗ Error: ${err.message}`, 'error');
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
                this.log(`Hardware: v${this.hardwareInfo.version}, Batch ${this.hardwareInfo.batch}, ${this.hardwareInfo.buttonSystem}`, 'info');
                this.updateHardwareDisplay();
            }

            // Test response (0x12)
            if (cmd === 0x12 && data.length >= 5) {
                const buttonId = data[3];
                this.handleButtonDetected(buttonId);
            }
        }
    }

    handleButtonDetected(buttonId) {
        if (this.currentTest >= this.tests.length) return;

        const test = this.tests[this.currentTest];

        this.log(`Button ${buttonId} detected (expected ${test.id})`, buttonId === test.id ? 'success' : 'error');

        if (buttonId === test.id) {
            // PASS
            this.results.push({test: test.name, pass: true});
            this.showResult('✓ PASS', 'pass');
            setTimeout(() => this.nextTest(), 600);
        } else {
            // FAIL - wrong button
            this.results.push({test: test.name, pass: false, reason: `Wrong button: got ${buttonId}`});
            this.showResult(`✗ FAIL: Got button ${buttonId}`, 'fail');
            setTimeout(() => this.showRetrySkip(), 1500);
        }
    }

    nextTest() {
        this.currentTest++;
        if (this.currentTest >= this.tests.length) {
            this.finishTests();
        } else {
            this.showCurrentTest();
        }
    }

    showCurrentTest() {
        const test = this.tests[this.currentTest];
        document.getElementById('testNumber').textContent = `${this.currentTest + 1} / ${this.tests.length}`;
        document.getElementById('testName').textContent = test.name;
        document.getElementById('testResult').textContent = 'WAITING...';
        document.getElementById('testResult').className = 'result waiting';
        document.getElementById('testActions').style.display = 'none';

        // Update progress bar
        const percent = ((this.currentTest) / this.tests.length) * 100;
        document.getElementById('progress').style.width = `${percent}%`;
    }

    showResult(text, className) {
        document.getElementById('testResult').textContent = text;
        document.getElementById('testResult').className = `result ${className}`;
    }

    showRetrySkip() {
        document.getElementById('testActions').style.display = 'flex';
    }

    retryTest() {
        document.getElementById('testActions').style.display = 'none';
        this.showCurrentTest();
    }

    skipTest() {
        this.results.push({test: this.tests[this.currentTest].name, pass: false, reason: 'Skipped'});
        this.nextTest();
    }

    finishTests() {
        // Exit test mode
        this.sendSysEx([0xF0, 0x7D, 0x11, 0xF7]);
        this.testMode = false;

        // Show results
        const passed = this.results.filter(r => r.pass).length;
        const failed = this.results.filter(r => !r.pass).length;

        document.getElementById('testScreen').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        document.getElementById('passCount').textContent = passed;
        document.getElementById('failCount').textContent = failed;

        const verdict = failed === 0 ? 'ALL TESTS PASSED' : `${failed} TEST(S) FAILED`;
        document.getElementById('verdict').textContent = verdict;
        document.getElementById('verdict').className = failed === 0 ? 'pass' : 'fail';

        // Detailed results
        const details = document.getElementById('resultDetails');
        details.innerHTML = '';
        this.results.forEach((r, i) => {
            const div = document.createElement('div');
            div.className = `result-item ${r.pass ? 'pass' : 'fail'}`;
            div.innerHTML = `
                <span>${i + 1}. ${r.test}</span>
                <span>${r.pass ? '✓ PASS' : '✗ FAIL'}</span>
            `;
            details.appendChild(div);
        });

        this.log(`Test complete: ${passed} passed, ${failed} failed`, failed === 0 ? 'success' : 'error');
    }

    sendSysEx(data) {
        if (this.midiOutput) {
            this.midiOutput.send(data);
            this.log(`→ TX SysEx: ${data.map(b => b.toString(16).padStart(2, '0')).join(' ')}`, 'send');
        }
    }

    updateHardwareDisplay() {
        if (!this.hardwareInfo) return;
        document.getElementById('hwVersion').textContent = `v${this.hardwareInfo.version}`;
        document.getElementById('hwBatch').textContent = `Batch ${this.hardwareInfo.batch}`;
        document.getElementById('hwButtons').textContent = this.hardwareInfo.buttonSystem;
    }

    updateUI(state) {
        if (state === 'connected') {
            document.getElementById('connectScreen').style.display = 'none';
            document.getElementById('testScreen').style.display = 'block';
            this.showCurrentTest();
        }
    }

    log(msg, type = 'info') {
        const log = document.getElementById('log');
        const line = document.createElement('div');
        line.className = `log-${type}`;
        line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        log.appendChild(line);
        log.scrollTop = log.scrollHeight;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global instance
let testApp;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    testApp = new HiChordTest();

    document.getElementById('connectBtn').addEventListener('click', async () => {
        document.getElementById('connectBtn').disabled = true;
        document.getElementById('connectBtn').textContent = 'Connecting...';
        const success = await testApp.connect();
        if (success) {
            // Start tests automatically after connection
            setTimeout(() => testApp.showCurrentTest(), 500);
        } else {
            document.getElementById('connectBtn').disabled = false;
            document.getElementById('connectBtn').textContent = 'Retry Connection';
        }
    });

    document.getElementById('retryBtn').addEventListener('click', () => testApp.retryTest());
    document.getElementById('skipBtn').addEventListener('click', () => testApp.skipTest());
    document.getElementById('restartBtn').addEventListener('click', () => location.reload());
});
