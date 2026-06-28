export const getNameOfSpatialEntity = (
  feature:
    | { properties?: { name?: { en: string; ja: string } } | null }
    | undefined
    | null,
  fallback = "",
): string => {
  if (!feature) return fallback;
  const { language } = useLanguage();
  const altLanguage = language.value === "en" ? "ja" : "en";
  return (
    feature.properties?.name?.[language.value] ||
    feature.properties?.name?.[altLanguage] ||
    fallback
  );
};

export const getAltNameOfSpatialEntity = (
  feature:
    | { properties?: { alternateName?: { en: string[]; ja: string[] } } }
    | undefined
    | null,
  fallback = "",
): string => {
  if (!feature) return fallback;
  const { language } = useLanguage();
  const altLanguage = language.value === "en" ? "ja" : "en";
  return (
    feature.properties?.alternateName?.[language.value]?.[0] ||
    feature.properties?.alternateName?.[altLanguage]?.[0] ||
    fallback
  );
};
