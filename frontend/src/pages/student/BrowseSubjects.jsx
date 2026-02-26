import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { BookOpen, ArrowLeft, GraduationCap } from "lucide-react"

export default function BrowseSubjects() {
  const { levelId } = useParams()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [examLevel, setExamLevel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [levelId])

  const fetchData = async () => {
    try {
      // Fetch exam level details
      const levelRes = await fetch(
        `http://localhost:8888/api/exam-levels/${levelId}`
      )
      const levelData = await levelRes.json()
      if (levelData.success) {
        setExamLevel(levelData.body)
      }

      // Fetch subjects for this level
      const subjectsRes = await fetch(
        `http://localhost:8888/api/subjects?examLevel=${levelId}`
      )
      const subjectsData = await subjectsRes.json()
      if (subjectsData.success) {
        setSubjects(subjectsData.body)
      }

      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading subjects...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">ExamCoach</h1>
          </Link>
          <Link
            to="/"
            className="text-gray-700 hover:text-indigo-600 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate("/")}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {examLevel?.name || "Exam Level"}
          </h1>
          <p className="text-xl text-gray-600">
            Select a subject to explore study materials
          </p>
        </div>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No Subjects Available
            </h3>
            <p className="text-gray-600">
              Subjects for this exam level will be added soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link
                key={subject._id}
                to={`/browse/${levelId}/subject/${subject._id}`}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6 mx-auto">
                  <BookOpen className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  {subject.name}
                </h3>
                <p className="text-center">
                  <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {subject.code}
                  </span>
                </p>
                {subject.description && (
                  <p className="text-gray-600 text-center mt-4 text-sm">
                    {subject.description}
                  </p>
                )}
                <div className="mt-6 text-center">
                  <span className="text-indigo-600 font-medium hover:underline">
                    Explore Materials →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}