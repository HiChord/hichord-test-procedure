// HiChord Automated Hardware Test - SIMPLE MONITOR
// Device runs the test, web app just displays progress

class HiChordTest {
    constructor() {
        this.midiAccess = null;
        this.midiInput = null;
        this.midiOutput = null;
        this.testRunning = false;
        this.results = [];

        // Latest firmware version (update this when releasing new firmware)
        this.latestFirmwareVersion = { major: 2, minor: 3, patch: 0 };

        // Test names (19 tests - no volume) - matches firmware exactly
        this.testNames = [
            'Chord 1', 'Chord 2', 'Chord 3', 'Chord 4', 'Chord 5', 'Chord 6', 'Chord 7',
            'Menu Button 1', 'Menu Button 2', 'Menu Button 3',
            'Joystick UP', 'Joystick DOWN', 'Joystick LEFT', 'Joystick RIGHT',
            'Joystick UP-LEFT', 'Joystick UP-RIGHT', 'Joystick DOWN-LEFT', 'Joystick DOWN-RIGHT',
            'Joystick CLICK'
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

        // Log all incoming MIDI messages for debugging
        console.log(`[Test] Raw MIDI: [${data.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]`);

        // SysEx from HiChord
        if (data[0] === 0xF0 && data[1] === 0x7D) {
            const cmd = data[2];

            // Hardware info (0x14)
            if (cmd === 0x14 && data.length >= 8) {
                const fwMajor = data[3];
                const fwMinor = data[4];
                const version = `${fwMajor}.${fwMinor}`;
                const batch = data[5];
                const buttonSystem = data[6] === 1 ? 'I2C' : 'ADC';

                // Check if firmware is up-to-date
                const isUpToDate = (fwMajor > this.latestFirmwareVersion.major) ||
                                   (fwMajor === this.latestFirmwareVersion.major &&
                                    fwMinor >= this.latestFirmwareVersion.minor);

                const versionStatus = isUpToDate
                    ? `<span style="color: #27ae60; font-weight: 600;">v${version} ✓ (Up-to-date)</span>`
                    : `<span style="color: #e74c3c; font-weight: 600;">v${version} ⚠️ (Update available: v${this.latestFirmwareVersion.major}.${this.latestFirmwareVersion.minor})</span>`;

                document.getElementById('detectedFirmware').innerHTML = versionStatus;
                document.getElementById('detectedBatch').textContent = `Batch ${batch}`;
                document.getElementById('detectedButtonSystem').textContent = buttonSystem;

                console.log(`[Test] Hardware: v${version}, Batch ${batch}, ${buttonSystem}, Up-to-date: ${isUpToDate}`);
            }

            // Test progress update (0x12): [step number] [pass/fail] [button pressed]
            // We receive these but DON'T update the UI - device OLED shows everything
            if (cmd === 0x12 && data.length >= 6) {
                const stepNum = data[3];  // 1-19
                const passed = data[4] === 0x01;
                const buttonPressed = data[5];  // What button was actually pressed

                console.log(`[Test] ✓ Received 0x12: Step ${stepNum}/19: ${passed ? 'PASS' : 'FAIL'} (button ${buttonPressed})`);

                // Store result for final report (but don't update UI during test)
                this.results[stepNum - 1] = {
                    passed: passed,
                    buttonPressed: buttonPressed,
                    expectedButton: stepNum
                };

                // NO UI UPDATE - device shows progress on its OLED
            }

            // Final test report (0x15): [passed count] [failed count]
            if (cmd === 0x15 && data.length >= 5) {
                const passedCount = data[3];
                const failedCount = data[4];

                console.log(`[Test] ✓✓✓ Received final report (0x15): ${passedCount} passed, ${failedCount} failed`);
                console.log(`[Test] Results array length: ${this.results.filter(r => r !== undefined).length}`);
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

        // SIMPLIFIED: Just show "Testing on device" - no progress tracking
        document.getElementById('progressText').textContent = 'Testing on device...';
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('progressFill').style.backgroundColor = '#3498db'; // Blue color
        document.getElementById('currentTestInstruction').innerHTML = '<strong>Follow HiChord OLED display</strong><br><br>Device will show "Complete All Pass" when finished';

        // Clear test display and status
        document.getElementById('testDisplay').innerHTML = '';
        document.getElementById('statusIcon').textContent = '';
        document.getElementById('statusText').textContent = '';
        document.getElementById('testStatus').className = 'test-status-indicator waiting';

        // Enter test mode
        console.log('[Test] Sending SysEx 0x10 to enter test mode');
        this.sendSysEx([0xF0, 0x7D, 0x10, 0xF7]);

        console.log('[Test] Test running - technician follows HiChord OLED');
    }

    updateProgress(stepNum, passed, buttonPressed) {
        // Update progress bar and counter
        const progress = (stepNum / 19) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${stepNum} / 19`;

        // Update instruction text based on progress
        if (stepNum === 19) {
            // All tests complete - waiting for final report
            document.getElementById('currentTestInstruction').innerHTML =
                '<strong style="color: #27ae60;">Test complete! Waiting for final report from device...</strong>';

            // Set a timeout to check if we got the final report
            // If not received within 3 seconds, show warning
            if (this.finalReportTimeout) {
                clearTimeout(this.finalReportTimeout);
            }
            this.finalReportTimeout = setTimeout(() => {
                if (this.testRunning) {
                    console.warn('[Test] Final report (0x15) not received after 3 seconds!');
                    document.getElementById('currentTestInstruction').innerHTML =
                        '<strong style="color: #e74c3c;">⚠️ Connection issue detected. Check USB cable and device status.</strong>';
                }
            }, 3000);
        } else {
            // Still testing - follow OLED
            document.getElementById('currentTestInstruction').innerHTML =
                'Follow the instructions on the HiChord OLED display';
        }

        // Log for debugging
        console.log(`[Test] Progress: ${stepNum}/19 - ${passed ? 'PASS' : 'FAIL'}`);
    }

    showResults(passedCount, failedCount) {
        this.testRunning = false;

        console.log(`[Test] ✓ Test complete: ${passedCount} passed, ${failedCount} failed`);

        // SIMPLIFIED: No progress bar manipulation - just show results
        // Clear the timeout since we got the final report
        if (this.finalReportTimeout) {
            clearTimeout(this.finalReportTimeout);
            this.finalReportTimeout = null;
        }

        // Exit test mode
        this.sendSysEx([0xF0, 0x7D, 0x11, 0xF7]);

        // Hide progress, show results
        document.getElementById('currentTest').style.display = 'none';
        document.getElementById('testResults').style.display = 'block';

        document.getElementById('verdictText').textContent = failedCount === 0 ? 'ALL TESTS PASSED' : `${failedCount} FAILED`;
        document.getElementById('verdictIcon').textContent = failedCount === 0 ? '✓' : '✗';
        document.getElementById('passedCount').textContent = passedCount;
        document.getElementById('failedCount').textContent = failedCount;
        document.getElementById('totalCount').textContent = '19';

        // Restart device after 2 seconds
        setTimeout(() => {
            console.log('[Test] Restarting device...');
            // Send restart command (SysEx 0x7D 0x99)
            this.sendSysEx([0xF0, 0x7D, 0x99, 0xF7]);
        }, 2000);

        // Show detailed results (only for tests we actually received)
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

        console.log(`[Test] ✓ Results displayed: ${passedCount}/19 passed`);
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
