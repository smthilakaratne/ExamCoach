import { useState, useEffect } from "react"
import Navbar from "../../components/common/Navbar"
import AdminSidebar from "../../components/common/AdminSidebar"
import { getAllUsers, updateUserByAdmin, deleteUserByAdmin } from "../../services/userService"
import { formatDate, getInitials } from "../../utils/helpers"
import Spinner from "../../components/common/Spinner"
import { Search, Trash2, Edit2, Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [editingId, setEditingId] = useState(null)
  const [editRole, setEditRole] = useState("")

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await getAllUsers({ page, limit: 10, search, role })
      setUsers(res.data.body.users)
      setPagination(res.data.body.pagination)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [page, search, role])

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this user?")) return
    try {
      await deleteUserByAdmin(id)
      toast.success("User deleted")
      fetchUsers()
    } catch {
      toast.error("Failed to delete")
    }
  }

  const handleToggleActive = async (u) => {
    try {
      await updateUserByAdmin(u._id, { isActive: !u.isActive })
      toast.success(`User ${u.isActive ? "deactivated" : "activated"}`)
      fetchUsers()
    } catch {
      toast.error("Failed to update")
    }
  }

  const handleRoleChange = async (id) => {
    try {
      await updateUserByAdmin(id, { role: editRole })
      toast.success("Role updated")
      setEditingId(null)
      fetchUsers()
    } catch {
      toast.error("Failed to update role")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="ml-60 flex-1 p-8 min-w-0">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-gray-500 text-sm mt-0.5">{pagination.total} registered users</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name or email..."
                className="input-field pl-10"
              />
            </div>
            <select
              value={role}
              onChange={e => { setRole(e.target.value); setPage(1) }}
              className="input-field w-36"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="card border border-gray-100 p-0 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["User", "Role", "Status", "Verified", "Joined", "Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-xs font-bold text-indigo-700">
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {editingId === u._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editRole}
                              onChange={e => setEditRole(e.target.value)}
                              className="input-field py-1.5 text-xs w-24"
                            >
                              <option value="student">student</option>
                              <option value="admin">admin</option>
                            </select>
                            <button onClick={() => handleRoleChange(u._id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className={`badge ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${u.isEmailVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {u.isEmailVerified ? "✓ Yes" : "✗ No"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingId(u._id); setEditRole(u.role) }}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit role"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`p-2 rounded-lg transition-all ${u.isActive ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50" : "text-gray-400 hover:text-green-600 hover:bg-green-50"}`}
                            title={u.isActive ? "Deactivate" : "Activate"}
                          >
                            {u.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-sm">No users found</div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-2 px-3 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-600">Page {page} of {pagination.pages}</span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary py-2 px-3 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}