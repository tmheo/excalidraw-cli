import { rotate } from './shapeUtils'

// Arrow head configuration constants
const ARROW_HEAD_SIZE = 30
const ARROW_HEAD_ANGLE_DEGREES = 20

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const degreesToRadians = (degrees) => (degrees * Math.PI) / 180

/**
 * Calculate the total length of an arrow path
 * @param {Array<[number, number]>} points - Array of [x, y] coordinate pairs
 * @returns {number} Total path length
 */
const calculateArrowLength = (points) => {
    return points.reduce((total, [currentX, currentY], idx, pts) => {
        if (idx === 0) return 0
        const [prevX, prevY] = pts[idx - 1]
        return total + Math.hypot(currentX - prevX, currentY - prevY)
    }, 0)
}

/**
 * Calculate arrow head points from element points
 * Refactored to use public API instead of rc.generator internal API
 */
export const getArrowPoints = (element) => {
    const points = element.points.length ? element.points : [[0, 0]]

    // Get the last two points to calculate arrow direction
    const lastPoint = points[points.length - 1]
    const secondLastPoint = points.length > 1 ? points[points.length - 2] : [0, 0]

    const [endX, endY] = lastPoint
    const [prevX, prevY] = secondLastPoint

    // Calculate direction vector
    const dx = endX - prevX
    const dy = endY - prevY
    const distance = Math.hypot(dx, dy)

    // Normalize direction
    const normalizedX = distance > 0 ? dx / distance : 1
    const normalizedY = distance > 0 ? dy / distance : 0

    // Calculate arrow head size (limited to half of arrow length)
    const arrowLength = calculateArrowLength(points)
    const headSize = Math.min(ARROW_HEAD_SIZE, arrowLength / 2)

    // Calculate arrow head base point
    const arrowBaseX = endX - normalizedX * headSize
    const arrowBaseY = endY - normalizedY * headSize

    // Calculate arrow head points using rotation
    const angleRadians = degreesToRadians(ARROW_HEAD_ANGLE_DEGREES)
    const [leftX, leftY] = rotate(endX, endY, arrowBaseX, arrowBaseY, -angleRadians)
    const [rightX, rightY] = rotate(endX, endY, arrowBaseX, arrowBaseY, angleRadians)

    return [endX, endY, leftX, leftY, rightX, rightY]
}

export const renderArrow = (element, rc, negativeWidth, negativeHeight) => {
    // Use public API rc.curve() instead of rc.generator.curve()
    const points = element.points.length ? element.points : [[0, 0]]
    const [offsetX, offsetY] = [element.x + negativeWidth, element.y + negativeHeight]

    // Draw the curve using public API
    rc.curve(points.map(([x, y]) => [offsetX + x, offsetY + y]), element)

    // Calculate and draw arrow head
    const [endX, endY, leftX, leftY, rightX, rightY] = getArrowPoints(element)
    rc.line(offsetX + endX, offsetY + endY, offsetX + leftX, offsetY + leftY, element)
    rc.line(offsetX + endX, offsetY + endY, offsetX + rightX, offsetY + rightY, element)
}