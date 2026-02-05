import { Upload } from "lucide-react";
import axios from "axios";
import api from "@/lib/api";
import { PortfolioData } from "@/lib/types";

interface ResumeTabProps {
  data: PortfolioData;
  onUpdate: (data: PortfolioData) => void;
  onToast: (message: string, type: "success" | "error") => void;
  onLogout: () => void;
}

export default function ResumeTab({
  data,
  onUpdate,
  onToast,
  onLogout,
}: ResumeTabProps) {
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    // Delete old resume if exists
    if (data?.resumeUrl) {
      try {
        await api.delete("/upload", { data: { url: data.resumeUrl } });
      } catch (err) {
        console.warn("Failed to delete old resume", err);
      }
    }

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await api.post("/upload", formData);
      if (res.data.success) {
        onUpdate({ ...data, resumeUrl: res.data.url });
        onToast("Resume uploaded!", "success");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        onLogout();
        onToast("Session expired. Please login again.", "error");
      } else {
        onToast("Failed to upload resume", "error");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <h3 className="text-2xl font-bold">Resume Management</h3>
      <div className="p-12 rounded-[2rem] border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
          <Upload className="text-primary" size={32} />
        </div>
        <h4 className="text-xl font-bold mb-2">Upload Resume PDF</h4>
        <p className="text-gray-400 mb-8 max-w-sm">
          This will be accessible to visitors via the download buttons on your
          site.
        </p>
        <label className="cursor-pointer px-8 py-4 rounded-xl bg-primary hover:bg-primary/80 transition-all font-bold shadow-lg shadow-primary/20 text-white">
          Select PDF File
          <input
            type="file"
            accept="application/pdf"
            onChange={handleResumeUpload}
            className="hidden"
          />
        </label>
        {data.resumeUrl && (
          <p className="mt-4 text-sm text-green-400 font-medium">
            Current resume: {data.resumeUrl.split("/").pop()}
          </p>
        )}
      </div>
    </div>
  );
}
