import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Navbar from "../../components/common/Navbar"
import StudentSidebar from "../../components/common/StudentSidebar"
import StatCard from "../../components/common/StatCard"
import FeedbackCard from "../../components/feedback/FeedbackCard"
import FeedbackForm from "../../components/feedback/FeedbackForm"
import { getAllFeedback, getMyFeedback } from "../../services/feedbackService"
import Spinner from "../../components/common/Spinner"
import { MessageSquare, CheckCircle, Clock, Plus, BookOpen, ArrowRight } from "lucide-react"

export default function StudentDashboard() {
  const { user } = useAuth()
  const [publicFeed, setPublicFeed] = useState([])
  const [myStats, setMyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pubRes, myRes] = await Promise.all([
        getAllFeedback({ limit: 5, sort: "-createdAt" }),
        getMyFeedback({ limit: 100 }),
      ])
      setPublicFeed(pubRes.data.body.feedbacks)
      const myFeedbacks = myRes.data.body.feedbacks
      setMyStats({
        total: myFeedbacks.length,
        resolved: myFeedbacks.filter(f => f.status === "resolved").length,
        pending: myFeedbacks.filter(f => f.status === "pending").length,
      })
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-0">
        <StudentSidebar />
        <main className="ml-60 flex-1 p-8 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Hello, {user?.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Here's what's happening on the platform</p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> New Feedback
            </button>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={<MessageSquare className="w-5 h-5" />} label="Total Submitted" value={myStats?.total} color="indigo" />
            <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Resolved" value={myStats?.resolved} color="green" />
            <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Review" value={myStats?.pending} color="amber" />
          </div>

          {/* Quick Browse Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white shadow-hover">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg">Browse Study Materials</h3>
                <p className="text-indigo-200 text-sm mt-1">Access past papers, lessons, and more</p>
              </div>
              <Link to="/" className="bg-white text-indigo-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Browse <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Community Feed */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-gray-900">Community Feedback</h2>
            <Link to="/student/feedback" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View mine <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="space-y-4">
              {publicFeed.map(fb => <FeedbackCard key={fb._id} feedback={fb} onRefresh={fetchData} />)}
              {publicFeed.length === 0 && (
                <div className="card border border-gray-100 text-center py-12">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No feedback yet. Be the first to share!</p>
                  <button onClick={() => setShowForm(true)} className="btn-primary inline-flex mt-4">
                    <Plus className="w-4 h-4" /> Submit Feedback
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      {showForm && <FeedbackForm onClose={() => setShowForm(false)} onSuccess={fetchData} />}
    </div>
  )
}