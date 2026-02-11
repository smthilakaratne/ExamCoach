import { Link } from "react-router-dom"
import { GraduationCap, BookOpen, Users, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">ExamCoach</h1>
          </div>
          <div className="flex gap-4">
            <Link
              to="/community/forum"
              className="text-gray-700 hover:text-indigo-600 font-medium"
            >
              Forum
            </Link>
            <Link
              to="/admin"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Admin Panel
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to ExamCoach
          </h2>
          <p className="text-xl text-gray-600">
            Your complete exam preparation platform for A/L and O/L students
          </p>
        </div>

        {/* Exam Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Advanced Level Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Advanced Level
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Access comprehensive study materials, past papers, and resources
              for A/L exams
            </p>
            <div className="flex flex-col gap-3">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                Browse A/L Content
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition font-medium">
                View Subjects
              </button>
            </div>
          </div>

          {/* Ordinary Level Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Ordinary Level
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Everything you need to excel in your O/L examinations and build a
              strong foundation
            </p>
            <div className="flex flex-col gap-3">
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium">
                Browse O/L Content
              </button>
              <button className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition font-medium">
                View Subjects
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What You'll Find Here
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📄</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Past Papers</h4>
              <p className="text-sm text-gray-600">
                Years of past exam papers with answers
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📚</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Lessons</h4>
              <p className="text-sm text-gray-600">
                Comprehensive study materials
              </p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📝</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Short Notes</h4>
              <p className="text-sm text-gray-600">
                Quick revision notes and summaries
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎥</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Video Lectures
              </h4>
              <p className="text-sm text-gray-600">
                Learn from expert teachers
              </p>
            </div>
          </div>
        </div>

        {/* Admin Quick Access (Temporary - for development) */}
        <div className="mt-8 bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-indigo-600" />
              <div>
                <h4 className="font-semibold text-gray-900">
                  Admin Panel Access
                </h4>
                <p className="text-sm text-gray-600">
                  Manage exam content, subjects, and more
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Go to Admin Dashboard →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 ExamCoach. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}