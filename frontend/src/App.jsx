import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/home"
import Forum from "./pages/forum"
import MockExam from "./pages/mockExam/MockExam"
import ExamLevels from "./pages/mockExam/MockLevels"
import ExamAnswers from "./pages/mockExam/Answers"
import ExamResult from "./pages/mockExam/MockResult"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="community">
          <Route path="forum" element={<Forum />} />
          <Route path="exam" element={<MockExam />} />
          <Route path="exam-level" element={<ExamLevels />} />
          <Route path="exam-answers" element={<ExamAnswers />} />
          <Route path="exam-result" element={<ExamResult />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
