import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"

export default function ExamLevels() {
  const [examLevels, setExamLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLevel, setEditingLevel] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  })

  useEffect(() => {
    fetchExamLevels()
  }, [])

  const fetchExamLevels = async () => {
    try {
      const response = await fetch("http://localhost:8888/api/exam-levels")
      const data = await response.json()
      if (data.success) {
        setExamLevels(data.body)
      }
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch exam levels:", error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingLevel
        ? `http://localhost:8888/api/exam-levels/${editingLevel._id}`
        : "http://localhost:8888/api/exam-levels"

      const method = editingLevel ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert(
          editingLevel
            ? "Exam level updated successfully!"
            : "Exam level created successfully!",
        )
        setShowForm(false)
        setEditingLevel(null)
        setFormData({ name: "", code: "", description: "" })
        fetchExamLevels()
      } else {
        alert(data.body || "Operation failed")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Operation failed")
    }
  }

  const handleEdit = (level) => {
    setEditingLevel(level)
    setFormData({
      name: level.name,
      code: level.code,
      description: level.description || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this exam level?")) return

    try {
      const response = await fetch(
        `http://localhost:8888/api/exam-levels/${id}`,
        {
          method: "DELETE",
        },
      )

      const data = await response.json()

      if (data.success) {
        alert("Exam level deleted successfully!")
        fetchExamLevels()
      } else {
        alert(data.body || "Delete failed")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Delete failed")
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingLevel(null)
    setFormData({ name: "", code: "", description: "" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exam Levels</h1>
            <p className="text-gray-600 mt-2">
              Manage exam levels (A/L, O/L, etc.)
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Exam Level
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingLevel ? "Edit Exam Level" : "Add New Exam Level"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Advanced Level"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., AL"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingLevel ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-lg shadow">
          {examLevels.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">
                No exam levels yet. Click "Add Exam Level" to create one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {examLevels.map((level) => (
                    <tr key={level._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {level.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {level.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {level.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(level.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(level)}
                          className="text-blue-600 hover:text-blue-800 mr-4"
                        >
                          <Edit2 className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(level._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
