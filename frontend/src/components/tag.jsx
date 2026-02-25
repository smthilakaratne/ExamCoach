export default function ForumTag({ name, className, ...props }) {
  return (
    <div
      className={
        "px-2 py-1 bg-gray-300 rounded-lg font-bold text-gray-600 text-xs transition-all " +
        (className ?? "")
      }
      {...props}
    >
      # {name}
    </div>
  )
}
