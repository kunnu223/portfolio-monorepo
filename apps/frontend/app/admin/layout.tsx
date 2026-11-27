import { PortfolioProvider } from "@/context/PortfolioContext";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PortfolioProvider>{children}</PortfolioProvider>;
}
