// ========================================
// MIDI Test Functionality
// ========================================

let midiInput = null;
let midiOutput = null;
let midiTestActive = false;

async function startMidiTest() {
    const btn = document.getElementById('btnMidiTest');
    const statusEl = document.getElementById('midiConnectionStatus');
    const logContainer = document.getElementById('midiLogContainer');

    try {
        btn.disabled = true;
        btn.textContent = 'Connecting...';

        // Request MIDI access
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

        // Update status
        statusEl.innerHTML = '<div class="status-dot connected"></div><span class="status-text">Connected: ' + hichordInput.name + '</span>';

        // Enable MIDI output on HiChord (SysEx: F0 7D 00 01 F7)
        const enableMidiSysEx = [0xF0, 0x7D, 0x00, 0x01, 0xF7];
        midiOutput.send(enableMidiSysEx);

        logMidiMessage('System', 'MIDI output enabled on HiChord', 'info');

        // Show log container
        logContainer.style.display = 'block';

        // Start listening for MIDI messages
        midiInput.onmidimessage = handleMidiMessage;

        btn.textContent = 'Connected ✓';
        btn.style.backgroundColor = '#28a745';
        midiTestActive = true;

    } catch (error) {
        console.error('MIDI connection error:', error);
        statusEl.innerHTML = '<div class="status-dot disconnected"></div><span class="status-text">Error: ' + error.message + '</span>';
        btn.disabled = false;
        btn.textContent = 'TEST MIDI';
        logMidiMessage('Error', error.message, 'error');
        logContainer.style.display = 'block';
    }
}

function handleMidiMessage(message) {
    const [status, data1, data2] = message.data;
    const channel = (status & 0x0F) + 1;
    const command = status & 0xF0;

    let msgType = '';
    let msgData = '';
    let msgClass = 'note';

    switch (command) {
        case 0x90: // Note On
            if (data2 > 0) {
                msgType = 'Note On';
                msgData = `Note: ${getMidiNoteName(data1)}, Velocity: ${data2}`;
                msgClass = 'note-on';
            } else {
                msgType = 'Note Off';
                msgData = `Note: ${getMidiNoteName(data1)}`;
                msgClass = 'note-off';
            }
            break;

        case 0x80: // Note Off
            msgType = 'Note Off';
            msgData = `Note: ${getMidiNoteName(data1)}`;
            msgClass = 'note-off';
            break;

        case 0xB0: // Control Change
            msgType = 'Control Change';
            msgData = `CC ${data1}: ${data2}`;
            msgClass = 'cc';
            break;

        case 0xC0: // Program Change
            msgType = 'Program Change';
            msgData = `Program: ${data1}`;
            msgClass = 'pc';
            break;

        default:
            msgType = 'Other';
            msgData = `Status: 0x${status.toString(16)}, Data: ${data1}, ${data2}`;
            msgClass = 'other';
    }

    logMidiMessage(msgType, msgData, msgClass);
}

function getMidiNoteName(note) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(note / 12) - 1;
    const noteName = noteNames[note % 12];
    return `${noteName}${octave} (${note})`;
}

function logMidiMessage(type, data, cssClass = '') {
    const logEl = document.getElementById('midiLog');

    // Remove empty message if present
    const emptyMsg = logEl.querySelector('.midi-log-empty');
    if (emptyMsg) {
        emptyMsg.remove();
    }

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });

    const msgEl = document.createElement('div');
    msgEl.className = `midi-message ${cssClass}`;
    msgEl.innerHTML = `
        <span class="midi-time">${timestamp}</span>
        <span class="midi-type">${type}</span>
        <span class="midi-data">${data}</span>
    `;

    logEl.insertBefore(msgEl, logEl.firstChild);

    // Keep only last 50 messages
    while (logEl.children.length > 50) {
        logEl.removeChild(logEl.lastChild);
    }
}

function clearMidiLog() {
    const logEl = document.getElementById('midiLog');
    logEl.innerHTML = '<div class="midi-log-empty">Waiting for MIDI messages...</div>';
}
