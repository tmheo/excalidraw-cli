/**
 * Characterization tests for renderer
 * CRITICAL: These tests validate rc.curve() public API usage for roughjs v4.6+
 */

import { convertExcalidrawToCanvas } from './index'
import { getArrowPoints } from './arrow'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as rough from 'roughjs'
import { createCanvas } from 'canvas'

describe('Renderer Characterization Tests', () => {
    const snapshotDir = path.join(__dirname, '../../test-snapshots')

    beforeAll(async () => {
        await fs.ensureDir(snapshotDir)
    })

    describe('Public API usage (roughjs v4.6+)', () => {
        test('should use public rc.curve() API instead of generator', () => {
            const canvas = createCanvas(200, 200)
            const rc = (rough as unknown as { canvas: (c: unknown) => { curve: (points: number[][], options: Record<string, unknown>) => void } }).canvas(canvas)

            // Verify public API is available
            expect(rc.curve).toBeDefined()
            expect(typeof rc.curve).toBe('function')

            // Test that curve can be drawn without errors
            const points = [[0, 0], [50, 50], [100, 0]]
            const element = { strokeColor: '#000000', strokeWidth: 2, roughness: 1 }

            // Should not throw error
            expect(() => {
                rc.curve(points, element)
            }).not.toThrow()
        })

        test('should calculate arrow points without generator dependency', () => {
            const element = {
                points: [[0, 0], [100, 100]],
                strokeColor: '#000000',
                strokeWidth: 2,
                roughness: 1
            }

            // getArrowPoints now uses only element.points, not generator output
            const arrowPoints = getArrowPoints(element)

            expect(arrowPoints).toBeDefined()
            expect(Array.isArray(arrowPoints)).toBe(true)
            expect(arrowPoints.length).toBe(6) // x2, y2, x3, y3, x4, y4

            // All points should be numbers
            arrowPoints.forEach(point => {
                expect(typeof point).toBe('number')
                expect(isNaN(point)).toBe(false)
            })

            // Arrow should point in correct direction (towards last point)
            const [x2, y2] = arrowPoints
            expect(x2).toBe(100) // Last point x
            expect(y2).toBe(100) // Last point y
        })
    })

    describe('Arrow rendering', () => {
        test('should render arrow with current public API (rc.curve) behavior', async () => {
            const excalidrawData = {
                type: "excalidraw",
                version: 2,
                appState: { viewBackgroundColor: "#ffffff" },
                elements: [{
                    type: "arrow",
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 100,
                    angle: 0,
                    strokeColor: "#000000",
                    backgroundColor: "transparent",
                    strokeWidth: 2,
                    strokeStyle: "solid",
                    roughness: 1,
                    points: [[0, 0], [100, 100]]
                }]
            }

            const canvas = await convertExcalidrawToCanvas(excalidrawData)
            expect(canvas).toBeDefined()
            expect(canvas.width).toBeGreaterThan(0)
            expect(canvas.height).toBeGreaterThan(0)

            // Generate baseline snapshot for characterization
            // Note: This test only generates a PNG and verifies file creation
            // No actual pixel comparison or regression testing is performed
            const buffer = canvas.toBuffer('image/png')
            const snapshotPath = path.join(snapshotDir, 'arrow-baseline.png')
            await fs.writeFile(snapshotPath, buffer)

            // Verify file was created
            const exists = await fs.pathExists(snapshotPath)
            expect(exists).toBe(true)
        })

        test('should calculate arrow points with multi-point path', () => {
            const element = {
                points: [[0, 0], [50, 50], [100, 100]],
                strokeColor: '#000000',
                strokeWidth: 2,
                roughness: 1
            }

            const arrowPoints = getArrowPoints(element)

            expect(arrowPoints).toBeDefined()
            expect(Array.isArray(arrowPoints)).toBe(true)
            expect(arrowPoints.length).toBe(6) // x2, y2, x3, y3, x4, y4

            // All points should be numbers
            arrowPoints.forEach(point => {
                expect(typeof point).toBe('number')
                expect(isNaN(point)).toBe(false)
            })

            // Arrow should point towards final point
            const [x2, y2] = arrowPoints
            expect(x2).toBe(100)
            expect(y2).toBe(100)
        })
    })

    describe('Line rendering', () => {
        test('should render line with current public API (rc.line) behavior', async () => {
            const excalidrawData = {
                type: "excalidraw",
                version: 2,
                appState: { viewBackgroundColor: "#ffffff" },
                elements: [{
                    type: "line",
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 50,
                    angle: 0,
                    strokeColor: "#000000",
                    backgroundColor: "transparent",
                    strokeWidth: 2,
                    strokeStyle: "solid",
                    roughness: 1,
                    points: [[0, 0], [100, 50]]
                }]
            }

            const canvas = await convertExcalidrawToCanvas(excalidrawData)
            expect(canvas).toBeDefined()

            // Save snapshot
            const buffer = canvas.toBuffer('image/png')
            const snapshotPath = path.join(snapshotDir, 'line-baseline.png')
            await fs.writeFile(snapshotPath, buffer)

            const exists = await fs.pathExists(snapshotPath)
            expect(exists).toBe(true)
        })
    })

    describe('Shape rendering snapshots', () => {
        test('should render rectangle correctly', async () => {
            const excalidrawData = {
                type: "excalidraw",
                version: 2,
                appState: { viewBackgroundColor: "#ffffff" },
                elements: [{
                    type: "rectangle",
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 80,
                    angle: 0,
                    strokeColor: "#000000",
                    backgroundColor: "#ff000033",
                    strokeWidth: 2,
                    strokeStyle: "solid",
                    roughness: 1,
                    points: []
                }]
            }

            const canvas = await convertExcalidrawToCanvas(excalidrawData)
            const buffer = canvas.toBuffer('image/png')
            await fs.writeFile(path.join(snapshotDir, 'rectangle-baseline.png'), buffer)
            expect(buffer.length).toBeGreaterThan(0)
        })

        test('should render ellipse correctly', async () => {
            const excalidrawData = {
                type: "excalidraw",
                version: 2,
                appState: { viewBackgroundColor: "#ffffff" },
                elements: [{
                    type: "ellipse",
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 80,
                    angle: 0,
                    strokeColor: "#000000",
                    backgroundColor: "#00ff0033",
                    strokeWidth: 2,
                    strokeStyle: "solid",
                    roughness: 1,
                    points: []
                }]
            }

            const canvas = await convertExcalidrawToCanvas(excalidrawData)
            const buffer = canvas.toBuffer('image/png')
            await fs.writeFile(path.join(snapshotDir, 'ellipse-baseline.png'), buffer)
            expect(buffer.length).toBeGreaterThan(0)
        })

        test('should render diamond correctly', async () => {
            const excalidrawData = {
                type: "excalidraw",
                version: 2,
                appState: { viewBackgroundColor: "#ffffff" },
                elements: [{
                    type: "diamond",
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 80,
                    angle: 0,
                    strokeColor: "#000000",
                    backgroundColor: "#0000ff33",
                    strokeWidth: 2,
                    strokeStyle: "solid",
                    roughness: 1,
                    points: []
                }]
            }

            const canvas = await convertExcalidrawToCanvas(excalidrawData)
            const buffer = canvas.toBuffer('image/png')
            await fs.writeFile(path.join(snapshotDir, 'diamond-baseline.png'), buffer)
            expect(buffer.length).toBeGreaterThan(0)
        })

        test('should render text correctly', async () => {
            const excalidrawData = {
                type: "excalidraw",
                version: 2,
                appState: { viewBackgroundColor: "#ffffff" },
                elements: [{
                    type: "text",
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 25,
                    angle: 0,
                    strokeColor: "#000000",
                    backgroundColor: "transparent",
                    strokeWidth: 2,
                    strokeStyle: "solid",
                    roughness: 1,
                    fontSize: 20,
                    fontFamily: 1,
                    text: "Hello",
                    points: []
                }]
            }

            const canvas = await convertExcalidrawToCanvas(excalidrawData)
            const buffer = canvas.toBuffer('image/png')
            await fs.writeFile(path.join(snapshotDir, 'text-baseline.png'), buffer)
            expect(buffer.length).toBeGreaterThan(0)
        })
    })

    describe('Complex scene rendering', () => {
        test('should render multiple shapes together', async () => {
            const excalidrawData = {
                type: "excalidraw",
                version: 2,
                appState: { viewBackgroundColor: "#ffffff" },
                elements: [
                    {
                        type: "rectangle",
                        x: 10, y: 10, width: 100, height: 80, angle: 0,
                        strokeColor: "#000000", backgroundColor: "#ff000033",
                        strokeWidth: 2, strokeStyle: "solid", roughness: 1, points: []
                    },
                    {
                        type: "arrow",
                        x: 120, y: 50, width: 100, height: 0, angle: 0,
                        strokeColor: "#000000", backgroundColor: "transparent",
                        strokeWidth: 2, strokeStyle: "solid", roughness: 1,
                        points: [[0, 0], [100, 0]]
                    },
                    {
                        type: "ellipse",
                        x: 230, y: 10, width: 80, height: 80, angle: 0,
                        strokeColor: "#000000", backgroundColor: "#00ff0033",
                        strokeWidth: 2, strokeStyle: "solid", roughness: 1, points: []
                    }
                ]
            }

            const canvas = await convertExcalidrawToCanvas(excalidrawData)
            const buffer = canvas.toBuffer('image/png')
            await fs.writeFile(path.join(snapshotDir, 'complex-scene-baseline.png'), buffer)
            expect(buffer.length).toBeGreaterThan(0)
            expect(canvas.width).toBeGreaterThan(300) // Should fit all shapes
        })
    })
})
