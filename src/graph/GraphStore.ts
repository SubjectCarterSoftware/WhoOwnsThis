import create from 'zustand';
import Graph from 'graphology';
import { nanoid } from 'nanoid';
import { importFromJSON, exportToJSON, createEmptyGraph } from './graphHelpers';
import { GraphologyJSON } from '../types/graph';
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
  applyFilters: (f: { nodeTypes: string[] }) => void;
  clearFilters: () => void;
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 50;

function cloneGraph(graph: Graph): GraphologyJSON {
  return exportToJSON(graph);
}

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
    graph: createEmptyGraph(),
    selection: { nodes: [], edges: [] },
    layout: null,
    filters: { nodeTypes: [] },
    loadGraphFromJSON(json) {
      set({ graph: importFromJSON(json), selection: { nodes: [], edges: [] } });
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
    applyFilters(f) {
      set({ filters: f });
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
