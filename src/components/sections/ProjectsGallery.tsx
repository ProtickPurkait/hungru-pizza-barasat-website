import { useMemo, useRef, useState } from "react";
import { Expand } from "lucide-react";
import { SitePhoto } from "@/components/common/SitePhoto";
import { categoryLabels, copy, projectFilters, projects as allProjects } from "@/data/site";
import type { Project } from "@/data/types";
import { belowFold, useScrollScene } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ProjectLightbox } from "./ProjectLightbox";

interface ProjectsGalleryProps {
  projects?: Project[];
  /** Which filter chips to show (ids from projectFilters). Omit to show none. */
  filterIds?: string[];
  limit?: number;
  headingLevel?: "h2" | "h3";
  className?: string;
}

/**
 * Filterable photo wall with a lightbox. Used on Home, the gallery and the menu section pages.
 * From 640px up, every sixth photo gets a large tile, so the wall has a rhythm.
 */
export function ProjectsGallery({ projects = allProjects, filterIds, limit, headingLevel = "h3", className }: ProjectsGalleryProps) {
  const [active, setActive] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [filtered, setFiltered] = useState(false);
  const filters = filterIds ? projectFilters.filter((f) => filterIds.includes(f.id)) : [];
  const listRef = useRef<HTMLUListElement>(null);

  const visible = useMemo(() => {
    const f = projectFilters.find((x) => x.id === active);
    const list = f ? projects.filter((p) => f.categories.includes(p.category)) : projects;
    return limit ? list.slice(0, limit) : list;
  }, [active, projects, limit]);

  const H = headingLevel;
  const big = (i: number) => visible.length > 2 && i % 6 === 0;

  // Photos are "pulled" from the top one after another as they scroll in, like pizzas coming out of the oven.
  useScrollScene(
    listRef,
    ({ gsap, ScrollTrigger }) => {
      const photos = belowFold(gsap.utils.toArray<HTMLElement>("[data-photo]", listRef.current));
      if (photos.length === 0) return;
      gsap.set(photos, { clipPath: "inset(0 0 100% 0)" });
      ScrollTrigger.batch(photos, {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "expo.out", stagger: 0.12, overwrite: true }),
      });
    },
    [active],
  );

  return (
    <div className={className}>
      {filters.length > 0 && (
        <div
          role="group"
          aria-label="Filter photos by type"
          className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {[{ id: "all", label: copy.projectsPage.allFilter }, ...filters].map((f) => {
            const pressed = active === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => {
                  setActive(f.id);
                  setFiltered(true);
                }}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center rounded-full border-[1.5px] px-5 text-[0.95rem] font-semibold transition-colors duration-200",
                  pressed ? "border-ink bg-ink text-sheet" : "border-ash-300 bg-transparent text-ash-700 hover:border-ink hover:text-ink",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} photos
      </p>

      <ul
        ref={listRef}
        key={active}
        className={cn("grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-12", filtered && "animate-in duration-500 fade-in")}
      >
        {visible.map((p, i) => (
          <li key={p.id} className={cn(big(i) && "sm:col-span-2 lg:row-span-2")}>
            <article className="group relative flex h-full flex-col">
              <div data-photo className={cn("relative overflow-hidden rounded-[var(--cut)]", big(i) && "lg:flex-1")}>
                <SitePhoto
                  photo={p.photo}
                  ratio={big(i) ? 16 / 10 : 4 / 3}
                  maxWidth={big(i) ? 1600 : 1080}
                  sizes={
                    big(i)
                      ? "(min-width: 1024px) 800px, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
                      : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, calc(100vw - 2rem)"
                  }
                  className={cn(big(i) && "lg:h-full lg:aspect-auto!")}
                  imgClassName={cn("transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]", big(i) && "object-[50%_70%]")}
                />
                <span
                  aria-hidden="true"
                  className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-sheet text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-90"
                >
                  <Expand className="size-4.5" />
                </span>
              </div>
              <div className="pt-4">
                <p className="label text-maroon-600">{categoryLabels[p.category]}</p>
                <H className={cn("mt-2 leading-[1] text-ink", big(i) ? "text-[1.9rem] sm:text-[2.3rem]" : "text-[1.5rem]")}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    className="text-left after:absolute after:inset-0 after:content-['']"
                  >
                    {p.title}
                    <span className="sr-only">, open larger photo</span>
                  </button>
                </H>
                <p className="mt-2.5 max-w-[46ch] text-[0.95rem] leading-relaxed text-ash-600">{p.summary}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <ProjectLightbox projects={visible} index={openIndex} onIndexChange={setOpenIndex} />
    </div>
  );
}
