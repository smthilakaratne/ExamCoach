import { useEffect, useState } from "react";
import axios from "axios";

export default function SubjectManagementPage() {
  const [subjects, setSubjects] = useState([]);
  const [examLevels, setExamLevels] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    examLevel: "",
    opentdbCategory: "",
    description: "",
  });

  useEffect(() => {
    fetchSubjects();
    fetchExamLevels();
  }, []);

  const fetchSubjects = async () => {
    const res = await axios.get("/api/subjects");
    setSubjects(res.data.data || res.data);
  };

  const fetchExamLevels = async () => {
    const res = await axios.get("/api/exam-levels");
    setExamLevels(res.data.data || res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      examLevel: "",
      opentdbCategory: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const details = {
      ...form,
      opentdbCategory: Number(form.opentdbCategory),
    };

    if (editingId) {
      await axios.put(`/api/subjects/${editingId}`, details);
    } else {
      await axios.post("/api/subjects", details);
    }

    resetForm();
    fetchSubjects();
  };

  const handleEdit = (subject) => {
    setEditingId(subject._id);
    setForm({
      name: subject.name,
      code: subject.code,
      examLevel: subject.examLevel?._id || subject.examLevel,
      opentdbCategory: subject.opentdbCategory || "",
      description: subject.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/subjects/${id}`);
    fetchSubjects();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">
          {editingId ? "Edit Subject" : "Add New Subject"}
        </h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Subject Name"
            value={form.name}
            onChange={handleChange}
            className="border rounded-xl p-3"
            required
          />

          <input
            name="code"
            placeholder="Code (e.g. PHY)"
            value={form.code}
            onChange={handleChange}
            className="border rounded-xl p-3"
            required
          />

          <select
            name="examLevel"
            value={form.examLevel}
            onChange={handleChange}
            className="border rounded-xl p-3"
            required
          >
            <option value="">Select Exam Level</option>
            {examLevels.map((level) => (
              <option key={level._id} value={level._id}>
                {level.name}
              </option>
            ))}
          </select>

          <input
            name="opentdbCategory"
            type="number"
            placeholder="OpenTDB Category ID"
            value={form.opentdbCategory}
            onChange={handleChange}
            className="border rounded-xl p-3"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border rounded-xl p-3 md:col-span-2"
            rows={3}
          />

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-3 rounded-xl"
            >
              {editingId ? "Update Subject" : "Create Subject"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 px-5 py-3 rounded-xl"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Existing Subjects</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Code</th>
                <th className="p-3">Exam Level</th>
                <th className="p-3">Category</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject._id} className="border-b">
                  <td className="p-3">{subject.name}</td>
                  <td className="p-3">{subject.code}</td>
                  <td className="p-3">{subject.examLevel?.name || "-"}</td>
                  <td className="p-3">{subject.opentdbCategory}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="bg-yellow-400 px-3 py-1 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
