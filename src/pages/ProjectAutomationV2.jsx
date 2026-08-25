import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Filter,
  FolderOpen,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Rocket,
  Search,
  Send,
  Sparkles,
  UserCircle2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

// The search form uses the two automation webhook endpoints directly.
// Existing project loading / candidate preview remains unchanged.


import Toast from "../components/postAssistant/Toast";


/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  "https://linktopus-api.selected.jobs";

const UNIPILE_BASE_URL =
  "https://api.unipile.com/v2/acc_01m09sdddhfetrdm9tzcbqncv1";

const UNIPILE_API_KEY =
  "bKcyr7TB.app_01kznge4wxesmap4y2wk9qnqpv.PN4y1XB4VB1blVpdmZ+94MEM0llrJ5hGbV7MPgrjlr0=";


/* =========================================================
   Constants
========================================================= */


/* =========================================================
   Candidate Card
========================================================= */

function formatYearDate(value) {
  if (!value) return "";
  const text = String(value);
  const match = text.match(/(\d{4})/);
  return match ? match[1] : text;
}

function formatDateRange(startedOn, endedOn) {
  if (!startedOn) return "";
  const start = formatYearDate(startedOn);
  const end = endedOn ? formatYearDate(endedOn) : "Present";
  return `${start} – ${end}`;
}

function CandidateCard({ candidate }) {
  const [showAllExperience, setShowAllExperience] = useState(false);
  const profile = candidate?.profile || candidate || {};
  const experience = Array.isArray(profile.work_experience)
    ? profile.work_experience
    : [];
  const education = Array.isArray(profile.education)
    ? profile.education
    : [];

  const picture =
    profile.public_picture_url_large ||
    profile.public_picture_url ||
    profile.picture_url;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          className="mt-3 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
        />

        {picture ? (
          <img
            src={picture}
            alt={profile.display_name || "Candidate"}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
            {(profile.display_name || "?")
              .split(" ")
              .map((x) => x[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={profile.profile_url || profile.public_profile_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-base font-bold text-blue-600 hover:underline"
            >
              {profile.display_name || "Unknown Candidate"}
            </a>

            {profile.network_distance && (
              <span className="text-xs text-slate-light">
                ◉ · {String(profile.network_distance).replaceAll("_", " ").toLowerCase()}
              </span>
            )}

            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              Sourced
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-ink">
            {profile.headline || ""}
          </p>

          <p className="mt-1 text-xs text-slate-light">
            {[profile.location, profile.industry].filter(Boolean).join(" · ")}
          </p>

          <div className="mt-4 grid grid-cols-[85px_minmax(0,1fr)] gap-x-4 gap-y-5">
            <div className="text-sm font-semibold text-ink">Experience</div>
            <div className="min-w-0">
              {experience.length === 0 ? (
                <span className="text-sm text-slate-light">No experience available</span>
              ) : (
                <div className="space-y-1 text-sm leading-5 text-slate">
                  {(showAllExperience ? experience : experience.slice(0, 10)).map((job, index) => {
                    const company = job?.company?.name || "Unknown company";
                    const title = job?.job_title || "Role";
                    const dates = formatDateRange(job?.started_on, job?.ended_on);
                    return (
                      <div key={`${company}-${title}-${index}`}>
                        <span>{title} at {company}</span>
                        {dates && <span className="italic"> · {dates}</span>}
                      </div>
                    );
                  })}

                  {experience.length > 10 && (
                    <button
                      type="button"
                      onClick={() => setShowAllExperience((value) => !value)}
                      className="mt-1 text-sm font-medium text-slate hover:text-ink"
                    >
                      {showAllExperience ? "Show fewer ︿" : `Show more ∨`}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-sm font-semibold text-ink">Education</div>
            <div className="min-w-0 text-sm leading-5 text-slate">
              {education.length === 0 ? (
                <span className="text-slate-light">No education available</span>
              ) : (
                <div className="space-y-1">
                  {education.map((item, index) => {
                    const school = item?.school?.name || "Unknown school";
                    const degree = item?.degree;
                    const dates = formatDateRange(item?.started_on, item?.ended_on);
                    return (
                      <div key={`${school}-${index}`}>
                        {school}{degree ? `, ${degree}` : ""}
                        {dates && <span className="italic"> · {dates}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


/* =========================================================
   Project Candidates Panel
========================================================= */

function ProjectCandidatesPanel({ project, candidates, isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredCandidates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return candidates;
    return candidates.filter((candidate) => {
      const profile = candidate?.profile || candidate || {};
      const experienceText = (profile.work_experience || [])
        .map((x) => `${x?.job_title || ""} ${x?.company?.name || ""}`)
        .join(" " );
      return [profile.display_name, profile.headline, profile.location, profile.industry, experienceText]
        .filter(Boolean).join(" " ).toLowerCase().includes(term);
    });
  }, [candidates, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const visibleCandidates = filteredCandidates.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [searchTerm, project?.project_id]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  if (!project) {
    return (
      <section className="card flex min-h-[280px] items-center justify-center p-8">
        <div className="text-center">
          <FolderOpen size={38} className="mx-auto text-slate-light" />
          <h3 className="mt-4 font-display text-base font-bold text-ink">Select a project</h3>
          <p className="mt-1 text-sm text-slate-light">Click a project on the left to view its pipeline candidates.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Project Candidates</p>
            <h2 className="mt-1 truncate font-display text-xl font-bold text-ink">{project.project_name || project.name}</h2>
            <p className="mt-1 text-xs text-slate-light">{candidates.length} pipeline candidates loaded</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users size={18} /></div>
        </div>
        {!isLoading && candidates.length > 0 && (
          <div className="relative mt-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search candidate, role, company, location..." className="input-field pl-10" />
          </div>
        )}
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center"><div className="text-center"><Loader2 size={30} className="mx-auto animate-spin text-primary" /><p className="mt-3 text-sm text-slate-light">Loading pipeline candidates...</p></div></div>
        ) : visibleCandidates.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center text-center"><div><Users size={36} className="mx-auto text-slate-light" /><h3 className="mt-3 font-display text-sm font-bold text-ink">No candidates found</h3><p className="mt-1 text-xs text-slate-light">{searchTerm ? "Try a different search." : "This project has no pipeline candidates."}</p></div></div>
        ) : (
          <>
            <div className="space-y-4">
              {visibleCandidates.map((candidate, index) => (
                <CandidateCard key={candidate?.profile?.id || candidate?.profile?.candidate_id || index} candidate={candidate} />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-light">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredCandidates.length)} of {filteredCandidates.length}</p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((v) => Math.max(1, v - 1))} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                <span className="min-w-[72px] text-center text-xs font-semibold text-ink">{page} / {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((v) => Math.min(totalPages, v + 1))} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   Project Candidates Modal
========================================================= */

function ProjectDetailsModal({ project, candidates, isLoading, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredCandidates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return candidates;

    return candidates.filter((candidate) => {
      const profile = candidate?.profile || candidate || {};
      const experienceText = (profile.work_experience || [])
        .map((x) => `${x?.job_title || ""} ${x?.company?.name || ""}`)
        .join(" ");
      const text = [
        profile.display_name,
        profile.headline,
        profile.location,
        profile.industry,
        experienceText,
      ].filter(Boolean).join(" ").toLowerCase();
      return text.includes(term);
    });
  }, [candidates, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const visibleCandidates = filteredCandidates.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl">
        <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl font-bold text-ink">
                {project?.project_name || project?.name || "Project"}
              </h2>
              <p className="mt-1 text-xs text-slate-light">
                {candidates.length} pipeline candidates
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-light hover:bg-surface hover:text-ink"
            >
              <X size={20} />
            </button>
          </div>

          {!isLoading && candidates.length > 0 && (
            <div className="relative mt-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidate, role, company, location..."
                className="input-field pl-10"
              />
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 size={30} className="animate-spin text-primary" />
            </div>
          ) : visibleCandidates.length === 0 ? (
            <div className="flex min-h-[350px] items-center justify-center text-center">
              <div>
                <Users size={36} className="mx-auto text-slate-light" />
                <h3 className="mt-3 font-display text-sm font-bold text-ink">
                  No candidates found
                </h3>
                <p className="mt-1 text-xs text-slate-light">
                  {searchTerm ? "Try a different search." : "This project has no pipeline candidates."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate?.profile?.id || candidate?.profile?.candidate_id || index}
                  candidate={candidate}
                />
              ))}
            </div>
          )}
        </div>

        {!isLoading && filteredCandidates.length > 0 && (
          <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
            <p className="text-xs text-slate-light">
              Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredCandidates.length)} of {filteredCandidates.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="rounded-lg bg-surface px-3 py-2 text-xs font-semibold">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   Main Page
========================================================= */

export default function ProjectAutomationV2() {

  const { email } =
    useAuth();


  /* =======================================================
     Form
  ======================================================= */

  const [projectName, setProjectName] =
    useState("");

  const [jobDescription, setJobDescription] =
    useState("");

  const [isFetchingDetails, setIsFetchingDetails] =
    useState(false);

  const [roles, setRoles] =
    useState([]);

  const [companies, setCompanies] =
    useState([]);

  const [locations, setLocations] =
    useState([]);

  const [inmailMessage, setInmailMessage] =
    useState("");

  const [connectionMessage, setConnectionMessage] =
    useState("");


  /* =======================================================
     Pipeline
  ======================================================= */

  const [isRunning, setIsRunning] =
    useState(false);

  const [toast, setToast] =
    useState(null);

  const [result, setResult] =
    useState(null);


  /* =======================================================
     Existing Projects
  ======================================================= */

  const [projects, setProjects] =
    useState([]);

  const [isLoadingProjects, setIsLoadingProjects] =
    useState(false);

  const [projectsCollapsed, setProjectsCollapsed] =
    useState(false);

  // User can work in one mode at a time:
  // - create: build and run a new outreach pipeline
  // - existing: browse existing projects and their candidates
  const [activeMode, setActiveMode] =
    useState("create");


  /* =======================================================
     Selected Project
  ======================================================= */

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [projectCandidates, setProjectCandidates] =
    useState([]);

  const [isLoadingCandidates, setIsLoadingCandidates] =
    useState(false);


  /* =======================================================
     Load Existing Projects
  ======================================================= */

  async function loadProjects() {
    setIsLoadingProjects(true);

    try {
      const response = await fetch(
        `${UNIPILE_BASE_URL}/linkedin/recruiter/projects?status=ACTIVE&sort_by=NEWEST_TO_OLDEST&limit=100`,
        {
          headers: {
            "X-API-KEY": UNIPILE_API_KEY,
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch projects");
      }

      const json = await response.json();
      const projectList = Array.isArray(json?.data) ? json.data : [];

      setProjects(
        projectList.map((project) => {
          const stages = project?.pipeline?.stages || [];
          const candidateCount = stages.reduce(
            (sum, stage) => sum + Number(stage?.candidates_count || 0),
            0
          );

          return {
            ...project,
            project_id: project.id,
            project_name: project.name,
            candidate_count: candidateCount,
            first_created_at: project.created_at,
          };
        })
      );
    } catch (error) {
      console.error("Load Unipile projects error:", error);
      setToast({
        type: "error",
        message: error?.message || "Couldn't load existing projects.",
      });
    } finally {
      setIsLoadingProjects(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);


  /* =======================================================
     Open Project
  ======================================================= */

  async function handleProjectClick(project) {
    // Selecting an existing project automatically switches to
    // the existing-project workspace, so the run form is hidden.
    setActiveMode("existing");
    setSelectedProject(project);
    setProjectCandidates([]);
    setIsLoadingCandidates(true);

    try {
      const response = await fetch(
        `${UNIPILE_BASE_URL}/linkedin/recruiter/projects/${project.project_id}/pipeline?limit=100`,
        {
          method: "POST",
          headers: {
            "X-API-KEY": UNIPILE_API_KEY,
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch project candidates");
      }

      const data = await response.json();
      setProjectCandidates(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Load Unipile pipeline error:", error);
      setToast({
        type: "error",
        message: error?.message || "Couldn't load project candidates.",
      });
      setSelectedProject(null);
    } finally {
      setIsLoadingCandidates(false);
    }
  }

  function closeProjectModal() {

    setSelectedProject(null);
    setProjectCandidates([]);

  }

  function switchToCreateMode() {
    setActiveMode("create");
    setSelectedProject(null);
    setProjectCandidates([]);
  }

  function switchToExistingMode() {
    setActiveMode("existing");
  }


  /* =======================================================
     Editable Search Values
  ======================================================= */

  function updateRole(index, value) {
    setRoles((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  }

  function addRole() {
    setRoles((prev) => [...prev, ""]);
  }

  function removeRole(index) {
    setRoles((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCompany(index, value) {
    setCompanies((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  }

  function addCompany() {
    setCompanies((prev) => [...prev, ""]);
  }

  function removeCompany(index) {
    setCompanies((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLocation(index, value) {
    setLocations((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  }

  function addLocation() {
    setLocations((prev) => [...prev, ""]);
  }

  function removeLocation(index) {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  }


  /* =======================================================
     Fetch Details
  ======================================================= */

  async function handleFetchDetails() {
    const trimmed = jobDescription.trim();

    if (!trimmed || isFetchingDetails) {
      return;
    }

    setIsFetchingDetails(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/webhook/extract-values`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_description: trimmed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.data) {
        throw new Error(
          data?.message ||
            data?.detail ||
            "Unable to extract values from the job description."
        );
      }

      const extracted = data.data;

      const extractedRoles = Array.isArray(extracted.role)
        ? extracted.role.filter(Boolean)
        : [];

      const extractedCompanies = Array.isArray(extracted.companies)
        ? extracted.companies.filter(Boolean)
        : [];

      const extractedLocations = Array.isArray(extracted.location)
        ? extracted.location.filter(Boolean)
        : [];

      setRoles(extractedRoles);
      setCompanies(extractedCompanies);
      setLocations(extractedLocations);
      setInmailMessage(extracted.inMailMessage || "");
      setConnectionMessage(extracted.connectionNote || "");

      if (!projectName.trim() && extractedRoles.length > 0) {
        setProjectName(extractedRoles[0]);
      }

      setToast({
        type: "success",
        message: `Details loaded: ${extractedRoles.length} roles, ${extractedCompanies.length} companies and ${extractedLocations.length} locations.`,
      });
    } catch (error) {
      console.error("Fetch details error:", error);

      setToast({
        type: "error",
        message:
          error?.message ||
          "Couldn't fetch job details.",
      });
    } finally {
      setIsFetchingDetails(false);

      setTimeout(() => {
        setToast(null);
      }, 3500);
    }
  }


  /* =======================================================
     Run Pipeline
  ======================================================= */

  async function handleRunPipeline() {
    if (isRunning) {
      return;
    }

    const cleanRoles = roles.map((item) => item.trim()).filter(Boolean);
    const cleanCompanies = companies.map((item) => item.trim()).filter(Boolean);
    const cleanLocations = locations.map((item) => item.trim()).filter(Boolean);

    if (!projectName.trim()) {
      setToast({
        type: "error",
        message: "Please enter a project name.",
      });
      return;
    }

    if (!cleanRoles.length) {
      setToast({
        type: "error",
        message: "Please add at least one job role. Click Fetch Details first or add a role manually.",
      });
      return;
    }

    if (!cleanLocations.length) {
      setToast({
        type: "error",
        message: "Please add at least one location.",
      });
      return;
    }

    if (!inmailMessage.trim()) {
      setToast({
        type: "error",
        message: "Please provide an InMail message.",
      });
      return;
    }

    setIsRunning(true);
    setResult(null);

    const payload = {
      project_name: projectName.trim(),
      roles: cleanRoles,
      companies: cleanCompanies,
      locations: cleanLocations,
      inmail_message: inmailMessage.trim(),
      connection_message: connectionMessage.trim(),
      limit: 100,
    };

    console.log("Run Outreach Pipeline payload:", payload);

    try {
      const response = await fetch(
        `${API_BASE_URL}/automation/outreach/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.detail ||
            data?.error ||
            "Couldn't run the outreach pipeline."
        );
      }

      setResult({
        success: true,
        response: data,
      });

      setToast({
        type: "success",
        message:
          data?.message ||
          data?.detail ||
          "Outreach pipeline started successfully.",
      });

      await loadProjects();
    } catch (error) {
      console.error("Outreach pipeline error:", error);

      setResult({
        success: false,
        error: error?.message || "Couldn't run the pipeline.",
      });

      setToast({
        type: "error",
        message: error?.message || "Couldn't run the pipeline.",
      });
    } finally {
      setIsRunning(false);

      setTimeout(() => {
        setToast(null);
      }, 5000);
    }
  }


  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="min-h-screen bg-surface">


      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="bg-primary text-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <Link
              to="/"
              className="text-white/80 hover:text-white"
            >

              <ArrowLeft
                size={18}
              />

            </Link>


            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">

              <Rocket
                size={18}
              />

            </span>


            <h1 className="font-display text-lg font-semibold">
              Project Automation v2
            </h1>

          </div>


          <div className="flex items-center gap-2 text-sm font-medium">

            <UserCircle2
              size={22}
            />

            {email ||
              "Account"}

          </div>

        </div>

      </header>


      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* ===================================================
            WORKSPACE SWITCHER
        =================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={switchToCreateMode}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                activeMode === "create"
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-surface hover:text-primary"
              }`}
            >
              <Rocket size={16} />
              Create Outreach Pipeline
            </button>

            <button
              type="button"
              onClick={switchToExistingMode}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                activeMode === "existing"
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-surface hover:text-primary"
              }`}
            >
              <FolderOpen size={16} />
              View Existing Projects
            </button>
          </div>
        </div>

        {activeMode === "existing" ? (
          <div
            className={`grid grid-cols-1 items-start gap-6 ${
              projectsCollapsed
                ? "lg:grid-cols-[72px_minmax(0,1fr)]"
                : "lg:grid-cols-[360px_minmax(0,1fr)]"
            }`}
          >
            {/* =================================================
                EXISTING PROJECTS
            ================================================= */}
            <aside className="lg:sticky lg:top-6">
              <section className="card overflow-hidden">
                <div className={projectsCollapsed ? "px-2 py-3" : "px-5 py-5"}>
                  {projectsCollapsed ? (
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setProjectsCollapsed(false)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-light hover:bg-surface hover:text-primary"
                        title="Expand projects"
                      >
                        <PanelLeftOpen size={18} />
                      </button>
                      <div className="h-px w-8 bg-slate-200" />
                      <FolderOpen size={18} className="text-primary" />
                      <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-bold">
                        {projects.length}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FolderOpen size={18} />
                        </div>
                        <div>
                          <h2 className="font-display text-base font-bold text-ink">Existing Projects</h2>
                          <p className="text-xs text-slate-light">Select a project to view candidates</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold">{projects.length}</span>
                        <button
                          type="button"
                          onClick={() => setProjectsCollapsed(true)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-light hover:bg-surface hover:text-primary"
                          title="Collapse projects"
                        >
                          <PanelLeftClose size={17} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!projectsCollapsed && (
                  <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-4">
                    {isLoadingProjects ? (
                      <div className="flex justify-center py-10">
                        <Loader2 size={24} className="animate-spin text-primary" />
                      </div>
                    ) : projects.length === 0 ? (
                      <div className="py-10 text-center">
                        <FolderOpen size={25} className="mx-auto text-slate-light" />
                        <p className="mt-3 text-sm font-semibold">No projects yet</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {projects.map((project) => (
                          <button
                            key={project.project_id}
                            type="button"
                            onClick={() => handleProjectClick(project)}
                            className={`group w-full rounded-2xl border p-4 text-left transition-all ${
                              selectedProject?.project_id === project.project_id
                                ? "border-primary bg-primary/[0.04] shadow-sm"
                                : "border-slate-200 bg-white hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selectedProject?.project_id === project.project_id ? "bg-primary/10 text-primary" : "bg-surface text-slate"}`}>
                                <FolderOpen size={17} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-display text-sm font-bold text-ink">{project.project_name}</h3>
                                <p className="mt-2 text-xs text-slate-light">
                                  <Users size={12} className="mr-1 inline" />
                                  {project.candidate_count} candidates
                                </p>
                                {project.first_created_at && (
                                  <p className="mt-1.5 text-[10px] text-slate-light">
                                    Created {new Date(project.first_created_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <span className="text-slate-300 group-hover:text-primary">→</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </aside>

            <div className="min-w-0">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Existing Project Workspace</p>
                  <p className="mt-1 text-sm text-slate-light">Review candidates without accidentally starting a new pipeline.</p>
                </div>
                <button
                  type="button"
                  onClick={switchToCreateMode}
                  className="hidden shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:border-primary/40 hover:text-primary sm:inline-flex"
                >
                  <Rocket size={14} />
                  Create New Pipeline
                </button>
              </div>

              <ProjectCandidatesPanel
                project={selectedProject}
                candidates={projectCandidates}
                isLoading={isLoadingCandidates}
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">New Outreach</p>
                <p className="mt-1 text-sm text-slate-light">Create a new project and start candidate outreach.</p>
              </div>
              <button
                type="button"
                onClick={switchToExistingMode}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:border-primary/40 hover:text-primary"
              >
                <FolderOpen size={14} />
                View Existing
              </button>
            </div>

            <section className="card p-8">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="font-display text-xl font-bold text-ink">
                  Run Outreach Pipeline
                </h2>

                <p className="mt-1 text-sm text-slate-light">
                  Create a project and start candidate outreach.
                </p>

              </div>


              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">

                <Rocket
                  size={19}
                />

              </div>

            </div>


            <div className="mt-7 flex flex-col gap-5">


              {/* =================================================
                  PROJECT
              ================================================= */}

              <div>

                <label className="field-label">
                  Project
                </label>

                <input
                  type="text"
                  value={projectName}
                  onChange={(e) =>
                    setProjectName(
                      e.target.value
                    )
                  }
                  placeholder="Enter project name e.g. GTM Revenue Operations Leader"
                  className="input-field"
                />

              </div>


              {/* =================================================
                  JOB DESCRIPTION
              ================================================= */}

              <div>

                <label className="field-label">
                  Job Description
                </label>

                <textarea
                  value={jobDescription}
                  onChange={(e) =>
                    setJobDescription(
                      e.target.value
                    )
                  }
                  placeholder="Paste the job description here..."
                  rows={6}
                  className="input-field resize-none"
                />


                <button
                  type="button"
                  onClick={
                    handleFetchDetails
                  }
                  disabled={
                    !jobDescription.trim() ||
                    isFetchingDetails
                  }
                  className="btn-primary mt-3 inline-flex items-center gap-2 !px-5 !py-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isFetchingDetails ? (

                    <Loader2
                      size={14}
                      className="animate-spin"
                    />

                  ) : (

                    <Sparkles
                      size={14}
                    />

                  )}


                  {isFetchingDetails
                    ? "Fetching..."
                    : "Fetch Details"}

                </button>

              </div>


              {/* =================================================
                  JOB ROLES
              ================================================= */}

              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label !mb-0">
                    Job Roles
                  </label>

                  <span className="text-xs text-slate-light">
                    Editable extracted roles
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  {roles.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-surface px-4 py-4 text-xs text-slate-light">
                      Click Fetch Details to extract job roles, or add one manually.
                    </div>
                  ) : (
                    roles.map((role, index) => (
                      <div key={`role-${index}`} className="flex gap-2">
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => updateRole(index, e.target.value)}
                          placeholder="Enter job role"
                          className="input-field"
                        />

                        <button
                          type="button"
                          onClick={() => removeRole(index)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-spark text-white"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={addRole}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] px-4 py-3 text-xs font-semibold text-primary hover:bg-primary/10"
                >
                  <Plus size={15} />
                  Add Job Role
                </button>
              </div>


              {/* =================================================
                  TARGET COMPANIES
              ================================================= */}

              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label !mb-0">
                    Target Companies
                  </label>

                  <span className="text-xs text-slate-light">
                    Editable extracted companies
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  {companies.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-surface px-4 py-4 text-xs text-slate-light">
                      Click Fetch Details to extract companies, or add one manually.
                    </div>
                  ) : (
                    companies.map((companyName, index) => (
                      <div key={`company-${index}`} className="flex gap-2">
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => updateCompany(index, e.target.value)}
                          placeholder="Enter company name"
                          className="input-field"
                        />

                        <button
                          type="button"
                          onClick={() => removeCompany(index)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-spark text-white"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={addCompany}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] px-4 py-3 text-xs font-semibold text-primary hover:bg-primary/10"
                >
                  <Plus size={15} />
                  Add Company
                </button>
              </div>


              {/* =================================================
                  LOCATIONS
              ================================================= */}

              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label !mb-0">
                    Locations
                  </label>

                  <span className="text-xs text-slate-light">
                    Editable extracted locations
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  {locations.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-surface px-4 py-4 text-xs text-slate-light">
                      Click Fetch Details to extract locations, or add one manually.
                    </div>
                  ) : (
                    locations.map((location, index) => (
                      <div key={`location-${index}`} className="flex gap-2">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => updateLocation(index, e.target.value)}
                          placeholder="Enter location"
                          className="input-field"
                        />

                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-spark text-white"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={addLocation}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] px-4 py-3 text-xs font-semibold text-primary hover:bg-primary/10"
                >
                  <Plus size={15} />
                  Add Location
                </button>
              </div>

              {/* =================================================
                  INMAIL
              ================================================= */}

              <div>

                <label className="field-label">
                  InMail Message
                </label>

                <textarea
                  value={
                    inmailMessage
                  }
                  onChange={(e) =>
                    setInmailMessage(
                      e.target.value
                    )
                  }
                  placeholder="Enter your InMail message..."
                  rows={5}
                  className="input-field resize-none"
                />

              </div>


              {/* =================================================
                  CONNECTION
              ================================================= */}

              <div>

                <label className="field-label">
                  Connection Message
                </label>

                <textarea
                  value={
                    connectionMessage
                  }
                  onChange={(e) =>
                    setConnectionMessage(
                      e.target.value
                    )
                  }
                  placeholder="Enter your connection message..."
                  rows={5}
                  className="input-field resize-none"
                />

              </div>


              {/* =================================================
                  RUN BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={
                  handleRunPipeline
                }
                disabled={
                  isRunning
                }
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 font-display text-sm font-semibold text-white transition-all hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isRunning ? (

                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                ) : (

                  <Rocket
                    size={16}
                  />

                )}


                {isRunning
  ? "Running Pipeline..."
  : "Run Pipeline"}

              </button>

            </div>

            </section>
          </div>
        )}

        {/* ===================================================
            RESULT
        =================================================== */}

        {activeMode === "create" && result && (

          <section className="card mt-6 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">

                <Rocket
                  size={18}
                />

              </div>


              <div>

                <h3 className="font-display text-sm font-bold text-ink">
                  Pipeline Results
                </h3>

                <p className="text-xs text-slate-light">
                  {result.success
                    ? "Outreach request submitted successfully."
                    : result.error || "The outreach request could not be started."}
                </p>

              </div>

            </div>


          </section>

        )}

      </div>


      <Toast
        toast={toast}
      />

    </div>
  );
}