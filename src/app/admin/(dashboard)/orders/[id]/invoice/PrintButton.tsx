"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: "#d4a853", color: "#000", border: "none",
        padding: "8px 20px", fontSize: "13px", fontWeight: 600,
        cursor: "pointer", borderRadius: "3px",
      }}
    >
      🖨 Print / Save as PDF
    </button>
  );
}
