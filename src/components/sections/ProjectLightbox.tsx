import { ChevronLeft, ChevronRight } from "lucide-react";
import { WhatsAppButton } from "@/components/common/ContactButtons";
import { SitePhoto } from "@/components/common/SitePhoto";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { categoryLabels, copy } from "@/data/site";
import type { Project } from "@/data/types";
import { projectMessage } from "@/lib/whatsapp";

interface ProjectLightboxProps {
  projects: Project[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

export function ProjectLightbox({ projects, index, onIndexChange }: ProjectLightboxProps) {
  const project = index !== null ? projects[index] : undefined;
  const count = projects.length;
  const go = (step: number) => {
    if (index === null) return;
    onIndexChange((index + step + count) % count);
  };

  return (
    <Dialog open={!!project} onOpenChange={(open) => !open && onIndexChange(null)}>
      {project && (
        <DialogContent
          // A plain column that scrolls: in a grid, short phone screens squeeze the photo's row and it overlaps the text.
          className="flex max-h-[92svh] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-y-auto rounded-[var(--cut)] border-0 bg-sheet p-0 sm:max-w-5xl [&>*]:shrink-0 [&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-sheet [&>button:last-child]:opacity-100"
          // Focus the dialog itself so the photo and title stay in view; arrow keys still work.
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
        >
          <SitePhoto
            key={project.id}
            photo={project.photo}
            ratio={16 / 10}
            priority
            maxWidth={1600}
            sizes="(min-width: 1040px) 1024px, 100vw"
            className="animate-in duration-500 fade-in"
          />
          <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="label text-maroon-600">{categoryLabels[project.category]}</p>
              <DialogTitle className="mt-2 font-display text-[2.1rem] leading-[0.95] font-[740] [font-stretch:84%]">{project.title}</DialogTitle>
              <DialogDescription className="mt-4 max-w-[60ch] text-base text-ash-700">{project.summary}</DialogDescription>
            </div>
            <div className="flex flex-col gap-3">
              <WhatsAppButton label={copy.projectsPage.lightboxCta} text={projectMessage(project.title)} />
              {count > 1 && (
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <Button variant="outline" size="icon" onClick={() => go(-1)} aria-label="Previous photo">
                    <ChevronLeft />
                  </Button>
                  <span className="label text-ash-600 tabular-nums" aria-live="polite">
                    {index! + 1} / {count}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => go(1)} aria-label="Next photo">
                    <ChevronRight />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
