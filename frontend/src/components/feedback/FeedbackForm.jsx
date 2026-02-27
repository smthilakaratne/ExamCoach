import { useState } from "react"
import { createFeedback, updateFeedback } from "../../services/feedbackService"
import { X, Send } from "lucide-react"
import toast from "react-hot-toast"

const CATEGORIES = ["general", "course", "platform", "suggestion", "bug", "other"]

export default function FeedbackForm({ existing, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: existing?.title || "",
    content: existing?.content || "",
    category: existing?.category || "general",
    isPublic: existing?.isPublic ?? true,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (existing) {
        await updateFeedback(existing._id, form)
        toast.success("Feedback updated!")
      } else {
        await createFeedback(form)
        toast.success("Feedback submitted!")
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.body?.message || "Failed to submit feedback")
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-lg animate-scale-in border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-lg font-bold text-gray-900">
            {existing ? "Edit Feedback" : "Submit Feedback"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Brief summary of your feedback"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Details</label>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Describe your feedback in detail..."
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Visibility</label>
              <select value={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.value === "true" })} className="input-field">
                <option value="true">Public</option>
                <option value="false">Private</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              <Send className="w-4 h-4" />
              {loading ? "Submitting..." : existing ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}