export default function StatCard({ icon, label, value, color = "indigo", sub }) {
  const styles = {
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-100", val: "text-indigo-700" },
    green:  { bg: "bg-green-50",  icon: "text-green-600",  border: "border-green-100",  val: "text-green-700"  },
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   border: "border-blue-100",   val: "text-blue-700"   },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  border: "border-amber-100",  val: "text-amber-700"  },
    red:    { bg: "bg-red-50",    icon: "text-red-600",    border: "border-red-100",    val: "text-red-700"    },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100", val: "text-purple-700" },
  }
  const s = styles[color] || styles.indigo

  return (
    <div className={`card border ${s.border} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className={`text-3xl font-display font-bold ${s.val}`}>{value ?? "—"}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`${s.bg} p-3 rounded-xl text-xl ${s.icon}`}>{icon}</div>
      </div>
    </div>
  )
}