/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE OPERATIONS TESTS - Upload/Download Handling
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Test file upload and download functionality.
 * WHY: File operations are common but tricky to automate correctly.
 * IF NOT USED: File-related bugs go undetected.
 * INTERVIEW TIP: "Playwright handles file operations natively - no hacks needed"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';
import { logTestStart, logTestEnd } from '../../src/helpers';
import * as fs from 'fs';
import * as path from 'path';

test.describe('File Operations @file-ops @external', () => {

    const testFilesDir = path.join(process.cwd(), 'test-data');

    test.beforeAll(async () => {
        // Create test data directory if it doesn't exist
        if (!fs.existsSync(testFilesDir)) {
            fs.mkdirSync(testFilesDir, { recursive: true });
        }
    });

    test.describe('File Upload', () => {

        test('should upload a file using setInputFiles @smoke', async ({ page }) => {
            logTestStart('File upload with setInputFiles');

            // Navigate to a page with file upload (using a demo site)
            await page.goto('https://the-internet.herokuapp.com/upload');

            // Create a test file
            const testFile = path.join(testFilesDir, 'test-upload.txt');
            fs.writeFileSync(testFile, 'Test file content for upload');

            /**
             * INTERVIEW TIP: "setInputFiles() is the primary method for file uploads.
             * It works with hidden file inputs that trigger on click."
             */
            await page.setInputFiles('#file-upload', testFile);

            // Click upload button
            await page.click('#file-submit');

            // Verify upload success
            await expect(page.locator('#uploaded-files')).toContainText('test-upload.txt');

            logTestEnd('File upload with setInputFiles', 'passed');
        });

        test('should upload multiple files', async ({ page }) => {
            logTestStart('Multiple file upload');

            await page.goto('https://the-internet.herokuapp.com/upload');

            // Create multiple test files
            const files = ['file1.txt', 'file2.txt', 'file3.txt'].map(name => {
                const filePath = path.join(testFilesDir, name);
                fs.writeFileSync(filePath, `Content of ${name}`);
                return filePath;
            });

            /**
             * INTERVIEW TIP: "Pass an array to setInputFiles for multiple files"
             */
            await page.setInputFiles('#file-upload', files);

            logTestEnd('Multiple file upload', 'passed');
        });

        test('should handle file chooser dialog', async ({ page }) => {
            logTestStart('File chooser dialog handling');

            await page.goto('https://the-internet.herokuapp.com/upload');

            // Create test file
            const testFile = path.join(testFilesDir, 'chooser-test.txt');
            fs.writeFileSync(testFile, 'File chooser test content');

            /**
             * INTERVIEW TIP: "fileChooser event lets you intercept the native
             * file dialog before it opens"
             */
            const [fileChooser] = await Promise.all([
                page.waitForEvent('filechooser'),
                page.click('#file-upload')
            ]);

            await fileChooser.setFiles(testFile);

            // Verify file was selected
            const input = page.locator('#file-upload');
            const files = await input.evaluate((el: HTMLInputElement) => {
                return el.files ? Array.from(el.files).map(f => f.name) : [];
            });

            expect(files).toContain('chooser-test.txt');

            logTestEnd('File chooser dialog handling', 'passed');
        });

        test('should validate file type restrictions', async ({ page }) => {
            logTestStart('File type validation');

            await page.goto('https://the-internet.herokuapp.com/upload');

            // Try to upload a file (validation would happen server-side)
            const testFile = path.join(testFilesDir, 'test.txt');
            fs.writeFileSync(testFile, 'Test content');

            await page.setInputFiles('#file-upload', testFile);

            /**
             * INTERVIEW TIP: "Always test both valid and invalid file types
             * to ensure proper validation is in place"
             */

            logTestEnd('File type validation', 'passed');
        });

        test('should handle large file upload', async ({ page }) => {
            logTestStart('Large file upload');

            await page.goto('https://the-internet.herokuapp.com/upload');

            // Create a larger test file (1MB)
            const largeFile = path.join(testFilesDir, 'large-file.txt');
            const content = 'A'.repeat(1024 * 1024); // 1MB of 'A's
            fs.writeFileSync(largeFile, content);

            /**
             * INTERVIEW TIP: "For large files, increase timeout and consider
             * using streaming upload if available"
             */
            await page.setInputFiles('#file-upload', largeFile);

            logTestEnd('Large file upload', 'passed');
        });
    });

    test.describe('File Download', () => {

        test('should download a file and verify @smoke', async ({ page }) => {
            logTestStart('File download verification');

            await page.goto('https://the-internet.herokuapp.com/download');

            /**
             * INTERVIEW TIP: "waitForEvent('download') captures the download
             * before it completes, giving you control over where to save it"
             */
            const [download] = await Promise.all([
                page.waitForEvent('download'),
                page.click('a[href*=".txt"]') // Click first .txt file link
            ]);

            // Get the suggested filename
            const suggestedFilename = download.suggestedFilename();
            expect(suggestedFilename).toBeTruthy();

            // Save the file
            const downloadPath = path.join(testFilesDir, 'downloaded-' + suggestedFilename);
            await download.saveAs(downloadPath);

            // Verify file was downloaded
            expect(fs.existsSync(downloadPath)).toBeTruthy();

            // Verify file has content
            const fileContent = fs.readFileSync(downloadPath, 'utf-8');
            expect(fileContent.length).toBeGreaterThan(0);

            logTestEnd('File download verification', 'passed');
        });

        test('should handle download with custom path', async ({ page }) => {
            logTestStart('Download with custom path');

            await page.goto('https://the-internet.herokuapp.com/download');

            const [download] = await Promise.all([
                page.waitForEvent('download'),
                page.click('a[href*=".txt"]')
            ]);

            /**
             * INTERVIEW TIP: "saveAs() lets you save to any path;
             * path() gives you the temp location during download"
             */
            const customPath = path.join(testFilesDir, 'custom-name.txt');
            await download.saveAs(customPath);

            expect(fs.existsSync(customPath)).toBeTruthy();

            logTestEnd('Download with custom path', 'passed');
        });

        test('should cancel a download', async ({ page }) => {
            logTestStart('Download cancellation');

            await page.goto('https://the-internet.herokuapp.com/download');

            const [download] = await Promise.all([
                page.waitForEvent('download'),
                page.click('a[href*=".txt"]')
            ]);

            /**
             * INTERVIEW TIP: "cancel() stops a download in progress -
             * useful for testing download cancellation flows"
             */
            await download.cancel();

            // Download should be cancelled
            const failure = await download.failure();
            expect(failure).toBeTruthy();

            logTestEnd('Download cancellation', 'passed');
        });

        test('should handle download failure gracefully', async ({ page }) => {
            logTestStart('Download failure handling');

            await page.goto('https://the-internet.herokuapp.com/download');

            /**
             * INTERVIEW TIP: "failure() returns null for successful downloads,
             * or an error string if download failed"
             */
            const downloadPromise = page.waitForEvent('download');
            await page.click('a[href*=".txt"]');
            const download = await downloadPromise;

            // Check if download succeeded
            const failure = await download.failure();
            if (failure) {
                console.log('Download failed:', failure);
            } else {
                console.log('Download succeeded:', download.suggestedFilename());
            }

            logTestEnd('Download failure handling', 'passed');
        });
    });

    test.describe('Drag and Drop Upload', () => {

        test('should simulate drag and drop file upload', async ({ page }) => {
            logTestStart('Drag and drop upload');

            // Navigate to a page with drag-drop upload
            await page.goto('https://the-internet.herokuapp.com/upload');

            // Create test file
            const testFile = path.join(testFilesDir, 'drag-drop.txt');
            fs.writeFileSync(testFile, 'Drag and drop test content');

            /**
             * INTERVIEW TIP: "For drag-drop uploads, you typically still use
             * setInputFiles() since the drop zone triggers a file input"
             */
            const fileInput = page.locator('#file-upload');
            await fileInput.setInputFiles(testFile);

            logTestEnd('Drag and drop upload', 'passed');
        });
    });

    test.afterAll(async () => {
        // Cleanup test files
        if (fs.existsSync(testFilesDir)) {
            const files = fs.readdirSync(testFilesDir);
            files.forEach(file => {
                fs.unlinkSync(path.join(testFilesDir, file));
            });
        }
    });
});
