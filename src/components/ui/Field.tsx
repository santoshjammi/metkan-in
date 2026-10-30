import { forwardRef } from "react";
import { TriangleAlert } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Label } from "./Label";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Props the control must spread onto itself so hint/error are announced. */
export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
}

export interface FieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "id"> {
  /** Single id shared by the label, control, hint and error. */
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Render prop: spread the argument onto Input / Textarea / Select. */
  children: (control: FieldControlProps) => React.ReactNode;
}

/**
 * Label + control + hint + error with `aria-describedby` wired for you.
 *
 *   <Field id="email" label="Email" error={errors.email}>
 *     {(control) => <Input type="email" {...control} />}
 *   </Field>
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { id, label, hint, error, required = false, className, children, ...rest },
  ref,
) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ");
  const hasError = Boolean(error);

  return (
    <div ref={ref} className={cn("flex flex-col gap-2", className)} {...rest}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>

      {children({
        id,
        "aria-describedby": describedBy.length > 0 ? describedBy : undefined,
        "aria-invalid": hasError ? true : undefined,
        "aria-required": required ? true : undefined,
      })}

      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed text-steel">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          className="flex items-start gap-1.5 text-xs font-medium leading-relaxed text-copper-hi"
        >
          <TriangleAlert
            aria-hidden="true"
            size={13}
            strokeWidth={1.6}
            className="mt-[0.15em] shrink-0"
          />
          <span>
            <span className="sr-only">Error: </span>
            {error}
          </span>
        </p>
      ) : null}
    </div>
  );
});
