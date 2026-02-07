import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/home"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="test" element={<>hello world</>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
