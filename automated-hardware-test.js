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

        console.log('[HiChord Test] Initialized');
    }

    async connect() {
        try {
            console.log('[HiChord Test] Requesting MIDI access...');

            // Check if Web MIDI is supported
            if (!navigator.requestMIDIAccess) {
                throw new Error('Web MIDI API not supported in this browser. Please use Chrome, Edge, or Opera.');
            }

            this.midiAccess = await navigator.requestMIDIAccess({sysex: true});
            console.log('[HiChord Test] MIDI access granted');

            // List all MIDI devices for debugging
            console.log('[HiChord Test] Available MIDI inputs:');
            for (const input of this.midiAccess.inputs.values()) {
                console.log(`  - ${input.name} (${input.manufacturer})`);
            }
            console.log('[HiChord Test] Available MIDI outputs:');
            for (const output of this.midiAccess.outputs.values()) {
                console.log(`  - ${output.name} (${output.manufacturer})`);
            }

            // Find HiChord - try multiple matching strategies
            this.midiInput = null;
            this.midiOutput = null;

            for (const input of this.midiAccess.inputs.values()) {
                const name = (input.name || '').toLowerCase();
                if (name.includes('hichord') || name.includes('daisy') || name.includes('electrosmith')) {
                    this.midiInput = input;
                    this.midiInput.onmidimessage = (e) => this.handleMIDI(e);
                    console.log(`[HiChord Test] Found input: ${input.name}`);
                    break;
                }
            }

            for (const output of this.midiAccess.outputs.values()) {
                const name = (output.name || '').toLowerCase();
                if (name.includes('hichord') || name.includes('daisy') || name.includes('electrosmith')) {
                    this.midiOutput = output;
                    console.log(`[HiChord Test] Found output: ${output.name}`);
                    break;
                }
            }

            if (!this.midiInput || !this.midiOutput) {
                // Show available devices in error
                let deviceList = '\n\nAvailable MIDI devices:\n';
                for (const input of this.midiAccess.inputs.values()) {
                    deviceList += `  INPUT: ${input.name}\n`;
                }
                for (const output of this.midiAccess.outputs.values()) {
                    deviceList += `  OUTPUT: ${output.name}\n`;
                }
                throw new Error('HiChord not found in MIDI devices.' + deviceList + '\n\nMake sure HiChord is connected and powered on.');
            }

            this.connected = true;
            console.log('[HiChord Test] ✓ Connected to HiChord');

            // Update UI
            document.getElementById('statusIndicator').className = 'status-indicator connected';
            document.getElementById('statusTitle').textContent = 'Connected';
            document.getElementById('statusSubtitle').textContent = 'HiChord™ Ready';
            document.getElementById('connectBtn').textContent = 'Connected';
            document.getElementById('connectBtn').disabled = true;

            // Request hardware info
            console.log('[HiChord Test] Requesting hardware info...');
            await this.delay(200);
            this.sendSysEx([0xF0, 0x7D, 0x13, 0xF7]);

            // Enter test mode
            console.log('[HiChord Test] Entering test mode...');
            await this.delay(500);
            this.sendSysEx([0xF0, 0x7D, 0x10, 0xF7]);

            // Show hardware info and test controls
            document.getElementById('hardwareInfo').style.display = 'block';
            document.getElementById('testControls').style.display = 'block';

            console.log('[HiChord Test] Connection complete, ready to test');
            return true;

        } catch (err) {
            console.error('[HiChord Test] Connection error:', err);

            // Re-enable button
            document.getElementById('connectBtn').disabled = false;
            document.getElementById('connectBtn').textContent = 'Connect to HiChord';

            alert(`Connection failed: ${err.message}\n\nTroubleshooting:\n1. Make sure HiChord is connected via USB\n2. Make sure HiChord is powered on\n3. Try refreshing the page\n4. Check browser console for details (F12)`);
            return false;
        }
    }

    handleMIDI(event) {
        const data = Array.from(event.data);

        // SysEx message
        if (data[0] === 0xF0 && data[1] === 0x7D) {
            const cmd = data[2];

            console.log(`[HiChord Test] ← RX SysEx: ${data.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);

            // Hardware info response (0x14)
            if (cmd === 0x14 && data.length >= 8) {
                this.hardwareInfo = {
                    version: `${data[3]}.${data[4]}`,
                    batch: data[5],
                    buttonSystem: data[6] === 1 ? 'I2C' : 'ADC'
                };
                console.log(`[HiChord Test] Hardware info received: v${this.hardwareInfo.version}, Batch ${this.hardwareInfo.batch}, ${this.hardwareInfo.buttonSystem}`);

                document.getElementById('detectedFirmware').textContent = `v${this.hardwareInfo.version}`;
                document.getElementById('detectedBatch').textContent = `Batch ${this.hardwareInfo.batch}`;
                document.getElementById('detectedButtonSystem').textContent = this.hardwareInfo.buttonSystem;
            }

            // Test response (0x12)
            if (cmd === 0x12 && data.length >= 5 && this.testRunning) {
                const buttonId = data[3];
                console.log(`[HiChord Test] Test response: button ${buttonId}`);
                this.handleButtonDetected(buttonId);
            }
        }
    }

    startTest() {
        this.testRunning = true;
        this.currentTestIndex = 0;
        this.results = [];

        console.log('[HiChord Test] Starting test sequence');

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

        console.log(`[HiChord Test] Test ${progress}/${total}: ${test.name}`);
    }

    handleButtonDetected(buttonId) {
        const test = this.tests[this.currentTestIndex];

        console.log(`[HiChord Test] Button ${buttonId} detected (expected ${test.id})`);

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

        console.log('[HiChord Test] Test sequence complete');

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
        if (resultsList) {
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
        }

        console.log(`[HiChord Test] Results: ${passed} passed, ${failed} failed`);

        // Setup restart button
        const restartBtn = document.getElementById('restartTestBtn');
        if (restartBtn) {
            restartBtn.onclick = () => location.reload();
        }
    }

    sendSysEx(data) {
        if (this.midiOutput) {
            this.midiOutput.send(data);
            console.log(`[HiChord Test] → TX SysEx: ${data.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);
        } else {
            console.error('[HiChord Test] Cannot send SysEx: MIDI output not connected');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global instance - use unique name to avoid conflict with app.js
let automatedTestApp;

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('[HiChord Test] DOM loaded, initializing...');

    automatedTestApp = new HiChordTest();

    const connectBtn = document.getElementById('connectBtn');
    if (!connectBtn) {
        console.error('[HiChord Test] ERROR: Connect button not found!');
        return;
    }

    console.log('[HiChord Test] Attaching event listeners...');

    connectBtn.addEventListener('click', async () => {
        console.log('[HiChord Test] Connect button clicked');
        connectBtn.disabled = true;
        connectBtn.textContent = 'Connecting...';
        await automatedTestApp.connect();
    });

    // Start test button
    const startBtn = document.getElementById('startTestBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            console.log('[HiChord Test] Start test button clicked');
            automatedTestApp.startTest();
        });
    } else {
        console.warn('[HiChord Test] Warning: Start test button not found (will be available after connection)');
    }

    console.log('[HiChord Test] Ready! Click "Connect to HiChord" to begin.');
});
