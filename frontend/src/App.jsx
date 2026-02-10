import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/home"
import Forum from "./pages/forum"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="community">
          <Route path="forum">
            <Route index element={<Forum.Forum />} />
            <Route path="tags" element={<Forum.Tags />} />
            <Route path="new" element={<Forum.CreateThread />} />
            <Route path=":id" element={<Forum.Thread />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
