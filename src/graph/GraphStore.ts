import { create } from 'zustand';
import Graph from 'graphology';
import { nanoid } from 'nanoid';
import { importFromJSON, exportToJSON } from './graphHelpers';
import { GraphologyJSON } from '../types/graph';
import sampleGraph from '../../samples/sample.graph.json';
import { runForceAtlas2, applyCircular } from './layouts';

type Selection = { nodes: string[]; edges: string[] };

type Layout = 'forceatlas2' | 'circular' | null;

interface GraphStore {
  graph: Graph;
  selection: Selection;
  layout: Layout;
  filters: { nodeTypes: string[] };
  loadGraphFromJSON: (json: GraphologyJSON) => void;
  exportGraphJSON: () => GraphologyJSON;
  addNode: (attrs: Record<string, any>) => string;
  addEdge: (edge: { source: string; target: string; attributes?: Record<string, any>; key?: string; undirected?: boolean }) => string;
  updateNodeAttributes: (key: string, patch: Record<string, any>) => void;
  updateEdgeAttributes: (key: string, patch: Record<string, any>) => void;
  deleteSelection: () => void;
  selectNodes: (nodes: string[]) => void;
  selectEdges: (edges: string[]) => void;
  runLayout: (name: Layout) => void;
  stopLayout: () => void;
  applyFilters: (partial?: Partial<{ nodeTypes: string[] }>) => void;
  clearFilters: () => void;
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 50;

function cloneGraph(graph: Graph): GraphologyJSON {
  return exportToJSON(graph);
}

const initialGraph = (() => {
  const g = importFromJSON(sampleGraph as GraphologyJSON);
  const needsLayout = g.nodes().some(key => {
    const attrs = g.getNodeAttributes(key);
    return typeof attrs.x !== 'number' || typeof attrs.y !== 'number';
  });
  if (needsLayout) {
    applyCircular(g);
  }
  return g;
})();

export const useGraphStore = create<GraphStore>((set, get) => {
  const history: GraphologyJSON[] = [];
  const future: GraphologyJSON[] = [];
  let layoutHandle: (() => void) | null = null;

  function pushHistory() {
    history.push(cloneGraph(get().graph));
    if (history.length > MAX_HISTORY) history.shift();
    future.length = 0;
  }

  function restore(json: GraphologyJSON) {
    const graph = importFromJSON(json);
    set({ graph });
  }

  return {
    graph: initialGraph,
    selection: { nodes: [], edges: [] },
    layout: null,
    filters: { nodeTypes: [] },
    loadGraphFromJSON(json) {
      const graph = importFromJSON(json);
      const needsLayout = graph.nodes().some(key => {
        const attrs = graph.getNodeAttributes(key);
        return typeof attrs.x !== 'number' || typeof attrs.y !== 'number';
      });
      if (needsLayout) {
        applyCircular(graph);
      }
      set({ graph, selection: { nodes: [], edges: [] } });
    },
    exportGraphJSON() {
      return exportToJSON(get().graph);
    },
    addNode(attrs) {
      pushHistory();
      const key = attrs.key || `node:${nanoid(6)}`;
      const { graph } = get();
      graph.addNode(key, attrs);
      set({ graph });
      return key;
    },
    addEdge(edge) {
      pushHistory();
      const { graph } = get();
      const key = edge.key || `edge:${nanoid(6)}`;
      if (edge.undirected) graph.addUndirectedEdgeWithKey(key, edge.source, edge.target, edge.attributes || {});
      else graph.addDirectedEdgeWithKey(key, edge.source, edge.target, edge.attributes || {});
      set({ graph });
      return key;
    },
    updateNodeAttributes(key, patch) {
      pushHistory();
      const { graph } = get();
      const attrs = graph.getNodeAttributes(key);
      graph.replaceNodeAttributes(key, { ...attrs, ...patch });
      set({ graph });
    },
    updateEdgeAttributes(key, patch) {
      pushHistory();
      const { graph } = get();
      const attrs = graph.getEdgeAttributes(key);
      graph.replaceEdgeAttributes(key, { ...attrs, ...patch });
      set({ graph });
    },
    deleteSelection() {
      pushHistory();
      const { graph, selection } = get();
      selection.nodes.forEach(n => graph.dropNode(n));
      selection.edges.forEach(e => graph.dropEdge(e));
      set({ graph, selection: { nodes: [], edges: [] } });
    },
    selectNodes(nodes) {
      set({ selection: { ...get().selection, nodes } });
    },
    selectEdges(edges) {
      set({ selection: { ...get().selection, edges } });
    },
    applyFilters(partial) {
      set(state => ({ filters: { ...state.filters, ...(partial || {}) } }));
    },
    clearFilters() {
      set({ filters: { nodeTypes: [] } });
    },
    runLayout(name) {
      const { graph } = get();
      if (layoutHandle) layoutHandle();
      if (name === 'forceatlas2') {
        layoutHandle = runForceAtlas2(graph);
      } else if (name === 'circular') {
        applyCircular(graph);
        layoutHandle = null;
      }
      set({ layout: name });
    },
    stopLayout() {
      if (layoutHandle) {
        layoutHandle();
        layoutHandle = null;
      }
      set({ layout: null });
    },
    undo() {
      if (!history.length) return;
      const last = history.pop()!;
      future.push(cloneGraph(get().graph));
      restore(last);
    },
    redo() {
      if (!future.length) return;
      const next = future.pop()!;
      history.push(cloneGraph(get().graph));
      restore(next);
    },
  };
});
