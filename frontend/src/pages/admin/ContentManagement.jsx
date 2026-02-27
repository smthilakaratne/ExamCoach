import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Download, Eye, FileText } from "lucide-react"

export default function ContentManagement() {
  const [contents, setContents] = useState([])
  const [examLevels, setExamLevels] = useState([])
  const [subjects, setSubjects] = useState([])
  const [filteredSubjects, setFilteredSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  
  // Filters
  const [filterLevel, setFilterLevel] = useState("all")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterType, setFilterType] = useState("all")

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    examLevel: "",
    subject: "",
    contentType: "",
    description: "",
    year: "",
    term: "",
    unit: "",
    tags: "",
    videoUrl: "",
  })

  // Files
  const [questionFile, setQuestionFile] = useState(null)
  const [answerFile, setAnswerFile] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Filter subjects when exam level changes in form
    if (formData.examLevel) {
      const filtered = subjects.filter(
        (s) => s.examLevel._id === formData.examLevel
      )
      setFilteredSubjects(filtered)
    } else {
      setFilteredSubjects([])
    }
  }, [formData.examLevel, subjects])

  const fetchData = async () => {
    try {
      // Fetch all data
      const [levelsRes, subjectsRes, contentsRes] = await Promise.all([
        fetch("http://localhost:8888/api/exam-levels"),
        fetch("http://localhost:8888/api/subjects"),
        fetch("http://localhost:8888/api/contents"),
      ])

      const levelsData = await levelsRes.json()
      const subjectsData = await subjectsRes.json()
      const contentsData = await contentsRes.json()

      if (levelsData.success) setExamLevels(levelsData.body)
      if (subjectsData.success) setSubjects(subjectsData.body)
      if (contentsData.success) setContents(contentsData.body)

      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formDataToSend = new FormData()

      // Add all text fields
      formDataToSend.append("title", formData.title)
      formDataToSend.append("subject", formData.subject)
      formDataToSend.append("contentType", formData.contentType)
      if (formData.description)
        formDataToSend.append("description", formData.description)
      if (formData.year) formDataToSend.append("year", formData.year)
      if (formData.term) formDataToSend.append("term", formData.term)
      if (formData.unit) formDataToSend.append("unit", formData.unit)
      if (formData.tags) formDataToSend.append("tags", formData.tags)
      if (formData.videoUrl)
        formDataToSend.append("videoUrl", formData.videoUrl)

      // Add files
      if (questionFile) {
        formDataToSend.append("file", questionFile)
      }
      if (answerFile) {
        formDataToSend.append("answerSheet", answerFile)
      }

      const url = editingContent
        ? `http://localhost:8888/api/contents/${editingContent._id}`
        : "http://localhost:8888/api/contents"

      const method = editingContent ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      const data = await response.json()

      if (data.success) {
        alert(
          editingContent
            ? "Content updated successfully!"
            : "Content created successfully!"
        )
        handleCancel()
        fetchData()
      } else {
        alert(data.body || "Operation failed")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Operation failed")
    }
  }

  const handleEdit = (content) => {
    setEditingContent(content)
    setFormData({
      title: content.title,
      examLevel: content.subject.examLevel._id,
      subject: content.subject._id,
      contentType: content.contentType,
      description: content.description || "",
      year: content.year || "",
      term: content.term || "",
      unit: content.unit || "",
      tags: content.tags?.join(", ") || "",
      videoUrl: content.videoUrl || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this content?")) return

    try {
      const response = await fetch(`http://localhost:8888/api/contents/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        alert("Content deleted successfully!")
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
    setEditingContent(null)
    setFormData({
      title: "",
      examLevel: "",
      subject: "",
      contentType: "",
      description: "",
      year: "",
      term: "",
      unit: "",
      tags: "",
      videoUrl: "",
    })
    setQuestionFile(null)
    setAnswerFile(null)
  }

  const handleDownload = (fileId, fileName) => {
    window.open(
      `http://localhost:8888/api/files/download/${fileId}`,
      "_blank"
    )
  }

  const handleView = (fileId) => {
    window.open(`http://localhost:8888/api/files/view/${fileId}`, "_blank")
  }

  // Filter contents
  const filteredContents = contents.filter((content) => {
    if (filterLevel !== "all" && content.subject.examLevel._id !== filterLevel)
      return false
    if (filterSubject !== "all" && content.subject._id !== filterSubject)
      return false
    if (filterType !== "all" && content.contentType !== filterType) return false
    return true
  })

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
            <h1 className="text-3xl font-bold text-gray-900">
              Content Management
            </h1>
            <p className="text-gray-600 mt-2">
              Upload and manage exam content (past papers, lessons, videos)
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Content
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingContent ? "Edit Content" : "Add New Content"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Select Exam Level */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Step 1: Select Exam Level
                </h3>
                <select
                  required
                  value={formData.examLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      examLevel: e.target.value,
                      subject: "", // Reset subject when level changes
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Exam Level</option>
                  {examLevels.map((level) => (
                    <option key={level._id} value={level._id}>
                      {level.name} ({level.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Subject */}
              {formData.examLevel && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Step 2: Select Subject
                  </h3>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Subject</option>
                    {filteredSubjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 3: Select Content Type */}
              {formData.subject && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Step 3: Select Content Type
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: "past_paper", label: "Past Paper" },
                      { value: "lesson", label: "Lesson" },
                      { value: "short_notes", label: "Short Notes" },
                      { value: "lecture_video", label: "Lecture Video" },
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                          formData.contentType === type.value
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-300 hover:border-purple-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="contentType"
                          value={type.value}
                          checked={formData.contentType === type.value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contentType: e.target.value,
                            })
                          }
                          className="sr-only"
                        />
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                          <p className="font-medium text-gray-900">
                            {type.label}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Fill Details */}
              {formData.contentType && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Step 4: Fill Content Details
                  </h3>

                  {/* Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Physics A/L 2023 - 1st Term"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Metadata: Year and Term (for Past Papers) */}
                  {formData.contentType === "past_paper" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year
                        </label>
                        <input
                          type="number"
                          placeholder="2023"
                          value={formData.year}
                          onChange={(e) =>
                            setFormData({ ...formData, year: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Term
                        </label>
                        <select
                          value={formData.term}
                          onChange={(e) =>
                            setFormData({ ...formData, term: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select Term</option>
                          <option value="1st_term">1st Term</option>
                          <option value="2nd_term">2nd Term</option>
                          <option value="3rd_term">3rd Term</option>
                          <option value="annual">Annual</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Unit/Chapter (for Lessons and Notes) */}
                  {(formData.contentType === "lesson" ||
                    formData.contentType === "short_notes") && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit/Chapter
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Mechanics, Thermodynamics"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Brief description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., mechanics, motion, forces"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* File Upload (for PDFs) */}
                  {formData.contentType !== "lecture_video" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.contentType === "past_paper"
                          ? "Upload Question Paper (PDF)"
                          : "Upload File (PDF)"}
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setQuestionFile(e.target.files[0])}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {questionFile && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {questionFile.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Answer Sheet Upload (for Past Papers only) */}
                  {formData.contentType === "past_paper" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Answer Paper (PDF) - Optional
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setAnswerFile(e.target.files[0])}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {answerFile && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {answerFile.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Video URL (for Lecture Videos) */}
                  {formData.contentType === "lecture_video" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video URL (YouTube, Google Drive, etc.)
                      </label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/..."
                        value={formData.videoUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, videoUrl: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              {formData.contentType && (
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    {editingContent ? "Update Content" : "Create Content"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Level
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                {examLevels.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="past_paper">Past Papers</option>
                <option value="lesson">Lessons</option>
                <option value="short_notes">Short Notes</option>
                <option value="lecture_video">Lecture Videos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-lg shadow">
          {filteredContents.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">
                No content found. Click "Add Content" to upload some.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContents.map((content) => (
                    <tr key={content._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {content.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {content.subject.name}
                        <br />
                        <span className="text-xs text-gray-500">
                          {content.subject.examLevel.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {content.contentType.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {content.year || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="text-xs">
                          <div>{content.views || 0} views</div>
                          <div>{content.downloads || 0} downloads</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {content.fileId && (
                            <>
                              <button
                                onClick={() =>
                                  handleView(content.fileId)
                                }
                                className="text-blue-600 hover:text-blue-800"
                                title="View"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDownload(
                                    content.fileId,
                                    content.fileName
                                  )
                                }
                                className="text-green-600 hover:text-green-800"
                                title="Download"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEdit(content)}
                            className="text-purple-600 hover:text-purple-800"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(content._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
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