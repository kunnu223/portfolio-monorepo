import { motion } from "framer-motion";
import { CheckCircle, XCircle, X as CloseIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  isOpen: boolean;
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function ToastNotification({
  isOpen,
  message,
  type,
  onClose,
}: ToastProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] min-w-[300px]"
    >
      <div
        className={cn(
          "glass-strong px-6 py-4 rounded-2xl border flex items-center gap-4 shadow-2xl",
          type === "success" ? "border-green-500/20" : "border-red-500/20",
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            type === "success"
              ? "bg-green-500/10 text-green-500"
              : "bg-red-500/10 text-red-500",
          )}
        >
          {type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
        </div>
        <p className="text-white font-medium pr-4">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto text-gray-500 hover:text-white transition-colors"
        >
          <CloseIcon size={18} />
        </button>
      </div>
    </motion.div>
  );
}
