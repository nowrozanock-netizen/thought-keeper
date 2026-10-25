import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Margin — Simple Notes" },
      { name: "description", content: "A calm, fast place to write and keep your notes." },
      { property: "og:title", content: "Margin — Simple Notes" },
      { property: "og:description", content: "A calm, fast place to write and keep your notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Note = { id: string; title: string; body: string; updated: number };
const KEY = "margin-notes";

function Index() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const n = JSON.parse(localStorage.getItem(KEY) || "[]") as Note[];
      setNotes(n);
      setActiveId(n[0]?.id ?? null);
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(notes));
  }, [notes, loaded]);

  const sorted = useMemo(
    () =>
      [...notes]
        .sort((a, b) => b.updated - a.updated)
        .filter((n) => (n.title + n.body).toLowerCase().includes(q.toLowerCase())),
    [notes, q],
  );
  const active = notes.find((n) => n.id === activeId);

  const create = () => {
    const n: Note = { id: crypto.randomUUID(), title: "", body: "", updated: Date.now() };
    setNotes((p) => [n, ...p]);
    setActiveId(n.id);
  };
  const update = (patch: Partial<Note>) =>
    setNotes((p) => p.map((n) => (n.id === activeId ? { ...n, ...patch, updated: Date.now() } : n)));
  const remove = () => {
    const rest = notes.filter((n) => n.id !== activeId);
    setNotes(rest);
    setActiveId(rest[0]?.id ?? null);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="flex w-72 shrink-0 flex-col border-r bg-sidebar">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-display text-2xl">Margin</h1>
          <button onClick={create} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90">
            + New
          </button>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search notes…"
          className="mx-4 mb-3 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <ul className="flex-1 overflow-y-auto">
          {sorted.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => setActiveId(n.id)}
                className={`w-full border-l-2 px-4 py-3 text-left transition-colors ${
                  n.id === activeId ? "border-primary bg-accent" : "border-transparent hover:bg-accent/60"
                }`}
              >
                <div className="truncate font-medium">{n.title || "Untitled"}</div>
                <div className="truncate text-xs text-muted-foreground">{n.body || "No content"}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {new Date(n.updated).toLocaleString()}
                </div>
              </button>
            </li>
          ))}
          {loaded && sorted.length === 0 && (
            <li className="px-4 py-6 text-sm text-muted-foreground">No notes yet.</li>
          )}
        </ul>
      </aside>
      <main className="flex flex-1 flex-col">
        {active ? (
          <>
            <div className="flex items-center justify-end border-b px-8 py-3">
              <button onClick={remove} className="text-sm text-destructive hover:underline">
                Delete
              </button>
            </div>
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-8 py-10">
              <input
                value={active.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Title"
                className="font-display bg-transparent text-4xl outline-none placeholder:text-muted-foreground"
              />
              <textarea
                value={active.body}
                onChange={(e) => update({ body: e.target.value })}
                placeholder="Start writing…"
                className="mt-6 flex-1 resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-muted-foreground"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
            <p className="font-display text-3xl text-foreground">A blank page awaits.</p>
            <button onClick={create} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
              Create your first note
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
