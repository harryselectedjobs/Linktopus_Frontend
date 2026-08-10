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

import {
  extractJobTitleAndSkills,
  resolveLinkedInCompany,
  runOutreachPipeline,
  normalizeSeniority,
} from "../services/outreachPipeline";

import Toast from "../components/postAssistant/Toast";

import SearchField from "../components/projectAutomation/SearchField";

import SeniorityBucketBox from "../components/projectAutomation/SeniorityBucketBox";


/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  "https://linktopus-api.selected.jobs";


/* =========================================================
   Constants
========================================================= */

const EMPTY_PARAM = {
  id: "",
  title: "",
};


/* =========================================================
   Read Only Field
========================================================= */

function ReadOnlyField({
  label,
  value,
}) {

  return (
    <div>

      <label className="field-label">
        {label}
      </label>

      <input
        type="text"
        value={value || ""}
        readOnly
        disabled
        className="input-field cursor-not-allowed bg-surface text-slate-light"
      />

    </div>
  );
}


/* =========================================================
   Candidate Card
========================================================= */

function CandidateCard({
  candidate,
}) {

  const inmailSent =
    candidate.inmail_sent === true;

  const connectionSent =
    candidate.connection_sent === true;


  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-primary/30 hover:shadow-lg">

      <div className="flex items-start gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">

          {candidate.full_name
            ?.split(" ")
            .map(
              (name) =>
                name[0]
            )
            .slice(0, 2)
            .join("")
            .toUpperCase() || "?"}

        </div>


        <div className="min-w-0 flex-1">

          <h4 className="truncate font-display text-sm font-bold text-ink">
            {candidate.full_name ||
              "Unknown Candidate"}
          </h4>

          {candidate.public_identifier && (

            <p className="mt-0.5 truncate text-xs text-slate-light">
              @{candidate.public_identifier}
            </p>

          )}

        </div>


        {candidate.network_distance && (

          <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-slate-light">

            {candidate.network_distance.replace(
              "_",
              " "
            )}

          </span>

        )}

      </div>


      {candidate.headline && (

        <p className="mt-4 line-clamp-3 text-sm leading-5 text-slate">
          {candidate.headline}
        </p>

      )}


      {candidate.location && (

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-light">

          <span>📍</span>

          <span>
            {candidate.location}
          </span>

        </div>

      )}


      <div className="mt-4 flex flex-wrap gap-2">

        {inmailSent ? (

          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700">

            <Send size={11} />

            InMail Sent

          </span>

        ) : (

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-500">

            <Send size={11} />

            InMail Not Sent

          </span>

        )}


        {connectionSent ? (

          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-semibold text-indigo-700">

            <UserPlus size={11} />

            Connection Sent

          </span>

        ) : (

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-500">

            <UserPlus size={11} />

            Connection Not Sent

          </span>

        )}

      </div>


      {candidate.public_profile_url && (

        <a
          href={
            candidate.public_profile_url
          }
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-ink transition-all hover:border-primary hover:bg-primary hover:text-white"
        >

          View LinkedIn Profile

          <ExternalLink
            size={14}
          />

        </a>

      )}

    </div>
  );
}


/* =========================================================
   Project Modal
========================================================= */

function ProjectDetailsModal({
  project,
  candidates,
  isLoading,
  onClose,
}) {

  const [activeTab, setActiveTab] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showFilter, setShowFilter] =
    useState(false);


  const sentCandidates =
    useMemo(
      () =>
        candidates.filter(
          (candidate) =>
            candidate.inmail_sent === true ||
            candidate.connection_sent === true
        ),
      [candidates]
    );


  const notSentCandidates =
    useMemo(
      () =>
        candidates.filter(
          (candidate) =>
            candidate.inmail_sent === false &&
            candidate.connection_sent === false
        ),
      [candidates]
    );


  const tabCandidates =
    useMemo(() => {

      if (
        activeTab === "sent"
      ) {
        return sentCandidates;
      }

      if (
        activeTab === "notSent"
      ) {
        return notSentCandidates;
      }

      return candidates;

    }, [
      activeTab,
      candidates,
      sentCandidates,
      notSentCandidates,
    ]);


  const filteredCandidates =
    useMemo(() => {

      let data =
        [...tabCandidates];


      if (
        statusFilter ===
        "inmailSent"
      ) {

        data =
          data.filter(
            (candidate) =>
              candidate.inmail_sent === true
          );

      }


      if (
        statusFilter ===
        "connectionSent"
      ) {

        data =
          data.filter(
            (candidate) =>
              candidate.connection_sent === true
          );

      }


      if (
        statusFilter ===
        "inmailNotSent"
      ) {

        data =
          data.filter(
            (candidate) =>
              candidate.inmail_sent === false
          );

      }


      if (
        statusFilter ===
        "connectionNotSent"
      ) {

        data =
          data.filter(
            (candidate) =>
              candidate.connection_sent === false
          );

      }


      const search =
        searchTerm
          .trim()
          .toLowerCase();


      if (search) {

        data =
          data.filter(
            (candidate) => {

              const text = [
                candidate.full_name,
                candidate.headline,
                candidate.location,
                candidate.public_identifier,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

              return text.includes(
                search
              );
            }
          );

      }


      return data;

    }, [
      tabCandidates,
      statusFilter,
      searchTerm,
    ]);


  useEffect(() => {

    function onKeyDown(event) {

      if (
        event.key === "Escape"
      ) {
        onClose();
      }

    }

    document.addEventListener(
      "keydown",
      onKeyDown
    );

    return () =>
      document.removeEventListener(
        "keydown",
        onKeyDown
      );

  }, [onClose]);


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }

      }}
    >

      <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl">


        {/* HEADER */}

        <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-5">

          <div className="flex items-start justify-between gap-4">

            <div className="flex min-w-0 items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">

                <FolderOpen
                  size={22}
                />

              </div>


              <div className="min-w-0">

                <h2 className="truncate font-display text-xl font-bold text-ink">

                  {project?.project_name ||
                    "Project"}

                </h2>


                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-light">

                  <span className="inline-flex items-center gap-1.5">

                    <Users size={13} />

                    {candidates.length}
                    {" "}
                    candidates

                  </span>


                  {project?.first_created_at && (

                    <span className="inline-flex items-center gap-1.5">

                      <CalendarDays
                        size={13}
                      />

                      {new Date(
                        project.first_created_at
                      ).toLocaleDateString()}

                    </span>

                  )}

                </div>

              </div>

            </div>


            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-light hover:bg-surface hover:text-ink"
            >

              <X size={20} />

            </button>

          </div>


          {!isLoading && (

            <div className="mt-5 grid grid-cols-3 gap-3">

              <div className="rounded-xl bg-surface px-4 py-3">

                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-light">
                  Total
                </p>

                <p className="mt-1 font-display text-xl font-bold text-ink">
                  {candidates.length}
                </p>

              </div>


              <div className="rounded-xl bg-green-50 px-4 py-3">

                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                  Not Sent
                </p>

                <p className="mt-1 font-display text-xl font-bold text-green-700">
                  {notSentCandidates.length}
                </p>

              </div>


              <div className="rounded-xl bg-blue-50 px-4 py-3">

                <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                  Sent
                </p>

                <p className="mt-1 font-display text-xl font-bold text-blue-700">
                  {sentCandidates.length}
                </p>

              </div>

            </div>

          )}

        </div>


        {/* TABS */}

        {!isLoading && (

          <div className="shrink-0 border-b border-slate-200 bg-white px-6">

            <div className="flex gap-6">

              {[
                [
                  "all",
                  "All",
                  candidates.length,
                ],
                [
                  "notSent",
                  "Not Sent",
                  notSentCandidates.length,
                ],
                [
                  "sent",
                  "Sent",
                  sentCandidates.length,
                ],
              ].map(
                ([
                  value,
                  label,
                  count,
                ]) => (

                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setActiveTab(
                        value
                      );

                      setStatusFilter(
                        "all"
                      );
                    }}
                    className={`relative py-4 text-xs font-semibold ${
                      activeTab === value
                        ? "text-primary"
                        : "text-slate-light hover:text-ink"
                    }`}
                  >

                    {label}

                    <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-[10px]">
                      {count}
                    </span>


                    {activeTab ===
                      value && (

                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />

                    )}

                  </button>

                )
              )}

            </div>

          </div>

        )}


        {/* SEARCH */}

        {!isLoading && (

          <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative flex-1">

                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  placeholder="Search candidate, headline, location..."
                  className="input-field pl-10"
                />

              </div>


              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setShowFilter(
                      (prev) => !prev
                    )
                  }
                  className="flex h-11 min-w-[190px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-ink"
                >

                  <span className="flex items-center gap-2">

                    <Filter size={14} />

                    Filter

                  </span>


                  <ChevronDown
                    size={14}
                  />

                </button>


                {showFilter && (

                  <div className="absolute right-0 top-12 z-30 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">

                    {[
                      [
                        "all",
                        "All Candidates",
                      ],
                      [
                        "inmailSent",
                        "InMail Sent",
                      ],
                      [
                        "connectionSent",
                        "Connection Sent",
                      ],
                      [
                        "inmailNotSent",
                        "InMail Not Sent",
                      ],
                      [
                        "connectionNotSent",
                        "Connection Not Sent",
                      ],
                    ].map(
                      ([
                        value,
                        label,
                      ]) => (

                        <button
                          key={value}
                          type="button"
                          onClick={() => {

                            setStatusFilter(
                              value
                            );

                            setShowFilter(
                              false
                            );

                          }}
                          className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-medium hover:bg-surface"
                        >

                          {label}

                        </button>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>


            <div className="mt-3 flex justify-between">

              <p className="text-xs text-slate-light">

                Showing{" "}

                <b className="text-ink">
                  {
                    filteredCandidates.length
                  }
                </b>

                {" "}candidates

              </p>


              {(searchTerm ||
                statusFilter !==
                  "all") && (

                <button
                  type="button"
                  onClick={() => {

                    setSearchTerm(
                      ""
                    );

                    setStatusFilter(
                      "all"
                    );

                  }}
                  className="text-xs font-semibold text-primary"
                >
                  Clear filters
                </button>

              )}

            </div>

          </div>

        )}


        {/* CANDIDATES */}

        <div className="min-h-0 flex-1 overflow-y-auto p-6">

          {isLoading ? (

            <div className="flex min-h-[300px] items-center justify-center">

              <Loader2
                size={30}
                className="animate-spin text-primary"
              />

            </div>

          ) : filteredCandidates.length === 0 ? (

            <div className="flex min-h-[300px] items-center justify-center text-center">

              <div>

                <Users
                  size={35}
                  className="mx-auto text-slate-light"
                />

                <h3 className="mt-3 font-display text-sm font-bold text-ink">
                  No candidates found
                </h3>

                <p className="mt-1 text-xs text-slate-light">
                  Try changing the filters.
                </p>

              </div>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

              {filteredCandidates.map(
                (candidate) => (

                  <CandidateCard
                    key={
                      candidate.candidate_id
                    }
                    candidate={
                      candidate
                    }
                  />

                )
              )}

            </div>

          )}

        </div>

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

  const [keywords, setKeywords] =
    useState([""]);

  const [inmailMessage, setInmailMessage] =
    useState("");

  const [connectionMessage, setConnectionMessage] =
    useState("");


  /* =======================================================
     Company
  ======================================================= */

  const [company, setCompany] =
    useState(EMPTY_PARAM);

  const [locations, setLocations] =
    useState([EMPTY_PARAM]);


  /* =======================================================
     Seniority
  ======================================================= */

  const [seniorityInclude, setSeniorityInclude] =
    useState([]);

  const [seniorityExclude, setSeniorityExclude] =
    useState([]);


  /* =======================================================
     Target Companies
  ======================================================= */

  const [targetCompanies, setTargetCompanies] =
    useState([]);


  /* =======================================================
     Pipeline
  ======================================================= */

  const [isRunning, setIsRunning] =
    useState(false);

  const [runningCompanyIndex, setRunningCompanyIndex] =
    useState(null);

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

      const response =
        await fetch(
          `${API_BASE_URL}/automation/projects`
        );

      if (!response.ok) {

        throw new Error(
          "Failed to fetch projects"
        );

      }

      const data =
        await response.json();

      setProjects(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(error);

      setToast({
        type: "error",
        message:
          "Couldn't load existing projects.",
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

  async function handleProjectClick(
    project
  ) {

    setSelectedProject(
      project
    );

    setProjectCandidates([]);

    setIsLoadingCandidates(
      true
    );

    try {

      const response =
        await fetch(
          `${API_BASE_URL}/automation/projects/${project.project_id}`
        );

      if (!response.ok) {

        throw new Error(
          "Failed to fetch project"
        );

      }

      const data =
        await response.json();

      setProjectCandidates(
        data?.candidates || []
      );

    } catch (error) {

      console.error(error);

      setToast({
        type: "error",
        message:
          "Couldn't load project candidates.",
      });

      setSelectedProject(
        null
      );

    } finally {

      setIsLoadingCandidates(
        false
      );

    }
  }


  function closeProjectModal() {

    setSelectedProject(
      null
    );

    setProjectCandidates([]);

  }


  /* =======================================================
     Seniority
  ======================================================= */

  function toggleInclude(
    bucket
  ) {

    setSeniorityInclude(
      (prev) => {

        const isAdding =
          !prev.includes(
            bucket
          );


        if (isAdding) {

          setSeniorityExclude(
            (exclude) =>
              exclude.filter(
                (b) =>
                  b !== bucket
              )
          );


          return [
            ...prev,
            bucket,
          ];

        }


        return prev.filter(
          (b) =>
            b !== bucket
        );

      }
    );

  }


  function toggleExclude(
    bucket
  ) {

    setSeniorityExclude(
      (prev) =>
        prev.includes(bucket)
          ? prev.filter(
              (b) =>
                b !== bucket
            )
          : [
              ...prev,
              bucket,
            ]
    );

  }


  /* =======================================================
     Keywords
  ======================================================= */

  function updateKeyword(
    index,
    value
  ) {

    setKeywords(
      (prev) =>
        prev.map(
          (keyword, i) =>
            i === index
              ? value
              : keyword
        )
    );

  }


  function addKeyword() {

    setKeywords(
      (prev) => [
        ...prev,
        "",
      ]
    );

  }


  function removeKeyword(
    index
  ) {

    setKeywords(
      (prev) =>
        prev.filter(
          (_, i) =>
            i !== index
        )
    );

  }


  /* =======================================================
     Locations
  ======================================================= */

  function updateLocation(
    index,
    item
  ) {

    setLocations(
      (prev) =>
        prev.map(
          (location, i) =>
            i === index
              ? {
                  id:
                    item.id,
                  title:
                    item.title,
                }
              : location
        )
    );

  }


  function addLocation() {

    setLocations(
      (prev) => [
        ...prev,
        EMPTY_PARAM,
      ]
    );

  }


  function removeLocation(
    index
  ) {

    setLocations(
      (prev) =>
        prev.filter(
          (_, i) =>
            i !== index
        )
    );

  }


  /* =======================================================
     Target Companies
  ======================================================= */

  function addTargetCompany() {

    setTargetCompanies(
      (prev) => [
        ...prev,
        {
          name: "",
          id: "",
          matchedTitle: "",
          pictureUrl: "",
        },
      ]
    );

  }


  function updateTargetCompany(
    index,
    value
  ) {

    setTargetCompanies(
      (prev) =>
        prev.map(
          (company, i) =>
            i === index
              ? {
                  ...company,

                  /*
                   * If user edits the company,
                   * old LinkedIn ID is invalid.
                   */

                  name:
                    value,

                  id: "",

                  matchedTitle:
                    "",

                  pictureUrl:
                    "",
                }
              : company
        )
    );

  }


  function removeTargetCompany(
    index
  ) {

    setTargetCompanies(
      (prev) =>
        prev.filter(
          (_, i) =>
            i !== index
        )
    );

  }


  /* =======================================================
     Fetch Details
  ======================================================= */

  async function handleFetchDetails() {

    const trimmed =
      jobDescription.trim();


    if (
      !trimmed ||
      isFetchingDetails
    ) {
      return;
    }


    setIsFetchingDetails(
      true
    );


    try {

      const response =
        await extractJobTitleAndSkills(
          trimmed
        );


      if (
        !response?.success ||
        !response?.data
      ) {

        throw new Error(
          "Invalid job details response."
        );

      }


      const data =
        response.data;


      /* =================================================
         Job Title
      ================================================= */

      const jobTitle =
        data.job_title ||
        "";


      /*
       * If project name is empty,
       * use job title.
       */

      if (
        !projectName.trim() &&
        jobTitle
      ) {

        setProjectName(
          jobTitle
        );

      }


      /* =================================================
         Keywords
      ================================================= */

      const extractedKeywords = [
        jobTitle,
        ...(data.skills || []),
      ].filter(Boolean);


      setKeywords(
        extractedKeywords.length
          ? extractedKeywords
          : [""]
      );


      /* =================================================
         Messages
      ================================================= */

      setInmailMessage(
        data.inMailMessage ||
        ""
      );


      setConnectionMessage(
        data.connectionNote ||
        ""
      );


      /* =================================================
         Seniority
      ================================================= */

      if (
        data.seniority_level
      ) {

        const seniority =
          normalizeSeniority(
            data.seniority_level
          );


        if (seniority) {

          setSeniorityInclude([
            seniority,
          ]);

          /*
           * Make sure same seniority
           * is not excluded.
           */

          setSeniorityExclude(
            (prev) =>
              prev.filter(
                (item) =>
                  item !==
                  seniority
              )
          );

        }

      }


      /* =================================================
         Company List
      ================================================= */

      const companies =
        Array.isArray(
          data.company_list
        )
          ? data.company_list
          : [];


      setTargetCompanies(
        companies.map(
          (companyName) => ({
            name:
              companyName,

            id: "",

            matchedTitle:
              "",

            pictureUrl:
              "",
          })
        )
      );


      setToast({
        type: "success",
        message:
          `Details loaded. ${companies.length} target companies added.`,
      });


    } catch (error) {

      console.error(
        "Fetch details error:",
        error
      );


      setToast({
        type: "error",
        message:
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error.message ||
          "Couldn't fetch job details.",
      });

    } finally {

      setIsFetchingDetails(
        false
      );

      setTimeout(() => {
        setToast(null);
      }, 3500);

    }
  }


  /* =======================================================
     Resolve All Companies
  ======================================================= */

  async function resolveAllCompanies() {
  const validCompanies =
    targetCompanies.filter(
      (company) =>
        company.name?.trim()
    );

  if (!validCompanies.length) {
    throw new Error(
      "Please add at least one target company."
    );
  }

  const resolvedCompanies = [];

  /*
   * Resolve company names to
   * LinkedIn company IDs.
   *
   * Example:
   *
   * ServiceNow -> 29352
   * SAP        -> 3185
   *
   * This lookup is necessary because
   * your pipeline requires LinkedIn IDs.
   */

  for (
    let index = 0;
    index < validCompanies.length;
    index++
  ) {
    const company =
      validCompanies[index];

    setRunningCompanyIndex(
      index
    );

    /*
     * If ID already exists,
     * don't call Unipile again.
     */

    if (company.id) {
      resolvedCompanies.push(
        company
      );

      continue;
    }

    console.log(
      `🔎 Resolving company ${index + 1}/${validCompanies.length}:`,
      company.name
    );

    const resolved =
      await resolveLinkedInCompany(
        company.name
      );

    const resolvedCompany = {
      ...company,

      id:
        resolved.id,

      matchedTitle:
        resolved.matchedTitle,

      pictureUrl:
        resolved.pictureUrl,
    };

    resolvedCompanies.push(
      resolvedCompany
    );

    /*
     * Update UI immediately.
     */

    setTargetCompanies(
      (prev) =>
        prev.map(
          (item) =>
            item.name ===
            company.name
              ? resolvedCompany
              : item
        )
    );
  }

  return resolvedCompanies;
}


  /* =======================================================
     Run Pipeline
  ======================================================= */

  async function handleRunPipeline() {
  if (isRunning) {
    return;
  }

  /* =====================================================
     Validation
  ===================================================== */

  if (!projectName.trim()) {
    setToast({
      type: "error",
      message:
        "Please enter a project name.",
    });

    return;
  }

  if (!targetCompanies.length) {
    setToast({
      type: "error",
      message:
        "Please add at least one target company.",
    });

    return;
  }

  setIsRunning(true);

  setRunningCompanyIndex(
    null
  );

  setResult(null);

  try {
    /* ===================================================
       STEP 1
       Resolve all company names
    =================================================== */

    setToast({
      type: "success",
      message:
        "Resolving LinkedIn company IDs...",
    });

    const resolvedCompanies =
      await resolveAllCompanies();

    if (
      !resolvedCompanies.length
    ) {
      throw new Error(
        "No companies could be resolved."
      );
    }

    /* ===================================================
       STEP 2
       Extract company IDs
    =================================================== */

    const companyIds =
      resolvedCompanies
        .map(
          (company) =>
            company.id
        )
        .filter(Boolean);

    if (!companyIds.length) {
      throw new Error(
        "No valid LinkedIn company IDs found."
      );
    }

    console.log(
      "=========================================="
    );

    console.log(
      "🚀 STARTING BULK PIPELINE"
    );

    console.log(
      "Total companies:",
      resolvedCompanies.length
    );

    console.log(
      "Company IDs:",
      companyIds
    );

    console.log(
      "=========================================="
    );

    /* ===================================================
       STEP 3
       ONE PIPELINE REQUEST
    =================================================== */

    setToast({
      type: "success",
      message:
        `Starting pipeline for ${companyIds.length} companies...`,
    });

    const response =
      await runOutreachPipeline({
        projectName:
          projectName.trim(),

        keywords,

        inmailMessage,

        connectionMessage,

        limit: 100,

        locations,

        seniorityInclude,

        seniorityExclude,

        /*
         * ALL COMPANY IDs
         */

        companyIds,
      });

    /* ===================================================
       STEP 4
       Save Result
    =================================================== */

    setResult({
      success: true,

      response,

      companies:
        resolvedCompanies,

      total:
        resolvedCompanies.length,
    });

    /* ===================================================
       Success
    =================================================== */

    setToast({
      type: "success",
      message:
        `Pipeline started successfully for ${resolvedCompanies.length} companies.`,
    });

    /* ===================================================
       Refresh Existing Projects
    =================================================== */

    await loadProjects();

  } catch (error) {
    console.error(
      "❌ Bulk pipeline error:",
      error
    );

    const errorMessage =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Couldn't run the pipeline.";

    setResult({
      success: false,

      error:
        errorMessage,
    });

    setToast({
      type: "error",
      message:
        errorMessage,
    });

  } finally {
    setRunningCompanyIndex(
      null
    );

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

        <div
          className={`grid grid-cols-1 items-start gap-6 ${
            projectsCollapsed
              ? "lg:grid-cols-[minmax(0,1fr)_72px]"
              : "lg:grid-cols-[minmax(0,1fr)_360px]"
          }`}
        >


          {/* =================================================
              FORM
          ================================================= */}

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
                  KEYWORDS
              ================================================= */}

              <div>

                <label className="field-label">
                  Keywords
                </label>


                <div className="flex flex-col gap-3">

                  {keywords.map(
                    (
                      keyword,
                      index
                    ) => (

                      <div
                        key={index}
                        className="flex gap-2"
                      >

                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) =>
                            updateKeyword(
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Enter keyword"
                          className="input-field"
                        />


                        {index ===
                        0 ? (

                          <button
                            type="button"
                            onClick={
                              addKeyword
                            }
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white"
                          >

                            <Plus
                              size={18}
                            />

                          </button>

                        ) : (

                          <button
                            type="button"
                            onClick={() =>
                              removeKeyword(
                                index
                              )
                            }
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-spark text-white"
                          >

                            <X
                              size={18}
                            />

                          </button>

                        )}

                      </div>

                    )
                  )}

                </div>

                <p className="mt-2 text-xs text-slate-light">
                  Keywords are combined using AND.
                </p>

              </div>


              {/* =================================================
                  OPTIONAL COMPANY SEARCH
              ================================================= */}

              <div>

                <SearchField
                  label="Search Company"
                  type="COMPANY"
                  placeholder="e.g. Microsoft"
                  modalTitle="Select a company"
                  onSelect={(item) =>
                    setCompany({
                      id:
                        item.id,
                      title:
                        item.title,
                    })
                  }
                />


                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <ReadOnlyField
                    label="Company ID"
                    value={
                      company.id
                    }
                  />

                  <ReadOnlyField
                    label="Company"
                    value={
                      company.title
                    }
                  />

                </div>

              </div>


              {/* =================================================
                  LOCATIONS
              ================================================= */}

              <div>

                <label className="field-label">
                  Locations
                </label>


                <div className="flex flex-col gap-4">

                  {locations.map(
                    (
                      location,
                      index
                    ) => (

                      <div
                        key={index}
                        className="flex flex-col gap-3"
                      >

                        <div className="flex items-end gap-2">

                          <div className="flex-1">

                            <SearchField
                              label={
                                index ===
                                0
                                  ? "Search Location"
                                  : `Search Location ${
                                      index +
                                      1
                                    }`
                              }
                              type="LOCATION"
                              placeholder="e.g. London"
                              modalTitle="Select a location"
                              onSelect={(
                                item
                              ) =>
                                updateLocation(
                                  index,
                                  item
                                )
                              }
                            />

                          </div>


                          {index ===
                          0 ? (

                            <button
                              type="button"
                              onClick={
                                addLocation
                              }
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white"
                            >

                              <Plus
                                size={18}
                              />

                            </button>

                          ) : (

                            <button
                              type="button"
                              onClick={() =>
                                removeLocation(
                                  index
                                )
                              }
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-spark text-white"
                            >

                              <X
                                size={18}
                              />

                            </button>

                          )}

                        </div>


                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                          <ReadOnlyField
                            label="Location ID"
                            value={
                              location.id
                            }
                          />

                          <ReadOnlyField
                            label="Location"
                            value={
                              location.title
                            }
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* =================================================
                  SENIORITY
              ================================================= */}

              <div>

                <div className="mb-3 flex items-center justify-between">

                  <label className="field-label !mb-0">
                    Seniority
                  </label>


                  {seniorityInclude.length >
                    0 && (

                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">

                      AI detected:{" "}

                      {seniorityInclude.join(
                        ", "
                      )}

                    </span>

                  )}

                </div>


                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <SeniorityBucketBox
                    label="Seniority Include"
                    selected={
                      seniorityInclude
                    }
                    onToggle={
                      toggleInclude
                    }
                  />


                  <SeniorityBucketBox
                    label="Seniority Exclude"
                    selected={
                      seniorityExclude
                    }
                    onToggle={
                      toggleExclude
                    }
                    disabledOptions={
                      seniorityInclude
                    }
                  />

                </div>

              </div>


              {/* =================================================
                  TARGET COMPANIES
              ================================================= */}

              <div>

                <div className="flex items-center justify-between">

                  <div>

                    <label className="field-label !mb-0">
                      Target Companies
                    </label>

                    <p className="mt-1 text-xs text-slate-light">
                        All selected companies will be included in one pipeline.
                    </p>

                  </div>


                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">

                    {
                      targetCompanies.length
                    }

                  </span>

                </div>


                <div className="mt-3 rounded-2xl border border-slate-200 bg-surface p-3">

                  {targetCompanies.length ===
                  0 ? (

                    <div className="py-8 text-center">

                      <FolderOpen
                        size={25}
                        className="mx-auto text-slate-light"
                      />

                      <p className="mt-2 text-sm font-semibold text-ink">
                        No target companies
                      </p>

                      <p className="mt-1 text-xs text-slate-light">
                        Click Fetch Details or add one manually.
                      </p>

                    </div>

                  ) : (

                    <div className="max-h-[360px] overflow-y-auto pr-1">

                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">

                        {targetCompanies.map(
                          (
                            targetCompany,
                            index
                          ) => (

                            <div
                              key={`${index}-${targetCompany.name}`}
                              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2"
                            >

                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">

                                {index +
                                  1}

                              </div>


                              <div className="min-w-0 flex-1">

                                <input
                                  type="text"
                                  value={
                                    targetCompany.name
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateTargetCompany(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="w-full border-0 bg-transparent px-1 py-1 text-xs font-medium text-ink outline-none"
                                  placeholder="Company name"
                                />


                                {targetCompany.id && (

                                  <p className="px-1 text-[9px] text-green-600">

                                    LinkedIn ID:{" "}

                                    {
                                      targetCompany.id
                                    }

                                  </p>

                                )}

                              </div>


                              <button
                                type="button"
                                onClick={() =>
                                  removeTargetCompany(
                                    index
                                  )
                                }
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-light hover:bg-red-50 hover:text-red-500"
                              >

                                <X
                                  size={15}
                                />

                              </button>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}


                  <button
                    type="button"
                    onClick={
                      addTargetCompany
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] px-4 py-3 text-xs font-semibold text-primary hover:bg-primary/10"
                  >

                    <Plus
                      size={15}
                    />

                    Add Company

                  </button>

                </div>

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


          {/* =================================================
              PROJECT PANEL
          ================================================= */}

          <aside className="lg:sticky lg:top-6">

            <section className="card overflow-hidden">

              <div
                className={
                  projectsCollapsed
                    ? "px-2 py-3"
                    : "px-5 py-5"
                }
              >

                {projectsCollapsed ? (

                  <div className="flex flex-col items-center gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setProjectsCollapsed(
                          false
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-light hover:bg-surface hover:text-primary"
                    >

                      <PanelLeftOpen
                        size={18}
                      />

                    </button>


                    <div className="h-px w-8 bg-slate-200" />


                    <FolderOpen
                      size={18}
                      className="text-primary"
                    />


                    <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-bold">
                      {
                        projects.length
                      }
                    </span>

                  </div>

                ) : (

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">

                        <FolderOpen
                          size={18}
                        />

                      </div>


                      <div>

                        <h2 className="font-display text-base font-bold text-ink">
                          Existing Projects
                        </h2>

                        <p className="text-xs text-slate-light">
                          Click to preview
                        </p>

                      </div>

                    </div>


                    <div className="flex items-center gap-2">

                      <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold">

                        {
                          projects.length
                        }

                      </span>


                      <button
                        type="button"
                        onClick={() =>
                          setProjectsCollapsed(
                            true
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-light hover:bg-surface hover:text-primary"
                      >

                        <PanelLeftClose
                          size={17}
                        />

                      </button>

                    </div>

                  </div>

                )}

              </div>


              {!projectsCollapsed && (

                <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-4">

                  {isLoadingProjects ? (

                    <div className="flex justify-center py-10">

                      <Loader2
                        size={24}
                        className="animate-spin text-primary"
                      />

                    </div>

                  ) : projects.length ===
                    0 ? (

                    <div className="py-10 text-center">

                      <FolderOpen
                        size={25}
                        className="mx-auto text-slate-light"
                      />

                      <p className="mt-3 text-sm font-semibold">
                        No projects yet
                      </p>

                    </div>

                  ) : (

                    <div className="flex flex-col gap-3">

                      {projects.map(
                        (project) => (

                          <button
                            key={
                              project.project_id
                            }
                            type="button"
                            onClick={() =>
                              handleProjectClick(
                                project
                              )
                            }
                            className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-md"
                          >

                            <div className="flex items-start gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-slate group-hover:bg-primary/10 group-hover:text-primary">

                                <FolderOpen
                                  size={17}
                                />

                              </div>


                              <div className="min-w-0 flex-1">

                                <h3 className="truncate font-display text-sm font-bold text-ink">

                                  {
                                    project.project_name
                                  }

                                </h3>


                                <p className="mt-2 text-xs text-slate-light">

                                  <Users
                                    size={12}
                                    className="mr-1 inline"
                                  />

                                  {
                                    project.candidate_count
                                  }

                                  {" "}
                                  candidates

                                </p>


                                {project.first_created_at && (

                                  <p className="mt-1.5 text-[10px] text-slate-light">

                                    Created{" "}

                                    {new Date(
                                      project.first_created_at
                                    ).toLocaleDateString()}

                                  </p>

                                )}

                              </div>


                              <span className="text-slate-300 group-hover:text-primary">
                                →
                              </span>

                            </div>

                          </button>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}

            </section>

          </aside>

        </div>


        {/* ===================================================
            RESULT
        =================================================== */}

        {result && (

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

                  {result.successful?.length ||
                    0}

                  {" "}successful /{" "}

                  {result.failed?.length ||
                    0}

                  {" "}failed

                </p>

              </div>

            </div>


            {result.successful?.length >
              0 && (

              <div className="mt-5">

                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-green-600">
                  Successful
                </p>


                <div className="flex flex-wrap gap-2">

                  {result.successful.map(
                    (item) => (

                      <span
                        key={
                          item.companyId
                        }
                        className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
                      >

                        ✓{" "}
                        {
                          item.company
                        }

                      </span>

                    )
                  )}

                </div>

              </div>

            )}


            {result.failed?.length >
              0 && (

              <div className="mt-5">

                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-red-600">
                  Failed
                </p>


                <div className="flex flex-col gap-2">

                  {result.failed.map(
                    (item) => (

                      <div
                        key={
                          item.company
                        }
                        className="rounded-xl bg-red-50 p-3 text-xs text-red-700"
                      >

                        <b>
                          {item.company}
                        </b>

                        {" — "}

                        {item.error}

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </section>

        )}

      </div>


      {/* ===================================================
          PROJECT MODAL
      =================================================== */}

      {selectedProject && (

        <ProjectDetailsModal
          project={
            selectedProject
          }
          candidates={
            projectCandidates
          }
          isLoading={
            isLoadingCandidates
          }
          onClose={
            closeProjectModal
          }
        />

      )}


      <Toast
        toast={toast}
      />

    </div>
  );
}