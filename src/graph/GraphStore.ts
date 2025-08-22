import { create } from 'zustand';
import Graph from 'graphology';
import { nanoid } from 'nanoid';
import { importFromJSON, exportToJSON, createEmptyGraph } from './graphHelpers';
import { GraphologyJSON } from '../types/graph';
import { runForceAtlas2, applyCircular } from './layouts';
import { normalizeNode } from './normalize';

type Selection = { nodes: string[]; edges: string[] };

type Layout = 'forceatlas2' | 'circular' | null;

interface GraphStore {
  graph: Graph;
  selection: Selection;
  layout: Layout;
  filters: { nodeTypes: string[] };
  loadGraphFromJSON: (json: GraphologyJSON | string) => Promise<void>;
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
    async loadGraphFromJSON(jsonOrUrl) {
      let raw: any;
      if (typeof jsonOrUrl === 'string') {
        const res = await fetch(jsonOrUrl);
        raw = await res.json();
      } else {
        raw = jsonOrUrl;
      }

      const graph = new Graph();

      for (const n of raw.nodes ?? []) {
        const nn = normalizeNode(n);
        graph.addNode(nn.key, nn);
      }

      for (const e of raw.edges ?? []) {
        if (!graph.hasNode(e.source) || !graph.hasNode(e.target)) continue;
        const key = e.key || `${e.source}->${e.target}:${e.label ?? 'rel'}`;
        graph.addEdgeWithKey(key, e.source, e.target, { label: e.label, type: e.type });
      }

      graph.forEachNode((id, a) => {
        if (typeof a.x !== 'number') graph.setNodeAttribute(id, 'x', Math.random());
        if (typeof a.y !== 'number') graph.setNodeAttribute(id, 'y', Math.random());
      });

      set({ graph, selection: { nodes: [], edges: [] } });
    },
    exportGraphJSON() {
      return exportToJSON(get().graph);
    },
    addNode(attrs) {
      pushHistory();
      const key = attrs.key || `node:${crypto.randomUUID()}`;
      const withPos = { ...attrs } as Record<string, any>;
      if (typeof withPos.x !== 'number' || typeof withPos.y !== 'number') {
        withPos.x = Math.random();
        withPos.y = Math.random();
      }
      withPos.size = Math.max(14, Number(withPos.size ?? 14));
      withPos.kind ??= 'information';
      withPos.shape ??=
        withPos.kind === 'asset'
          ? 'square'
          : withPos.kind === 'person'
          ? 'image'
          : 'circle';
      const { graph } = get();
      graph.addNode(key, withPos);
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
      const next = { ...attrs, ...patch } as Record<string, any>;
      if (typeof next.x !== 'number') next.x = typeof attrs.x === 'number' ? attrs.x : Math.random();
      if (typeof next.y !== 'number') next.y = typeof attrs.y === 'number' ? attrs.y : Math.random();
      next.size = Math.max(14, Number(next.size ?? 14));
      next.kind = (next.kind ?? attrs.kind ?? 'information');
      next.shape =
        next.shape ??
        attrs.shape ??
        (next.kind === 'asset'
          ? 'square'
          : next.kind === 'person'
          ? 'image'
          : 'circle');
      graph.replaceNodeAttributes(key, next);
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
      set(s => ({ filters: { ...s.filters, ...(partial || {}) } }));
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
