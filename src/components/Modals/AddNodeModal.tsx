import React, { useState } from 'react';
import { useGraphStore } from '../../graph/GraphStore';

export default function AddNodeModal({ onClose }: { onClose: () => void }) {
  const addNode = useGraphStore(s => s.addNode);
  const [label, setLabel] = useState('');
  const [type, setType] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const key = `${type || 'node'}:${Math.random().toString(36).slice(2, 8)}`;
    addNode({ key, label, type });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-4 space-y-2">
        <div>
          <label className="block">Label</label>
          <input className="border px-2" value={label} onChange={e => setLabel(e.target.value)} />
        </div>
        <div>
          <label className="block">Type</label>
          <input className="border px-2" value={type} onChange={e => setType(e.target.value)} />
        </div>
        <button type="submit" className="px-2 py-1 border bg-gray-100">Add</button>
      </form>
    </div>
  );
}
