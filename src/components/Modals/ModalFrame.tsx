import { createPortal } from "react-dom";

export default function ModalFrame({ children }: { children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl p-4 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}
