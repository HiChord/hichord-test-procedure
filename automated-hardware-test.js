// HiChord Automated Hardware Test - SIMPLE MONITOR
// Device runs the test, web app just displays progress

class HiChordTest {
    constructor() {
        this.midiAccess = null;
        this.midiInput = null;
        this.midiOutput = null;
        this.testRunning = false;
        this.results = [];

        // Test names (21 tests) - matches firmware exactly
        this.testNames = [
            'Chord 1', 'Chord 2', 'Chord 3', 'Chord 4', 'Chord 5', 'Chord 6', 'Chord 7',
            'Menu Button 1', 'Menu Button 2', 'Menu Button 3',
            'Joystick UP', 'Joystick DOWN', 'Joystick LEFT', 'Joystick RIGHT',
            'Joystick UP-LEFT', 'Joystick UP-RIGHT', 'Joystick DOWN-LEFT', 'Joystick DOWN-RIGHT',
            'Joystick CLICK',
            'Volume LEFT', 'Volume RIGHT'
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

            // Test progress update (0x12): [step number] [pass/fail] [button pressed]
            if (cmd === 0x12 && data.length >= 6) {
                const stepNum = data[3];  // 1-19
                const passed = data[4] === 0x01;
                const buttonPressed = data[5];  // What button was actually pressed

                console.log(`[Test] Received 0x12: Step ${stepNum}, testRunning=${this.testRunning}`);

                if (!this.testRunning) {
                    console.warn(`[Test] Ignoring message - test not running!`);
                    return;
                }

                console.log(`[Test] Step ${stepNum}: ${passed ? 'PASS' : 'FAIL'} (pressed ${buttonPressed}, expected ${stepNum})`);

                // Store result with additional info
                this.results[stepNum - 1] = {
                    passed: passed,
                    buttonPressed: buttonPressed,
                    expectedButton: stepNum
                };

                this.updateProgress(stepNum, passed, buttonPressed);
            }

            // Final test report (0x15): [passed count] [failed count]
            if (cmd === 0x15 && data.length >= 5) {
                const passedCount = data[3];
                const failedCount = data[4];

                console.log(`[Test] Complete: ${passedCount} passed, ${failedCount} failed`);
                this.showResults(passedCount, failedCount);
            }
        }
    }

    startTest() {
        console.log('[Test] Starting test - setting testRunning = true');
        this.testRunning = true;
        this.results = [];

        // Hide controls, show simple "follow device" message
        document.getElementById('testControls').style.display = 'none';
        document.getElementById('currentTest').style.display = 'block';

        // Show simple message - all action is on the HiChord OLED
        document.getElementById('progressText').textContent = 'TEST RUNNING';
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('currentTestInstruction').innerHTML = '<strong>Follow the HiChord OLED</strong><br/>Press each button as shown on device';
        document.getElementById('statusIcon').textContent = '👀';
        document.getElementById('statusText').textContent = 'Watch Device';
        document.getElementById('testStatus').className = 'test-status-indicator waiting';

        // Enter test mode
        console.log('[Test] Sending SysEx 0x10 to enter test mode');
        this.sendSysEx([0xF0, 0x7D, 0x10, 0xF7]);

        console.log('[Test] Test running - technician follows HiChord OLED');
    }

    updateProgress(stepNum, passed, buttonPressed) {
        // Just update progress bar silently - all feedback is on the device OLED
        const progress = (stepNum / 21) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;

        // Log for debugging
        console.log(`[Test] Progress: ${stepNum}/21 - ${passed ? 'PASS' : 'FAIL'}`);
    }

    showResults(passedCount, failedCount) {
        this.testRunning = false;

        // Exit test mode
        this.sendSysEx([0xF0, 0x7D, 0x11, 0xF7]);

        // Hide progress, show results
        document.getElementById('currentTest').style.display = 'none';
        document.getElementById('testResults').style.display = 'block';

        document.getElementById('verdictText').textContent = failedCount === 0 ? 'ALL TESTS PASSED' : `${failedCount} FAILED`;
        document.getElementById('verdictIcon').textContent = failedCount === 0 ? '✓' : '✗';
        document.getElementById('passedCount').textContent = passedCount;
        document.getElementById('failedCount').textContent = failedCount;
        document.getElementById('totalCount').textContent = '21';

        // Show detailed results
        const detailDiv = document.getElementById('resultsDetail');
        if (detailDiv) {
            detailDiv.innerHTML = '';
            this.results.forEach((result, i) => {
                if (!result) return; // Skip if no result for this test

                const div = document.createElement('div');
                div.className = `result-row ${result.passed ? 'pass' : 'fail'}`;

                let statusText = result.passed ? '✓' : '✗';
                let failInfo = '';

                if (!result.passed && result.buttonPressed) {
                    const pressedName = this.testNames[result.buttonPressed - 1] || `Button ${result.buttonPressed}`;
                    failInfo = `<span class="fail-detail"> (got ${pressedName})</span>`;
                }

                div.innerHTML = `
                    <span class="result-number">${i + 1}</span>
                    <span class="result-name">${this.testNames[i]}${failInfo}</span>
                    <span class="result-status">${statusText}</span>
                `;
                detailDiv.appendChild(div);
            });
        }

        console.log(`[Test] Results displayed: ${passedCount}/21 passed`);
    }

    sendSysEx(data) {
        if (this.midiOutput) {
            this.midiOutput.send(data);
        }
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

// Helper functions for results
function resetAutoTests() {
    location.reload();
}

function printAutoResults() {
    window.print();
}
