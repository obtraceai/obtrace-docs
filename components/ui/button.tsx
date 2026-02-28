import { cn } from "../../lib/cn";

type ButtonVariantProps = {
  color?: "primary" | "secondary" | "ghost";
  size?: "sm" | "icon-sm";
  className?: string;
};

export function buttonVariants({ color = "primary", size = "sm", className }: ButtonVariantProps = {}) {
  const base = "inline-flex items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

  const colorClass =
    color === "secondary"
      ? "bg-fd-secondary text-fd-secondary-foreground hover:opacity-90"
      : color === "ghost"
        ? "bg-transparent hover:bg-fd-accent hover:text-fd-accent-foreground"
        : "bg-fd-primary text-fd-primary-foreground hover:opacity-90";

  const sizeClass = size === "icon-sm" ? "h-8 w-8" : "h-8 px-3 text-sm";

  return cn(base, colorClass, sizeClass, className);
}
