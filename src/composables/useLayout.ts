import dagre from 'dagre'
import { Position, type Node, type Edge } from '@vue-flow/core'

export function useLayout() {
    const layout = (nodes: Node[], edges: Edge[], direction = 'LR') => {
        if (nodes.length === 0) return nodes;

        const graph = new dagre.graphlib.Graph()
        graph.setDefaultEdgeLabel(() => ({}))

        const isHorizontal = direction === 'LR'

        graph.setGraph({
            rankdir: direction,
            ranksep: 100,
            nodesep: 50
        })

        for (const node of nodes) {
            // VueFlow doesn't always provide dimensions in the node object directly in setup
            // Usually they are in node.dimensions (width/height)
            const width = (node as any).dimensions?.width || 200
            const height = (node as any).dimensions?.height || 250
            graph.setNode(node.id, { width, height })
        }

        for (const edge of edges) {
            graph.setEdge(edge.source, edge.target)
        }

        dagre.layout(graph)

        return nodes.map((node) => {
            const nodeWithPosition = graph.node(node.id)
            const width = (node as any).dimensions?.width || 200
            const height = (node as any).dimensions?.height || 250

            return {
                ...node,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                position: {
                    // Dagre returns center coordinates, convert to top-left
                    x: nodeWithPosition.x - width / 2,
                    y: nodeWithPosition.y - height / 2
                },
            }
        })
    }

    return { layout }
}

