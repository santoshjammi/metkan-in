import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Hairline-bordered surface. Deliberately no shadow — industrial, not SaaS. */
export const cardVariants = cva("rounded-sm border", {
  variants: {
    tone: {
      dark: "border-line bg-graphite/40 text-ivory",
      light: "border-line-ink bg-ivory-2/50 text-text-dark",
      bare: "border-line bg-transparent text-ivory",
    },
  },
  defaultVariants: { tone: "dark" },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { tone, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn(cardVariants({ tone }), className)} {...rest}>
      {children}
    </div>
  );
});
