import api from "./api";

export async function runAutomation(payload) {
  const { data } = await api.post("/project-automation/run", payload);
  return data;
}
