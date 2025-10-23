// HiChord Automated Hardware Test - SIMPLE AND FAST
// Commercial-grade reliability

class HiChordTest {
    constructor() {
        this.midiAccess = null;
        this.midiInput = null;
        this.midiOutput = null;
        this.testRunning = false;
        this.currentTestIndex = 0;
        this.results = [];

        // 19 button tests
        this.tests = [
            {id: 1, name: 'Chord Button 1'},
            {id: 2, name: 'Chord Button 2'},
            {id: 3, name: 'Chord Button 3'},
            {id: 4, name: 'Chord Button 4'},
            {id: 5, name: 'Chord Button 5'},
            {id: 6, name: 'Chord Button 6'},
            {id: 7, name: 'Chord Button 7'},
            {id: 8, name: 'Function 1 (Settings)'},
            {id: 9, name: 'Function 2 (Effects)'},
            {id: 10, name: 'Function 3 (BPM)'},
            {id: 11, name: 'Joystick UP'},
            {id: 12, name: 'Joystick DOWN'},
            {id: 13, name: 'Joystick LEFT'},
            {id: 14, name: 'Joystick RIGHT'},
            {id: 15, name: 'Joystick UP-LEFT'},
            {id: 16, name: 'Joystick UP-RIGHT'},
            {id: 17, name: 'Joystick DOWN-LEFT'},
            {id: 18, name: 'Joystick DOWN-RIGHT'},
            {id: 19, name: 'Joystick CLICK'}
        ];
    }

    async connect() {
        try {
            console.log('[Test] Requesting MIDI access...');

            if (!navigator.requestMIDIAccess) {
                throw new Error('Web MIDI not supported. Use Chrome, Edge, or Opera.');
            }

            this.midiAccess = await navigator.requestMIDIAccess({sysex: true});

            // Find HiChord
            for (const input of this.midiAccess.inputs.values()) {
                const name = (input.name || '').toLowerCase();
                if (name.includes('hichord') || name.includes('daisy') || name.includes('electrosmith')) {
                    this.midiInput = input;
                    this.midiInput.onmidimessage = (e) => this.handleMIDI(e);
                    console.log('[Test] Connected to:', input.name);
                    break;
                }
            }

            for (const output of this.midiAccess.outputs.values()) {
                const name = (output.name || '').toLowerCase();
                if (name.includes('hichord') || name.includes('daisy') || name.includes('electrosmith')) {
                    this.midiOutput = output;
                    break;
                }
            }

            if (!this.midiInput || !this.midiOutput) {
                throw new Error('HiChord not found. Connect via USB and refresh.');
            }

            // Update UI
            document.getElementById('statusIndicator').className = 'status-indicator connected';
            document.getElementById('statusTitle').textContent = 'Connected';
            document.getElementById('statusSubtitle').textContent = 'HiChord Ready';
            document.getElementById('connectBtn').textContent = 'Connected';
            document.getElementById('connectBtn').disabled = true;

            // Get hardware info
            this.sendSysEx([0xF0, 0x7D, 0x13, 0xF7]);
            await this.delay(100);

            // Enter test mode
            this.sendSysEx([0xF0, 0x7D, 0x10, 0xF7]);
            await this.delay(300);

            // Show test controls
            document.getElementById('hardwareInfo').style.display = 'block';
            document.getElementById('testControls').style.display = 'block';

            console.log('[Test] Ready!');
            return true;

        } catch (err) {
            console.error('[Test] Error:', err);
            document.getElementById('connectBtn').disabled = false;
            document.getElementById('connectBtn').textContent = 'Retry Connection';
            alert('Connection failed: ' + err.message);
            return false;
        }
    }

    handleMIDI(event) {
        const data = Array.from(event.data);

        // SysEx from HiChord
        if (data[0] === 0xF0 && data[1] === 0x7D) {
            const cmd = data[2];

            // Hardware info (0x14)
            if (cmd === 0x14 && data.length >= 8) {
                const version = `${data[3]}.${data[4]}`;
                const batch = data[5];
                const buttonSystem = data[6] === 1 ? 'I2C' : 'ADC';

                document.getElementById('detectedFirmware').textContent = `v${version}`;
                document.getElementById('detectedBatch').textContent = `Batch ${batch}`;
                document.getElementById('detectedButtonSystem').textContent = buttonSystem;

                console.log(`[Test] Hardware: v${version}, Batch ${batch}, ${buttonSystem}`);
            }

            // Test button response (0x12)
            if (cmd === 0x12 && data.length >= 5 && this.testRunning) {
                const buttonId = data[3];
                console.log(`[Test] Button detected: ${buttonId}`);
                this.checkButton(buttonId);
            }
        }
    }

    startTest() {
        this.testRunning = true;
        this.currentTestIndex = 0;
        this.results = [];

        document.getElementById('testControls').style.display = 'none';
        document.getElementById('currentTest').style.display = 'block';

        this.showTest();
    }

    showTest() {
        if (this.currentTestIndex >= this.tests.length) {
            this.finish();
            return;
        }

        const test = this.tests[this.currentTestIndex];
        const num = this.currentTestIndex + 1;

        document.getElementById('progressText').textContent = `${num} / ${this.tests.length}`;
        document.getElementById('progressFill').style.width = `${(num / this.tests.length) * 100}%`;
        document.getElementById('currentTestInstruction').textContent = `Press ${test.name}`;
        document.getElementById('statusIcon').textContent = '⏳';
        document.getElementById('statusText').textContent = 'Waiting...';
        document.getElementById('testStatus').className = 'test-status-indicator waiting';
    }

    checkButton(buttonId) {
        const test = this.tests[this.currentTestIndex];

        if (buttonId === test.id) {
            // PASS
            this.results.push({name: test.name, pass: true});
            document.getElementById('statusIcon').textContent = '✓';
            document.getElementById('statusText').textContent = 'PASS';
            document.getElementById('testStatus').className = 'test-status-indicator pass';

            // Move to next test after brief delay
            setTimeout(() => {
                this.currentTestIndex++;
                this.showTest();
            }, 400);

        } else {
            // FAIL
            this.results.push({name: test.name, pass: false, reason: `Got button ${buttonId}`});
            document.getElementById('statusIcon').textContent = '✗';
            document.getElementById('statusText').textContent = `FAIL: Got button ${buttonId}`;
            document.getElementById('testStatus').className = 'test-status-indicator fail';

            // Auto-advance after showing error
            setTimeout(() => {
                this.currentTestIndex++;
                this.showTest();
            }, 1500);
        }
    }

    finish() {
        this.testRunning = false;
        this.sendSysEx([0xF0, 0x7D, 0x11, 0xF7]); // Exit test mode

        const passed = this.results.filter(r => r.pass).length;
        const failed = this.results.filter(r => !r.pass).length;

        document.getElementById('currentTest').style.display = 'none';
        document.getElementById('testResults').style.display = 'block';

        document.getElementById('verdictText').textContent = failed === 0 ? 'ALL TESTS PASSED' : `${failed} FAILED`;
        document.getElementById('verdictIcon').textContent = failed === 0 ? '✓' : '✗';
        document.getElementById('passedCount').textContent = passed;
        document.getElementById('failedCount').textContent = failed;

        // Show results
        const list = document.getElementById('detailedResultsList');
        if (list) {
            list.innerHTML = '';
            this.results.forEach((r, i) => {
                const div = document.createElement('div');
                div.className = `result-row ${r.pass ? 'pass' : 'fail'}`;
                div.innerHTML = `
                    <span class="result-number">${i + 1}</span>
                    <span class="result-name">${r.name}</span>
                    <span class="result-status">${r.pass ? '✓' : '✗'}</span>
                `;
                list.appendChild(div);
            });
        }

        const restartBtn = document.getElementById('restartTestBtn');
        if (restartBtn) {
            restartBtn.onclick = () => location.reload();
        }

        console.log(`[Test] Complete: ${passed} passed, ${failed} failed`);
    }

    sendSysEx(data) {
        if (this.midiOutput) {
            this.midiOutput.send(data);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global instance
let automatedTestApp;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Test] App starting...');
    automatedTestApp = new HiChordTest();

    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.addEventListener('click', async () => {
            connectBtn.disabled = true;
            connectBtn.textContent = 'Connecting...';
            await automatedTestApp.connect();
        });
    }

    const startBtn = document.getElementById('startTestBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => automatedTestApp.startTest());
    }

    console.log('[Test] Ready. Click Connect to begin.');
});
