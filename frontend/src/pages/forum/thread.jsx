import { ChevronDown, ChevronUp, Eye, SquarePen, Trash } from "lucide-react"
import { Link } from "react-router-dom"
import MarkdownContent from "../../components/markdownContent"
import ForumTag from "../../components/tag"
import { relativeTime } from "../../utils/relativeTime"
import Button from "../../components/button"
import { useState } from "react"
import ThreadReply from "../../components/threadReply"
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  getThread,
  postComment,
  unvoteThread,
  voteThread,
} from "../../services/forumApi"
import DeleteThreadModel from "./models/deleteThreadModel"
import { GifProvider } from "../../contexts/gifProvider"
import TextEditProvider from "../../contexts/textEditor"
import TextEditorExtensions from "../../components/textEditorExtensions"
import ProfileImage from "../../components/common/ProfileImage"
import { useAuth } from "../../contexts/AuthContext"

// temporary user


export default function Thread() {
  const [thread, setThread] = useState({})
  const [deleteThreadModelOpen, setDeleteThreadModelOpen] = useState(false)
  const [refreshThread, setRefreshThread] = useState(false)
  const [replyBody, setReplyBody] = useState("")
  const [sortMode, setSortMode] = useState("date")
  const params = useParams()
  const {user} = useAuth()

  const hasUpvoted =
    thread?.reactions?.up?.some((u) => u === user._id) || false
  const hasDownvoted =
    thread?.reactions?.down?.some((u) => u === user._id) || false

  const sortModes = {
    date: (a1, a2) => new Date(a1?.createdAt) - new Date(a2?.createdAt),
    votes: (a1, a2) =>
      (a2.reactions.up.length ?? 0) -
      (a2.reactions.down.length ?? 0) -
      ((a1.reactions.up.length ?? 0) - (a1.reactions.down.length ?? 0)),
  }

  const sortedAnswers = (thread?.answers ?? []).sort(sortModes[sortMode])

  useEffect(() => {
    getThread(params.id).then(setThread)
  }, [refreshThread])

  const handlePostComment = async (event) => {
    event.preventDefault()
    const result = await postComment(params.id, { body: replyBody })
    if (result.success) {
      setRefreshThread((prev) => !prev)
      setReplyBody("")
    }
  }

  const handleVote = async (value) => {
    try {
      if (value === 1) {
        if (hasUpvoted) await unvoteThread(params.id)
        else await voteThread(params.id, value)
      } else {
        if (hasDownvoted) await unvoteThread(params.id)
        else await voteThread(params.id, value)
      }
      setRefreshThread((prev) => !prev)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <DeleteThreadModel
        isOpen={deleteThreadModelOpen}
        setIsOpen={setDeleteThreadModelOpen}
        threadId={thread?._id}
      />
      <main>
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
                <ChevronUp
                  className={"size-6" + (hasUpvoted && " text-blue-500")}
                  onClick={() => handleVote(1)}
                />
              </div>
              <div className="text-xl text-center my-2">
                {(thread?.reactions?.up?.length ?? 0) -
                  (thread?.reactions?.down?.length ?? 0)}
              </div>
              <div className="grid bg-gray-100 rounded-full p-2 cursor-pointer transition-all hover:bg-gray-200">
                <ChevronDown
                  className={"size-6" + (hasDownvoted && " text-blue-500")}
                  onClick={() => handleVote(-1)}
                />
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
                  <ProfileImage user={thread?.createdBy || {}} size={5} />
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
            <select
              className="ring-1 ring-gray-300 px-4 py-2 rounded-sm flex-auto"
              onChange={(evt) => setSortMode(evt.target.value)}
            >
              <option value="date">Sort by: Date</option>
              <option value="votes">Sort by: Votes</option>
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
            sortedAnswers.map((reply, index) => (
              <ThreadReply
                index={index}
                key={`reply-${index}`}
                threadId={thread?._id}
                {...reply}
                setRefreshThread={setRefreshThread}
              />
            ))
          )}
        </section>
        <br />
        <section>
          <h3 className="text-xl my-3">Your Answer</h3>
          <form onSubmit={handlePostComment} className="relative">
            <TextEditProvider text={replyBody} setText={setReplyBody}>
              <GifProvider>
                <TextEditorExtensions />
              </GifProvider>
            </TextEditProvider>
            <Button type="submit">Post your answer</Button>
          </form>
        </section>
      </main>
    </>
  )
}
