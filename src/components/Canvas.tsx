import React, { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import { NodeCircleProgram, EdgeLineProgram } from 'sigma/rendering';
import { useGraphStore } from '../graph/GraphStore';
import { edgeColor, edgeSize } from '../graph/styling';
import { sanitizeEdgeAttributes } from '../graph/sigmaUtils';
import { createNodeReducer } from '../graph/reducers';

function seedMissingPositions(graph: any) {
  graph.forEachNode((n: string, a: any) => {
    if (typeof a.x !== 'number') graph.setNodeAttribute(n, 'x', Math.random());
    if (typeof a.y !== 'number') graph.setNodeAttribute(n, 'y', Math.random());
  });
}

function assertPositions(graph: any, tag = '') {
  const bad: string[] = [];
  graph.forEachNode((n: string, a: any) => {
    if (typeof a.x !== 'number' || typeof a.y !== 'number') bad.push(n);
  });
  if (bad.length) {
    // eslint-disable-next-line no-console
    console.error(`[${tag}] nodes missing x/y:`, bad.slice(0, 25), bad.length > 25 ? `(+${bad.length - 25})` : '');
  }
}

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graph = useGraphStore(s => s.graph);
  const selectNodes = useGraphStore(s => s.selectNodes);
  const selectEdges = useGraphStore(s => s.selectEdges);
  const filters = useGraphStore(s => s.filters);
  const rendererRef = useRef<Sigma | null>(null);

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

    seedMissingPositions(graph);
    assertPositions(graph, 'initial');

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
    rendererRef.current = renderer;

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

    renderer.setSetting('nodeReducer', createNodeReducer(graph, filters));

    renderer.setSetting('edgeReducer', (edge, data) => {
      try {
        const attrs = sanitizeEdgeAttributes(data || {});
        return {
          ...attrs,
          color: edgeColor(data || {}),
          size: edgeSize(data || {}),
        };
      } catch (e) {
        console.error('edgeReducer error:', e);
        return {};
      }
    });

    return () => {
      renderer.kill();
      rendererRef.current = null;
    };
  }, [graph, selectNodes, selectEdges]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setSetting('nodeReducer', createNodeReducer(graph, filters));
    assertPositions(graph, 'before-filter');
    seedMissingPositions(graph);
    assertPositions(graph, 'after-filter');
    renderer.refresh();
  }, [filters, graph]);

  return <div ref={containerRef} className="w-full h-full" />;
}
