import { useState, useRef, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { verifyEmail, resendOTP } from "../services/authService"
import { Mail, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

export default function VerifyEmail() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { loginUser } = useAuth()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputs = useRef([])
  const email = state?.email || ""

  useEffect(() => { if (!email) navigate("/register") }, [email])
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }
  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }
  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (text.length === 6) { setOtp(text.split("")); inputs.current[5]?.focus() }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join("")
    if (code.length !== 6) return toast.error("Please enter all 6 digits")
    setLoading(true)
    try {
      const res = await verifyEmail({ email, otp: code })
      const { token, user } = res.data.body
      loginUser(token, user)
      toast.success("Email verified! Welcome to ExamCoach 🎉")
      navigate(user.role === "admin" ? "/admin" : "/student/dashboard")
    } catch (err) {
      toast.error(err.response?.data?.body?.message || "Invalid OTP")
    }
    setLoading(false)
  }

  const handleResend = async () => {
    setResendLoading(true)
    try {
      await resendOTP(email)
      toast.success("New OTP sent!")
      setCountdown(60)
      setOtp(["", "", "", "", "", ""])
      inputs.current[0]?.focus()
    } catch { toast.error("Failed to resend OTP") }
    setResendLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-100 border-2 border-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Check your inbox</h1>
          <p className="text-gray-500 text-sm mt-1">
            We sent a 6-digit verification code to
          </p>
          <p className="font-semibold text-indigo-600 text-sm mt-0.5">{email}</p>
        </div>

        <div className="card shadow-soft border border-gray-100">
          <form onSubmit={handleSubmit}>
            <label className="label text-center block">Enter verification code</label>
            <div className="flex gap-2.5 justify-center mb-6 mt-3" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text" maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-11 h-13 text-center text-xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-indigo-50 transition-all"
                />
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="text-center mt-5 pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
            {countdown > 0 ? (
              <p className="text-sm text-gray-400">Resend available in <span className="font-semibold text-indigo-600">{countdown}s</span></p>
            ) : (
              <button onClick={handleResend} disabled={resendLoading}
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? "animate-spin" : ""}`} />
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}