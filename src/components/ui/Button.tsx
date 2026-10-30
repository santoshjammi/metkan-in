import Link from "next/link";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buttonVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center gap-2 text-center font-medium",
    "rounded-xs border transition-[background-color,border-color,color,transform] duration-[160ms] ease-arc",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "active:translate-y-px",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Copper surface always takes ink text — white fails contrast on copper. */
        primary:
          "border-copper bg-copper text-ink hover:border-copper-hi hover:bg-copper-hi",
        secondary:
          /* A 0.14 hairline reads as an edge, not a control. 0.32 puts the
             button outline at 2.7:1 against ink, up from 1.4:1. */
          "border-line-strong bg-transparent text-ivory hover:border-ivory/55 hover:bg-ivory/[0.06]",
        ghost:
          "border-transparent bg-transparent text-ivory hover:bg-ivory/5",
      },
      size: {
        sm: "min-h-11 px-4 text-[0.82rem]",
        md: "min-h-12 px-6 text-[0.92rem]",
        lg: "min-h-14 px-8 text-[1rem]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">,
    ButtonVariantProps {
  /** Renders an anchor when present. Internal routes only. */
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button({ href, variant, size, className, children, ...rest }, ref) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      className={classes}
      {...rest}
    >
      {children}
    </button>
  );
});
