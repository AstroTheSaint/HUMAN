import React from "react";

import { cn } from "@/lib/utils";

export function RainbowButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center border-0 bg-[length:200%] px-8 py-2 font-medium text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 w-full",

        // before styles
        "before:absolute before:bottom-[0%] before:left-1/2 before:z-0 before:h-1/5 before:w-full before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))] [--speed:8s]",

        // light mode colors
        "bg-[linear-gradient(#121213,#121213),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // dark mode colors
        "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
