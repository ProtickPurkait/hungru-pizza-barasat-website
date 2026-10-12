import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { Link, useLocation } from "react-router";
import { DietMark } from "@/components/common/DietMark";
import { ServiceIcon } from "@/components/common/ServiceIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { copy, services } from "@/data/site";
import { filterMenu, filtersFromSearch, filtersToSearch, isFiltered, MENU_SORTS, NO_FILTERS, sectionCounts, type MenuFilters, type MenuSort } from "@/lib/menu-filter";
import { paths } from "@/lib/paths";
import { fill } from "@/lib/text";
import { cn } from "@/lib/utils";
import { MenuList } from "./MenuList";

/** A Veg or Non-veg switch: the food mark, the word and a small on / off track. */
function DietSwitch({ diet, label, on, onChange }: { diet: "veg" | "non-veg"; label: string; on: boolean; onChange: (on: boolean) => void }) {
  const veg = diet === "veg";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "inline-flex min-h-12 items-center gap-2.5 rounded-full border-[1.5px] pr-2.5 pl-4 text-[0.95rem] font-semibold whitespace-nowrap transition-colors",
        on ? (veg ? "border-veg text-ink" : "border-nonveg text-ink dark:border-ash-500") : "border-ash-300 text-ash-600 hover:border-ash-600",
      )}
    >
      <DietMark diet={diet} />
      {label}
      <span aria-hidden="true" className={cn("relative h-5 w-9 rounded-full transition-colors", on ? (veg ? "bg-veg" : "bg-nonveg") : "bg-ash-300")}>
        <span className={cn("absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-200", on && "translate-x-4")} />
      </span>
    </button>
  );
}

/**
 * The full menu as a finder: search, a tab for each section, sorting by price or name, and
 * Veg / Non-veg switches. Dishes stay grouped by section, in menu order unless sorted.
 * The filters live in the page address (/menu/?section=veg-pizzas&diet=veg), so a filtered
 * menu can be shared and the home page tiles can open one section. Without JavaScript the
 * full menu is shown, as it is prerendered.
 */
export function MenuFinder() {
  const text = copy.menu;
  const [f, setF] = useState<MenuFilters>(NO_FILTERS);
  const results = useRef<HTMLDivElement>(null);
  const wrote = useRef(false);

  // Filters from the address: read after the first render (which matches the prerendered page), before the browser paints,
  // and again when a link inside the site opens the menu with others (the site search's "See all").
  const { key } = useLocation();
  useLayoutEffect(() => {
    const slugs = services.map((s) => s.slug);
    setF(window.location.search ? filtersFromSearch(window.location.search, slugs) : NO_FILTERS);
  }, [key]);

  // Keep the address in step, without adding a history entry for every keystroke.
  useEffect(() => {
    if (!wrote.current) {
      wrote.current = true;
      return;
    }
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, "", `${pathname}${filtersToSearch(f)}${hash}`);
  }, [f]);

  const update = (patch: Partial<MenuFilters>) => setF((cur) => ({ ...cur, ...patch }));
  const pickSection = (slug: string) => {
    update({ section: slug });
    // Back to the first dish if the visitor had scrolled down into the list.
    if ((results.current?.getBoundingClientRect().top ?? 0) < 0) results.current?.scrollIntoView({ block: "start" });
  };

  const groups = filterMenu(services, f);
  const counts = sectionCounts(services, f);
  const total = services.reduce((n, s) => n + s.items.length, 0);
  const shown = groups.reduce((n, g) => n + g.items.length, 0);
  const searching = f.query.trim() !== "";
  const sortLabel: Record<MenuSort, string> = { menu: text.sortMenu, "price-low": text.sortPriceLow, "price-high": text.sortPriceHigh, name: text.sortName };

  const tab = (active: boolean) =>
    cn(
      "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.9rem] font-semibold whitespace-nowrap transition-colors",
      active ? "bg-ink text-sheet" : "text-ash-700 hover:bg-ash-100 hover:text-ink",
    );
  const count = (n: number, active: boolean) => <span className={cn("text-[0.8rem] font-medium tabular-nums", active ? "opacity-80" : "text-ash-500")}>{n}</span>;

  return (
    <div>
      {/* Search, sorting and the food switches */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <Label htmlFor="menu-search" className="sr-only">
            {text.searchLabel}
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ash-500" aria-hidden="true" />
            <Input
              id="menu-search"
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              maxLength={60}
              placeholder={text.searchPlaceholder}
              value={f.query}
              onChange={(e) => update({ query: e.target.value })}
              className="rounded-full pr-12 pl-12 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {searching && (
              <button
                type="button"
                onClick={() => update({ query: "" })}
                aria-label={text.clearSearch}
                className="absolute top-1/2 right-0.5 grid size-11 -translate-y-1/2 place-items-center rounded-full text-ash-600 hover:text-ink"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[13rem] flex-1 sm:flex-none">
            <Label htmlFor="menu-sort" className="label mb-1.5 block text-ash-600">
              {text.sortLabel}
            </Label>
            <NativeSelect id="menu-sort" value={f.sort} onChange={(e) => update({ sort: e.target.value as MenuSort })} className="rounded-full pl-4">
              {MENU_SORTS.map((s) => (
                <NativeSelectOption key={s} value={s}>
                  {sortLabel[s]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div role="group" aria-label={text.dietLabel} className="flex gap-2">
            <DietSwitch diet="veg" label={text.vegSwitch} on={f.veg} onChange={(veg) => update({ veg })} />
            <DietSwitch diet="non-veg" label={text.nonVegSwitch} on={f.nonVeg} onChange={(nonVeg) => update({ nonVeg })} />
          </div>
        </div>
      </div>

      {/* One section at a time. Stays in reach while scrolling through the dishes. */}
      <div className="sticky top-0 z-30 -mx-4 mt-6 border-y border-ash-200 bg-ground/95 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-ground/85 sm:mx-0 sm:rounded-full sm:border sm:px-2">
        <div role="group" aria-label={text.jumpLabel} className="no-scrollbar flex gap-0.5 overflow-x-auto py-2 xl:justify-between">
          <button type="button" aria-pressed={!f.section} onClick={() => pickSection("")} className={tab(!f.section)}>
            {text.allLabel}
            {count(Object.values(counts).reduce((a, b) => a + b, 0), !f.section)}
          </button>
          {services.map((s) => {
            const active = f.section === s.slug;
            return (
              <button key={s.slug} type="button" aria-pressed={active} onClick={() => pickSection(s.slug)} className={cn(tab(active), !counts[s.slug] && !active && "opacity-50")}>
                <ServiceIcon icon={s.icon} className={cn("size-4", !active && "text-maroon-600")} />
                {s.shortName}
                {count(counts[s.slug] ?? 0, active)}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={results} id="menu-results" className="mt-6 flex scroll-mt-24 flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ash-600">
        <p aria-live="polite" className="font-semibold text-ink">
          {fill(text.results, { shown, total })}
        </p>
        {isFiltered(f) && (
          <button type="button" onClick={() => setF(NO_FILTERS)} className="min-h-11 font-semibold text-ink underline decoration-maroon-500 decoration-2 underline-offset-4">
            {text.clearFilters}
          </button>
        )}
        <span>{text.sizeNote}</span>
        <span className="inline-flex items-center gap-1.5">
          <DietMark diet="veg" /> {text.vegLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <DietMark diet="non-veg" /> {text.nonVegLabel}
        </span>
      </div>

      {groups.length === 0 ? (
        <div className="mt-8 rounded-[var(--cut)] border-[1.5px] border-dashed border-ash-300 px-6 py-12 text-center">
          <p className="mx-auto max-w-[44ch] text-lg text-ash-700">{text.noResults}</p>
          <Button variant="outline" className="mt-6" onClick={() => setF(NO_FILTERS)}>
            {text.clearFilters}
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col">
          {groups.map(({ section: s, items }) => (
            <section key={s.slug} id={s.slug} aria-labelledby={`${s.slug}-title`} className="scroll-mt-24 border-t-2 border-ink py-12 first:mt-2 md:py-16">
              <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
                <div>
                  <h2 id={`${s.slug}-title`} className="text-[2.3rem] sm:text-[2.8rem]">
                    {s.name}
                  </h2>
                  {/* While searching, just the dishes: the section blurb would push them apart. */}
                  {!searching && <p className="mt-4 max-w-[60ch] leading-relaxed text-ash-600">{s.summary}</p>}
                </div>
                <Link to={paths.service(s.slug)} className="group inline-flex min-h-11 items-center gap-2 font-semibold text-ink">
                  <span className="link-draw">{fill(text.sectionLink, { section: s.shortName })}</span>
                  <ArrowRight className="size-4 text-maroon-600 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
              {s.note && !searching && <p className="mt-5 max-w-[70ch] text-sm leading-relaxed text-ash-600">{s.note}</p>}
              {/* Two columns on large screens: the pizza sections have around 50 dishes each */}
              <MenuList section={s.slug} items={items} columns={2} className="mt-10" />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
