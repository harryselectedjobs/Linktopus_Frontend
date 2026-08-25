import api from "./api";

export async function extractValuesFromJD(jobDescription) {
  const response = await api.post(
    "/webhook/extract-values",
    {
      job_description: jobDescription,
    }
  );

  return response.data;
}


export async function runOutreachPipeline(payload) {
  const response = await api.post(
    "/automation/outreach/run",
    payload
  );

  return response.data;
}