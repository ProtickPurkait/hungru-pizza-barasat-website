import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { DemoTag } from "@/components/common/DemoTag";
import { SitePhoto } from "@/components/common/SitePhoto";
import { copy } from "@/data/site";
import type { BlogPost } from "@/data/types";
import { readMinutes } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { paths } from "@/lib/paths";
import { fill } from "@/lib/text";
import { cn } from "@/lib/utils";

/** Category, date and reading time, above a post's title. */
export function PostMeta({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <p className={cn("label flex flex-wrap items-center gap-x-3 gap-y-1.5 text-ash-600", className)}>
      <span className="text-maroon-600">{post.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span>{fill(copy.blogPage.readTime, { minutes: readMinutes(post) })}</span>
    </p>
  );
}

/**
 * A blog post in a list: photo, details, title and the first lines. The whole card is the
 * link. `feature` puts the photo beside the text once the card is wide (the newest post).
 */
export function PostCard({ post, feature = false, headingLevel = "h3" }: { post: BlogPost; feature?: boolean; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <Link
      to={paths.post(post.slug)}
      className="group @container flex h-full overflow-hidden rounded-[var(--cut)] bg-sheet text-ink transition-shadow duration-500 hover:shadow-[0_24px_50px_-28px_rgb(22_21_20/0.45)]"
    >
      <div className={cn("flex w-full flex-col", feature && "@3xl:flex-row")}>
        <div className={cn("relative overflow-hidden", feature && "@3xl:w-[55%] @3xl:shrink-0")}>
          <SitePhoto
            photo={post.photo}
            ratio={16 / 10}
            maxWidth={1080}
            sizes={feature ? "(min-width: 1024px) 680px, calc(100vw - 2rem)" : "(min-width: 1024px) 400px, (min-width: 768px) 50vw, calc(100vw - 2rem)"}
            className={cn(feature && "@3xl:h-full @3xl:aspect-auto!")}
            imgClassName="transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
          />
        </div>
        <div className={cn("flex flex-1 flex-col p-5 sm:p-6", feature && "lg:p-10")}>
          <PostMeta post={post} />
          <H className={cn("mt-3", feature ? "text-[2rem] sm:text-[2.6rem]" : "text-[1.6rem] sm:text-[1.8rem]")}>{post.title}</H>
          <p className="mt-3 max-w-[56ch] flex-1 leading-relaxed text-ash-600">{post.excerpt}</p>
          <span className="mt-6 flex items-center justify-between gap-3 font-semibold">
            <span className="flex items-center gap-3">
              <span className="link-draw">{copy.blogPage.readMore}</span>
              {post.placeholder && <DemoTag>Sample</DemoTag>}
            </span>
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full border-[1.5px] border-ink transition-colors duration-300 group-hover:border-maroon-500 group-hover:bg-maroon-500 group-hover:text-white"
            >
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
