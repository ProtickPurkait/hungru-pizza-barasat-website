import { PageHero } from "@/components/common/PageHero";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JsonLd, Seo } from "@/components/common/Seo";
import { CtaBand } from "@/components/sections/CtaBand";
import { PostCard } from "@/components/sections/PostCard";
import { blog, copy, pageSeo } from "@/data/site";
import { newestFirst } from "@/lib/blog";
import { paths } from "@/lib/paths";
import { blogSchema, breadcrumbSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";

/** /blog/: every post, newest first. The newest one gets a wide card. */
export default function BlogIndex() {
  const text = copy.blogPage;
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: copy.nav.blog, path: paths.blog },
  ];
  const [newest, ...rest] = newestFirst(blog);
  return (
    <>
      <Seo {...pageSeo.blog} path={paths.blog} image={text.hero.photo} />
      <JsonLd data={[blogSchema(newestFirst(blog)), breadcrumbSchema(crumbs)]} />
      <PageHero breadcrumbs={crumbs} eyebrow={text.hero.eyebrow} title={text.hero.title} lead={text.hero.lead} photo={text.hero.photo} />
      <section aria-labelledby="posts-title" className="wrap pt-16 pb-20 md:pt-24 md:pb-28">
        <SectionHeading id="posts-title" title={text.listTitle} size="md" />
        {newest && (
          <div className="mt-10">
            <PostCard post={newest} feature />
          </div>
        )}
        {rest.length > 0 && (
          <ul className={cn("mt-6 grid gap-6 md:grid-cols-2", rest.length % 3 === 0 && "lg:grid-cols-3")}>
            {rest.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <CtaBand title={text.ctaTitle} />
    </>
  );
}
