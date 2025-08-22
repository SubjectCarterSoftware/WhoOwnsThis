import React, { useEffect, useState } from 'react';
import { useGraphStore } from '../graph/GraphStore';

export default function RightPanel() {
  const graph = useGraphStore(s => s.graph);
  const selection = useGraphStore(s => s.selection);
  const updateNodeAttributes = useGraphStore(s => s.updateNodeAttributes);
  const updateEdgeAttributes = useGraphStore(s => s.updateEdgeAttributes);

  const [attrs, setAttrs] = useState<Record<string, any>>({});
  const [isNode, setIsNode] = useState(true);
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    if (selection.nodes.length === 1) {
      const k = selection.nodes[0];
      setIsNode(true);
      setKey(k);
      setAttrs({ ...graph.getNodeAttributes(k) });
    } else if (selection.edges.length === 1) {
      const k = selection.edges[0];
      setIsNode(false);
      setKey(k);
      setAttrs({ ...graph.getEdgeAttributes(k) });
    } else {
      setKey(null);
      setAttrs({});
    }
  }, [selection, graph]);

  function handleChange(attrKey: string, value: string) {
    setAttrs(a => ({ ...a, [attrKey]: value }));
  }

  function handleSave() {
    if (!key) return;
    if (isNode) updateNodeAttributes(key, attrs);
    else updateEdgeAttributes(key, attrs);
  }

  if (!key) return <div className="w-64 p-2 border-l">No selection</div>;

  return (
    <div className="w-64 p-2 border-l overflow-auto">
      <h3 className="font-bold mb-2">{isNode ? 'Node' : 'Edge'}: {key}</h3>
      {isNode && (
        <>
          <div className="mb-1">
            <label className="text-sm block">kind</label>
            <input className="border w-full px-1" value={attrs.kind || ''} onChange={e => handleChange('kind', e.target.value)} />
          </div>
          <div className="mb-1">
            <label className="text-sm block">shape</label>
            <input className="border w-full px-1" value={attrs.shape || ''} onChange={e => handleChange('shape', e.target.value)} />
          </div>
        </>
      )}
      {Object.entries(attrs)
        .filter(([k]) => !['kind', 'shape', 'x', 'y'].includes(k))
        .map(([k, v]) => (
          <div key={k} className="mb-1">
            <label className="text-sm block">{k}</label>
            <input className="border w-full px-1" value={v} onChange={e => handleChange(k, e.target.value)} />
          </div>
        ))}
      <button onClick={handleSave} className="mt-2 px-2 py-1 bg-white border">Save</button>
    </div>
  );
}
