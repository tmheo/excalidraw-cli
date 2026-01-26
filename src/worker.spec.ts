/**
 * Characterization tests for worker (Listr task management)
 * Updated for listr2 migration
 */

import { generateTaskListFromFiles, generateTaskListFromFile } from './worker'
import * as fs from 'fs-extra'
import * as path from 'path'

describe('Worker Characterization Tests', () => {
    const testDir = path.join(__dirname, '../test')
    const outputDir = path.join(__dirname, '../test-output')

    beforeAll(async () => {
        await fs.ensureDir(outputDir)
    })

    describe('Task list generation from files', () => {
        test('should create Listr task list from file array', () => {
            const files = ['foo/circle.excalidraw', 'bar/square.excalidraw']
            const taskList = generateTaskListFromFiles(files, testDir, outputDir, false)

            expect(taskList).toBeDefined()
            expect(taskList.tasks).toBeDefined()
            expect(Array.isArray(taskList.tasks)).toBe(true)
            expect(taskList.tasks.length).toBe(2)

            // Verify task structure (listr2 uses different task structure)
            taskList.tasks.forEach((task: any, index: number) => {
                expect(task.title).toBe(files[index])
                // In listr2, task.task is an object, not a function
                expect(task.task).toBeDefined()
            })
        })

        test('should handle empty file array', () => {
            const taskList = generateTaskListFromFiles([], testDir, outputDir, false)

            expect(taskList).toBeDefined()
            expect(taskList.tasks).toBeDefined()
            expect(taskList.tasks.length).toBe(0)
        })

        test('should create silent renderer when quiet mode is enabled', () => {
            const files = ['test.excalidraw']
            const quietTaskList = generateTaskListFromFiles(files, testDir, outputDir, true)

            expect(quietTaskList).toBeDefined()
            // Listr with silent renderer should still be created
            expect(quietTaskList.tasks).toBeDefined()
        })

        test('should create default renderer when quiet mode is disabled', () => {
            const files = ['test.excalidraw']
            const normalTaskList = generateTaskListFromFiles(files, testDir, outputDir, false)

            expect(normalTaskList).toBeDefined()
            expect(normalTaskList.tasks).toBeDefined()
        })
    })

    describe('Task list generation from single file', () => {
        test('should create Listr task list from single file', () => {
            const file = 'foo/circle.excalidraw'
            const taskList = generateTaskListFromFile(file, outputDir, false)

            expect(taskList).toBeDefined()
            expect(taskList.tasks).toBeDefined()
            expect(Array.isArray(taskList.tasks)).toBe(true)
            expect(taskList.tasks.length).toBe(1)
            expect(taskList.tasks[0].title).toBe(file)
        })

        test('should handle quiet mode for single file', () => {
            const file = 'test.excalidraw'
            const quietTaskList = generateTaskListFromFile(file, outputDir, true)

            expect(quietTaskList).toBeDefined()
            expect(quietTaskList.tasks).toBeDefined()
            expect(quietTaskList.tasks.length).toBe(1)
        })
    })

    describe('Task execution behavior', () => {
        test('should create listr2 task with proper structure', () => {
            const file = 'test.excalidraw'
            const taskList = generateTaskListFromFile(file, outputDir, false)

            const task = taskList.tasks[0]
            // In listr2, task.task is defined
            expect(task.task).toBeDefined()
            expect(task.title).toBe(file)
        })

        test('should provide task list that can be executed', () => {
            const file = 'test.excalidraw'
            const taskList = generateTaskListFromFile(file, outputDir, true)

            expect(taskList).toBeDefined()
            expect(taskList.tasks).toBeDefined()
            expect(taskList.tasks.length).toBe(1)

            // listr2 provides a run() method to execute tasks
            expect(typeof taskList.run).toBe('function')
        })
    })

    describe('Listr integration', () => {
        test('should have run method on task list', () => {
            const files: string[] = ['test.excalidraw']
            const taskList = generateTaskListFromFiles(files, testDir, outputDir, false)

            expect(taskList.run).toBeDefined()
            expect(typeof taskList.run).toBe('function')
        })

        test('should return Promise from run method', () => {
            const files: string[] = []
            const taskList = generateTaskListFromFiles(files, testDir, outputDir, true)

            const result = taskList.run()
            expect(result).toBeDefined()
            expect(result instanceof Promise).toBe(true)

            // Prevent unhandled promise rejection
            result.catch(() => {})
        })
    })
})
