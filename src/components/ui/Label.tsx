import { forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string;
  /** Renders a visible asterisk plus a screen-reader "(required)". */
  required?: boolean;
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, required = false, children, ...rest },
  ref,
) {
  return (
    <label
      ref={ref}
      className={cn(
        "block text-[0.82rem] font-medium leading-snug text-ivory/85",
        className,
      )}
      {...rest}
    >
      {children}
      {required ? (
        <>
          <span aria-hidden="true" className="ml-1 text-copper-hi">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      ) : null}
    </label>
  );
});
