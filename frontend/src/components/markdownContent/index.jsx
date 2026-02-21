import Markdown from "react-markdown"
import remarkPlugin from "remark-gfm"
import "./styles.css"

export default function MarkdownContent({ content }) {
  return (
    <div className="markdown-content">
      <Markdown remarkPlugins={remarkPlugin}>{content}</Markdown>
    </div>
  )
}
