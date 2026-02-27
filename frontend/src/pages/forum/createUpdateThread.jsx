import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import Button from "../../components/button"
import Container from "../../components/container"
import MarkdownContent from "../../components/markdownContent"
import TextEditor from "../../components/textEditor"
import {
  createThread,
  getForumTags,
  getThread,
  updateThread,
} from "../../services/forumApi"
import ForumTag from "../../components/tag"
import { X } from "lucide-react"
import { useRef } from "react"

function TagSelector({ selectedTags, setSelectedTags, ref }) {
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
      ref.current.setCustomValidity("")
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
                onClick={() => {
                  setSelectedTags((prev) => prev.filter((t) => t !== tag))
                  ref.current.setCustomValidity("")
                }}
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
          ref={ref}
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

export default function CreateUpdateThread() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tags, setTags] = useState([])
  const tagRef = useRef()
  const formRef = useRef()
  const { pathname } = useLocation()
  const params = useParams()
  const isCreating = pathname === "/community/forum/new"

  const handleSubmit = async (evt) => {
    tagRef.current.setCustomValidity("")

    if (tags.length > 5) {
      tagRef.current.setCustomValidity("Cannot have more than 5 tags")
    }

    if (!formRef.current.checkValidity()) {
      evt.preventDefault()
      formRef.current.reportValidity()
      return
    }

    evt.preventDefault()

    try {
      let thread
      if (isCreating) thread = await createThread(title, body, tags)
      else thread = await updateThread(params.id, title, body, tags)
      window.location.href = `/community/forum/${thread?._id ?? ""}`
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    // only apply this effect if we are in editting mode (not creating)
    if (isCreating) return
    ;(async () => {
      try {
        const thread = await getThread(params.id)
        setTitle(thread.title)
        setBody(thread.body)
        setTags(thread.tags)
      } catch (error) {
        // todo: too lazy to do full error handling yet
        console.error(error)
      }
    })()
  }, [isCreating])

  return (
    <main>
      <h2 className="text-2xl my-6 font-bold">
        {isCreating ? "Ask a new question" : "Edit thread"}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="border border-gray-300 rounded-sm px-8 py-4"
        ref={formRef}
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
            minLength={5}
            maxLength={120}
            required
          />
        </fieldset>
        <fieldset className="grid my-4">
          <label htmlFor="body" className="font-bold">
            Body
          </label>
          <TextEditor text={body} setText={setBody} minLength={10} />
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
          <TagSelector
            selectedTags={tags}
            setSelectedTags={setTags}
            ref={tagRef}
          />
        </fieldset>
        <Button type="submit">{isCreating ? "Create" : "Update"}</Button>
      </form>
    </main>
  )
}
