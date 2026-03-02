import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Search, TrendingUp } from "lucide-react"
import Footer from "../components/footer"
import Button from "../components/button"
import Navbar from "../components/navbar"

export default function Home() {
  const [examLevels, setExamLevels] = useState([])
  const [recentContent, setRecentContent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch exam levels
      const levelsRes = await fetch("http://localhost:8888/api/exam-levels")
      const levelsData = await levelsRes.json()
      if (levelsData.success) {
        setExamLevels(levelsData.body)
      }

      // Fetch recent content (for "Recently Added" section)
      const contentsRes = await fetch("http://localhost:8888/api/contents")
      const contentsData = await contentsRes.json()
      if (contentsData.success) {
        setRecentContent(contentsData.body.slice(0, 6))
      }

      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setLoading(false)
    }
  }

  const getContentTypeColor = (type) => {
    const colors = {
      past_paper: "bg-purple-100 text-purple-800",
      lesson: "bg-blue-100 text-blue-800",
      lecture_video: "bg-red-100 text-red-800",
      short_notes: "bg-green-100 text-green-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/*<Navbar/>*/} 
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Your Path to Exam Success Starts Here
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Access thousands of past papers, lessons, and study materials for
            A/L and O/L exams
          </p>
          {/* Search Bar (Future Feature) */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for subjects, topics, or past papers..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-lg"
              />
            </div>
          </div>
        </div>

        {/* Exam Level Cards */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Choose Your Exam Level
          </h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-xl text-gray-600">Loading...</div>
            </div>
          ) : examLevels.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">
                No exam levels available yet. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {examLevels.map((level, index) => (
                <Link
                  key={level._id}
                  to={`/browse/${level._id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-indigo-500">
                    <div
                      className={`flex items-center justify-center w-20 h-20 ${
                        index % 2 === 0 ? "bg-blue-100" : "bg-green-100"
                      } rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform`}
                    >
                      <BookOpen
                        className={`w-10 h-10 ${
                          index % 2 === 0 ? "text-blue-600" : "text-green-600"
                        }`}
                      />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 text-center mb-3">
                      {level.name}
                    </h3>
                    <p className="text-center">
                      <span className="inline-block bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full font-semibold">
                        {level.code}
                      </span>
                    </p>
                    {level.description && (
                      <p className="text-gray-600 text-center mt-4">
                        {level.description}
                      </p>
                    )}
                    <div className="mt-6 text-center">
                      <span
                        className={`${
                          index % 2 === 0 ? "text-blue-600" : "text-green-600"
                        } font-semibold text-lg group-hover:underline`}
                      >
                        Explore Subjects →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-10 mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-10">
            Everything You Need to Succeed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📄</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Past Papers
              </h4>
              <p className="text-sm text-gray-600">
                Comprehensive collection of previous exam papers with detailed
                answer keys
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Study Materials
              </h4>
              <p className="text-sm text-gray-600">
                In-depth lessons and comprehensive notes covering all syllabus
                topics
              </p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Quick Revision
              </h4>
              <p className="text-sm text-gray-600">
                Concise notes and summaries perfect for last-minute revision
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎥</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Video Lectures
              </h4>
              <p className="text-sm text-gray-600">
                Learn from experienced teachers with engaging video explanations
              </p>
            </div>
          </div>
        </div>

        {/* Recently Added Section */}
        {recentContent.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gray-900">
                Recently Added
              </h3>
              <TrendingUp className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentContent.map((content) => (
                <Link
                  key={content._id}
                  to={`/browse/${content.subject.examLevel._id}/subject/${content.subject._id}/content/${content.contentType}`}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${getContentTypeColor(
                        content.contentType,
                        content.contentType,
                      )}`}
                    >
                      {content.contentType.replace("_", " ")}
                    </span>
                    {content.year && (
                      <span className="text-xs text-gray-500 font-medium">
                        {content.year}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {content.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {content.subject.name} • {content.subject.examLevel.code}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>👁 {content.views || 0}</span>
                    <span>⬇ {content.downloads || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link to="/mock-exam/exam-summary" className="block p-6 m-4  text-white rounded-lg text-center ">
          <Button kind="primary">Mock Exam</Button>
        </Link>

        <Link to="/mock-exam/exam-summary" className="block p-6 m-4  text-white rounded-lg text-center ">
          <Button kind="primary">Mock Exam</Button>
        </Link>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h3 className="text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h3>
          <p className="text-xl mb-8 text-indigo-100">
            Join thousands of students who are achieving their exam goals with
            ExamCoach
          </p>
        </div>
      </div>
      <Footer />
      <Footer />
    </div>
   </>
  )
}

