import { useRef } from "react"

import Button from "./button"
import {
  Bold,
  Code,
  CodeSquare,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Table,
} from "lucide-react"
import { useTextEditor } from "../contexts/textEditor"

export default function TextEditor({ text, setText, extraTools, ...props }) {
  const { textareaRef, insertAtCursor } = useTextEditor()

  return (
    <div className="grid my-2">
      <div
        className={
          "flex flex-wrap gap-1 bg-gray-300 border border-gray-300 rounded-t-sm p-2 " +
          "[&>button]:border-gray-300 [&>button]:px-2 [&>button]:py-1 [&>button>svg]:size-4"
        }
      >
        <Button
          kind="secondary"
          type="button"
          title="Bold"
          onClick={() => insertAtCursor("**", "**")}
        >
          <Bold />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Italic"
          onClick={() => insertAtCursor("_", "_")}
        >
          <Italic />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Heading 1"
          onClick={() => insertAtCursor("# ", "")}
        >
          <Heading1 />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Heading 2"
          onClick={() => insertAtCursor("## ", "")}
        >
          <Heading2 />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Heading 3"
          onClick={() => insertAtCursor("### ", "")}
        >
          <Heading3 />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Heading 4"
          onClick={() => insertAtCursor("#### ", "")}
        >
          <Heading4 />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Heading 5"
          onClick={() => insertAtCursor("##### ", "")}
        >
          <Heading5 />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Heading 6"
          onClick={() => insertAtCursor("###### ", "")}
        >
          <Heading6 />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Inline Code"
          onClick={() => insertAtCursor("`", "`")}
        >
          <Code />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Code block"
          onClick={() => insertAtCursor("```\n", "\n```")}
        >
          <CodeSquare />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Image"
          onClick={() => insertAtCursor("![alt text](image-url)")}
        >
          <Image />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Link"
          onClick={() => insertAtCursor("[text](url)")}
        >
          <Link />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Bullet List"
          onClick={() => insertAtCursor("- item")}
        >
          <List />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Numbered List"
          onClick={() => insertAtCursor("1. item")}
        >
          <ListOrdered />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Quote"
          onClick={() => insertAtCursor("> ", "")}
        >
          <Quote />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Table"
          onClick={() =>
            insertAtCursor(
              "| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |",
            )
          }
        >
          <Table />
        </Button>
        <Button
          kind="secondary"
          type="button"
          title="Horizontal Rule"
          onClick={() => insertAtCursor("\n---\n")}
        >
          <Minus />
        </Button>
        {extraTools}
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(evt) => setText(evt.target.value)}
        className="ring-1 ring-gray-300 px-4 py-2 rounded-b-sm flex-auto"
        rows={6}
        {...props}
      ></textarea>
    </div>
  )
}
