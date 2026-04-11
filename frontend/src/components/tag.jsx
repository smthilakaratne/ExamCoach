import { Link } from "react-router-dom";

export default function ForumTag({ name, allowNavigate, className, ...props }) {
  return (
    <Link
      to={allowNavigate ? `/community/forum?tags=${name}` : "#"}
      className={
        "px-2 py-1 bg-gray-300 rounded-lg font-bold text-gray-600 text-xs transition-all " +
        (className ?? "")
      }
      {...props}
    >
      # {name}
    </Link>
  )
}
