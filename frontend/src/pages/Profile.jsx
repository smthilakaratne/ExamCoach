// src/pages/Profile.jsx
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../services/userService"
import toast from "react-hot-toast"
import Spinner from "../components/common/Spinner"
import { User, Camera, Lock, Trash2 } from "lucide-react"
import ProfileImage from "../components/common/ProfileImage"

export default function Profile() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ name: "", bio: "", avatar: "" })
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await getProfile()
      setProfile(res.body.user)
      setForm({
        name: res.body.user.name,
        bio: res.body.user.bio || "",
        avatar: res.body.user.avatar || "",
      })
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await updateProfile(form)
      toast.success("Profile updated")
      setProfile(res.body.user)
      setEditMode(false)
    } catch (error) {
    } finally {
      setSubmitting(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match")
      return
    }
    setSubmitting(true)
    try {
      await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      })
      toast.success("Password changed")
      setPasswords({ current: "", new: "", confirm: "" })
    } catch (error) {
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This will deactivate your account."))
      return
    try {
      await deleteAccount()
      toast.success("Account deactivated")
      await logout()
    } catch (error) {}
  }

  if (loading) return <Spinner fullPage />

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Profile Settings
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <ProfileImage user={profile} size={20} />
              <div>
                <h2 className="text-2xl font-bold">{profile?.name}</h2>
                <p className="text-gray-500">{profile?.email}</p>
                <span className="badge bg-indigo-100 text-indigo-800 mt-1">
                  {profile?.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="btn-secondary text-sm"
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {editMode && (
            <form onSubmit={handleUpdate} className="space-y-4 border-t pt-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Avatar URL</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://example.com/avatar.jpg"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                className="input-field"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className="input-field"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                className="input-field"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary">
              Update Password
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </h3>
          <button onClick={handleDeleteAccount} className="btn-danger">
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  )
}
