import ModalFrame from './ModalFrame';

export default function ConfirmDeleteModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <ModalFrame>
      <div className="space-y-2">
        <p>Delete selected items?</p>
        <div className="mt-2 flex gap-2">
          <button onClick={onConfirm} className="px-2 py-1 border bg-red-100">Delete</button>
          <button onClick={onClose} className="px-2 py-1 border bg-gray-100">Cancel</button>
        </div>
      </div>
    </ModalFrame>
  );
}
