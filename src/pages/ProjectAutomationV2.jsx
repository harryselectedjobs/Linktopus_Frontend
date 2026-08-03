import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Rocket,
  UserCircle2,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { runOutreachPipeline } from "../services/outreachPipeline";
import Toast from "../components/postAssistant/Toast";
import SearchField from "../components/projectAutomation/SearchField";
import SeniorityBucketBox from "../components/projectAutomation/SeniorityBucketBox";

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

export default function ProjectAutomationV2() {
  const { email } = useAuth();

  const [projectName, setProjectName] = useState("");
  const [keywords, setKeywords] = useState([""]);
  const [inmailMessage, setInmailMessage] = useState("");
  const [connectionMessage, setConnectionMessage] = useState("");

  const [company, setCompany] = useState(EMPTY_PARAM);
  const [location, setLocation] = useState(EMPTY_PARAM);
  const [seniorityInclude, setSeniorityInclude] = useState([]);
  const [seniorityExclude, setSeniorityExclude] = useState([]);

  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null);

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

  function updateKeyword(index, value) {
    setKeywords((prev) => prev.map((k, i) => (i === index ? value : k)));
  }

  function addKeyword() {
    setKeywords((prev) => [...prev, ""]);
  }

  function removeKeyword(index) {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleRunPipeline() {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);
    try {
      const data = await runOutreachPipeline({
        projectName,
        keywords,
        inmailMessage,
        connectionMessage,
        locationId: location.id,
        seniorityInclude,
        seniorityExclude,
      });
      setResult(data);
      setToast({
        type: "success",
        message: data.message || "Outreach pipeline completed successfully.",
      });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Couldn't run the pipeline.",
      });
    } finally {
      setIsRunning(false);
      setTimeout(() => setToast(null), 3200);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
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
            <UserCircle2 size={22} className="text-white/80" />
            {email || "Account"}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <section className="card p-8">
          <h2 className="font-display text-xl font-bold text-ink">
            Run Outreach Pipeline
          </h2>

          <div className="mt-6 flex flex-col gap-5">
            <div>
              <label className="field-label">Project</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name e.g. My First Project"
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Keywords</label>
              <div className="flex flex-col gap-3">
                {keywords.map((keyword, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => updateKeyword(index, e.target.value)}
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
                        onClick={addKeyword}
                        aria-label="Add keyword"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-600"
                      >
                        <Plus size={18} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        aria-label="Remove keyword"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-spark text-white transition-colors hover:bg-[#E5573D]"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-light">
                Add multiple keywords. They will be combined using AND.
              </p>
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
              label="Search Location"
              type="LOCATION"
              placeholder="e.g. London"
              modalTitle="Select a location"
              onSelect={(item) =>
                setLocation({ id: item.id, title: item.title })
              }
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ReadOnlyField label="Location ID" value={location.id} />
              <ReadOnlyField label="Location" value={location.title} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

            <div>
              <label className="field-label">InMail Message</label>
              <textarea
                value={inmailMessage}
                onChange={(e) => setInmailMessage(e.target.value)}
                placeholder="Enter your InMail message..."
                rows={5}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="field-label">Connection Message</label>
              <textarea
                value={connectionMessage}
                onChange={(e) => setConnectionMessage(e.target.value)}
                placeholder="Enter your connection message..."
                rows={5}
                className="input-field resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleRunPipeline}
              disabled={isRunning}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5
                font-display text-sm font-semibold text-white transition-all duration-200
                hover:bg-ink/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Rocket size={16} />
              )}
              {isRunning ? "Running Pipeline..." : "Run Pipeline"}
            </button>
          </div>
        </section>

        {result && (
          <section className="card animate-fade-up mt-5 p-6">
            <p className="font-display text-sm font-semibold text-ink">
              {result.message}
            </p>
            {result.project_id && (
              <p className="mt-1 text-xs text-slate-light">
                Project ID: {result.project_id}
              </p>
            )}
          </section>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
