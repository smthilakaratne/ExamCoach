import { createContext, useContext, useRef, useState } from "react"

const uninitializedFunction = () =>
  console.warn("TextEditorProvider has not initialized yet")

const TextEditorContext = createContext({
  textareaRef: null,
  insertAtCursor: uninitializedFunction,
})

export default function TextEditProvider({ children, text, setText }) {
  const textareaRef = useRef()

  const insertAtCursor = (before, after = "") => {
    console.log(textareaRef)
    const el = textareaRef.current
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = text.slice(start, end)
    const newText =
      text.slice(0, start) + before + selected + after + text.slice(end)
    setText(newText)

    // Put cursor after inserted text
    setTimeout(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + before.length
    }, 0)
  }

  return (
    <TextEditorContext.Provider
      value={{ textareaRef, insertAtCursor, text, setText }}
    >
      {children}
    </TextEditorContext.Provider>
  )
}

export const useTextEditor = () => useContext(TextEditorContext)
