import { useEffect, useId } from 'react';

// Ventana modal compuesta por children (contenido) y footer (acciones).
function Modal({ open = false, title, onClose, footer, children }) {
  const titleId = useId();

  useEffect(() => {
    if (!open || !onClose) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-6"
      >
        {title && (
          <h2 id={titleId} className="text-base font-bold text-med-primary-900">
            {title}
          </h2>
        )}
        <div className="mt-2 text-sm text-slate-600">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
