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

export const getForumTags = async () => {
  const response = await axios.get(`${VITE_API_URL}/api/forum/tags`)
  return response?.data?.body?.tags ?? []
}

export const createForumTag = async (name, description) => {
  const response = await axios.post(
    `${VITE_API_URL}/api/forum/tags`,
    { name, description },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
  if (response.status !== axios.HttpStatusCode.Created)
    throw new Error(response?.data?.body || response.statusText)
  return response.data
}
