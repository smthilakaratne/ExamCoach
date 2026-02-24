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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="community">
          <Route path="forum">
            <Route index element={<Forum.Forum />} />
            <Route path="tags" element={<Forum.Tags />} />
            <Route path="new" element={<Forum.CreateThread />} />
            <Route path=":id" element={<Forum.Thread />} />
          </Route>
        </Route>

        <Route path="mock-exam">
          <Route path="exam" element={<MockExam />} />
          <Route path="exam-summary" element={<ExamSummary />} />
          <Route path="exam-answers" element={<ExamAnswers />} />
          <Route path="exam-result" element={<ExamResult />} />
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