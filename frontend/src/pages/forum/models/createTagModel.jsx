import { useState } from "react"
import Button from "../../../components/button"
import OverlayWindow from "../../../components/overlaywindow"
import { createForumTag } from "../../../services/forumApi"

export default function CreateTagModel({ isOpen, setIsOpen, setRefreshTags }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    try {
      await createForumTag(name, description)
      setName("")
      setDescription("")
      setIsOpen(false)
      setRefreshTags((refreshTags) => !refreshTags)
    } catch (error) {}
  }

  return (
    <OverlayWindow isOpen={isOpen} setIsOpen={setIsOpen}>
      <h3 className="text-xl my-2">Create a new tag</h3>
      <p className="text-gray-400 text-sm font-light my-2">
        Check if a similar tag already exists before creating a new one.
      </p>
      <form
        className="grid gap-2 border border-gray-300 rounded-sm p-4"
        onSubmit={handleSubmit}
      >
        <fieldset className="grid">
          <label htmlFor="tagName">Tag name</label>
          <input
            id="tagname"
            type="text"
            className="ring-1 ring-gray-300 px-4 py-2 my-2 rounded-sm flex-auto"
            value={name}
            onChange={(evt) => setName(evt.target.value)}
            required
          />
        </fieldset>
        <fieldset className="grid">
          <label htmlFor="tagDescription">Description</label>
          <textarea
            cols={40}
            className="ring-1 ring-gray-300 px-4 py-2 my-2 rounded-sm flex-auto"
            value={description}
            onChange={(evt) => setDescription(evt.target.value)}
            required
          ></textarea>
        </fieldset>
        <Button type="submit">Create!</Button>
      </form>
    </OverlayWindow>
  )
}
