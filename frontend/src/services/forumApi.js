import axios from "axios"

const { VITE_API_URL } = import.meta.env

export const getThread = async (threadId) => {
  const response = await axios.get(`${VITE_API_URL}/api/forum/${threadId}`)
  if (response.status !== axios.HttpStatusCode.Ok)
    throw new Error(response?.data?.body || response.statusText)
  return response?.data?.body?.thread || {}
}

export const createThread = async (title, body, tags) => {
  const response = await axios.post(
    `${VITE_API_URL}/api/forum`,
    JSON.stringify({ title, body, tags }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
  if (response.status !== axios.HttpStatusCode.Created)
    throw new Error(response?.data?.body || response.statusText)
  return response?.data?.body?.thread || {}
}

export const updateThread = async (id, title, body, tags) => {
  const response = await axios.put(
    `${VITE_API_URL}/api/forum/${id}`,
    JSON.stringify({ title, body, tags }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
  if (response.status !== axios.HttpStatusCode.Ok)
    throw new Error(response?.data?.body || response.statusText)
  return response?.data?.body?.thread || {}
}

export const voteThread = async (threadId, value) => {
  const response = await axios.post(
    `${VITE_API_URL}/api/forum/${threadId}/vote`,
    JSON.stringify({ value }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
  if (response.status !== axios.HttpStatusCode.Ok)
    throw new Error(response?.data?.body || response.statusText)
  return response?.data?.body?.thread
}

export const unvoteThread = async (threadId) => {
  const response = await axios.delete(
    `${VITE_API_URL}/api/forum/${threadId}/vote`,
  )
  if (response.status !== axios.HttpStatusCode.Ok)
    throw new Error(response?.data?.body || response.statusText)
  return response?.data?.body?.thread
}

export const deleteThread = async (threadId) => {
  const response = await axios.delete(`${VITE_API_URL}/api/forum/${threadId}`)
  if (response.status !== axios.HttpStatusCode.Ok)
    throw new Error(response?.data?.body || response.statusText)
}

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

export const updateComment = async (threadId, commentId, body) => {
  const response = await axios.patch(
    `${VITE_API_URL}/api/forum/${threadId}/comments/${commentId}`,
    JSON.stringify({ body }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
  if (response.status !== axios.HttpStatusCode.Ok)
    throw new Error(response?.data?.body || response.statusText)
}

export const deleteComment = async (threadId, commentId) => {
  const response = await axios.delete(
    `${VITE_API_URL}/api/forum/${threadId}/comments/${commentId}`,
  )
  if (response.status !== axios.HttpStatusCode.Ok)
    throw new Error(response?.data?.body || response.statusText)
}

export const getForumTags = async (query) => {
  const response = await axios.get(`${VITE_API_URL}/api/forum/tags`, {
    params: query ? { q: query } : {},
  })
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
