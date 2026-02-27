import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { FileText, BookOpen, Video, StickyNote, ArrowLeft, GraduationCap } from "lucide-react"

export default function ContentCategories() {
  const { levelId, subjectId } = useParams()
  const navigate = useNavigate()
  const [subject, setSubject] = useState(null)
  const [contentCounts, setContentCounts] = useState({
    past_paper: 0,
    lesson: 0,
    lecture_video: 0,
    short_notes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [subjectId])

  const fetchData = async () => {
    try {
      // Fetch subject details
      const subjectRes = await fetch(
        `http://localhost:8888/api/subjects/${subjectId}`
      )
      const subjectData = await subjectRes.json()
      if (subjectData.success) {
        setSubject(subjectData.body)
      }

      // Fetch content to get counts
      const contentsRes = await fetch(
        `http://localhost:8888/api/contents?subject=${subjectId}`
      )
      const contentsData = await contentsRes.json()
      if (contentsData.success) {
        const contents = contentsData.body
        const counts = {
          past_paper: contents.filter((c) => c.contentType === "past_paper")
            .length,
          lesson: contents.filter((c) => c.contentType === "lesson").length,
          lecture_video: contents.filter(
            (c) => c.contentType === "lecture_video"
          ).length,
          short_notes: contents.filter((c) => c.contentType === "short_notes")
            .length,
        }
        setContentCounts(counts)
      }

      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setLoading(false)
    }
  }

  const categories = [
    {
      type: "past_paper",
      title: "Past Papers",
      description: "Previous exam papers with answers",
      icon: FileText,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      hoverColor: "hover:border-purple-600",
    },
    {
      type: "lesson",
      title: "Lessons",
      description: "Comprehensive study materials",
      icon: BookOpen,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      hoverColor: "hover:border-blue-600",
    },
    {
      type: "lecture_video",
      title: "Video Lectures",
      description: "Learn from expert teachers",
      icon: Video,
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      hoverColor: "hover:border-red-600",
    },
    {
      type: "short_notes",
      title: "Short Notes",
      description: "Quick revision summaries",
      icon: StickyNote,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      hoverColor: "hover:border-green-600",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
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
            to={`/browse/${levelId}`}
            className="text-gray-700 hover:text-indigo-600 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subjects
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate(`/browse/${levelId}`)}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subjects
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {subject?.name || "Subject"}
          </h1>
          <p className="text-xl text-gray-600">
            {subject?.examLevel?.name} •{" "}
            <span className="text-indigo-600">{subject?.code}</span>
          </p>
          <p className="text-gray-600 mt-2">
            Choose a content type to explore study materials
          </p>
        </div>

        {/* Content Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            const count = contentCounts[category.type]

            return (
              <Link
                key={category.type}
                to={`/browse/${levelId}/subject/${subjectId}/content/${category.type}`}
                className={`bg-white rounded-xl shadow-lg p-8 border-2 border-transparent ${category.hoverColor} transition transform hover:-translate-y-1`}
              >
                <div
                  className={`flex items-center justify-center w-16 h-16 ${category.bgColor} rounded-full mb-6 mx-auto`}
                >
                  <Icon className={`w-8 h-8 ${category.textColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-center text-sm mb-4">
                  {category.description}
                </p>
                <div className="text-center">
                  <span
                    className={`inline-block ${category.bgColor} ${category.textColor} px-4 py-2 rounded-full text-sm font-bold`}
                  >
                    {count} Available
                  </span>
                </div>
                <div className="mt-4 text-center">
                  <span className={`${category.textColor} font-medium`}>
                    Browse →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty State */}
        {Object.values(contentCounts).every((count) => count === 0) && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center mt-8">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No Content Available Yet
            </h3>
            <p className="text-gray-600">
              Study materials for {subject?.name} will be added soon.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}