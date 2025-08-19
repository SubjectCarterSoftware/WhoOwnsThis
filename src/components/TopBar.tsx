import React, { useState } from 'react';
import { useGraphStore } from '../graph/GraphStore';
import { openFile, saveFile, normalizeGraph } from '../graph/persistence';
import AddNodeModal from './Modals/AddNodeModal';
import AddEdgeModal from './Modals/AddEdgeModal';
import ConfirmDeleteModal from './Modals/ConfirmDeleteModal';

export default function TopBar() {
  const loadGraphFromJSON = useGraphStore(s => s.loadGraphFromJSON);
  const exportGraphJSON = useGraphStore(s => s.exportGraphJSON);
  const runLayout = useGraphStore(s => s.runLayout);
  const stopLayout = useGraphStore(s => s.stopLayout);
  const undo = useGraphStore(s => s.undo);
  const redo = useGraphStore(s => s.redo);
  const deleteSelection = useGraphStore(s => s.deleteSelection);
  const selectNodes = useGraphStore(s => s.selectNodes);
  const graph = useGraphStore(s => s.graph);

  const [layoutRunning, setLayoutRunning] = useState<null | 'forceatlas2'>(null);
  const [search, setSearch] = useState('');
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showEdgeModal, setShowEdgeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function handleOpen() {
    const raw = await openFile();
    if (raw) {
      const json = normalizeGraph(raw);
      loadGraphFromJSON(json);
    }
  }

  async function handleSave() {
    await saveFile(exportGraphJSON());
  }

  function handleLayout(name: 'forceatlas2' | 'circular') {
    if (name === 'forceatlas2') {
      runLayout('forceatlas2');
      setLayoutRunning('forceatlas2');
      setTimeout(() => {
        stopLayout();
        setLayoutRunning(null);
      }, 10000);
    } else {
      runLayout('circular');
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = search.toLowerCase();
    const node = graph.nodes().find(key => {
      const attrs = graph.getNodeAttributes(key);
      return (
        key.toLowerCase().includes(query) ||
        (attrs.label && String(attrs.label).toLowerCase().includes(query))
      );
    });
    if (node) selectNodes([node]);
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100">
      <button onClick={handleOpen} className="px-2 py-1 bg-white border">Open</button>
      <button onClick={handleSave} className="px-2 py-1 bg-white border">Save</button>
      <button onClick={() => handleLayout('forceatlas2')} className="px-2 py-1 bg-white border">FA2</button>
      <button onClick={() => handleLayout('circular')} className="px-2 py-1 bg-white border">Circular</button>
      <button onClick={() => setShowNodeModal(true)} className="px-2 py-1 bg-white border">Add Node</button>
      <button onClick={() => setShowEdgeModal(true)} className="px-2 py-1 bg-white border">Add Edge</button>
      <button onClick={() => setShowDeleteModal(true)} className="px-2 py-1 bg-white border">Delete</button>
      <button onClick={undo} className="px-2 py-1 bg-white border">Undo</button>
      <button onClick={redo} className="px-2 py-1 bg-white border">Redo</button>
      <form onSubmit={handleSearch} className="ml-auto">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="border px-2 py-1" />
      </form>
      {showNodeModal && <AddNodeModal onClose={() => setShowNodeModal(false)} />}
      {showEdgeModal && <AddEdgeModal onClose={() => setShowEdgeModal(false)} />}
      {showDeleteModal && (
        <ConfirmDeleteModal
          onConfirm={() => {
            deleteSelection();
            setShowDeleteModal(false);
          }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
