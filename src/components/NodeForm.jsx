import { useMemo, useState } from "react";
import CodeEditorField from "./CodeEditorField";
import "../styles/NodeForm.css";
import { useFilter } from "../contexts/FilterContext";
import { useAuth } from "../contexts/AuthContext";
import { useFilterRegistry } from "../contexts/FilterRegistryContext";
import { useImage } from "../contexts/ImageContext";


function newParam() {
  return {
    paramName: "",
    value: 0,
    min: 0,
    max: 1,
    step: 0.01,
  };
}

const DANGEROUS_GLOBALS = [
  "window", "document", "fetch", "localStorage",
  "sessionStorage", "indexedDB", "XMLHttpRequest",
  "navigator", "location", "history", "eval", "console",
  "console.log", "alert"
];

const checkForMaliciousCode = (src) =>
  DANGEROUS_GLOBALS.find((g) => new RegExp(`\\b${g}\\b`).test(src));

const generateProcessFunc = (params) => {
  const names = params
    .map((p) => (p.paramName || "").trim())
    .filter(Boolean);

  const destructure = names.length > 0
    ? `const [${names.join(", ")}] = params;`
    : `// no params yet`;

  return `(img, r, g, b, a, x, y, ...params) => {\n  ${destructure}\n}`;
};

const mergeParamsIntoProcessFunc = (src, params) => {
  const names = params
    .map((p) => (p.paramName || "").trim())
    .filter(Boolean);

  if (names.length === 0) return src;

  const destructureRegex = /const\s*\[([^\]]*)\]\s*=\s*params\s*;/;
  const match = src.match(destructureRegex);

  if (match) {
    const existing = match[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const toAdd = names.filter((n) => !existing.includes(n));
    if (toAdd.length === 0) return src;

    const merged = [...existing, ...toAdd].join(", ");
    return src.replace(destructureRegex, `const [${merged}] = params;`);
  }

  // No destructure line yet — inject after opening brace
  const braceIdx = src.indexOf("{");
  if (braceIdx === -1) return src;

  const newLine = `\n  const [${names.join(", ")}] = params;`;
  return src.slice(0, braceIdx + 1) + newLine + src.slice(braceIdx + 1);
};


export default function NodeForm({ initialValue, onSaved, path }) {
  const { isAuthed, loginWithGithub, apiFetch } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isProcessFuncCustomized, setIsProcessFuncCustomized] = useState(false);
  const { filterSingle } = useFilter();
  const { saveFilter } = useFilterRegistry();
  const { previewCanvas } = useImage();

  const initial = useMemo(() => {
    if (initialValue) {
      const params = initialValue.params?.length ? initialValue.params : [newParam()];
      return {
        path: path || "",
        name: initialValue.name || "",
        icon: initialValue.icon || "",
        params,
        processFunc: initialValue.processFunc || generateProcessFunc(params),
        shader: initialValue.shader || "",
        customized: !!initialValue.processFunc,
        description: "",
      };
    }

    if (filterSingle) return {
      path: filterSingle.name.slice(0, filterSingle.name.lastIndexOf("/")) || "",
      name: filterSingle.name.split("/").at(-1) || "",
      icon: filterSingle.icon || "",
      params: Object.entries(filterSingle.params || {}).map(
        ([key, config]) => ({
          paramName: key,
          value: config.value,
          min: config.min,
          max: config.max,
          step: config.step,
        })
      ),
      processFunc: filterSingle.processFunc?.toString() || "",
      shader: filterSingle.shader || "",
      customized: true,
      description: "",
    };

    const params = [newParam()];
    return {
      path: path || "",
      name: "",
      icon: "",
      params,
      processFunc: generateProcessFunc(params),
      shader: "",
      customized: false,
      description: "",
    };
  }, [filterSingle, initialValue, path]);

  const [form, setForm] = useState(initial);

  const setField = (key, v) => setForm((s) => ({ ...s, [key]: v }));

  // Plain param update — no code touching at all
  const setParam = (idx, patch) =>
    setForm((s) => ({
      ...s,
      params: s.params.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }));

  const addParam = () =>
    setForm((s) => ({
      ...s,
      params: [...s.params, newParam()],
    }));

  const removeParam = (idx) =>
    setForm((s) => {
      const removedName = (s.params[idx]?.paramName || "").trim();
      const updatedParams = s.params.filter((_, i) => i !== idx);

      // Remove the name from the destructure line on delete
      let updatedFunc = s.processFunc;
      if (removedName) {
        const destructureRegex = /const\s*\[([^\]]*)\]\s*=\s*params\s*;/;
        const match = updatedFunc.match(destructureRegex);
        if (match) {
          const remaining = match[1]
            .split(",")
            .map((s) => s.trim())
            .filter((n) => n && n !== removedName);

          updatedFunc = remaining.length > 0
            ? updatedFunc.replace(destructureRegex, `const [${remaining.join(", ")}] = params;`)
            : updatedFunc.replace(destructureRegex, `// no params yet`);
        }
      }

      return { ...s, params: updatedParams, processFunc: updatedFunc };
    });

  // Called by the "Sync to code" button — merges named params into destructure
  const syncParamsToCode = () => {
    setForm((s) => ({
      ...s,
      processFunc: mergeParamsIntoProcessFunc(s.processFunc, s.params),
    }));
    setIsProcessFuncCustomized(true);
  };

  const getParams = (params) => {
    const paramsObj = {};
    for (const p of params) {
      const key = (p.paramName || "").trim();
      if (!key) continue;
      paramsObj[key] = {
        value: Number(p.value) || 0,
        min: Number(p.min) || 0,
        max: Number(p.max) || 1,
        step: Number(p.step) || 0.01,
      };
    }
    return paramsObj;
  };

  const validate = () => {
    const errs = {};

    if (!/^[a-zA-Z]{1,32}$/.test((form.name || "").trim())) {
      errs.name = "Letters only, max 32 characters.";
    }

    form.params.forEach((p, idx) => {
      const paramErrs = {};

      if (!/^[a-z0-9]{1,16}$/.test((p.paramName || "").trim())) {
        paramErrs.paramName = "Lowercase letters/digits only, max 16 chars.";
      }

      const value = Number(p.value);
      const min   = Number(p.min);
      const max   = Number(p.max);
      const step  = Number(p.step);

      if (max <= min) {
        paramErrs.max = "Max must be greater than min.";
      }

      if (value < min || value > max) {
        paramErrs.value = `Must be between ${min} and ${max}.`;
      }

      if (step <= 0) {
        paramErrs.step = "Must be greater than 0.";
      } else if (step >= max) {
        paramErrs.step = `Must be less than max (${max}).`;
      }

      if (Object.keys(paramErrs).length > 0) errs[`param_${idx}`] = paramErrs;
    });

    return errs;
  };

  const clearParamFieldError = (idx, field) =>
    setErrors((s) => {
      const next = { ...s };
      if (next[`param_${idx}`]) {
        delete next[`param_${idx}`][field];
        if (Object.keys(next[`param_${idx}`]).length === 0) delete next[`param_${idx}`];
      }
      return next;
    });

  const buildProcessFunc = (src) => {
    const detectedGlobal = checkForMaliciousCode(src);
    if (detectedGlobal) {
      alert(
        `⚠️ Suspicious code detected.\n\n` +
        `Your filter is attempting to access "${detectedGlobal}", which is a browser global.\n\n` +
        `Filters are sandboxed and only allowed to interact with pixel data.\n` +
        `This would be flagged as a cross-site scripting (XSS) attempt if submitted.`
      );
      return null;
    }

    let fn;
    try {
      fn = new Function('"use strict"; return (' + src + ')')();
    } catch (e) {
      const isXSSAttempt = DANGEROUS_GLOBALS.some((g) => e.message.includes(g));
      alert(
        isXSSAttempt
          ? `⚠️ Suspicious code detected.\n\n` +
            `Your filter tried to access a restricted browser API.\n` +
            `Error: ${e.message}\n\n` +
            `Filters only have access to pixel data (img, r, g, b, a, x, y, ...params).`
          : `processFunc has a syntax error:\n${e.message}`
      );
      return null;
    }

    if (typeof fn !== "function") {
      alert("processFunc must be an arrow function, e.g.:\n(img, r, g, b, a, x, y, ...params) => { ... }");
      return null;
    }

    return fn;
  };

  function blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });
  }

  const submit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const detectedGlobal = checkForMaliciousCode(form.processFunc);
    if (detectedGlobal) {
      alert(
        `⚠️ Submission blocked.\n\n` +
        `Your filter is attempting to access "${detectedGlobal}", a restricted browser global.\n\n` +
        `Filters may only interact with pixel data. This attempt has been blocked.`
      );
      return;
    }

    const paramsObj = getParams(form.params);

    const thumbnailBlob = await new Promise((resolve) => 
      previewCanvas.toBlob(resolve, "image/webp", 0.8)
    );

    const thumbnailBase64 = await blobToBase64(thumbnailBlob);

    const payload = {
      name: `${form.path}/${form.name?.trim()}`,
      description: form.description || "",
      version: "1.0.0",
      params: paramsObj,
      processFunc: form.processFunc || "",
      shader: form.shader || "",
      thumbnail: thumbnailBase64 || "",
    };

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/filters/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.error == "Invalid token") {
          loginWithGithub();
        } else {
          console.error("Submit failed:", data);
          alert(data.error || "Failed to submit filter");
        }
        return;
      }

      handleSaveLocally();

      alert(data.message || "Submitted!");
      if (data.prUrl) window.open(data.prUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      alert("Network error submitting filter");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    const paramsObj = getParams(form.params);
    const payload = {
      name: form.name?.trim(),
      description: "",
      version: "1.0.0",
      params: paramsObj,
      processFunc: form.processFunc || "",
      shader: form.shader || "",
    };

    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "nodes-preset.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleSaveLocally = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const paramsObj = getParams(form.params);

    const processFunc = buildProcessFunc(form.processFunc);
    if (!processFunc) return;

    const filter = {
      name: `${form.path}/${form.name?.trim()}`,
      icon: form.icon?.trim() || "🔧",
      params: paramsObj,
      processFunc,
      shader: form.shader || "",
    };

    try {
      await saveFilter(filter);
      alert(`"${filter.name.split("/").at(-1)}" saved locally!`);
      onSaved?.(filter.name);
    } catch (e) {
      console.error(e);
      alert("Failed to save filter locally.");
    }
  };

  return (
    <form className="nf" onSubmit={submit}>
      <div className="nf-row">
        <label className="nf-label">
          Name:
          <>
            {(form.path || path) && (
              <input
                className="nf-input"
                value={(form.path || path) + "/"}
                disabled={true}
              />
            )}
            <input
              className={`nf-input${errors.name ? " nf-inputError" : ""}`}
              value={form.name}
              onChange={(e) => {
                setField("name", e.target.value);
                setErrors((s) => ({ ...s, name: undefined }));
              }}
              placeholder="MyNode"
              readOnly={!!initialValue?.name}
            />
            {errors.name && <span className="nf-error">{errors.name}</span>}
          </>
        </label>

        <label className="nf-label">
          Icon
          <input
            className="nf-input"
            value={form.icon}
            onChange={(e) => setField("icon", e.target.value)}
            placeholder="sparkles"
          />
        </label>
      </div>

      <div className="nf-section">
        <div className="nf-sectionHeader">
          <span>Params</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {/* Syncs all named params into the destructure line on demand */}
            <button type="button" className="nf-btn" onClick={syncParamsToCode}>
              Sync to code
            </button>
            <button type="button" className="nf-btn" onClick={addParam}>
              Add param
            </button>
          </div>
        </div>

        {form.params.map((p, idx) => {
          const pErr = errors[`param_${idx}`] || {};
          return (
            <div key={idx} className="nf-param">
              <div className="nf-row">
                <label className="nf-label">
                  Param name
                  <input
                    className={`nf-input${pErr.paramName ? " nf-inputError" : ""}`}
                    value={p.paramName}
                    onChange={(e) => {
                      setParam(idx, { paramName: e.target.value });
                      clearParamFieldError(idx, "paramName");
                    }}
                    placeholder="u_time"
                  />
                  {pErr.paramName && <span className="nf-error">{pErr.paramName}</span>}
                </label>
              </div>

              <div className="nf-row nf-grid4">
                {[
                  { label: "Value", field: "value" },
                  { label: "Min",   field: "min"   },
                  { label: "Max",   field: "max"   },
                  { label: "Step",  field: "step"  },
                ].map(({ label, field }) => (
                  <label key={field} className="nf-label">
                    {label}
                    <input
                      className={`nf-input${pErr[field] ? " nf-inputError" : ""}`}
                      type="number"
                      value={p[field]}
                      onChange={(e) => {
                        setParam(idx, { [field]: Number(e.target.value) });
                        clearParamFieldError(idx, field);
                      }}
                    />
                    {pErr[field] && <span className="nf-error">{pErr[field]}</span>}
                  </label>
                ))}
              </div>

              <div className="nf-row" style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  className="nf-btn nf-btnDanger"
                  onClick={() => removeParam(idx)}
                  disabled={form.params.length === 1}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="nf-section">
        <label className="nf-label">
          processFunc (code)
          {isProcessFuncCustomized && (
            <button
              type="button"
              className="nf-btn"
              style={{ alignSelf: "flex-start" }}
              onClick={() => {
                setIsProcessFuncCustomized(false);
                setField("processFunc", generateProcessFunc(form.params));
              }}
            >
              Reset to default
            </button>
          )}
          <CodeEditorField
            value={form.processFunc}
            onChange={(v) => {
              if (!isProcessFuncCustomized) setIsProcessFuncCustomized(true);
              setField("processFunc", v);
            }}
            language="javascript"
            placeholder={"(img, r, g, b, a, x, y, ...params) => {\n  // your code here\n}"}
          />
        </label>

        <label className="nf-label" style={{ marginTop: "12px" }}>
          shader (code)
          <CodeEditorField
            value={form.shader}
            onChange={(v) => setField("shader", v)}
            language="glsl"
            placeholder={"// fragment shader...\nvoid main() {\n  // ...\n}"}
          />
        </label>

        <label className="nf-label" style={{ marginTop: "12px" }}>
          description
          <CodeEditorField
            value={form.description}
            onChange={(v) => setField("description", v)}
            language="glsl"
            placeholder={"##Description: this filter is lorem ipsum whatever..."}
          />
        </label>
      </div>

      <div className="nf-row nf-actions">
        {!isAuthed ? (
          <button type="button" className="nf-btn" onClick={loginWithGithub}>
            Login with GitHub to save
          </button>
        ) : (
          <button className="nf-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="nf-spinner" aria-hidden="true" />
                Submitting…
              </>
            ) : (
              "Save"
            )}
          </button>
        )}
        <button type="button" className="nf-btn" onClick={handleSaveLocally}>
          Save locally
        </button>
      </div>
    </form>
  );
}
