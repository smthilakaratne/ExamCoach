export default function CircleSkeleton({ size, className }) {
  return (
    <div
      className={
        "bg-gray-200 rounded-full animate-pulse " +
        `w-${size} h-${size} ` +
        className
      }
    />
  )
}
