import React from 'react';
import { useFiltersStore } from '../state/filtersStore';

export default function Filters() {
  const availableFacets = useFiltersStore(s => s.availableFacets);
  const selected = useFiltersStore(s => s.selected);
  const toggleValue = useFiltersStore(s => s.toggleValue);
  const clearGroup = useFiltersStore(s => s.clearGroup);
  const clearAll = useFiltersStore(s => s.clearAll);
  const setSelected = useFiltersStore(s => s.setSelected);
  const search = useFiltersStore(s => s.search);
  const setSearch = useFiltersStore(s => s.setSearch);

  return (
    <div className="w-48 p-2 border-r overflow-auto text-sm">
      <h3 className="font-bold mb-2">Filters</h3>
      <input
        className="border p-1 w-full mb-2"
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {availableFacets.map(f => {
        return (
          <div key={f.key} className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold capitalize">{f.key}</span>
              <div className="space-x-1">
                <button
                  className="text-xs text-blue-600"
                  onClick={() =>
                    setSelected(f.key, f.values.map(v => v.value))
                  }
                >
                  All
                </button>
                <button
                  className="text-xs text-blue-600"
                  onClick={() => clearGroup(f.key)}
                >
                  Clear
                </button>
              </div>
            </div>
            {f.values.map(opt => (
              <label key={opt.value} className="block">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={!!selected[f.key]?.has(opt.value)}
                  onChange={() => toggleValue(f.key, opt.value)}
                />
                {opt.value} ({opt.countWithOtherFilters})
              </label>
            ))}
          </div>
        );
      })}
      {availableFacets.length > 0 && (
        <button className="mt-2 text-sm text-blue-600" onClick={clearAll}>
          Clear all
        </button>
      )}
    </div>
  );
}
