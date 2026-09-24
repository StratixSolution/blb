"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Note {
  id: number;
  note: string;
  type: string;
  createdAt: string;
}

interface Props {
  orderId: string;
  notes: Note[];
}

export function OrderNotes({ orderId, notes }: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [noteType, setNoteType] = useState<"internal" | "customer">("internal");
  const [saving, setSaving] = useState(false);

  async function addNote() {
    if (!text.trim()) return;
    setSaving(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: text.trim(), noteType }),
    });
    setText("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      {notes.length === 0 ? (
        <p className="text-gray-600 text-sm mb-4">No notes yet.</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {notes.map((n) => (
            <li key={n.id} className={`text-sm p-3 rounded border ${n.type === "customer" ? "border-blue-800 bg-blue-950/30" : "border-gray-800 bg-gray-800/30"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium uppercase tracking-wide ${n.type === "customer" ? "text-blue-400" : "text-gray-500"}`}>
                  {n.type === "customer" ? "Customer-visible" : "Internal"}
                </span>
                <span className="text-gray-600 text-xs">{n.createdAt.slice(0, 16).replace("T", " ")}</span>
              </div>
              <p className="text-gray-300">{n.note}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm px-3 py-2 resize-none focus:outline-none focus:border-amber-500"
        />
        <div className="flex items-center gap-3">
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                value="internal"
                checked={noteType === "internal"}
                onChange={() => setNoteType("internal")}
                className="accent-amber-500"
              />
              <span className="text-gray-400">Internal only</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                value="customer"
                checked={noteType === "customer"}
                onChange={() => setNoteType("customer")}
                className="accent-blue-500"
              />
              <span className="text-blue-400">Customer-visible</span>
            </label>
          </div>
          <button
            onClick={addNote}
            disabled={saving || !text.trim()}
            className="ml-auto bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white text-xs font-medium px-4 py-1.5 rounded transition-colors"
          >
            {saving ? "Adding..." : "Add Note"}
          </button>
        </div>
        {noteType === "customer" && (
          <p className="text-blue-400 text-xs">This note will appear in the next email sent to the customer.</p>
        )}
      </div>
    </div>
  );
}
