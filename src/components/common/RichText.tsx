import { boldParts } from "@/lib/text";

/** Editable text with **bold** words. Everything else is plain text (no HTML). */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {boldParts(text).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : p.text))}
    </>
  );
}
