"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import api from "@/lib/api";
import { Save, Eye } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePortfolio } from "@/context/PortfolioContext";
import { PortfolioData } from "@/lib/types";

// Components
import AdminLogin from "./components/AdminLogin";
import PersonalTab from "./components/PersonalTab";
import ExperienceTab from "./components/ExperienceTab";
import ProjectsTab from "./components/ProjectsTab";
import EducationTab from "./components/EducationTab";
import ResumeTab from "./components/ResumeTab";
import ToastNotification from "./components/ToastNotification";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [activeTab, setActiveTab] = useState("personal");
  const { refreshData } = usePortfolio();

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ isOpen: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isOpen: false })), 3000);
  };

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/check");
      if (res.data.authenticated) {
        setIsAuthenticated(true);
      }
    } catch {
      localStorage.removeItem("admin_token");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const res = await api.get(`/portfolio?t=${Date.now()}`);
      setData(res.data);
    } catch {}
  };

  const handleLogin = async (password: string) => {
    try {
      const res = await api.post("/auth/login", { password });
      if (res.data.success) {
        localStorage.setItem("admin_token", res.data.token);
        setIsAuthenticated(true);
        showToast("Welcome back!", "success");
        fetchData();
      }
    } catch (err: unknown) {
      let message = "Invalid password";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      showToast(message, "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setData(null);
  };

  const handleSave = async () => {
    if (!data) return;

    setSaving(true);
    const startTime = Date.now();
    try {
      await api.post("/portfolio", data);
      await refreshData();

      const elapsed = Date.now() - startTime;
      if (elapsed < 600) await new Promise((r) => setTimeout(r, 600 - elapsed));

      showToast("Portfolio updated successfully!", "success");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("admin_token");
        showToast("Session expired. Please login again.", "error");
      } else {
        showToast("Failed to update portfolio", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const updateData = (newData: PortfolioData) => {
    setData(newData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] gap-4 text-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AdminLogin onLogin={handleLogin} />
        <AnimatePresence>
          <ToastNotification
            isOpen={toast.isOpen}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
          />
        </AnimatePresence>
      </>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen text-white p-4 md:p-8 pb-32 relative overflow-hidden bg-[#030712]">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your portfolio content and settings.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-xl glass border border-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-2"
            >
              Logout
            </button>
            <a
              href="/"
              target="_blank"
              className="px-6 py-3 rounded-xl glass border border-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-2"
            >
              <Eye size={18} /> View Site
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-[180px] h-12 rounded-xl bg-primary hover:bg-primary/80 disabled:opacity-70 text-white font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-full md:w-fit mb-12 border border-white/5 overflow-x-auto no-scrollbar">
          {[
            "personal",
            "experience",
            "projects",
            "education",
            "resume",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 rounded-xl capitalize font-medium transition-all shrink-0 text-sm md:text-base",
                activeTab === tab
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-300",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-white/10 min-h-[600px]">
          {activeTab === "personal" && (
            <PersonalTab
              data={data}
              onUpdate={updateData}
              onToast={showToast}
              onLogout={() => {
                handleLogout();
                showToast("Session expired", "error");
              }}
            />
          )}

          {activeTab === "experience" && (
            <ExperienceTab
              data={data}
              onUpdate={updateData}
              onToast={showToast}
            />
          )}

          {activeTab === "projects" && (
            <ProjectsTab
              data={data}
              onUpdate={updateData}
              onToast={showToast}
            />
          )}

          {activeTab === "education" && (
             <EducationTab 
               data={data} 
               onUpdate={updateData} 
               onToast={showToast} 
             />
          )}

          {activeTab === "resume" && (
            <ResumeTab
              data={data}
              onUpdate={updateData}
              onToast={showToast}
              onLogout={() => {
                handleLogout();
                showToast("Session expired", "error");
              }}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        <ToastNotification
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        />
      </AnimatePresence>
    </div>
  );
}
