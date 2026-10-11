// Renders any schema field at a path in the draft: plain controls, groups, and lists.
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { join, type Path } from "../path";
import type { Field } from "../schema/types";
import { useEditor, useField } from "../store";
import { useUi } from "../ui";
import { ChecksControl, FieldShell, NumberControl, RangeControl, resolveOptions, SelectControl, TextControl, ToggleControl } from "./controls";
import { LogoControl } from "./logo";
import { IconButton, PhotoControl, PhotosControl, PhotoThumb } from "./photo";

export function FieldView({ field, path }: { field: Field; path: Path }) {
  const p = field.key ? join(path, field.key) : path;
  switch (field.kind) {
    case "group":
      return <GroupView field={field} path={p} />;
    case "list":
      return <ObjectList field={field} path={p} />;
    case "strings":
      return <StringList field={field} path={p} />;
    case "record":
      return (
        <fieldset className="flex flex-col gap-3">
          <legend className="field-label mb-1">{field.label}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {field.keys.map((k) => (
              <Leaf key={k.value} field={{ kind: "text", key: k.value, label: k.label }} path={join(p, k.value)} />
            ))}
          </div>
        </fieldset>
      );
    default:
      return <Leaf field={field} path={p} />;
  }
}

/** A single value. `path` already includes the field's key. */
function Leaf({ field, path }: { field: Field; path: Path }) {
  const { state } = useEditor();
  const [value, set] = useField<any>(path);
  switch (field.kind) {
    case "text":
      return <TextControl label={field.label} hint={field.hint} tokens={field.tokens} value={value} onChange={set} placeholder={field.placeholder} max={field.max} required={field.required} mono={field.mono} />;
    case "textarea":
      return <TextControl multiline rows={field.rows} label={field.label} hint={field.hint} tokens={field.tokens} value={value} onChange={set} max={field.max} required={field.required} />;
    case "number":
      return <NumberControl label={field.label} hint={field.hint} value={value} onChange={set} min={field.min} max={field.max} step={field.step} suffix={field.suffix} />;
    case "toggle":
      return <ToggleControl label={field.label} hint={field.hint} value={value} onChange={set} />;
    case "select":
      return <SelectControl label={field.label} hint={field.hint} value={value} onChange={set} options={resolveOptions(field.options, state.draft)} />;
    case "checks":
      return <ChecksControl label={field.label} hint={field.hint} value={value} onChange={set} options={resolveOptions(field.options, state.draft)} />;
    case "photo":
      return <PhotoControl label={field.label} hint={field.hint} value={value} onChange={set} optional={field.optional} />;
    case "logo":
      return <LogoControl label={field.label} hint={field.hint} value={value} onChange={set} variant={field.variant} />;
    case "photos":
      return <PhotosControl label={field.label} hint={field.hint} value={value} onChange={set} max={field.max} />;
    case "range":
      return <RangeControl label={field.label} hint={field.hint} value={value} onChange={set} suffix={field.suffix} />;
    default:
      return null;
  }
}

function GroupView({ field, path }: { field: Extract<Field, { kind: "group" }>; path: Path }) {
  const [open, setOpen] = useState(!field.collapsed);
  const body = (
    <div className={cn("grid gap-4", field.columns === 2 && "sm:grid-cols-2")}>
      {field.fields.map((f, i) => (
        <div key={i} className={cn(field.columns === 2 && (f.kind === "group" || f.kind === "list" || f.kind === "strings" || f.kind === "textarea" || f.kind === "toggle") && "sm:col-span-2")}>
          <FieldView field={f} path={path} />
        </div>
      ))}
    </div>
  );
  if (!field.label) return body;
  return (
    <section className="border-[1.5px] border-ash-200 bg-sheet">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-start justify-between gap-4 px-4 py-3.5 text-left sm:px-5">
        <span>
          <span className="block font-display text-[1.35rem] leading-none font-[740] text-ink [font-stretch:84%]">{field.label}</span>
          {field.hint && <span className="field-hint mt-1.5 block">{field.hint}</span>}
        </span>
        <ChevronDown className={cn("mt-0.5 size-5 shrink-0 text-ash-500 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && <div className="border-t border-ash-200 px-4 py-4 sm:px-5 sm:py-5">{body}</div>}
    </section>
  );
}

/* ---------------------------------------------------------------- lists */

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

/** A copy of a list item with a code ("slug"/"id") that is not taken yet. */
function duplicate(item: any, siblings: any[]): any {
  const copy = structuredClone(item);
  for (const key of ["slug", "id"]) {
    if (typeof copy[key] === "string") {
      const taken = siblings.map((s) => s[key]);
      let next = `${copy[key]}-copy`;
      for (let i = 2; taken.includes(next); i++) next = `${copy[key]}-copy-${i}`;
      copy[key] = next;
    }
  }
  return copy;
}

function ListHeader({ label, hint, count }: { label: string; hint?: string; count: number }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h3 className="font-display text-[1.5rem] leading-none font-[740] text-ink [font-stretch:84%]">{label}</h3>
        {hint && <p className="field-hint mt-1.5 max-w-[60ch]">{hint}</p>}
      </div>
      <span className="label shrink-0 text-ash-500">{count}</span>
    </div>
  );
}

function ObjectList({ field, path }: { field: Extract<Field, { kind: "list" }>; path: Path }) {
  const { state, dispatch } = useEditor();
  const { toast, setPreviewOverride } = useUi();
  const [items = [], setItems] = useField<any[]>(path);
  const [open, setOpen] = useState<number | null>(null);
  const canAdd = !field.fixed && (field.max === undefined || items.length < field.max);
  const canRemove = !field.fixed && items.length > (field.min ?? 0);

  // While an item with its own page is open, show that page in the preview.
  const openItem = open !== null ? items[open] : undefined;
  const target = openItem && field.preview ? field.preview(openItem) : null;
  useEffect(() => {
    if (!field.preview) return;
    setPreviewOverride(target);
  }, [target, field.preview, setPreviewOverride]);
  useEffect(() => () => (field.preview ? setPreviewOverride(null) : undefined), [field.preview, setPreviewOverride]);

  const remove = (i: number) => {
    const title = field.itemTitle(items[i], i);
    setItems(items.filter((_, j) => j !== i));
    setOpen(null);
    toast(`Removed "${title}".`, { action: { label: "Undo", run: () => dispatch({ type: "undo" }) } });
  };

  return (
    <div className="flex flex-col gap-3">
      <ListHeader label={field.label} hint={field.hint} count={items.length} />
      <ol className="flex flex-col gap-2">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={i} className={cn("border-[1.5px] bg-sheet transition-colors", isOpen ? "border-ink" : "border-ash-200")}>
              <div className="flex items-center gap-1 pr-1.5">
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3 text-left sm:px-4">
                  <span className="label w-6 shrink-0 text-ash-500 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {field.itemPhoto?.(item) && <PhotoThumb photoKey={field.itemPhoto(item)} className="w-16 shrink-0 max-sm:hidden" />}
                  <span className="min-w-0">
                    <span className="line-clamp-2 font-semibold leading-snug text-ink">{field.itemTitle(item, i)}</span>
                    {field.itemSubtitle && <span className="block truncate text-xs text-ash-600">{field.itemSubtitle(item, state.draft)}</span>}
                  </span>
                </button>
                <IconButton label="Move up" disabled={i === 0} onClick={() => (setItems(moveItem(items, i, i - 1)), setOpen(isOpen ? i - 1 : open))}>
                  <ArrowUp />
                </IconButton>
                <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => (setItems(moveItem(items, i, i + 1)), setOpen(isOpen ? i + 1 : open))}>
                  <ArrowDown />
                </IconButton>
                {canAdd && (
                  <IconButton label={`Duplicate ${field.itemLabel}`} className="max-sm:hidden" onClick={() => (setItems([...items.slice(0, i + 1), duplicate(item, items), ...items.slice(i + 1)]), setOpen(i + 1))}>
                    <Copy />
                  </IconButton>
                )}
                {canRemove && (
                  <IconButton label={`Remove ${field.itemLabel}`} className="hover:bg-[#fdeceb] hover:text-destructive" onClick={() => remove(i)}>
                    <Trash2 />
                  </IconButton>
                )}
                <IconButton label={isOpen ? "Close" : "Edit"} onClick={() => setOpen(isOpen ? null : i)}>
                  <ChevronDown className={cn("transition-transform", isOpen && "rotate-180")} />
                </IconButton>
              </div>
              {isOpen && (
                <div className="flex flex-col gap-5 border-t border-ash-200 bg-white/60 px-3.5 py-5 sm:px-5">
                  {field.fields.map((f, j) => (
                    <FieldView key={j} field={f} path={join(path, i)} />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {canAdd && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start border-dashed"
          onClick={() => {
            setItems([...items, field.newItem(state.draft)]);
            setOpen(items.length);
          }}
        >
          <Plus /> Add {field.itemLabel}
        </Button>
      )}
    </div>
  );
}

function StringList({ field, path }: { field: Extract<Field, { kind: "strings" }>; path: Path }) {
  const [items = [], setItems] = useField<string[]>(path);
  const canAdd = !field.fixed && (field.max === undefined || items.length < field.max);
  const canRemove = !field.fixed && items.length > (field.min ?? 0);
  const item = field.itemLabel ?? "item";
  return (
    <FieldShell label={field.label} hint={field.hint}>
      <ol className="flex flex-col gap-2">
        {items.map((text, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="label mt-3 w-6 shrink-0 text-ash-500 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0 flex-1">
              <TextControl
                label=""
                multiline={field.multiline}
                rows={field.multiline ? 3 : undefined}
                value={text}
                onChange={(v) => setItems(items.map((x, j) => (j === i ? v : x)))}
                tokens={field.tokens}
              />
            </div>
            <span className="mt-1 flex shrink-0 flex-col sm:flex-row">
              <IconButton label="Move up" disabled={i === 0} onClick={() => setItems(moveItem(items, i, i - 1))}>
                <ArrowUp />
              </IconButton>
              <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => setItems(moveItem(items, i, i + 1))}>
                <ArrowDown />
              </IconButton>
              {canRemove && (
                <IconButton label={`Remove ${item}`} className="hover:bg-[#fdeceb] hover:text-destructive" onClick={() => setItems(items.filter((_, j) => j !== i))}>
                  <Trash2 />
                </IconButton>
              )}
            </span>
          </li>
        ))}
      </ol>
      {canAdd && (
        <Button type="button" variant="outline" size="sm" className="mt-1 h-9 self-start border-dashed px-3" onClick={() => setItems([...items, ""])}>
          <Plus /> Add {item}
        </Button>
      )}
    </FieldShell>
  );
}
