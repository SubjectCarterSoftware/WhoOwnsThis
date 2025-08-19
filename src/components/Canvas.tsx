import React, { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import { NodeCircleProgram, EdgeLineProgram } from 'sigma/rendering';
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

    const edgeProgramClasses = {
      REPORTS_TO: EdgeLineProgram,
      MANAGES: EdgeLineProgram,
      WORKS_ON: EdgeLineProgram,
      KNOWS: EdgeLineProgram,
      BELONGS_TO: EdgeLineProgram,
      default: EdgeLineProgram,
    } as const;

    graph.forEachNode((key, attrs) => {
      if (!nodeProgramClasses[attrs.type as keyof typeof nodeProgramClasses]) {
        graph.setNodeAttribute(key, 'type', 'default');
      }
    });

    graph.forEachEdge((key, attrs) => {
      if (!edgeProgramClasses[attrs.type as keyof typeof edgeProgramClasses]) {
        graph.setEdgeAttribute(key, 'type', 'default');
      }
    });

    const renderer = new Sigma(graph, containerRef.current, {
      nodeProgramClasses,
      edgeProgramClasses,
      defaultNodeType: 'default',
      defaultEdgeType: 'default',
    });

    renderer.on('clickNode', ({ node }) => {
      selectEdges([]);
      selectNodes([node]);
    });
    renderer.on('clickEdge', ({ edge }) => {
      selectNodes([]);
      selectEdges([edge]);
    });
    renderer.on('clickStage', () => {
      selectNodes([]);
      selectEdges([]);
    });

    renderer.setSetting("nodeReducer", (node, data) => {
      try {
        const attrs = sanitizeNodeAttributes(data || {});
        const types = (filters?.nodeTypes ?? []) as string[];
        const type = (data?.type ?? "").toString();
        // No filters => show all
        if (!types.length) {
          return {
            ...attrs,
            color: nodeColor(data || {}),
            size: nodeSize(graph, node, data || {}),
          };
        }
        // Active filters => hide non-matching
        if (!types.includes(type)) return { hidden: true };
        return {
          ...attrs,
          color: nodeColor(data || {}),
          size: nodeSize(graph, node, data || {}),
        };
      } catch (e) {
        console.error("nodeReducer error:", e);
        return { hidden: false };
      }
    });

    renderer.setSetting("edgeReducer", (edge, data) => {
      try {
        const attrs = sanitizeEdgeAttributes(data || {});
        return {
          ...attrs,
          color: edgeColor(data || {}),
          size: edgeSize(data || {}),
        };
      } catch (e) {
        console.error("edgeReducer error:", e);
        return {};
      }
    });

    return () => renderer.kill();
  }, [graph, selectNodes, selectEdges, filters]);

  return <div ref={containerRef} className="w-full h-full" />;
}
