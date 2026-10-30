"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  capabilities,
  capabilityNote,
} from "@/content/capabilities";
import {
  cta,
  employmentTypes,
  headcountBands,
  orgTypes,
  timelines,
} from "@/content/site";
import { track } from "@/lib/analytics";
import {
  HONEYPOT_FIELD,
  REFERENCE_PATTERN,
  enquiryFieldsSchema,
  type EnquiryFieldErrors,
} from "@/lib/validation";
import { FormStatus, type FormStatusItem } from "./FormStatus";

interface FormValues {
  name: string;
  organisation: string;
  email: string;
  orgType: string;
  phone: string;
  trades: string[];
  headcount: string;
  location: string;
  employmentType: string;
  timeline: string;
  notes: string;
  consent: boolean;
}

const EMPTY_VALUES: FormValues = {
  name: "",
  organisation: "",
  email: "",
  orgType: "",
  phone: "",
  trades: [],
  headcount: "",
  location: "",
  employmentType: "",
  timeline: "",
  notes: "",
  consent: false,
};

/** DOM order — the first invalid field in this list is the one that gets focus. */
const FIELD_ORDER: (keyof FormValues)[] = [
  "name",
  "organisation",
  "email",
  "phone",
  "orgType",
  "trades",
  "headcount",
  "employmentType",
  "timeline",
  "location",
  "notes",
  "consent",
];

const FIELD_LABELS: Record<string, string> = {
  name: "Your name",
  organisation: "Organisation",
  email: "Work email",
  orgType: "Organisation type",
  phone: "Phone (optional)",
  trades: "Trades",
  headcount: "Approximate numbers",
  employmentType: "Employment type",
  timeline: "Timeline",
  location: "Site or project location",
  notes: "Requirement notes",
  consent: "Consent",
  form: "This form",
};

/** Multi-control fields focus their first control. */
const FOCUS_TARGET: Record<string, string> = {
  trades: "trade-welding",
};

function focusField(key: string): void {
  const id = FOCUS_TARGET[key] ?? key;
  const element = document.getElementById(id);
  if (!element) return;
  element.focus();
  element.scrollIntoView({ block: "center", behavior: "smooth" });
}

function summaryItems(errors: EnquiryFieldErrors): FormStatusItem[] {
  return FIELD_ORDER.filter((key) => errors[key]).map((key) => ({
    id: FOCUS_TARGET[key] ?? key,
    label: FIELD_LABELS[key] ?? key,
    message: errors[key] ?? "",
  }));
}

const GENERIC_FAILURE =
  "Something went wrong on our side and your enquiry was not sent. Please try again — if it keeps failing, call MITT instead.";

export function EnquiryForm() {
  const router = useRouter();

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<EnquiryFieldErrors>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  /**
   * Set on mount, never during render: the server has no idea when the browser
   * started filling the form, and an SSR timestamp would be hours stale for a
   * cached page — which would make every real submission look automated.
   */
  const renderedAt = useRef<number>(0);

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function toggleTrade(slug: string, checked: boolean) {
    setField(
      "trades",
      checked
        ? [...values.trades, slug]
        : values.trades.filter((trade) => trade !== slug),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setAttempted(true);

    /* Client check with the same schema the route uses, so the messages match. */
    const parsed = enquiryFieldsSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: EnquiryFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key !== "string" || nextErrors[key]) continue;
        nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setAlert(null);
      track("enquiry_rejected", { reason: "client_validation" });

      const firstInvalid = FIELD_ORDER.find((key) => nextErrors[key]);
      if (firstInvalid) focusField(firstInvalid);
      return;
    }

    setErrors({});
    setAlert(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          [HONEYPOT_FIELD]: honeypot,
          renderedAt: renderedAt.current,
        }),
      });

      if (response.status === 201) {
        const body: unknown = await response.json().catch(() => null);
        const reference =
          typeof body === "object" && body !== null && "reference" in body
            ? (body as { reference?: unknown }).reference
            : undefined;

        if (typeof reference === "string" && REFERENCE_PATTERN.test(reference)) {
          track("enquiry_submitted");
          router.push(`/thank-you?ref=${encodeURIComponent(reference)}`);
          return;
        }

        /* A 201 without a reference is not a success we can stand behind. */
        track("enquiry_failed", { status: 201 });
        setAlert(GENERIC_FAILURE);
        return;
      }

      if (response.status === 400) {
        const body: unknown = await response.json().catch(() => null);
        const fields =
          typeof body === "object" && body !== null && "fields" in body
            ? (body as { fields?: unknown }).fields
            : undefined;

        if (fields && typeof fields === "object" && !Array.isArray(fields)) {
          const nextErrors: EnquiryFieldErrors = {};
          for (const [key, message] of Object.entries(fields)) {
            if (typeof message === "string") nextErrors[key] = message;
          }
          setErrors(nextErrors);
          track("enquiry_rejected", { reason: "server_validation" });

          const firstInvalid = FIELD_ORDER.find((key) => nextErrors[key]);
          if (firstInvalid) focusField(firstInvalid);
          else focusField("name");
          return;
        }

        track("enquiry_rejected", { reason: "rejected" });
        setAlert(
          "This submission was not accepted. Please reload the page and try again.",
        );
        return;
      }

      if (response.status === 429) {
        const retryAfter = Number.parseInt(
          response.headers.get("retry-after") ?? "",
          10,
        );
        const minutes = Number.isFinite(retryAfter)
          ? Math.max(1, Math.ceil(retryAfter / 60))
          : null;

        track("enquiry_failed", { status: 429 });
        setAlert(
          `Too many enquiries have been sent from this connection.${
            minutes ? ` Please wait about ${minutes} minute${minutes === 1 ? "" : "s"}` : " Please wait a few minutes"
          } and try again, or call MITT directly.`,
        );
        return;
      }

      if (response.status === 503) {
        track("enquiry_failed", { status: 503 });
        setAlert(
          "Your enquiry could not be saved, so it was not sent — nothing has been recorded. Please try again, or call MITT directly.",
        );
        return;
      }

      track("enquiry_failed", { status: response.status });
      setAlert(GENERIC_FAILURE);
    } catch {
      /* Network failure: say so. Never a fabricated success. */
      track("enquiry_failed", { status: 0 });
      setAlert(
        "We couldn't reach the server, so your enquiry was not sent. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const items = summaryItems(errors);
  const tradeError = errors.trades;
  const consentError = errors.consent;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
      className="relative"
    >
      {/* Required-vs-optional, stated plainly before the first field. */}
      <p className="meta max-w-[58ch] text-steel-hi">
        Only the five details marked required are needed to start; everything in
        the optional section below improves MITT&rsquo;s first reply but is not
        needed to send this.
      </p>

      <FormStatus items={attempted ? items : []} alert={alert} />

      <div className="mt-8 flex flex-col gap-6">
        <Field id="name" label="Your name" required error={errors.name}>
          {(control) => (
            <Input
              {...control}
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={(event) => setField("name", event.target.value)}
              disabled={submitting}
            />
          )}
        </Field>

        <Field id="organisation" label="Organisation" required error={errors.organisation}>
          {(control) => (
            <Input
              {...control}
              name="organisation"
              autoComplete="organization"
              value={values.organisation}
              onChange={(event) => setField("organisation", event.target.value)}
              disabled={submitting}
            />
          )}
        </Field>

        <Field
          id="email"
          label="Work email"
          required
          hint="MITT replies to this address."
          error={errors.email}
        >
          {(control) => (
            <Input
              {...control}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => setField("email", event.target.value)}
              disabled={submitting}
            />
          )}
        </Field>

        <Field
          id="phone"
          label="Phone (optional)"
          hint="Non-Indian numbers are fine — +, spaces and dashes are all accepted."
          error={errors.phone}
        >
          {(control) => (
            <Input
              {...control}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              /* Neutral placeholder: a hardcoded "+91" contradicted the hint that
                 non-Indian numbers are accepted. Country code is typed in full. */
              placeholder="+91 98765 43210"
              value={values.phone}
              onChange={(event) => setField("phone", event.target.value)}
              disabled={submitting}
            />
          )}
        </Field>

        <Field
          id="orgType"
          label="Organisation type"
          required
          error={errors.orgType}
        >
          {(control) => (
            <Select
              {...control}
              name="orgType"
              value={values.orgType}
              onChange={(event) => setField("orgType", event.target.value)}
              disabled={submitting}
            >
              <option value="">Select one</option>
              {orgTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <fieldset className="mt-2 border-t border-line pt-8">
          <legend className="eyebrow text-steel-hi">
            Requirement detail (optional)
          </legend>
          <p className="meta mt-3 max-w-[52ch] text-steel-hi">
            None of the fields below are required. The more context you give, the
            more useful MITT&rsquo;s first reply can be.
          </p>

          <div className="mt-6 flex flex-col gap-6">
            <fieldset
              aria-describedby={`${tradeError ? "trades-error" : "trades-hint"} trades-note`}
            >
              <legend className="block text-[0.82rem] font-medium leading-snug text-ivory/85">
                Trades
              </legend>
              <p id="trades-hint" className="meta mt-2 text-steel">
                {capabilityNote}
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {capabilities.map((capability, index) => (
                  <div
                    key={capability.slug}
                    className="flex min-h-[44px] items-center gap-3"
                  >
                    <Checkbox
                      id={index === 0 ? "trade-welding" : `trade-${capability.slug}`}
                      name="trades"
                      value={capability.slug}
                      checked={values.trades.includes(capability.slug)}
                      onChange={(event) =>
                        toggleTrade(capability.slug, event.target.checked)
                      }
                      disabled={submitting}
                      aria-invalid={tradeError ? true : undefined}
                      aria-describedby={tradeError ? "trades-error" : undefined}
                    />
                    <Label
                      htmlFor={
                        index === 0 ? "trade-welding" : `trade-${capability.slug}`
                      }
                      className="cursor-pointer py-0.5 font-normal"
                    >
                      {capability.title}
                    </Label>
                  </div>
                ))}
              </div>

              <p id="trades-note" className="mt-3 text-xs leading-relaxed text-steel">
                Trade not listed? Describe it in &ldquo;Anything else that
                matters&rdquo; below &mdash; it is still reviewed.
              </p>

              {tradeError ? (
                <p
                  id="trades-error"
                  className="mt-3 text-xs font-medium text-copper-hi"
                >
                  <span className="sr-only">Error: </span>
                  {tradeError}
                </p>
              ) : null}
            </fieldset>

            <Field
              id="headcount"
              label="Approximate numbers"
              hint="Total positions across all the trades you selected — not a number per trade."
              error={errors.headcount}
            >
              {(control) => (
                <Select
                  {...control}
                  name="headcount"
                  value={values.headcount}
                  onChange={(event) => setField("headcount", event.target.value)}
                  disabled={submitting}
                >
                  <option value="">Not sure yet</option>
                  {headcountBands.map((band) => (
                    <option key={band.value} value={band.value}>
                      {band.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field
              id="employmentType"
              label="Employment type"
              hint="Permanent means an open-ended role; contract means fixed-term or project work."
              error={errors.employmentType}
            >
              {(control) => (
                <Select
                  {...control}
                  name="employmentType"
                  value={values.employmentType}
                  onChange={(event) =>
                    setField("employmentType", event.target.value)
                  }
                  disabled={submitting}
                >
                  <option value="">Not decided</option>
                  {employmentTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field
              id="timeline"
              label="Timeline"
              hint="When you need people on site — not how long the project runs."
              error={errors.timeline}
            >
              {(control) => (
                <Select
                  {...control}
                  name="timeline"
                  value={values.timeline}
                  onChange={(event) => setField("timeline", event.target.value)}
                  disabled={submitting}
                >
                  <option value="">Not decided</option>
                  {timelines.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field
              id="location"
              label="Site or project location"
              error={errors.location}
            >
              {(control) => (
                <Input
                  {...control}
                  name="location"
                  autoComplete="address-level2"
                  placeholder="City, plant or project site"
                  value={values.location}
                  onChange={(event) => setField("location", event.target.value)}
                  disabled={submitting}
                />
              )}
            </Field>

            <Field
              id="notes"
              label="Anything else that matters"
              hint="Shift pattern, experience level, equipment or process. 1200 characters maximum."
              error={errors.notes}
            >
              {(control) => (
                <Textarea
                  {...control}
                  name="notes"
                  rows={5}
                  value={values.notes}
                  onChange={(event) => setField("notes", event.target.value)}
                  disabled={submitting}
                />
              )}
            </Field>

          </div>
        </fieldset>

        {/* Consent — a long label, so it is built by hand rather than by Field. */}
        <div className="flex min-h-[44px] items-start gap-3 border-t border-line pt-8">
          <Checkbox
            id="consent"
            name="consent"
            checked={values.consent}
            onChange={(event) => setField("consent", event.target.checked)}
            disabled={submitting}
            aria-required
            aria-invalid={consentError ? true : undefined}
            aria-describedby={consentError ? "consent-error" : undefined}
          />
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="consent"
              required
              className="cursor-pointer text-[0.875rem] font-normal leading-relaxed"
            >
              I agree that MITT may use these details to respond to this enquiry.
              I have read the{" "}
              <Link
                href="/privacy"
                className="text-copper-hi underline decoration-copper/50 underline-offset-[0.25em] hover:decoration-copper-hi"
              >
                privacy notice
              </Link>
              .
            </Label>
            {consentError ? (
              <p
                id="consent-error"
                className="text-xs font-medium leading-relaxed text-copper-hi"
              >
                <span className="sr-only">Error: </span>
                {consentError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="meta max-w-[40ch] text-steel-hi">
            Required fields are marked{" "}
            <span aria-hidden="true" className="text-copper-hi">
              *
            </span>
            <span className="sr-only">with an asterisk</span>. No response time is
            promised — MITT replies after reviewing the requirement.
          </p>

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            aria-disabled={submitting}
            className="w-full shrink-0 sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.8}
                  className="motion-safe:animate-spin"
                />
                Sending&hellip;
              </>
            ) : (
              <>
                {cta.submit}
                <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
              </>
            )}
          </Button>
        </div>

        <p className="meta max-w-[62ch] text-steel-hi">
          This form is for employer and agency enquiries. MITT does not collect
          fees, passport details, medical records or visa documents through this
          website, and there is no worker registration or candidate profile here.
        </p>
      </div>

      {/*
        Honeypot. Off-screen (not `display:none`, which some bots skip), outside
        the tab order, hidden from assistive tech, and never autofilled.
        A real person cannot reach it; scripted form-fillers usually do.
      */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden"
      >
        <label htmlFor={HONEYPOT_FIELD}>Website</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>
    </form>
  );
}
