import { type Node, type NodePositionChange, type GraphNode } from '@vue-flow/core'

// Helper function to calculate helper lines and snap positions
export function getHelperLines(change: NodePositionChange, nodes: GraphNode[]) {
    const defaultResult = {
        horizontal: undefined as number | undefined,
        vertical: undefined as number | undefined,
        snapPosition: { x: undefined as number | undefined, y: undefined as number | undefined }
    }

    const node = nodes.find((n) => n.id === change.id)
    if (!node || !change.position) {
        return defaultResult
    }

    const helperLines = { ...defaultResult }
    const gap = 5 // snap threshold in pixels

    const nWidth = node.dimensions.width || 0
    const nHeight = node.dimensions.height || 0
    const nX = change.position.x
    const nY = change.position.y

    // Center of dragging node
    const nCenterX = nX + nWidth / 2
    const nCenterY = nY + nHeight / 2

    // Track closest distance
    let minDistX = gap
    let minDistY = gap

    for (const graphNode of nodes) {
        // Skip self and non-displayed nodes
        if (graphNode.id === node.id || graphNode.hidden) continue

        const gWidth = graphNode.dimensions.width || 0
        const gHeight = graphNode.dimensions.height || 0
        const gX = graphNode.position.x
        const gY = graphNode.position.y
        const gCenterX = gX + gWidth / 2
        const gCenterY = gY + gHeight / 2

        // Horizontal Alignment (clamping Y)
        // Snap to Top
        if (Math.abs(nY - gY) < minDistY) {
            minDistY = Math.abs(nY - gY)
            helperLines.horizontal = gY // Line at Top
            helperLines.snapPosition.y = gY
        }
        // Snap to Center
        if (Math.abs(nCenterY - gCenterY) < minDistY) {
            minDistY = Math.abs(nCenterY - gCenterY)
            helperLines.horizontal = gCenterY // Line at Center
            helperLines.snapPosition.y = gCenterY - nHeight / 2
        }
        // Snap to Bottom
        if (Math.abs((nY + nHeight) - (gY + gHeight)) < minDistY) {
            minDistY = Math.abs((nY + nHeight) - (gY + gHeight))
            helperLines.horizontal = gY + gHeight // Line at Bottom
            helperLines.snapPosition.y = (gY + gHeight) - nHeight
        }

        // Vertical Alignment (clamping X)
        // Snap to Left
        if (Math.abs(nX - gX) < minDistX) {
            minDistX = Math.abs(nX - gX)
            helperLines.vertical = gX // Line at Left
            helperLines.snapPosition.x = gX
        }
        // Snap to Center
        if (Math.abs(nCenterX - gCenterX) < minDistX) {
            minDistX = Math.abs(nCenterX - gCenterX)
            helperLines.vertical = gCenterX // Line at Center
            helperLines.snapPosition.x = gCenterX - nWidth / 2
        }
        // Snap to Right
        if (Math.abs((nX + nWidth) - (gX + gWidth)) < minDistX) {
            minDistX = Math.abs((nX + nWidth) - (gX + gWidth))
            helperLines.vertical = gX + gWidth // Line at Right
            helperLines.snapPosition.x = (gX + gWidth) - nWidth
        }
    }

    return helperLines
}
