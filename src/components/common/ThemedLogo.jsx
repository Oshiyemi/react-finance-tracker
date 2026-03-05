import logo from "@/assets/new-logo-light.png";
import { cn } from "@/utils/cn";

export default function ThemedLogo({
  alt = "FinTrack Wealth",
  className,
  imageClassName = "h-8 w-auto max-w-full object-contain",
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-xl bg-white/90 p-1 ring-1 ring-slate-200/70 dark:bg-slate-900/85 dark:ring-slate-700/70",
        className
      )}
    >
      <img
        alt={alt}
        className={cn(imageClassName, "transition-[filter] dark:brightness-0 dark:invert")}
        src={logo}
      />
    </span>
  );
}
