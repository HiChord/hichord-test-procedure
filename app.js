// HiChord Test Procedure - Main Application
// Manual testing with USB/MIDI connection tests

class TestProcedureApp {
    constructor() {
        this.currentTestIndex = 0;
        this.totalTests = 13;
        this.testResults = {};

        this.init();
    }

    init() {
        this.loadManualTests();
        this.setupNavigation();
        this.loadTestResults();
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

    setupNavigation() {
        // Navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.previousTest());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextTest());
        document.getElementById('prevBtnBottom').addEventListener('click', () => this.previousTest());
        document.getElementById('nextBtnBottom').addEventListener('click', () => this.nextTest());

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
        const allTests = document.querySelectorAll('.manual-test');

        // Hide all tests
        allTests.forEach(test => test.style.display = 'none');

        // Show current test
        if (allTests[this.currentTestIndex]) {
            allTests[this.currentTestIndex].style.display = 'block';
        }

        // Update progress
        const progress = `Test ${this.currentTestIndex + 1} of ${this.totalTests}`;
        document.getElementById('testProgress').textContent = progress;

        // Update test overview active state
        const overviewItems = document.querySelectorAll('#testOverview .test-overview-item');
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

        document.getElementById('prevBtn').disabled = isFirst;
        document.getElementById('prevBtnBottom').disabled = isFirst;
        document.getElementById('nextBtn').textContent = isLast ? 'Finish →' : 'Next →';
        document.getElementById('nextBtnBottom').textContent = isLast ? 'Finish →' : 'Next →';
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

    showSummary() {
        // Calculate results
        const results = Object.values(this.testResults);
        const passed = results.filter(r => r === 'pass').length;
        const failed = results.filter(r => r === 'fail').length;
        const skipped = results.filter(r => r === 'skip').length;

        document.getElementById('passCount').textContent = passed;
        document.getElementById('failCount').textContent = failed;
        document.getElementById('skipCount').textContent = skipped;

        // Hide tests, show summary
        document.getElementById('manualMode').style.display = 'none';
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
function resetTests() {
    if (confirm('Reset all test results? This cannot be undone.')) {
        testApp.testResults = {};
        testApp.saveTestResults();
        location.reload();
    }
}

function goBackToTests() {
    document.getElementById('summarySection').style.display = 'none';
    document.getElementById('manualMode').style.display = 'block';
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
