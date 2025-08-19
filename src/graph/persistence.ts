import { GraphologyJSON } from "../types/graph";

export function normalizeGraph(json: any): GraphologyJSON {
  const safe: GraphologyJSON = {
    attributes: json?.attributes ?? {},
    options: {
      type: json?.options?.type ?? "mixed",
      multi: Boolean(json?.options?.multi ?? true),
      allowSelfLoops: Boolean(json?.options?.allowSelfLoops ?? true),
    },
    nodes: Array.isArray(json?.nodes)
      ? json.nodes
          .map((n: any) => ({
            key: String(n?.key ?? ""),
            attributes: (n && typeof n.attributes === "object" && n.attributes) || {},
          }))
          .filter((n: any) => n.key)
      : [],
    edges: Array.isArray(json?.edges)
      ? json.edges
          .map((e: any) => ({
            key: e?.key ? String(e.key) : undefined,
            source: String(e?.source ?? ""),
            target: String(e?.target ?? ""),
            attributes: (e && typeof e.attributes === "object" && e.attributes) || {},
            undirected: Boolean(e?.undirected),
          }))
          .filter((e: any) => e.source && e.target)
      : [],
  };
  return safe;
}

export async function openFile(): Promise<any | null> {
  if ((window as any).showOpenFilePicker) {
    const [handle] = await (window as any).showOpenFilePicker({
      types: [{ description: 'Graph JSON', accept: { 'application/json': ['.json'] } }],
    });
    const file = await handle.getFile();
    const text = await file.text();
    return JSON.parse(text);
  }
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const text = await file.text();
      resolve(JSON.parse(text));
    };
    input.click();
  });
}

export async function saveFile(json: GraphologyJSON, handle?: any): Promise<any> {
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  if ((window as any).showSaveFilePicker) {
    handle = handle || (await (window as any).showSaveFilePicker({
      types: [{ description: 'Graph JSON', accept: { 'application/json': ['.json'] } }],
    }));
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return handle;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'graph.json';
  a.click();
  URL.revokeObjectURL(url);
  return null;
}

// naive IndexedDB autosave using localforage-like API
const KEY = 'ownershipmap-autosave';

export const autosave = {
  async save(json: GraphologyJSON) {
    localStorage.setItem(KEY, JSON.stringify(json));
  },
  async loadLatest(): Promise<GraphologyJSON | null> {
    const text = localStorage.getItem(KEY);
    return text ? JSON.parse(text) : null;
  },
  clear() {
    localStorage.removeItem(KEY);
  }
};
