import type Graph from "graphology";
import { IGNORE_KEYS, NODE_FACET_CANDIDATES } from "./facetConfig";

export interface FacetOption {
  value: string;
  countAll: number;
  countWithOtherFilters: number;
}

export interface FacetGroup {
  key: string;
  values: FacetOption[];
}

export function buildFacetIndex(
  graph: Graph,
  facetKeys: string[],
  predicateBuilder: (exclude?: string) => (attrs: any) => boolean
): FacetGroup[] {
  const facets: FacetGroup[] = [];
  const nodes = graph.nodes();

  for (const key of facetKeys) {
    const countsAll = new Map<string, number>();
    const countsWith = new Map<string, number>();
    const predicate = predicateBuilder(key);

    for (const n of nodes) {
      const attrs = graph.getNodeAttributes(n);
      let values: string[] = [];
      const v = (attrs as any)[key];
      if (Array.isArray(v)) values = v.map(x => String(x));
      else if (v !== undefined && v !== null) values = [String(v)];
      if (!values.length) continue;

      for (const val of values) {
        countsAll.set(val, (countsAll.get(val) || 0) + 1);
        if (predicate(attrs)) {
          countsWith.set(val, (countsWith.get(val) || 0) + 1);
        }
      }
    }

    const values = Array.from(countsAll.keys()).map(value => ({
      value,
      countAll: countsAll.get(value) || 0,
      countWithOtherFilters: countsWith.get(value) || 0,
    }));

    facets.push({ key, values });
  }

  return facets;
}

export function discoverNodeFacetKeys(graph: Graph, sampleLimit = 1000): string[] {
  const nodes = graph.nodes().slice(0, sampleLimit);
  const distincts: Record<string, Set<string>> = {};
  const counts: Record<string, number> = {};

  for (const n of nodes) {
    const attrs = graph.getNodeAttributes(n) as Record<string, any>;
    for (const [k, v] of Object.entries(attrs)) {
      if (IGNORE_KEYS.includes(k)) continue;
      if (v === undefined || v === null) continue;
      counts[k] = (counts[k] || 0) + 1;
      const set = (distincts[k] ||= new Set<string>());
      if (Array.isArray(v)) v.forEach(x => set.add(String(x)));
      else set.add(String(v));
    }
  }

  const threshold = nodes.length * 0.05;
  const discovered = Object.entries(distincts)
    .filter(([k, set]) => set.size >= 2 && counts[k] >= threshold)
    .map(([k]) => k);
  return discovered.filter(k => (NODE_FACET_CANDIDATES as readonly string[]).includes(k));
}

