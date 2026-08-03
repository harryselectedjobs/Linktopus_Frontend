import api from "./api";

const OUTREACH_PIPELINE_URL =
  "https://linktopus-api.selected.jobs/automation/outreach/run";

export async function runOutreachPipeline({
  projectName,
  keywords,
  inmailMessage,
  connectionMessage,
  limit = 100,
  locationId,
  seniorityInclude = [],
  seniorityExclude = [],
}) {
  const { data } = await api.post(OUTREACH_PIPELINE_URL, {
    project_name: projectName,
    keyword: keywords.filter((k) => k.trim()).join(" AND "),
    inmail_message: inmailMessage,
    connection_message: connectionMessage,
    limit,
    location: locationId ? [{ id: locationId }] : [],
    seniority: {
      include: seniorityInclude,
      exclude: seniorityExclude,
    },
  });
  return data;
}
