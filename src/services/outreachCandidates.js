import api from "./api";

export async function generateJobDescription(userInput) {
  const response = await api.post("/v2-automation/generate-jd", {
    user_input: userInput,
  });

  return response.data;
}

export async function searchCandidates(jdText, cursor = null) {
  const payload = {
    jd_text: jdText,
  };

  if (cursor) {
    payload.cursor = cursor;
  }

  const response = await api.post(
    "/v2-automation/search",
    payload
  );

  return response.data;
}