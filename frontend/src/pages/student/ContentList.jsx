import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import {
  FileText,
  Download,
  Eye,
  ArrowLeft,
  GraduationCap,
  Calendar,
  Tag,
} from "lucide-react"

export default function ContentList() {
  const { levelId, subjectId, contentType } = useParams()
  const navigate = useNavigate()
  const [contents, setContents] = useState([])
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState("all")
  const [filterTerm, setFilterTerm] = useState("all")

  useEffect(() => {
    fetchData()
  }, [subjectId, contentType])

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

      // Fetch content
      const contentsRes = await fetch(
        `http://localhost:8888/api/contents?subject=${subjectId}&contentType=${contentType}`
      )
      const contentsData = await contentsRes.json()
      if (contentsData.success) {
        setContents(contentsData.body)
      }

      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setLoading(false)
    }
  }

  const handleDownload = async (contentId, fileId, fileName) => {
    try {
      // Record download
      await fetch(`http://localhost:8888/api/contents/${contentId}/download`, {
        method: "POST",
      })

      // Download file
      window.open(
        `http://localhost:8888/api/files/download/${fileId}`,
        "_blank"
      )
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const handleView = (fileId) => {
    window.open(`http://localhost:8888/api/files/view/${fileId}`, "_blank")
  }

  const getContentTypeName = (type) => {
    const names = {
      past_paper: "Past Papers",
      lesson: "Lessons",
      lecture_video: "Video Lectures",
      short_notes: "Short Notes",
    }
    return names[type] || type
  }

  // Filter contents
  const filteredContents = contents.filter((content) => {
    if (filterYear !== "all" && content.year !== parseInt(filterYear))
      return false
    if (filterTerm !== "all" && content.term !== filterTerm) return false
    return true
  })

  // Get unique years and terms for filters
  const uniqueYears = [
    ...new Set(contents.map((c) => c.year).filter(Boolean)),
  ].sort((a, b) => b - a)
  const uniqueTerms = [...new Set(contents.map((c) => c.term).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading content...</div>
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
            to={`/browse/${levelId}/subject/${subjectId}`}
            className="text-gray-700 hover:text-indigo-600 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/browse/${levelId}/subject/${subjectId}`)}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getContentTypeName(contentType)}
          </h1>
          <p className="text-xl text-gray-600">
            {subject?.name} • {subject?.examLevel?.name}
          </p>
        </div>

        {/* Filters */}
        {(uniqueYears.length > 0 || uniqueTerms.length > 0) && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueYears.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Year
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Years</option>
                    {uniqueYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {uniqueTerms.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Term
                  </label>
                  <select
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Terms</option>
                    {uniqueTerms.map((term) => (
                      <option key={term} value={term}>
                        {term.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Grid */}
        {filteredContents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No Content Found
            </h3>
            <p className="text-gray-600">
              {contents.length === 0
                ? `No ${getContentTypeName(contentType).toLowerCase()} available yet.`
                : "Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => (
              <div
                key={content._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition"
              >
                {/* Content Icon */}
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {content.title}
                </h3>

                {/* Description */}
                {content.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {content.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                  {content.year && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {content.year}
                        {content.term &&
                          ` • ${content.term.replace("_", " ")}`}
                      </span>
                    </div>
                  )}

                  {content.unit && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="w-4 h-4" />
                      <span>{content.unit}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{content.views || 0} views</span>
                    <span>{content.downloads || 0} downloads</span>
                  </div>
                </div>

                {/* Tags */}
                {content.tags && content.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {content.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {content.contentType === "lecture_video" ? (
                    <a
                      href={content.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-center text-sm font-medium"
                    >
                      Watch Video
                    </a>
                  ) : (
                    <>
                      {content.fileId && (
                        <>
                          <button
                            onClick={() => handleView(content.fileId)}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleDownload(
                                content._id,
                                content.fileId,
                                content.fileName
                              )
                            }
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Answer Sheet */}
                {content.hasAnswerSheet && content.answerSheetFileId && (
                  <button
                    onClick={() =>
                      handleDownload(
                        content._id,
                        content.answerSheetFileId,
                        content.answerSheetFileName
                      )
                    }
                    className="w-full mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download Answers
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}