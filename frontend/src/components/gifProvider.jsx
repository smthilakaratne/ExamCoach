import { useEffect, useRef, useState } from "react"
import Container from "./container"
import { getTrendingGifs, searchGif } from "../services/klipyApi"
import { useGifProvider } from "../contexts/gifProvider"
import Button from "./button"
import { Search } from "lucide-react"

export function GifOptionButton() {
  const { isGifProviderOpen, toggleGifProvider } = useGifProvider()

  return (
    <div className="relative">
      <img
        src="https://avatars.githubusercontent.com/u/194506457?s=200&v=4"
        className="cursor-pointer rounded-sm"
        title="Insert GIFs with KLIPY"
        alt="GIF"
        width={32}
        onClick={toggleGifProvider}
      />
      {isGifProviderOpen && (
        <div className="absolute w-3 h-3 left-1/2 -translate-x-1/2 bg-gray-100 rounded-xs rotate-45" />
      )}
    </div>
  )
}

export default function GifProviderComponent({ onSelect }) {
  const [gifResults, setGifResults] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef()
  const { isGifProviderOpen, closeGifProvider } = useGifProvider()

  useEffect(() => {
    if (!isGifProviderOpen) return
    if (!searchQuery) getTrendingGifs().then(setGifResults)
    else searchGif(searchQuery).then(setGifResults)
  }, [isGifProviderOpen, searchQuery])

  const overridenOnSelect = (selected) => {
    onSelect(selected)
    closeGifProvider()
  }

  const handleInputKeypress = (event) => {
    if (event.code === "Enter") {
      event.preventDefault()
      setSearchQuery(searchRef.current.value)
    }
  }

  return (
    isGifProviderOpen && (
      <Container className="absolute top-10 shadow-xl">
        <div className="flex gap-2 justify-between items-center">
          <input
            type="search"
            className="ring-1 ring-gray-300 bg-white px-4 py-2 rounded-sm flex-auto"
            placeholder="Search KLIPY"
            ref={searchRef}
            onKeyDown={handleInputKeypress}
          />
          <Button
            className="flex gap-2 items-center"
            type="button"
            onClick={() => setSearchQuery(searchRef.current.value)}
          >
            <Search className="size-5" />
            <span>Search</span>
          </Button>
        </div>
        {gifResults.map((result) => (
          <img
            key={result.id}
            src={result.file.xs.gif.url}
            alt={result.title}
            title={result.title}
            width={result.file.xs.gif.width}
            height={result.file.xs.gif.height}
            className="inline m-1 rounded-xs cursor-pointer border-4 border-transparent hover:border-gray-200 bg-cover"
            style={{ backgroundImage: `url(${result.blur_preview})` }}
            onClick={() => overridenOnSelect(result)}
            onLoad={(e) => (e.currentTarget.style.backgroundImage = "")}
          />
        ))}
      </Container>
    )
  )
}
