export const renderLine = (element, rc, ctx, negativeWidth, negativeHeight) => {
    // Use public API rc.curve() instead of rc.generator.curve()
    const points = element.points.length ? element.points : [[0, 0]]

    // Draw the curve using public API (similar to draw.js)
    rc.curve(points.map(([x, y]) => [
        element.x + x + negativeWidth,
        element.y + y + negativeHeight
    ]), element)
}