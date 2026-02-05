import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface AdminLoginProps {
  onLogin: (password: string) => Promise<void>;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] p-6 relative overflow-hidden text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[60%] h-[60%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass p-10 rounded-[2.5rem] border border-white/10 relative z-10"
      >
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Lock className="text-primary" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Admin Panel</h1>
        <p className="text-gray-400 text-center mb-8">
          Please enter your password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all text-center text-lg text-white"
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-primary hover:bg-primary/80 text-white font-bold transition-all shadow-lg shadow-primary/20"
          >
            Unlock Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  );
}
