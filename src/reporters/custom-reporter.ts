/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CUSTOM REPORTER - Enhanced Test Reporting
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Custom Playwright reporter with enhanced output and metrics.
 * WHY: Default reporters may not meet enterprise reporting requirements.
 * IF NOT USED: Generic reports, missing custom metrics or formatting.
 * INTERVIEW TIP: "Custom reporters implement Reporter interface with lifecycle hooks"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    Reporter,
    TestCase,
    TestResult,
    FullResult,
    Suite,
    FullConfig
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface TestMetrics {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    duration: number;
}

interface TestSummary {
    name: string;
    status: string;
    duration: number;
    error?: string;
    retries: number;
}

/**
 * Custom Reporter Implementation
 *
 * INTERVIEW TIP: "Playwright reporters have hooks for:
 * onBegin, onTestBegin, onTestEnd, onEnd, onError, onStdOut, onStdErr"
 */
export default class CustomReporter implements Reporter {
    private metrics: TestMetrics = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        flaky: 0,
        duration: 0
    };

    private testSummaries: TestSummary[] = [];
    private startTime: number = 0;
    private outputDir: string = 'reports';

    /**
     * Called once before running tests
     *
     * INTERVIEW TIP: "onBegin receives the full config and root suite -
     * use it for setup and counting total tests"
     */
    onBegin(config: FullConfig, suite: Suite): void {
        this.startTime = Date.now();
        this.metrics.total = this.countTests(suite);

        console.log('\n' + '═'.repeat(60));
        console.log('🚀 TEST EXECUTION STARTED');
        console.log('═'.repeat(60));
        console.log(`📋 Total Tests: ${this.metrics.total}`);
        console.log(`🔧 Workers: ${config.workers}`);
        console.log(`🌐 Projects: ${config.projects.map(p => p.name).join(', ')}`);
        console.log('═'.repeat(60) + '\n');

        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Called when test starts
     */
    onTestBegin(test: TestCase): void {
        const testPath = test.titlePath().join(' > ');
        console.log(`▶ Starting: ${testPath}`);
    }

    /**
     * Called when test ends
     *
     * INTERVIEW TIP: "onTestEnd receives TestResult with status, duration,
     * errors, attachments, and retry information"
     */
    onTestEnd(test: TestCase, result: TestResult): void {
        const testPath = test.titlePath().join(' > ');
        const duration = result.duration;

        let statusIcon: string;
        let statusColor: string;

        switch (result.status) {
            case 'passed':
                this.metrics.passed++;
                statusIcon = '✓';
                statusColor = '\x1b[32m'; // Green
                break;
            case 'failed':
                this.metrics.failed++;
                statusIcon = '✗';
                statusColor = '\x1b[31m'; // Red
                break;
            case 'skipped':
                this.metrics.skipped++;
                statusIcon = '○';
                statusColor = '\x1b[33m'; // Yellow
                break;
            case 'timedOut':
                this.metrics.failed++;
                statusIcon = '⏱';
                statusColor = '\x1b[31m'; // Red
                break;
            default:
                statusIcon = '?';
                statusColor = '\x1b[37m'; // White
        }

        // Track flaky tests (passed after retry)
        if (result.status === 'passed' && result.retry > 0) {
            this.metrics.flaky++;
        }

        console.log(`${statusColor}${statusIcon} ${testPath} (${duration}ms)\x1b[0m`);

        // Store summary
        this.testSummaries.push({
            name: testPath,
            status: result.status,
            duration,
            error: result.error?.message,
            retries: result.retry
        });

        // Log errors immediately
        if (result.error?.message) {
            console.log(`  \x1b[31m└─ ${result.error.message.split('\n')[0]}\x1b[0m`);
        }
    }

    /**
     * Called after all tests complete
     *
     * INTERVIEW TIP: "onEnd is where you generate final reports,
     * upload to dashboards, or send notifications"
     */
    async onEnd(result: FullResult): Promise<void> {
        this.metrics.duration = Date.now() - this.startTime;

        console.log('\n' + '═'.repeat(60));
        console.log('📊 TEST EXECUTION SUMMARY');
        console.log('═'.repeat(60));

        this.printMetrics();
        this.printFailedTests();
        this.printFlakyTests();

        console.log('═'.repeat(60));
        console.log(`🏁 Status: ${result.status.toUpperCase()}`);
        console.log('═'.repeat(60) + '\n');

        // Generate JSON report
        await this.generateJsonReport();

        // Generate HTML report
        await this.generateHtmlReport();
    }

    /**
     * Handle errors outside of tests
     */
    onError(error: { message?: string }): void {
        console.error('\x1b[31m❌ Framework Error:', error.message || 'Unknown error', '\x1b[0m');
    }

    private countTests(suite: Suite): number {
        let count = suite.tests.length;
        for (const child of suite.suites) {
            count += this.countTests(child);
        }
        return count;
    }

    private printMetrics(): void {
        const passRate = this.metrics.total > 0
            ? ((this.metrics.passed / this.metrics.total) * 100).toFixed(1)
            : '0';

        console.log(`  ✓ Passed:  ${this.metrics.passed}`);
        console.log(`  ✗ Failed:  ${this.metrics.failed}`);
        console.log(`  ○ Skipped: ${this.metrics.skipped}`);
        console.log(`  ⚡ Flaky:   ${this.metrics.flaky}`);
        console.log(`  📈 Pass Rate: ${passRate}%`);
        console.log(`  ⏱ Duration: ${(this.metrics.duration / 1000).toFixed(2)}s`);
    }

    private printFailedTests(): void {
        const failed = this.testSummaries.filter(t => t.status === 'failed');
        if (failed.length === 0) return;

        console.log('\n📋 FAILED TESTS:');
        failed.forEach((t, i) => {
            console.log(`  ${i + 1}. ${t.name}`);
            if (t.error) {
                console.log(`     └─ ${t.error.split('\n')[0]}`);
            }
        });
    }

    private printFlakyTests(): void {
        const flaky = this.testSummaries.filter(t => t.status === 'passed' && t.retries > 0);
        if (flaky.length === 0) return;

        console.log('\n⚡ FLAKY TESTS (passed after retry):');
        flaky.forEach((t, i) => {
            console.log(`  ${i + 1}. ${t.name} (${t.retries} retries)`);
        });
    }

    private async generateJsonReport(): Promise<void> {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            tests: this.testSummaries
        };

        const reportPath = path.join(this.outputDir, 'test-results.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 JSON Report: ${reportPath}`);
    }

    private async generateHtmlReport(): Promise<void> {
        const passRate = this.metrics.total > 0
            ? ((this.metrics.passed / this.metrics.total) * 100).toFixed(1)
            : '0';

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${new Date().toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .metric { background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 36px; font-weight: bold; }
        .metric-label { color: #666; font-size: 14px; margin-top: 5px; }
        .passed { color: #22c55e; }
        .failed { color: #ef4444; }
        .skipped { color: #f59e0b; }
        .flaky { color: #8b5cf6; }
        .tests { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .tests h2 { padding: 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .test { padding: 15px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .test:last-child { border-bottom: none; }
        .test-name { flex: 1; }
        .test-status { padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .test-status.passed { background: #dcfce7; color: #166534; }
        .test-status.failed { background: #fee2e2; color: #991b1b; }
        .test-status.skipped { background: #fef3c7; color: #92400e; }
        .test-duration { color: #666; font-size: 14px; margin-left: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎭 Playwright Test Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${this.metrics.total}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value passed">${this.metrics.passed}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value failed">${this.metrics.failed}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value skipped">${this.metrics.skipped}</div>
                <div class="metric-label">Skipped</div>
            </div>
            <div class="metric">
                <div class="metric-value flaky">${this.metrics.flaky}</div>
                <div class="metric-label">Flaky</div>
            </div>
            <div class="metric">
                <div class="metric-value">${passRate}%</div>
                <div class="metric-label">Pass Rate</div>
            </div>
        </div>

        <div class="tests">
            <h2>📋 Test Results</h2>
            ${this.testSummaries.map(t => `
                <div class="test">
                    <div class="test-name">${t.name}</div>
                    <span class="test-status ${t.status}">${t.status.toUpperCase()}</span>
                    <span class="test-duration">${t.duration}ms</span>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
`;

        const reportPath = path.join(this.outputDir, 'test-report.html');
        fs.writeFileSync(reportPath, html);
        console.log(`📄 HTML Report: ${reportPath}`);
    }
}
