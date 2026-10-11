import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { inlineParts, textBlocks } from "@/lib/text";
import { cn } from "@/lib/utils";

const linkClass = "font-semibold text-ink underline decoration-maroon-500 decoration-2 underline-offset-4 hover:text-maroon-600";

function SmartLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  if (href.startsWith("/")) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }
  if (/^https?:/i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/** One line of editable text with **bold** words and [links](/page/). */
export function InlineText({ text, linkClassName = linkClass }: { text: string; linkClassName?: string }) {
  return (
    <>
      {inlineParts(text).map((p, i) =>
        p.kind === "bold" ? (
          <strong key={i} className="font-semibold text-ink">
            {p.text}
          </strong>
        ) : p.kind === "link" ? (
          <SmartLink key={i} href={p.href} className={linkClassName}>
            {p.text}
          </SmartLink>
        ) : (
          <Fragment key={i}>{p.text}</Fragment>
        ),
      )}
    </>
  );
}

/** Long editable text: paragraphs, "- " bullet lists, **bold** and [links](/page/). No HTML. */
export function Prose({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-4 text-[1.05rem] leading-relaxed text-ash-700", className)}>
      {textBlocks(text).map((b, i) =>
        b.kind === "ul" ? (
          <ul key={i} className="list-disc space-y-2 pl-5 marker:text-maroon-500">
            {b.items.map((item, j) => (
              <li key={j} className="pl-1">
                <InlineText text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {b.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <InlineText text={line} />
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
}
