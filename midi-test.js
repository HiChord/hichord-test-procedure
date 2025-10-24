// ========================================
// MIDI Test Functionality - Simplified
// ========================================

let midiInput = null;
let midiOutput = null;
let midiTestActive = false;
let midiReceived = false;

async function startMidiTest() {
    const btn = document.getElementById('btnMidiTest');
    const statusEl = document.getElementById('midiConnectionStatus');
    const instructionEl = document.getElementById('midiInstruction');
    const resultEl = document.getElementById('midiResult');

    try {
        btn.disabled = true;
        btn.textContent = 'Connecting...';
        statusEl.innerHTML = '<div class="status-dot connecting"></div><span class="status-text">Connecting to HiChord...</span>';

        // Request MIDI access (no SysEx needed, we use standard CC messages)
        const midiAccess = await navigator.requestMIDIAccess({ sysex: false });

        // Find HiChord device
        let hichordInput = null;
        let hichordOutput = null;

        for (const input of midiAccess.inputs.values()) {
            if (input.name && input.name.toLowerCase().includes('hichord')) {
                hichordInput = input;
                break;
            }
        }

        for (const output of midiAccess.outputs.values()) {
            if (output.name && output.name.toLowerCase().includes('hichord')) {
                hichordOutput = output;
                break;
            }
        }

        if (!hichordInput || !hichordOutput) {
            throw new Error('HiChord not found. Please connect HiChord via USB-C.');
        }

        midiInput = hichordInput;
        midiOutput = hichordOutput;

        // Enable MIDI output on HiChord by sending CC #127 with value 1
        // This is the "web app connection handshake" that auto-enables MIDI OUT
        const controlChange = 0xB0; // Control Change on channel 1
        const ccNumber = 127;
        const ccValue = 1;
        midiOutput.send([controlChange, ccNumber, ccValue]);

        // Update status - Connected
        statusEl.innerHTML = '<div class="status-dot connected"></div><span class="status-text">Connected: ' + hichordInput.name + '</span>';
        btn.textContent = 'Connected ✓';
        btn.style.backgroundColor = '#28a745';
        btn.style.color = 'white';

        // Show instruction
        instructionEl.style.display = 'block';

        // Start listening for MIDI messages
        midiInput.onmidimessage = handleMidiMessage;
        midiTestActive = true;

    } catch (error) {
        console.error('MIDI connection error:', error);
        statusEl.innerHTML = '<div class="status-dot disconnected"></div><span class="status-text">Error: ' + error.message + '</span>';
        btn.disabled = false;
        btn.textContent = 'CONNECT & TEST MIDI';
        btn.style.backgroundColor = '';
        btn.style.color = '';
    }
}

function handleMidiMessage(message) {
    const [status, data1, data2] = message.data;
    const command = status & 0xF0;

    // Only respond to Note On messages (0x90) from button presses
    // Ignore Control Change messages from connection handshake
    if (command === 0x90 && data2 > 0) {
        if (!midiReceived) {
            midiReceived = true;

            // Hide instruction
            const instructionEl = document.getElementById('midiInstruction');
            instructionEl.style.display = 'none';

            // Show success
            const resultEl = document.getElementById('midiResult');
            resultEl.innerHTML = `
                <div class="midi-success">
                    <div class="success-icon">✓</div>
                    <div class="success-text">Success!</div>
                    <div class="success-subtext">MIDI communication working correctly</div>
                </div>
            `;
            resultEl.style.display = 'block';
        }
    }
}
