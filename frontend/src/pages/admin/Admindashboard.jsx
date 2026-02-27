import { useState, useEffect } from "react"
import AdminSidebar from "../../components/common/AdminSidebar"
import Navbar from "../../components/common/Navbar"
import StatCard from "../../components/common/StatCard"
import { getUserStats } from "../../services/userService"
import { getFeedbackStats } from "../../services/feedbackService"
import { GraduationCap, BookOpen, FileText, Users, MessageSquare, CheckCircle, Clock, XCircle } from "lucide-react"
import Button from "../../components/button"
import Spinner from "../../components/common/Spinner"

export default function AdminDashboard() {
  const [uStats, setUStats] = useState(null)
  const [fStats, setFStats] = useState(null)
  const [contentStats, setContentStats] = useState({ levels: 0, subjects: 0, contents: 0, downloads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [u, f, levelsRes, subjectsRes, contentsRes] = await Promise.all([
          getUserStats(),
          getFeedbackStats(),
          window.fetch("http://localhost:5001/api/exam-levels"),
          window.fetch("http://localhost:5001/api/subjects"),
          window.fetch("http://localhost:5001/api/contents"),
        ])
        setUStats(u.data.body)
        setFStats(f.data.body)
        const ld = await levelsRes.json(); const sd = await subjectsRes.json(); const cd = await contentsRes.json()
        setContentStats({
          levels: ld.body?.length || 0,
          subjects: sd.body?.length || 0,
          contents: cd.body?.length || 0,
          downloads: cd.body?.reduce((s, c) => s + (c.downloads || 0), 0) || 0,
        })
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="ml-60 flex-1 p-8 min-w-0">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-gray-900">Admin Overview</h1>
            <p className="text-gray-500 text-sm mt-0.5">Platform statistics and management</p>
            <Link to="/mock-exam/add-questions">
              <Button kind="primary">
                Add Questions
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : (
            <>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Content</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={<GraduationCap className="w-5 h-5" />} label="Exam Levels" value={contentStats.levels} color="indigo" />
                <StatCard icon={<BookOpen className="w-5 h-5" />} label="Subjects" value={contentStats.subjects} color="blue" />
                <StatCard icon={<FileText className="w-5 h-5" />} label="Total Content" value={contentStats.contents} color="purple" />
                <StatCard icon={<FileText className="w-5 h-5" />} label="Downloads" value={contentStats.downloads} color="green" />
              </div>

              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Users</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={uStats?.total} color="indigo" />
                <StatCard icon={<Users className="w-5 h-5" />} label="Students" value={uStats?.students} color="blue" />
                <StatCard icon={<Users className="w-5 h-5" />} label="Active Accounts" value={uStats?.active} color="green" />
                <StatCard icon={<Users className="w-5 h-5" />} label="Verified Emails" value={uStats?.verified} color="purple" />
              </div>

              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Feedback</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={<MessageSquare className="w-5 h-5" />} label="Total Feedback" value={fStats?.total} color="indigo" />
                <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={fStats?.pending} color="amber" />
                <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Resolved" value={fStats?.resolved} color="green" />
                <StatCard icon={<XCircle className="w-5 h-5" />} label="Rejected" value={fStats?.rejected} color="red" />
              </div>

              {fStats?.categoryBreakdown?.length > 0 && (
                <div className="card border border-gray-100">
                  <h3 className="font-display font-bold text-gray-900 mb-4">Feedback by Category</h3>
                  <div className="space-y-3">
                    {fStats.categoryBreakdown.map(({ _id, count }) => (
                      <div key={_id} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 capitalize w-20">{_id}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${fStats.total ? (count / fStats.total) * 100 : 0}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}