import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { BookOpen, FileText, GraduationCap, Video } from "lucide-react"
import Button from "../../components/Button"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLevels: 0,
    totalSubjects: 0,
    totalContents: 0,
    totalDownloads: 0,
  })
  const [recentContents, setRecentContents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch exam levels
      const levelsRes = await fetch("http://localhost:8888/api/exam-levels")
      const levelsData = await levelsRes.json()

      // Fetch subjects
      const subjectsRes = await fetch("http://localhost:8888/api/subjects")
      const subjectsData = await subjectsRes.json()

      // Fetch contents
      const contentsRes = await fetch("http://localhost:8888/api/contents")
      const contentsData = await contentsRes.json()

      // Calculate stats
      setStats({
        totalLevels: levelsData.body?.length || 0,
        totalSubjects: subjectsData.body?.length || 0,
        totalContents: contentsData.body?.length || 0,
        totalDownloads: contentsData.body?.reduce(
          (sum, content) => sum + (content.downloads || 0),
          0,
        ),
      })

      // Get recent 5 contents
      setRecentContents(contentsData.body?.slice(0, 5) || [])

      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setLoading(false)
    }
  }

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "past_paper":
        return <FileText className="w-5 h-5" />
      case "lesson":
        return <BookOpen className="w-5 h-5" />
      case "lecture_video":
        return <Video className="w-5 h-5" />
      case "short_notes":
        return <FileText className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your exam content and resources
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Exam Levels</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalLevels}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <Link
              to="/admin/exam-levels"
              className="text-blue-600 text-sm mt-4 inline-block hover:underline"
            >
              Manage Levels →
            </Link>
            <Link to="/mock-exam/add-questions">
              <Button kind="primary">
                Add Questions
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Subjects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalSubjects}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <Link
              to="/admin/subjects"
              className="text-green-600 text-sm mt-4 inline-block hover:underline"
            >
              Manage Subjects →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Content</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalContents}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <Link
              to="/admin/content"
              className="text-purple-600 text-sm mt-4 inline-block hover:underline"
            >
              Manage Content →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Downloads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalDownloads}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Video className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Content
          </h2>
          {recentContents.length === 0 ? (
            <p className="text-gray-500">No content yet. Start adding some!</p>
          ) : (
            <div className="space-y-3">
              {recentContents.map((content) => (
                <div
                  key={content._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-600">
                      {getContentTypeIcon(content.contentType)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {content.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {content.subject?.name} •{" "}
                        {content.contentType.replace("_", " ")}
                        {content.year && ` • ${content.year}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {content.views || 0} views
                    </p>
                    <p className="text-sm text-gray-500">
                      {content.downloads || 0} downloads
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
