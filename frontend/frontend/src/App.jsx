import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import LessonPage from "./pages/LessonPage";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateCoursePage from "./pages/CreateCoursePage";
import AddLessonPage from "./pages/AddLessonPage";
import QuizPage from "./pages/QuizPage";
import PrivateRoute from "./routes/PrivateRoute";


// ── Redirects to the correct dashboard based on role ──────────────
function DashboardRouter() {
  const role = localStorage.getItem("role");
  if (role === "admin")      return <Navigate to="/dashboard/admin"      replace />;
  if (role === "instructor") return <Navigate to="/dashboard/instructor" replace />;
  return                            <Navigate to="/dashboard/student"    replace />;
}


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ───────────────────────────────────── */}
        <Route path="/"            element={<HomePage />} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/register"    element={<RegisterPage />} />
        <Route path="/courses"     element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />

        {/* ── Dashboard smart redirect ─────────────────────────── */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardRouter />
          </PrivateRoute>
        } />

        {/* ── Student dashboard ────────────────────────────────── */}
        <Route path="/dashboard/student" element={
          <PrivateRoute allowedRoles={["student"]}>
            <DashboardPage />
          </PrivateRoute>
        } />

        {/* ── Quiz page ──────────────────────────────────────────────── */}
        <Route path="/quizzes" element={
          <PrivateRoute>
            <QuizPage />
          </PrivateRoute>
        } />

        {/* ── Lesson player ────────────────────────────────────── */}
        <Route path="/course/:courseId/learn" element={
          <PrivateRoute>
            <LessonPage />
          </PrivateRoute>
        } />

        {/* ── Instructor routes ─────────────────────────────────── */}
        <Route path="/dashboard/instructor" element={
          <PrivateRoute allowedRoles={["instructor"]}>
            <InstructorDashboard />
          </PrivateRoute>
        } />
        <Route path="/instructor/create-course" element={
          <PrivateRoute allowedRoles={["instructor"]}>
            <CreateCoursePage />
          </PrivateRoute>
        } />
        <Route path="/instructor/add-lesson/:courseId" element={
          <PrivateRoute allowedRoles={["instructor"]}>
            <AddLessonPage />
          </PrivateRoute>
        } />

        {/* ── Admin routes ──────────────────────────────────────── */}
        <Route path="/dashboard/admin" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        } />

        {/* ── 404 fallback ──────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

