import { forwardRef, useId, useImperativeHandle, useRef, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/icons";
import { InlineText } from "@/components/common/Prose";
import { RichText } from "@/components/common/RichText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { copy, jobs } from "@/data/site";
import { MESSAGE_MAX, validateApplication, type ApplicationErrors } from "@/lib/validation";
import { applicationMessage, openWhatsApp, waUrl, type Application } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const fieldOrder: (keyof Application)[] = ["name", "phone", "role", "experience", "area", "message"];

export interface ApplyFormHandle {
  /** Picks a job in the form and moves the keyboard focus to the first field. */
  choose: (role: string) => void;
}

/** Job application. No backend: on submit it opens WhatsApp with the application written out. */
export const ApplyForm = forwardRef<ApplyFormHandle, { className?: string }>(function ApplyForm({ className }, handle) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const [values, setValues] = useState<Application>({ name: "", phone: "", role: "", experience: "", area: "", message: "" });
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const refs = useRef<Partial<Record<keyof Application, HTMLElement | null>>>({});
  const text = copy.careersPage.form;
  const ref = (key: keyof Application) => (el: HTMLElement | null) => {
    refs.current[key] = el;
  };

  function update<K extends keyof Application>(key: K, value: Application[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  useImperativeHandle(handle, () => ({
    choose(role) {
      setSentUrl(null);
      update("role", role);
      // After the form has scrolled into view: the name field, or the next empty one.
      window.setTimeout(() => refs.current[values.name ? "phone" : "name"]?.focus({ preventScroll: true }), 0);
    },
  }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateApplication(values);
    setErrors(found);
    const first = fieldOrder.find((k) => found[k]);
    if (first) {
      refs.current[first]?.focus();
      return;
    }
    const url = waUrl(applicationMessage(values));
    setSentUrl(url);
    openWhatsApp(url);
  }

  const describedBy = (key: keyof Application) => (errors[key] ? id(`${key}-error`) : undefined);
  const errorText = (key: keyof Application) =>
    errors[key] ? (
      <p id={id(`${key}-error`)} className="mt-1.5 text-sm font-medium text-destructive">
        {errors[key]}
      </p>
    ) : null;
  const field = (key: keyof Application) => ({
    id: id(key),
    ref: ref(key),
    className: "mt-1.5",
    "aria-invalid": !!errors[key],
    "aria-describedby": describedBy(key),
  });

  if (sentUrl) {
    return (
      <div className={cn("ground-light round-panel bg-sheet p-6 [--cut:28px] sm:p-10", className)} role="status">
        <CheckCircle2 className="size-11 text-whatsapp-600" aria-hidden="true" />
        <h3 className="mt-4 text-[2.2rem] sm:text-[2.6rem]">{text.successTitle}</h3>
        <p className="mt-4 max-w-[52ch] text-ash-600">
          <RichText text={text.successText} />
        </p>
        <Button asChild variant="whatsapp" className="mt-6">
          <a href={sentUrl} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="size-5" />
            {text.reopen}
          </a>
        </Button>
        <button type="button" onClick={() => setSentUrl(null)} className="mt-5 block min-h-11 text-sm font-semibold text-ash-700 underline underline-offset-4 hover:text-ink">
          {text.edit}
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className={cn("ground-light round-panel bg-sheet p-5 [--cut:28px] sm:p-9", className)} aria-label={copy.careersPage.formTitle}>
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <div>
          <Label htmlFor={id("name")}>{text.name}</Label>
          <Input {...field("name")} autoComplete="name" value={values.name} onChange={(e) => update("name", e.target.value)} required />
          {errorText("name")}
        </div>

        <div>
          <Label htmlFor={id("phone")}>{text.phone}</Label>
          <Input
            {...field("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={copy.form.phonePlaceholder}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />
          {errorText("phone")}
        </div>

        <div>
          <Label htmlFor={id("role")}>{text.role}</Label>
          <NativeSelect {...field("role")} value={values.role} onChange={(e) => update("role", e.target.value)} required>
            <NativeSelectOption value="">{text.rolePlaceholder}</NativeSelectOption>
            {jobs.map((j) => (
              <NativeSelectOption key={j.id} value={j.title}>
                {j.title}
              </NativeSelectOption>
            ))}
            <NativeSelectOption value={text.anyRole}>{text.anyRole}</NativeSelectOption>
          </NativeSelect>
          {errorText("role")}
        </div>

        <div>
          <Label htmlFor={id("experience")}>{text.experience}</Label>
          <NativeSelect {...field("experience")} value={values.experience} onChange={(e) => update("experience", e.target.value)} required>
            <NativeSelectOption value="">{text.experiencePlaceholder}</NativeSelectOption>
            {text.experienceOptions.map((o, i) => (
              <NativeSelectOption key={i} value={o}>
                {o}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {errorText("experience")}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor={id("area")}>{text.area}</Label>
          <Input {...field("area")} autoComplete="address-level2" maxLength={100} placeholder={text.areaPlaceholder} value={values.area} onChange={(e) => update("area", e.target.value)} required />
          {errorText("area")}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor={id("message")}>
            {text.message} <span className="font-normal text-ash-600">(optional)</span>
          </Label>
          <Input {...field("message")} maxLength={MESSAGE_MAX + 50} placeholder={text.messagePlaceholder} value={values.message} onChange={(e) => update("message", e.target.value)} />
          {errorText("message")}
        </div>
      </div>

      <Button type="submit" variant="whatsapp" size="lg" className="mt-7 w-full">
        <WhatsAppIcon className="size-5" />
        {text.submit}
      </Button>
      <p className="mt-3 text-center text-sm text-ash-600">{text.submitNote}</p>
      {text.privacyNote && (
        <p className="mt-1 text-center text-xs leading-relaxed text-ash-600">
          <InlineText text={text.privacyNote} linkClassName="font-semibold underline underline-offset-4 hover:text-ink" />
        </p>
      )}
    </form>
  );
});
