import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  GraduationCap,
  User,
  LogOut,
  MessageSquare,
  LayoutDashboard,
} from "lucide-react"
import { useState } from "react"
import ProfileImage from "./ProfileImage"

export default function Navbar() {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">ExamCoach</h1>
        </Link>

        <div className="flex items-center gap-6">
          {/* Public links */}
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
              {/* Role‑specific links */}
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
            <div className="flex gap-2">
              <Link to="/login" className="btn-secondary py-2 px-4">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2 px-4">
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <ProfileImage user={user} size={9} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50">
                  <Link
                    to={user.role === "admin" ? "/admin" : "/student/dashboard"}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
