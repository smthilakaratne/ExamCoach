import axios from "axios"

const { VITE_API_URL } = import.meta.env

export const postComment = async (threadId, body) => {
  const response = await axios.post(
    `${VITE_API_URL}/api/forum/${threadId}/comments`,
    JSON.stringify(body),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
  return response
}
