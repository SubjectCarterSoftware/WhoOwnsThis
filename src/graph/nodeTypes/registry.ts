import type { NodeKind, NodeShape, NodeVariant, NodeUI, GraphNodeAttrs } from "../types";

export type NodeTypeDef = {
  base: NodeShape;
  decorate: (ctx: CanvasRenderingContext2D, data: any, settings: any) => void;
  defaults?: Partial<GraphNodeAttrs>;
  uiSchema?: Record<string, any>;
};

import {
  drawCircleStatusRing,
  drawCircleKpiSegments,
  drawCirclePersonPresence,
  drawSquareHeader,
  drawSquareAccentProgress,
  drawSquareCornerTag,
} from "./decorations";

export const BUILTIN_NODE_TYPES: Record<NodeVariant, NodeTypeDef> = {
  plain: { base: "circle", decorate: () => {} },
  "circle.statusRing": { base: "circle", decorate: drawCircleStatusRing },
  "circle.kpiSegments": { base: "circle", decorate: drawCircleKpiSegments },
  "circle.person": { base: "circle", decorate: drawCirclePersonPresence, defaults: { size: 16 } },
  "square.header": { base: "square", decorate: drawSquareHeader },
  "square.accentProgress": { base: "square", decorate: drawSquareAccentProgress },
  "square.cornerTag": { base: "square", decorate: drawSquareCornerTag },
};

let USER_NODE_TYPES: Record<NodeVariant, Partial<NodeTypeDef>> = {};

export function getNodeTypeDef(variant?: NodeVariant): NodeTypeDef {
  const v = variant && (USER_NODE_TYPES[variant] || BUILTIN_NODE_TYPES[variant]);
  return v
    ? { ...BUILTIN_NODE_TYPES.plain, ...(BUILTIN_NODE_TYPES[variant] || {}), ...(USER_NODE_TYPES[variant] || {}) }
    : BUILTIN_NODE_TYPES.plain;
}

export async function loadUserNodeTypes(url = "/data/node-types.json") {
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const json = await res.json();
    USER_NODE_TYPES = json || {};
  } catch {
    /* ignore */
  }
}
