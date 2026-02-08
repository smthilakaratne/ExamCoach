import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/home"
import Forum from "./pages/forum"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="community">
          <Route path="forum" element={<Forum />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
