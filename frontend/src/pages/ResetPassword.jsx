import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { resetPassword } from "../services/authService"
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"
import toast from "react-hot-toast"

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: "", confirmPassword: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match")
    setLoading(true)
    try {
      await resetPassword(token, form)
      toast.success("Password reset successfully!")
      navigate("/login")
    } catch (err) {
      toast.error(err.response?.data?.body?.message || "Reset failed. Link may be expired.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card shadow-soft border border-gray-100">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-5">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="font-display text-xl font-bold text-gray-900 mb-1">Reset your password</h1>
          <p className="text-gray-500 text-sm mb-6">Choose a strong new password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "password", label: "New Password", ph: "Min 8 chars, upper + lower + number" },
              { key: "confirmPassword", label: "Confirm Password", ph: "Repeat your new password" },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"} required
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={ph}
                    className="input-field pl-10 pr-10"
                  />
                  {key === "password" && (
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}