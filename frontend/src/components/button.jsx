import { ReactNode, ButtonHTMLAttributes } from "react"

/**
 * @param {{
 *   children: ReactNode,
 *   className: string,
 *   kind: string,
 * } & ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({
  children,
  className,
  kind = "primary",
  ...props
}) {
  return (
    <button
      className={
        (kind === "primary"
          ? "bg-blue-500 hover:bg-blue-600 text-white "
          : "bg-white border border-blue-600 hover:border-blue-600 ") +
        "rounded-sm px-4 py-2 cursor-pointer transition-all " +
        (className ?? "")
      }
      {...props}
    >
      {children}
    </button>
  )
}
