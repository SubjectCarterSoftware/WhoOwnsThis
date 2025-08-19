import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGraphStore } from '../../graph/GraphStore';

export default function AddEdgeModal({ onClose }: { onClose: () => void }) {
  const addEdge = useGraphStore(s => s.addEdge);
  const graph = useGraphStore(s => s.graph);
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [type, setType] = useState('');

  const nodes = graph.nodes();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addEdge({ source, target, attributes: { type } });
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center pointer-events-auto">
      <form onSubmit={handleSubmit} className="bg-white p-4 space-y-2">
        <div>
          <label className="block">Source</label>
          <select className="border px-2" value={source} onChange={e => setSource(e.target.value)}>
            <option value="">--</option>
            {nodes.map(n => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Target</label>
          <select className="border px-2" value={target} onChange={e => setTarget(e.target.value)}>
            <option value="">--</option>
            {nodes.map(n => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Type</label>
          <input className="border px-2" value={type} onChange={e => setType(e.target.value)} />
        </div>
        <button type="submit" className="px-2 py-1 border bg-gray-100">Add</button>
      </form>
    </div>,
    document.body
  );
}
