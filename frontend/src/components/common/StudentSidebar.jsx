import { NavLink, Link } from "react-router-dom"
import { LayoutDashboard, MessageSquare, User, BookOpen, Search } from "lucide-react"

const links = [
  { to: "/student/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
  { to: "/student/feedback", icon: <MessageSquare className="w-4 h-4" />, label: "My Feedback" },
  { to: "/profile", icon: <User className="w-4 h-4" />, label: "Profile" },
]

export default function StudentSidebar() {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-gray-100 shadow-sm flex flex-col py-6 px-3 z-40">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">Student Portal</p>
      <nav className="space-y-0.5 flex-1">
        {links.map(({ to, icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
              }`
            }
          >
            {icon} {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pt-4 border-t border-gray-100">
        <Link to="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-indigo-600 transition-colors">
          <BookOpen className="w-3.5 h-3.5" /> Browse Materials
        </Link>
      </div>
    </aside>
  )
}