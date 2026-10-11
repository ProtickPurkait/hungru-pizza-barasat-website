// Earlier published versions, from the Git history of content.json. Opening one puts it
// in the editor as a draft (undoable); publishing it makes it live again.
import { useEffect, useState } from "react";
import { Clock, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type HistoryEntry } from "./api";
import { useEditor } from "./store";
import { useUi } from "./ui";

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

export function History({ mode }: { mode: "github" | "local" | null }) {
  const { dispatch } = useEditor();
  const { toast } = useUi();
  const [list, setList] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "github") return;
    api
      .history()
      .then((r) => setList(r.history))
      .catch((e: Error) => setError(e.message));
  }, [mode]);

  if (mode !== "github") {
    return (
      <p className="border-[1.5px] border-ash-200 bg-sheet p-5 text-ash-700">
        History is kept on the live site, where every publish is saved to GitHub. On this computer, use Undo, or Git, to go back.
      </p>
    );
  }
  if (error) return <p className="border-l-[3px] border-destructive bg-sheet p-4 text-sm text-ash-700">{error}</p>;
  if (!list) {
    return (
      <p className="flex items-center gap-2 text-ash-600">
        <Loader2 className="size-4 animate-spin" /> Loading history…
      </p>
    );
  }

  const open = async (entry: HistoryEntry) => {
    setLoading(entry.commit);
    try {
      const { content } = await api.content(entry.commit);
      dispatch({ type: "replace", content });
      toast(`Opened the version from ${when(entry.date)}. Check the preview, then publish to make it live.`, {
        tone: "success",
        action: { label: "Undo", run: () => dispatch({ type: "undo" }) },
      });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not open that version.", { tone: "error" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <ol className="flex flex-col border-t-[1.5px] border-ash-200">
      {list.map((entry, i) => (
        <li key={entry.commit} className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b-[1.5px] border-ash-200 bg-sheet px-4 py-3.5">
          <Clock className="size-4 shrink-0 text-ash-500" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">
              {entry.message}
              {i === 0 && <span className="label ml-2 bg-whatsapp/25 px-1.5 py-0.5 text-[0.6rem] text-ink">Latest</span>}
            </p>
            <p className="text-xs text-ash-600">
              {when(entry.date)} · {entry.author} · <span className="font-mono">{entry.commit.slice(0, 7)}</span>
            </p>
          </div>
          {i > 0 && (
            <Button type="button" variant="outline" size="sm" className="h-9 px-3" disabled={loading !== null} onClick={() => open(entry)}>
              {loading === entry.commit ? <Loader2 className="animate-spin" /> : <RotateCcw />} Open this version
            </Button>
          )}
        </li>
      ))}
      {list.length === 0 && <li className="py-8 text-center text-ash-600">Nothing published from here yet.</li>}
    </ol>
  );
}
