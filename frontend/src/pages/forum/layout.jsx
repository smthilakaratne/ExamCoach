import { Outlet } from "react-router-dom"
import Footer from "../../components/footer"
import Navbar from "../../components/navbar"

export default function ForumLayout() {
  return (
    <>
      {/*<Navbar />*/}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </div>
      <Footer />
    </>
  )
}
