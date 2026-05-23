import { NavLink } from "react-router-dom";
import { sidebarItems } from "../../constants";

export default function Sidebar() {
  return (
    <aside className="w-full border-r bg-navy p-4 text-white lg:min-h-[calc(100vh-70px)] lg:w-72">
      <div className="mb-6 rounded-md border border-white/10 bg-white/10 p-4">
        <p className="text-xs font-bold uppercase text-white/60">Panel documental</p>
        <p className="mt-1 text-lg font-extrabold">DEPDICC Iquitos</p>
      </div>
      <nav className="grid gap-2">
        {sidebarItems.map(({ key, label, href, icon: Icon }) => (
          <NavLink
            key={key}
            to={href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold transition ${
                isActive ? "bg-white text-police" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
