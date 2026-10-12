import { Fragment, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  Bike,
  Briefcase,
  CircleHelp,
  Clock,
  CornerDownLeft,
  FileText,
  House,
  MapPin,
  Newspaper,
  Phone,
  Scale,
  Search,
  ShoppingBag,
  X,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { WhatsAppButton } from "@/components/common/ContactButtons";
import { DietMark } from "@/components/common/DietMark";
import { ServiceIcon } from "@/components/common/ServiceIcon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { copy, getContent, services } from "@/data/site";
import type { IconKey } from "@/data/types";
import { formatINR } from "@/lib/format";
import { filterMenu, NO_FILTERS } from "@/lib/menu-filter";
import { paths } from "@/lib/paths";
import { groupHits, markParts, prepareIndex, searchSite, type SearchHit, type SearchIcon } from "@/lib/search";
import { searchEntries } from "@/lib/search-index";
import { fill } from "@/lib/text";
import { cn } from "@/lib/utils";

const ICONS: Partial<Record<SearchIcon, LucideIcon>> = {
  clock: Clock,
  phone: Phone,
  pin: MapPin,
  bike: Bike,
  page: FileText,
  home: House,
  cart: ShoppingBag,
  post: Newspaper,
  job: Briefcase,
  faq: CircleHelp,
  policy: Scale,
};

type Option = { id: string; path: string; hit?: SearchHit; more?: number };

const optionId = (i: number) => `site-search-option-${i}`;

/** The food mark for a dish, otherwise the icon of its kind (a menu section's own icon). */
function ResultIcon({ hit }: { hit: SearchHit }) {
  const { diet, icon } = hit.entry;
  if (diet) return <DietMark diet={diet} />;
  const Icon = icon ? ICONS[icon] : undefined;
  if (Icon) return <Icon className="size-[1.15rem]" aria-hidden="true" />;
  return icon ? (
    <ServiceIcon icon={icon as IconKey} className="size-[1.15rem]" aria-hidden="true" />
  ) : (
    <FileText className="size-[1.15rem]" aria-hidden="true" />
  );
}

/** "From ₹170" for a dish in more than one size, "₹99" for one. */
function priceText(prices: number[]): string {
  const low = formatINR(Math.min(...prices));
  return prices.length > 1 ? `${copy.menu.fromLabel} ${low}` : low;
}

/** The menu searched for these words (cheapest first after "cheap"), and how many dishes it shows; null when its own search finds none. */
function menuLink(words: string[], cheapFirst: boolean): { path: string; count: number } | null {
  const q = words.join(" ");
  const count = q ? filterMenu(services, { ...NO_FILTERS, query: q }).reduce((n, g) => n + g.items.length, 0) : 0;
  if (!count) return null;
  const params = new URLSearchParams({ q });
  if (cheapFirst) params.set("sort", "price-low");
  return { path: `${paths.services}?${params}#menu-results`, count };
}

/**
 * The search panel, opened from the header (or with / or Ctrl+K). Finds dishes, menu sections,
 * pages, posts, delivery areas, jobs, questions and policies as you type, forgiving spelling
 * slips, and answers hours, phone, address and delivery straight away. A result opens its page,
 * at the dish or question when it is one. Works with the arrow keys and Enter.
 * Loaded only when first opened, to keep the first page load light.
 */
export default function SiteSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const text = copy.search;
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // Built each time the panel opens, so the admin's live preview always searches the latest draft.
  const index = useMemo(() => (open ? prepareIndex(searchEntries(getContent())) : null), [open]);
  const results = useMemo(() => (index ? searchSite(index, query) : null), [index, query]);
  const priced = !!results && (results.maxPrice !== null || results.cheap);
  const groups = useMemo(() => (results ? groupHits(results.hits, priced ? 24 : 8) : []), [results, priced]);

  const options: Option[] = groups.flatMap((g) => {
    const rows: Option[] = g.hits.map((hit) => ({ id: hit.entry.id, path: hit.entry.path, hit }));
    const link = g.kind === "dish" && g.more > 0 && results?.maxPrice === null ? menuLink(results.words, results.cheap) : null;
    if (link) rows.push({ id: "more-dishes", path: link.path, more: link.count });
    return rows;
  });
  const typed = query.trim();
  const searching = typed.length >= 2 || priced;

  const change = (value: string) => {
    setQuery(value);
    setActive(0);
    list.current?.scrollTo({ top: 0 });
  };
  const go = (o: Option | undefined) => {
    if (!o) return;
    onOpenChange(false);
    navigate(o.path);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || options.length === 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (active + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      setActive(next);
      document.getElementById(optionId(next))?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(options[active]);
    }
  };

  const suggestions = (
    <div className="px-2 pt-5">
      <p className="label text-ash-600">{text.suggestionsTitle}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {text.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              change(s);
              input.current?.focus();
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-ash-300 bg-sheet px-4 text-[0.95rem] font-semibold text-ink transition-colors hover:border-ink"
          >
            <Search className="size-4 text-ash-500" aria-hidden="true" />
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  const note = results?.partial
    ? text.partial
    : results?.maxPrice != null
      ? fill(text.priceNote, { price: formatINR(results.maxPrice) })
      : results?.cheap
        ? text.cheapNote
        : "";

  let n = -1;
  const row = (o: Option) => {
    const i = ++n;
    const on = i === active;
    const e = o.hit?.entry;
    return (
      <div
        key={o.id}
        id={optionId(i)}
        role="option"
        aria-selected={on}
        onMouseMove={() => !on && setActive(i)}
        onClick={() => go(o)}
        className={cn(
          "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-2.5 py-2.5 transition-colors",
          on ? "bg-sheet shadow-[inset_0_0_0_1.5px_var(--color-ash-300)]" : "hover:bg-sheet/60",
        )}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ground-2 text-maroon-600 dark:text-cheese-400">
          {o.hit ? <ResultIcon hit={o.hit} /> : <Search className="size-[1.15rem]" aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          {e ? (
            <>
              <span className="block leading-snug font-semibold text-ink">
                {markParts(e.title, o.hit!.marks).map((p, k) =>
                  p.mark ? (
                    <mark key={k} className="rounded-[0.25em] bg-cheese-300/80 px-0.5 text-ink dark:bg-cheese-400/25">
                      {p.text}
                    </mark>
                  ) : (
                    <Fragment key={k}>{p.text}</Fragment>
                  ),
                )}
                {e.meta && <span className="ml-2 text-xs font-medium text-ash-500">{e.meta}</span>}
              </span>
              {e.snippet && (
                <span
                  className={cn(
                    "mt-0.5 block text-sm leading-snug",
                    e.kind === "answer" ? "font-medium text-ink" : "text-ash-600",
                    e.kind === "faq" || e.kind === "answer" ? "line-clamp-2" : "line-clamp-1",
                  )}
                >
                  {e.snippet}
                </span>
              )}
            </>
          ) : (
            <span className="font-semibold text-ink underline decoration-maroon-500 decoration-2 underline-offset-4">
              {fill(text.more, { count: o.more ?? 0 })}
            </span>
          )}
        </span>
        {e?.prices && <span className="figure shrink-0 text-[1.15rem] whitespace-nowrap text-ink">{priceText(e.prices)}</span>}
        <CornerDownLeft className={cn("hidden size-4 shrink-0 text-ash-500 [@media(pointer:fine)]:block", !on && "invisible")} aria-hidden="true" />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          input.current?.focus();
          input.current?.select();
        }}
        className="top-0 left-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-ground p-0 sm:top-[8vh] sm:left-1/2 sm:h-auto sm:max-h-[84vh] sm:max-w-2xl sm:-translate-x-1/2 sm:overflow-hidden sm:rounded-[1.75rem] sm:border sm:border-ash-200 sm:shadow-[0_30px_80px_-20px_rgb(22_21_20/0.45)]"
      >
        <DialogTitle className="sr-only">{text.title}</DialogTitle>
        <DialogDescription className="sr-only">{text.keysHint}</DialogDescription>

        <div className="flex items-center gap-2 border-b border-ash-200 p-3 sm:p-4">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ash-500" aria-hidden="true" />
            <Input
              ref={input}
              type="search"
              role="combobox"
              aria-label={text.title}
              aria-expanded={options.length > 0}
              aria-controls="site-search-results"
              aria-autocomplete="list"
              aria-activedescendant={options.length ? optionId(active) : undefined}
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={120}
              placeholder={text.placeholder}
              value={query}
              onChange={(e) => change(e.target.value)}
              onKeyDown={onKeyDown}
              className={cn("h-13 rounded-full pl-12 text-[1.05rem] [&::-webkit-search-cancel-button]:appearance-none", query ? "pr-12" : "pr-4")}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  change("");
                  input.current?.focus();
                }}
                aria-label={text.clear}
                className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-full text-ash-600 hover:text-ink"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            )}
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="shrink-0 px-3">
              {text.close}
            </Button>
          </DialogClose>
        </div>

        <div ref={list} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-5 sm:px-3">
          {!searching ? (
            suggestions
          ) : options.length === 0 ? (
            <div className="px-2 pt-10 text-center">
              <p className="text-lg font-semibold text-ink">{fill(text.noResults, { query: typed })}</p>
              <p className="mx-auto mt-2 max-w-[46ch] leading-relaxed text-ash-600">{text.noResultsHint}</p>
              <WhatsAppButton className="mt-6" label={text.askButton} text={fill(text.askText, { query: typed })} />
              <div className="mt-6 text-left">{suggestions}</div>
            </div>
          ) : (
            <>
              {note && <p className="px-2.5 pt-4 text-sm font-medium text-ash-700">{note}</p>}
              <div id="site-search-results" role="listbox" aria-label={text.title}>
                {groups.map((g) => (
                  <div key={g.kind} role="group" aria-labelledby={`site-search-${g.kind}`} className="pt-4">
                    <p id={`site-search-${g.kind}`} className="label px-2.5 pb-1.5 text-ash-600">
                      {text.groups[g.kind]}
                    </p>
                    {g.hits.map((hit) => row({ id: hit.entry.id, path: hit.entry.path, hit }))}
                    {options.filter((o) => o.more && g.kind === "dish").map(row)}
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="sr-only" aria-live="polite">
            {searching ? fill(text.results, { count: results?.hits.length ?? 0 }) : ""}
          </p>
        </div>

        <p className="hidden border-t border-ash-200 px-5 py-3 text-xs text-ash-500 sm:[@media(pointer:fine)]:block">{text.keysHint}</p>
      </DialogContent>
    </Dialog>
  );
}
