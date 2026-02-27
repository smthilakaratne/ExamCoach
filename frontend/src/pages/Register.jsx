import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { register } from "../services/authService"
import { GraduationCap, User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success("Account created! Check your email for the OTP.")
      navigate("/verify-email", { state: { email: form.email } })
    } catch (err) {
      toast.error(err.response?.data?.body?.message || "Registration failed")
    }
    setLoading(false)
  }

  const perks = ["Access to past papers & lessons", "Community forum access", "Track your progress"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of students achieving their exam goals</p>
        </div>

        {/* Perks */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-6">
          {perks.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-green-700">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {p}
            </div>
          ))}
        </div>

        <div className="card shadow-soft border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 8 chars, upper + lower + number"
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? "Creating account..." : "Create Account"} {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}