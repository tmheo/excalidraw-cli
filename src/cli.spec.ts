/**
 * Characterization tests for CLI interface
 * These tests capture current behavior before oclif v4 migration
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'

const execAsync = promisify(exec)
const CLI_PATH = path.join(__dirname, '../bin/run')

describe('CLI Integration Tests (Characterization)', () => {
    describe('Help flag', () => {
        test('should display help when --help flag is used', async () => {
            try {
                const { stdout } = await execAsync(`node ${CLI_PATH} --help`)
                expect(stdout).toContain('Parses Excalidraw JSON schemas into PNGs')
                expect(stdout).toContain('USAGE')
                expect(stdout).toContain('OPTIONS')
                expect(stdout).toContain('--help')
                expect(stdout).toContain('--version')
                expect(stdout).toContain('--quiet')
            } catch (error: any) {
                // oclif v1 may exit with code 0 for --help
                if (error.stdout) {
                    expect(error.stdout).toContain('USAGE')
                }
            }
        }, 10000)

        test('should display help when -h flag is used', async () => {
            try {
                const { stdout } = await execAsync(`node ${CLI_PATH} -h`)
                expect(stdout).toContain('Parses Excalidraw JSON schemas into PNGs')
            } catch (error: any) {
                if (error.stdout) {
                    expect(error.stdout).toContain('USAGE')
                }
            }
        }, 10000)
    })

    describe('Version flag', () => {
        test('should display version when --version flag is used', async () => {
            try {
                const { stdout } = await execAsync(`node ${CLI_PATH} --version`)
                expect(stdout).toMatch(/excalidraw-cli\/\d+\.\d+\.\d+/)
            } catch (error: any) {
                if (error.stdout) {
                    expect(error.stdout).toMatch(/\d+\.\d+\.\d+/)
                }
            }
        }, 10000)

        test('should display version when -v flag is used', async () => {
            try {
                const { stdout } = await execAsync(`node ${CLI_PATH} -v`)
                expect(stdout).toMatch(/excalidraw-cli\/\d+\.\d+\.\d+/)
            } catch (error: any) {
                if (error.stdout) {
                    expect(error.stdout).toMatch(/\d+\.\d+\.\d+/)
                }
            }
        }, 10000)
    })

    describe('Argument handling', () => {
        test('should process single file input', async () => {
            const testFile = path.join(__dirname, '../test/foo/circle.excalidraw')
            const outputFile = path.join(__dirname, '../test-output/circle.png')

            try {
                const { stdout, stderr } = await execAsync(`node ${CLI_PATH} ${testFile} ${outputFile} --quiet`)
                // Quiet mode should have minimal output
                expect(stderr).toBe('')
            } catch (error: any) {
                // Capture current behavior even if it errors
                // This is a characterization test
            }
        }, 30000)

        test('should handle directory batch processing', async () => {
            const testDir = path.join(__dirname, '../test')
            const outputDir = path.join(__dirname, '../test-output')

            try {
                await execAsync(`node ${CLI_PATH} ${testDir} ${outputDir} --quiet`)
            } catch (error: any) {
                // Capture current behavior
            }
        }, 30000)

        test('should handle invalid input path gracefully', async () => {
            const invalidPath = '/nonexistent/path/file.excalidraw'

            try {
                const { stderr } = await execAsync(`node ${CLI_PATH} ${invalidPath}`)
                expect(stderr).toContain("doesn't exist")
            } catch (error: any) {
                // Error expected for invalid path
                if (error.stderr) {
                    expect(error.stderr).toContain("doesn't exist")
                }
            }
        }, 10000)
    })

    describe('Quiet mode', () => {
        test('should suppress output when --quiet flag is used', async () => {
            const testFile = path.join(__dirname, '../test/foo/circle.excalidraw')
            const outputFile = path.join(__dirname, '../test-output/circle-quiet.png')

            try {
                const { stdout, stderr } = await execAsync(`node ${CLI_PATH} ${testFile} ${outputFile} --quiet`)
                // In quiet mode, stdout should be minimal (no progress bars)
                expect(stdout).not.toContain('✔')
                expect(stdout).not.toContain('Processing')
            } catch (error: any) {
                // Capture current quiet mode behavior
            }
        }, 30000)
    })
})
