import { useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import axios from "axios";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { PortfolioData } from "@/lib/types";
import ConfirmModal from "./ConfirmModal";

interface PersonalTabProps {
  data: PortfolioData;
  onUpdate: (data: PortfolioData) => void;
  onToast: (message: string, type: "success" | "error") => void;
  onLogout: () => void; // needed for handling 401
}

export default function PersonalTab({
  data,
  onUpdate,
  onToast,
  onLogout,
}: PersonalTabProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    // Delete old image if exists
    if (data.personalInfo.profileImage) {
      try {
        await api.delete("/upload", { data: { url: data.personalInfo.profileImage } });
      } catch (err) {
         console.warn("Failed to delete old image", err);
      }
    }

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await api.post("/upload", formData);
      if (res.data.success) {
        const newUrl = res.data.url;
        onUpdate({
          ...data,
          personalInfo: { ...data.personalInfo, profileImage: newUrl },
        });
        onToast("Photo uploaded!", "success");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        onLogout();
        onToast("Session expired. Please login again.", "error");
      } else {
        onToast("Failed to upload image", "error");
      }
    }
  };

  const handleDeleteImage = async () => {
    try {
      if (data.personalInfo.profileImage) {
        await api.delete("/upload", {
          data: { url: data.personalInfo.profileImage },
        });
      }
    } catch (err) {
      console.error("Failed to delete image from cloud", err);
    }

    onUpdate({
      ...data,
      personalInfo: { ...data.personalInfo, profileImage: "" },
    });
    setDeleteModalOpen(false);
    onToast("Image removed", "success");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Full Name
          </label>
          <input
            type="text"
            value={data.personalInfo.name}
            onChange={(e) =>
              onUpdate({
                ...data,
                personalInfo: { ...data.personalInfo, name: e.target.value },
              })
            }
            className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all"
          />
        </div>
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Professional Role
          </label>
          <input
            type="text"
            value={data.personalInfo.role}
            onChange={(e) =>
              onUpdate({
                ...data,
                personalInfo: { ...data.personalInfo, role: e.target.value },
              })
            }
            className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Email
          </label>
          <input
            type="email"
            value={data.personalInfo.email}
            onChange={(e) =>
              onUpdate({
                ...data,
                personalInfo: { ...data.personalInfo, email: e.target.value },
              })
            }
            className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all"
          />
        </div>
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Location
          </label>
          <input
            type="text"
            value={data.personalInfo.location || ""}
            onChange={(e) =>
              onUpdate({
                ...data,
                personalInfo: {
                  ...data.personalInfo,
                  location: e.target.value,
                },
              })
            }
            className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            GitHub URL
          </label>
          <input
            type="text"
            value={data.personalInfo.socials.github}
            onChange={(e) =>
              onUpdate({
                ...data,
                personalInfo: {
                  ...data.personalInfo,
                  socials: {
                    ...data.personalInfo.socials,
                    github: e.target.value,
                  },
                },
              })
            }
            className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all"
          />
        </div>
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            LinkedIn URL
          </label>
          <input
            type="text"
            value={data.personalInfo.socials.linkedin || ""}
            onChange={(e) =>
              onUpdate({
                ...data,
                personalInfo: {
                  ...data.personalInfo,
                  socials: {
                    ...data.personalInfo.socials,
                    linkedin: e.target.value,
                  },
                },
              })
            }
            className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Profile Image
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
          <div className="relative group w-32 h-32">
            <div className="w-full h-full rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-4xl font-black text-white overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
              {data.personalInfo.profileImage ? (
                <img
                  src={getImageUrl(data.personalInfo.profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                data.personalInfo.name.charAt(0)
              )}
            </div>
            {data.personalInfo.profileImage && (
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="absolute -top-1 -right-1 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                title="Remove Image"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              <label className="cursor-pointer px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-sm font-bold inline-flex items-center gap-2 border border-white/5 text-white">
                <Upload size={16} /> Update Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {data.personalInfo.profileImage && (
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-sm font-bold inline-flex items-center gap-2 border border-red-500/20"
                >
                  <Trash2 size={16} /> Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Recommended: 1:1 ratio, JPG or PNG up to 2MB.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Summary / Hook
        </label>
        <textarea
          value={data.personalInfo.summary}
          onChange={(e) =>
            onUpdate({
              ...data,
              personalInfo: {
                ...data.personalInfo,
                summary: e.target.value,
              },
            })
          }
          rows={3}
          className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all resize-none shadow-inner"
        />
      </div>

      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          About Me (Full Story)
        </label>
        <textarea
          value={data.personalInfo.about}
          onChange={(e) =>
            onUpdate({
              ...data,
              personalInfo: {
                ...data.personalInfo,
                about: e.target.value,
              },
            })
          }
          rows={8}
          className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all resize-none font-mono text-sm leading-relaxed shadow-inner"
        />
      </div>
      
      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="Remove Profile Photo?"
        message="This will delete your current profile image from the site. This action cannot be undone."
        onConfirm={handleDeleteImage}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
