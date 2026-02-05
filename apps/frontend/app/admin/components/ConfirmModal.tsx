import { motion } from "framer-motion";
import { AlertTriangle, Trash2, X as CloseIcon } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm glass-strong p-8 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-red-500/50 blur-lg" />
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-center mb-2">{title}</h3>
        <p className="text-gray-400 text-center mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> Confirm Delete
          </button>
          <button
            onClick={onCancel}
            className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
          >
            Cancel
          </button>
        </div>
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
        >
          <CloseIcon size={20} />
        </button>
      </motion.div>
    </div>
  );
}
