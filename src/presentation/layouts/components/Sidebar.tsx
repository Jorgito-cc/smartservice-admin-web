import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaCog,
} from "react-icons/fa";
import {
  BRAND,
  sections,
  soporteLink,
  ManualLink,
  ManualteoricoLink,
} from "../components/SidebarData";
/* import { DarkToggle } from "../../products/ui/DarkToggle";
import { useAuth } from "../../../context/AuthContext"; */
const cn = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [openKey, setOpenKey] = useState<string | null>("usuario");
  const location = useLocation();

  useEffect(() => {
    const found = sections.find((s) =>
      s.items.some((i) => location.pathname.startsWith(i.to))
    );
    if (found) setOpenKey(found.key);
  }, [location.pathname]);

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    /* logout();
       navigate("/login"); */
  }; // ✅ <- cierre correcto

  return (
    <aside
      className={cn(
        "min-h-screen shrink-0 transition-all duration-300",
        isOpen ? "w-72" : "w-20",
        "relative",
        "bg-gradient-to-b from-indigo-50/60 via-white/50 to-purple-50/50",
        "dark:from-slate-900/70 dark:via-slate-900/60 dark:to-slate-900/70",
        "backdrop-blur-xl border-r",
        "border-indigo-100/70 dark:border-slate-800/70",
        "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)]"
      )}
    >
      {/* botón plegar */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "absolute -right-3 top-5 z-10 h-8 w-8 rounded-full",
          "bg-white/70 dark:bg-slate-800/80",
          "border border-indigo-100/70 dark:border-slate-700",
          "shadow hover:scale-105 transition flex items-center justify-center"
        )}
        aria-label="toggle sidebar"
      >
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      {/* Header brand */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <h1 className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400">
          {isOpen ? BRAND : "🛒"}
        </h1>
      </div>

      {/* Menú */}
      <div className="flex-1 px-2 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300/40 dark:scrollbar-thumb-slate-700/60">
        {sections.map((sec) => {
          const expanded = openKey === sec.key;
          return (
            <div key={sec.key} className="mb-2">
              <button
                onClick={() => setOpenKey(expanded ? null : sec.key)}
                className={cn(
                  "w-full flex items-center justify-between rounded-xl px-3 py-2",
                  "bg-white/70 dark:bg-slate-800/70",
                  "hover:bg-white/90 dark:hover:bg-slate-800",
                  "border border-indigo-100/70 dark:border-slate-700",
                  "transition"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-lg">{sec.icon}</span>
                  {isOpen && sec.title}
                </span>
                {isOpen && (
                  <FaChevronDown
                    className={cn(
                      "transition-transform",
                      expanded && "rotate-180"
                    )}
                  />
                )}
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-in-out",
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <ul className={cn("mt-2 pl-2 space-y-1", !isOpen && "pl-0")}>
                    {sec.items.map((it) => (
                      <li key={it.to}>
                        <NavLink
                          to={it.to}
                          className={({ isActive }) =>
                            cn(
                              "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                              "border border-transparent transition",
                              "hover:bg-indigo-50/70 dark:hover:bg-slate-800/60",
                              isActive &&
                                "bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 border-indigo-200 dark:border-slate-700",
                              isActive &&
                                "text-indigo-700 dark:text-indigo-300 font-semibold"
                            )
                          }
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 group-hover:bg-indigo-400 dark:bg-slate-600 dark:group-hover:bg-slate-500" />
                          <span className={cn(!isOpen && "sr-only")}>
                            {it.label}
                          </span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}

        {/* Soporte */}
        <div className="mt-4">
          <NavLink
            to={soporteLink.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-xl px-3 py-2",
                "bg-white/70 dark:bg-slate-800/70",
                "border border-indigo-100/70 dark:border-slate-700",
                "hover:bg-white/90 dark:hover:bg-slate-800",
                "transition",
                isActive &&
                  "ring-1 ring-inset ring-fuchsia-300/50 dark:ring-fuchsia-700/40"
              )
            }
          >
            <FaCog className="text-lg" />
            <span className={cn(!isOpen && "sr-only")}>
              {soporteLink.label}
            </span>
          </NavLink>
        </div>
        {/*manual  */}
        <div className="mt-4">
          <NavLink
            to={ManualLink.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-xl px-3 py-2",
                "bg-white/70 dark:bg-slate-800/70",
                "border border-indigo-100/70 dark:border-slate-700",
                "hover:bg-white/90 dark:hover:bg-slate-800",
                "transition",
                isActive &&
                  "ring-1 ring-inset ring-fuchsia-300/50 dark:ring-fuchsia-700/40"
              )
            }
          >
            <FaCog className="text-lg" />
            <span className={cn(!isOpen && "sr-only")}>{ManualLink.label}</span>
          </NavLink>
        </div>
        {/* manual teorico  */}
        <div className="mt-4">
          <NavLink
            to={ManualteoricoLink.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-xl px-3 py-2",
                "bg-white/70 dark:bg-slate-800/70",
                "border border-indigo-100/70 dark:border-slate-700",
                "hover:bg-white/90 dark:hover:bg-slate-800",
                "transition",
                isActive &&
                  "ring-1 ring-inset ring-fuchsia-300/50 dark:ring-fuchsia-700/40"
              )
            }
          >
            <FaCog className="text-lg" />
            <span className={cn(!isOpen && "sr-only")}>
              {ManualteoricoLink.label}
            </span>
          </NavLink>
        </div>
        {/* Dark mode con componente global */}
        <div className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-indigo-100/70 dark:border-slate-700">
          <span className={cn("text-sm", !isOpen && "sr-only")}>Dark mode</span>
        {/*   <DarkToggle /> */} 
        </div>

        {/* boton de cerrar seccion  */}
        <button
          onClick={handleLogout}
          className={cn(
            "mt-3 w-full rounded-xl px-3 py-2 text-left",
            "bg-white/70 dark:bg-slate-800/70",
            "border border-indigo-100/70 dark:border-slate-700",
            "hover:bg-white/90 dark:hover:bg-slate-800",
            "transition text-sm font-medium text-red-600 dark:text-red-400"
          )}
          title="Cerrar sesión"
        >
          {isOpen ? "Cerrar sesión" : "⎋"}
        </button>
        {/* ir a shopealo */}
        <Link
          to="/" // The link to the public part of the app
          className={cn(
            "mt-3 w-full rounded-xl px-3 py-2 text-left",
            "bg-white/70 dark:bg-slate-800/70",
            "border border-indigo-100/70 dark:border-slate-700",
            "hover:bg-white/90 dark:hover:bg-slate-800",
            "transition text-sm font-medium text-red-600 dark:text-red-400"
          )}
        >
          Ir a Shopealo
        </Link>
      </div>
    </aside>
  );
}
