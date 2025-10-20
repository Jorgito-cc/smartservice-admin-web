import { Outlet } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="h-full min-h-[calc(100vh-2rem)] rounded-2xl
                          bg-white/70 dark:bg-slate-900/60
                          border border-indigo-100/70 dark:border-slate-800/70
                          shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
