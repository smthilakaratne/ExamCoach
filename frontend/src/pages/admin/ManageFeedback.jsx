import { useState, useEffect } from "react"
import Navbar from "../../components/common/Navbar"
import AdminSidebar from "../../components/common/AdminSidebar"
import FeedbackCard from "../../components/feedback/FeedbackCard"
import { getAllFeedback } from "../../services/feedbackService"
import Spinner from "../../components/common/Spinner"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

const STATUSES = ["", "pending", "reviewed", "resolved", "rejected"]
const CATEGORIES = ["", "general", "course", "platform", "suggestion", "bug", "other"]

export default function ManageFeedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [category, setCategory] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const res = await getAllFeedback({ page, limit: 8, search, status, category, sort: "-createdAt" })
      setFeedbacks(res.data.body.feedbacks)
      setPagination(res.data.body.pagination)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchFeedbacks() }, [page, search, status, category])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="ml-60 flex-1 p-8 min-w-0">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-gray-900">Manage Feedback</h1>
            <p className="text-gray-500 text-sm mt-0.5">{pagination.total} total submissions</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search feedback..."
                className="input-field pl-10"
              />
            </div>
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1) }}
              className="input-field w-36"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s || "All Statuses"}</option>
              ))}
            </select>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1) }}
              className="input-field w-36"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c || "All Categories"}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              <div className="space-y-4">
                {feedbacks.map(fb => (
                  <FeedbackCard
                    key={fb._id}
                    feedback={fb}
                    onRefresh={fetchFeedbacks}
                    isAdmin={true}
                  />
                ))}
                {feedbacks.length === 0 && (
                  <div className="card border border-gray-100 text-center py-12 text-gray-400">
                    No feedback found matching your filters
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary py-2 px-3 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-600">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="btn-secondary py-2 px-3 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}