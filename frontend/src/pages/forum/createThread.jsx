import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Button from "../../components/button"
import Container from "../../components/container"
import MarkdownContent from "../../components/markdownContent"
import TextEditor from "../../components/textEditor"
import { getForumTags } from "../../services/forumApi"
import ForumTag from "../../components/tag"
import { X } from "lucide-react"

const { VITE_API_URL } = import.meta.env

function TagSelector({ selectedTags, setSelectedTags }) {
  const [tagQuery, setTagQuery] = useState("")
  const [tags, setTags] = useState([])

  useEffect(() => {
    getForumTags(tagQuery).then(setTags)
  }, [tagQuery])

  const addTagToList = (tag) => {
    setSelectedTags((prev) => [...prev, tag])
    setTagQuery("")
  }

  const handleInputKeyPress = (evt) => {
    if (evt.key === "Backspace" && !evt.repeat && tagQuery.length === 0) {
      setSelectedTags((prev) => prev.slice(0, -1))
    }
  }

  return (
    <div className="flex-auto">
      <div className="flex items-center border border-gray-300 my-2">
        <div
          className={
            "flex gap-2 items-center rounded-sm py-2 " +
            (selectedTags.length > 0 ? "px-4" : "pl-4")
          }
        >
          {selectedTags.map((tag) => (
            <div className="flex items-center gap-2 bg-gray-300 rounded-sm pr-2">
              <ForumTag name={tag} className="pr-0" />
              <X
                className="size-3 cursor-pointer hover:bg-gray-400 transition-colors rounded-full"
                onClick={() =>
                  setSelectedTags((prev) => prev.filter((t) => t !== tag))
                }
              />
            </div>
          ))}
        </div>
        <input
          type="text"
          id="tags"
          className="pr-4 py-2 flex-auto border-none outline-none focus:outline-none focus:ring-0"
          placeholder={
            selectedTags.length === 0
              ? "Add up to 5 tags. Type a tag and select it from the list."
              : ""
          }
          value={tagQuery}
          onChange={(evt) => setTagQuery(evt.target.value)}
          onKeyDown={handleInputKeyPress}
        />
      </div>
      {tagQuery.length > 0 && (
        <Container className="relative -top-4 border border-gray-300">
          <div className="flex flex-wrap gap-2">
            {tags
              .filter((tag) => !selectedTags.includes(tag.name))
              .map((tag) => (
                <ForumTag
                  name={tag.name}
                  className="cursor-pointer hover:bg-gray-400"
                  onClick={() => addTagToList(tag.name)}
                />
              ))}
          </div>
          {tags.length === 0 && (
            <div className="text-sm text-gray-500 font-light">
              No results found... <Link to="../tags">Check all tags</Link>
            </div>
          )}
        </Container>
      )}
    </div>
  )
}

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
    <main>
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
          <TagSelector selectedTags={tags} setSelectedTags={setTags} />
        </fieldset>
        <Button type="submit">Create</Button>
      </form>
    </main>
  )
}
