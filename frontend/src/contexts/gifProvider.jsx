import { createContext, useContext, useState } from "react"

const uninitializedFunction = () =>
  console.warn("GifProvider has not initialized yet")

const GifProviderContext = createContext({
  isGifProviderOpen: false,
  openGifProvider: uninitializedFunction,
  closeGifProvider: uninitializedFunction,
  toggleGifProvider: uninitializedFunction,
})

export const GifProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <GifProviderContext.Provider
      value={{
        isGifProviderOpen: isOpen,
        openGifProvider: () => setIsOpen(true),
        closeGifProvider: () => setIsOpen(false),
        toggleGifProvider: () => setIsOpen((prev) => !prev),
      }}
    >
      {children}
    </GifProviderContext.Provider>
  )
}

export const useGifProvider = () => {
  return useContext(GifProviderContext)
}
