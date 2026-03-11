import { useEffect, useState } from "react";
import { useFilterRegistry } from "../contexts/FilterRegistryContext";
import "../styles/FilterDetail.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Minimal markdown → plain sections parser (no dependency needed)
function parseMarkdown(md) {
  return md
    .split("\n")
    .map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
      if (line.startsWith("# "))  return <h1 key={i}>{line.slice(2)}</h1>;
      if (line.startsWith("| "))  return <code key={i} className="fd-table-row">{line}</code>;
      if (line.startsWith("```")) return <hr key={i} className="fd-code-fence" />;
      if (line.trim() === "")     return <br key={i} />;
      return <p key={i}>{line}</p>;
    });
}

export default function FilterDetail({ filter, onClose }) {
  const { saveFilter, findFilter } = useFilterRegistry();
  const [md, setMd]               = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled]   = useState(false);
  const [error, setError]           = useState(null);

  // derive .md URL from thumbnail URL (swap extension)
  const mdUrl = filter.thumbnail.replace(/-thumbnail\.webp$/, ".md");

  useEffect(() => {
    setInstalled(!!findFilter(filter.name));
    fetch(mdUrl)
      .then((r) => r.text())
      .then(setMd)
      .catch(() => setMd("*No readme found.*"));
  }, [filter.id]);

  useEffect(() => {
    console.log("looking for:", filter.name);
    console.log("found:", findFilter(filter.name));
    }, [filter.id]);

  async function handleInstall() {
    setInstalling(true);
    setError(null);
    try {
      const res = await fetch(filter.json);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const def = await res.json();

      // Reconstruct processFunc from stored string
      const fn = new Function(`"use strict"; return (${def.processFunc})`)();
      await saveFilter({ ...def, processFunc: fn });
      setInstalled(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setInstalling(false);
    }
  }

  return (
    <div className="fd-overlay" onClick={onClose}>
      <div className="fd-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header row */}
        <div className="fd-header">
          <img src={filter.thumbnail} alt={filter.name} className="fd-thumb" />
          <div className="fd-header-meta">
            <div className="fd-breadcrumb">
              {filter.name.split("/").map((p, i, arr) => (
                <span key={i}>
                  {p}{i < arr.length - 1 && <span className="fd-sep"> / </span>}
                </span>
              ))}
            </div>
            <span className="fd-author">@{filter.author} · v{filter.version}</span>
          </div>
          <div className="fd-header-actions">
            <button
              className={`fd-install-btn ${installed ? "fd-installed" : ""}`}
              onClick={handleInstall}
              disabled={installing || installed}
            >
              {installing ? "Installing..." : installed ? "Installed ✓" : "Install"}
            </button>
            <button className="fd-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {error && <p className="fd-error">{error}</p>}

        {/* Readme body */}
        <div className="fd-body">
          {md === null
            ? <p className="fd-loading">Loading...</p>
            : <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
          }
        </div>

      </div>
    </div>
  );
}