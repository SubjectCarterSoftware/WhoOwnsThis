import Graph from 'graphology';

export const TYPE_COLORS: Record<string, string> = {
  Person: '#4F46E5',
  Project: '#059669',
  Team: '#2563EB',
  Domain: '#EA580C',
  Skill: '#9333EA',
};

export function nodeColor(attrs: any): string {
  if (attrs.color) return attrs.color;
  const t = attrs.type;
  return TYPE_COLORS[t] || '#6B7280';
}

export function nodeSize(graph: Graph, key: string, attrs: any): number {
  if (attrs.size) return attrs.size;
  return Math.max(4, Math.min(10, graph.degree(key)));
}

export function edgeColor(attrs: any): string {
  return attrs.color || '#999';
}

export function edgeSize(attrs: any): number {
  if (attrs.weight) return attrs.weight;
  return 1;
}
