export const COUNTRY_ISO: Record<string, string> = {
  usa: "us",
  uk: "gb",
  canada: "ca",
  australia: "au",
  germany: "de",
  ireland: "ie",
  france: "fr",
  netherlands: "nl",
  sweden: "se",
  "new-zealand": "nz",
  singapore: "sg",
  switzerland: "ch",
  dubai: "ae",
  finland: "fi",
  denmark: "dk",
  austria: "at",
  belgium: "be",
  hungary: "hu",
  malaysia: "my",
  italy: "it",
  spain: "es",
  japan: "jp",
  cyprus: "cy",
  lithuania: "lt",
  georgia: "ge",
  russia: "ru",
};

/** Maps display names / short labels used in tools to country slugs. */
export const COUNTRY_LABEL_TO_SLUG: Record<string, string> = {
  usa: "usa",
  us: "usa",
  "united states": "usa",
  uk: "uk",
  "united kingdom": "uk",
  canada: "canada",
  australia: "australia",
  germany: "germany",
  ireland: "ireland",
  france: "france",
  netherlands: "netherlands",
  sweden: "sweden",
  "new zealand": "new-zealand",
  singapore: "singapore",
  switzerland: "switzerland",
  dubai: "dubai",
  "dubai (uae)": "dubai",
  uae: "dubai",
  finland: "finland",
  denmark: "denmark",
  austria: "austria",
  belgium: "belgium",
  hungary: "hungary",
  malaysia: "malaysia",
  italy: "italy",
  spain: "spain",
  japan: "japan",
  cyprus: "cyprus",
  lithuania: "lithuania",
  georgia: "georgia",
  russia: "russia",
};

export function getCountryIso(options: {
  slug?: string;
  iso?: string;
  label?: string;
}): string | null {
  if (options.iso) return options.iso.toLowerCase();
  if (options.slug) return COUNTRY_ISO[options.slug] ?? null;
  if (options.label) {
    const slug = COUNTRY_LABEL_TO_SLUG[options.label.trim().toLowerCase()];
    if (slug) return COUNTRY_ISO[slug] ?? null;
  }
  return null;
}
