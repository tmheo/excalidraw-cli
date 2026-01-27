import { getCentroidFromRegularShape, rotate } from './shapeUtils'

function getCornerRadius(element) {
    if (!element.roundness) {
        return 0
    }
    const { type } = element.roundness
    if (type === 2) {
        // Proportional radius - fixed ratio
        return Math.min(element.width, element.height) * 0.1
    }
    if (type === 3) {
        // Adaptive radius - excalidraw default for rectangles
        const maxRadius = Math.min(element.width, element.height) * 0.3
        return Math.min(maxRadius, 30)
    }
    return 0
}

function getRoundedRectPath(x, y, width, height, radius) {
    const r = Math.min(radius, Math.min(width, height) / 2)
    return `M ${x + r} ${y}
            L ${x + width - r} ${y}
            Q ${x + width} ${y} ${x + width} ${y + r}
            L ${x + width} ${y + height - r}
            Q ${x + width} ${y + height} ${x + width - r} ${y + height}
            L ${x + r} ${y + height}
            Q ${x} ${y + height} ${x} ${y + height - r}
            L ${x} ${y + r}
            Q ${x} ${y} ${x + r} ${y}
            Z`
}

function applyStrokeDash(ctx, strokeStyle) {
    if (strokeStyle === 'dashed') {
        ctx.setLineDash([12, 8])
    } else if (strokeStyle === 'dotted') {
        ctx.setLineDash([3, 6])
    }
}

function renderTwoPass(ctx, element, renderFn) {
    const savedStroke = element.stroke
    const savedFill = element.fill

    // First pass: render fill with transparent stroke
    ctx.setLineDash([])
    element.stroke = 'transparent'
    renderFn()

    // Second pass: render stroke with transparent fill
    element.stroke = savedStroke
    element.fill = 'transparent'
    applyStrokeDash(ctx, element.strokeStyle)
    renderFn()

    // Restore original fill
    element.fill = savedFill
}

export function renderRectangle(element, rc, ctx, negativeWidth, negativeHeight) {
    const radius = getCornerRadius(element)
    const x = element.x + negativeWidth
    const y = element.y + negativeHeight

    if (element.angle && element.angle !== 0) {
        const [cx, cy] = getCentroidFromRegularShape(element, negativeHeight, negativeWidth)
        const topLeft = rotate(cx, cy, x, y, element.angle)
        const topRight = rotate(cx, cy, x + element.width, y, element.angle)
        const bottomRight = rotate(cx, cy, x + element.width, y + element.height, element.angle)
        const bottomLeft = rotate(cx, cy, x, y + element.height, element.angle)
        rc.polygon([topLeft, topRight, bottomRight, bottomLeft], element)
    } else if (radius > 0) {
        const path = getRoundedRectPath(x, y, element.width, element.height, radius)
        renderTwoPass(ctx, element, () => rc.path(path, element))
    } else {
        renderTwoPass(ctx, element, () => {
            rc.rectangle(x, y, element.width, element.height, element)
        })
    }
}
