import type { NodeReducer } from "sigma/types";
import { nodeColor, nodeSize } from "./styling";
import { sanitizeNodeAttributes } from "./sigmaUtils";

export function createNodeReducer(graph: any, filters: any): NodeReducer {
  return (id, attrs) => {
    // Debug: if this ever logs, upstream code wiped positions
    if (typeof attrs.x !== "number" || typeof attrs.y !== "number") {
      // eslint-disable-next-line no-console
      console.warn("[nodeReducer] missing x/y for", id, attrs);
    }

    const base = { ...attrs }; // ALWAYS spread first
    const clean = sanitizeNodeAttributes(base);

    const types = (filters?.nodeTypes ?? []) as string[];
    const type = (attrs?.type ?? "").toString();
    if (types.length && !types.includes(type)) {
      return { ...clean, hidden: true };
    }

    // Style tweaks: never touch x/y, only add visual props
    return {
      ...clean,
      color: nodeColor(attrs || {}),
      size: nodeSize(graph, id, attrs || {}),
    };
  };
}
