/**
 * Fills {placeholders} in editable text: fill("Pizza delivery in {area}", { area: "Ballygunge" }).
 * Unknown placeholders are left as they are, so a typo shows up on the page instead of vanishing.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Splits "Press **send** now" into plain and bold parts. */
export function boldParts(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) => ({ text: part, bold: i % 2 === 1 }))
    .filter((p) => p.text !== "");
}

export type InlinePart = { kind: "text" | "bold"; text: string } | { kind: "link"; text: string; href: string };

/** Link targets editable text may use: site pages ("/contact/"), "#part", https, mailto and tel. Nothing else becomes a link. */
export function isSafeHref(href: string): boolean {
  return /^(\/(?!\/)|#[\w-]+$|https?:\/\/|mailto:|tel:)/i.test(href);
}

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Splits "Read the [privacy policy](/privacy-policy/) **now**" into plain, bold and link parts. */
export function inlineParts(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const plain = (s: string) => boldParts(s).forEach((p) => parts.push({ kind: p.bold ? "bold" : "text", text: p.text }));
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    plain(text.slice(last, m.index));
    if (isSafeHref(m[2]!)) parts.push({ kind: "link", text: m[1]!, href: m[2]! });
    else plain(m[0]);
    last = m.index + m[0].length;
  }
  plain(text.slice(last));
  return parts;
}

/** Every link target in a piece of text, safe or not (for the content checker). */
export function linkTargets(text: string): string[] {
  return [...text.matchAll(LINK)].map((m) => m[2]!);
}

export type TextBlock = { kind: "p"; lines: string[] } | { kind: "ul"; items: string[] };

const BULLET = /^[-•]\s+/;

/**
 * Paragraphs are separated by an empty line. Lines starting with "- " become a bulleted list,
 * and other lines in the same paragraph are kept as separate lines (handy for addresses).
 */
export function textBlocks(body: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  for (const chunk of body.replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
    let current: TextBlock | null = null;
    for (const raw of chunk.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      if (BULLET.test(line)) {
        const item = line.replace(BULLET, "");
        if (current?.kind === "ul") current.items.push(item);
        else blocks.push((current = { kind: "ul", items: [item] }));
      } else if (current?.kind === "p") current.lines.push(line);
      else blocks.push((current = { kind: "p", lines: [line] }));
    }
  }
  return blocks;
}
