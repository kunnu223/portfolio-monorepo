import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PortfolioData, Experience } from "@/lib/types";
import ConfirmModal from "./ConfirmModal";

interface ExperienceTabProps {
  data: PortfolioData;
  onUpdate: (data: PortfolioData) => void;
  onToast: (message: string, type: "success" | "error") => void;
}

export default function ExperienceTab({
  data,
  onUpdate,
  onToast,
}: ExperienceTabProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAddRole = () => {
    const newExp: Experience = {
      _id: Date.now().toString(),
      company: "New Company",
      role: "Software Engineer",
      period: "2024 - Present",
      description: ["Enter description here..."],
    };
    onUpdate({ ...data, experiences: [newExp, ...data.experiences] });
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    const newExp = data.experiences.filter((_, i) => i !== deleteId);
    onUpdate({ ...data, experiences: newExp });
    setDeleteId(null);
    onToast("Experience deleted", "success");
  };

  const updateExperience = <K extends keyof Experience>(
    index: number,
    field: K,
    value: Experience[K]
  ) => {
    const newExp = [...data.experiences];
    newExp[index] = { ...newExp[index], [field]: value };
    onUpdate({ ...data, experiences: newExp });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold">Work Experiences</h3>
        <button
          onClick={handleAddRole}
          className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold flex items-center gap-2 text-white border border-white/5"
        >
          <Plus size={18} /> Add Role
        </button>
      </div>

      <div className="space-y-6">
        {data.experiences.map((exp, index) => (
          <div
            key={exp._id || index}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="grid md:grid-cols-2 gap-6 flex-1">
                <input
                  value={exp.company}
                  onChange={(e) => updateExperience(index, "company", e.target.value)}
                  className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 font-bold text-white"
                  placeholder="Company"
                />
                <input
                  value={exp.role}
                  onChange={(e) => updateExperience(index, "role", e.target.value)}
                  className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  placeholder="Role"
                />
              </div>
              <button
                onClick={() => setDeleteId(index)}
                className="p-3 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <textarea
              value={exp.description.join("\n")}
              onChange={(e) => updateExperience(index, "description", e.target.value.split("\n"))}
              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 resize-none h-24 text-sm text-gray-300"
              placeholder="Description (one per line)"
            />
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete Experience?"
        message="Are you sure you want to remove this role?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
