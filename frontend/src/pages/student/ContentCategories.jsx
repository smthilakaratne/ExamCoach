import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/common/Navbar"
import { FileText, BookOpen, Video, StickyNote, ArrowLeft } from "lucide-react"
import Spinner from "../../components/common/Spinner"

const API_URL = import.meta.env.VITE_API_URL

export default function ContentCategories() {
  const { levelId, subjectId } = useParams()
  const navigate = useNavigate()
  const [subject, setSubject] = useState(null)
  const [contentCounts, setContentCounts] = useState({ past_paper: 0, lesson: 0, lecture_video: 0, short_notes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [subjectId])

  const fetchData = async () => {
    try {
      const [subjectRes, contentsRes] = await Promise.all([
        fetch(`${API_URL}/api/subjects/${subjectId}`),
        fetch(`${API_URL}/api/contents?subject=${subjectId}`),
      ])
      const subjectData = await subjectRes.json()
      const contentsData = await contentsRes.json()
      if (subjectData.success) setSubject(subjectData.body)
      if (contentsData.success) {
        const c = contentsData.body
        setContentCounts({
          past_paper: c.filter(x => x.contentType === "past_paper").length,
          lesson: c.filter(x => x.contentType === "lesson").length,
          lecture_video: c.filter(x => x.contentType === "lecture_video").length,
          short_notes: c.filter(x => x.contentType === "short_notes").length,
        })
      }
    } catch (error) { console.error(error) }
    setLoading(false)
  }

  const categories = [
    { type: "past_paper", title: "Past Papers", desc: "Previous exam papers with answers", icon: FileText, bg: "bg-purple-50", text: "text-purple-600", border: "hover:border-purple-300" },
    { type: "lesson", title: "Lessons", desc: "Comprehensive study materials", icon: BookOpen, bg: "bg-blue-50", text: "text-blue-600", border: "hover:border-blue-300" },
    { type: "lecture_video", title: "Video Lectures", desc: "Learn from expert teachers", icon: Video, bg: "bg-red-50", text: "text-red-600", border: "hover:border-red-300" },
    { type: "short_notes", title: "Short Notes", desc: "Quick revision summaries", icon: StickyNote, bg: "bg-green-50", text: "text-green-600", border: "hover:border-green-300" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container">
        <button onClick={() => navigate(`/browse/${levelId}`)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Subjects
        </button>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">{subject?.name || "Subject"}</h1>
          <p className="text-gray-500">{subject?.examLevel?.name} • <span className="text-indigo-600 font-medium">{subject?.code}</span></p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map(({ type, title, desc, icon: Icon, bg, text, border }) => (
              <Link key={type} to={`/browse/${levelId}/subject/${subjectId}/content/${type}`}
                className={`card-hover border-2 border-gray-100 ${border} group text-center`}>
                <div className={`w-14 h-14 ${bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 ${text}`} />
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-gray-500 text-sm mb-4">{desc}</p>
                <span className={`badge ${bg} ${text}`}>{contentCounts[type]} Available</span>
                <p className={`${text} font-semibold text-sm mt-4 group-hover:underline`}>Browse →</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}