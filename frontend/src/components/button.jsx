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
        {
          primary: "bg-blue-500 hover:bg-blue-600 text-white ",
          secondary: "bg-white border border-blue-600 hover:bg-gray-100 ",
          danger: "bg-red-500 hover:bg-red-600 text-white ",
          dangerSecondary: "bg-white border border-red-600 hover:bg-gray-100 ",
        }[kind] +
        "rounded-sm px-2 md:px-4 py-2 cursor-pointer transition-all " +
        (className ?? "")
      }
      {...props}
    >
      {children}
    </button>
  )
}
