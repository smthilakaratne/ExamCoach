import { useEffect, useState } from "react"
import Container from "./container"
import { getTrendingGifs } from "../services/klipyApi"
import { useGifProvider } from "../contexts/gifProvider"

export function GifOptionButton() {
  const { isGifProviderOpen, toggleGifProvider } = useGifProvider()

  return (
    <div className="relative">
      <img
        src="https://avatars.githubusercontent.com/u/194506457?s=200&v=4"
        className="cursor-pointer rounded-sm"
        title="Insert GIFs with KLIPY"
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
  const { isGifProviderOpen, closeGifProvider } = useGifProvider()

  useEffect(() => {
    if (!isGifProviderOpen) return
    getTrendingGifs().then(setGifResults)
  }, [isGifProviderOpen])

  const overridenOnSelect = (selected) => {
    onSelect(selected)
    closeGifProvider()
  }

  return (
    isGifProviderOpen && (
      <Container className="absolute top-10 shadow-xl">
        {gifResults.map((result) => (
          <img
            src={result.file.xs.gif.url}
            alt={result.title}
            title={result.title}
            width={result.file.xs.gif.width}
            height={result.file.xs.gif.height}
            className="inline p-2 rounded-xs cursor-pointer hover:bg-gray-200"
            onClick={() => overridenOnSelect(result)}
          />
        ))}
      </Container>
    )
  )
}
