import { useState } from "react"
import Button from "../../components/button"
import Container from "../../components/container"
import MarkdownContent from "../../components/markdownContent"
import TextEditor from "../../components/textEditor"

const { VITE_API_URL } = import.meta.env

export default function CreateThread() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tags, setTags] = useState([])

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    const response = await fetch(`${VITE_API_URL}/api/forum`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body, tags }),
    })
    const result = await response.json()
    if (response.ok)
      window.location.href = `/community/forum/${result?.body?.thread?._id ?? ""}`
    else console.error(result)
  }

  return (
    <main className="m-6 mx-28">
      <h2 className="text-2xl my-6 font-bold">Ask a new question</h2>
      <form
        onSubmit={handleSubmit}
        className="border border-gray-300 rounded-sm px-8 py-4"
      >
        <fieldset className="grid my-4">
          <label htmlFor="title" className="font-bold">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="ring-1 ring-gray-300 px-4 py-2 my-2 rounded-sm flex-auto"
            placeholder="Enter your topic's title here"
            value={title}
            onChange={(evt) => setTitle(evt.target.value)}
            required
          />
        </fieldset>
        <fieldset className="grid my-4">
          <label htmlFor="body" className="font-bold">
            Body
          </label>
          <TextEditor text={body} setText={setBody} />
        </fieldset>
        <div>
          <div className="font-bold">Preview</div>
          <Container className="px-8">
            {body.length === 0 ? (
              <p className="font-light text-sm text-gray-500 italic">
                Nothing to display...
              </p>
            ) : (
              <MarkdownContent content={body} />
            )}
          </Container>
        </div>
        <fieldset className="grid my-4">
          <label htmlFor="tags" className="font-bold">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            className="ring-1 ring-gray-300 px-4 py-2 my-2 rounded-sm flex-auto"
            placeholder="Add up to 5 tags. Type a tag and select it from the list."
          />
        </fieldset>
        <Button type="submit">Create</Button>
      </form>
    </main>
  )
}
