import Button from './Button';
import Modal from './Modal';

// Confirmación reutilizable (reemplaza a window.confirm).
function ConfirmDialog({
  open = false,
  title = 'Confirmar acción',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={loading ? undefined : onCancel}
      footer={
        <>
          <Button
            variant="outline"
            className="text-xs"
            disabled={loading}
            onClick={onCancel}
            autoFocus
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            className="text-xs"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}

export default ConfirmDialog;
