import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PortfolioData, EducationItem } from "@/lib/types";
import ConfirmModal from "./ConfirmModal";

interface EducationTabProps {
  data: PortfolioData;
  onUpdate: (data: PortfolioData) => void;
  onToast: (message: string, type: "success" | "error") => void;
}

export default function EducationTab({
  data,
  onUpdate,
  onToast,
}: EducationTabProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      _id: Date.now().toString(),
      institution: "University Name",
      degree: "Degree / Course",
      period: "20XX - 20XX",
    };
    onUpdate({ ...data, education: [...data.education, newEdu] });
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    const newEdu = data.education.filter((_, i) => i !== deleteId);
    onUpdate({ ...data, education: newEdu });
    setDeleteId(null);
    onToast("Education deleted", "success");
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: any) => {
    const newEdu = [...data.education];
    (newEdu[index] as any)[field] = value;
    onUpdate({ ...data, education: newEdu });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold">Education</h3>
        <button
          onClick={handleAddEducation}
          className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold flex items-center gap-2 text-white border border-white/5"
        >
          <Plus size={18} /> Add Education
        </button>
      </div>

      <div className="space-y-6">
        {data.education.map((edu, index) => (
          <div
            key={edu._id || index}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 pb-10"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="grid md:grid-cols-2 gap-6 flex-1">
                <input
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, "institution", e.target.value)}
                  className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 font-bold text-white"
                  placeholder="Institution"
                />
                <input
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, "degree", e.target.value)}
                  className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  placeholder="Degree"
                />
              </div>
              <button
                onClick={() => setDeleteId(index)}
                className="p-3 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete Education?"
        message="Are you sure you want to remove this education?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
