import React from 'react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      className="fixed inset-0 bg-bg-primary/70 z-50 flex items-center justify-center animate-fade-in p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-card backdrop-blur-lg w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-white/10 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-serif font-bold mb-3">{title}</h2>
        <p className="text-dun mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="w-full py-2.5 text-sm font-semibold rounded-full bg-jet hover:bg-white/10 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-2.5 text-sm font-semibold rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
