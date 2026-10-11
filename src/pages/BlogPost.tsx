import { ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { WhatsAppButton } from "@/components/common/ContactButtons";
import { DemoTag } from "@/components/common/DemoTag";
import { Prose } from "@/components/common/Prose";
import { JsonLd, Seo } from "@/components/common/Seo";
import { SitePhoto } from "@/components/common/SitePhoto";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/sections/CtaBand";
import { PostCard, PostMeta } from "@/components/sections/PostCard";
import { blog, copy } from "@/data/site";
import { newestFirst } from "@/lib/blog";
import { paths } from "@/lib/paths";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/schema";
import NotFound from "./NotFound";

/** /blog/<slug>/: one post, a box to order from it, then two more posts. */
export default function BlogPost() {
  const { slug } = useParams();
  const post = blog.find((p) => p.slug === slug);
  if (!post) return <NotFound />;

  const text = copy.blogPage;
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: copy.nav.blog, path: paths.blog },
    { name: post.title, path: paths.post(post.slug) },
  ];
  const more = newestFirst(blog)
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <>
      <Seo title={post.seo.title || post.title} description={post.seo.description || post.excerpt} path={paths.post(post.slug)} image={post.photo} />
      <JsonLd data={[blogPostingSchema(post), breadcrumbSchema(crumbs)]} />

      <article>
        <header className="wrap pt-3 sm:pt-5">
          <Breadcrumbs items={crumbs} />
          <div className="mx-auto max-w-3xl pt-6 pb-10 lg:pt-10 lg:pb-12">
            <div className="flex flex-wrap items-center gap-3">
              <PostMeta post={post} />
              {post.placeholder && <DemoTag>Sample</DemoTag>}
            </div>
            <h1 className="mt-4 text-[2.5rem] text-ink sm:text-[3.5rem] lg:text-[4.1rem]">{post.title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-ash-600 sm:text-xl">{post.excerpt}</p>
            <p className="mt-5 text-sm text-ash-600">
              {text.byLabel} <span className="font-semibold text-ink">{post.author}</span>
            </p>
          </div>
        </header>

        <div className="wrap">
          <SitePhoto
            photo={post.photo}
            ratio={16 / 9}
            priority
            maxWidth={1600}
            sizes="(min-width: 1088px) 1024px, calc(100vw - 2rem)"
            className="round-panel mx-auto max-w-5xl [--cut:28px]"
          />
        </div>

        <div className="wrap py-12 md:py-16">
          <div className="mx-auto max-w-[68ch]">
            {post.sections.map((s, i) => (
              <div key={i} className="mt-10 first:mt-0">
                {s.heading && <h2 className="mb-4 text-[1.9rem] sm:text-[2.3rem]">{s.heading}</h2>}
                <Prose text={s.body} />
              </div>
            ))}

            <aside aria-labelledby="order-title" className="mt-14 rounded-[var(--cut)] border-l-4 border-maroon-500 bg-sheet p-6 sm:p-8">
              <h2 id="order-title" className="text-[1.9rem] sm:text-[2.2rem]">
                {text.orderTitle}
              </h2>
              <p className="mt-3 max-w-[52ch] leading-relaxed text-ash-600">{text.orderText}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <WhatsAppButton />
                <Button asChild variant="outline" className="group">
                  <Link to={paths.services}>
                    {text.menuLink}
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="defer-render wrap pb-20 md:pb-28">
          <h2 id="more-title" className="text-[2rem] sm:text-[2.6rem]">
            {text.moreTitle}
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {more.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <CtaBand title={text.ctaTitle} />
    </>
  );
}
