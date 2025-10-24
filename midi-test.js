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

        // Request MIDI access with SysEx for enabling MIDI output
        const midiAccess = await navigator.requestMIDIAccess({ sysex: true });

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

        // Enable MIDI output on HiChord (SysEx: F0 7D 00 01 F7)
        const enableMidiSysEx = [0xF0, 0x7D, 0x00, 0x01, 0xF7];
        midiOutput.send(enableMidiSysEx);

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
