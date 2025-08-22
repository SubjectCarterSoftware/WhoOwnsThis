import { describe, it, expect } from 'vitest';
import { useGraphStore } from '../src/graph/GraphStore';
import sample from '../public/data/sample-graph.json';
import { sanitizeNodeAttributes } from '../src/graph/sigmaUtils';

describe('Sample graph loading', () => {
  it('loads sample graph', async () => {
    await useGraphStore.getState().loadGraphFromJSON(sample as any);
    const graph = useGraphStore.getState().graph;
    expect(graph.order).toBe(sample.nodes.length);
    expect(graph.size).toBe(sample.edges.length);
  });
});

describe('Sigma attribute sanitization', () => {
  it('preserves structural attributes', () => {
    const input = { label: 'Alice', kind: 'person', shape: 'circle', x: 1, y: 2, size: 20 };
    const result = sanitizeNodeAttributes(input);
    expect(result).toEqual(input);
  });
});

