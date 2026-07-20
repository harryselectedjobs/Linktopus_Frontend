import axios from "axios";

const unipile = axios.create({
  baseURL: import.meta.env.VITE_UNIPILE_BASE_URL,
  headers: {
    accept: "application/json",
    "X-API-KEY": import.meta.env.VITE_UNIPILE_API_KEY,
  },
});

export async function searchLinkedinParameters(keywords, type) {
  const { data } = await unipile.get("/api/v1/linkedin/search/parameters", {
    params: {
      keywords,
      type,
      account_id: import.meta.env.VITE_UNIPILE_ACCOUNT_ID,
    },
  });
  return data.items;
}
