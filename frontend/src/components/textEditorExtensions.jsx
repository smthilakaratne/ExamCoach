import { useTextEditor } from "../contexts/textEditor"
import Container from "./container"
import GifProviderComponent, { GifOptionButton } from "./gifProvider"
import MarkdownContent from "./markdownContent"
import TextEditor from "./textEditor"

export default function TextEditorExtensions() {
  const { text, setText, insertAtCursor } = useTextEditor()

  return (
    <>
      <TextEditor
        text={text}
        setText={setText}
        extraTools={
          <>
            <GifOptionButton />
          </>
        }
        minLength={10}
        required
      />
      <GifProviderComponent
        onSelect={(gif) =>
          insertAtCursor(`![${gif.title}](${gif.file.md.gif.url})`)
        }
      />
      <h5 className="text-base font-bold my-3">Preview</h5>
      <Container className="px-8 mb-5">
        {text.length === 0 ? (
          <p className="font-light text-sm text-gray-500 italic">
            Nothing to display...
          </p>
        ) : (
          <MarkdownContent content={text} />
        )}
      </Container>
    </>
  )
}
