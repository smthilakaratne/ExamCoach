import { ReactNode, HTMLAttributes } from "react"

/**
 * @param {{
 *   children: ReactNode,
 *   className: string,
 * } & HTMLAttributes<HTMLDivElement>} props
 */
export default function Container({ children, className, ...props }) {
  return (
    <div
      className={"p-4 bg-gray-100 rounded-sm shadow-2xs my-2 " + className}
      {...props}
    >
      {children}
    </div>
  )
}
