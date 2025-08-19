import React, { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import { NodeCircleProgram } from 'sigma/rendering';
import { useGraphStore } from '../graph/GraphStore';
import { nodeColor, nodeSize, edgeColor, edgeSize } from '../graph/styling';
import { sanitizeNodeAttributes, sanitizeEdgeAttributes } from '../graph/sigmaUtils';

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graph = useGraphStore(s => s.graph);
  const selectNodes = useGraphStore(s => s.selectNodes);
  const selectEdges = useGraphStore(s => s.selectEdges);
  const filters = useGraphStore(s => s.filters);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodeProgramClasses = {
      Person: NodeCircleProgram,
      Project: NodeCircleProgram,
      Team: NodeCircleProgram,
      default: NodeCircleProgram,
    } as const;

    graph.forEachNode((key, attrs) => {
      if (!nodeProgramClasses[attrs.type as keyof typeof nodeProgramClasses]) {
        graph.setNodeAttribute(key, 'type', 'default');
      }
    });

    const renderer = new Sigma(graph, containerRef.current, {
      nodeProgramClasses,
      defaultNodeType: 'default',
    });

    renderer.on('clickNode', e => {
      selectNodes([e.node]);
    });
    renderer.on('clickEdge', e => {
      selectEdges([e.edge]);
    });

    renderer.setSetting('nodeReducer', (node, data) => {
      if (filters.nodeTypes.length && !filters.nodeTypes.includes(String(data.type))) {
        return { hidden: true };
      }
      return {
        ...sanitizeNodeAttributes(data),
        color: nodeColor(data),
        size: nodeSize(graph, node, data),
      };
    });
    renderer.setSetting('edgeReducer', (edge, data) => ({
      ...sanitizeEdgeAttributes(data),
      color: edgeColor(data),
      size: edgeSize(data),
    }));

    return () => renderer.kill();
  }, [graph, selectNodes, selectEdges, filters]);

  return <div ref={containerRef} className="w-full h-full" />;
}
