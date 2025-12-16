import dagre from 'dagre'
import { Position, type Node, type Edge } from '@vue-flow/core'

export function useLayout() {
    const layout = (nodes: Node[], edges: Edge[], direction = 'LR') => {
        // Create a new graph instance for each layout calculation
        const graph = new dagre.graphlib.Graph()
        graph.setDefaultEdgeLabel(() => ({}))

        // Set direction and spacing
        const isHorizontal = direction === 'LR'
        graph.setGraph({
            rankdir: direction,
            ranksep: 100, // Increased spacing for better clarity
            nodesep: 50
        })

        // Add nodes to graph
        for (const node of nodes) {
            // Fallback dimensions if node hasn't rendered yet
            // Updated to match CustomNode size (200px width, ~220px height)
            const width = node.dimensions?.width || 200
            const height = node.dimensions?.height || 250

            graph.setNode(node.id, { width, height })
        }

        // Add edges to graph
        for (const edge of edges) {
            graph.setEdge(edge.source, edge.target)
        }

        // Calculate layout
        dagre.layout(graph)

        // Apply computed positions
        return nodes.map((node) => {
            const nodeWithPosition = graph.node(node.id)

            const width = node.dimensions?.width || 200
            const height = node.dimensions?.height || 250

            return {
                ...node,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                position: {
                    // Dagre returns center coordinates, we need top-left
                    x: nodeWithPosition.x - width / 2,
                    y: nodeWithPosition.y - height / 2
                },
            }
        })
    }

    return { layout }
}
