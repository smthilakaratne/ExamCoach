import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/home"
import Forum from "./pages/forum"
import AdminDashboard from "./pages/admin/Admindashboard"
import ExamLevels from "./pages/admin/ExamLevels"
import Subjects from "./pages/admin/Subjects"
import ContentManagement from "./pages/admin/ContentManagement"
import MockExam from "./pages/mockExam/MockExam"
import ExamSummary from "./pages/mockExam/MockLevels"
import ExamAnswers from "./pages/mockExam/Answers"
import ExamResult from "./pages/mockExam/MockResult"
import BrowseSubjects from "./pages/student/BrowseSubjects"
import ContentCategories from "./pages/student/ContentCategories"
import ContentList from "./pages/student/ContentList"
import AddQuestions from "./pages/mockExam/AddQuestions"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="community">
          <Route path="forum" element={<Forum.Layout />}>
            <Route index element={<Forum.Forum />} />
            <Route path="tags" element={<Forum.Tags />} />
            <Route path="new" element={<Forum.CreateUpdateThread />} />
            <Route path=":id">
              <Route index element={<Forum.Thread />} />
              <Route path="edit" element={<Forum.CreateUpdateThread />} />
            </Route>
          </Route>
        </Route>

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
        </Route>

        <Route path="mock-exam">
          <Route path="exam" element={<MockExam />} />
          <Route path="exam-summary" element={<ExamSummary />} />
          <Route path="exam-answers" element={<ExamAnswers />} />
          <Route path="exam-result" element={<ExamResult />} />
          <Route path="add-questions" element={<AddQuestions />} />
        </Route>

        {/* Admin Routes */}
        <Route path="admin">
          <Route index element={<AdminDashboard />} />
          <Route path="exam-levels" element={<ExamLevels />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="content" element={<ContentManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
