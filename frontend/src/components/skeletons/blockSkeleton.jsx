export default function BlockSkeleton({ className, ...props }) {
  return (
    <div
      className={"bg-gray-200 rounded-sm h-4 my-2 animate-pulse " + className}
      {...props}
    />
  )
}
