import api from "./api";

/* =========================================================
   Linktopus API
========================================================= */

const OUTREACH_PIPELINE_URL =
  "https://linktopus-api.selected.jobs/automation/outreach/run";

const EXTRACT_JOB_DETAILS_URL =
  "https://linktopus-api.selected.jobs/webhook/extract-job-title-and-skills";

/* =========================================================
   Unipile
========================================================= */

const UNIPILE_API_KEY =
  import.meta.env.VITE_UNIPILE_API_KEY;

const UNIPILE_ACCOUNT_ID =
  import.meta.env.VITE_UNIPILE_ACCOUNT_ID;

const UNIPILE_BASE_URL =
  "https://api40.unipile.com:17060";

/* =========================================================
   Extract Job Details
========================================================= */

export async function extractJobTitleAndSkills(
  jobDescription
) {
  const { data } = await api.post(
    EXTRACT_JOB_DETAILS_URL,
    {
      job_description: jobDescription,
    }
  );

  return data;
}

/* =========================================================
   Normalize Seniority
========================================================= */

function normalizeSeniority(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const mapping = {
    /* Executive / VP */
    vp: "vp",
    vice_president: "vp",
    vicepresident: "vp",
    executive: "executive",

    /* Director */
    director: "director",

    /* Manager */
    manager: "manager",

    /* Senior */
    senior: "mid_senior",
    senior_level: "mid_senior",
    mid_senior: "mid_senior",
    mid_senior_level: "mid_senior",

    /* Associate */
    associate: "associate",

    /* Entry */
    entry: "entry",
    entry_level: "entry",

    /* Intern */
    intern: "intern",
    internship: "intern",
  };

  return (
    mapping[normalized] ||
    normalized
  );
}

/* =========================================================
   Resolve LinkedIn Company
========================================================= */

/*
 * Example:
 *
 * ServiceNow
 *     ↓
 * GET /linkedin/search/parameters
 *     ?keywords=ServiceNow
 *     &type=COMPANY
 *     &account_id=...
 *
 * IMPORTANT:
 * We always use the FIRST result.
 */

export async function resolveLinkedInCompany(
  companyName
) {
  if (!companyName?.trim()) {
    throw new Error(
      "Company name is required."
    );
  }

  if (!UNIPILE_API_KEY) {
    throw new Error(
      "VITE_UNIPILE_API_KEY is not configured."
    );
  }

  if (!UNIPILE_ACCOUNT_ID) {
    throw new Error(
      "VITE_UNIPILE_ACCOUNT_ID is not configured."
    );
  }

  const response =
    await api.get(
      `${UNIPILE_BASE_URL}/api/v1/linkedin/search/parameters`,
      {
        params: {
          keywords:
            companyName.trim(),

          type: "COMPANY",

          account_id:
            UNIPILE_ACCOUNT_ID,

          limit: 10,
        },

        headers: {
          "X-API-KEY":
            UNIPILE_API_KEY,

          accept:
            "application/json",
        },
      }
    );

  const items =
    response?.data?.items || [];

  if (!items.length) {
    throw new Error(
      `No LinkedIn company found for "${companyName}".`
    );
  }

  /*
   * ALWAYS use first result.
   */

  const firstResult =
    items[0];

  return {
    name:
      companyName.trim(),

    id:
      String(firstResult.id),

    matchedTitle:
      firstResult.title || "",

    pictureUrl:
      firstResult.picture_url || "",
  };
}

/* =========================================================
   Run BULK Outreach Pipeline
========================================================= */

/*
 * IMPORTANT
 *
 * This function makes ONLY ONE request to:
 *
 * POST /automation/outreach/run
 *
 * All companies are included in:
 *
 * past_company
 *
 * and
 *
 * current_company
 *
 */

export async function runOutreachPipeline({
  projectName,
  keywords = [],
  inmailMessage = "",
  connectionMessage = "",
  limit = 100,
  locations = [],
  seniorityInclude = [],
  seniorityExclude = [],
  companyIds = [],
}) {
  /* =======================================================
     Validate Project
  ======================================================= */

  if (!projectName?.trim()) {
    throw new Error(
      "Project name is required."
    );
  }

  /* =======================================================
     Clean Company IDs
  ======================================================= */

  const cleanCompanyIds = [
    ...new Set(
      companyIds
        .filter(Boolean)
        .map((id) =>
          Number(id)
        )
        .filter(
          (id) =>
            !Number.isNaN(id)
        )
    ),
  ];

  if (!cleanCompanyIds.length) {
    throw new Error(
      "At least one LinkedIn company ID is required."
    );
  }

  /* =======================================================
     Clean Keywords
  ======================================================= */

  const cleanKeywords =
    keywords
      .filter(
        (keyword) =>
          keyword &&
          keyword.trim()
      )
      .map(
        (keyword) =>
          keyword.trim()
      );

  const keywordString =
    cleanKeywords.join(
      " AND "
    );

  /* =======================================================
     Locations
  ======================================================= */

  const cleanLocations =
    locations
      .filter(
        (location) =>
          location?.id
      )
      .map(
        (location) => ({
          id: Number(
            location.id
          ),
        })
      );

  /* =======================================================
     Seniority
  ======================================================= */

  const seniority = {
    include:
      seniorityInclude || [],
  };

  if (
    seniorityExclude &&
    seniorityExclude.length > 0
  ) {
    seniority.exclude =
      seniorityExclude;
  }

  /* =======================================================
     Company Objects
  ======================================================= */

  const companyObjects =
    cleanCompanyIds.map(
      (companyId) => ({
        id: companyId,
        priority:
          "CAN_HAVE",
      })
    );

  /* =======================================================
     FINAL PAYLOAD
  ======================================================= */

  const payload = {
    project_name:
      projectName.trim(),

    keyword:
      keywordString,

    inmail_message:
      inmailMessage,

    connection_message:
      connectionMessage,

    limit,

    location:
      cleanLocations,

    seniority,

    /*
     * ALL companies
     * in ONE array
     */

    past_company:
      companyObjects,

    /*
     * ALL companies
     * in ONE array
     */

    current_company:
      companyObjects,
  };

  console.log(
    "=========================================="
  );

  console.log(
    "🚀 BULK OUTREACH PIPELINE"
  );

  console.log(
    "Companies:",
    cleanCompanyIds.length
  );

  console.log(
    "Company IDs:",
    cleanCompanyIds
  );

  console.log(
    "Payload:",
    JSON.stringify(
      payload,
      null,
      2
    )
  );

  console.log(
    "=========================================="
  );

  /* =======================================================
     ONE API CALL ONLY
  ======================================================= */

  const { data } =
    await api.post(
      OUTREACH_PIPELINE_URL,
      payload
    );

  return data;
}

/* =========================================================
   Export Seniority Helper
========================================================= */

export {
  normalizeSeniority,
};