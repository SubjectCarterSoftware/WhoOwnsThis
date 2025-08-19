export type GraphologyJSON = {
  attributes?: Record<string, any>;
  options?: {
    type?: 'directed' | 'undirected' | 'mixed';
    multi?: boolean;
    allowSelfLoops?: boolean;
  };
  nodes: Array<{ key: string; attributes?: Record<string, any> }>;
  edges: Array<{
    key?: string;
    source: string;
    target: string;
    attributes?: Record<string, any>;
    undirected?: boolean;
  }>;
};

export const DEFAULT_GRAPH: GraphologyJSON = {
  attributes: { name: 'Untitled Graph' },
  options: { type: 'mixed', multi: true, allowSelfLoops: true },
  nodes: [],
  edges: []
};
