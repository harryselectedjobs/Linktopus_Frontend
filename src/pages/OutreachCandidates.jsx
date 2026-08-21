import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  MapPin,
  Mic,
  MicOff,
  Pencil,
  RotateCcw,
  Search,
  Sparkles,
  Users,
  WandSparkles,
  X,
} from "lucide-react";

import {
  generateJobDescription,
  searchCandidates,
} from "../services/outreachCandidates";

export default function OutreachCandidates() {
  // ============================================================
  // JOB DESCRIPTION STATES
  // ============================================================

  const [requirement, setRequirement] = useState("");
  const [jdText, setJdText] = useState("");
  const [requestId, setRequestId] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);

  // ============================================================
  // ERROR / VALIDATION STATES
  // ============================================================

  const [error, setError] = useState("");
  const [missingFields, setMissingFields] = useState([]);

  // ============================================================
  // VOICE INPUT STATES
  // ============================================================

  const [isListening, setIsListening] = useState(false);

  // ============================================================
  // CANDIDATE SEARCH STATES
  // ============================================================

  const [candidates, setCandidates] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showCandidates, setShowCandidates] = useState(false);

  // ============================================================
  // PAGINATION
  // ============================================================

  const [currentPage, setCurrentPage] = useState(1);

  const candidatesPerPage = 10;

  const totalPages = Math.ceil(
    candidates.length / candidatesPerPage
  );

  const startIndex =
    (currentPage - 1) * candidatesPerPage;

  const currentCandidates = candidates.slice(
    startIndex,
    startIndex + candidatesPerPage
  );

  // ============================================================
  // OTHER STATES
  // ============================================================

  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  // ============================================================
  // SPEECH SUPPORT
  // ============================================================

  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window ||
      "webkitSpeechRecognition" in window);

  // ============================================================
  // CLEANUP
  // ============================================================

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // ============================================================
  // START VOICE INPUT
  // ============================================================

  function startListening() {
    if (!speechSupported) {
      setError(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );

      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
      setMissingFields([]);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i += 1
      ) {
        const transcript =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setRequirement((previous) => {
          const separator =
            previous.trim().length > 0 ? " " : "";

          return `${previous}${separator}${finalTranscript.trim()}`;
        });
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        setError(
          "Microphone permission was denied. Please allow microphone access and try again."
        );
      } else if (event.error === "no-speech") {
        setError(
          "No speech was detected. Please try speaking again."
        );
      } else {
        setError(
          "Voice input stopped unexpectedly. Please try again."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  }

  // ============================================================
  // STOP VOICE INPUT
  // ============================================================

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }

  // ============================================================
  // TOGGLE VOICE INPUT
  // ============================================================

  function toggleListening() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  // ============================================================
  // GENERATE JOB DESCRIPTION
  // ============================================================

  async function handleGenerate() {
    const trimmed = requirement.trim();

    if (!trimmed || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setError("");
    setMissingFields([]);
    setCopied(false);

    try {
      const data =
        await generateJobDescription(trimmed);

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      if (data?.jd_text) {
        setJdText(data.jd_text);
        setRequestId(data.request_id || "");

        return;
      }

      // --------------------------------------------------------
      // API VALIDATION RESPONSE
      // --------------------------------------------------------

      if (data?.message) {
        setJdText("");
        setRequestId(data.request_id || "");

        setError(data.message);

        setMissingFields(
          data.missing_fields || []
        );

        return;
      }

      // --------------------------------------------------------
      // UNEXPECTED RESPONSE
      // --------------------------------------------------------

      setJdText("");

      setError(
        "We couldn't create the job description. Please provide more details about the role."
      );

    } catch (err) {
      const apiResponse =
        err.response?.data;

      if (apiResponse?.message) {
        setError(apiResponse.message);

        setMissingFields(
          apiResponse.missing_fields || []
        );
      } else {
        setError(
          "We couldn't generate the job description right now. Please try again."
        );

        setMissingFields([]);
      }
    } finally {
      setIsGenerating(false);
    }
  }

  // ============================================================
  // SEARCH CANDIDATES
  // ============================================================

  async function handleSearchCandidates() {
    const trimmedJd = jdText.trim();

    if (!trimmedJd || isSearching) {
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setCandidates([]);
    setCurrentPage(1);

    try {
      const data =
        await searchCandidates(trimmedJd);

      // API response:
      //
      // {
      //   request_id: "...",
      //   result: {
      //      items: [...]
      //   }
      // }

      const items =
        data?.result?.items || [];

      setCandidates(items);

      setShowCandidates(true);

      if (items.length === 0) {
        setSearchError(
          "No candidates were found for this job description. Try adding more specific skills, experience, or location requirements."
        );
      }

    } catch (err) {
      const apiResponse =
        err.response?.data;

      setSearchError(
        apiResponse?.message ||
          apiResponse?.detail ||
          "We couldn't search for candidates right now. Please try again."
      );

      setShowCandidates(true);
    } finally {
      setIsSearching(false);
    }
  }

  // ============================================================
  // RESET EVERYTHING
  // ============================================================

  function handleReset() {
    stopListening();

    setRequirement("");
    setJdText("");
    setRequestId("");

    setError("");
    setMissingFields([]);

    setCandidates([]);
    setSearchError("");
    setShowCandidates(false);

    setCurrentPage(1);

    setCopied(false);
  }

  // ============================================================
  // COPY JD
  // ============================================================

  async function handleCopy() {
    if (!jdText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        jdText
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);

    } catch {
      setError(
        "Unable to copy the job description."
      );
    }
  }

  // ============================================================
  // FOCUS JD EDITOR
  // ============================================================

  function handleEditFocus() {
    textareaRef.current?.focus();
  }

  // ============================================================
  // MISSING FIELD LABEL
  // ============================================================

  function getMissingFieldLabel(field) {
    const labels = {
      title_keywords: "Job title",
      role_keywords: "Responsibilities",
      skills_keywords:
        "Skills / technologies",
    };

    return labels[field] || field;
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-surface">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <header className="border-b border-surface-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-display text-sm font-medium text-slate transition-colors hover:text-ink"
          >
            <ArrowLeft size={16} />

            Dashboard
          </Link>

          <div className="inline-flex items-center gap-2 font-display text-sm font-semibold text-ink">

            <BriefcaseBusiness
              size={17}
              className="text-primary"
            />

            Outreach Candidates

          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-white px-3.5 py-1.5 font-display text-xs font-semibold text-ink transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <RotateCcw size={14} />

            Start over
          </button>

        </div>
      </header>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <main className="mx-auto max-w-6xl px-6 py-8">

        {/* PAGE HEADING */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
        >

          <p className="section-label">
            AI Job Description
          </p>

          <h1 className="mt-1.5 font-display text-3xl font-bold text-ink sm:text-4xl">
            Create a job description
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate sm:text-base">
            Tell us what kind of candidate you're
            looking for. You can type your
            requirements or simply speak them,
            and AI will turn them into a
            professional job description.
          </p>

        </motion.div>

        {/* ====================================================
            TWO COLUMN LAYOUT
        ===================================================== */}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ==================================================
              LEFT - REQUIREMENTS
          =================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.08,
            }}
            className="card-glow"
          >

            <div className="p-6">

              {/* TITLE */}

              <div className="flex items-start justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                      <Sparkles size={17} />
                    </span>

                    <div>

                      <h2 className="font-display text-base font-semibold text-ink">
                        Your requirements
                      </h2>

                      <p className="text-xs text-slate">
                        Type or speak naturally
                      </p>

                    </div>

                  </div>

                </div>

                <span className="badge">

                  <span className="node-dot" />

                  AI powered

                </span>

              </div>

              {/* TEXTAREA */}

              <div className="relative mt-6">

                <textarea
                  value={requirement}
                  onChange={(e) => {
                    setRequirement(
                      e.target.value
                    );

                    setError("");
                    setMissingFields([]);
                  }}
                  placeholder={`Example:

Need a Node.js Developer with 5+ years of experience. They should have experience with REST APIs, MongoDB or PostgreSQL, and scalable backend systems. Location should be Kolkata, Chennai, Mumbai, Hyderabad or Noida. Prefer candidates from companies like EY, SAP, PwC, TCS or similar companies.`}
                  className="input-field min-h-[330px] resize-none pr-5 leading-relaxed"
                />

                <div className="pointer-events-none absolute bottom-3 right-4 text-[11px] text-slate-light">
                  {requirement.length} characters
                </div>

              </div>

              {/* VOICE */}

              <div className="mt-4 flex items-center justify-between gap-3">

                <div className="flex items-center gap-2 text-xs text-slate">

                  <span
                    className={`flex h-2 w-2 rounded-full ${
                      isListening
                        ? "animate-pulse bg-spark"
                        : "bg-slate-light"
                    }`}
                  />

                  {isListening
                    ? "Listening... speak your requirements"
                    : "You can also use voice input"}

                </div>

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-display text-xs font-semibold transition-all ${
                    isListening
                      ? "bg-spark text-white shadow-glow"
                      : "border border-surface-border bg-white text-ink hover:border-primary-300 hover:bg-primary-50"
                  }`}
                >

                  {isListening ? (
                    <>
                      <MicOff size={15} />

                      Stop listening
                    </>
                  ) : (
                    <>
                      <Mic size={15} />

                      Speak requirements
                    </>
                  )}

                </button>

              </div>

              {/* =================================================
                  VALIDATION MESSAGE
              ================================================== */}

              <AnimatePresence>

                {error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4"
                  >

                    <div className="flex gap-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <Sparkles size={15} />
                      </div>

                      <div className="min-w-0">

                        <p className="font-display text-sm font-semibold text-amber-900">
                          A little more information is needed
                        </p>

                        <p className="mt-1 text-sm leading-relaxed text-amber-800">
                          {error}
                        </p>

                        {missingFields.length > 0 && (
                          <div className="mt-3">

                            <p className="text-xs font-semibold text-amber-900">
                              Please add:
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">

                              {missingFields.map(
                                (field) => (
                                  <span
                                    key={field}
                                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200"
                                  >
                                    {getMissingFieldLabel(
                                      field
                                    )}
                                  </span>
                                )
                              )}

                            </div>

                          </div>
                        )}

                      </div>

                    </div>

                  </motion.div>
                )}

              </AnimatePresence>

              {/* GENERATE BUTTON */}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={
                  !requirement.trim() ||
                  isGenerating
                }
                className="btn-primary mt-5 w-full"
              >

                {isGenerating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Creating your job description...
                  </>
                ) : (
                  <>
                    <WandSparkles size={17} />

                    Generate Job Description
                  </>
                )}

              </button>

              <p className="mt-3 text-center text-[11px] text-slate-light">
                AI will turn your requirements
                into a polished, recruiter-ready JD.
              </p>

            </div>

          </motion.section>

          {/* ==================================================
              RIGHT - GENERATED JD
          =================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.14,
            }}
            className="card overflow-hidden"
          >

            {/* JD HEADER */}

            <div className="border-b border-surface-border bg-white px-6 py-5">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-2">

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
                    <FileText size={17} />
                  </span>

                  <div>

                    <h2 className="font-display text-base font-semibold text-ink">
                      Generated Job Description
                    </h2>

                    <p className="text-xs text-slate">
                      Edit anything before searching
                    </p>

                  </div>

                </div>

                {jdText && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-surface-border bg-white px-3 py-1.5 font-display text-xs font-semibold text-ink transition-colors hover:border-primary-300 hover:bg-primary-50"
                  >

                    {copied ? (
                      <>
                        <Check
                          size={14}
                          className="text-green-600"
                        />

                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />

                        Copy
                      </>
                    )}

                  </button>
                )}

              </div>

            </div>

            {/* JD BODY */}

            <div className="bg-surface p-4">

              {jdText ? (

                <div className="relative overflow-hidden rounded-xl border border-surface-border bg-white shadow-sm">

                  {/* EDITOR LABEL */}

                  <div className="flex items-center justify-between border-b border-surface-border bg-surface px-4 py-2.5">

                    <div className="flex items-center gap-2">

                      <Pencil
                        size={13}
                        className="text-primary"
                      />

                      <span className="font-display text-[11px] font-semibold uppercase tracking-wide text-slate">
                        Editable
                      </span>

                    </div>

                    {requestId && (
                      <span
                        className="max-w-[180px] truncate text-[10px] text-slate-light"
                        title={requestId}
                      >
                        ID: {requestId}
                      </span>
                    )}

                  </div>

                  {/* JD TEXTAREA */}

                  <textarea
                    ref={textareaRef}
                    value={jdText}
                    onChange={(e) =>
                      setJdText(e.target.value)
                    }
                    spellCheck
                    className="min-h-[500px] w-full resize-none border-0 bg-white px-5 py-5 font-body text-sm leading-7 text-ink outline-none focus:ring-0"
                  />

                  {/* EDITOR FOOTER */}

                  <div className="flex items-center justify-between border-t border-surface-border bg-surface px-4 py-2.5">

                    <span className="text-[10px] text-slate-light">
                      {jdText.length} characters
                    </span>

                    <button
                      type="button"
                      onClick={handleEditFocus}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-600"
                    >
                      <Pencil size={12} />

                      Continue editing
                    </button>

                  </div>

                </div>

              ) : (

                <div className="flex min-h-[560px] items-center justify-center rounded-xl border border-dashed border-surface-border bg-white">

                  <div className="max-w-sm px-6 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                      <FileText size={24} />
                    </div>

                    <h3 className="mt-4 font-display text-base font-semibold text-ink">
                      Your JD will appear here
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate">

                      Enter your candidate
                      requirements on the left and
                      click

                      <span className="font-semibold text-ink">
                        {" "}
                        Generate Job Description
                      </span>

                      .

                    </p>

                    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-light">

                      <Sparkles
                        size={13}
                        className="text-spark"
                      />

                      AI generated

                      <span>•</span>

                      <Pencil size={13} />

                      Fully editable

                    </div>

                  </div>

                </div>

              )}

              {/* =================================================
                  SEARCH CANDIDATES BUTTON
              ================================================== */}

              {jdText && (
                <div className="mt-4">

                  <button
                    type="button"
                    onClick={
                      handleSearchCandidates
                    }
                    disabled={
                      !jdText.trim() ||
                      isSearching
                    }
                    className="btn-primary w-full"
                  >

                    {isSearching ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        Searching candidates...
                      </>
                    ) : (
                      <>
                        <Search size={17} />

                        Search Candidates
                      </>
                    )}

                  </button>

                  <p className="mt-2 text-center text-[11px] text-slate-light">
                    Search LinkedIn candidates
                    using this job description
                  </p>

                </div>
              )}

            </div>

          </motion.section>

        </div>

      </main>

      {/* ========================================================
          CANDIDATE MODAL
      ========================================================= */}

      <AnimatePresence>

        {showCandidates && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onClick={() =>
              setShowCandidates(false)
            }
          >

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-2xl"
            >

              {/* =================================================
                  MODAL HEADER
              ================================================== */}

              <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                      <Users size={17} />
                    </div>

                    <div>

                      <h2 className="font-display text-lg font-semibold text-ink">
                        Outreach Candidates
                      </h2>

                      <p className="text-xs text-slate">

                        {candidates.length > 0
                          ? `${candidates.length} candidates found`
                          : "Candidate search results"}

                      </p>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCandidates(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate transition-colors hover:bg-surface hover:text-ink"
                >
                  <X size={18} />
                </button>

              </div>

              {/* =================================================
                  SEARCH ERROR
              ================================================== */}

              {searchError && (

                <div className="mx-6 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">

                  {searchError}

                </div>

              )}

              {/* =================================================
                  CANDIDATES
              ================================================== */}

              <div className="min-h-0 flex-1 overflow-y-auto bg-surface p-5">

                {currentCandidates.length > 0 ? (

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {currentCandidates.map(
                      (candidate, index) => (

                        <CandidateCard
                          key={
                            candidate.id ||
                            candidate.recruiter_candidate_id ||
                            `${candidate.name}-${index}`
                          }
                          candidate={
                            candidate
                          }
                        />

                      )
                    )}

                  </div>

                ) : (

                  !searchError && (

                    <div className="flex min-h-[350px] items-center justify-center">

                      <div className="text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                          <Users size={24} />
                        </div>

                        <h3 className="mt-4 font-display text-base font-semibold text-ink">
                          No candidates found
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-slate">
                          Try making the job
                          description more specific
                          by adding skills,
                          experience,
                          responsibilities,
                          or location.
                        </p>

                      </div>

                    </div>

                  )

                )}

              </div>

              {/* =================================================
                  PAGINATION
              ================================================== */}

              {totalPages > 1 && (

                <div className="flex items-center justify-between border-t border-surface-border bg-white px-6 py-3">

                  <p className="text-xs text-slate">

                    Showing{" "}

                    <span className="font-semibold text-ink">
                      {startIndex + 1}
                    </span>

                    {" - "}

                    <span className="font-semibold text-ink">

                      {Math.min(
                        startIndex +
                          candidatesPerPage,
                        candidates.length
                      )}

                    </span>

                    {" of "}

                    <span className="font-semibold text-ink">
                      {candidates.length}
                    </span>

                  </p>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      disabled={
                        currentPage === 1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              1,
                              page - 1
                            )
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-white text-slate transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft
                        size={16}
                      />
                    </button>

                    <span className="min-w-[90px] text-center text-xs font-semibold text-ink">
                      Page {currentPage} of{" "}
                      {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              totalPages,
                              page + 1
                            )
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-white text-slate transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight
                        size={16}
                      />
                    </button>

                  </div>

                </div>

              )}

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}

// ==================================================================
// CANDIDATE CARD
// ==================================================================

function CandidateCard({ candidate }) {

  const skills = Array.isArray(
    candidate.skills
  )
    ? candidate.skills
    : [];

  const candidateName =
    candidate.name ||
    candidate.full_name ||
    "Unknown Candidate";

  const headline =
    candidate.headline ||
    "No headline available";

  const profileUrl =
    candidate.profile_url ||
    candidate.public_profile_url ||
    candidate.profileUrl ||
    "";

  const profilePicture =
    candidate.profile_picture_url ||
    candidate.profilePictureUrl ||
    candidate.profile_picture ||
    "";

  return (

    <div className="group rounded-2xl border border-surface-border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">

      {/* ========================================================
          CANDIDATE HEADER
      ========================================================= */}

      <div className="flex gap-4">

        {/* PROFILE IMAGE */}

        <div className="shrink-0">

          {profilePicture ? (

            <img
              src={profilePicture}
              alt={candidateName}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-primary-50"
            />

          ) : (

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">

              {candidateName
                .charAt(0)
                .toUpperCase()}

            </div>

          )}

        </div>

        {/* NAME / HEADLINE */}

        <div className="min-w-0 flex-1">

          <h3 className="truncate font-display text-base font-semibold text-ink">
            {candidateName}
          </h3>

          <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-slate">
            {headline}
          </p>

        </div>

      </div>

      {/* ========================================================
          DETAILS
      ========================================================= */}

      <div className="mt-4 space-y-2">

        {candidate.location && (

          <div className="flex items-center gap-2 text-xs text-slate">

            <MapPin
              size={14}
              className="shrink-0 text-primary"
            />

            <span>
              {candidate.location}
            </span>

          </div>

        )}

        {candidate.industry && (

          <div className="flex items-center gap-2 text-xs text-slate">

            <BriefcaseBusiness
              size={14}
              className="shrink-0 text-primary"
            />

            <span>
              {candidate.industry}
            </span>

          </div>

        )}

        {candidate.connections_count !=
          null && (

          <div className="flex items-center gap-2 text-xs text-slate">

            <Users
              size={14}
              className="shrink-0 text-primary"
            />

            <span>

              {Number(
                candidate.connections_count
              ).toLocaleString()}{" "}
              connections

            </span>

          </div>

        )}

      </div>

      {/* ========================================================
          SKILLS
      ========================================================= */}

      {skills.length > 0 && (

        <div className="mt-4">

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-light">
            Skills
          </p>

          <div className="flex flex-wrap gap-1.5">

            {skills
              .slice(0, 8)
              .map((skill, index) => {

                const skillName =
                  typeof skill === "string"
                    ? skill
                    : skill?.name;

                if (!skillName) {
                  return null;
                }

                return (

                  <span
                    key={`${skillName}-${index}`}
                    className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary"
                  >
                    {skillName}
                  </span>

                );
              })}

            {skills.length > 8 && (

              <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-slate">

                +{skills.length - 8} more

              </span>

            )}

          </div>

        </div>

      )}

      {/* ========================================================
          FOOTER
      ========================================================= */}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-surface-border pt-4">

        <div className="flex flex-wrap items-center gap-2">

          {candidate.interestLikelihood && (

            <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate">

              {candidate.interestLikelihood}

            </span>

          )}

          {candidate.can_send_inmail && (

            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">

              InMail available

            </span>

          )}

        </div>

        {/* LINKEDIN PROFILE */}

        {profileUrl && (

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 font-display text-xs font-semibold text-white transition-colors hover:bg-primary-600"
          >

            View Profile

            <ExternalLink size={13} />

          </a>

        )}

      </div>

    </div>
  );
}