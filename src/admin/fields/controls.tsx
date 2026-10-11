// Basic form controls for the editor. Each one edits one value in the draft.
import { useId, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { SiteContent } from "@/data/types";
import { cn } from "@/lib/utils";
import type { Option, Options } from "../schema/types";

export function resolveOptions(options: Options, content: SiteContent): Option[] {
  return typeof options === "function" ? options(content) : options;
}

/** Label, hint, placeholder chips and character count around a control. */
export function FieldShell({
  id,
  label,
  hint,
  tokens,
  count,
  max,
  onToken,
  children,
  className,
}: {
  id?: string;
  label: string;
  hint?: string;
  tokens?: string[];
  count?: number;
  max?: number;
  onToken?: (token: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const over = max !== undefined && count !== undefined && count > max;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        {label && (
          <label htmlFor={id} className="field-label">
            {label}
          </label>
        )}
        {max !== undefined && count !== undefined && (
          <span className={cn("text-xs tabular-nums", over ? "font-semibold text-maroon-600" : "text-ash-500")}>
            {count} / {max}
          </span>
        )}
      </div>
      {children}
      {(hint || tokens?.length) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {hint && <p className="field-hint">{hint}</p>}
          {tokens?.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onToken?.(t)}
              title={`Insert {${t}}`}
              className="border border-dashed border-ash-400 bg-white px-1.5 py-0.5 font-mono text-[0.72rem] text-ash-700 hover:border-ink hover:text-ink"
            >
              {`{${t}}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const control = "h-10 bg-white text-[0.95rem]";

export function TextControl({
  label,
  hint,
  tokens,
  value,
  onChange,
  placeholder,
  max,
  required,
  mono,
  multiline,
  rows = 3,
}: {
  label: string;
  hint?: string;
  tokens?: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  required?: boolean;
  mono?: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  const id = useId();
  const v = value ?? "";
  const invalid = required && v.trim() === "";
  const insert = (t: string) => onChange(`${v}${v && !v.endsWith(" ") ? " " : ""}{${t}}`);
  return (
    <FieldShell id={id} label={label} hint={hint} tokens={tokens} onToken={insert} count={max ? v.length : undefined} max={max}>
      {multiline ? (
        <Textarea
          id={id}
          value={v}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-0 bg-white py-2.5 text-[0.95rem] leading-relaxed"
        />
      ) : (
        <Input
          id={id}
          value={v}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(control, mono && "font-mono text-[0.88rem]")}
        />
      )}
    </FieldShell>
  );
}

export function NumberControl({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <div className="flex items-center">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step ?? "any"}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className={cn(control, "tabular-nums", suffix && "border-r-0")}
        />
        {suffix && <span className="grid h-10 shrink-0 place-items-center border-[1.5px] border-input bg-ground-2 px-3 text-sm text-ash-600">{suffix}</span>}
      </div>
    </FieldShell>
  );
}

export function ToggleControl({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6 border-[1.5px] border-ash-200 bg-white p-3.5">
      <div>
        <label htmlFor={id} className="field-label cursor-pointer">
          {label}
        </label>
        {hint && <p className="field-hint mt-0.5">{hint}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!value}
        onClick={() => onChange(!value)}
        className={cn("relative h-7 w-12 shrink-0 border-[1.5px] transition-colors", value ? "border-maroon-500 bg-maroon-500" : "border-ash-400 bg-ash-100")}
      >
        <span className={cn("absolute top-0.5 size-5 bg-white shadow transition-transform", value ? "translate-x-[1.35rem]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

export function SelectControl({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) {
  const id = useId();
  const known = options.some((o) => o.value === value);
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)} className={control} aria-invalid={!known || undefined}>
        {!known && <NativeSelectOption value={value}>{value ? `${value} (missing)` : "Choose…"}</NativeSelectOption>}
        {options.map((o) => (
          <NativeSelectOption key={o.value} value={o.value}>
            {o.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </FieldShell>
  );
}

/** Pick several values from a list, shown as toggle chips. Keeps the order of the options. */
export function ChecksControl({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (v: string[]) => void;
  options: Option[];
}) {
  const selected = new Set(value ?? []);
  const missing = (value ?? []).filter((v) => !options.some((o) => o.value === v));
  const toggle = (v: string) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange([...options.map((o) => o.value).filter((o) => next.has(o)), ...missing.filter((m) => next.has(m))]);
  };
  return (
    <FieldShell label={label} hint={hint}>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {[...options, ...missing.map((m) => ({ value: m, label: `${m} (missing)` }))].map((o) => {
          const on = selected.has(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o.value)}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 border-[1.5px] px-3 text-sm font-semibold transition-colors",
                on ? "border-ink bg-ink text-white" : "border-ash-300 bg-white text-ash-700 hover:border-ink",
              )}
            >
              {on && <Check className="size-3.5" aria-hidden="true" />}
              {o.label}
            </button>
          );
        })}
      </div>
    </FieldShell>
  );
}

export function RangeControl({ label, hint, value, onChange, suffix }: { label: string; hint?: string; value: [number, number]; onChange: (v: [number, number]) => void; suffix?: string }) {
  const [low, high] = value ?? [0, 0];
  return (
    <FieldShell label={label} hint={hint}>
      <div className="grid grid-cols-2 gap-3">
        <NumberControl label="From" value={low} min={0} step={5} suffix={suffix} onChange={(v) => onChange([v, high])} />
        <NumberControl label="To" value={high} min={0} step={5} suffix={suffix} onChange={(v) => onChange([low, v])} />
      </div>
    </FieldShell>
  );
}
