import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { reactToFeedback, addReply, deleteReply, deleteFeedback } from "../../services/feedbackService"
import { formatTimeAgo, getInitials, categoryColor, statusColor } from "../../utils/helpers"
import { ThumbsUp, CheckCircle, MessageCircle, Trash2, ChevronDown, ChevronUp, Send } from "lucide-react"
import toast from "react-hot-toast"

export default function FeedbackCard({ feedback, onRefresh, isAdmin = false }) {
  const { user } = useAuth()
  const [showReplies, setShowReplies] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReact = async (type) => {
    try {
      await reactToFeedback(feedback._id, type)
      onRefresh()
    } catch { toast.error("Failed to react") }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setLoading(true)
    try {
      await addReply(feedback._id, replyText)
      setReplyText("")
      toast.success("Reply added!")
      onRefresh()
      setShowReplies(true)
    } catch { toast.error("Failed to add reply") }
    setLoading(false)
  }

  const handleDeleteReply = async (replyId) => {
    if (!confirm("Delete this reply?")) return
    try {
      await deleteReply(feedback._id, replyId)
      toast.success("Reply deleted")
      onRefresh()
    } catch { toast.error("Failed to delete reply") }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this feedback?")) return
    try {
      await deleteFeedback(feedback._id)
      toast.success("Feedback deleted")
      onRefresh()
    } catch { toast.error("Failed to delete") }
  }

  const myReaction = feedback.reactions?.find(r =>
    (r.user?._id || r.user) === (user?._id || user?.id)
  )
  const likeCount = feedback.reactionSummary?.like || 0
  const helpfulCount = feedback.reactionSummary?.helpful || 0

  return (
    <div className="card-hover border border-gray-100 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-xs font-bold text-indigo-600">
            {getInitials(feedback.author?.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{feedback.author?.name}</p>
              {feedback.author?.role === "admin" && (
                <span className="badge bg-purple-100 text-purple-700">Admin</span>
              )}
            </div>
            <p className="text-xs text-gray-400">{formatTimeAgo(feedback.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className={`badge ${categoryColor(feedback.category)}`}>{feedback.category}</span>
          <span className={`badge ${statusColor(feedback.status)}`}>{feedback.status}</span>
          {(user?.role === "admin" || (feedback.author?._id || feedback.author) === (user?._id || user?.id)) && (
            <button onClick={handleDelete} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Admin note */}
      {isAdmin && feedback.adminNote && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 mb-3 text-xs text-purple-700">
          <span className="font-semibold">Admin Note:</span> {feedback.adminNote}
        </div>
      )}

      {/* Content */}
      <h3 className="font-display font-semibold text-gray-900 mb-1.5 text-base">{feedback.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{feedback.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-sm border-t border-gray-50 pt-3">
        <button
          onClick={() => handleReact("like")}
          className={`flex items-center gap-1.5 text-sm transition-colors ${myReaction?.type === "like" ? "text-indigo-600 font-semibold" : "text-gray-400 hover:text-indigo-500"}`}
        >
          <ThumbsUp className="w-3.5 h-3.5" /> {likeCount}
        </button>
        <button
          onClick={() => handleReact("helpful")}
          className={`flex items-center gap-1.5 text-sm transition-colors ${myReaction?.type === "helpful" ? "text-green-600 font-semibold" : "text-gray-400 hover:text-green-500"}`}
        >
          <CheckCircle className="w-3.5 h-3.5" /> {helpfulCount} Helpful
        </button>
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors ml-auto"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {feedback.replies?.length || 0} replies
          {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="mt-4 space-y-3 animate-fade-in">
          {feedback.replies?.map(reply => (
            <div key={reply._id} className="flex gap-3 pl-4 border-l-2 border-indigo-100">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 font-bold shrink-0">
                {getInitials(reply.author?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">{reply.author?.name}</span>
                    {reply.author?.role === "admin" && <span className="badge bg-purple-100 text-purple-600 text-xs">Admin</span>}
                    <span className="text-xs text-gray-400">{formatTimeAgo(reply.createdAt)}</span>
                  </div>
                  {(user?.role === "admin" || (reply.author?._id || reply.author) === (user?._id || user?.id)) && (
                    <button onClick={() => handleDeleteReply(reply._id)} className="text-gray-300 hover:text-red-500 shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{reply.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleReply} className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
            <input
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="input-field text-sm py-2 flex-1"
            />
            <button type="submit" disabled={loading} className="btn-primary text-sm py-2 px-3">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}