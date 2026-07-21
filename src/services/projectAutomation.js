import api from "./api";

export async function runAutomation(payload) {
  const { data } = await api.post("/automation/linkedin/campaign", payload);
  return data;
}
