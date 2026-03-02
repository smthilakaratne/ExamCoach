import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/common/Layout";  // <-- new global layout
import ProtectedRoute from "./components/common/ProtectedRoute";

import Home from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";

import StudentDashboard from "./pages/student/StudentDashboard";
import MyFeedback from "./pages/student/MyFeedback";
import BrowseSubjects from "./pages/student/BrowseSubjects";
import ContentCategories from "./pages/student/ContentCategories";
import ContentList from "./pages/student/ContentList";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageFeedback from "./pages/admin/ManageFeedback";
import ExamLevels from "./pages/admin/ExamLevels";
import Subjects from "./pages/admin/Subjects";
import ContentManagement from "./pages/admin/ContentManagement";

import Forum from "./pages/forum";
import MockExam from "./pages/mockExam/MockExam";
import ExamSummary from "./pages/mockExam/MockLevels";
import ExamAnswers from "./pages/mockExam/Answers";
import ExamResult from "./pages/mockExam/MockResult";
import AddQuestions from "./pages/mockExam/AddQuestions"

function App() {
  return (
    <Routes>
      {/* All routes are wrapped in the Layout which contains the Navbar */}
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Community */}
        <Route path="community">
          <Route path="forum" element={<Forum.Layout />}>
          <Route path="forum" element={<Forum.Layout />}>
            <Route index element={<Forum.Forum />} />
            <Route path="tags" element={<Forum.Tags />} />
            <Route path="new" element={<Forum.CreateUpdateThread />} />
            <Route path=":id">
              <Route index element={<Forum.Thread />} />
              <Route path="edit" element={<Forum.CreateUpdateThread />} />
            </Route>
            <Route path="new" element={<Forum.CreateUpdateThread />} />
            <Route path=":id">
              <Route index element={<Forum.Thread />} />
              <Route path="edit" element={<Forum.CreateUpdateThread />} />
            </Route>
          </Route>
        </Route>

        {/* Student Browse Routes */}
        {/* Student Browse Routes */}
        <Route path="browse">
          <Route path=":levelId" element={<BrowseSubjects />} />
          <Route
            path=":levelId/subject/:subjectId"
            element={<ContentCategories />}
          />
          <Route
            path=":levelId/subject/:subjectId/content/:contentType"
            element={<ContentList />}
          />
          <Route
            path=":levelId/subject/:subjectId"
            element={<ContentCategories />}
          />
          <Route
            path=":levelId/subject/:subjectId/content/:contentType"
            element={<ContentList />}
          />
        </Route>

        {/* Mock Exam */}
        <Route path="mock-exam">
          <Route path="exam" element={<MockExam />} />
          <Route path="exam-summary" element={<ExamSummary />} />
          <Route path="exam-answers" element={<ExamAnswers />} />
          <Route path="exam-result" element={<ExamResult />} />
          <Route path="add-questions" element={<AddQuestions />} />
          <Route path="add-questions" element={<AddQuestions />} />
        </Route>

        {/* Protected - Any Auth */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Student */}
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/feedback" element={<ProtectedRoute role="student"><MyFeedback /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin">
          <Route index element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>} />
          <Route path="feedback" element={<ProtectedRoute role="admin"><ManageFeedback /></ProtectedRoute>} />
          <Route path="exam-levels" element={<ProtectedRoute role="admin"><ExamLevels /></ProtectedRoute>} />
          <Route path="subjects" element={<ProtectedRoute role="admin"><Subjects /></ProtectedRoute>} />
          <Route path="content" element={<ProtectedRoute role="admin"><ContentManagement /></ProtectedRoute>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;