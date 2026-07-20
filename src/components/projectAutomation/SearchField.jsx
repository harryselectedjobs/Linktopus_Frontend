import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { searchLinkedinParameters } from "../../services/unipile";
import SearchParameterModal from "./SearchParameterModal";

export default function SearchField({ label, type, placeholder, modalTitle, onSelect }) {
  const [keywords, setKeywords] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    const trimmed = keywords.trim();
    if (!trimmed || isLoading) return;
    setIsOpen(true);
    setIsLoading(true);
    setError("");
    try {
      const results = await searchLinkedinParameters(trimmed, type);
      setItems(results);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Couldn't complete this search."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  function handleSelect(item) {
    onSelect(item);
    setIsOpen(false);
  }

  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-field"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!keywords.trim() || isLoading}
          className="btn-primary shrink-0 !px-5 !py-3 text-xs"
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}
          Search
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <SearchParameterModal
            title={modalTitle || label}
            items={items}
            isLoading={isLoading}
            error={error}
            onSelect={handleSelect}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
