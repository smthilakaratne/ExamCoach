import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/home"
import Forum from "./pages/forum"
import AdminDashboard from "./pages/admin/Admindashboard"
import ExamLevels from "./pages/admin/ExamLevels"
import Subjects from "./pages/admin/Subjects"
import ContentManagement from "./pages/admin/ContentManagement"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="community">
          <Route path="forum" element={<Forum />} />
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