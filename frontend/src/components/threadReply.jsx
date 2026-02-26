import { Check, ChevronDown, ChevronUp, SquarePen, Trash } from "lucide-react"
import { relativeTime } from "../utils/relativeTime"
import MarkdownContent from "./markdownContent"
import Container from "./container"
import { useState } from "react"
import DeleteThreadReplyModel from "../pages/forum/models/deleteThreadReplyModel"

export default function ThreadReply(props) {
  const [deleteModelOpen, setDeleteModelOpen] = useState(false)

  return (
    <>
      <DeleteThreadReplyModel
        isOpen={deleteModelOpen}
        setIsOpen={setDeleteModelOpen}
        threadId={props?.threadId}
        replyId={props?._id}
        setRefreshThread={props?.setRefreshThread}
      />
      <Container className="flex gap-10 mt-4">
        <div>
          <div className="grid justify-center">
            <div className="grid bg-white rounded-full p-2 cursor-pointer transition-all hover:bg-gray-200">
              <ChevronUp className="size-6" />
            </div>
            <div className="text-xl text-center my-2">
              {(props?.reactions?.up ?? 0) - (props?.reactions?.down ?? 0)}
            </div>
            <div className="grid bg-white rounded-full p-2 cursor-pointer transition-all hover:bg-gray-200">
              <ChevronDown className="size-6" />
            </div>
            {props.isCorrectAnswer && (
              <div className="grid justify-center mt-5">
                <Check className="text-lime-500" />
              </div>
            )}
          </div>
        </div>

        <div className="grid flex-auto">
          <div className="flex gap-2 items-center justify-end">
            <div
              className="cursor-pointer p-2 rounded-full hover:bg-red-100 transition-all"
              onClick={() => setDeleteModelOpen(true)}
            >
              <Trash className="size-5 text-red-400 " />
            </div>
            <div
              to="./edit"
              className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-all"
            >
              <SquarePen className="size-5 text-gray-400" />
            </div>
          </div>
          <MarkdownContent content={props?.body} />
          <div className="flex gap-2 justify-end items-center text-sm text-gray-500">
            <div className="w-4 h-4 grid content-center justify-center rounded-full bg-blue-500 text-white text-xs p-3">
              SP
            </div>
            <div>
              <a>{props?.createdBy?.name}</a> replied{" "}
              <abbr title={new Date(props?.createdAt).toString()}>
                {relativeTime(new Date(props.createdAt).getTime())}
              </abbr>
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
