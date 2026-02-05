import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path: string | undefined) {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
    "http://localhost:5000";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${backendUrl}${cleanPath}`;
}
