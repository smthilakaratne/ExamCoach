export default function ProfileImage({ user, size }) {
  return (
    <div
      className={
        "rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold " +
        `w-${size} h-${size}`
      }
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt="avatar"
          className={"rounded-full object-cover " + `w-${size} h-${size}`}
        />
      ) : (
        user.name?.charAt(0).toUpperCase() || "U"
      )}
    </div>
  )
}
