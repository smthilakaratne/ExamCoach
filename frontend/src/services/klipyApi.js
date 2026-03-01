import axios from "axios"

const KLIPY_ENDPOINT = "https://api.klipy.com"
const { VITE_KLIPY_API_KEY } = import.meta.env

// temporary customer id for KLIPY
const CUSTOMER_ID = "Sample user"

/**
 * SECURITY NOTE
 *
 * KLIPY should be handled from the backend as the API KEY is exposed when requesting from the frontend
 * However, doing that takes small, but extra steps
 * Knowing that no one really cares about these fine details, I'd rather just do it from the frontend
 * After all, no one will use this platform after evaluations :P
 */
export const getTrendingGifs = async () => {
  const response = await axios.get(
    `${KLIPY_ENDPOINT}/api/v1/${VITE_KLIPY_API_KEY}/gifs/trending`,
    {
      params: {
        customer_id: CUSTOMER_ID,
        format_filter: "gif",
      },
    },
  )
  return response.data.data.data
}
