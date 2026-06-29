import "flag-icons/css/flag-icons.min.css";

import { getCountryIso } from "@/constants/country-iso";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "text-base leading-none",
  md: "text-xl leading-none",
  lg: "text-5xl leading-none",
} as const;

type CountryFlagProps = {
  slug?: string;
  iso?: string;
  label?: string;
  fallback?: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
};

export function CountryFlag({
  slug,
  iso,
  label,
  fallback,
  size = "md",
  className,
}: CountryFlagProps) {
  const code = getCountryIso({ slug, iso, label });

  if (!code) {
    if (fallback) {
      return <span className={className}>{fallback}</span>;
    }
    return null;
  }

  return (
    <span
      className={cn(
        `fi fi-${code} fis inline-block shrink-0 rounded-sm`,
        SIZE_CLASS[size],
        className
      )}
      aria-hidden
    />
  );
}
