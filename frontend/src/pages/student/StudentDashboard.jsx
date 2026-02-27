// src/pages/student/StudentDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyFeedback } from '../../services/feedbackService';
import StatCard from '../../components/common/StatCard';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getMyFeedback({ limit: 1000 }); // get all to count
        const feedbacks = res.body.feedbacks;
        setStats({
          total: feedbacks.length,
          pending: feedbacks.filter(f => f.status === 'pending').length,
          resolved: feedbacks.filter(f => f.status === 'resolved').length,
        });
      } catch (error) {} finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner fullPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-500 mb-8">Track your learning progress and manage feedback.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<MessageSquare />} label="Total Feedback" value={stats.total} color="indigo" />
          <StatCard icon={<Clock />} label="Pending" value={stats.pending} color="amber" />
          <StatCard icon={<CheckCircle />} label="Resolved" value={stats.resolved} color="green" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <p className="text-gray-500">Coming soon: your recent study sessions, downloads, etc.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            <p className="text-gray-500">You have no new notifications.</p>
          </div>
        </div>
      </div>
    </div>
  );
}