import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">ExamCoach</h1>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/about"
            className="text-gray-700 hover:text-indigo-600 font-medium"
          >
            About
          </Link>
          <Link
            to="/community/forum"
            className="text-gray-700 hover:text-indigo-600 font-medium"
          >
            Forum
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-indigo-600 font-medium"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  )
}
