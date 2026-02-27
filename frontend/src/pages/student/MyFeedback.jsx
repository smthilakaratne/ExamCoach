// src/pages/student/MyFeedback.jsx
import { useEffect, useState } from 'react';
import { getMyFeedback } from '../../services/feedbackService';
import FeedbackCard from '../../components/feedback/FeedbackCard';
import FeedbackForm from '../../components/feedback/FeedbackForm';
import Spinner from '../../components/common/Spinner';

export default function MyFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchFeedbacks = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getMyFeedback({ page, limit: 10 });
      setFeedbacks(res.body.feedbacks);
      setPagination(res.body.pagination);
    } catch (error) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handlePageChange = (newPage) => {
    fetchFeedbacks(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Feedback</h1>
        <FeedbackForm onSuccess={() => fetchFeedbacks(1)} />
        {loading ? (
          <Spinner />
        ) : (
          <>
            {feedbacks.length === 0 ? (
              <div className="card text-center py-12 text-gray-500">You haven't submitted any feedback yet.</div>
            ) : (
              feedbacks.map(fb => (
                <FeedbackCard key={fb._id} feedback={fb} onUpdate={() => fetchFeedbacks(pagination.page)} />
              ))
            )}
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
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