import React from 'react';
import { useGraphStore } from '../graph/GraphStore';

export default function LeftPanel() {
  const graph = useGraphStore(s => s.graph);
  const filters = useGraphStore(s => s.filters);
  const applyFilters = useGraphStore(s => s.applyFilters);
  const clearFilters = useGraphStore(s => s.clearFilters);

  const nodeTypes = React.useMemo(
    () =>
      Array.from(
        new Set(
          graph
            .nodes()
            .map(n => graph.getNodeAttribute(n, 'type'))
            .filter(Boolean)
        )
      ),
    [graph]
  );

  function toggle(type: string) {
    const newTypes = filters.nodeTypes.includes(type)
      ? filters.nodeTypes.filter(t => t !== type)
      : [...filters.nodeTypes, type];

    if (newTypes.length === 0) clearFilters();
    else applyFilters({ nodeTypes: newTypes });
  }

  return (
    <div className="w-40 p-2 border-r overflow-auto">
      <h3 className="font-bold mb-2">Filters</h3>
      {nodeTypes.map(t => (
        <label key={t} className="block">
          <input type="checkbox" checked={filters.nodeTypes.includes(t)} onChange={() => toggle(t)} /> {t}
        </label>
      ))}
      {filters.nodeTypes.length > 0 && (
        <button onClick={clearFilters} className="mt-2 text-sm text-blue-600">Clear</button>
      )}
    </div>
  );
}
