import type { BlogPost } from "@/data/types";

/** Reading time at about 200 words a minute, never less than 1. */
export function readMinutes(post: BlogPost): number {
  const words = [post.title, post.excerpt, ...post.sections.flatMap((s) => [s.heading, s.body])].join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Newest first (dates are YYYY-MM-DD, so they sort as text). */
export function newestFirst(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}
