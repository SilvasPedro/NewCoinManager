import { NavLink } from "react-router-dom";
import {
  Receipt,
  Repeat,
  LayoutDashboard,
  Target,
  Users,
} from "lucide-react";

export default function HorizontalNav() {
  // 5 Itens de Navegação com a Visão Geral exatamente no MEIO (posição 3)
  const navItems = [
    {
      name: "Lançamentos",
      path: "/lancamentos",
      icon: Receipt,
    },
    {
      name: "Recorrências",
      path: "/recorrencias",
      icon: Repeat,
    },
    {
      name: "Visão Geral",
      path: "/",
      icon: LayoutDashboard,
      isCenter: true, // Item central destacado
    },
    {
      name: "Metas",
      path: "/metas",
      icon: Target,
    },
    {
      name: "Família",
      path: "/familia",
      icon: Users,
    },
  ];

  return (
    <nav
      id="bottom-horizontal-navigation"
      aria-label="Navegação móvel e tablet"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl px-2 py-1.5 safe-area-pb"
    >
      <div className="max-w-md md:max-w-xl mx-auto flex items-end justify-around relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <NavLink
                key={item.name}
                to={item.path}
                id="nav-horizontal-visao-geral"
                className="flex flex-col items-center justify-center -translate-y-3 transition-transform active:scale-95 group"
              >
                {({ isActive }) => (
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all border-2 ${
                        isActive
                          ? "bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-500 text-white border-white/60 shadow-blue-500/40 ring-4 ring-slate-950/80 scale-105"
                          : "bg-gradient-to-tr from-blue-950 via-indigo-900 to-blue-800 text-slate-200 border-white/20 shadow-black/40 ring-4 ring-slate-950/80 hover:text-white"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold mt-1 tracking-tight transition-colors ${
                        isActive ? "text-emerald-400" : "text-slate-300"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              id={`nav-horizontal-${item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-slate-200 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className="w-5 h-5 mb-0.5" />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] leading-tight truncate mt-0.5">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
