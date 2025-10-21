// HiChord Test Procedure - Main Application
// Coordinates Manual and Automated test modes

class TestProcedureApp {
    constructor() {
        this.currentMode = 'manual';
        this.currentTestIndex = 0;
        this.totalTests = 12;
        this.testResults = {};
        this.automatedSystem = new AutomatedTestSystem();

        this.init();
    }

    init() {
        this.setupModeSelector();
        this.loadManualTests();
        this.setupNavigation();
        this.loadTestResults();
    }

    setupModeSelector() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.switchMode(mode);
            });
        });
    }

    switchMode(mode) {
        this.currentMode = mode;

        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Show/hide mode containers
        document.getElementById('manualMode').classList.toggle('active', mode === 'manual');
        document.getElementById('automatedMode').classList.toggle('active', mode === 'automated');

        // Reset to first test when switching modes
        this.currentTestIndex = 0;
        this.updateTestDisplay();
    }

    loadManualTests() {
        const container = document.getElementById('manualSteps');
        container.innerHTML = ''; // Clear existing content
        manualTests.forEach((test, index) => {
            const testElement = document.createElement('div');
            testElement.innerHTML = buildManualTestHTML(test);
            const testDiv = testElement.querySelector('.manual-test');
            if (testDiv) {
                testDiv.style.display = index === 0 ? 'block' : 'none';
                container.appendChild(testDiv);
            }
        });

        // Build test overview navigation
        this.buildTestOverview('testOverview', manualTests);

        // Show first test
        this.updateTestDisplay();
    }

    buildTestOverview(containerId, tests) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        tests.forEach((test, index) => {
            const item = document.createElement('div');
            item.className = 'test-overview-item';
            if (index === 0) item.classList.add('active');

            item.innerHTML = `
                <div class="test-overview-number">${String(test.id).padStart(2, '0')}</div>
                <div class="test-overview-name">${test.name}</div>
            `;

            item.addEventListener('click', () => {
                this.currentTestIndex = index;
                this.updateTestDisplay();
            });

            container.appendChild(item);
        });
    }

    loadAutomatedTests() {
        const container = document.getElementById('autoTestContainer');
        container.innerHTML = '';
        automatedTests.forEach((test, index) => {
            const testElement = document.createElement('div');
            testElement.innerHTML = buildAutomatedTestHTML(test, this.automatedSystem);
            const testDiv = testElement.querySelector('.automated-test');
            if (testDiv) {
                testDiv.style.display = index === 0 ? 'block' : 'none';
                container.appendChild(testDiv);
            }
        });

        // Build test overview navigation
        this.buildTestOverview('testOverviewAuto', automatedTests);

        // Show first test
        this.updateTestDisplay();
    }

    setupNavigation() {
        // Manual mode navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.previousTest());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextTest());
        document.getElementById('prevBtnBottom').addEventListener('click', () => this.previousTest());
        document.getElementById('nextBtnBottom').addEventListener('click', () => this.nextTest());

        // Automated mode navigation
        document.getElementById('prevBtnAuto').addEventListener('click', () => this.previousTest());
        document.getElementById('nextBtnAuto').addEventListener('click', () => this.nextTest());
        document.getElementById('prevBtnAutoBottom').addEventListener('click', () => this.previousTest());
        document.getElementById('nextBtnAutoBottom').addEventListener('click', () => this.nextTest());

        // Connect button
        document.getElementById('connectBtn').addEventListener('click', () => this.connectToHiChord());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && !e.shiftKey) {
                this.nextTest();
            } else if (e.key === 'ArrowLeft' && !e.shiftKey) {
                this.previousTest();
            }
        });
    }

    updateTestDisplay() {
        const allTests = this.currentMode === 'manual' ?
            document.querySelectorAll('.manual-test') :
            document.querySelectorAll('.automated-test');

        // Hide all tests
        allTests.forEach(test => test.style.display = 'none');

        // Show current test
        if (allTests[this.currentTestIndex]) {
            allTests[this.currentTestIndex].style.display = 'block';
        }

        // Update progress
        const progress = `Test ${this.currentTestIndex + 1} of ${this.totalTests}`;
        document.getElementById('testProgress').textContent = progress;
        if (document.getElementById('testProgressAuto')) {
            document.getElementById('testProgressAuto').textContent = progress;
        }

        // Update test overview active state
        const overviewId = this.currentMode === 'manual' ? 'testOverview' : 'testOverviewAuto';
        const overviewItems = document.querySelectorAll(`#${overviewId} .test-overview-item`);
        overviewItems.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentTestIndex);
        });

        // Update navigation buttons
        this.updateNavButtons();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateNavButtons() {
        const isFirst = this.currentTestIndex === 0;
        const isLast = this.currentTestIndex === this.totalTests - 1;

        // Manual mode buttons
        document.getElementById('prevBtn').disabled = isFirst;
        document.getElementById('prevBtnBottom').disabled = isFirst;
        document.getElementById('nextBtn').textContent = isLast ? 'Finish →' : 'Next →';
        document.getElementById('nextBtnBottom').textContent = isLast ? 'Finish →' : 'Next →';

        // Automated mode buttons
        if (document.getElementById('prevBtnAuto')) {
            document.getElementById('prevBtnAuto').disabled = isFirst;
            document.getElementById('prevBtnAutoBottom').disabled = isFirst;
            document.getElementById('nextBtnAuto').textContent = isLast ? 'Finish →' : 'Next →';
            document.getElementById('nextBtnAutoBottom').textContent = isLast ? 'Finish →' : 'Next →';
        }
    }

    previousTest() {
        if (this.currentTestIndex > 0) {
            this.currentTestIndex--;
            this.updateTestDisplay();
        }
    }

    nextTest() {
        if (this.currentTestIndex < this.totalTests - 1) {
            this.currentTestIndex++;
            this.updateTestDisplay();
        } else {
            // Show summary
            this.showSummary();
        }
    }

    async connectToHiChord() {
        const connectBtn = document.getElementById('connectBtn');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusTitle = document.getElementById('statusTitle');
        const statusSubtitle = document.getElementById('statusSubtitle');

        connectBtn.disabled = true;
        connectBtn.textContent = 'Connecting...';
        statusTitle.textContent = 'Connecting';
        statusSubtitle.textContent = 'Please wait...';

        try {
            await this.automatedSystem.connect();

            // Connection successful
            statusIndicator.classList.remove('disconnected');
            statusIndicator.classList.add('connected');
            statusTitle.textContent = 'Connected';
            statusSubtitle.textContent = 'HiChord™ connected via USB-C';
            connectBtn.textContent = 'Disconnect';
            connectBtn.disabled = false;
            connectBtn.onclick = () => this.disconnectFromHiChord();

            // Show automated content
            document.getElementById('automatedContent').style.display = 'block';

            // Load automated tests
            this.loadAutomatedTests();

            // Show hardware info
            this.displayHardwareInfo();

        } catch (error) {
            statusIndicator.classList.remove('connected');
            statusIndicator.classList.add('disconnected');
            statusTitle.textContent = 'Connection Failed';
            statusSubtitle.textContent = error.message;
            connectBtn.textContent = 'Retry Connection';
            connectBtn.disabled = false;

            alert(`Connection Error:\n\n${error.message}\n\nMake sure:\n1. HiChord is powered on\n2. USB-C cable is connected\n3. You're using Chrome, Edge, or Opera browser`);
        }
    }

    disconnectFromHiChord() {
        this.automatedSystem.disconnect();

        const connectBtn = document.getElementById('connectBtn');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusTitle = document.getElementById('statusTitle');
        const statusSubtitle = document.getElementById('statusSubtitle');

        statusIndicator.classList.remove('connected');
        statusIndicator.classList.add('disconnected');
        statusTitle.textContent = 'Disconnected';
        statusSubtitle.textContent = 'Click to reconnect';
        connectBtn.textContent = 'Connect to HiChord';
        connectBtn.onclick = () => this.connectToHiChord();

        document.getElementById('automatedContent').style.display = 'none';
    }

    displayHardwareInfo() {
        const hardwareInfo = document.getElementById('hardwareInfo');
        hardwareInfo.style.display = 'block';

        document.getElementById('detectedBatch').textContent =
            this.automatedSystem.hardwareBatch || 'Detecting...';
        document.getElementById('detectedButtonSystem').textContent =
            this.automatedSystem.buttonSystem || 'Detecting...';

        const features = [];
        if (this.automatedSystem.hardwareBatch && parseInt(this.automatedSystem.hardwareBatch) >= 2) {
            features.push('Battery Detection');
        }
        if (this.automatedSystem.hardwareBatch && parseInt(this.automatedSystem.hardwareBatch) >= 4) {
            features.push('Microphone Input');
        }
        document.getElementById('detectedFeatures').textContent =
            features.length > 0 ? features.join(', ') : 'Basic Features';
    }

    showSummary() {
        // Calculate results
        const results = Object.values(this.testResults);
        const passed = results.filter(r => r === 'pass').length;
        const failed = results.filter(r => r === 'fail').length;
        const skipped = results.filter(r => r === 'skip').length;

        document.getElementById('passCount').textContent = passed;
        document.getElementById('failCount').textContent = failed;
        document.getElementById('skipCount').textContent = skipped;

        // Hide test modes, show summary
        document.getElementById('manualMode').style.display = 'none';
        document.getElementById('automatedMode').style.display = 'none';
        document.getElementById('summarySection').style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadTestResults() {
        const saved = localStorage.getItem('hichord-test-results-v2');
        if (saved) {
            try {
                this.testResults = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load test results:', e);
            }
        }
    }

    saveTestResults() {
        localStorage.setItem('hichord-test-results-v2', JSON.stringify(this.testResults));
    }

    log(message, testId) {
        const logContent = document.getElementById(`logContent${testId}`);
        if (logContent) {
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.textContent = message;
            logContent.appendChild(logItem);
            logContent.scrollTop = logContent.scrollHeight;
        }
    }
}

// Global test app instance
let testApp;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    testApp = new TestProcedureApp();
});

// Global functions for button handlers
function runAutomatedTest(testId) {
    const test = automatedTests.find(t => t.id === testId);
    if (!test || !test.autoTest) return;

    const statusEl = document.getElementById(`autoTestStatus${testId}`);
    const logEl = document.getElementById(`testLog${testId}`);
    const logContent = document.getElementById(`logContent${testId}`);

    // Show log
    logEl.style.display = 'block';
    logContent.innerHTML = '<div class="log-item">Starting test...</div>';

    statusEl.innerHTML = '<span class="status-text testing">⏳ Testing...</span>';

    // Run the test
    test.autoTest(testApp.automatedSystem)
        .then(result => {
            if (result.passed) {
                statusEl.innerHTML = '<span class="status-text passed">✓ PASSED</span>';
                logContent.innerHTML += `<div class="log-item success">${result.message}</div>`;
                testApp.testResults[testId] = 'pass';
            } else {
                statusEl.innerHTML = '<span class="status-text failed">✗ FAILED</span>';
                logContent.innerHTML += `<div class="log-item error">${result.message}</div>`;
                testApp.testResults[testId] = 'fail';
            }
            testApp.saveTestResults();
        })
        .catch(error => {
            statusEl.innerHTML = '<span class="status-text failed">✗ ERROR</span>';
            logContent.innerHTML += `<div class="log-item error">Error: ${error.message}</div>`;
            testApp.testResults[testId] = 'fail';
            testApp.saveTestResults();
        });
}

function resetTests() {
    if (confirm('Reset all test results? This cannot be undone.')) {
        testApp.testResults = {};
        testApp.saveTestResults();
        location.reload();
    }
}

function goBackToTests() {
    document.getElementById('summarySection').style.display = 'none';
    if (testApp.currentMode === 'manual') {
        document.getElementById('manualMode').style.display = 'block';
    } else {
        document.getElementById('automatedMode').style.display = 'block';
    }
    testApp.currentTestIndex = 0;
    testApp.updateTestDisplay();
}

function printReport() {
    window.print();
}

// Logging helper for tests
testApp.log = function(message, testId) {
    const logContent = document.getElementById(`logContent${testId}`);
    if (logContent) {
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.textContent = message;
        logContent.appendChild(logItem);
        logContent.scrollTop = logContent.scrollHeight;
    }
};
