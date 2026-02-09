import { ChevronDown, ChevronUp, Eye } from "lucide-react"
import MarkdownContent from "../components/markdownContent"
import ForumTag from "../components/tag"
import { relativeTime } from "../utils/relativeTime"
import Button from "../components/button"
import TextEditor from "../components/textEditor"
import { useState } from "react"
import Container from "../components/container"
import ThreadReply from "../components/threadReply"

const dummyReply = {
  createdBy: {
    name: "Seniru Pasan",
  },
  date: Date.now(),
  body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Autem beatae molestias eius vero nam! Magni ut accusantium atque, excepturi quis libero dolores, laboriosam doloremque doloribus voluptas provident optio facilis id?",
  reactions: {
    up: 69,
    down: 42,
  },
  isCorrectAnswer: false,
}

const dummyThread = {
  createdBy: {
    name: "Seniru Pasan",
  },
  date: Date.now(),
  title: "Sample thread",
  body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Autem beatae molestias eius vero nam! Magni ut accusantium atque, excepturi quis libero dolores, laboriosam doloremque doloribus voluptas provident optio facilis id?",
  tags: ["tag1", "tag2", "tag3", "tag4"],
  reactions: {
    up: 69,
    down: 42,
  },
  replies: [dummyReply],
  views: 999,
}

export default function Thread() {
  const thread = dummyThread
  const [replyBody, setReplyBody] = useState("")

  return (
    <main className="m-4 mx-28">
      <h1 className="text-4xl font-bold my-5">{thread?.title}</h1>
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
            <div></div>
            <div className="flex items-center gap-5">
              <div className="flex justify-end gap-2 items-center text-sm text-gray-500">
                <div className="w-4 h-4 grid content-center justify-center rounded-full bg-blue-500 text-white text-xs p-3">
                  SP
                </div>
                <div>
                  <a>{thread?.createdBy?.name}</a> asked{" "}
                  <abbr title={new Date(thread?.date)?.toString()}>
                    {relativeTime(thread?.date)}
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
        <h3 className="text-xl my-3">999 Answers</h3>
        <div className="flex gap-2 items-center">
          <select className="ring-1 ring-gray-300 px-4 py-2 rounded-sm flex-auto">
            <option>Sort by: Votes</option>
            <option>Sort by: Date</option>
          </select>
          <Button>Answer</Button>
        </div>
      </section>
      <section>
        {(thread?.replies?.length ?? 0) === 0 ? (
          <p className="font-light text-sm text-gray-500 my-5">
            This thread hasn’t been answered yet. Be the first to reply!
          </p>
        ) : (
          (thread?.replies || []).map((reply, index) => (
            <ThreadReply key={`reply-${index}`} {...reply} />
          ))
        )}
      </section>
      <br />
      <section>
        <h3 className="text-xl my-3">Your Answer</h3>
        <form>
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
  )
}
