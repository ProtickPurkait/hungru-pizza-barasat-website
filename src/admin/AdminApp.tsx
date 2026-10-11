// Entry of the admin panel: checks the session, shows sign-in or setup help, then loads
// the content and opens the editor.
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { SliceMark } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SiteContent } from "@/data/types";
import { api, type Session } from "./api";
import { Shell } from "./Shell";
import { clearSavedDraft, EditorProvider, initialState, loadSavedDraft, type SavedDraft } from "./store";
import { UiProvider } from "./ui";

function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="ground-dark dot-texture grid min-h-svh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <span className="round-panel grid size-11 place-items-center bg-maroon-500 text-white [--cut:10px]">
            <SliceMark className="h-6 w-9" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[1.7rem] font-[800] text-white [font-stretch:80%]">Hungru Pizza</span>
            <span className="label mt-1 block text-[0.6rem] tracking-[0.3em] text-ash-300">Site editor</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    try {
      await api.login(password);
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setBusy(false);
    }
  };

  return (
    <Screen>
      <form onSubmit={submit} className="ground-light round-panel bg-sheet p-6 [--cut:24px] sm:p-8">
        <h1 className="text-[2.4rem]">Sign in</h1>
        <p className="mt-2 text-ash-600">Edit the text, photos and prices on the website.</p>
        <label htmlFor="password" className="field-label mt-7 block">
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "password-error" : undefined}
          className="mt-1.5"
        />
        {error && (
          <p id="password-error" role="alert" className="mt-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy || !password}>
          {busy ? <Loader2 className="animate-spin" /> : <KeyRound />}
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Screen>
  );
}

const SETUP_HELP: Record<string, string> = {
  ADMIN_PASSWORD: "The password for this page. Pick a long one.",
  GITHUB_TOKEN: 'A GitHub fine-grained token for this repository with "Contents: Read and write". Publishing saves to GitHub with it.',
  GITHUB_REPO: 'The repository as "owner/name". Usually filled in by Vercel automatically, so only needed if it is missing.',
};

function Setup({ missing }: { missing: string[] }) {
  return (
    <Screen>
      <div className="ground-light round-panel bg-sheet p-6 [--cut:24px] sm:p-8">
        <h1 className="text-[2.4rem]">Almost ready</h1>
        <p className="mt-3 text-ash-700">
          The editor needs these settings on the server. In Vercel, open the project, then <strong>Settings → Environment Variables</strong>, add them and redeploy.
        </p>
        <ul className="mt-6 flex flex-col gap-4">
          {missing.map((m) => (
            <li key={m} className="border-l-[3px] border-maroon-500 pl-4">
              <p className="font-mono text-sm font-semibold text-ink">{m}</p>
              <p className="mt-1 text-sm text-ash-600">{SETUP_HELP[m] ?? ""}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ash-600">Step-by-step instructions are in the README, under "Admin panel".</p>
      </div>
    </Screen>
  );
}

function Problem({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Screen>
      <div className="ground-light round-panel bg-sheet p-6 [--cut:24px] sm:p-8" role="alert">
        <h1 className="text-[2.2rem]">Could not open the editor</h1>
        <p className="mt-3 text-ash-700">{message}</p>
        <Button type="button" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </Screen>
  );
}

type Loaded = { content: SiteContent; version: string; saved: SavedDraft | null; stale: SavedDraft | null };

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const s = await api.session();
        if (cancelled) return;
        setSession(s);
        if (!s.signedIn) return;
        const { content, version } = await api.content();
        let saved = loadSavedDraft();
        // Nothing to restore if the saved draft is what is published now.
        if (saved && JSON.stringify(saved.draft) === JSON.stringify(content) && saved.uploads.length === 0) {
          clearSavedDraft();
          saved = null;
        }
        if (cancelled) return;
        // A draft saved on the same version is simply restored. One from before the last publish is offered instead.
        setLoaded({ content, version, saved: saved?.version === version ? saved : null, stale: saved && saved.version !== version ? saved : null });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => setAttempt((a) => a + 1);

  if (error) return <Problem message={error} onRetry={retry} />;
  if (!session) return <Loading />;
  if (session.setup.length > 0) return <Setup missing={session.setup} />;
  if (!session.signedIn) return <SignIn onSignedIn={retry} />;
  if (!loaded) return <Loading />;

  return (
    <EditorProvider initial={initialState(loaded.content, loaded.version, loaded.saved)}>
      <UiProvider>
        <Shell
          session={session}
          staleDraft={loaded.stale}
          onSignOut={async () => {
            await api.logout().catch(() => {});
            setLoaded(null);
            setSession({ ...session, signedIn: false });
          }}
        />
      </UiProvider>
    </EditorProvider>
  );
}

function Loading() {
  return (
    <Screen>
      <p className="flex items-center gap-3 text-ash-300">
        <Loader2 className="size-5 animate-spin text-cheese-400" /> Opening the editor…
      </p>
    </Screen>
  );
}
