import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Rocket,
  UserCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { runAutomation } from "../services/projectAutomation";
import SearchField from "../components/projectAutomation/SearchField";
import SeniorityBucketBox from "../components/projectAutomation/SeniorityBucketBox";
import Toast from "../components/postAssistant/Toast";

const WORKPLACE_OPTIONS = ["ON_SITE", "HYBRID", "REMOTE"];
const EMPLOYMENT_STATUS_OPTIONS = [
  { label: "Full Time", value: "FULL_TIME" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" },
  { label: "Temporary", value: "TEMPORARY" },
  { label: "Other", value: "OTHER" },
  { label: "Volunteer", value: "VOLUNTEER" },
  { label: "Internship", value: "INTERNSHIP" },
];
const JOB_SENIORITY_OPTIONS = [
  { label: "Internship", value: "INTERNSHIP" },
  { label: "Entry Level", value: "ENTRY_LEVEL" },
  { label: "Associate", value: "ASSOCIATE" },
  { label: "Mid Senior Level", value: "MID_SENIOR_LEVEL" },
  { label: "Director", value: "DIRECTOR" },
  { label: "Executive", value: "EXECUTIVE" },
  { label: "Not Applicable", value: "NOT_APPLICABLE" },
];
const APPLY_METHOD_OPTIONS = ["LinkedIn"];

const EMPTY_PARAM = { id: "", title: "" };

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="field-label">{label}</label>
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

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <p className="font-display text-xs font-medium text-slate-light">
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-bold text-ink">
        {value ?? "—"}
      </p>
    </div>
  );
}

function ActionBadge({ label, ok }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-[11px] font-semibold ${
        ok ? "bg-primary-50 text-primary-700" : "bg-spark/10 text-[#B8402A]"
      }`}
    >
      {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {label}
    </span>
  );
}

export default function ProjectAutomation() {
  const { email } = useAuth();

  const [jobTitle, setJobTitle] = useState(EMPTY_PARAM);
  const [company, setCompany] = useState(EMPTY_PARAM);
  const [jobLocation, setJobLocation] = useState(EMPTY_PARAM);
  const [workplace, setWorkplace] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [description, setDescription] = useState("");

  const [projectName, setProjectName] = useState("");
  const [jobSeniority, setJobSeniority] = useState("");
  const [searchFunction, setSearchFunction] = useState(EMPTY_PARAM);
  const [industry, setIndustry] = useState(EMPTY_PARAM);
  const [applyMethod, setApplyMethod] = useState(APPLY_METHOD_OPTIONS[0]);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [resumeRequired, setResumeRequired] = useState(true);

  const [seniorityInclude, setSeniorityInclude] = useState([]);
  const [seniorityExclude, setSeniorityExclude] = useState([]);
  const [candidateLocationId, setCandidateLocationId] = useState("");
  const [maxCandidates, setMaxCandidates] = useState(5);

  const [inmailMessage, setInmailMessage] = useState("");
  const [connectionNote, setConnectionNote] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState(null);
  const [campaignResult, setCampaignResult] = useState(null);

  function toggleInclude(bucket) {
    setSeniorityInclude((prev) => {
      const isAdding = !prev.includes(bucket);
      if (isAdding) {
        setSeniorityExclude((exclude) => exclude.filter((b) => b !== bucket));
        return [...prev, bucket];
      }
      return prev.filter((b) => b !== bucket);
    });
  }

  function toggleExclude(bucket) {
    setSeniorityExclude((prev) =>
      prev.includes(bucket)
        ? prev.filter((b) => b !== bucket)
        : [...prev, bucket],
    );
  }

  async function handleRunAutomation() {
    if (isRunning) return;
    setIsRunning(true);
    setCampaignResult(null);
    try {
      const seniority = { include: seniorityInclude };
      if (seniorityExclude.length > 0) seniority.exclude = seniorityExclude;

      const data = await runAutomation({
        payload: {
          job_title: { id: jobTitle.id, text: jobTitle.title },
          company: { id: company.id, text: company.title },
          workplace,
          recruiter: {
            project: { name: projectName },
            functions: searchFunction.id ? [searchFunction.id] : [],
            industries: industry.id ? [industry.id] : [],
            seniority: jobSeniority,
            apply_method: {
              type: "linkedin",
              resume_required: resumeRequired,
              notification_email: notificationEmail,
            },
          },
          account_id: import.meta.env.VITE_UNIPILE_ACCOUNT_ID,
          location: jobLocation.id,
          employment_status: employmentStatus,
          description,
        },
        seniority,
        inmailMessage,
        noteMessage: connectionNote,
        candidateSearchLocation: candidateLocationId,
        max_candidates: maxCandidates,
      });
      setCampaignResult(data);
      setToast({
        type: "success",
        message: "Automation completed successfully.",
      });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Couldn't run the automation.",
      });
    } finally {
      setIsRunning(false);
      setTimeout(() => setToast(null), 3200);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              aria-label="Back to dashboard"
              className="text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft size={18} />
            </Link>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Briefcase size={18} />
            </span>
            <h1 className="font-display text-lg font-semibold">
              Project Automation
            </h1>
          </div>
          <div className="flex items-center gap-2 font-display text-sm font-medium">
            <UserCircle2 size={22} className="text-white/80" />
            {email || "Account"}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-4xl flex-col gap-5 px-6 py-8">
        {/* Job Posting */}
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-ink">
            Job Posting
          </h2>

          <div className="mt-5 flex flex-col gap-5">
            <SearchField
              label="Search Job Title"
              type="JOB_TITLE"
              placeholder="e.g. Java Developer"
              modalTitle="Select a job title"
              onSelect={(item) =>
                setJobTitle({ id: item.id, title: item.title })
              }
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ReadOnlyField label="Job Title ID" value={jobTitle.id} />
              <ReadOnlyField label="Job Title" value={jobTitle.title} />
            </div>

            <SearchField
              label="Search Company"
              type="COMPANY"
              placeholder="e.g. Microsoft"
              modalTitle="Select a company"
              onSelect={(item) =>
                setCompany({ id: item.id, title: item.title })
              }
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ReadOnlyField label="Company ID" value={company.id} />
              <ReadOnlyField label="Company" value={company.title} />
            </div>

            <SearchField
              label="Search Job Location"
              type="LOCATION"
              placeholder="e.g. Kolkata"
              modalTitle="Select a location"
              onSelect={(item) =>
                setJobLocation({ id: item.id, title: item.title })
              }
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ReadOnlyField label="Location ID" value={jobLocation.id} />
              <ReadOnlyField label="Location" value={jobLocation.title} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label">Workplace</label>
                <select
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select</option>
                  {WORKPLACE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "ON_SITE"
                        ? "On Site"
                        : opt === "HYBRID"
                          ? "Hybrid"
                          : opt === "REMOTE"
                            ? "Remote"
                            : null}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Employment Status</label>
                <select
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select</option>
                  {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="field-label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="input-field resize-none"
              />
            </div>
          </div>
        </section>

        {/* Recruiter Project */}
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-ink">
            Recruiter Project
          </h2>

          <div className="mt-5 flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project Name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="field-label">Job Seniority</label>
                <select
                  value={jobSeniority}
                  onChange={(e) => setJobSeniority(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select</option>
                  {JOB_SENIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <SearchField
              label="Search Function"
              type="JOB_FUNCTION"
              placeholder="e.g. Engineering"
              modalTitle="Select a function"
              onSelect={(item) =>
                setSearchFunction({ id: item.id, title: item.title })
              }
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ReadOnlyField label="Function ID" value={searchFunction.id} />
              <ReadOnlyField
                label="Function Name"
                value={searchFunction.title}
              />
            </div>

            <SearchField
              label="Search Industry"
              type="INDUSTRY"
              placeholder="e.g. Information Technology"
              modalTitle="Select an industry"
              onSelect={(item) =>
                setIndustry({ id: item.id, title: item.title })
              }
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ReadOnlyField label="Industry ID" value={industry.id} />
              <ReadOnlyField label="Industry Name" value={industry.title} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label">Apply Method</label>
                <select
                  value={applyMethod}
                  onChange={(e) => setApplyMethod(e.target.value)}
                  className="input-field"
                >
                  {APPLY_METHOD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Notification Email</label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>
            </div>

            <label className="inline-flex w-fit items-center gap-2 font-display text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={resumeRequired}
                onChange={(e) => setResumeRequired(e.target.checked)}
                className="h-4 w-4 rounded border-surface-border text-primary focus:ring-primary-100"
              />
              Resume Required
            </label>
          </div>
        </section>

        {/* Candidate Search + Outreach */}
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-ink">
            Candidate Search
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SeniorityBucketBox
              label="Seniority Include"
              selected={seniorityInclude}
              onToggle={toggleInclude}
            />
            <SeniorityBucketBox
              label="Seniority Exclude"
              selected={seniorityExclude}
              onToggle={toggleExclude}
              disabledOptions={seniorityInclude}
            />
          </div>

          <div className="mt-5 flex flex-col gap-5">
            <SearchField
              label="Search Candidate Location"
              type="LOCATION"
              placeholder="e.g. London"
              modalTitle="Select a location"
              onSelect={(item) => setCandidateLocationId(item.id)}
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ReadOnlyField
                label="Candidate Search Location ID"
                value={candidateLocationId}
              />
              <div>
                <label className="field-label">Max Candidates</label>
                <input
                  type="number"
                  min={1}
                  value={maxCandidates}
                  onChange={(e) =>
                    setMaxCandidates(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <hr className="my-6 border-surface-border" />

          <h2 className="font-display text-lg font-bold text-ink">
            Outreach Messages
          </h2>

          <div className="mt-5 flex flex-col gap-5">
            <div>
              <label className="field-label">InMail Message</label>
              <textarea
                value={inmailMessage}
                onChange={(e) => setInmailMessage(e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="field-label">
                Connection Invite Note (Optional)
              </label>
              <textarea
                value={connectionNote}
                onChange={(e) => setConnectionNote(e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunAutomation}
            disabled={isRunning}
            className="btn-primary mt-6 w-full"
          >
            {isRunning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Rocket size={16} />
            )}
            {isRunning ? "Running Automation..." : "Run Automation"}
          </button>
        </section>

        {/* Results */}
        {campaignResult && (
          <section className="card animate-fade-up p-6">
            <div className="flex items-center gap-2 text-primary-700">
              <CheckCircle2 size={20} />
              <h2 className="font-display text-lg font-bold text-ink">
                Automation Complete
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Job ID" value={campaignResult.job?.job_id} />
              <StatTile
                label="Project ID"
                value={campaignResult.job?.project_id}
              />
              <StatTile
                label="Candidates Found"
                value={campaignResult.total_candidates_found}
              />
              <StatTile
                label="Candidates Processed"
                value={campaignResult.candidates_processed}
              />
            </div>

            {campaignResult.results?.length > 0 && (
              <div className="mt-6 flex flex-col gap-3">
                {campaignResult.results.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="rounded-xl border border-surface-border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-sm font-semibold text-ink">
                        {candidate.name}
                      </p>
                      {candidate.public_identifier && (
                        <a
                          href={`https://www.linkedin.com/in/${candidate.public_identifier}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          View profile
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <ActionBadge
                        label="Added to Pipeline"
                        ok={Boolean(candidate.add_to_pipeline?.body?.success)}
                      />
                      <ActionBadge
                        label="InMail Sent"
                        ok={candidate.inmail?.status_code === 201}
                      />
                      <ActionBadge
                        label="Invite Sent"
                        ok={candidate.invite?.status_code === 201}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
