export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

export const formatTimeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

export const categoryColor = (cat) => {
  const map = {
    general: "bg-gray-100 text-gray-700",
    course: "bg-blue-100 text-blue-700",
    platform: "bg-purple-100 text-purple-700",
    suggestion: "bg-green-100 text-green-700",
    bug: "bg-red-100 text-red-700",
    other: "bg-yellow-100 text-yellow-700",
  }
  return map[cat] || map.general
}

export const statusColor = (status) => {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    reviewed: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  }
  return map[status] || map.pending
}