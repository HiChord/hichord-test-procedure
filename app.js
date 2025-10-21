// HiChord Test Procedure - Interactive Test Tracking
// Test state management

const testResults = {
    totalTests: 12,
    results: {} // {testNumber: 'pass'|'fail'|'skip'}
};

// Load saved test results from localStorage
function loadTestResults() {
    const saved = localStorage.getItem('hichord-test-results');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            testResults.results = data.results || {};
            updateAllTestStates();
            updateSummary();
        } catch (e) {
            console.error('Failed to load test results:', e);
        }
    }
}

// Save test results to localStorage
function saveTestResults() {
    localStorage.setItem('hichord-test-results', JSON.stringify(testResults));
}

// Mark a test with result
function markTest(testNumber, result) {
    testResults.results[testNumber] = result;

    // Update visual state
    const testStep = document.querySelector(`.test-step[data-step="${testNumber}"]`);
    if (testStep) {
        testStep.classList.remove('passed', 'failed', 'skipped');
        if (result === 'pass') {
            testStep.classList.add('passed');
        } else if (result === 'fail') {
            testStep.classList.add('failed');
        } else if (result === 'skip') {
            testStep.classList.add('skipped');
        }
    }

    updateSummary();
    saveTestResults();

    // Smooth scroll to next test
    scrollToNextTest(testNumber);
}

// Update all test visual states from saved data
function updateAllTestStates() {
    Object.entries(testResults.results).forEach(([testNumber, result]) => {
        const testStep = document.querySelector(`.test-step[data-step="${testNumber}"]`);
        if (testStep) {
            testStep.classList.remove('passed', 'failed', 'skipped');
            if (result === 'pass') {
                testStep.classList.add('passed');
            } else if (result === 'fail') {
                testStep.classList.add('failed');
            } else if (result === 'skip') {
                testStep.classList.add('skipped');
            }
        }
    });
}

// Update summary counts
function updateSummary() {
    const passed = Object.values(testResults.results).filter(r => r === 'pass').length;
    const failed = Object.values(testResults.results).filter(r => r === 'fail').length;
    const skipped = Object.values(testResults.results).filter(r => r === 'skip').length;
    const remaining = testResults.totalTests - (passed + failed + skipped);

    document.getElementById('passCount').textContent = passed;
    document.getElementById('failCount').textContent = failed;
    document.getElementById('skipCount').textContent = skipped;
    document.getElementById('remainingCount').textContent = remaining;
}

// Scroll to next test after marking current
function scrollToNextTest(currentTestNumber) {
    const nextTestNumber = currentTestNumber + 1;
    if (nextTestNumber <= testResults.totalTests) {
        setTimeout(() => {
            const nextTest = document.querySelector(`.test-step[data-step="${nextTestNumber}"]`);
            if (nextTest && !testResults.results[nextTestNumber]) {
                nextTest.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    } else {
        // All tests complete, scroll to summary
        setTimeout(() => {
            const summary = document.querySelector('.summary-section');
            if (summary) {
                summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    }
}

// Reset all tests
function resetTests() {
    if (confirm('Are you sure you want to reset all test results? This cannot be undone.')) {
        testResults.results = {};
        localStorage.removeItem('hichord-test-results');

        // Clear all visual states
        document.querySelectorAll('.test-step').forEach(step => {
            step.classList.remove('passed', 'failed', 'skipped');
        });

        updateSummary();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Generate printable report
function printReport() {
    // Prepare report data
    const passed = Object.values(testResults.results).filter(r => r === 'pass').length;
    const failed = Object.values(testResults.results).filter(r => r === 'fail').length;
    const skipped = Object.values(testResults.results).filter(r => r === 'skip').length;
    const remaining = testResults.totalTests - (passed + failed + skipped);

    // Add print metadata
    const printHeader = document.createElement('div');
    printHeader.className = 'print-header';
    printHeader.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; padding: 20px; border: 2px solid #0A0A0A;">
            <h2 style="margin-bottom: 10px;">HICHORD TEST REPORT</h2>
            <p>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            <p>Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped} | Remaining: ${remaining}</p>
        </div>
    `;

    document.body.insertBefore(printHeader, document.body.firstChild);

    // Print
    window.print();

    // Remove print header after print dialog closes
    setTimeout(() => {
        printHeader.remove();
    }, 100);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R to reset (prevent default browser reload)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetTests();
    }

    // Ctrl/Cmd + P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printReport();
    }
});

// Add visual feedback for test step hover
document.addEventListener('DOMContentLoaded', () => {
    loadTestResults();

    // Add hover effect to highlight current test
    document.querySelectorAll('.test-step').forEach(step => {
        step.addEventListener('mouseenter', () => {
            if (!step.classList.contains('passed') &&
                !step.classList.contains('failed') &&
                !step.classList.contains('skipped')) {
                step.style.borderColor = '#FF6B35';
            }
        });

        step.addEventListener('mouseleave', () => {
            if (!step.classList.contains('passed') &&
                !step.classList.contains('failed') &&
                !step.classList.contains('skipped')) {
                step.style.borderColor = '#E5E7EB';
            }
        });
    });

    // Add animation to OLED screens
    animateOLEDScreens();
});

// Animate OLED screens for realism
function animateOLEDScreens() {
    const oledScreens = document.querySelectorAll('.oled-screen');
    oledScreens.forEach(screen => {
        // Add subtle glow effect
        screen.style.boxShadow = 'inset 0 0 20px rgba(255, 255, 255, 0.1), 0 0 10px rgba(255, 255, 255, 0.2)';
    });
}

// Export test results as JSON
function exportResults() {
    const results = {
        timestamp: new Date().toISOString(),
        totalTests: testResults.totalTests,
        results: testResults.results,
        summary: {
            passed: Object.values(testResults.results).filter(r => r === 'pass').length,
            failed: Object.values(testResults.results).filter(r => r === 'fail').length,
            skipped: Object.values(testResults.results).filter(r => r === 'skip').length
        }
    };

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hichord-test-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Progress indicator
function updateProgressBar() {
    const completed = Object.keys(testResults.results).length;
    const progress = (completed / testResults.totalTests) * 100;

    // Create or update progress bar
    let progressBar = document.getElementById('progress-bar');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'progress-bar';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: ${progress}%;
            height: 4px;
            background: linear-gradient(90deg, #FF6B35, #FFB800);
            transition: width 0.3s ease;
            z-index: 9999;
        `;
        document.body.appendChild(progressBar);
    } else {
        progressBar.style.width = `${progress}%`;
    }
}

// Update progress on any test result change
const originalMarkTest = markTest;
window.markTest = function(testNumber, result) {
    originalMarkTest(testNumber, result);
    updateProgressBar();
};

// Initialize progress bar
updateProgressBar();
