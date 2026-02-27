import { useState, useEffect } from "react"
import Navbar from "../../components/common/Navbar"
import StudentSidebar from "../../components/common/StudentSidebar"
import FeedbackCard from "../../components/feedback/FeedbackCard"
import FeedbackForm from "../../components/feedback/FeedbackForm"
import { getMyFeedback } from "../../services/feedbackService"
import Spinner from "../../components/common/Spinner"
import { Plus, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"

export default function MyFeedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const res = await getMyFeedback({ page, limit: 8 })
      setFeedbacks(res.data.body.feedbacks)
      setPagination(res.data.body.pagination)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchFeedbacks() }, [page])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <StudentSidebar />
        <main className="ml-60 flex-1 p-8 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">My Feedback</h1>
              <p className="text-gray-500 text-sm mt-0.5">{pagination.total} submission{pagination.total !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> New Feedback
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              <div className="space-y-4">
                {feedbacks.map(fb => <FeedbackCard key={fb._id} feedback={fb} onRefresh={fetchFeedbacks} />)}
                {feedbacks.length === 0 && (
                  <div className="card border border-gray-100 text-center py-16">
                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-700 mb-2">No feedback yet</h3>
                    <p className="text-gray-400 text-sm mb-5">Share your thoughts, report issues, or suggest improvements.</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary inline-flex">
                      <Plus className="w-4 h-4" /> Submit First Feedback
                    </button>
                  </div>
                )}
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="btn-secondary py-2 px-3 disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 font-medium">Page {page} of {pagination.pages}</span>
                  <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                    className="btn-secondary py-2 px-3 disabled:opacity-40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      {showForm && <FeedbackForm onClose={() => setShowForm(false)} onSuccess={fetchFeedbacks} />}
    </div>
  )
}