import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/home"
import Forum from "./pages/forum"
import ForumTags from "./pages/forumTags"
import CreateThread from "./pages/createThread"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="community">
          <Route path="forum">
            <Route index element={<Forum />} />
            <Route path="tags" element={<ForumTags />} />
            <Route path="new" element={<CreateThread />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
