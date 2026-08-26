import { NavLink } from "react-router-dom";
import { ROLE_ADMIN } from "../../context/AuthContext";
import {
  LayoutDashboard,
  UploadCloud,
  Files,
  CalendarCheck,
  UserCircle,
  Layers,
  Users,
  ClipboardList,
  FileBarChart,
  Settings,
  History,
  X,
} from "lucide-react";
import logo from "../../assets/codecelix-logo.png";

const INTERNEE_NAV = [
  { to: "/internee/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/internee/submit-task", label: "Submit Task", icon: UploadCloud },
  { to: "/internee/my-submissions", label: "My Submissions", icon: Files },
  { to: "/internee/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/internee/profile", label: "Profile", icon: UserCircle },
];

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/batches", label: "Batches", icon: Layers },
  { to: "/admin/internees", label: "Internees", icon: Users },
  { to: "/admin/daily-attendance", label: "Daily Attendance", icon: CalendarCheck },
  { to: "/admin/submissions", label: "Submissions", icon: ClipboardList },
  { to: "/admin/monthly-reports", label: "Monthly Reports", icon: FileBarChart },
  { to: "/admin/attendance-settings", label: "Attendance Settings", icon: Settings },
  { to: "/admin/activity-log", label: "Activity Log", icon: History },
  { to: "/admin/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar({ role, mobileOpen, onCloseMobile }) {
  const items = role === ROLE_ADMIN ? ADMIN_NAV : INTERNEE_NAV;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-steel-900/30 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-steel-200/80 bg-white
          transition-transform duration-200 ease-out lg:static lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className="flex h-[60px] items-center gap-3 border-b border-steel-100 px-5">
          <img src={logo} alt="CodeCelix" className="h-[26px] w-auto" />
          <span className="font-display text-[14px] font-bold tracking-tight text-steel-900">CodeCelix</span>
          <button
            className="ml-auto rounded-lg p-1.5 text-steel-400 transition-colors hover:bg-steel-100 hover:text-steel-600 lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pt-4 pb-3">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-steel-400">
            {role === ROLE_ADMIN ? "Administration" : "Menu"}
          </p>
          <div className="space-y-0.5">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-brand-50 text-brand-700 shadow-[inset_3px_0_0_0_theme('colors.brand.600')]"
                      : "text-steel-500 hover:bg-steel-50 hover:text-steel-800"
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-steel-100 px-5 py-3">
          <p className="text-[11px] font-medium text-steel-500">Internee Portal</p>
          <p className="mt-0.5 text-[10px] text-steel-400">v1.0.0 · Internal use</p>
        </div>
      </aside>
    </>
  );
}
