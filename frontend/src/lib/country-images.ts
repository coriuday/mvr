import { COUNTRY_GALLERY_IMAGES } from "@/constants/countryGalleryImages";
import type { CountryData } from "@/types/country";

/** Unsplash card thumbnails when DB image_url is missing or broken. */
export const COUNTRY_FALLBACK_IMAGES: Record<string, string> = {
  usa: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=800&q=80",
  uk: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
  canada: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80",
  australia: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=800&q=80",
  germany: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
  ireland: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=800&q=80",
  france: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
  netherlands: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80",
  sweden: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80",
  "new-zealand": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80",
  singapore: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
  switzerland: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
  finland: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  denmark: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=800&q=80",
  austria: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80",
  belgium: "https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=800&q=80",
  hungary: "https://images.unsplash.com/photo-1551867633-194f125bddfa?auto=format&fit=crop&w=800&q=80",
  malaysia: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80",
  italy: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80",
  spain: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80",
  japan: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
  cyprus: "https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=800&q=80",
  lithuania: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80",
  georgia: "https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=800&q=80",
  russia: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=800&q=80",
};

export const COUNTRY_DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";

export function isBrokenCountryImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.startsWith("/images/countries/")) return true;
  return false;
}

export function resolveGalleryImages(slug: string, images?: string[] | null): string[] {
  const valid = (images ?? []).filter((u) => !isBrokenCountryImageUrl(u));
  if (valid.length > 0) return valid;
  const licensed = COUNTRY_GALLERY_IMAGES[slug as keyof typeof COUNTRY_GALLERY_IMAGES];
  return licensed ? [...licensed] : [];
}

export function resolveHeroImage(
  slug: string,
  hero?: string | null,
  gallery?: string[]
): string {
  if (!isBrokenCountryImageUrl(hero)) return hero!;
  const g = resolveGalleryImages(slug, gallery);
  return g[0] ?? COUNTRY_FALLBACK_IMAGES[slug] ?? COUNTRY_DEFAULT_IMAGE;
}

export function normalizeCountryImages(slug: string, country: CountryData): CountryData {
  const images = resolveGalleryImages(slug, country.images);
  return {
    ...country,
    images,
    heroImage: resolveHeroImage(slug, country.heroImage, images),
  };
}
