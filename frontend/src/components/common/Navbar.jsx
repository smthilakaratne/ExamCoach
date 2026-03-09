import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  GraduationCap,
  User,
  LogOut,
  MessageSquare,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import ProfileImage from "./ProfileImage"

export default function Navbar() {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">ExamCoach</h1>
        </Link>

        <div
          className="block md:hidden hover:bg-gray-200 p-3 transition-all rounded-full"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </div>

        <div
          className={`
            absolute md:static top-full left-0 w-full md:w-auto
            bg-white md:bg-transparent
            flex-col md:flex-row
            items-start md:items-center
            gap-3 md:gap-6
            px-4 md:px-0 py-4 md:py-0
            border-t md:border-0
            ${mobileMenuOpen ? "grid" : "hidden md:flex"}
          `}
        >
          <Link
            to="/"
            className="text-gray-700 hover:text-indigo-600 font-medium"
          >
            Home
          </Link>

          <Link
            to="/community/forum"
            className="text-gray-700 hover:text-indigo-600 font-medium"
          >
            Forum
          </Link>

          <Link
            to="/mock-exam/exam-summary"
            className="text-gray-700 hover:text-indigo-600 font-medium"
          >
            Mock Exam
          </Link>

          <Link
            to="/contact"
            className="text-gray-700 hover:text-indigo-600 font-medium"
          >
            Contact
          </Link>

          {user && (
            <>
              {user.role === "student" && (
                <Link
                  to="/student/feedback"
                  className="text-gray-700 hover:text-indigo-600 font-medium flex items-center gap-1"
                >
                  <MessageSquare className="w-4 h-4" /> Feedback
                </Link>
              )}

              {user.role === "admin" && (
                <>
                  <Link
                    to="/admin/feedback"
                    className="text-gray-700 hover:text-indigo-600 font-medium flex items-center gap-1"
                  >
                    <MessageSquare className="w-4 h-4" /> Feedback
                  </Link>

                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-indigo-600 font-medium flex items-center gap-1"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin
                  </Link>
                </>
              )}
            </>
          )}

          {!user ? (
            <div className="flex flex-col md:flex-row gap-2">
              <Link to="/login" className="btn-secondary py-2 px-4 text-center">
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary py-2 px-4 text-center"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="hidden md:flex items-center gap-2 focus:outline-none"
              >
                <ProfileImage user={user} size={9} />
              </button>

              {(dropdownOpen || mobileMenuOpen) && (
                <div
                  className={
                    "absolute md:right-0 left-0 md:left-auto mt-0 md:mt-2 w-full md:w-48 bg-white rounded-none md:rounded-xl shadow-none md:shadow-lg py-0 md:py-2 border border-gray-100 z-50 " +
                      (mobileMenuOpen && "relative border-t border-t-gray-300")
                  }
                >
                  <Link
                    to={user.role === "admin" ? "/admin" : "/student/dashboard"}
                    className="block px-0 md:px-4 py-2 text-base md:text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" /> Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    className="block px-0 md:px-4 py-2 text-base md:text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-0 md:px-4 py-2 text-base md:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
