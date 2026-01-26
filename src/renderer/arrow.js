import { rotate } from './shapeUtils'

/**
 * Calculate arrow head points from element points
 * Refactored to use public API instead of rc.generator internal API
 */
export const getArrowPoints = (element) => {
    const points = element.points.length ? element.points : [[0, 0]]

    // Get the last two points to calculate arrow direction
    const lastPoint = points[points.length - 1]
    const secondLastPoint = points.length > 1 ? points[points.length - 2] : [0, 0]

    const [x2, y2] = lastPoint
    const [px, py] = secondLastPoint

    // Calculate direction vector
    const dx = x2 - px
    const dy = y2 - py
    const distance = Math.hypot(dx, dy)

    // Normalize direction
    const nx = distance > 0 ? dx / distance : 1
    const ny = distance > 0 ? dy / distance : 0

    // Calculate arrow size
    const size = 30
    const arrowLength = points.reduce((total, [cx, cy], idx, pts) => {
        const [prevX, prevY] = idx > 0 ? pts[idx - 1] : [0, 0]
        return total + Math.hypot(cx - prevX, cy - prevY)
    }, 0)

    const minSize = Math.min(size, arrowLength / 2)
    const xs = x2 - nx * minSize
    const ys = y2 - ny * minSize

    // Calculate arrow head points
    const angle = 20
    const [x3, y3] = rotate(x2, y2, xs, ys, (-angle * Math.PI) / 180)
    const [x4, y4] = rotate(x2, y2, xs, ys, (angle * Math.PI) / 180)

    return [x2, y2, x3, y3, x4, y4]
}

export const renderArrow = (element, rc, negativeWidth, negativeHeight) => {
    // Use public API rc.curve() instead of rc.generator.curve()
    const points = element.points.length ? element.points : [[0, 0]]
    const [x1, y1] = [element.x + negativeWidth, element.y + negativeHeight]

    // Draw the curve using public API
    rc.curve(points.map(([x, y]) => [x1 + x, y1 + y]), element)

    // Calculate and draw arrow head
    const [x2, y2, x3, y3, x4, y4] = getArrowPoints(element)
    rc.line(x1 + x2, y1 + y2, x1 + x3, y1 + y3, element)
    rc.line(x1 + x2, y1 + y2, x1 + x4, y1 + y4, element)
}