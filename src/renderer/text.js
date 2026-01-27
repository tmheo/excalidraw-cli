const DEFAULT_FONT_SIZE = 20
const DEFAULT_FONT_FAMILY = 'Virgil'
const LINE_HEIGHT_MULTIPLIER = 1.35

function getFontSize(element) {
    if (element.fontSize) {
        return element.fontSize
    }
    if (element.font) {
        const value = element.font.split("px")[0]
        const parsed = parseInt(value, 10)
        if (!isNaN(parsed)) {
            return parsed
        }
    }
    return DEFAULT_FONT_SIZE
}

export function getFontFamilyFromId(id) {
    if (!id) {
        return DEFAULT_FONT_FAMILY
    }
    switch (id) {
        case 1:
            return 'Virgil'
        case 2:
            return 'Arial'
        default:
            return 'Cascadia'
    }
}

export function getFontFamilyFromElement(element) {
    if (element.fontFamily) {
        return getFontFamilyFromId(element.fontFamily)
    }
    if (element.font) {
        return element.font.split("px")[1]
    }
    return DEFAULT_FONT_FAMILY
}

export function getFontFromElement(element) {
    return getFontSize(element) + 'px ' + getFontFamilyFromElement(element)
}

function getTextAlignX(element, negativeWidth) {
    const textAlign = element.textAlign || 'center'
    if (textAlign === 'left') {
        return element.x + negativeWidth
    }
    if (textAlign === 'right') {
        return element.x + negativeWidth + element.width
    }
    return element.x + negativeWidth + element.width / 2
}

function getLineHeight(element, lineCount) {
    if (lineCount > 1 && element.height) {
        return element.height / lineCount
    }
    return getFontSize(element) * LINE_HEIGHT_MULTIPLIER
}

function getVerticalAlignY(element, negativeHeight, lineHeight) {
    const verticalAlign = element.verticalAlign || 'middle'
    const lineCount = element.text.split('\n').length
    const totalHeight = lineHeight * lineCount

    if (verticalAlign === 'top') {
        return element.y + negativeHeight + lineHeight / 2
    }
    if (verticalAlign === 'bottom') {
        return element.y + negativeHeight + element.height - totalHeight + lineHeight / 2
    }
    return element.y + negativeHeight + element.height / 2 - totalHeight / 2 + lineHeight / 2
}

function getHorizontalOffset(textAlign, width) {
    if (textAlign === 'left') {
        return -width / 2
    }
    if (textAlign === 'right') {
        return width / 2
    }
    return 0
}

function getVerticalStartOffset(verticalAlign, height, totalHeight, lineHeight) {
    if (verticalAlign === 'top') {
        return -height / 2 + lineHeight / 2
    }
    if (verticalAlign === 'bottom') {
        return height / 2 - totalHeight + lineHeight / 2
    }
    return -totalHeight / 2 + lineHeight / 2
}

export function renderText(element, ctx, negativeWidth, negativeHeight) {
    const lines = element.text.split('\n')
    const lineHeight = getLineHeight(element, lines.length)
    const totalHeight = lineHeight * lines.length

    ctx.font = getFontFromElement(element)
    ctx.fillStyle = element.strokeColor
    ctx.textAlign = element.textAlign || 'center'

    if (element.angle && element.angle !== 0) {
        const centerX = element.x + negativeWidth + element.width / 2
        const centerY = element.y + negativeHeight + element.height / 2

        ctx.translate(centerX, centerY)
        ctx.rotate(element.angle)

        const textAlign = element.textAlign || 'center'
        const verticalAlign = element.verticalAlign || 'middle'
        const offsetX = getHorizontalOffset(textAlign, element.width)
        const startY = getVerticalStartOffset(verticalAlign, element.height, totalHeight, lineHeight)

        lines.forEach((line, index) => {
            ctx.fillText(line, offsetX, startY + index * lineHeight)
        })

        ctx.rotate(-element.angle)
        ctx.translate(-centerX, -centerY)
    } else {
        const textX = getTextAlignX(element, negativeWidth)
        const startY = getVerticalAlignY(element, negativeHeight, lineHeight)

        lines.forEach((line, index) => {
            ctx.fillText(line, textX, startY + index * lineHeight)
        })
    }
}
