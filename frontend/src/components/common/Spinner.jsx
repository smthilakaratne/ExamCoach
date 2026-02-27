export default function Spinner({ size = "md" }) {
  const s = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" }
  return (
    <div className="flex items-center justify-center">
      <div className={`${s[size]} border-3 border-indigo-100 border-t-indigo-500 rounded-full animate-spin`} />
    </div>
  )
}