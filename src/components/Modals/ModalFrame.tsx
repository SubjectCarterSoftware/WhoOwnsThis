import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export default function ModalFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
      aria-modal="true" role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-xl p-4 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
