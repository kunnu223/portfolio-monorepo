import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PortfolioData, Project } from "@/lib/types";
import ConfirmModal from "./ConfirmModal";

interface ProjectsTabProps {
  data: PortfolioData;
  onUpdate: (data: PortfolioData) => void;
  onToast: (message: string, type: "success" | "error") => void;
}

export default function ProjectsTab({
  data,
  onUpdate,
  onToast,
}: ProjectsTabProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAddProject = () => {
    const newProj: Project = {
      _id: Date.now().toString(),
      title: "New Project",
      description: "Project description...",
      technologies: ["React"],
      link: "#",
    };
    onUpdate({ ...data, projects: [newProj, ...data.projects] });
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    const newProj = data.projects.filter((_, i) => i !== deleteId);
    onUpdate({ ...data, projects: newProj });
    setDeleteId(null);
    onToast("Project deleted", "success");
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const newProj = [...data.projects];
    (newProj[index] as any)[field] = value;
    onUpdate({ ...data, projects: newProj });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold">Featured Projects</h3>
        <button
          onClick={handleAddProject}
          className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold flex items-center gap-2 text-white border border-white/5"
        >
          <Plus size={18} /> Add Project
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {data.projects.map((proj, index) => (
          <div
            key={proj._id || index}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6"
          >
            <div className="flex justify-between items-start gap-4">
              <input
                value={proj.title}
                onChange={(e) => updateProject(index, "title", e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 font-bold text-white"
                placeholder="Project Title"
              />
              <button
                onClick={() => setDeleteId(index)}
                className="p-3 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <textarea
              value={proj.description}
              onChange={(e) => updateProject(index, "description", e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 resize-none h-24 text-sm text-gray-300"
              placeholder="Project Description"
            />
            <input
              value={proj.technologies.join(", ")}
              onChange={(e) =>
                updateProject(
                  index,
                  "technologies",
                  e.target.value.split(",").map((t) => t.trim()),
                )
              }
              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
              placeholder="Technologies (comma separated)"
            />
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete Project?"
        message="Are you sure you want to remove this project?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
