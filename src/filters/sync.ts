import type Graph from "graphology";
import { debounce } from "../util/debounce";
import { discoverNodeFacetKeys, buildFacetIndex } from "./indexer";
import { useFiltersStore, makeNodePredicate } from "../state/filtersStore";
import shallow from "zustand/shallow";

export function syncFiltersFromGraph(graph: Graph) {
  const keys = discoverNodeFacetKeys(graph);
  const { selected, search, setAvailableFacets } = useFiltersStore.getState();

  const predicateBuilder = (exclude?: string) => {
    const sel = { ...selected };
    if (exclude) delete sel[exclude];
    return makeNodePredicate(sel, search);
  };

  const facets = buildFacetIndex(graph, keys, predicateBuilder);
  setAvailableFacets(facets);
}

export function attachGraphListenersForFilters(graph: Graph) {
  const debouncedSync = debounce(() => syncFiltersFromGraph(graph), 100);
  const events = [
    "nodeAdded",
    "nodeDropped",
    "nodeAttributesUpdated",
    "edgeAdded",
    "edgeDropped",
    "edgeAttributesUpdated",
  ];

  events.forEach(ev => (graph as any).on(ev, debouncedSync));

  const unsubscribe = (useFiltersStore.subscribe as any)(
    (s: any) => [s.selected, s.search],
    debouncedSync,
    { equalityFn: shallow }
  );

  debouncedSync();

  return () => {
    events.forEach(ev => (graph as any).off(ev, debouncedSync));
    unsubscribe();
  };
}

