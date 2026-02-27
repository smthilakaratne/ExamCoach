import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/common/Navbar"
import { FileText, Download, Eye, ArrowLeft, Calendar, Tag } from "lucide-react"
import Spinner from "../../components/common/Spinner"

export default function ContentList() {
  const { levelId, subjectId, contentType } = useParams()
  const navigate = useNavigate()
  const [contents, setContents] = useState([])
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState("all")
  const [filterTerm, setFilterTerm] = useState("all")

  useEffect(() => { fetchData() }, [subjectId, contentType])

  const fetchData = async () => {
    try {
      const [subjectRes, contentsRes] = await Promise.all([
        fetch(`http://localhost:5001/api/subjects/${subjectId}`),
        fetch(`http://localhost:5001/api/contents?subject=${subjectId}&contentType=${contentType}`),
      ])
      const sd = await subjectRes.json(); const cd = await contentsRes.json()
      if (sd.success) setSubject(sd.body)
      if (cd.success) setContents(cd.body)
    } catch (error) { console.error(error) }
    setLoading(false)
  }

  const handleDownload = async (contentId, fileId) => {
    try {
      await fetch(`http://localhost:5001/api/contents/${contentId}/download`, { method: "POST" })
      window.open(`http://localhost:5001/api/files/download/${fileId}`, "_blank")
    } catch (error) { console.error(error) }
  }

  const getContentTypeName = (type) => ({ past_paper: "Past Papers", lesson: "Lessons", lecture_video: "Video Lectures", short_notes: "Short Notes" }[type] || type)

  const filteredContents = contents.filter(c => {
    if (filterYear !== "all" && c.year !== parseInt(filterYear)) return false
    if (filterTerm !== "all" && c.term !== filterTerm) return false
    return true
  })
  const uniqueYears = [...new Set(contents.map(c => c.year).filter(Boolean))].sort((a, b) => b - a)
  const uniqueTerms = [...new Set(contents.map(c => c.term).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container">
        <button onClick={() => navigate(`/browse/${levelId}/subject/${subjectId}`)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </button>
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">{getContentTypeName(contentType)}</h1>
          <p className="text-gray-500">{subject?.name} • {subject?.examLevel?.name}</p>
        </div>

        {(uniqueYears.length > 0 || uniqueTerms.length > 0) && (
          <div className="card border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueYears.length > 0 && (
                <div>
                  <label className="label">Filter by Year</label>
                  <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="input-field">
                    <option value="all">All Years</option>
                    {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              )}
              {uniqueTerms.length > 0 && (
                <div>
                  <label className="label">Filter by Term</label>
                  <select value={filterTerm} onChange={e => setFilterTerm(e.target.value)} className="input-field">
                    <option value="all">All Terms</option>
                    {uniqueTerms.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filteredContents.length === 0 ? (
          <div className="card border border-gray-100 text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No Content Found</h3>
            <p className="text-gray-400 text-sm">{contents.length === 0 ? `No ${getContentTypeName(contentType).toLowerCase()} available yet.` : "Try adjusting your filters."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredContents.map(content => (
              <div key={content._id} className="card-hover border border-gray-100">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 leading-snug">{content.title}</h3>
                {content.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{content.description}</p>}
                <div className="space-y-1.5 mb-4">
                  {content.year && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" /> {content.year}{content.term && ` • ${content.term.replace("_", " ")}`}
                    </div>
                  )}
                  {content.unit && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Tag className="w-3.5 h-3.5" /> {content.unit}
                    </div>
                  )}
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>👁 {content.views || 0}</span>
                    <span>⬇ {content.downloads || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {content.contentType === "lecture_video" ? (
                    <a href={content.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 btn-primary text-sm py-2">Watch Video</a>
                  ) : content.fileId ? (
                    <>
                      <button onClick={() => window.open(`http://localhost:5001/api/files/view/${content.fileId}`, "_blank")}
                        className="flex-1 btn-secondary text-sm py-2 gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button onClick={() => handleDownload(content._id, content.fileId)}
                        className="flex-1 btn-primary text-sm py-2 gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </>
                  ) : null}
                </div>
                {content.hasAnswerSheet && content.answerSheetFileId && (
                  <button onClick={() => handleDownload(content._id, content.answerSheetFileId)}
                    className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download Answers
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