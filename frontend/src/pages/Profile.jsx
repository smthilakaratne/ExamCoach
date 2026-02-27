import { useState, useEffect } from "react"
import Navbar from "../components/common/Navbar"
import { useAuth } from "../context/AuthContext"
import { updateProfile, changePassword } from "../services/userService"
import { getInitials, formatDate } from "../utils/helpers"
import { Save, Lock, User, Shield, Calendar } from "lucide-react"
import toast from "react-hot-toast"

export default function Profile() {
  const { user, setUser } = useAuth()
  const [profileForm, setProfileForm] = useState({ name: "", bio: "", avatar: "" })
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "" })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || "", bio: user.bio || "", avatar: user.avatar || "" })
  }, [user])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const res = await updateProfile(profileForm)
      setUser(res.data.body.user)
      toast.success("Profile updated!")
    } catch { toast.error("Failed to update profile") }
    setProfileLoading(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPassLoading(true)
    try {
      await changePassword(passForm)
      setPassForm({ currentPassword: "", newPassword: "" })
      toast.success("Password changed!")
    } catch (err) {
      toast.error(err.response?.data?.body?.message || "Failed to change password")
    }
    setPassLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="card border border-gray-100 text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-white mx-auto mb-4 shadow-md">
              {getInitials(user?.name)}
            </div>
            <h2 className="font-display font-bold text-gray-900 text-lg">{user?.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>

            <div className="flex items-center justify-center gap-2 mt-3">
              <span className={`badge ${user?.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                <Shield className="w-3 h-3 mr-1" /> {user?.role}
              </span>
              <span className={`badge ${user?.isEmailVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {user?.isEmailVerified ? "✓ Verified" : "⚠ Unverified"}
              </span>
            </div>

            {user?.createdAt && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-4">
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(user.createdAt)}
              </div>
            )}

            {user?.bio && (
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">{user.bio}</p>
            )}
          </div>

          {/* Edit Profile */}
          <div className="card border border-gray-100 lg:col-span-2">
            <h2 className="font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Edit Profile
            </h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea rows={3} value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell us a little about yourself..." className="input-field resize-none" />
              </div>
              <div>
                <label className="label">Avatar URL <span className="text-gray-400 font-normal">(optional)</span></label>
                <input value={profileForm.avatar} onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://..." className="input-field" />
              </div>
              <button type="submit" disabled={profileLoading} className="btn-primary">
                <Save className="w-4 h-4" /> {profileLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card border border-gray-100 lg:col-span-3">
            <h2 className="font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" /> Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Current Password</label>
                <input type="password" required value={passForm.currentPassword}
                  onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" required value={passForm.newPassword}
                  onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                  placeholder="Min 8 chars, upper + lower + number" className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" disabled={passLoading} className="btn-primary">
                  <Lock className="w-4 h-4" /> {passLoading ? "Updating..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}