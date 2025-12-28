import { type NodePositionChange, type GraphNode } from '@vue-flow/core'

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

    // Center of dragging node (simplified input handle position)
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

        // --- GEOMETRIC ALIGNMENT (Nodes Edges/Centers) ---

        // Horizontal Alignment (clamping Y)
        // Snap to Top
        if (Math.abs(nY - gY) < minDistY) {
            minDistY = Math.abs(nY - gY)
            helperLines.horizontal = gY
            helperLines.snapPosition.y = gY
        }
        // Snap to Center
        if (Math.abs(nCenterY - gCenterY) < minDistY) {
            minDistY = Math.abs(nCenterY - gCenterY)
            helperLines.horizontal = gCenterY
            helperLines.snapPosition.y = gCenterY - nHeight / 2
        }
        // Snap to Bottom
        if (Math.abs((nY + nHeight) - (gY + gHeight)) < minDistY) {
            minDistY = Math.abs((nY + nHeight) - (gY + gHeight))
            helperLines.horizontal = gY + gHeight
            helperLines.snapPosition.y = (gY + gHeight) - nHeight
        }

        // Vertical Alignment (clamping X)
        // Snap to Left
        if (Math.abs(nX - gX) < minDistX) {
            minDistX = Math.abs(nX - gX)
            helperLines.vertical = gX
            helperLines.snapPosition.x = gX
        }
        // Snap to Center
        if (Math.abs(nCenterX - gCenterX) < minDistX) {
            minDistX = Math.abs(nCenterX - gCenterX)
            helperLines.vertical = gCenterX
            helperLines.snapPosition.x = gCenterX - nWidth / 2
        }
        // Snap to Right
        if (Math.abs((nX + nWidth) - (gX + gWidth)) < minDistX) {
            minDistX = Math.abs((nX + nWidth) - (gX + gWidth))
            helperLines.vertical = gX + gWidth
            helperLines.snapPosition.x = (gX + gWidth) - nWidth
        }

        // --- HANDLE ALIGNMENT (Precise connection points) ---

        // Check Source Handles (Outputs) of other nodes to align with current node Center Y (Input)
        if (graphNode.handleBounds?.source) {
            for (const handle of graphNode.handleBounds.source) {
                if (!handle.width || !handle.height) continue;

                // Calculate absolute handle center Y
                const handleCenterY = gY + handle.y + (handle.height / 2);

                // Align dragging node Center Y with remote Handle Center Y
                if (Math.abs(nCenterY - handleCenterY) < minDistY) {
                    minDistY = Math.abs(nCenterY - handleCenterY);
                    helperLines.horizontal = handleCenterY;
                    helperLines.snapPosition.y = handleCenterY - nHeight / 2;
                }
            }
        }

        // EXTRA: Vertical mode alignment (Inputs/Outputs on Top/Bottom)
        // Check Source Handles (Outputs - typically bottom in vertical mode) to align with current node Center X
        if (graphNode.handleBounds?.source) {
            for (const handle of graphNode.handleBounds.source) {
                if (!handle.width || !handle.height) continue;

                const handleCenterX = gX + handle.x + (handle.width / 2);

                if (Math.abs(nCenterX - handleCenterX) < minDistX) {
                    minDistX = Math.abs(nCenterX - handleCenterX);
                    helperLines.vertical = handleCenterX;
                    helperLines.snapPosition.x = handleCenterX - nWidth / 2;
                }
            }
        }
    }

    // --- GRID SNAP FALLBACK (Soft Grid) ---
    // If no helper line align was found, snap to soft grid (e.g. 10px) to keep organization
    const gridSnap = 10;

    if (helperLines.snapPosition.x === undefined) {
        helperLines.snapPosition.x = Math.round(nX / gridSnap) * gridSnap;
    }

    if (helperLines.snapPosition.y === undefined) {
        helperLines.snapPosition.y = Math.round(nY / gridSnap) * gridSnap;
    }

    return helperLines
}
