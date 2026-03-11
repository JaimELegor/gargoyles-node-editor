import { createPortal } from "react-dom";

export default function FloatingWindow({
  open,
  onClose,
  title = "Window",
  children,
}) {
  if (!open) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10002,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,0.35)",
      }}
      onMouseDown={onClose}
    >
      <div
        style={{
          width: "min(1100px, 92vw)",
          height: "min(720px, 82vh)",
          background: "#111",
          border: "1px solid #333",
          borderRadius: 10,
          zIndex: 10002,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "8px 10px",
            background: "#1a1a1a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{title}</span>
          <button onClick={onClose}>Close</button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}