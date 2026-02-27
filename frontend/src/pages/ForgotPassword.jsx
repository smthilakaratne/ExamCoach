import { useState } from "react"
import { Link } from "react-router-dom"
import { forgotPassword } from "../services/authService"
import { Mail, ArrowLeft, CheckCircle, Send } from "lucide-react"
import toast from "react-hot-toast"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch { toast.error("Something went wrong") }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="card shadow-soft border border-gray-100">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-500 text-sm mb-6">
                If <span className="font-semibold text-gray-700">{email}</span> is registered, a password reset link has been sent.
              </p>
              <Link to="/login" className="btn-primary inline-flex">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-5">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <h1 className="font-display text-xl font-bold text-gray-900 mb-1">Forgot your password?</h1>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" className="input-field pl-10" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  <Send className="w-4 h-4" />
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}