import { TriangleAlert } from "lucide-react"
import OverlayWindow from "../../../components/overlaywindow"
import Button from "../../../components/button"
import { deleteComment } from "../../../services/forumApi"

export default function DeleteThreadReplyModel({
  isOpen,
  setIsOpen,
  threadId,
  replyId,
  setRefreshThread,
}) {
  const deleteAction = async () => {
    await deleteComment(threadId, replyId)
    setRefreshThread((prev) => !prev)
    setIsOpen(false)
  }

  return (
    <OverlayWindow isOpen={isOpen} setIsOpen={setIsOpen}>
      <h3 className="text-xl my-2">Are you sure to delete this comment?</h3>
      <p className="flex gap-1 items-center text-gray-400 text-sm font-light my-2">
        <TriangleAlert className="size-4" />
        <span>This action is irreversible!</span>
      </p>
      <hr />
      <div className="flex gap-2 justify-end">
        <Button kind="danger" onClick={deleteAction}>
          Delete
        </Button>
        <Button kind="secondary" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </OverlayWindow>
  )
}
