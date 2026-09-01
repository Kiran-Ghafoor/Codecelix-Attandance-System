import { useState } from "react";
import { Menu, LogOut, ChevronDown, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header({ title, onOpenMobile }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-steel-200/60 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-1.5 text-steel-500 transition-colors hover:bg-steel-100 hover:text-steel-700 lg:hidden"
          onClick={onOpenMobile}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-[15px] font-semibold text-steel-900">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-steel-400 transition-colors hover:bg-steel-100 hover:text-steel-600 sm:flex"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-steel-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold tracking-wide text-white shadow-xs shadow-brand-600/20">
              {user?.avatarInitials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-[13px] font-medium leading-tight text-steel-800">{user?.name}</p>
              <p className="text-[11px] leading-tight text-steel-400 capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-steel-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1.5 w-44 rounded-xl border border-steel-200/80 bg-white py-1 shadow-popover animate-fade-in">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
