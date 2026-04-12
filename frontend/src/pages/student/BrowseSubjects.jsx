import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/common/Navbar"
import { BookOpen, ArrowLeft } from "lucide-react"
import Spinner from "../../components/common/Spinner"

const API_URL = import.meta.env.VITE_API_URL
export default function BrowseSubjects() {
  const { levelId } = useParams()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [examLevel, setExamLevel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [levelId])

  const fetchData = async () => {
    try {
      const [levelRes, subjectsRes] = await Promise.all([
        fetch(`${API_URL}/api/exam-levels/${levelId}`),
        fetch(`${API_URL}/api/subjects?examLevel=${levelId}`),
      ])
      const levelData = await levelRes.json()
      const subjectsData = await subjectsRes.json()
      if (levelData.success) setExamLevel(levelData.body)
      if (subjectsData.success) setSubjects(subjectsData.body)
    } catch (error) { console.error(error) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">{examLevel?.name || "Exam Level"}</h1>
          <p className="text-gray-500">Select a subject to explore study materials</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : subjects.length === 0 ? (
          <div className="card border border-gray-100 text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No Subjects Yet</h3>
            <p className="text-gray-400 text-sm">Subjects for this exam level will be added soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject, i) => {
              const colors = [
                { bg: "bg-indigo-50", icon: "text-indigo-600", hover: "hover:border-indigo-300", link: "text-indigo-600" },
                { bg: "bg-blue-50", icon: "text-blue-600", hover: "hover:border-blue-300", link: "text-blue-600" },
                { bg: "bg-purple-50", icon: "text-purple-600", hover: "hover:border-purple-300", link: "text-purple-600" },
                { bg: "bg-green-50", icon: "text-green-600", hover: "hover:border-green-300", link: "text-green-600" },
              ]
              const c = colors[i % colors.length]
              return (
                <Link key={subject._id} to={`/browse/${levelId}/subject/${subject._id}`}
                  className={`card-hover border-2 border-gray-100 ${c.hover} group`}>
                  <div className={`w-14 h-14 ${c.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <BookOpen className={`w-7 h-7 ${c.icon}`} />
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-lg mb-1">{subject.name}</h3>
                  <span className={`badge ${c.bg} ${c.icon}`}>{subject.code}</span>
                  {subject.description && <p className="text-gray-500 text-sm mt-3">{subject.description}</p>}
                  <p className={`${c.link} font-semibold text-sm mt-4 group-hover:underline`}>Explore Materials →</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}