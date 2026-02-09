import { ArrowBigDown, ArrowBigUp, Eye, MessageSquare } from "lucide-react"
import { relativeTime } from "../utils/relativeTime"
import Container from "./container"
import ForumTag from "./tag"

export default function ForumThread(data) {
  return (
    <Container>
      <h4 className="text-xl font-bold my-2">{data.title}</h4>
      <div className="flex gap-2">
        {(data?.tags || []).map((tag, index) => (
          <ForumTag
            key={`thread-${data.title}-tag-${index}`}
            name={tag}
          ></ForumTag>
        ))}
      </div>
      <div className="flex justify-between items-end mt-4">
        <div className="flex gap-4 items-center">
          <div className="flex gap-1 items-center text-sm text-gray-500">
            <ArrowBigUp className="size-5" />
            <span>{data?.reactions?.up ?? 0}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-500">
            <ArrowBigDown className="size-5" />
            <span>{data?.reactions?.down ?? 0}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-500">
            <Eye className="size-5" />
            <span>{data?.views ?? 0}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-500">
            <MessageSquare className="size-5" />
            <span>{data?.replies ?? 0}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center text-sm text-gray-500">
          <div className="w-4 h-4 grid content-center justify-center rounded-full bg-blue-500 text-white text-xs p-3">
            SP
          </div>
          <div>
            <a>{data.createdBy.name}</a> asked{" "}
            <abbr title={new Date(data?.date)?.toString()}>
              {relativeTime(data.date)}
            </abbr>
          </div>
        </div>
      </div>
    </Container>
  )
}
