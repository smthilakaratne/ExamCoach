import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { logout } from "../../services/authService"
import { getInitials } from "../../utils/helpers"
import { GraduationCap, LogOut, User, LayoutDashboard, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import toast from "react-hot-toast"

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = async () => {
    try { await logout() } catch {}
    logoutUser()
    toast.success("Logged out successfully")
    navigate("/")
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-700 transition-colors shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-gray-900">ExamCoach</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Home</Link>
          <Link to="/community/forum" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Forum</Link>
          {user && (
            <Link
              to={user.role === "admin" ? "/admin" : "/student/dashboard"}
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </Link>
          )}
        </div>

        {/* Auth Section */}
        {user ? (
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-xl px-3 py-2 transition-all duration-200"
            >
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                {getInitials(user.name)}
              </div>
              <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-24 truncate">{user.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-soft border border-gray-100 py-2 animate-scale-in z-50">
                <div className="px-4 py-2.5 border-b border-gray-50 mb-1">
                  <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <span className={`badge mt-1 ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {user.role}
                  </span>
                </div>
                <Link to="/profile" onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors mx-1 rounded-xl">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mx-1 rounded-xl">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  )
}