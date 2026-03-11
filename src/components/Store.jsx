// Store.jsx
import { useEffect, useState } from "react";
import "../styles/Store.css";
import FilterDetail from "./FilterDetail";

const INDEX_URL =
  "https://raw.githubusercontent.com/JaimELegor/gargoyles-filters-test/main/filters/index.json";

export default function Store() {
  const [filters, setFilters]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);

  async function loadFilters(bust = false) {
    setLoading(true);
    setError(null);
    if (bust) sessionStorage.removeItem("gargoyles-store-index");
    try {
      const cached = sessionStorage.getItem("gargoyles-store-index");
      if (cached) {
        setFilters(JSON.parse(cached).filters);
        return;
      }
      const r = await fetch(INDEX_URL);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      sessionStorage.setItem("gargoyles-store-index", JSON.stringify(data));
      setFilters(data.filters);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadFilters(); }, []);

  if (loading) return <div className="store-state">Loading filters...</div>;
  if (error)   return <div className="store-state store-error">Error: {error}</div>;

  return (
    <>
      <div className="store-toolbar">
        <button className="store-refresh-btn" onClick={() => loadFilters(true)}>
          ↺ Refresh
        </button>
      </div>

      <div className="store-grid">
        {filters.map((f) => (
          <div key={f.id} className="store-card" onClick={() => setSelected(f)}>
            <div className="store-thumb-wrap">
              <img
                src={f.thumbnail}
                alt={f.name}
                className="store-thumb"
                loading="lazy"
              />
            </div>
            <div className="store-card-body">
              <div className="store-breadcrumb">
                {f.name.split("/").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="store-sep"> / </span>}
                  </span>
                ))}
              </div>
              <p className="store-desc">{f.description.split("\n\n")[0]}</p>
              <div className="store-footer">
                <span className="store-author">@{f.author}</span>
                <span className="store-version">v{f.version}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <FilterDetail
          filter={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
