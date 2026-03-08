import axios from "axios"
import api from "./api"

const { VITE_API_URL } = import.meta.env

export const getThread = async (threadId) => {
  const response = await api.get(`/forum/${threadId}`)
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
  return response?.body?.thread || {}
}

export const createThread = async (title, body, tags) => {
  const response = await api.post(`/forum`, { title, body, tags })
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
  return response?.body?.thread || {}
}

export const updateThread = async (id, title, body, tags) => {
  const response = await api.put(`/forum/${id}`, { title, body, tags })
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
  return response?.body?.thread || {}
}

export const voteThread = async (threadId, value) => {
  const response = await api.post(`/forum/${threadId}/vote`, { value })
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
  return response?.body?.thread
}

export const unvoteThread = async (threadId) => {
  const response = await api.delete(`/forum/${threadId}/vote`)
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
  return response?.body?.thread
}

export const deleteThread = async (threadId) => {
  const response = await api.delete(`/forum/${threadId}`)
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
}

export const postComment = async (threadId, body) => {
  const response = await api.post(`/forum/${threadId}/comments`, body)
  return response
}

export const updateComment = async (threadId, commentId, body) => {
  const response = await api.patch(`/forum/${threadId}/comments/${commentId}`, {
    body,
  })
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
}

export const voteThreadComment = async (threadId, commentId, value) => {
  const response = await api.post(
    `/forum/${threadId}/comments/${commentId}/vote`,
    { value },
  )
  if (!response.success)
    throw new Error(response?.body || response.statusMessagee)
  return response?.body?.thread
}

export const unvoteThreadComment = async (threadId, commentId) => {
  const response = await api.delete(
    `/forum/${threadId}/comments/${commentId}/vote`,
  )
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
  return response?.body?.thread
}

export const markThreadComment = async (threadId, commentId) => {
  const response = await api.patch(
    `/forum/${threadId}/comments/${commentId}/mark`,
  )
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
  return response?.body?.thread
}

export const unmarkThreadComment = async (threadId, commentId) => {
  const response = await api.delete(
    `/forum/${threadId}/comments/${commentId}/mark`,
  )
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
  return response?.body?.thread
}

export const deleteComment = async (threadId, commentId) => {
  const response = await api.delete(`/forum/${threadId}/comments/${commentId}`)
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
}

export const getForumTags = async (query) => {
  const response = await api.get(`/forum/tags`, {
    params: query ? { q: query } : {},
  })
  return response?.body?.tags ?? []
}

export const createForumTag = async (name, description) => {
  const response = await api.post(`/forum/tags`, { name, description })
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
  return response
}

export const editForumTag = async (originalName, newName, newDescription) => {
  const response = await api.put(`/forum/tags/${originalName}`, {
    name: newName,
    description: newDescription,
  })
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
  return response?.tag
}

export const deleteForumTag = async (name) => {
  const response = await api.delete(`/forum/tags/${name}`)
  if (!response.success)
    throw new Error(response?.body || response.statusMessage)
  return response?.tag
}
