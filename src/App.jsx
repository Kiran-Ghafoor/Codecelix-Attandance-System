import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BatchesProvider } from "./context/BatchesContext";
import { InterneesProvider } from "./context/InterneesContext";
import { AdminRoute, InterneeRoute } from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";

import InterneeDashboard from "./pages/internee/Dashboard";
import SubmitTask from "./pages/internee/SubmitTask";
import MySubmissions from "./pages/internee/MySubmissions";
import InterneeSubmissionDetails from "./pages/internee/SubmissionDetails";
import Attendance from "./pages/internee/Attendance";
import InterneeProfile from "./pages/internee/Profile";

import AdminDashboard from "./pages/admin/Dashboard";
import Batches from "./pages/admin/Batches";
import BatchDetails from "./pages/admin/BatchDetails";
import DomainDetails from "./pages/admin/DomainDetails";
import Internees from "./pages/admin/Internees";
import InterneeDetails from "./pages/admin/InterneeDetails";
import DailyAttendance from "./pages/admin/DailyAttendance";
import Submissions from "./pages/admin/Submissions";
import AdminSubmissionDetails from "./pages/admin/SubmissionDetails";
import MonthlyReports from "./pages/admin/MonthlyReports";
import AttendanceSettings from "./pages/admin/AttendanceSettings";
import ActivityLog from "./pages/admin/ActivityLog";
import AdminProfile from "./pages/admin/Profile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/internee"
            element={
              <InterneeRoute>
                <DashboardLayout />
              </InterneeRoute>
            }
          >
            <Route path="dashboard" element={<InterneeDashboard />} />
            <Route path="submit-task" element={<SubmitTask />} />
            <Route path="my-submissions" element={<MySubmissions />} />
            <Route path="submissions/:submissionId" element={<InterneeSubmissionDetails />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="profile" element={<InterneeProfile />} />
          </Route>

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <BatchesProvider>
                    <InterneesProvider>
                      <DashboardLayout />
                    </InterneesProvider>
                  </BatchesProvider>
                </AdminRoute>
              }
            >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="batches" element={<Batches />} />
            <Route path="batches/:batchId" element={<BatchDetails />} />
            <Route path="batches/:batchId/domains/:domainId" element={<DomainDetails />} />
            <Route path="internees" element={<Internees />} />
            <Route path="internees/:interneeId" element={<InterneeDetails />} />
            <Route path="daily-attendance" element={<DailyAttendance />} />
            <Route path="submissions" element={<Submissions />} />
            <Route path="submissions/:submissionId" element={<AdminSubmissionDetails />} />
            <Route path="monthly-reports" element={<MonthlyReports />} />
            <Route path="attendance-settings" element={<AttendanceSettings />} />
            <Route path="activity-log" element={<ActivityLog />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
