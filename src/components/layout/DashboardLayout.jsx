import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../../context/AuthContext";

const TITLES = {
  "/internee/dashboard": "Dashboard",
  "/internee/submit-task": "Submit Task",
  "/internee/my-submissions": "My Submissions",
  "/internee/attendance": "Attendance",
  "/internee/profile": "Profile",
  "/admin/dashboard": "Dashboard",
  "/admin/batches": "Batches",
  "/admin/internees": "Internees",
  "/admin/daily-attendance": "Daily Attendance",
  "/admin/submissions": "Submissions",
  "/admin/monthly-reports": "Monthly Reports",
  "/admin/attendance-settings": "Attendance Settings",
  "/admin/activity-log": "Activity Log",
  "/admin/profile": "Profile",
};

function resolveTitle(pathname) {
  if (/^\/admin\/batches\/[^/]+\/domains\/[^/]+$/.test(pathname)) return "Domain Details";
  if (/^\/admin\/batches\/[^/]+$/.test(pathname)) return "Batch Details";
  if (/^\/admin\/internees\/[^/]+$/.test(pathname)) return "Internee Details";
  if (/^\/(?:internee|admin)\/submissions\/[^/]+$/.test(pathname)) return "Submission Details";
  return TITLES[pathname] || "CodeCelix";
}

export default function DashboardLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = resolveTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-steel-50">
      <Sidebar role={user?.role} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Header title={title} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1360px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
