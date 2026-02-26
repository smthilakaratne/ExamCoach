import { ChevronDown, ChevronUp, Eye, SquarePen, Trash } from "lucide-react"
import { Link } from "react-router-dom"
import MarkdownContent from "../../components/markdownContent"
import ForumTag from "../../components/tag"
import { relativeTime } from "../../utils/relativeTime"
import Button from "../../components/button"
import TextEditor from "../../components/textEditor"
import { useState } from "react"
import Container from "../../components/container"
import ThreadReply from "../../components/threadReply"
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { getThread, postComment } from "../../services/forumApi"
import axios from "axios"
import DeleteThreadModel from "./models/deleteThreadModel"

export default function Thread() {
  const [thread, setThread] = useState({})
  const [deleteThreadModelOpen, setDeleteThreadModelOpen] = useState(false)
  const [refreshThread, setRefreshThread] = useState(false)
  const [replyBody, setReplyBody] = useState("")
  const params = useParams()

  useEffect(() => {
    getThread(params.id).then(setThread)
  }, [refreshThread])

  const handlePostComment = async (event) => {
    event.preventDefault()
    const result = await postComment(params.id, { body: replyBody })
    if (result.status === axios.HttpStatusCode.Created) {
      setRefreshThread((prev) => !prev)
      setReplyBody("")
    }
  }

  return (
    <>
      <DeleteThreadModel
        isOpen={deleteThreadModelOpen}
        setIsOpen={setDeleteThreadModelOpen}
        threadId={thread?._id}
      />
      <main className="m-4 mx-28">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold my-5">{thread?.title}</h1>
          <div className="flex gap-1 items-center">
            <div
              className="cursor-pointer p-2 rounded-full hover:bg-red-100 transition-all"
              onClick={() => setDeleteThreadModelOpen(true)}
            >
              <Trash className="size-5 text-red-400 " />
            </div>
            <Link
              to="./edit"
              className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-all"
            >
              <SquarePen className="size-5 text-gray-400" />
            </Link>
          </div>
        </div>
        <section className="flex gap-10 content-start my-8">
          <div>
            <div className="grid justify-center">
              <div className="grid bg-gray-100 rounded-full p-2 cursor-pointer transition-all hover:bg-gray-200">
                <ChevronUp className="size-6" />
              </div>
              <div className="text-xl text-center my-2">
                {(thread?.reactions?.up ?? 0) - (thread?.reactions?.down ?? 0)}
              </div>
              <div className="grid bg-gray-100 rounded-full p-2 cursor-pointer transition-all hover:bg-gray-200">
                <ChevronDown className="size-6" />
              </div>
            </div>
          </div>
          <div className="flex-auto">
            <MarkdownContent content={thread?.body} />
            <div className="flex content-center justify-between mt-10">
              <div className="flex flex-wrap gap-2">
                {(thread?.tags || []).map((tag, index) => (
                  <ForumTag
                    key={`tag-${index}`}
                    name={tag}
                    className="cursor-pointer hover:bg-gray-400"
                  />
                ))}
              </div>
              <div className="flex items-center gap-5">
                <div className="flex justify-end gap-2 items-center text-sm text-gray-500">
                  <div className="w-4 h-4 grid content-center justify-center rounded-full bg-blue-500 text-white text-xs p-3">
                    SP
                  </div>
                  <div>
                    <a>{thread?.createdBy?.name}</a> asked{" "}
                    <abbr title={new Date(thread?.createdAt)?.toString()}>
                      {relativeTime(new Date(thread?.createdAt).getTime())}
                    </abbr>
                  </div>
                </div>
                <div className="flex gap-1 items-center text-sm text-gray-400 ">
                  <Eye className="size-5" />
                  Viewed <b>{thread?.views ?? 0}</b> times
                </div>
              </div>
            </div>
          </div>
        </section>
        <hr />
        <section className="flex justify-between items-center">
          <h3 className="text-xl my-3">
            {thread?.answers?.length ?? 0} Answers
          </h3>
          <div className="flex gap-2 items-center">
            <select className="ring-1 ring-gray-300 px-4 py-2 rounded-sm flex-auto">
              <option>Sort by: Votes</option>
              <option>Sort by: Date</option>
            </select>
            <Button>Answer</Button>
          </div>
        </section>
        <section>
          {(thread?.answers?.length ?? 0) === 0 ? (
            <p className="font-light text-sm text-gray-500 my-5">
              This thread hasn’t been answered yet. Be the first to reply!
            </p>
          ) : (
            (thread?.answers || []).map((reply, index) => (
              <ThreadReply key={`reply-${index}`} {...reply} />
            ))
          )}
        </section>
        <br />
        <section>
          <h3 className="text-xl my-3">Your Answer</h3>
          <form onSubmit={handlePostComment}>
            <TextEditor text={replyBody} setText={setReplyBody} />
            <h5 className="text-base font-bold my-3">Preview</h5>
            <Container className="px-8 mb-5">
              {replyBody.length === 0 ? (
                <p className="font-light text-sm text-gray-500 italic">
                  Nothing to display...
                </p>
              ) : (
                <MarkdownContent content={replyBody} />
              )}
            </Container>
            <Button type="submit">Post your answer</Button>
          </form>
        </section>
      </main>
    </>
  )
}
