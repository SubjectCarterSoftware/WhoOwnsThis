import { create } from "zustand";

export type FacetKey = string;
export type Selection = Record<FacetKey, Set<string>>;

interface FiltersState {
  availableFacets: { key: FacetKey; values: Array<{ value: string; countAll: number; countWithOtherFilters: number }> }[];
  selected: Selection;
  search: string;
  setSelected: (key: FacetKey, values: string[] | Set<string>) => void;
  toggleValue: (key: FacetKey, value: string) => void;
  clearGroup: (key: FacetKey) => void;
  clearAll: () => void;
  setAvailableFacets: (facets: FiltersState["availableFacets"]) => void;
  setSearch: (q: string) => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  availableFacets: [],
  selected: {},
  search: "",
  setSelected: (key, values) =>
    set((state) => ({
      selected: { ...state.selected, [key]: new Set(values as any) },
    })),
  toggleValue: (key, value) =>
    set((state) => {
      const current = new Set(state.selected[key] || []);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      return { selected: { ...state.selected, [key]: current } };
    }),
  clearGroup: (key) =>
    set((state) => {
      const next = { ...state.selected };
      delete next[key];
      return { selected: next };
    }),
  clearAll: () => set({ selected: {} }),
  setAvailableFacets: (facets) => set({ availableFacets: facets }),
  setSearch: (q) => set({ search: q }),
}));

export function makeNodePredicate(selected: Selection, search?: string) {
  return (attrs: any) => {
    for (const [facet, values] of Object.entries(selected)) {
      const set = values as Set<string>;
      if (!set || set.size === 0) continue;
      const v = (attrs as any)[facet];
      if (Array.isArray(v)) {
        const has = v.some((x) => set.has(String(x)));
        if (!has) return false;
      } else if (!set.has(String(v))) {
        return false;
      }
    }
    if (search && search.trim()) {
      const s = search.toLowerCase();
      const label = String((attrs as any).label ?? "").toLowerCase();
      const key = String((attrs as any).key ?? "").toLowerCase();
      if (!label.includes(s) && !key.includes(s)) return false;
    }
    return true;
  };
}

