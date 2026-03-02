// src/pages/admin/ManageFeedback.jsx
import { useEffect, useState } from 'react';
import { getAllFeedback, updateFeedback } from '../../services/feedbackService';
import FeedbackCard from '../../components/feedback/FeedbackCard';
import Spinner from '../../components/common/Spinner';

export default function ManageFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchFeedbacks = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filters };
      const res = await getAllFeedback(params);
      setFeedbacks(res.body.feedbacks);
      setPagination(res.body.pagination);
    } catch (error) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks(1);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateFeedback(id, { status });
      fetchFeedbacks(pagination.page);
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Feedback</h1>

        {/* Filters */}
        <div className="card mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Status</label>
            <select name="status" className="input-field" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category" className="input-field" value={filters.category} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="general">General</option>
              <option value="course">Course</option>
              <option value="platform">Platform</option>
              <option value="suggestion">Suggestion</option>
              <option value="bug">Bug</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Search</label>
            <input
              type="text"
              name="search"
              className="input-field"
              placeholder="Search title or content..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <>
            {feedbacks.map(fb => (
              <FeedbackCard key={fb._id} feedback={fb} onUpdate={() => fetchFeedbacks(pagination.page)} />
            ))}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => fetchFeedbacks(p)}
                    className={`px-3 py-1 rounded ${pagination.page === p ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}