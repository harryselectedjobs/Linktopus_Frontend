import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import CalendarBooking from "./pages/CalendarBooking";
import Dashboard from "./pages/Dashboard";
import PostAssistant from "./pages/PostAssistant";
import ProjectAutomation from "./pages/ProjectAutomation";
import ProjectAutomationV2 from "./pages/ProjectAutomationV2";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ---------- Auth ---------- */}
        <Route path="/login" element={<Login />} />

        {/* ---------- Public booking link (shared with external users) ---------- */}
        <Route path="/calendar-booking" element={<CalendarBooking />} />

        {/* ---------- Protected app ---------- */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/schedule"
            element={
              <ComingSoon
                title="Content Calendar"
                description="A visual scheduling grid for every upcoming post is on its way. For now, plan what to publish next from the AI Post Assistant."
              />
            }
          />
          <Route
            path="/drafts"
            element={
              <ComingSoon
                title="Drafts"
                description="Saved drafts will land here so you can pick up an unfinished post right where you left it."
              />
            }
          />
        </Route>

        {/* ---------- Focused flows (own header, no main nav) ---------- */}
        <Route
          path="/post-assistant"
          element={
            <ProtectedRoute>
              <PostAssistant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project-automation"
          element={
            <ProtectedRoute>
              <ProjectAutomation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project-automation-v2"
          element={
            <ProtectedRoute>
              <ProjectAutomationV2 />
            </ProtectedRoute>
          }
        />

        {/* ---------- Fallback ---------- */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AuthProvider>
  );
}
