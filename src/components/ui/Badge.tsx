import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-medium uppercase leading-none tracking-[0.14em]",
  {
    variants: {
      tone: {
        copper: "border-copper/45 bg-copper/10 text-copper-hi",
        steel: "border-line bg-transparent text-steel",
        ivory: "border-ivory/25 bg-ivory/5 text-ivory",
        ink: "border-ink/25 bg-ink/5 text-ink",
      },
    },
    defaultVariants: { tone: "steel" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  className?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone, className, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cn(badgeVariants({ tone }), className)} {...rest}>
      {children}
    </span>
  );
});
