import { NavLink, Link } from "react-router-dom"
import { GraduationCap, LayoutDashboard, BookOpen, FileText, Users, MessageSquare, Settings } from "lucide-react"

const links = [
  { to: "/admin", icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview" },
  { to: "/admin/exam-levels", icon: <GraduationCap className="w-4 h-4" />, label: "Exam Levels" },
  { to: "/admin/subjects", icon: <BookOpen className="w-4 h-4" />, label: "Subjects" },
  { to: "/admin/content", icon: <FileText className="w-4 h-4" />, label: "Content" },
  { to: "/admin/users", icon: <Users className="w-4 h-4" />, label: "Users" },
  { to: "/admin/feedback", icon: <MessageSquare className="w-4 h-4" />, label: "Feedback" },
  { to: "/profile", icon: <Settings className="w-4 h-4" />, label: "Settings" },
]

export default function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-gray-100 shadow-sm flex flex-col py-6 px-3 z-40">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">Admin Panel</p>
      <nav className="space-y-0.5 flex-1">
        {links.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === "/admin"}
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
          <GraduationCap className="w-3.5 h-3.5" /> Back to Site
        </Link>
      </div>
    </aside>
  )
}