import { SquarePen, Trash, TriangleAlert } from "lucide-react"
import Container from "./container"
import { useState } from "react"
import OverlayWindow from "./overlaywindow"
import Button from "./button"
import { deleteForumTag } from "../services/forumApi"
import CreateEditTagModel from "../pages/forum/models/createEditTagModel"

export default function DetailedTagContainer(props) {
  const [deleteModelOpen, setDeleteModelOpen] = useState(false)
  const [editModelOpen, setEditModelOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteForumTag(props?.name)
      setDeleteModelOpen(false)
      props?.setRefreshTags((prev) => !prev)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <OverlayWindow isOpen={deleteModelOpen} setIsOpen={setDeleteModelOpen}>
        <h3 className="text-xl my-2">Are you sure to delete the thread?</h3>
        <p className="flex gap-1 items-center text-gray-400 text-sm font-light my-2">
          <TriangleAlert className="size-4" />
          <span>This action is irreversible!</span>
        </p>
        <div className="flex gap-2 justify-end my-2">
          <Button kind="danger" onClick={handleDelete}>
            Delete
          </Button>
          <Button kind="secondary" onClick={() => setDeleteModelOpen(false)}>
            Cancel
          </Button>
        </div>
      </OverlayWindow>
      <CreateEditTagModel
        isOpen={editModelOpen}
        setIsOpen={setEditModelOpen}
        setRefreshTags={props?.setRefreshTags}
        isEditting={true}
        originalName={props?.name}
        originalDescription={props?.description}
      />
      <Container>
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-bold my-2"># {props.name}</h4>
          <div className="flex items-center">
            <div
              className="cursor-pointer p-2 rounded-full hover:bg-red-100 transition-all"
              onClick={() => setDeleteModelOpen(true)}
            >
              <Trash className="size-5 text-red-400 " />
            </div>
            <div
              className="cursor-pointer p-2 rounded-full hover:bg-gray-200 transition-all"
              onClick={() => setEditModelOpen(true)}
            >
              <SquarePen className="size-5 text-gray-400" />
            </div>
          </div>
        </div>
        <p>{props.description}</p>
        <div className="mt-5 text-sm text-gray-500">
          <b>{props.relatedTopics ?? 0}</b> related topics
        </div>
      </Container>
    </>
  )
}
