import Graph from 'graphology';
import { GraphologyJSON, DEFAULT_GRAPH } from '../types/graph';
import { safeAddNode } from './safeMutations';

export function createEmptyGraph(): Graph {
  const graph = new Graph(DEFAULT_GRAPH.options);
  if (DEFAULT_GRAPH.attributes) {
    for (const [k, v] of Object.entries(DEFAULT_GRAPH.attributes)) {
      graph.setAttribute(k, v);
    }
  }
  return graph;
}

export function importFromJSON(json: GraphologyJSON): Graph {
  const graph = new Graph(json.options || {});
  if (json.attributes) {
    for (const [k, v] of Object.entries(json.attributes)) graph.setAttribute(k, v);
  }
  for (const node of json.nodes) {
    safeAddNode(graph, node.key, node.attributes || {});
  }
  for (const edge of json.edges) {
    const undirected = edge.undirected ?? false;
    const key = edge.key as any;
    const attrs = edge.attributes || {};
    if (edge.key || graph.multi) {
      if (undirected) graph.addUndirectedEdgeWithKey(key, edge.source, edge.target, attrs);
      else graph.addDirectedEdgeWithKey(key, edge.source, edge.target, attrs);
    } else {
      if (undirected) graph.addUndirectedEdge(edge.source, edge.target, attrs);
      else graph.addDirectedEdge(edge.source, edge.target, attrs);
    }
  }
  return graph;
}

export function exportToJSON(graph: Graph): GraphologyJSON {
  return {
    attributes: graph.getAttributes(),
    options: {
      type: graph.type,
      multi: graph.multi,
      allowSelfLoops: graph.allowSelfLoops,
    },
    nodes: graph.nodes().map(key => ({ key, attributes: graph.getNodeAttributes(key) })),
    edges: graph.edges().map(key => ({
      key,
      source: graph.source(key),
      target: graph.target(key),
      attributes: graph.getEdgeAttributes(key),
      undirected: graph.isUndirected(key),
    })),
  };
}
