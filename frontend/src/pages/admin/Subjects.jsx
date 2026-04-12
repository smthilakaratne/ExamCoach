import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL
export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [examLevels, setExamLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [filterLevel, setFilterLevel] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    examLevel: "",
    description: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch exam levels
      const levelsRes = await fetch(`${API_URL}/api/exam-levels`)
      const levelsData = await levelsRes.json()
      if (levelsData.success) {
        setExamLevels(levelsData.body)
      }

      // Fetch subjects
      const subjectsRes = await fetch(`${API_URL}/api/subjects`)
      const subjectsData = await subjectsRes.json()
      if (subjectsData.success) {
        setSubjects(subjectsData.body)
      }

      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingSubject
        ? `${API_URL}/api/subjects/${editingSubject._id}`
        : `${API_URL}/api/subjects`

      const method = editingSubject ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert(
          editingSubject
            ? "Subject updated successfully!"
            : "Subject created successfully!",
        )
        setShowForm(false)
        setEditingSubject(null)
        setFormData({ name: "", code: "", examLevel: "", description: "" })
        fetchData()
      } else {
        alert(data.body || "Operation failed")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Operation failed")
    }
  }

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      examLevel: subject.examLevel._id,
      description: subject.description || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this subject?")) return

    try {
      const response = await fetch(`${API_URL}/api/subjects/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        alert("Subject deleted successfully!")
        fetchData()
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
    setEditingSubject(null)
    setFormData({ name: "", code: "", examLevel: "", description: "" })
  }

  // Filter subjects by exam level
  const filteredSubjects =
    filterLevel === "all"
      ? subjects
      : subjects.filter((s) => s.examLevel._id === filterLevel)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
            <p className="text-gray-600 mt-2">
              Manage subjects for each exam level
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Subject
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Physics"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., PHY"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Level *
                </label>
                <select
                  required
                  value={formData.examLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, examLevel: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Exam Level</option>
                  {examLevels.map((level) => (
                    <option key={level._id} value={level._id}>
                      {level.name} ({level.code})
                    </option>
                  ))}
                </select>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  {editingSubject ? "Update" : "Create"}
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

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Exam Level
          </label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            {examLevels.map((level) => (
              <option key={level._id} value={level._id}>
                {level.name} ({level.code})
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg shadow">
          {filteredSubjects.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">
                {filterLevel === "all"
                  ? "No subjects yet. Click 'Add Subject' to create one."
                  : "No subjects found for this exam level."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Subject Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Exam Level
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
                  {filteredSubjects.map((subject) => (
                    <tr key={subject._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {subject.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          {subject.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {subject.examLevel.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {subject.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(subject.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-green-600 hover:text-green-800 mr-4"
                        >
                          <Edit2 className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject._id)}
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
