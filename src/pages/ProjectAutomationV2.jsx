import { useEffect, useMemo, useState } from "react";
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
  runOutreachPipeline,
  extractJobTitleAndSkills,
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

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="field-label">
        {label}
      </label>

      <input
        type="text"
        value={value}
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

function CandidateCard({ candidate }) {
  const inmailSent =
    candidate.inmail_sent === true;

  const connectionSent =
    candidate.connection_sent === true;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg">

      {/* Header */}

      <div className="flex items-start gap-3">

        {/* Avatar */}

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
          {candidate.full_name
            ?.split(" ")
            .map((name) => name[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "?"}
        </div>


        {/* Name */}

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


        {/* Network */}

        {candidate.network_distance && (
          <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-slate-light">
            {candidate.network_distance.replace(
              "_",
              " "
            )}
          </span>
        )}

      </div>


      {/* Headline */}

      {candidate.headline && (
        <p className="mt-4 line-clamp-3 text-sm leading-5 text-slate">
          {candidate.headline}
        </p>
      )}


      {/* Location */}

      {candidate.location && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-light">
          <span>📍</span>
          <span>{candidate.location}</span>
        </div>
      )}


      {/* Outreach Status */}

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


      {/* LinkedIn */}

      {candidate.public_profile_url && (
        <a
          href={candidate.public_profile_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-ink transition-all hover:border-primary hover:bg-primary hover:text-white"
        >
          View LinkedIn Profile
          <ExternalLink size={14} />
        </a>
      )}

    </div>
  );
}


/* =========================================================
   Project Details Modal
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


  /* =======================================================
     Candidate Groups
  ======================================================= */

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


  /* =======================================================
     Tab Filtering
  ======================================================= */

  const tabCandidates =
    useMemo(() => {

      if (activeTab === "sent") {
        return sentCandidates;
      }

      if (activeTab === "notSent") {
        return notSentCandidates;
      }

      return candidates;

    }, [
      activeTab,
      candidates,
      sentCandidates,
      notSentCandidates,
    ]);


  /* =======================================================
     Status + Search Filtering
  ======================================================= */

  const filteredCandidates =
    useMemo(() => {

      let data = [...tabCandidates];


      /* Status */

      if (statusFilter === "inmailSent") {
        data = data.filter(
          (candidate) =>
            candidate.inmail_sent === true
        );
      }

      if (statusFilter === "connectionSent") {
        data = data.filter(
          (candidate) =>
            candidate.connection_sent === true
        );
      }

      if (statusFilter === "inmailNotSent") {
        data = data.filter(
          (candidate) =>
            candidate.inmail_sent === false
        );
      }

      if (statusFilter === "connectionNotSent") {
        data = data.filter(
          (candidate) =>
            candidate.connection_sent === false
        );
      }


      /* Search */

      const search =
        searchTerm
          .trim()
          .toLowerCase();

      if (search) {

        data = data.filter(
          (candidate) => {

            const searchableText = [
              candidate.full_name,
              candidate.headline,
              candidate.location,
              candidate.public_identifier,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchableText.includes(
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


  /* =======================================================
     Escape Key
  ======================================================= */

  useEffect(() => {

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };

  }, [onClose]);


  /* =======================================================
     Modal
  ======================================================= */

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


        {/* =================================================
            Header
        ================================================= */}

        <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-5">

          <div className="flex items-start justify-between gap-4">

            <div className="flex min-w-0 items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FolderOpen size={22} />
              </div>

              <div className="min-w-0">

                <h2 className="truncate font-display text-xl font-bold text-ink">
                  {project?.project_name ||
                    "Project"}
                </h2>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-light">

                  <span className="inline-flex items-center gap-1.5">
                    <Users size={13} />
                    {candidates.length} candidates
                  </span>

                  {project?.first_created_at && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} />

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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-light transition-colors hover:bg-surface hover:text-ink"
              aria-label="Close project"
            >
              <X size={20} />
            </button>

          </div>


          {/* =================================================
              Stats
          ================================================= */}

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


        {/* =================================================
            Tabs
        ================================================= */}

        {!isLoading && (
          <div className="shrink-0 border-b border-slate-200 bg-white px-6">

            <div className="flex gap-6">

              {/* All */}

              <button
                type="button"
                onClick={() => {
                  setActiveTab("all");
                  setStatusFilter("all");
                }}
                className={`relative py-4 text-xs font-semibold ${
                  activeTab === "all"
                    ? "text-primary"
                    : "text-slate-light hover:text-ink"
                }`}
              >

                All

                <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-[10px]">
                  {candidates.length}
                </span>

                {activeTab === "all" && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                )}

              </button>


              {/* Not Sent */}

              <button
                type="button"
                onClick={() => {
                  setActiveTab("notSent");
                  setStatusFilter("all");
                }}
                className={`relative py-4 text-xs font-semibold ${
                  activeTab === "notSent"
                    ? "text-green-700"
                    : "text-slate-light hover:text-ink"
                }`}
              >

                Not Sent

                <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-700">
                  {notSentCandidates.length}
                </span>

                {activeTab === "notSent" && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-green-600" />
                )}

              </button>


              {/* Sent */}

              <button
                type="button"
                onClick={() => {
                  setActiveTab("sent");
                  setStatusFilter("all");
                }}
                className={`relative py-4 text-xs font-semibold ${
                  activeTab === "sent"
                    ? "text-blue-700"
                    : "text-slate-light hover:text-ink"
                }`}
              >

                Sent

                <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">
                  {sentCandidates.length}
                </span>

                {activeTab === "sent" && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600" />
                )}

              </button>

            </div>

          </div>
        )}


        {/* =================================================
            Search + Filter
        ================================================= */}

        {!isLoading && (
          <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* Search */}

              <div className="relative flex-1">

                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search candidate, headline, location..."
                  className="input-field pl-10"
                />

              </div>


              {/* Filter */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setShowFilter(
                      (prev) => !prev
                    )
                  }
                  className="flex h-11 min-w-[190px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-ink hover:border-primary/40"
                >

                  <span className="flex items-center gap-2">
                    <Filter size={14} />
                    Filter
                  </span>

                  <span className="flex items-center gap-1 text-slate-light">

                    {statusFilter === "all"
                      ? "All"
                      : statusFilter ===
                        "inmailSent"
                        ? "InMail Sent"
                        : statusFilter ===
                          "connectionSent"
                          ? "Connection Sent"
                          : statusFilter ===
                            "inmailNotSent"
                            ? "InMail Not Sent"
                            : "Connection Not Sent"}

                    <ChevronDown size={14} />

                  </span>

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
                      ([value, label]) => (

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
                          className={`w-full rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                            statusFilter ===
                            value
                              ? "bg-primary/10 text-primary"
                              : "text-slate hover:bg-surface"
                          }`}
                        >
                          {label}
                        </button>

                      )
                    )}

                  </div>
                )}

              </div>

            </div>


            {/* Filter summary */}

            <div className="mt-3 flex items-center justify-between">

              <p className="text-xs text-slate-light">

                Showing{" "}

                <span className="font-semibold text-ink">
                  {filteredCandidates.length}
                </span>

                {" "}of{" "}

                <span className="font-semibold text-ink">
                  {tabCandidates.length}
                </span>

                {" "}candidates

              </p>


              {(searchTerm ||
                statusFilter !== "all") && (

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Clear filters
                </button>

              )}

            </div>

          </div>
        )}


        {/* =================================================
            Candidates
        ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto p-6">

          {isLoading ? (

            <div className="flex min-h-[300px] items-center justify-center">

              <div className="flex flex-col items-center gap-3">

                <Loader2
                  size={30}
                  className="animate-spin text-primary"
                />

                <p className="text-sm text-slate-light">
                  Loading candidates...
                </p>

              </div>

            </div>

          ) : filteredCandidates.length === 0 ? (

            <div className="flex min-h-[300px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">

                  <Users
                    size={24}
                    className="text-slate-light"
                  />

                </div>

                <h3 className="mt-4 font-display text-sm font-bold text-ink">
                  No candidates found
                </h3>

                <p className="mt-1 text-xs text-slate-light">
                  Try changing your search or filter.
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
                    candidate={candidate}
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

  const { email } = useAuth();


  /* =======================================================
     Form State
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


  const [company, setCompany] =
    useState(EMPTY_PARAM);

  const [locations, setLocations] =
    useState([EMPTY_PARAM]);

  const [seniorityInclude, setSeniorityInclude] =
    useState([]);

  const [seniorityExclude, setSeniorityExclude] =
    useState([]);


  /* =======================================================
     Pipeline State
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


  /* =======================================================
     Projects Panel
  ======================================================= */

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
     Load Projects
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

      console.error(
        "Error loading projects:",
        error
      );

      setToast({
        type: "error",
        message:
          "Couldn't load existing projects.",
      });

      setTimeout(() => {
        setToast(null);
      }, 3200);

    } finally {

      setIsLoadingProjects(false);

    }
  }


  /* =======================================================
     Load Projects On Mount
  ======================================================= */

  useEffect(() => {
    loadProjects();
  }, []);


  /* =======================================================
     Open Project
  ======================================================= */

  async function handleProjectClick(
    project
  ) {

    setSelectedProject(project);

    setProjectCandidates([]);

    setIsLoadingCandidates(true);

    try {

      const response =
        await fetch(
          `${API_BASE_URL}/automation/projects/${project.project_id}`
        );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch project details"
        );
      }

      const data =
        await response.json();

      setProjectCandidates(
        Array.isArray(
          data.candidates
        )
          ? data.candidates
          : []
      );

    } catch (error) {

      console.error(
        "Error loading project candidates:",
        error
      );

      setToast({
        type: "error",
        message:
          "Couldn't load project candidates.",
      });

      setTimeout(() => {
        setToast(null);
      }, 3200);

      setSelectedProject(null);

    } finally {

      setIsLoadingCandidates(false);

    }
  }


  /* =======================================================
     Close Project
  ======================================================= */

  function closeProjectModal() {

    setSelectedProject(null);

    setProjectCandidates([]);

  }


  /* =======================================================
     Seniority
  ======================================================= */

  function toggleInclude(bucket) {

    setSeniorityInclude((prev) => {

      const isAdding =
        !prev.includes(bucket);

      if (isAdding) {

        setSeniorityExclude(
          (exclude) =>
            exclude.filter(
              (b) => b !== bucket
            )
        );

        return [
          ...prev,
          bucket,
        ];

      }

      return prev.filter(
        (b) => b !== bucket
      );

    });

  }


  function toggleExclude(bucket) {

    setSeniorityExclude((prev) =>
      prev.includes(bucket)
        ? prev.filter(
            (b) => b !== bucket
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

    setKeywords((prev) =>
      prev.map(
        (keyword, i) =>
          i === index
            ? value
            : keyword
      )
    );

  }


  function addKeyword() {

    setKeywords((prev) => [
      ...prev,
      "",
    ]);

  }


  function removeKeyword(index) {

    setKeywords((prev) =>
      prev.filter(
        (_, i) => i !== index
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

    setLocations((prev) =>
      prev.map(
        (location, i) =>
          i === index
            ? {
                id: item.id,
                title: item.title,
              }
            : location
      )
    );

  }


  function addLocation() {

    setLocations((prev) => [
      ...prev,
      EMPTY_PARAM,
    ]);

  }


  function removeLocation(index) {

    setLocations((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

  }


  /* =======================================================
     Fetch Job Details
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

    setIsFetchingDetails(true);

    try {

      const res =
        await extractJobTitleAndSkills(
          trimmed
        );

      if (
        res.success &&
        res.data
      ) {

        const {
          job_title,
          skills,
          inMailMessage,
          connectionNote,
        } = res.data;


        const newKeywords = [
          job_title,
          ...(skills || []),
        ].filter(Boolean);


        setKeywords(
          newKeywords.length
            ? newKeywords
            : [""]
        );


        if (inMailMessage) {
          setInmailMessage(
            inMailMessage
          );
        }


        if (connectionNote) {
          setConnectionMessage(
            connectionNote
          );
        }


        setToast({
          type: "success",
          message:
            "Details filled from job description.",
        });

      } else {

        setToast({
          type: "error",
          message:
            "Couldn't extract details from that description.",
        });

      }

    } catch (err) {

      console.error(err);

      setToast({
        type: "error",
        message:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Couldn't fetch job details.",
      });

    } finally {

      setIsFetchingDetails(false);

      setTimeout(() => {
        setToast(null);
      }, 3200);

    }
  }


  /* =======================================================
     Run Pipeline
  ======================================================= */

  async function handleRunPipeline() {

    if (isRunning) {
      return;
    }

    setIsRunning(true);

    setResult(null);

    try {

      const data =
        await runOutreachPipeline({
          projectName,
          keywords,
          inmailMessage,
          connectionMessage,
          locations,
          seniorityInclude,
          seniorityExclude,
        });


      setResult(data);


      setToast({
        type: "success",
        message:
          data.message ||
          "Outreach pipeline completed successfully.",
      });


      /*
       * Refresh existing projects
       */

      await loadProjects();

    } catch (err) {

      console.error(err);

      setToast({
        type: "error",
        message:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Couldn't run the pipeline.",
      });

    } finally {

      setIsRunning(false);

      setTimeout(() => {
        setToast(null);
      }, 3200);

    }
  }


  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="min-h-screen bg-surface">


      {/* ===================================================
          Header
      =================================================== */}

      <header className="bg-primary text-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <Link
              to="/"
              aria-label="Back to dashboard"
              className="text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft size={18} />
            </Link>


            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Rocket size={18} />
            </span>


            <h1 className="font-display text-lg font-semibold">
              Project Automation v2
            </h1>

          </div>


          <div className="flex items-center gap-2 font-display text-sm font-medium">

            <UserCircle2
              size={22}
              className="text-white/80"
            />

            {email || "Account"}

          </div>

        </div>

      </header>


      {/* ===================================================
          Main
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
              LEFT — FORM
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
                <Rocket size={19} />
              </div>

            </div>


            <div className="mt-7 flex flex-col gap-5">


              {/* Project */}

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
                  placeholder="Enter project name e.g. My First Project"
                  className="input-field"
                />

              </div>


              {/* Job Description */}

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
                    <Sparkles size={14} />
                  )}

                  {isFetchingDetails
                    ? "Fetching..."
                    : "Fetch Details"}

                </button>

              </div>


              {/* Keywords */}

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
                          placeholder={
                            index === 0
                              ? "Enter keyword e.g. Python"
                              : "Enter keyword e.g. Java"
                          }
                          className="input-field"
                        />


                        {index === 0 ? (

                          <button
                            type="button"
                            onClick={
                              addKeyword
                            }
                            aria-label="Add keyword"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-600"
                          >
                            <Plus size={18} />
                          </button>

                        ) : (

                          <button
                            type="button"
                            onClick={() =>
                              removeKeyword(
                                index
                              )
                            }
                            aria-label="Remove keyword"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-spark text-white transition-colors hover:bg-[#E5573D]"
                          >
                            <X size={18} />
                          </button>

                        )}

                      </div>

                    )
                  )}

                </div>


                <p className="mt-2 text-xs text-slate-light">
                  Add multiple keywords. They will be combined using AND.
                </p>

              </div>


              {/* Company */}

              <SearchField
                label="Search Company"
                type="COMPANY"
                placeholder="e.g. Microsoft"
                modalTitle="Select a company"
                onSelect={(item) =>
                  setCompany({
                    id: item.id,
                    title: item.title,
                  })
                }
              />


              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <ReadOnlyField
                  label="Company ID"
                  value={company.id}
                />

                <ReadOnlyField
                  label="Company"
                  value={company.title}
                />

              </div>


              {/* Locations */}

              <div>

                <label className="field-label">
                  Locations
                </label>

                <div className="flex flex-col gap-4">

                  {locations.map(
                    (
                      loc,
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
                                index === 0
                                  ? "Search Location"
                                  : `Search Location ${
                                      index + 1
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


                          {index === 0 ? (

                            <button
                              type="button"
                              onClick={
                                addLocation
                              }
                              aria-label="Add location"
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-600"
                            >
                              <Plus size={18} />
                            </button>

                          ) : (

                            <button
                              type="button"
                              onClick={() =>
                                removeLocation(
                                  index
                                )
                              }
                              aria-label="Remove location"
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-spark text-white transition-colors hover:bg-[#E5573D]"
                            >
                              <X size={18} />
                            </button>

                          )}

                        </div>


                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                          <ReadOnlyField
                            label="Location ID"
                            value={
                              loc.id
                            }
                          />

                          <ReadOnlyField
                            label="Location"
                            value={
                              loc.title
                            }
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* Seniority */}

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


              {/* InMail */}

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


              {/* Connection */}

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


              {/* Run */}

              <button
                type="button"
                onClick={
                  handleRunPipeline
                }
                disabled={isRunning}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 font-display text-sm font-semibold text-white transition-all duration-200 hover:bg-ink/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isRunning ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Rocket size={16} />
                )}

                {isRunning
                  ? "Running Pipeline..."
                  : "Run Pipeline"}

              </button>

            </div>

          </section>


          {/* =================================================
              RIGHT — PROJECT PANEL
          ================================================= */}

          <aside className="lg:sticky lg:top-6">

            <section className="card overflow-hidden">


              {/* =================================================
                  PANEL HEADER
              ================================================= */}

              <div
                className={`border-b border-slate-200 bg-white ${
                  projectsCollapsed
                    ? "px-2 py-3"
                    : "px-5 py-5"
                }`}
              >

                {projectsCollapsed ? (

                  /* Collapsed */

                  <div className="flex flex-col items-center gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setProjectsCollapsed(
                          false
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-light transition-colors hover:bg-surface hover:text-primary"
                      title="Expand projects"
                    >
                      <PanelLeftOpen size={18} />
                    </button>


                    <div className="h-px w-8 bg-slate-200" />


                    <button
                      type="button"
                      onClick={() =>
                        setProjectsCollapsed(
                          false
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"
                      title="Expand projects"
                    >
                      <FolderOpen size={17} />
                    </button>


                    <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-bold text-slate">
                      {projects.length}
                    </span>

                  </div>

                ) : (

                  /* Expanded */

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FolderOpen size={18} />
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

                      <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-slate">
                        {projects.length}
                      </span>


                      <button
                        type="button"
                        onClick={() =>
                          setProjectsCollapsed(
                            true
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-light hover:bg-surface hover:text-primary"
                        title="Collapse projects"
                      >
                        <PanelLeftClose size={17} />
                      </button>

                    </div>

                  </div>

                )}

              </div>


              {/* =================================================
                  PROJECT LIST
              ================================================= */}

              {!projectsCollapsed && (

                <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-4">

                  {isLoadingProjects ? (

                    <div className="flex items-center justify-center py-10">

                      <Loader2
                        size={24}
                        className="animate-spin text-primary"
                      />

                    </div>

                  ) : projects.length === 0 ? (

                    <div className="py-10 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface">

                        <FolderOpen
                          size={21}
                          className="text-slate-light"
                        />

                      </div>


                      <p className="mt-3 text-sm font-semibold text-ink">
                        No projects yet
                      </p>


                      <p className="mt-1 text-xs text-slate-light">
                        Run your first outreach pipeline.
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
                            className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-md"
                          >

                            <div className="flex items-start gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-slate transition-colors group-hover:bg-primary/10 group-hover:text-primary">

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


                                <div className="mt-2 flex items-center gap-3">

                                  <span className="inline-flex items-center gap-1 text-xs text-slate-light">

                                    <Users size={12} />

                                    {
                                      project.candidate_count
                                    }

                                    {" "}
                                    candidates

                                  </span>

                                </div>


                                {project.first_created_at && (

                                  <p className="mt-1.5 text-[10px] text-slate-light">

                                    Created{" "}

                                    {new Date(
                                      project.first_created_at
                                    ).toLocaleDateString()}

                                  </p>

                                )}

                              </div>


                              <span className="mt-1 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary">
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


        {/* =====================================================
            Pipeline Result
        ===================================================== */}

        {result && (

          <section className="card animate-fade-up mt-6 p-6">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Rocket size={18} />
              </div>


              <div>

                <p className="font-display text-sm font-semibold text-ink">
                  {result.message}
                </p>


                {result.project_id && (

                  <p className="mt-1 text-xs text-slate-light">
                    Project ID:{" "}
                    {result.project_id}
                  </p>

                )}

              </div>

            </div>

          </section>

        )}

      </div>


      {/* =====================================================
          Project Modal
      ===================================================== */}

      {selectedProject && (

        <ProjectDetailsModal
          project={selectedProject}
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


      {/* =====================================================
          Toast
      ===================================================== */}

      <Toast toast={toast} />

    </div>
  );
}