import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { relativeTime } from "../utils/relativeTime"
import MarkdownContent from "./markdownContent"
import Container from "./container"

export default function ThreadReply(props) {
  return (
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

      <div className="grid">
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
  )
}
