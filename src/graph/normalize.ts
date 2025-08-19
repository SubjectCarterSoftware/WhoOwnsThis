import { GraphologyJSON } from '../types/graph';

export function normalizeGraphJSON(data: any): GraphologyJSON | null {
  if (!data || typeof data !== 'object') return null;
  const attributes = typeof data.attributes === 'object' && data.attributes !== null ? data.attributes : {};
  const options = typeof data.options === 'object' && data.options !== null ? data.options : {};
  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  const edges = Array.isArray(data.edges) ? data.edges : [];

  return {
    attributes,
    options,
    nodes: nodes
      .filter((n: any) => n && n.key)
      .map((n: any) => ({
        key: String(n.key),
        attributes: typeof n.attributes === 'object' && n.attributes !== null ? n.attributes : {},
      })),
    edges: edges
      .filter((e: any) => e && e.source && e.target)
      .map((e: any) => ({
        key: e.key ? String(e.key) : undefined,
        source: String(e.source),
        target: String(e.target),
        attributes: typeof e.attributes === 'object' && e.attributes !== null ? e.attributes : {},
        undirected: Boolean(e.undirected),
      })),
  };
}
