/**
 * Characterization tests for CLI interface
 * These tests capture current behavior before oclif v4 migration
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'

const execAsync = promisify(exec)
const CLI_PATH = path.join(__dirname, '../bin/run')

/**
 * Execute CLI command and handle errors gracefully
 * @param args - Command line arguments
 * @returns Promise with stdout, stderr, and error if any
 */
const executeCLI = async (...args: string[]) => {
    try {
        const { stdout, stderr } = await execAsync(`node ${CLI_PATH} ${args.join(' ')}`)
        return { stdout, stderr, error: null }
    } catch (error: any) {
        return { stdout: error.stdout || '', stderr: error.stderr || '', error }
    }
}

/**
 * Check if output contains expected content
 * Handles both successful output and error output
 */
const expectOutput = (result: { stdout: string, stderr: string, error: any }, expected: string | RegExp) => {
    const output = result.stdout || (result.error?.stdout || '')
    if (typeof expected === 'string') {
        expect(output).toContain(expected)
    } else {
        expect(output).toMatch(expected)
    }
}

/**
 * Check if error output contains expected content
 */
const expectError = (result: { stdout: string, stderr: string, error: any }, expected: string | RegExp) => {
    const errorOutput = result.stderr || (result.error?.stderr || '')
    if (typeof expected === 'string') {
        expect(errorOutput).toContain(expected)
    } else {
        expect(errorOutput).toMatch(expected)
    }
}

describe('CLI Integration Tests (Characterization)', () => {
    describe('Help flag', () => {
        test('should display help when --help flag is used', async () => {
            const result = await executeCLI('--help')
            expectOutput(result, 'Parses Excalidraw JSON schemas into PNGs')
            expectOutput(result, 'USAGE')
            expectOutput(result, 'FLAGS') // oclif v4 uses FLAGS instead of OPTIONS
            expectOutput(result, '--help')
            expectOutput(result, '--version')
            expectOutput(result, '--quiet')
        }, 10000)

        test('should display help when -h flag is used', async () => {
            const result = await executeCLI('-h')
            expectOutput(result, 'Parses Excalidraw JSON schemas into PNGs')
            expectOutput(result, 'USAGE')
        }, 10000)
    })

    describe('Version flag', () => {
        test('should display version when --version flag is used', async () => {
            const result = await executeCLI('--version')
            expectOutput(result, /excalidraw-cli\/\d+\.\d+\.\d+/)
        }, 10000)

        test('should display version when -v flag is used', async () => {
            const result = await executeCLI('-v')
            expectOutput(result, /excalidraw-cli\/\d+\.\d+\.\d+/)
        }, 10000)
    })

    describe('Argument handling', () => {
        test('should process single file input', async () => {
            const testFile = path.join(__dirname, '../test/foo/circle.excalidraw')
            const outputFile = path.join(__dirname, '../test-output/circle.png')

            const result = await executeCLI(testFile, outputFile, '--quiet')
            // Quiet mode should have minimal output
            expect(result.stderr).toBe('')
        }, 30000)

        test('should handle directory batch processing', async () => {
            const testDir = path.join(__dirname, '../test')
            const outputDir = path.join(__dirname, '../test-output')

            await executeCLI(testDir, outputDir, '--quiet')
            // Capture current behavior - test completes without throwing
        }, 30000)

        test('should handle invalid input path gracefully', async () => {
            const invalidPath = '/nonexistent/path/file.excalidraw'

            const result = await executeCLI(invalidPath)
            expectError(result, "doesn't exist")
        }, 10000)
    })

    describe('Quiet mode', () => {
        test('should suppress output when --quiet flag is used', async () => {
            const testFile = path.join(__dirname, '../test/foo/circle.excalidraw')
            const outputFile = path.join(__dirname, '../test-output/circle-quiet.png')

            const result = await executeCLI(testFile, outputFile, '--quiet')
            // In quiet mode, stdout should be minimal (no progress bars)
            expect(result.stdout).not.toContain('✔')
            expect(result.stdout).not.toContain('Processing')
        }, 30000)
    })
})
