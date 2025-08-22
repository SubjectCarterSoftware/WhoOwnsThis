import React, { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import { NodeCircleProgram, EdgeLineProgram } from 'sigma/rendering';
import { createNodeImageProgram } from '@sigma/node-image';
import { NodeSquareProgram } from '@sigma/node-square';
import { useGraphStore } from '../graph/GraphStore';
import { nodeReducer } from '../graph/reducers';
import { edgeColor, edgeSize } from '../graph/styling';
import { sanitizeEdgeAttributes } from '../graph/sigmaUtils';
import { attachGraphListenersForFilters } from '../filters/sync';

type LabelData = {
  key: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
  headerColor?: string;
};

function drawHeaderBox(ctx: CanvasRenderingContext2D, d: LabelData, s: any) {
  const padX = 8, padY = 6, headerH = 18, radius = 8;
  const font = `${s.labelWeight || 600} ${s.labelSize || 12}px ${s.labelFont || 'Inter'}`;
  ctx.save();
  ctx.font = font;

  const text = d.label || '';
  const textW = ctx.measureText(text).width;
  const w = Math.max(140, textW + padX * 2);
  const h = headerH + 6 + (s.labelSize || 12) + padY;
  const x = d.x - w / 2;
  const y = d.y - d.size - h - 6;

  const rrect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  rrect(x, y, w, h, radius);
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.95;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + headerH);
  ctx.lineTo(x, y + headerH);
  ctx.closePath();
  ctx.fillStyle = d.headerColor || d.color || '#111827';
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + headerH / 2);

  ctx.restore();
}

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graph = useGraphStore(s => s.graph);
  const selectNodes = useGraphStore(s => s.selectNodes);
  const selectEdges = useGraphStore(s => s.selectEdges);

  useEffect(() => {
    if (!containerRef.current) return;

    const detachFilters = attachGraphListenersForFilters(graph);

    const ImageProgram = createNodeImageProgram();

    const nodeProgramClasses = {
      default: NodeCircleProgram,
      square: NodeSquareProgram,
      image: ImageProgram,
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
      if (typeof attrs.x !== 'number' || typeof attrs.y !== 'number') {
        graph.setNodeAttribute(key, 'x', Math.random());
        graph.setNodeAttribute(key, 'y', Math.random());
      }
      if ((attrs as any).image) {
        ImageProgram.setImage((attrs as any).image, (attrs as any).image);
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
      nodeProgramKey: 'type',
      defaultNodeType: 'default',
      defaultEdgeType: 'default',
      labelFont: 'Inter, system-ui, sans-serif',
      labelWeight: '600',
      labelSize: 12,
      renderLabels: true,
      labelRenderedSizeThreshold: 6,
      zIndex: true,
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

    renderer.setSetting('nodeReducer', (node, data) => {
      try {
        return nodeReducer(node, data || {});
      } catch (e) {
        console.error('nodeReducer error:', e);
        return { hidden: false };
      }
    });

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

    renderer.setSetting('hoverRenderer', (ctx, data, settings) => {
      drawHeaderBox(ctx, data as any, settings);
    });

    renderer.setSetting('labelRenderer', (ctx, data: any, settings: any) => {
      ctx.save();
      ctx.font = `${settings.labelWeight || 600} ${settings.labelSize || 12}px ${settings.labelFont || 'Inter'}`;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#111827';
      ctx.fillText(data.label || '', data.x + data.size + 6, data.y);
      ctx.restore();
    });

    renderer.setSetting('enableHovering', true);
    renderer.setSetting('enableEdgeHoverEvents', false);

    return () => {
      detachFilters();
      renderer.kill();
    };
  }, [graph, selectNodes, selectEdges]);

  return <div ref={containerRef} className="w-full h-full" />;
}
