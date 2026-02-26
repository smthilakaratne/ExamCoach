import { TriangleAlert } from "lucide-react"
import OverlayWindow from "../../../components/overlaywindow"
import Button from "../../../components/button"
import { deleteThread } from "../../../services/forumApi"

export default function DeleteThreadModel({ isOpen, setIsOpen, threadId }) {
  const deleteThreadAction = async () => {
    await deleteThread(threadId)
    setIsOpen(false)
    window.location.href = "/community/forum"
  }

  return (
    <OverlayWindow isOpen={isOpen} setIsOpen={setIsOpen}>
      <h3 className="text-xl my-2">Are you sure to delete the thread?</h3>
      <p className="flex gap-1 items-center text-gray-400 text-sm font-light my-2">
        <TriangleAlert className="size-4" />
        <span>This action is irreversible!</span>
      </p>
      <hr />
      <div className="flex gap-2 justify-end">
        <Button kind="danger" onClick={deleteThreadAction}>
          Delete
        </Button>
        <Button kind="secondary" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </OverlayWindow>
  )
}
