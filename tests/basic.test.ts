import { describe, it, expect } from 'vitest';
import { useGraphStore } from '../src/graph/GraphStore';
import sample from '../samples/sample.graph.json';
import { sanitizeNodeAttributes } from '../src/graph/sigmaUtils';

describe('Sample graph loading', () => {
  it('loads sample graph by default', () => {
    const graph = useGraphStore.getState().graph;
    expect(graph.order).toBe(sample.nodes.length);
    expect(graph.size).toBe(sample.edges.length);
  });
});

describe('Sigma attribute sanitization', () => {
  it('removes type attribute', () => {
    const result = sanitizeNodeAttributes({ label: 'Alice', type: 'Person' });
    expect(result).toEqual({ label: 'Alice' });
  });
});
