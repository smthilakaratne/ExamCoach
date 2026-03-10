import { useState } from "react"
import Button from "../../../components/button"
import OverlayWindow from "../../../components/overlaywindow"
import { createForumTag, editForumTag } from "../../../services/forumApi"

export default function CreateEditTagModel({
  isOpen,
  setIsOpen,
  setRefreshTags,
  isEditting,
  originalName,
  originalDescription,
}) {
  const [name, setName] = useState(originalName || "")
  const [description, setDescription] = useState(originalDescription || "")

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    try {
      if (isEditting) {
        await editForumTag(originalName, name, description)
      } else {
        await createForumTag(name, description)
        setName("")
        setDescription("")
      }
      setIsOpen(false)
      setRefreshTags((refreshTags) => !refreshTags)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <OverlayWindow isOpen={isOpen} setIsOpen={setIsOpen}>
      <h3 className="text-xl my-2">
        {isEditting ? "Edit tag" : "Create a new tag"}
      </h3>
      <p className="text-gray-400 text-sm font-light my-2">
        {isEditting
          ? "Edit your tag details"
          : "Check if a similar tag already exists before creating a new one."}
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
            className="ring-1 ring-gray-300 px-4 py-2 my-2 rounded-sm flex-auto max-w-60 md:max-w-0"
            value={name}
            onChange={(evt) => setName(evt.target.value)}
            minLength={3}
            maxLength={25}
            required
          />
        </fieldset>
        <fieldset className="grid">
          <label htmlFor="tagDescription">Description</label>
          <textarea
            cols={40}
            className="ring-1 ring-gray-300 px-4 py-2 my-2 rounded-sm flex-auto max-w-60 md:max-w-0"
            value={description}
            onChange={(evt) => setDescription(evt.target.value)}
            minLength={10}
            maxLength={2048}
            required
          ></textarea>
        </fieldset>
        <Button type="submit">{isEditting ? "Update" : "Create!"}</Button>
      </form>
    </OverlayWindow>
  )
}
